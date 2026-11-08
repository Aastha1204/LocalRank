/**
 * Builds ONE showreel video that covers every service:
 *  - 4 services with a live demo → clips from the recorded demo walkthroughs (run `npm run record-demos` first)
 *  - 5 services without a demo   → short concept animations drawn in scripts/showreel/index.html
 * Output: public/videos/showreel.webm
 * Run: npm run make-showreel
 */
import { chromium } from "playwright";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const out = path.join(root, "public", "videos");
const tmp = path.join(out, ".tmp-reel");

async function main() {
  await mkdir(out, { recursive: true });
  const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--allow-file-access-from-files"] });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: tmp, size: { width: 1280, height: 720 } },
  });
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(path.join(root, "scripts", "showreel", "index.html")).href);
  await page.waitForFunction(() => (window as unknown as { __done?: boolean }).__done === true, undefined, { timeout: 180000 });
  const video = page.video()!;
  await ctx.close();
  await video.saveAs(path.join(out, "showreel.webm"));
  await browser.close();
  await rm(tmp, { recursive: true, force: true });
  console.log("Saved public/videos/showreel.webm");
}

main();
