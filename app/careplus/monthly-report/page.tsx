import type { Metadata } from "next";
import Link from "next/link";
import MonthlyReport from "@/components/audit/MonthlyReport";

export const metadata: Metadata = { title: "Monthly Report Preview | CarePlus Demo", description: "Sample monthly Google Business Profile report with mock data. Demo — fictional business." };

export default function Page() {
  return (
    <main className="section bg-gradient-to-b from-sky-50 to-white">
      <div className="wrap max-w-5xl">
        <p className="eyebrow text-center">Local Growth plan</p>
        <h1 className="h2 mt-1 text-center text-sky-950">Your monthly report: October 2026</h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-sky-950/70">Calls, directions and reviews in one page you can read in 30 seconds. Tap a tile to explore.</p>
        <div className="mt-8"><MonthlyReport /></div>
        <div className="mt-10 text-center"><Link href="/audit" className="btn btn-primary">Run a free audit for my business →</Link></div>
      </div>
    </main>
  );
}
