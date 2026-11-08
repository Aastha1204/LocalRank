/**
 * Captures desktop (1280x800) and phone (390x844) screenshots of every demo
 * in config/site.ts and saves optimised .webp files to /public/demos.
 * Run: npm run capture-demos
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { DEMOS } from "../config/site";

const OUT = path.join(process.cwd(), "public", "demos");

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const results: string[] = [];

  for (const demo of DEMOS) {
    const shots = [
      { name: "desktop", width: 1280, height: 800, mobile: false },
      { name: "mobile", width: 390, height: 844, mobile: true },
    ];
    for (const shot of shots) {
      const ctx = await browser.newContext({
        viewport: { width: shot.width, height: shot.height },
        deviceScaleFactor: 1,
        isMobile: shot.mobile,
        hasTouch: shot.mobile,
      });
      const page = await ctx.newPage();
      try {
        console.log(`→ ${demo.slug} ${shot.name}: opening (up to 60s for cold start)…`);
        await page.goto(demo.url, { waitUntil: "domcontentloaded", timeout: 60000 });
        // Render's wake-up screen has this title; wait until the real app shows.
        await page.waitForFunction(
          () => !/Application loading/i.test(document.title) && document.body.innerText.length > 80,
          undefined,
          { timeout: 60000 },
        );
        await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(6000); // let entrance animations / counters finish
        const png = await page.screenshot({ type: "png" });
        const webp = await sharp(png).webp({ quality: 80 }).toBuffer();
        await writeFile(path.join(OUT, `${demo.slug}-${shot.name}.webp`), webp);
        results.push(`OK   ${demo.slug}-${shot.name}.webp (${Math.round(webp.length / 1024)} KB)`);
      } catch (err) {
        results.push(`FAIL ${demo.slug}-${shot.name}: ${(err as Error).message.split("\n")[0]}`);
      } finally {
        await ctx.close();
      }
    }
  }

  await browser.close();
  console.log("\nSummary\n" + results.join("\n"));
}

main();
