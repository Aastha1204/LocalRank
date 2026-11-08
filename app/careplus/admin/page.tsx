import type { Metadata } from "next";
import BookingsAdmin from "@/components/careplus/BookingsAdmin";

export const metadata: Metadata = { title: "Bookings | CarePlus Demo", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <main className="section min-h-[60vh] bg-sky-50">
      <div className="wrap">
        <p className="eyebrow">Admin · demo</p>
        <h1 className="h2 mt-1 text-sky-950">Bookings</h1>
        <p className="mt-2 max-w-xl text-sky-950/70">Every booking made on the website appears here. Enter the admin key to view.</p>
        <BookingsAdmin />
      </div>
    </main>
  );
}
