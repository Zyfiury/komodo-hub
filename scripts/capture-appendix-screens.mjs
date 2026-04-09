/**
 * Capture screenshots for coursework appendices. Requires dev server:
 *   npm run dev
 * Run: node scripts/capture-appendix-screens.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "report_docs", "appendix_screenshots");
const base = process.env.APPENDIX_BASE_URL || "http://127.0.0.1:3000";

const PASS = "KomodoHub!Dev2026";

/** Log in via API so session cookie is stored on the browser context (avoids flaky UI submit). */
async function login(context, page, email) {
  const res = await context.request.post(`${base}/api/auth/login`, {
    data: { email, password: PASS },
    headers: { "Content-Type": "application/json" },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok()) {
    throw new Error(`Login API failed ${res.status()}: ${JSON.stringify(body)}`);
  }
  const path = body.redirect || "/dashboard/teacher";
  await page.goto(`${base}${path}`, { waitUntil: "load" });
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  try {
    // A — public landing
    {
      const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
      const page = await ctx.newPage();
      await page.goto(base, { waitUntil: "load" });
      await page.screenshot({ path: join(outDir, "appendix-a-landing.png"), fullPage: true });
      await ctx.close();
    }

    // B — teacher dashboard
    {
      const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
      const page = await ctx.newPage();
      await login(ctx, page, "teacher@komodohub.local");
      await page.goto(`${base}/dashboard/teacher`, { waitUntil: "load" });
      await new Promise((r) => setTimeout(r, 500));
      await page.screenshot({ path: join(outDir, "appendix-b-teacher.png"), fullPage: true });
      await ctx.close();
    }

    // C — wildlife reporting (student)
    {
      const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
      const page = await ctx.newPage();
      await login(ctx, page, "student1@komodohub.local");
      await page.goto(`${base}/report/wildlife`, { waitUntil: "load" });
      await new Promise((r) => setTimeout(r, 500));
      await page.screenshot({ path: join(outDir, "appendix-c-wildlife.png"), fullPage: true });
      await ctx.close();
    }

    // D — foundation dashboard
    {
      const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
      const page = await ctx.newPage();
      await login(ctx, page, "foundation.admin@komodohub.local");
      await page.goto(`${base}/dashboard/foundation`, { waitUntil: "load" });
      await new Promise((r) => setTimeout(r, 500));
      await page.screenshot({ path: join(outDir, "appendix-d-foundation.png"), fullPage: true });
      await ctx.close();
    }

    // Extra: library (public) for optional use
    {
      const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
      const page = await ctx.newPage();
      await page.goto(`${base}/library`, { waitUntil: "load" });
      await page.screenshot({ path: join(outDir, "appendix-public-library.png"), fullPage: true });
      await ctx.close();
    }

    console.log("Screenshots saved to", outDir);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
