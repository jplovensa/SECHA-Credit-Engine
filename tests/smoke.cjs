// Run with `npm test`. Set CHROMIUM_EXECUTABLE_PATH to reuse a system Chromium.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const prefix = "/SECHA-Credit-Engine/";
const mime = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
};
const server = http.createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (!pathname.startsWith(prefix)) {
      res.writeHead(404).end();
      return;
    }
    const file = pathname.slice(prefix.length) || "index.html";
    if (
      !/^(index\.html|app\.js|styles\.css|assets\/[a-zA-Z0-9/_.-]+)$/.test(
        file,
      ) ||
      file.includes("..")
    ) {
      res.writeHead(404).end();
      return;
    }
    const content = await fs.readFile(path.join(root, file));
    res
      .writeHead(200, {
        "Content-Type": mime[path.extname(file)] || "text/plain",
      })
      .end(content);
  } catch {
    res.writeHead(404).end();
  }
});
(async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined,
      args: ["--no-sandbox"],
    });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    const base = `http://127.0.0.1:${server.address().port}`;
    const errors = [],
      external = [],
      failures = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      if (!r.url().startsWith(base)) external.push(r.url());
    });
    page.on("response", (r) => {
      if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`);
    });
    await page.goto(base + prefix);
    assert.equal(await page.locator(".metric").count(), 4);
    await page.evaluate(() => document.fonts.ready);
    assert.ok(
      await page.evaluate(() => document.fonts.check("400 13px Inter")),
    );
    await page.locator('[data-range="1y"]').click();
    assert.match(
      await page.locator(".chart svg").getAttribute("aria-label"),
      /24 billion/,
    );
    console.log(
      "PASS: GitHub Pages subpath, local fonts, dashboard and chart controls",
    );

    await page.getByRole("button", { name: "New application" }).click();
    await page.locator('[name="project"]').fill("QA Garden Residence");
    await page.locator('[name="borrower"]').fill("Demo Borrower");
    await page.locator('[name="location"]').fill("Kebayoran, Jakarta");
    await page
      .getByRole("button", { name: "Create & assess application" })
      .click();
    await page.locator("#queue-search").fill("QA Garden");
    assert.equal(await page.locator("tbody tr").count(), 1);
    await page
      .getByRole("button", { name: "Review QA Garden Residence" })
      .click();
    await page
      .getByRole("button", { name: "Approve application", exact: true })
      .click();
    assert.match(await page.locator("tbody").textContent(), /Approved/);
    await page.reload();
    await page.locator('[data-page="portfolio"]').click();
    assert.match(
      await page.locator(".project-grid").textContent(),
      /QA Garden Residence/,
    );
    console.log("PASS: application creation, search, approval and persistence");

    await page.locator('[data-page="applications"]').click();
    await page
      .getByRole("button", { name: "Review Menteng Heritage", exact: true })
      .click();
    await page.getByRole("button", { name: "Decline", exact: true }).click();
    assert.match(
      await page.locator("#review-error").textContent(),
      /reviewer note/,
    );
    await page
      .locator("#review-note")
      .fill("=Sample note to exercise CSV formula protection");
    await page.getByRole("button", { name: "Decline", exact: true }).click();
    assert.equal(await page.locator(".modal").count(), 0);
    await page
      .getByRole("button", { name: "Review Kemang Townhouse", exact: true })
      .click();
    assert.equal(
      await page
        .getByRole("button", { name: "Approve application", exact: true })
        .count(),
      0,
    );
    await page
      .getByRole("button", { name: "Mark demo documents complete" })
      .click();
    await page
      .getByRole("button", { name: "Approve application", exact: true })
      .click();
    console.log("PASS: reviewer note requirement and pending-document gate");

    await page.locator('[data-page="engine"]').click();
    await page.locator('[name="amount"]').fill("2000");
    await page.locator('[name="value"]').fill("1000");
    await page.getByRole("button", { name: "Run assessment" }).click();
    assert.match(
      await page.locator("#risk-result").textContent(),
      /Outside policy/,
    );
    await page.locator('[name="amount"]').fill("500");
    await page.locator('[name="value"]').fill("2000");
    await page.getByRole("button", { name: "Run assessment" }).click();
    assert.match(
      await page.locator("#risk-result").textContent(),
      /Eligible for review/,
    );
    // Independent expected payment: IDR 500M, 1% monthly, 60 monthly payments.
    const expected = (500 * 0.01) / (1 - Math.pow(1.01, -60));
    assert.match(
      await page.locator(".decision-callout").first().textContent(),
      new RegExp(expected.toFixed(1) + "M"),
    );
    console.log(
      "PASS: risk policy boundaries and amortized repayment calculation",
    );

    await page.locator('[data-page="milestones"]').click();
    await page.getByRole("button", { name: "Review evidence" }).click();
    await page
      .getByRole("button", { name: "Record demo verification" })
      .click();
    assert.equal(
      await page.locator(".modal").count(),
      1,
      "Unchecked evidence must prevent submission",
    );
    const checkboxes = page.locator("#evidence-form input");
    for (let i = 0; i < 3; i++) await checkboxes.nth(i).check();
    await page
      .getByRole("button", { name: "Record demo verification" })
      .click();
    assert.match(
      await page.locator(".timeline").textContent(),
      /Evidence verified/,
    );
    assert.equal(await page.locator('[data-milestone="1"]').count(), 1);
    assert.equal(await page.locator('[data-milestone="2"]').count(), 0);
    console.log("PASS: evidence requirements and sequential milestones");

    await page.locator('[data-page="reports"]').first().click();
    const download = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Download CSV", exact: true })
      .click();
    const file = await download;
    assert.match(file.suggestedFilename(), /^secha-applications-/);
    const csv = await fs.readFile(await file.path(), "utf8");
    assert.match(csv, /QA Garden Residence/);
    assert.match(csv, /'=Sample note/);
    assert.match(
      await page.locator(".content").textContent(),
      /Application declined/,
    );
    console.log(
      "PASS: decision trail, CSV contents and spreadsheet formula escaping",
    );

    await page.locator('[data-page="settings"]').first().click();
    await page.locator('[name="name"]').fill("Prototype Reviewer");
    await page.getByRole("button", { name: "Save profile" }).click();
    await page.reload();
    assert.match(
      await page.locator(".profile").textContent(),
      /Prototype Reviewer/,
    );
    await page.locator('[data-page="settings"]').first().click();
    await page.getByRole("button", { name: "Switch view" }).click();
    assert.match(await page.locator("h1").textContent(), /next chapter/);
    console.log("PASS: saved profile and borrower preview");

    // Use another origin-isolated browser context to avoid leaving demo edits.
    const mobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    const m = await mobile.newPage();
    await m.goto(base + prefix);
    assert.equal(
      await m.evaluate(() => document.documentElement.scrollWidth),
      390,
    );
    await m.getByRole("button", { name: "Toggle navigation" }).click();
    await m.locator('.sidebar [data-page="applications"]').click();
    await m.getByRole("button", { name: "New application" }).click();
    const close = m.getByRole("button", { name: "Close dialog" });
    await close.focus();
    await m.keyboard.press("Shift+Tab");
    assert.equal(
      await m.evaluate(() => document.activeElement.textContent.trim()),
      "Create & assess application",
    );
    await m.keyboard.press("Tab");
    assert.equal(
      await close.evaluate((el) => el === document.activeElement),
      true,
    );
    await m.keyboard.press("Escape");
    assert.equal(await m.locator(".modal").count(), 0);
    assert.equal(
      await m.evaluate(() => document.documentElement.scrollWidth),
      390,
    );
    console.log(
      "PASS: mobile layout, navigation, keyboard focus trap and Escape",
    );
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    assert.deepEqual(failures, []);
    console.log(
      "PASS: no browser errors, failed resources or external requests",
    );
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
