# VC Intelligence Interface + Live Enrichment

A production-style MVP for VC sourcing workflows:
- Discover companies with search, filters, sorting, pagination.
- Open company profile, add notes, save to lists.
- Manage lists and export CSV/JSON.
- Save and re-run searches.
- Trigger **server-side** live enrichment from public web content.

## Tech
- Next.js 14 (App Router) + TypeScript
- TailwindCSS
- localStorage persistence for lists/saved searches/notes
- `/api/enrich` server endpoint for safe key handling

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env.local`:

```bash
# Optional: enables LLM extraction quality improvements.
# If not set, endpoint uses deterministic fallback extraction.
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
```

> API keys are only read on the server (`/api/enrich`) and never exposed to browser code.

## Routes
- `/companies` – searchable/filterable table with pagination + save search
- `/companies/[id]` – profile, signals, notes, save to list, enrich
- `/lists` – create/manage lists, remove companies, export CSV/JSON
- `/saved` – view and re-run saved searches
- `/api/enrich` – POST `{ name, website }` for live enrichment

## Live Enrichment Behavior
1. Frontend sends profile website to `/api/enrich`.
2. API fetches public content via `r.jina.ai` reader endpoint.
3. If `GEMINI_API_KEY` exists, it runs structured extraction using Gemini.
4. Else if `OPENAI_API_KEY` exists, it runs structured extraction using OpenAI.
5. Otherwise it falls back to deterministic extraction.
6. Response includes:
   - Summary
   - What they do bullets
   - Keywords
   - Derived signals
   - Source URLs + timestamp
7. API caches by website (in-memory TTL 6h) to reduce repeated pulls.

## Deployment
Deploy to **Vercel** (preferred):
1. Import this repo in Vercel.
2. Add `GEMINI_API_KEY` (recommended) and/or `OPENAI_API_KEY` env vars.
3. Deploy.

The app will run without a key using fallback extraction.
