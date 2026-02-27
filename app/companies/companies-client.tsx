"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { companies } from "@/data/companies";
import { SavedSearch } from "@/lib/types";
import { storage } from "@/lib/storage";

const PAGE_SIZE = 4;

export default function CompaniesClient({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [stage, setStage] = useState("All");
  const [sector, setSector] = useState("All");
  const [sortBy, setSortBy] = useState<"name" | "employees">("name");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setQuery(initialQuery);
    setPage(1);
  }, [initialQuery]);

  const sectors = useMemo(() => ["All", ...new Set(companies.map((c) => c.sector))], []);

  const filtered = useMemo(() => {
    return [...companies]
      .filter((c) =>
        [c.name, c.sector, c.stage, c.description, c.thesisTags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())
      )
      .filter((c) => (stage === "All" ? true : c.stage === stage))
      .filter((c) => (sector === "All" ? true : c.sector === sector))
      .sort((a, b) => (sortBy === "name" ? a.name.localeCompare(b.name) : b.employees - a.employees));
  }, [query, stage, sector, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function saveSearch() {
    const existing = storage.getSavedSearches();
    const record: SavedSearch = {
      id: crypto.randomUUID(),
      name: `${query || "All"} / ${stage} / ${sector}`,
      query,
      stage,
      sector,
      createdAt: new Date().toISOString()
    };
    storage.setSavedSearches([record, ...existing]);
    alert("Search saved in /saved");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search companies..." />
        <select value={stage} onChange={(e) => setStage(e.target.value)}>
          <option>All</option>
          <option>Pre-Seed</option>
          <option>Seed</option>
          <option>Series A</option>
          <option>Series B+</option>
        </select>
        <select value={sector} onChange={(e) => setSector(e.target.value)}>
          {sectors.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "name" | "employees")}>
          <option value="name">Sort: Name</option>
          <option value="employees">Sort: Employees</option>
        </select>
        <button onClick={saveSearch} className="bg-accent hover:bg-accent/80 text-white rounded-lg px-3 py-2 text-sm">
          Save Search
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/80 text-muted">
            <tr>
              <th className="text-left p-3">Company</th>
              <th className="text-left p-3">Stage</th>
              <th className="text-left p-3">Sector</th>
              <th className="text-left p-3">Employees</th>
              <th className="text-left p-3">Signal</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((c) => (
              <tr key={c.id} className="border-t border-slate-800 hover:bg-slate-900/40">
                <td className="p-3 font-medium">
                  <Link className="underline decoration-dotted" href={`/companies/${c.id}`}>
                    {c.name}
                  </Link>
                </td>
                <td className="p-3">{c.stage}</td>
                <td className="p-3">{c.sector}</td>
                <td className="p-3">{c.employees}</td>
                <td className="p-3">{c.lastSignal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Page {page} / {totalPages}
        </span>
        <div className="space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg border border-slate-700 disabled:opacity-30"
            disabled={page === 1}
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-lg border border-slate-700 disabled:opacity-30"
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
