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
      !/^(index\.html|app\.js|intelligence\.js|styles\.css|assets\/[a-zA-Z0-9/_.-]+)$/.test(
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
    assert.equal(await page.locator(".metric").count(), 3);
    await page.locator('.sidebar [data-page="reports"]').click();
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
      "PASS: GitHub Pages subpath, local fonts, simplified dashboard and report chart controls",
    );

    await page.locator('.sidebar [data-page="dashboard"]').click();
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
    assert.equal(
      await page
        .getByRole("button", { name: "Approve application", exact: true })
        .isDisabled(),
      true,
    );
    await page.getByRole("button", { name: "Review demo documents" }).click();
    for (const box of await page.locator("#documents-form input").all())
      await box.check();
    await page
      .getByRole("button", { name: "Save demo evidence checks" })
      .click();

    await page
      .getByRole("button", { name: "Approve application", exact: true })
      .click();
    assert.match(await page.locator("tbody").textContent(), /Approved/);
    await page.reload();
    await page.locator('.sidebar [data-page="portfolio"]').click();
    assert.match(
      await page.locator(".project-grid").textContent(),
      /QA Garden Residence/,
    );
    console.log("PASS: application creation, search, approval and persistence");

    await page.locator('.sidebar [data-page="applications"]').click();
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
    for (const box of await page.locator("#documents-form input").all())
      await box.check();
    await page
      .getByRole("button", { name: "Save demo evidence checks" })
      .click();
    assert.equal(
      await page
        .getByRole("button", { name: "Approve application", exact: true })
        .isDisabled(),
      true,
      "Evidence alone cannot override failed credit policy",
    );
    await page.keyboard.press("Escape");
    console.log("PASS: reviewer note requirement and pending-document gate");

    await page.locator('.sidebar [data-page="engine"]').click();
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

    await page.locator('.sidebar [data-page="milestones"]').click();
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

    await page.locator('.sidebar [data-page="reports"]').first().click();
    const download = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Download CSV", exact: true })
      .click();
    const file = await download;
    assert.match(file.suggestedFilename(), /^renovacredit-applications-/);
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

    await page.locator('.sidebar [data-page="settings"]').first().click();
    await page.locator('[name="name"]').fill("Prototype Reviewer");
    await page.getByRole("button", { name: "Save profile" }).click();
    await page.reload();
    assert.match(
      await page.locator(".profile").textContent(),
      /Prototype Reviewer/,
    );
    await page.locator('.sidebar [data-page="settings"]').first().click();
    await page.getByRole("button", { name: "Switch view" }).click();
    assert.match(await page.locator("h1").textContent(), /next chapter/);
    console.log("PASS: saved profile and borrower preview");

    await page.locator('[data-audience="bank"]').click();
    await page.locator('.sidebar [data-page="intelligence"]').click();
    await page
      .locator("#intelligence-select")
      .selectOption({ label: "QA Garden Residence" });
    for (const [name, value] of Object.entries({
      currentValue: 1000,
      afterValue: 1500,
      renovation: 200,
      contingency: 10,
      fees: 20,
      monthlyRent: 10,
      occupancy: 90,
      opex: 20,
      marketDiscount: 10,
      costOverrun: 15,
    })) {
      await page.locator(`#property-form [name="${name}"]`).fill(String(value));
    }
    await page
      .getByRole("button", { name: "Recalculate & save assumptions" })
      .click();
    const economics = await page.evaluate(() => {
      const a = data.apps.find((a) => a.name === "QA Garden Residence");
      return {
        r: propertyAnalysis(a),
        status: a.status,
        evidence: a.property.evidence,
        previous: a.previousDecision,
      };
    });
    assert.equal(economics.r.totalCost, 1240);
    assert.equal(economics.r.surplus, 260);
    assert.equal(economics.r.stressedSurplus, 80);
    assert.ok(Math.abs(economics.r.netRent - 86.4) < 1e-8);
    assert.ok(Math.abs(economics.r.yieldRate - (86.4 / 1240) * 100) < 1e-8);
    assert.equal(
      economics.status,
      "In review",
      "Changed underwriting inputs invalidate an approval",
    );
    assert.equal(economics.evidence.valuation, false);
    assert.equal(economics.evidence.rab, false);
    assert.equal(economics.previous.policy.version, 1);
    await page.locator('[name="marketDiscount"]').fill("100");
    await page
      .getByRole("button", { name: "Recalculate & save assumptions" })
      .click();
    assert.ok(
      (await page.evaluate(
        () => propertyAnalysis(intelligenceProject()).stressedSurplus,
      )) < 0,
    );
    assert.match(
      await page.locator(".intelligence-layout").textContent(),
      /downside erodes/,
    );
    console.log(
      "PASS: project economics, rental yield, negative stress, approval invalidation and evidence refresh",
    );

    await page.locator('.sidebar [data-page="passport"]').click();
    const passportDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download passport JSON" }).click();
    const passportFile = await passportDownload;
    const passport = JSON.parse(
      await fs.readFile(await passportFile.path(), "utf8"),
    );
    assert.equal(passport.schema, "RC-PASSPORT/1.0");
    assert.equal(passport.property.name, "QA Garden Residence");
    assert.equal(passport.model.analysis.surplus, 260);
    assert.equal(passport.decision.previousDecision.policy.version, 1);
    assert.equal(passport.prototype, true);
    assert.equal(passport.property.evidence.rab, false);
    console.log(
      "PASS: portable passport contains provenance, evidence, calculations and prior decision policy",
    );

    await page.locator('[data-audience="investor"]').click();
    assert.equal(await page.locator(".comparison-panel tbody tr").count(), 4);
    await page.locator('.sidebar [data-page="applications"]').click();
    await page
      .getByRole("button", { name: "Review QA Garden Residence" })
      .click();
    assert.equal(
      await page
        .getByRole("button", { name: "Approve application", exact: true })
        .count(),
      0,
    );
    await page.keyboard.press("Escape");
    await page.locator('.sidebar [data-page="intelligence"]').click();
    await page
      .getByRole("button", { name: "Lending policy", exact: true })
      .click();
    assert.equal(
      await page
        .getByRole("button", { name: "Save lending policy" })
        .isDisabled(),
      true,
    );
    await page.locator('[data-audience="institution"]').click();
    assert.equal(await page.locator(".institution-summary").count(), 1);
    await page.getByRole("button", { name: "Configure policy" }).click();
    for (const [name, value] of Object.entries({
      interest: 0,
      maxLtv: 40,
      maxDsr: 30,
      minScore: 90,
    }))
      await page.locator(`#policy-form [name="${name}"]`).fill(String(value));
    await page.getByRole("button", { name: "Save lending policy" }).click();
    const newPolicy = await page.evaluate(() => ({
      policy: data.policy,
      r: assess(data.apps.find((a) => a.name === "QA Garden Residence")),
    }));
    assert.equal(newPolicy.policy.version, 2);
    assert.ok(Math.abs(newPolicy.r.payment - 850 / 60) < 1e-8);
    assert.ok(Math.abs(newPolicy.r.loanCeiling - 600) < 1e-8);
    assert.equal(newPolicy.r.decision, "Outside policy");
    await page.reload();
    assert.equal(await page.evaluate(() => data.policy.version), 2);
    console.log(
      "PASS: four stakeholder perspectives, investor comparison, lender controls, zero-interest edge case and policy persistence",
    );

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
