/**
 * Records a short real screen-recording walkthrough of every demo in config/site.ts.
 * Output: public/videos/{slug}.webm (+ poster image reuses public/demos/{slug}-desktop.webp).
 * Run: npm run record-demos
 */
import { chromium, type Page } from "playwright";
import { mkdir, rename } from "node:fs/promises";
import path from "node:path";
import { DEMOS } from "../config/site";

const OUT = path.join(process.cwd(), "public", "videos");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Smoothly scroll down `px` pixels over `ms` milliseconds. */
async function glide(page: Page, px: number, ms: number) {
  const steps = Math.max(1, Math.round(ms / 50));
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, px / steps);
    await sleep(50);
  }
}

async function tryClick(page: Page, name: RegExp) {
  try {
    await page.getByRole("button", { name }).or(page.getByRole("link", { name })).first().click({ timeout: 4000 });
    return true;
  } catch {
    return false;
  }
}

const steps: Record<string, (p: Page) => Promise<void>> = {
  "whatsapp-followup": async (p) => {
    await sleep(2500);
    await glide(p, 900, 4000);
    await tryClick(p, /play demo/i);
    await sleep(9000);
    await glide(p, 1400, 6000);
  },
  "admission-assistant": async (p) => {
    await sleep(3000);
    await tryClick(p, /watch the live demo/i);
    await sleep(8000);
    await glide(p, 1500, 6000);
  },
  "clinic-website": async (p) => {
    await sleep(3000);
    await glide(p, 3200, 14000);
    await sleep(1500);
  },
  "ca-dashboard": async (p) => {
    await sleep(3000);
    await tryClick(p, /open live demo/i);
    await sleep(9000);
    await glide(p, 900, 5000);
    await sleep(2000);
  },
};

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const results: string[] = [];
  const only = process.argv.slice(2); // optional: slugs to record, e.g. npm run record-demos clinic-website

  for (const demo of DEMOS.filter((d) => !only.length || only.includes(d.slug))) {
    // Wake free servers first (not recorded).
    const warm = await browser.newPage();
    try {
      await warm.goto(demo.url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await warm.waitForFunction(() => !/Application loading/i.test(document.title) && document.body.innerText.length > 80, undefined, { timeout: 60000 });
    } catch {
      results.push(`FAIL ${demo.slug}: demo did not wake up`);
      await warm.close();
      continue;
    }
    await warm.close();

    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: { dir: path.join(OUT, ".tmp"), size: { width: 1280, height: 720 } },
    });
    const page = await ctx.newPage();
    try {
      console.log(`→ recording ${demo.slug}`);
      await page.goto(demo.url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await (steps[demo.slug] ?? (async (p: Page) => { await sleep(2000); await glide(p, 2500, 10000); }))(page);
      const video = page.video();
      await ctx.close();
      await video!.saveAs(path.join(OUT, `${demo.slug}.webm`));
      results.push(`OK   ${demo.slug}.webm`);
    } catch (err) {
      await ctx.close().catch(() => {});
      results.push(`FAIL ${demo.slug}: ${(err as Error).message.split("\n")[0]}`);
    }
  }

  await browser.close();
  console.log("\nSummary\n" + results.join("\n"));
}

main();
