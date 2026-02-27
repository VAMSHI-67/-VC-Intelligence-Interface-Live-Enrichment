"use client";

import Link from "next/link";
import { storage } from "@/lib/storage";
import { SavedSearch } from "@/lib/types";
import { useEffect, useState } from "react";

export default function SavedPage() {
  const [items, setItems] = useState<SavedSearch[]>([]);

  useEffect(() => setItems(storage.getSavedSearches()), []);

  function remove(id: string) {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    storage.setSavedSearches(next);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Saved Searches</h2>
      {!items.length && <p className="text-sm text-muted">No saved searches yet. Save one from /companies.</p>}
      <ul className="space-y-3">
        {items.map((i) => (
          <li key={i.id} className="rounded-xl border border-slate-800 p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{i.name}</p>
              <p className="text-xs text-muted">{new Date(i.createdAt).toLocaleString()}</p>
            </div>
            <div className="space-x-2">
              <Link
                href={`/companies?q=${encodeURIComponent(i.query)}`}
                className="text-xs border border-slate-700 rounded px-2 py-1"
              >
                Re-run
              </Link>
              <button onClick={() => remove(i.id)} className="text-xs text-rose-300 border border-rose-800 rounded px-2 py-1">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
