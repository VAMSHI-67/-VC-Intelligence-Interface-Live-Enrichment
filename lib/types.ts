export type Company = {
  id: string;
  name: string;
  website: string;
  stage: "Pre-Seed" | "Seed" | "Series A" | "Series B+";
  sector: string;
  location: string;
  thesisTags: string[];
  employees: number;
  lastSignal: string;
  description: string;
};

export type EnrichmentResult = {
  summary: string;
  whatTheyDo: string[];
  keywords: string[];
  derivedSignals: string[];
  sources: { url: string; timestamp: string }[];
};

export type SavedSearch = {
  id: string;
  name: string;
  query: string;
  stage: string;
  sector: string;
  createdAt: string;
};

export type VCList = {
  id: string;
  name: string;
  companyIds: string[];
  createdAt: string;
};
