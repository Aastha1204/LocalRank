# Neovia AI: AI & Web Services website

Next.js (App Router) + TypeScript + Tailwind. Single-page lead-generation site with a Supabase-backed contact form.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## 1. Edit content
**Everything editable is in [`config/site.ts`](config/site.ts)**: contact details, packages, care plans, demos, FAQ, industries, copy.

- `CONTACT.bookingUrl` empty → the "Book a call" button is hidden and WhatsApp is used instead.
- `PILOT_OFFER.enabled = true` → shows the banner above the header.
- `highlightPackage = 1..4` → marks that package "Most popular" (0 = off).
- `CONTACT.demoVideoUrl` → replaces the "video coming soon" slot with a video player (direct .mp4 URL).
- `npm run build` prints a warning while placeholder phone / WhatsApp / email are unchanged.

## 2. Supabase (contact form)
1. Create a project at supabase.com.
2. SQL Editor → run [`supabase/schema.sql`](supabase/schema.sql) (creates `inquiries` with row-level security on).
3. Copy `.env.example` to `.env.local` and fill `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API). These are server-only; never prefix them with `NEXT_PUBLIC_`.
4. View enquiries in Supabase → Table Editor → `inquiries`.

The form route (`app/api/inquiry/route.ts`) has a honeypot field and a simple in-memory rate limit (5 per IP per 10 minutes per server instance). In production without Supabase keys it returns a friendly error pointing people to WhatsApp.

## 3. Deploy to Vercel
1. Push this folder to a GitHub repo and import it in Vercel.
2. Add the env vars from `.env.example` (including `NEXT_PUBLIC_SITE_URL` = your real domain, used by sitemap, canonical and Open Graph).
3. Deploy. Optional analytics: set `NEXT_PUBLIC_ANALYTICS_ID` to your Plausible domain; leave empty to keep analytics off.

## 4. Refresh demo screenshots
```bash
npm run capture-demos
```
Visits each demo in `config/site.ts` (waits up to 60 s for free servers to wake), saves 1280×800 desktop and 390×844 phone screenshots as `public/demos/{slug}-desktop.webp` / `-mobile.webp`. If a file is missing the card shows a gradient placeholder. First run needs `npx playwright install chromium`. The Open Graph image `public/og.jpg` is a crop of the clinic desktop screenshot; recreate it if you change that demo.

## 5. Walkthrough videos
```bash
npm run record-demos                 # all demos
npm run record-demos clinic-website  # one demo (slug from config/site.ts)
```
Records a ~25 s real screen recording of each live demo to `public/videos/{slug}.webm`. The "Watch the demos in action" grid shows whichever videos exist. Free servers may need a retry if they are slow to wake. Your own overall video can still go in `CONTACT.demoVideoUrl`.

### One video for all services
```bash
npm run make-showreel
```
Builds `public/videos/showreel.webm` (~1 min): live-demo clips for the 4 services that have demos, plus concept animations for Mobile App, Agentic AI, RAG Chatbot, Agentic AI Chatbot and AI Automation (edit them in `scripts/showreel/index.html`). Run `npm run record-demos` first if you changed a demo. The video is labelled honestly on the page and in the video itself.

## 6. Payments
- **UPI** works immediately: your QR (`public/upi-qr.png`), UPI ID and an "Open my UPI app" link. Edit `PAYMENTS` in `config/site.ts`.
- **Card, net banking (all major banks), UPI and wallets** use Razorpay. Create an account at razorpay.com, finish KYC, then Settings > API Keys. Put `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env.local` / Vercel and redeploy; the card button switches on. Test first with Razorpay *test* keys and its test card numbers.
- **Bank transfer** details show only after you fill `PAYMENTS.bank` (account name, number, IFSC, bank).
- Payment records live in your Razorpay dashboard. The site only creates the order and checks the payment signature.

### Book now, amounts and receipts
- Each demo card has **Book now**. The amount comes from `price` in `DEMOS` (config/site.ts): the customer picks the 50% advance (`ADVANCE_PERCENT`) or full price, then Pay now, then UPI or Net banking / Card. Set `price` for the Clinic Website and CA Dashboard cards; with `null` the customer types the amount you agreed.
- **Card / net banking:** after Razorpay confirms (signature is verified on the server) the customer sees a printable receipt and you both get an email if `RESEND_API_KEY` is set. Also switch on payment receipts in the Razorpay dashboard (Settings > Notifications) so Razorpay emails customers and you directly.
- **UPI:** UPI goes straight to your bank, so the site cannot confirm it. The customer taps *I have paid*; you get a Supabase row (`payment_claims`, run `supabase/schema.sql`) and an email if Resend is set, plus a WhatsApp button that sends you the details. Check the payment in your UPI app, then confirm to the customer. Their receipt says "Pending verification" until then.

## Placeholder checklist before launch
- [ ] `CONTACT.phone` (+91…)
- [ ] `CONTACT.whatsapp` (91…, no +)
- [ ] `CONTACT.email`
- [ ] `price` for Clinic Website and CA Dashboard in `DEMOS`
- [ ] Razorpay keys (card payments) and `PAYMENTS.bank` (optional)
- [ ] `CONTACT.bookingUrl` (optional, Calendly / Cal.com)
- [ ] `CONTACT.demoVideoUrl` (30-second walkthrough)
- [ ] `NEXT_PUBLIC_SITE_URL` and Supabase keys in Vercel
- [ ] Decide on `PILOT_OFFER.enabled` and `highlightPackage`
- [ ] Re-read pricing, delivery times and the "Reply within 24 hours" promise to be sure you can keep them
