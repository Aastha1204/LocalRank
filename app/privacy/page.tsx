import type { Metadata } from "next";
import { CONTACT, OWNER } from "@/config/site";

export const metadata: Metadata = {
  title: `Privacy | ${OWNER.brand}`,
  description: "How contact details sent through this website are used.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <a href="/" className="text-sm font-bold text-teal-dark underline">← Back to home</a>
      <h1 className="mt-6 text-3xl font-extrabold">Privacy</h1>
      <div className="mt-6 space-y-4 text-ink/90">
        <p>This site collects only what you type into the contact form: your name, phone number, business type and message.</p>
        <p>I use these details only to reply to you about your enquiry. I do not sell or share them. They are stored securely and I delete them on request.</p>
        <p>If you tap Call or WhatsApp, that conversation happens on your phone and WhatsApp’s own privacy rules apply.</p>
        <p>Card, net-banking and wallet payments are handled by Razorpay on their secure page; I never see or store your card details. UPI payments go straight to my bank account through your UPI app.</p>
        <p>The demos linked on this site use sample data only. Please do not enter real personal details into them.</p>
        <p>To see or delete your details, email <a className="font-bold underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.</p>
      </div>
    </main>
  );
}
