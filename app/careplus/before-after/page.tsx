import type { Metadata } from "next";
import Link from "next/link";
import BeforeAfter from "@/components/audit/BeforeAfter";

export const metadata: Metadata = { title: "Before / After Google Profile | CarePlus Demo", description: "See how a Google Business Profile changes in 7 days. Demo — fictional business." };

export default function Page() {
  return (
    <main className="section bg-gradient-to-b from-sky-50 to-white">
      <div className="wrap">
        <p className="eyebrow text-center">The 7-day makeover</p>
        <h1 className="h2 mt-1 text-center text-sky-950">CarePlus Diagnostics: before vs after</h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-sky-950/70">Flip the switch to see the same profile before and after our top-5 fixes.</p>
        <div className="mt-8"><BeforeAfter /></div>
        <div className="mt-10 text-center">
          <Link href="/careplus/monthly-report" className="btn btn-dark">See the monthly report →</Link>
        </div>
      </div>
    </main>
  );
}
