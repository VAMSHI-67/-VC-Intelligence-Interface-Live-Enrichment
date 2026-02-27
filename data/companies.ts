import { Company } from "@/lib/types";

export const companies: Company[] = [
  {
    id: "c1",
    name: "Helios Grid",
    website: "https://www.helios.energy",
    stage: "Seed",
    sector: "Climate",
    location: "San Francisco, US",
    thesisTags: ["energy", "infrastructure", "decarbonization"],
    employees: 42,
    lastSignal: "Launched pilot with municipal utility",
    description: "Software-defined grid analytics for distributed renewable assets."
  },
  {
    id: "c2",
    name: "CareMesh AI",
    website: "https://www.caremesh.ai",
    stage: "Series A",
    sector: "HealthTech",
    location: "Boston, US",
    thesisTags: ["provider workflow", "ai copilot", "compliance"],
    employees: 88,
    lastSignal: "Hiring ML engineer in clinical NLP",
    description: "Clinical workflow assistant improving documentation and care coordination."
  },
  {
    id: "c3",
    name: "ForgeOps",
    website: "https://www.forgeops.dev",
    stage: "Pre-Seed",
    sector: "DevTools",
    location: "Berlin, DE",
    thesisTags: ["developer productivity", "workflow automation"],
    employees: 17,
    lastSignal: "Published open-source runtime benchmark",
    description: "Developer workflow orchestration platform for internal tooling teams."
  },
  {
    id: "c4",
    name: "LedgerLeaf",
    website: "https://www.ledgerleaf.com",
    stage: "Seed",
    sector: "FinTech",
    location: "London, UK",
    thesisTags: ["embedded finance", "smb", "cashflow"],
    employees: 35,
    lastSignal: "Released SMB treasury dashboard",
    description: "Embedded treasury and cashflow operations layer for vertical SaaS vendors."
  },
  {
    id: "c5",
    name: "Orbit Freight",
    website: "https://www.orbitfreight.io",
    stage: "Series B+",
    sector: "Logistics",
    location: "Chicago, US",
    thesisTags: ["supply chain", "marketplace", "optimization"],
    employees: 210,
    lastSignal: "Announced expansion to LATAM",
    description: "AI-enabled freight brokerage and route optimization marketplace."
  },
  {
    id: "c6",
    name: "NexaLearn",
    website: "https://www.nexalearn.com",
    stage: "Seed",
    sector: "EdTech",
    location: "Toronto, CA",
    thesisTags: ["adaptive learning", "k12", "assessment"],
    employees: 54,
    lastSignal: "Partnership with district consortium",
    description: "Adaptive learning software with standards-aligned teacher copilots."
  }
];
