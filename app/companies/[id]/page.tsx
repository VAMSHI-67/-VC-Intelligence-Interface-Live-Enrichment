"use client";

import { companies } from "@/data/companies";
import { EnrichmentResult } from "@/lib/types";
import { storage } from "@/lib/storage";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function CompanyProfilePage() {
  const { id } = useParams<{ id: string }>();
  const company = useMemo(() => companies.find((c) => c.id === id), [id]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [enriched, setEnriched] = useState<EnrichmentResult | null>(null);

  useEffect(() => {
    if (!id) return;
    const all = storage.getNotes();
    setNotes(all[id] ?? "");
  }, [id]);

  if (!company) {
    return <p>Company not found.</p>;
  }

  function saveNote(value: string) {
    if (!company) return;
    setNotes(value);
    const all = storage.getNotes();
    all[company.id] = value;
    storage.setNotes(all);
  }

  function saveToList() {
    if (!company) return;
    const lists = storage.getLists();
    if (!lists.length) return alert("Create a list first on /lists");
    const updated = lists.map((l, idx) =>
      idx === 0 && !l.companyIds.includes(company.id) ? { ...l, companyIds: [...l.companyIds, company.id] } : l
    );
    storage.setLists(updated);
    alert(`Added to ${updated[0].name}`);
  }

  async function runEnrichment() {
    if (!company) return;
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: company.name, website: company.website })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as EnrichmentResult;
      setEnriched(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to enrich");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-800 p-5 bg-panel/40">
        <h2 className="text-xl font-semibold">{company.name}</h2>
        <p className="text-muted mt-1">{company.description}</p>
        <div className="mt-3 text-sm grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><span className="text-muted">Stage</span><p>{company.stage}</p></div>
          <div><span className="text-muted">Sector</span><p>{company.sector}</p></div>
          <div><span className="text-muted">Location</span><p>{company.location}</p></div>
          <div><span className="text-muted">Website</span><p>{company.website}</p></div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={saveToList} className="rounded-lg bg-accent px-3 py-2 text-sm">Save to List</button>
          <button onClick={runEnrichment} disabled={loading} className="rounded-lg border border-slate-700 px-3 py-2 text-sm disabled:opacity-50">
            {loading ? "Enriching..." : "Enrich"}
          </button>
        </div>
        {err && <p className="text-rose-400 mt-2 text-sm">{err}</p>}
      </section>

      <section className="rounded-xl border border-slate-800 p-5">
        <h3 className="font-medium">Signals Timeline</h3>
        <ul className="mt-2 text-sm list-disc pl-5 text-slate-300 space-y-1">
          <li>{company.lastSignal}</li>
          <li>Updated hiring plan inferred from careers activity.</li>
          <li>Growing inbound partner ecosystem mentions.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-slate-800 p-5">
        <h3 className="font-medium">Investor Notes</h3>
        <textarea
          className="w-full h-32 mt-2"
          value={notes}
          onChange={(e) => saveNote(e.target.value)}
          placeholder="Write your thesis-aligned notes..."
        />
      </section>

      {enriched && (
        <section className="rounded-xl border border-slate-800 p-5 bg-panel/40 space-y-3">
          <h3 className="font-medium">Live Enrichment</h3>
          <p className="text-sm text-slate-200">{enriched.summary}</p>
          <div>
            <h4 className="text-sm text-muted">What they do</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">{enriched.whatTheyDo.map((i) => <li key={i}>{i}</li>)}</ul>
          </div>
          <div>
            <h4 className="text-sm text-muted">Keywords</h4>
            <div className="flex flex-wrap gap-2 mt-1">{enriched.keywords.map((k) => <span key={k} className="text-xs px-2 py-1 bg-slate-800 rounded">{k}</span>)}</div>
          </div>
          <div>
            <h4 className="text-sm text-muted">Derived signals</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">{enriched.derivedSignals.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
          <div>
            <h4 className="text-sm text-muted">Sources</h4>
            <ul className="text-xs text-slate-300 space-y-1 mt-1">
              {enriched.sources.map((s) => <li key={s.url}>{s.url} — {new Date(s.timestamp).toLocaleString()}</li>)}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
