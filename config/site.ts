/**
 * ALL editable website content lives in this file.
 * Search for "REPLACE" / placeholder values in CONTACT and swap in your real details.
 */

export const OWNER = {
  brand: "Neovia AI",
  name: "Aastha Agnihotri", // founder
  tagline: "AI chatbots, WhatsApp automation and websites for local businesses",
  city: "Mumbai, India",
  degree: "B.Tech CSE (AI & ML)",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://neovia-ai.vercel.app",
};

export const CONTACT = {
  phone: "+918691969772",
  whatsapp: "918691969772", // country code, no +
  email: "aasthaagnihotri979@gmail.com",
  bookingUrl: "", // e.g. a Calendly / Cal.com link. Empty = "Book a call" is hidden, WhatsApp is used.
  demoVideoUrl: "", // REPLACE with a ~30 second video (mp4 / YouTube embed). Empty = placeholder shown.
};

export const PILOT_OFFER = {
  enabled: false,
  text: "Limited pilot slots: discounted setup for my first few clients",
};

export type Package = {
  name: string;
  range: string;
  note: string;
  includes: string;
};

export const PACKAGES: Package[] = [
  {
    name: "AI Starter Solutions",
    range: "₹15,000 – ₹25,000",
    note: "Introductory price",
    includes: "Basic chatbot, FAQ assistant, simple workflow automation and small-business AI integrations.",
  },
  {
    name: "Business Automation",
    range: "₹30,000 – ₹60,000",
    note: "Typical project range",
    includes: "Lead management, CRM automation, customer-support workflows, API integrations and multi-step automation.",
  },
  {
    name: "Custom AI Development",
    range: "₹60,000 – ₹1,50,000",
    note: "Typical project range",
    includes: "RAG knowledge assistants, custom AI dashboards, document intelligence and multi-agent prototypes.",
  },
  {
    name: "Enterprise AI & Agentic Systems",
    range: "₹1,50,000 – ₹3,00,000+",
    note: "Custom quote for larger scopes",
    includes: "Complex multi-agent systems, enterprise integrations and customised AI platforms.",
  },
];

/** 0 = off. Otherwise 1–4 marks that package as "Most popular". */
export const highlightPackage = 0;

export const CARE_PLANS = [
  { name: "Care", price: "₹3,600/mo" },
  { name: "Growth", price: "₹7,200/mo" },
  { name: "Advanced", price: "₹9,900+/mo" },
];

export const PRICING_FOOTNOTE =
  "Ranges are typical starting points; your final quote depends on scope. GST extra if applicable. Domain, hosting, WhatsApp message fees and AI usage beyond included limits are paid at actuals.";

export type Demo = {
  slug: string;
  title: string;
  url: string;
  industry: string;
  outcomeLine: string;
  description: string;
  features: [string, string, string];
  image: string; // base path in /public/demos (without -desktop / -mobile.webp)
  /** Setup price in ₹ used by the "Book now" button. null = customer enters the amount you agreed on WhatsApp. */
  price: number | null;
};

// Descriptions are written from what each live demo actually shows.
export const DEMOS: Demo[] = [
  {
    slug: "whatsapp-followup",
    title: "WhatsApp Follow-up Automation",
    url: "https://wpfollowup.vercel.app/",
    industry: "Dental studio",
    outcomeLine: "Every enquiry gets a reply in seconds, and a polite follow-up if they go quiet.",
    description:
      "A chat simulator for a sample dental studio: a new enquiry gets an instant friendly reply, then gentle follow-ups, and you get an alert when a lead says yes.",
    features: [
      "Instant reply plus Day 1, 3 and 7 follow-ups that stop when the customer replies",
      "Hot-lead alert so you know exactly who to call",
      "STOP / opt-out is always respected",
    ],
    image: "/demos/whatsapp-followup",
    price: 9900, // as shown on the demo page (one-time setup)
  },
  {
    slug: "admission-assistant",
    title: "AI Admission Assistant",
    url: "https://bright-future-classes.onrender.com/",
    industry: "Coaching class",
    outcomeLine: "Parents get answers at 2 am, and you only call the serious leads.",
    description:
      "A chatbot for a sample coaching class that answers in English and Hinglish, only from the class’s own fees and batches, and shows the owner each lead live.",
    features: [
      "Answers in English and Hinglish from your own fees and batch details",
      "Captures the parent’s phone number during the chat",
      "Scores each lead from 0–100 so hot leads stand out on your screen",
    ],
    image: "/demos/admission-assistant",
    price: 22500, // as shown on the demo page (one-time)
  },
  {
    slug: "clinic-website",
    title: "Clinic Website",
    url: "https://smile-craft-next.onrender.com/",
    industry: "Dental clinic",
    outcomeLine: "Patients see your treatments and prices, then book a slot in under a minute.",
    description:
      "A clean website for a sample dental clinic in Fort, Mumbai, with treatments, doctor profile, FAQs, opening hours and an online appointment form.",
    features: [
      "Treatment list with starting prices and a “Book this” button",
      "Pick a day and time slot online, with confirmation on WhatsApp",
      "Doctor profile, FAQs, map-style visit details and opening hours",
    ],
    image: "/demos/clinic-website",
    price: null, // REPLACE with your price in ₹ to switch on automatic amounts
  },
  {
    slug: "ca-dashboard",
    title: "CA Client Dashboard",
    url: "https://cademo.onrender.com/",
    industry: "CA firm",
    outcomeLine: "Follow-ups, filings and documents in one place instead of scattered sheets.",
    description:
      "A client dashboard for a sample CA firm that shows overdue follow-ups and due filings the moment you open it.",
    features: [
      "See overdue client calls and due filings as soon as you log in",
      "Drag clients through Docs pending → In progress → Review → Filed",
      "Owner, Staff and View-only roles, so fees stay hidden from the wrong people",
    ],
    image: "/demos/ca-dashboard",
    price: null, // REPLACE with your price in ₹ to switch on automatic amounts
  },
];

/** Carousel at the top of the page: everything I build. icon keys map to components/WorkCarousel.tsx */
export const WORKS = [
  { title: "Website", text: "Fast, mobile-friendly sites that turn visitors into enquiries.", icon: "globe" },
  { title: "Chatbot + Lead Capture", text: "A smart assistant that answers questions and saves phone numbers.", icon: "chat" },
  { title: "WhatsApp Automation", text: "Instant replies and polite follow-ups on WhatsApp.", icon: "whatsapp" },
  { title: "Dashboard", text: "Leads, clients and records in one simple place.", icon: "list" },
  { title: "Mobile App", text: "Simple apps for your customers or your team.", icon: "phone" },
  { title: "Agentic AI", text: "AI that handles multi-step work on its own, with your approval.", icon: "spark" },
  { title: "RAG Chatbot", text: "A chatbot that answers from your own documents.", icon: "book" },
  { title: "Agentic AI Chatbot", text: "A chatbot that can also take actions, like booking or updating records.", icon: "bot" },
  { title: "AI Automation", text: "Repetitive business tasks done automatically.", icon: "gear" },
] as const;

/** Hero carousel: one slide per service. demoSlug = real screenshot of a live demo; illustration = generic labelled drawing (no live demo yet). */
export const HERO_SLIDES: ReadonlyArray<{ service: string; demoSlug?: string; illustration?: "mobile" | "agentic" | "rag" | "agentic-chat" | "automation" }> = [
  { service: "Website", demoSlug: "clinic-website" },
  { service: "Chatbot + Lead Capture", demoSlug: "admission-assistant" },
  { service: "WhatsApp Automation", demoSlug: "whatsapp-followup" },
  { service: "Dashboard", demoSlug: "ca-dashboard" },
  { service: "Mobile App", illustration: "mobile" },
  { service: "Agentic AI", illustration: "agentic" },
  { service: "RAG Chatbot", illustration: "rag" },
  { service: "Agentic AI Chatbot", illustration: "agentic-chat" },
  { service: "AI Automation", illustration: "automation" },
];

export const DEMO_NOTE = "Free servers can take 30–50 seconds to wake up the first time you open a demo.";

export const HERO = {
  headline: "AI chatbots, automation and websites that bring your business customers 24×7",
  sub: "For Mumbai and Kalyan-Dombivli-Thane businesses: clinics, coaching classes, real estate, CAs, interior designers and gyms. See a free demo, no pressure.",
  chips: [OWNER.degree, "Python · FastAPI · LangChain", "Reply within 24 hours"],
};

export const PROBLEMS = [
  { title: "Enquiries missed after hours", text: "A customer messages at 9 pm. Nobody answers. By morning they have called someone else." },
  { title: "Slow replies lose customers", text: "People ask three businesses and go with whoever replies first. Even a few hours is a long wait." },
  { title: "No website or a weak one", text: "When people search for you and find nothing, or something outdated, they assume you are not serious." },
  { title: "Leads scattered everywhere", text: "Some in WhatsApp, some in a notebook, some in your head. Follow-ups get forgotten." },
];

export const COMPARISON = [
  { without: "Enquiries wait until you are free", with: "Every enquiry gets a reply in seconds, day or night" },
  { without: "Follow-ups depend on your memory", with: "Polite follow-ups go out automatically and stop when the customer replies" },
  { without: "Leads in chats, notebooks and sheets", with: "One simple place where every lead is saved" },
  { without: "Same questions answered again and again", with: "A smart assistant answers common questions from your own details" },
  { without: "You find out who is serious after many calls", with: "Hot leads are highlighted so you call them first" },
  { without: "Customers can’t find you online", with: "A clear website with your services, prices and a booking button" },
];

export const INDUSTRIES = [
  {
    name: "Clinics",
    problem: "Patients call when the clinic is closed, and appointment requests get lost between calls and chats.",
    setup: "A website with online booking, instant WhatsApp replies and reminders so patients are not forgotten.",
    demoSlug: "clinic-website",
  },
  {
    name: "Coaching classes",
    problem: "Parents ask about fees and batches late at night, and the same questions come up all day.",
    setup: "A smart assistant that answers from your fees and batches, saves the parent’s number and highlights serious leads.",
    demoSlug: "admission-assistant",
  },
  {
    name: "Real estate",
    problem: "Site-visit enquiries come from many places and many leads go cold after the first call.",
    setup: "Instant replies to new enquiries and follow-up messages that offer a site-visit slot.",
    demoSlug: "whatsapp-followup",
  },
  {
    name: "CAs",
    problem: "Client follow-ups, due dates and documents live in scattered sheets and chats.",
    setup: "A simple client dashboard with due filings, follow-ups and document status in one place.",
    demoSlug: "ca-dashboard",
  },
  {
    name: "Interior designers",
    problem: "Enquiries arrive from Instagram and calls, and no one follows up after the first message.",
    setup: "A quick reply that asks what they need, then gentle follow-ups until they agree to a consultation.",
    demoSlug: "whatsapp-followup",
  },
  {
    name: "Gyms",
    problem: "Free-trial enquiries go quiet after one message, and the front desk is too busy to chase.",
    setup: "Automatic replies with trial-slot offers and follow-ups that stop the moment the person responds.",
    demoSlug: "whatsapp-followup",
  },
];

export const SERVICES = [
  { name: "Website", get: "A fast, mobile-friendly site with your services, prices, map and a booking or enquiry button.", time: "1–2 weeks" },
  { name: "AI Chatbot + Lead Capture", get: "A smart assistant that answers customer questions from your own details and saves their phone number.", time: "1–2 weeks" },
  { name: "WhatsApp Follow-up Automation", get: "Instant replies and polite follow-ups, with an alert when a lead is ready to talk.", time: "1–2 weeks" },
  { name: "Dashboard & Record System", get: "One place to see leads, clients, dues and documents, with roles for your staff.", time: "2–4 weeks" },
  { name: "Mobile App", get: "A simple app for your customers or team, planned together with you before any work starts.", time: "4–8 weeks" },
  { name: "Custom AI / RAG & Agentic systems", get: "Assistants that read your documents and handle multi-step work, scoped in writing first.", time: "Depends on scope" },
];

export const STEPS = [
  { title: "Free 15-min call", text: "Tell me about your business and where enquiries slip away." },
  { title: "Written scope & quote", text: "You get a clear written plan and price before any work starts." },
  { title: "Build & demo", text: "I build it, show you a working version and fix what you want changed." },
  { title: "Launch & support", text: "We go live together, and I stay available to help after." },
];

/** "Book now" asks for this share of the project price up front (your terms: 50% to start). */
export const ADVANCE_PERCENT = 50;

export const PAYMENT_NOTE = "Payment in plain words: 50% to start, 50% on delivery.";

export const ABOUT = {
  bio: "I’m Aastha, founder of Neovia AI and a B.Tech CSE (AI & ML) graduate based in Mumbai. I build chatbots, WhatsApp automation, websites and dashboards for small and mid-size businesses. I talk in plain language, work to a written scope, and test everything before I hand it over.",
  skills: ["Python", "FastAPI", "LangChain", "Next.js", "TypeScript", "Supabase", "WhatsApp automation", "RAG assistants"],
  promises: [
    "I build with AI tools and test everything before delivery.",
    "You own your website and data.",
    "Written scope before any work starts.",
  ],
};

export const AUDIT = {
  title: "Free 15-minute audit",
  text: "Send me your business name; I’ll show you 3 places you’re losing enquiries (free, 15 minutes).",
};

export const FAQ = [
  { q: "How long does a project take?", a: "A website or simple chatbot usually takes 1–2 weeks. Dashboards take 2–4 weeks and bigger systems longer. You get a timeline in writing before we start." },
  { q: "What do I need to give you?", a: "Your business details, services, prices and timings, plus any logo or photos you have. For WhatsApp automation, a business number. I tell you the exact list on the call." },
  { q: "Who owns the website and data?", a: "You do. Your website, your domain and your customer data belong to you." },
  { q: "What if the AI gives a wrong answer?", a: "The assistant is set up to answer only from details you approve, and I test it with real questions before delivery. If it is unsure, it hands the chat to you. If you spot a mistake later, I fix it." },
  { q: "Do you provide support after launch?", a: "Yes. Every project includes help getting started, and optional monthly Care plans cover changes, monitoring and quick fixes." },
  { q: "How does payment work?", a: "50% to start, 50% on delivery. Domain, hosting, WhatsApp message fees and AI usage beyond included limits are paid at actuals." },
];

export const BUSINESS_TYPES = ["Clinic / Dental", "Coaching class", "Real estate", "CA / Accounting", "Interior designer", "Gym / Fitness", "Salon", "Other"];

export const ROI_DEFAULTS = { enquiries: 60, missedPct: 25, value: 5000 };

export const ANALYTICS_ID = process.env.NEXT_PUBLIC_ANALYTICS_ID || ""; // Plausible domain; off if unset

/** WhatsApp link with pre-filled message. */
export function waLink(message: string) {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const DEFAULT_WA_MESSAGE = "Hi Neovia AI, I'd like a free demo for my business.";

/** Names of CONTACT fields that still hold placeholder values (checked at build time in next.config.ts). */
export function placeholderFields() {
  const out: string[] = [];
  if (CONTACT.phone.includes("XXXX")) out.push("CONTACT.phone");
  if (CONTACT.whatsapp.includes("XXXX")) out.push("CONTACT.whatsapp");
  if (CONTACT.email === "you@example.com") out.push("CONTACT.email");
  return out;
}

/**
 * Payments. UPI works as is. Card / net banking / all banks / wallets go through Razorpay (see README):
 * set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and NEXT_PUBLIC_RAZORPAY_KEY_ID in .env to switch the card button on.
 * Bank transfer details are shown only when filled in.
 */
export const PAYMENTS = {
  upiId: "8691969772@superyes",
  payeeName: "Neovia AI", // shown in UPI apps that read the link (the QR shows the registered bank name)
  qrImage: "/upi-qr.png",
  bank: { accountName: "", accountNumber: "", ifsc: "", bankName: "" }, // REPLACE to show bank-transfer details
  note: "Pay only after we have agreed the written scope and quote. 50% to start, 50% on delivery.",
};

export function upiLink(amount?: number) {
  const p = new URLSearchParams({ pa: PAYMENTS.upiId, pn: PAYMENTS.payeeName, cu: "INR", tn: "Neovia AI project payment" });
  if (amount && amount > 0) p.set("am", String(amount));
  return `upi://pay?${p.toString()}`;
}
