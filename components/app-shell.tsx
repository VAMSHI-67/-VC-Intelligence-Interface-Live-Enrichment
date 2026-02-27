"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const nav = [
  { href: "/companies", label: "Companies" },
  { href: "/lists", label: "Lists" },
  { href: "/saved", label: "Saved" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSearch(e: FormEvent) {
    e.preventDefault();
    router.push(`/companies?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <aside className="border-r border-slate-800 bg-panel p-5">
        <h1 className="font-semibold text-lg">VC Intelligence</h1>
        <p className="text-xs text-muted mt-1">Thesis-first scouting</p>
        <nav className="mt-6 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm ${
                path.startsWith(item.href) ? "bg-accent/20 text-white" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="p-5 md:p-8">
        <form onSubmit={onSearch} className="mb-6">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Global search: company, keyword, thesis tag..."
            className="w-full"
          />
        </form>
        {children}
      </main>
    </div>
  );
}
