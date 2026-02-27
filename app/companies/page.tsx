import { Suspense } from "react";
import CompaniesClient from "./companies-client";

type CompaniesPageProps = {
  searchParams?: { q?: string | string[] };
};

export default function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const qParam = searchParams?.q;
  const initialQuery = Array.isArray(qParam) ? qParam[0] ?? "" : qParam ?? "";
  return (
    <Suspense fallback={<div className="text-sm text-muted">Loading companies...</div>}>
      <CompaniesClient initialQuery={initialQuery} />
    </Suspense>
  );
}
