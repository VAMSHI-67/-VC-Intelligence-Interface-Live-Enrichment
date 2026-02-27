"use client";

import { companies } from "@/data/companies";
import { storage } from "@/lib/storage";
import { VCList } from "@/lib/types";
import { useEffect, useState } from "react";

export default function ListsPage() {
  const [lists, setLists] = useState<VCList[]>([]);
  const [name, setName] = useState("");

  useEffect(() => setLists(storage.getLists()), []);

  function persist(next: VCList[]) {
    setLists(next);
    storage.setLists(next);
  }

  function createList() {
    if (!name.trim()) return;
    const next = [{ id: crypto.randomUUID(), name, companyIds: [], createdAt: new Date().toISOString() }, ...lists];
    persist(next);
    setName("");
  }

  function removeCompany(listId: string, companyId: string) {
    persist(lists.map((l) => (l.id === listId ? { ...l, companyIds: l.companyIds.filter((id) => id !== companyId) } : l)));
  }

  function exportList(list: VCList, format: "json" | "csv") {
    const entries = companies.filter((c) => list.companyIds.includes(c.id));
    const content =
      format === "json"
        ? JSON.stringify(entries, null, 2)
        : ["id,name,website,stage,sector,location", ...entries.map((e) => `${e.id},${e.name},${e.website},${e.stage},${e.sector},${e.location}`)].join("\n");

    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${list.name.toLowerCase().replace(/\s+/g, "-")}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New list name" />
        <button onClick={createList} className="bg-accent rounded-lg px-3 py-2 text-sm">Create List</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {lists.map((list) => (
          <div key={list.id} className="rounded-xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{list.name}</h3>
              <div className="space-x-2 text-xs">
                <button onClick={() => exportList(list, "csv")} className="border border-slate-700 rounded px-2 py-1">CSV</button>
                <button onClick={() => exportList(list, "json")} className="border border-slate-700 rounded px-2 py-1">JSON</button>
              </div>
            </div>
            {!list.companyIds.length && <p className="text-sm text-muted">No companies yet.</p>}
            <ul className="space-y-1 text-sm">
              {list.companyIds.map((id) => {
                const c = companies.find((x) => x.id === id);
                if (!c) return null;
                return (
                  <li key={id} className="flex justify-between">
                    <span>{c.name}</span>
                    <button onClick={() => removeCompany(list.id, id)} className="text-rose-300">Remove</button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
