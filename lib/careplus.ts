/** CarePlus Diagnostics: fictional demo client for LocalRank. All details are made up. */

export const CP = {
  name: "CarePlus Diagnostics",
  tagline: "NABL-style accuracy. Reports on WhatsApp in 6 hours.",
  phone: "+91 98200 11234",
  tel: "+919820011234",
  wa: "919820011234",
  address: "Shop 4, Sunrise Plaza, Manpada Road, Dombivli East, Maharashtra 421201",
  street: "Shop 4, Sunrise Plaza, Manpada Road",
  locality: "Dombivli East",
  postal: "421201",
  hours: "Mon-Sun 7:00 AM - 8:00 PM",
  mapQuery: "Manpada Road, Dombivli East, Maharashtra 421201",
};

export type Service = { slug: string; title: string; short: string; price: string; icon: string; h1: string; intro: string; includes: string[]; prep: string; faqs: { q: string; a: string }[] };

export const SERVICES: Service[] = [
  {
    slug: "thyroid-test-dombivli-east",
    title: "Thyroid Profile",
    short: "T3, T4, TSH",
    price: "₹449",
    icon: "🦋",
    h1: "Thyroid Test in Dombivli East",
    intro: "Get your complete thyroid profile (T3, T4, TSH) checked at CarePlus Diagnostics, Manpada Road. Fast, accurate and reported on WhatsApp the same day.",
    includes: ["Total T3, Total T4 and TSH", "Doctor-reviewed report", "Same-day WhatsApp + email report", "Free repeat-test guidance"],
    prep: "No fasting needed for most thyroid tests. Take your regular medicines unless your doctor says otherwise.",
    faqs: [
      { q: "Do I need to fast for a thyroid test?", a: "Usually no. A thyroid profile can be done at any time of day, though your doctor may prefer morning samples for consistency." },
      { q: "How fast will I get my thyroid report?", a: "Samples collected before 12 PM are reported the same evening on WhatsApp and email." },
      { q: "How much does a thyroid profile cost in Dombivli East?", a: "The T3, T4, TSH profile costs ₹449 at CarePlus. Home sample collection is available for an additional ₹50." },
    ],
  },
  {
    slug: "home-sample-collection-kalyan",
    title: "Home Sample Collection",
    short: "Kalyan & Dombivli",
    price: "₹50 visit fee",
    icon: "🏠",
    h1: "Home Sample Collection in Kalyan",
    intro: "A trained phlebotomist visits your home in Kalyan, Dombivli and nearby areas between 6 AM and 10 AM. Book on WhatsApp and get reports the same day.",
    includes: ["Certified phlebotomist at your door", "Sterile single-use kits", "Book 24 hours or just 2 hours ahead", "Digital reports on WhatsApp"],
    prep: "Keep your doctor's prescription handy. For fasting tests, avoid food for 8-10 hours; water is fine.",
    faqs: [
      { q: "Which areas in Kalyan do you cover?", a: "Kalyan West and East, Dombivli, Titwala and Ambivli. Message us your pin code to confirm." },
      { q: "What are the home collection timings?", a: "6:00 AM to 10:00 AM daily, including Sundays. Later slots can be arranged on request." },
      { q: "Is there an extra charge for home collection?", a: "A flat ₹50 visit fee. It is waived for orders above ₹999." },
    ],
  },
];

export const TESTS = [
  { name: "Complete Blood Count (CBC)", price: "₹250" },
  { name: "HbA1c (Diabetes)", price: "₹399" },
  { name: "Lipid Profile", price: "₹499" },
  { name: "Vitamin D (25-OH)", price: "₹799" },
  { name: "Full Body Checkup (72 tests)", price: "₹1,499" },
  { name: "Fever Panel", price: "₹899" },
];

export const GENERAL_FAQS = [
  { q: "Are you open on Sundays?", a: "Yes. CarePlus is open all 7 days, 7 AM to 8 PM." },
  { q: "Do you offer home sample collection?", a: "Yes, across Dombivli and Kalyan from 6 AM to 10 AM. Book on WhatsApp." },
  { q: "How do I receive my reports?", a: "Digitally on WhatsApp and email, usually within 6 hours of sample collection." },
  { q: "Do I need a doctor's prescription?", a: "No. You can walk in for most tests. For specialised tests, a prescription is advised." },
];

export function localBusinessLd(url: string) {
  return {
    "@context": "https://schema.org",
    "@type": ["MedicalBusiness", "LocalBusiness"],
    name: CP.name,
    url,
    telephone: CP.phone,
    medicalSpecialty: "Pathology",
    priceRange: "₹₹",
    address: { "@type": "PostalAddress", streetAddress: CP.street, addressLocality: CP.locality, addressRegion: "MH", postalCode: CP.postal, addressCountry: "IN" },
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "07:00", closes: "20:00" }],
    areaServed: ["Dombivli", "Kalyan", "Thane"],
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.7", reviewCount: "118" },
  };
}

export const faqLd = (items: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});
