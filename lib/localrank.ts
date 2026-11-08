/**
 * LocalRank demo: mock "Places" data + the 100-point scoring rubric.
 * Live version swaps `searchPlaces` / `competitorsFor` for Google Places API (New) calls
 * (Text Search + Place Details, always with field masks). Scoring stays the same.
 */

export type Category = "Pathology lab" | "Dental clinic" | "Gym" | "Coaching class" | "Salon" | "Restaurant";

export type Place = {
  id: string;
  name: string;
  category: Category;
  area: string;
  address: string;
  phone: string | null;
  website: string | null;
  openDays: number; // 0-7 days with listed hours
  rating: number;
  reviews: number;
  lastReviewDays: number; // days since newest review
  photos: number;
  status: "OPERATIONAL" | "CLOSED_TEMPORARILY";
  site: { loads: boolean; viewport: boolean; napMatch: boolean; schema: boolean };
  hasServices: boolean;
  demo?: boolean; // synthesised listing, not in the curated set
};

export type Competitor = Pick<Place, "id" | "name" | "area" | "rating" | "reviews" | "photos"> & { km: number };

export const AREAS = ["Dombivli East", "Dombivli West", "Kalyan West", "Kalyan East", "Thane West", "Mumbai"] as const;

const NO_SITE = { loads: false, viewport: false, napMatch: false, schema: false };
const GOOD_SITE = { loads: true, viewport: true, napMatch: true, schema: true };

const P = (p: Omit<Place, "status" | "hasServices"> & { hasServices?: boolean }): Place => ({
  status: "OPERATIONAL",
  hasServices: false,
  ...p,
});

export const CURATED: Place[] = [
  P({ id: "cp-1", name: "CarePlus Diagnostics", category: "Pathology lab", area: "Dombivli East", address: "Shop 4, Sunrise Plaza, Manpada Rd, Dombivli East, 421201", phone: "+91 98200 11234", website: "careplus-demo.in", openDays: 6, rating: 4.1, reviews: 41, lastReviewDays: 75, photos: 3, site: { loads: true, viewport: true, napMatch: false, schema: false } }),
  P({ id: "cp-2", name: "Sai Dental Clinic", category: "Dental clinic", area: "Kalyan West", address: "2nd Floor, Shivaji Chowk, Kalyan West, 421301", phone: "+91 98334 55120", website: null, openDays: 6, rating: 4.3, reviews: 62, lastReviewDays: 40, photos: 6, site: NO_SITE }),
  P({ id: "cp-3", name: "Dr. Patil Dental Studio", category: "Dental clinic", area: "Dombivli West", address: "Ganesh Nagar, Dombivli West, 421202", phone: "+91 90290 77881", website: "drpatildental.in", openDays: 7, rating: 4.6, reviews: 214, lastReviewDays: 6, photos: 38, site: GOOD_SITE, hasServices: true }),
  P({ id: "cp-4", name: "Iron Pulse Fitness", category: "Gym", area: "Dombivli East", address: "Opp. Railway Station, Dombivli East, 421201", phone: "+91 77380 20019", website: null, openDays: 7, rating: 4.4, reviews: 129, lastReviewDays: 12, photos: 17, site: NO_SITE }),
  P({ id: "cp-5", name: "FitZone Gym Kalyan", category: "Gym", area: "Kalyan East", address: "Chinchpada Rd, Kalyan East, 421306", phone: null, website: null, openDays: 5, rating: 3.9, reviews: 23, lastReviewDays: 160, photos: 4, site: NO_SITE }),
  P({ id: "cp-6", name: "Bright Future Classes", category: "Coaching class", area: "Kalyan West", address: "Near Kalyan Court, Kalyan West, 421301", phone: "+91 98921 66340", website: "brightfutureclasses.in", openDays: 6, rating: 4.5, reviews: 88, lastReviewDays: 20, photos: 14, site: { loads: true, viewport: false, napMatch: true, schema: false } }),
  P({ id: "cp-7", name: "Glam Studio Salon", category: "Salon", area: "Dombivli East", address: "Pandurangwadi, Dombivli East, 421201", phone: "+91 91370 44521", website: null, openDays: 7, rating: 4.2, reviews: 97, lastReviewDays: 30, photos: 22, site: NO_SITE }),
  P({ id: "cp-8", name: "Spice Junction", category: "Restaurant", area: "Thane West", address: "Gokhale Rd, Naupada, Thane West, 400602", phone: "+91 98190 30002", website: "spicejunction.in", openDays: 7, rating: 4.0, reviews: 356, lastReviewDays: 3, photos: 61, site: { loads: true, viewport: true, napMatch: true, schema: false } }),
  P({ id: "cp-9", name: "LifeLine Pathology", category: "Pathology lab", area: "Kalyan West", address: "Lal Chowky, Kalyan West, 421301", phone: "+91 98230 18770", website: null, openDays: 7, rating: 4.2, reviews: 96, lastReviewDays: 28, photos: 9, site: NO_SITE }),
  P({ id: "cp-10", name: "Metro Path Labs", category: "Pathology lab", area: "Thane West", address: "Ghodbunder Rd, Thane West, 400607", phone: "+91 98678 90021", website: "metropathlabs.in", openDays: 7, rating: 4.5, reviews: 312, lastReviewDays: 4, photos: 48, site: GOOD_SITE, hasServices: true }),
];

const POOL: Record<Category, string[]> = {
  "Pathology lab": ["Metro Path Labs", "Sanjeevani Diagnostics", "Dr. Joshi's Path Lab", "Apex Diagnostic Centre", "HealthFirst Labs", "Sunrise Pathology"],
  "Dental clinic": ["Smile Care Dental", "DentoCare Clinic", "Pearl Dental Studio", "Dr. Mehta's Dental", "Bright Smiles", "Dental Hub"],
  Gym: ["PowerHouse Fitness", "Beast Mode Gym", "FitNation", "Flex Arena", "Cult Strength Club", "Muscle Factory"],
  "Coaching class": ["Vidyasagar Academy", "Toppers Tutorials", "Gurukul Classes", "Edge Academy", "Success Point", "Genius Hub"],
  Salon: ["Looks Unisex Salon", "Velvet Salon & Spa", "Style Lounge", "Naturals Studio", "Charm Beauty Parlour", "Mirror Salon"],
  Restaurant: ["Dombivli Tadka", "Biryani House", "Cafe Mocha", "The Curry Leaf", "Tandoor Tales", "Chaat Corner"],
};

const AREA_LANDMARKS: Record<string, string[]> = {
  "Dombivli East": ["Manpada Rd", "Tilak Nagar", "Pandurangwadi", "MIDC Phase 1"],
  "Dombivli West": ["Ganesh Nagar", "Deendayal Rd", "Kopar", "Rajaji Path"],
  "Kalyan West": ["Shivaji Chowk", "Lal Chowky", "Murbad Rd", "Adharwadi"],
  "Kalyan East": ["Chinchpada Rd", "Katemanivali", "Tisgaon", "Pisavli"],
  "Thane West": ["Naupada", "Ghodbunder Rd", "Vartak Nagar", "Majiwada"],
  Mumbai: ["Andheri East", "Borivali West", "Ghatkopar", "Powai"],
};

const CATEGORY_HINTS: [RegExp, Category][] = [
  [/path|lab|diagnos|blood|scan|x-?ray/i, "Pathology lab"],
  [/dent|tooth|smile|ortho/i, "Dental clinic"],
  [/gym|fit|crossfit|yoga|zumba/i, "Gym"],
  [/class|coach|tuition|academy|institute|tutor/i, "Coaching class"],
  [/salon|parlou?r|beauty|spa|hair|barber/i, "Salon"],
  [/restaurant|cafe|kitchen|biryani|dhaba|food|bakery|tadka/i, "Restaurant"],
];

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** deterministic pseudo-random 0..1 from a seed + salt */
const rnd = (seed: number, salt: number) => (hash(`${seed}:${salt}`) % 10000) / 10000;

const titleCase = (s: string) => s.replace(/\s+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());

function guessCategory(q: string): Category {
  for (const [re, c] of CATEGORY_HINTS) if (re.test(q)) return c;
  return "Pathology lab";
}

function synth(name: string, area: string, variant: number): Place {
  const clean = titleCase(name);
  const seed = hash(`${clean.toLowerCase()}|${area}|${variant}`);
  const cat = guessCategory(clean);
  const hasSite = rnd(seed, 1) > 0.55;
  const lm = AREA_LANDMARKS[area] ?? AREA_LANDMARKS["Dombivli East"];
  return {
    id: `d-${seed.toString(36)}`,
    name: clean,
    category: cat,
    area,
    address: `${1 + Math.floor(rnd(seed, 2) * 40)}, ${lm[Math.floor(rnd(seed, 3) * lm.length)]}, ${area}`,
    phone: rnd(seed, 4) > 0.2 ? `+91 9${Math.floor(100000000 + rnd(seed, 5) * 899999999)}` : null,
    website: hasSite ? `${clean.toLowerCase().replace(/[^a-z0-9]+/g, "")}.in` : null,
    openDays: rnd(seed, 6) > 0.5 ? 6 : rnd(seed, 6) > 0.2 ? 7 : 4,
    rating: Math.round((3.6 + rnd(seed, 7) * 1.0) * 10) / 10,
    reviews: Math.floor(12 + rnd(seed, 8) * 90),
    lastReviewDays: Math.floor(5 + rnd(seed, 9) * 200),
    photos: Math.floor(1 + rnd(seed, 10) * 14),
    status: "OPERATIONAL",
    site: hasSite
      ? { loads: true, viewport: rnd(seed, 11) > 0.35, napMatch: rnd(seed, 12) > 0.5, schema: rnd(seed, 13) > 0.8 }
      : NO_SITE,
    hasServices: rnd(seed, 14) > 0.75,
    demo: true,
  };
}

/** Text Search (New) stand-in. Always returns at least one result so any prospect name works in the demo. */
export function searchPlaces(query: string, area: string): Place[] {
  const q = query.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((t) => t.length > 1);
  if (!q.length) return [];
  const scored = CURATED.map((p) => {
    const hay = `${p.name} ${p.category} ${p.area}`.toLowerCase();
    const hits = q.filter((t) => hay.includes(t)).length;
    return { p, s: hits / q.length + (area && p.area === area ? 0.15 : 0) };
  })
    .filter((x) => x.s >= 0.5)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map((x) => x.p);
  const out = [...scored];
  const typed = titleCase(query);
  if (out.length < 2) {
    // several matching listings: same name in neighbouring areas, as Google often returns
    const a2 = AREAS[(AREAS.indexOf(area as (typeof AREAS)[number]) + 1) % AREAS.length];
    out.push(synth(typed, area || "Dombivli East", 0));
    out.push(synth(typed, a2, 1));
  }
  return out.slice(0, 4);
}

export function competitorsFor(place: Place): Competitor[] {
  const seed = hash(place.id);
  const pool = POOL[place.category].filter((n) => n.toLowerCase() !== place.name.toLowerCase());
  const start = seed % pool.length;
  // multipliers: most competitors are ahead of the prospect, one is behind (realistic, and the sales point)
  const mult = [3.1, 1.9, 1.4, 0.7, 2.2];
  const n = 3 + (seed % 3); // 3-5
  return Array.from({ length: n }, (_, i) => {
    const name = pool[(start + i) % pool.length];
    const r = (k: number) => rnd(seed, 100 + i * 7 + k);
    const ratingBump = i === 3 ? -0.2 : 0.1 + r(1) * 0.35;
    return {
      id: `c-${seed.toString(36)}-${i}`,
      name,
      area: place.area,
      km: Math.round((0.4 + r(2) * 2.4) * 10) / 10,
      rating: Math.min(4.9, Math.round((place.rating + ratingBump) * 10) / 10),
      reviews: Math.max(18, Math.round(place.reviews * mult[i] + r(3) * 25)),
      photos: Math.max(5, Math.round(Math.max(place.photos, 8) * (mult[i] * 0.9) + r(4) * 6)),
    };
  }).sort((a, b) => a.km - b.km);
}

/* ---------------- scoring (rubric, section 4.4) ---------------- */

export type Activity = { replies: boolean; posts: boolean };

export type Check = {
  id: string;
  group: "Profile completeness" | "Reviews" | "Photos" | "Website & local SEO" | "Activity & engagement";
  label: string;
  detail: string;
  got: number;
  max: number;
  fix?: { title: string; how: string; eta: number };
};

export type Score = {
  total: number;
  groups: { name: Check["group"]; got: number; max: number }[];
  checks: Check[];
  fixes: { title: string; how: string; eta: number; gain: number }[];
  projected: number;
  compAvg: { reviews: number; photos: number; rating: number };
  rank: number; // 1 = best among place + competitors, by reviews
};

const r1 = (n: number) => Math.round(n * 10) / 10;

export function scorePlace(p: Place, comps: Competitor[], act: Activity): Score {
  const avg = (f: (c: Competitor) => number) => comps.reduce((a, c) => a + f(c), 0) / Math.max(1, comps.length);
  const compAvg = { reviews: Math.round(avg((c) => c.reviews)), photos: Math.round(avg((c) => c.photos)), rating: r1(avg((c) => c.rating)) };
  const C: Check[] = [];
  const add = (c: Check) => C.push(c);
  const G = "Profile completeness" as const;

  add({ id: "cat", group: G, label: "Primary category set", detail: p.category, got: 6, max: 6 });
  add({ id: "phone", group: G, label: "Phone number listed", detail: p.phone ?? "Missing", got: p.phone ? 6 : 0, max: 6,
    fix: { title: "Add a clickable phone number", how: "Add the primary number so patients/customers can call straight from Maps.", eta: 1 } });
  add({ id: "web", group: G, label: "Website linked", detail: p.website ?? "No website on profile", got: p.website ? 6 : 0, max: 6,
    fix: { title: "Link a fast local landing page", how: "Publish a mobile landing page with services and link it from the profile.", eta: 5 } });
  const hoursGot = p.openDays >= 7 ? 6 : p.openDays >= 5 ? 3 : 0;
  add({ id: "hours", group: G, label: "Opening hours complete", detail: p.openDays >= 7 ? "All 7 days listed" : `Only ${p.openDays} of 7 days listed`, got: hoursGot, max: 6,
    fix: { title: "Complete weekly opening hours", how: "Add every day (including Sunday and holiday hours) so you show as 'Open now' more often.", eta: 1 } });
  add({ id: "addr", group: G, label: "Address present", detail: p.address, got: 6, max: 6 });
  add({ id: "svc", group: G, label: "Services list with prices", detail: p.hasServices ? "Services added" : "No services listed", got: 0, max: 0,
    fix: undefined });

  const R = "Reviews" as const;
  const ratio = Math.min(1, p.reviews / Math.max(1, compAvg.reviews));
  add({ id: "rcount", group: R, label: "Review count vs nearby average", detail: `${p.reviews} vs ${compAvg.reviews} avg`, got: r1(ratio * 12), max: 12,
    fix: { title: "Run a review-request drive", how: "WhatsApp review link + QR standee at the counter. Target +25 genuine reviews in 30 days.", eta: 7 } });
  const ratingGot = p.rating >= 4.5 ? 10 : p.rating >= 4.2 ? 8 : p.rating >= 4.0 ? 6 : p.rating >= 3.5 ? 3 : 0;
  add({ id: "rating", group: R, label: "Star rating", detail: `${p.rating.toFixed(1)} ★ (nearby avg ${compAvg.rating.toFixed(1)})`, got: ratingGot, max: 10,
    fix: { title: "Lift your star rating", how: "Reply to every low review politely and ask happy customers to post theirs.", eta: 7 } });
  const recGot = p.lastReviewDays <= 30 ? 8 : p.lastReviewDays <= 90 ? 4 : 0;
  add({ id: "recent", group: R, label: "Recent reviews present", detail: `Newest review ${p.lastReviewDays} days ago`, got: recGot, max: 8,
    fix: { title: "Get fresh reviews flowing", how: "A weekly review nudge to recent customers keeps your profile looking alive.", eta: 3 } });

  const photoGot = r1(Math.min(1, p.photos / Math.max(1, compAvg.photos)) * 10);
  add({ id: "photos", group: "Photos", label: "Photos vs nearby average", detail: `${p.photos} vs ${compAvg.photos} avg`, got: photoGot, max: 10,
    fix: { title: "Upload 20+ real photos", how: "Front, interior, team, equipment and a cover photo, geo-tagged and well lit.", eta: 3 } });

  const W = "Website & local SEO" as const;
  const hasSite = !!p.website;
  add({ id: "loads", group: W, label: "Website loads", detail: hasSite ? (p.site.loads ? "Loads OK" : "Site not loading") : "No website", got: hasSite && p.site.loads ? 4 : 0, max: 4,
    fix: { title: "Get a working website live", how: "Single-page local site, hosted, with title, services and map.", eta: 5 } });
  add({ id: "mobile", group: W, label: "Mobile-friendly (viewport tag)", detail: p.site.viewport ? "Responsive" : "Not mobile-optimised", got: p.site.viewport ? 4 : 0, max: 4,
    fix: { title: "Make the site mobile-friendly", how: "Responsive layout with tap-to-call and WhatsApp buttons.", eta: 4 } });
  add({ id: "nap", group: W, label: "NAP matches profile", detail: p.site.napMatch ? "Name, address, phone match" : "Mismatch or missing", got: p.site.napMatch ? 4 : 0, max: 4,
    fix: { title: "Fix NAP consistency", how: "Same name, address and phone on website, Justdial, Practo and Facebook.", eta: 2 } });
  add({ id: "schema", group: W, label: "LocalBusiness schema", detail: p.site.schema ? "JSON-LD found" : "No structured data", got: p.site.schema ? 3 : 0, max: 3,
    fix: { title: "Add LocalBusiness + FAQ schema", how: "JSON-LD on the homepage so Google understands services, hours and location.", eta: 2 } });

  const A = "Activity & engagement" as const;
  add({ id: "replies", group: A, label: "Owner replies to reviews", detail: act.replies ? "Yes" : "No replies seen", got: act.replies ? 8 : 0, max: 8,
    fix: { title: "Reply to every review within 48 hours", how: "Short, personal replies. Shows Google and customers you are active.", eta: 1 } });
  add({ id: "posts", group: A, label: "Recent Google posts", detail: act.posts ? "Posting weekly" : "No recent posts", got: act.posts ? 7 : 0, max: 7,
    fix: { title: "Publish weekly profile posts", how: "Offers, health-checkup packages and updates, 1-2 per week.", eta: 1 } });

  const groups = (["Profile completeness", "Reviews", "Photos", "Website & local SEO", "Activity & engagement"] as const).map((name) => ({
    name,
    got: Math.round(C.filter((c) => c.group === name).reduce((a, c) => a + c.got, 0)),
    max: C.filter((c) => c.group === name).reduce((a, c) => a + c.max, 0),
  }));
  const total = Math.min(100, Math.round(C.reduce((a, c) => a + c.got, 0)));

  const fixes = C.filter((c) => c.fix && c.max - c.got >= 1)
    .map((c) => ({ ...c.fix!, gain: Math.round(c.max - c.got) }))
    .sort((a, b) => b.gain - a.gain)
    .slice(0, 5);
  const projected = Math.min(100, total + fixes.reduce((a, f) => a + f.gain, 0));
  const rank = 1 + comps.filter((c) => c.reviews > p.reviews).length;

  return { total, groups, checks: C, fixes, projected, compAvg, rank };
}

export function verdict(score: number) {
  if (score >= 80) return { label: "Strong", color: "#15803d", note: "You are ahead of most local profiles. Small wins left." };
  if (score >= 60) return { label: "Average", color: "#b86f0a", note: "Competitors nearby are quietly pulling ahead." };
  return { label: "Needs work", color: "#c2410c", note: "You are likely losing calls to better-set-up neighbours." };
}

/* ---------------- leads (demo: browser storage) ---------------- */

export type Lead = {
  id: string;
  business: string;
  area: string;
  score: number;
  name: string;
  whatsapp: string;
  status: "new" | "contacted" | "proposal" | "won";
  createdAt: string;
};

export const LEADS_KEY = "localrank.leads.v1";

export const SEED_LEADS: Lead[] = [
  { id: "s1", business: "Sai Dental Clinic", area: "Kalyan West", score: 38, name: "Dr. Sharma", whatsapp: "+91 98334 5512x", status: "contacted", createdAt: "2026-10-29T10:12:00" },
  { id: "s2", business: "FitZone Gym Kalyan", area: "Kalyan East", score: 29, name: "Rohit Jadhav", whatsapp: "+91 90040 1177x", status: "proposal", createdAt: "2026-10-30T16:40:00" },
  { id: "s3", business: "Glam Studio Salon", area: "Dombivli East", score: 52, name: "Neha Kulkarni", whatsapp: "+91 91370 4452x", status: "new", createdAt: "2026-10-31T11:05:00" },
  { id: "s4", business: "Bright Future Classes", area: "Kalyan West", score: 64, name: "Prof. Deshmukh", whatsapp: "+91 98921 6634x", status: "won", createdAt: "2026-10-27T09:30:00" },
];
