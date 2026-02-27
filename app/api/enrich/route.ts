import { NextRequest, NextResponse } from "next/server";
import { EnrichmentResult } from "@/lib/types";

type Body = { name: string; website: string };

type CacheEntry = { ts: number; data: EnrichmentResult };

const TTL_MS = 1000 * 60 * 60 * 6;
const cache = new Map<string, CacheEntry>();

function deriveSignals(text: string, website: string): string[] {
  const lower = text.toLowerCase();
  const signals: string[] = [];
  if (lower.includes("careers") || lower.includes("jobs")) signals.push("Careers page or hiring references detected");
  if (lower.includes("blog") || lower.includes("news")) signals.push("Recent content/news section appears present");
  if (lower.includes("changelog") || lower.includes("release notes")) signals.push("Product iteration signal via changelog/release notes");
  if (lower.includes("privacy") || lower.includes("security")) signals.push("Trust/compliance messaging present");
  if (!signals.length) signals.push(`Public site content available at ${website}`);
  return signals.slice(0, 4);
}

function naiveExtract(text: string, website: string): EnrichmentResult {
  const tokens = text
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const stopWords = new Set(["the", "and", "for", "with", "that", "this", "from", "their", "your", "are", "our", "you"]);
  const freq = new Map<string, number>();
  for (const token of tokens) {
    if (token.length < 4 || stopWords.has(token)) continue;
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }

  const keywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([k]) => k);

  const sentences = text.split(/[.!?]\s+/).map((s) => s.trim()).filter(Boolean);
  const summary = sentences.slice(0, 2).join(" ").slice(0, 320) || `Public-facing summary for ${website} is available.`;

  return {
    summary,
    whatTheyDo: sentences.slice(0, 6).map((s) => s.slice(0, 160)),
    keywords,
    derivedSignals: deriveSignals(text, website),
    sources: [{ url: website, timestamp: new Date().toISOString() }]
  };
}

async function fetchViaReader(url: string) {
  const target = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, "")}`;
  const response = await fetch(target, { cache: "no-store" });
  if (!response.ok) throw new Error(`Scrape failed: ${response.status}`);
  const content = await response.text();
  return { content, source: target };
}

async function extractWithOpenAI(rawText: string, website: string): Promise<EnrichmentResult | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const input = rawText.slice(0, 15000);
  const prompt = `Extract structured VC scouting fields for ${website}. Return strict JSON with keys: summary (string, 1-2 sentences), whatTheyDo (array 3-6), keywords (array 5-10), derivedSignals (array 2-4).`;

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: "You are a precise extraction engine. Output valid JSON only." },
        { role: "user", content: `${prompt}\n\nCONTENT:\n${input}` }
      ],
      text: { format: { type: "json_object" } }
    })
  });

  if (!res.ok) {
    return null;
  }

  const json = await res.json();
  const outputText = json.output_text;
  if (!outputText) return null;

  const parsed = JSON.parse(outputText) as Omit<EnrichmentResult, "sources">;

  return {
    summary: parsed.summary,
    whatTheyDo: parsed.whatTheyDo,
    keywords: parsed.keywords,
    derivedSignals: parsed.derivedSignals,
    sources: [{ url: website, timestamp: new Date().toISOString() }]
  };
}

async function extractWithGemini(rawText: string, website: string): Promise<EnrichmentResult | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const input = rawText.slice(0, 15000);
  const prompt = `Extract structured VC scouting fields for ${website}. Return strict JSON with keys: summary (string, 1-2 sentences), whatTheyDo (array 3-6), keywords (array 5-10), derivedSignals (array 2-4).`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: {
          responseMimeType: "application/json"
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${prompt}\n\nCONTENT:\n${input}`
              }
            ]
          }
        ]
      })
    }
  );

  if (!response.ok) {
    return null;
  }

  const json = await response.json();
  const outputText: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!outputText) return null;

  const parsed = JSON.parse(outputText) as Omit<EnrichmentResult, "sources">;

  return {
    summary: parsed.summary,
    whatTheyDo: parsed.whatTheyDo,
    keywords: parsed.keywords,
    derivedSignals: parsed.derivedSignals,
    sources: [{ url: website, timestamp: new Date().toISOString() }]
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    if (!body.website || !body.name) {
      return NextResponse.json({ error: "Missing name/website" }, { status: 400 });
    }

    const key = body.website.toLowerCase();
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < TTL_MS) {
      return NextResponse.json(cached.data);
    }

    const scraped = await fetchViaReader(body.website);
    // Priority: Gemini -> OpenAI -> deterministic fallback.
    const ai = (await extractWithGemini(scraped.content, body.website)) ??
      (await extractWithOpenAI(scraped.content, body.website));

    const result = ai ?? naiveExtract(scraped.content, body.website);
    result.sources = [{ url: scraped.source, timestamp: new Date().toISOString() }];

    cache.set(key, { ts: Date.now(), data: result });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected enrich error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
