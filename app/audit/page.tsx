import type { Metadata } from "next";
import AuditApp from "@/components/audit/AuditApp";
import LocalRankShell from "@/components/audit/LocalRankShell";

export const metadata: Metadata = {
  title: "Free Google Business Profile Audit | LocalRank by Neovia AI",
  description: "Score your Google Maps presence out of 100, compare with nearby competitors and get a 5-point fix plan. Free for businesses in Mumbai, Kalyan, Dombivli and Thane.",
  alternates: { canonical: "/audit" },
};

export default function AuditPage() {
  return (
    <LocalRankShell active="audit">
      <AuditApp />
    </LocalRankShell>
  );
}
