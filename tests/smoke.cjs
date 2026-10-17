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
      !/^(index\.html|app\.js|model\.js|styles\.css|assets\/[a-zA-Z0-9/_.-]+)$/.test(
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
        reducedMotion: "reduce",
      }),
      page = await context.newPage();
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
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator(".stat").count(), 4);
    assert.equal(await page.locator(".action-item").count(), 4);
    assert.equal(
      await page.evaluate(() => document.fonts.check("400 13px Inter")),
      true,
    );
    assert.equal(
      await page.getByText("RenovaScore", { exact: false }).count(),
      0,
    );
    const initial = await page.evaluate(() => rcFinance(store.cases[0]));
    assert.equal(initial.total, 270000000);
    assert.equal(initial.gap, 240000000);
    console.log(
      "PASS: project-subpath hosting, local fonts, action dashboard and IDR funding arithmetic",
    );
    const role = async (name) => {
      await page.locator(".workspace-context .perspective").click();
      await page.locator(`.modal [data-role="${name}"]`).click();
    };
    const caseUI = async (name) => {
      await page.locator('.sidebar [data-page="cases"]').click();
      await page
        .getByRole("button", { name: `Open ${name}`, exact: true })
        .click();
    };
    await caseUI("Bekasi Family Home");
    assert.equal(await page.getByRole("tab").count(), 5);
    assert.equal(
      await page
        .getByRole("button", { name: "Accept reviewed budget", exact: true })
        .isDisabled(),
      true,
    );
    await page.locator("[data-source]").first().click();
    assert.equal(
      await page.locator(".quote-paper .source-highlight").count(),
      1,
    );
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", {
        name: "Review Waterproofing & wet areas",
        exact: true,
      })
      .click();
    await page
      .locator('[name="note"]')
      .fill("Demo measurement agrees with the illustrative quote.");
    await page.getByRole("button", { name: "Confirm reviewed line" }).click();
    await page
      .getByRole("button", { name: "Accept reviewed budget", exact: true })
      .click();
    assert.equal(await page.evaluate(() => activeCase().acceptedVersion), 2);
    await page.getByRole("tab", { name: /^Evidence/ }).click();
    for (const id of ["quote", "site", "authority", "permit"]) {
      await page.locator(`.document-item[data-document="${id}"]`).click();
      await page
        .locator('[name="status"]')
        .selectOption(id === "permit" ? "Not applicable" : "Reviewer accepted");
      await page
        .locator('[name="note"]')
        .fill(
          id === "permit"
            ? "Demo specialist rationale: no structural change for this fictional scope."
            : "Illustrative record reviewed in the demo; no actual professional verification.",
        );
      await page
        .getByRole("button", { name: "Save demo evidence review" })
        .click();
    }
    await page.getByRole("tab", { name: "Funding plan", exact: true }).click();
    await page
      .getByRole("button", { name: "Review packet", exact: true })
      .click();
    assert.equal(
      await page
        .getByRole("button", { name: "Record demo packet acceptance" })
        .isDisabled(),
      true,
    );
    await page.keyboard.press("Escape");
    await role("lender");
    await page
      .getByRole("button", { name: "Review packet", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Record demo packet acceptance" })
      .click();
    assert.equal(
      await page.evaluate(() => activeCase().packetStatus),
      "Accepted",
    );
    assert.equal(
      await page.evaluate(() => activeCase().creditStatus),
      "Not requested",
    );
    await page.getByRole("button", { name: "Edit assumptions" }).click();
    await page.locator('[name="facility"]').fill("241000000");
    await page.locator('[name="facilityReference"]').fill("DEMO-FAC-026");
    await page.locator('[name="active"]').check();
    await page
      .getByRole("button", { name: "Save funding assumptions" })
      .click();
    assert.match(
      await page.locator(".form-error").textContent(),
      /cannot exceed/,
    );
    await page.locator('[name="facility"]').fill("240000000");
    await page
      .getByRole("button", { name: "Save funding assumptions" })
      .click();
    assert.equal(await page.evaluate(() => rcFinance(activeCase()).gap), 0);
    console.log(
      "PASS: source review, evidence states, separate packet acceptance and bounded demo facility",
    );
    await role("reviewer");
    await page
      .getByRole("tab", { name: "Scope & budget", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Review Waterproofing & wet areas",
        exact: true,
      })
      .click();
    await page.locator('[name="rate"]').fill("650000");
    await page
      .locator('[name="note"]')
      .fill("Demo quote revised. Re-review the budget and funding conditions.");
    await page.getByRole("button", { name: "Confirm reviewed line" }).click();
    const revised = await page.evaluate(() => ({
      version: activeCase().version,
      accepted: activeCase().acceptedVersion,
      active: activeCase().facilityActive,
      original: activeCase().lines[0].originalRate,
      current: activeCase().lines[0].rate,
      snapshot: activeCase().snapshots[0],
    }));
    assert.equal(revised.version, 3);
    assert.equal(revised.accepted, null);
    assert.equal(revised.active, false);
    assert.equal(revised.original, 600000);
    assert.equal(revised.current, 650000);
    assert.equal(revised.snapshot.version, 2);
    await page
      .getByRole("tab", { name: "Changes & claims", exact: true })
      .click();
    assert.equal(
      await page.locator('[data-change="CO-008"]').isDisabled(),
      true,
    );
    await role("owner");
    await page.locator('[data-change="CO-008"]').click();
    await page.locator('[name="ack"]').check();
    await page
      .getByRole("button", { name: "Record demo owner acknowledgment" })
      .click();
    await role("reviewer");
    await page.locator('[data-change="CO-008"]').click();
    await page
      .locator('[name="note"]')
      .fill("Fictional owner acknowledgment and change scope reviewed.");
    await page
      .getByRole("button", { name: "Accept change for budget re-review" })
      .click();
    assert.equal(await page.evaluate(() => activeCase().version), 4);
    assert.equal(await page.evaluate(() => activeCase().lines.length), 7);
    assert.equal(
      await page.evaluate(() => activeCase().changes[0].status),
      "Accepted",
    );
    console.log(
      "PASS: versioned budgets, preserved source values, approval invalidation and owner-first change review",
    );
    await page
      .getByRole("button", { name: "Export packet", exact: true })
      .click();
    const downloading = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Structured packet", exact: false })
      .click();
    const downloaded = await downloading;
    const packet = JSON.parse(
      await fs.readFile(await downloaded.path(), "utf8"),
    );
    assert.equal(packet.schema, "RC-PACKET/1.0");
    assert.equal(packet.amountUnit, "rupiah");
    assert.equal(packet.budgetVersion, 4);
    assert.equal(packet.scope[0].originalRate, 600000);
    assert.equal(packet.prototype, true);
    assert.equal(packet.readiness.budgetReviewed, false);
    const popupEvent = page.waitForEvent("popup");
    await page
      .getByRole("button", { name: "Readable lender memo", exact: false })
      .click();
    const popup = await popupEvent;
    await popup.waitForLoadState();
    assert.match(
      await popup.locator("body").textContent(),
      /What needs attention/,
    );
    assert.match(
      await popup.locator("body").textContent(),
      /not a bank approval/,
    );
    await popup.close();
    await page.keyboard.press("Escape");
    console.log(
      "PASS: frozen JSON packet and print-ready lender memo preserve source and readiness states",
    );
    await caseUI("Bintaro Courtyard");
    await page
      .getByRole("tab", { name: "Changes & claims", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Request correction", exact: true })
      .click();
    await page
      .locator('[name="note"]')
      .fill("Demo finishing evidence needs a clearer quantity record.");
    await page
      .getByRole("button", { name: "Record correction request", exact: true })
      .click();
    assert.equal(
      await page.evaluate(() => activeCase().claim.status),
      "Correction requested",
    );
    assert.equal(
      await page
        .getByRole("button", { name: "Record demo authorization", exact: true })
        .count(),
      0,
    );
    await page
      .getByRole("button", { name: "Review revised submission", exact: true })
      .click();
    await page.locator('[name="reference"]').fill("DEMO-REV-012");
    await page
      .locator('[name="note"]')
      .fill("Revised demo evidence received for a new certification review.");
    await page
      .getByRole("button", {
        name: "Record revised demo submission",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Review & certify", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Record demo certification", exact: true })
      .click();
    assert.equal(
      await page.evaluate(() => rcClaimTotals(activeCase()).certified),
      52000000,
    );
    assert.equal(
      await page
        .getByRole("button", { name: "Record demo authorization", exact: true })
        .isDisabled(),
      true,
    );
    await role("lender");
    await page
      .getByRole("button", { name: "Record demo authorization", exact: true })
      .click();
    await page.locator('[name="reference"]').fill("DEMO-AUTH-012");
    await page
      .getByRole("button", { name: "Record demo authorization", exact: true })
      .last()
      .click();
    assert.equal(
      await page.evaluate(() => activeCase().claim.status),
      "Authorized",
    );
    assert.equal(
      await page.evaluate(() => rcClaimTotals(activeCase()).paid),
      0,
    );
    await page
      .getByRole("button", { name: "Record external payment", exact: true })
      .click();
    await page.locator('[name="reference"]').fill("DEMO-PAY-001");
    await page.locator('[name="amount"]').fill("40000000");
    await page
      .getByRole("button", { name: "Save demo payment record" })
      .click();
    assert.equal(
      await page.evaluate(() => activeCase().claim.status),
      "Partially paid",
    );
    await page
      .getByRole("button", { name: "Record external payment", exact: true })
      .click();
    await page.locator('[name="reference"]').fill("DEMO-PAY-001");
    await page
      .getByRole("button", { name: "Save demo payment record" })
      .click();
    assert.match(
      await page.locator(".form-error").textContent(),
      /already recorded/,
    );
    await page.locator('[name="reference"]').fill("DEMO-PAY-002");
    await page
      .getByRole("button", { name: "Save demo payment record" })
      .click();
    assert.equal(await page.evaluate(() => activeCase().claim.status), "Paid");
    assert.equal(await page.evaluate(() => rcFinance(activeCase()).gap), 0);
    await role("reviewer");
    await page
      .getByRole("button", { name: "Reconcile payment records", exact: true })
      .click();
    const reconciled = await page.evaluate(() => ({
      status: activeCase().claim.status,
      ...rcClaimTotals(activeCase()),
      payments: activeCase().claim.payments.length,
    }));
    assert.equal(reconciled.status, "Reconciled");
    assert.equal(reconciled.requested, 60000000);
    assert.equal(reconciled.paid, 52000000);
    assert.equal(reconciled.payments, 2);
    assert.match(await page.locator(".held-amount").textContent(), /8 jt/);
    await page.reload();
    await caseUI("Bintaro Courtyard");
    await page
      .getByRole("tab", { name: "Changes & claims", exact: true })
      .click();
    assert.equal(
      await page.evaluate(() => activeCase().claim.status),
      "Reconciled",
    );
    console.log(
      "PASS: separate certification, lender authorization, partial payments, duplicate protection, reconciliation and persistence",
    );
    await page.locator('.sidebar [data-page="cases"]').click();
    await page.locator("#case-search").fill("Bekasi");
    assert.equal(await page.locator("#case-results tbody tr").count(), 1);
    await page.getByRole("button", { name: "New case", exact: true }).click();
    await page.locator('[name="name"]').fill("QA <Garden> Home");
    await page.locator('[name="owner"]').fill("Fictional Owner");
    await page.locator('[name="location"]').fill("Bekasi, Jawa Barat");
    await page
      .locator('[name="objective"]')
      .fill("Repair the wet-area finishes with a clear cash plan.");
    await page
      .getByRole("button", { name: "Create draft case", exact: false })
      .click();
    assert.match(
      await page.locator(".case-heading h1").textContent(),
      /QA <Garden> Home/,
    );
    assert.equal(
      await page
        .getByRole("button", { name: "Accept reviewed budget", exact: true })
        .isDisabled(),
      true,
    );
    assert.equal(
      await page.evaluate(() => activeCase().unknownCosts.length),
      1,
    );
    await page.getByRole("button", { name: "Add line", exact: true }).click();
    await page.locator('[name="label"]').fill("Demo light fixture");
    await page
      .locator('[name="spec"]')
      .fill("Source-linked fixture installation");
    await page.locator('[name="source"]').fill("Demo quote · page 1 · item 2");
    await page
      .getByRole("button", { name: "Add unreviewed scope line" })
      .click();
    assert.equal(await page.evaluate(() => activeCase().lines.length), 2);
    assert.equal(
      await page.evaluate(() => activeCase().lines[1].reviewed),
      false,
    );
    console.log(
      "PASS: case search, safe fictional intake, unpriced cost gates and source-linked scope creation",
    );
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    assert.deepEqual(failures, []);
    const mobile = await browser.newContext({
        viewport: { width: 390, height: 844 },
        reducedMotion: "reduce",
      }),
      m = await mobile.newPage();
    await m.goto(base + prefix);
    assert.equal(
      await m.evaluate(() => document.documentElement.scrollWidth),
      390,
    );
    await m.getByRole("button", { name: "Toggle navigation" }).click();
    await m.locator('.sidebar [data-page="claims"]').click();
    await m
      .getByRole("button", { name: "Open claim workspace", exact: true })
      .click();
    await m
      .getByRole("button", { name: "Review & certify", exact: true })
      .click();
    const close = m.getByRole("button", { name: "Close dialog", exact: true });
    await close.focus();
    await m.keyboard.press("Shift+Tab");
    assert.equal(
      await m.evaluate(() => document.activeElement.textContent.trim()),
      "Record demo certification",
    );
    await m.keyboard.press("Tab");
    assert.equal(
      await close.evaluate((el) => el === document.activeElement),
      true,
    );
    await m.keyboard.press("Escape");
    assert.equal(await m.locator(".modal").count(), 0);
    await m.getByRole("tab", { name: "Scope & budget", exact: true }).click();
    await m.keyboard.press("End");
    assert.equal(
      await m.locator('[role="tab"][aria-selected="true"]').textContent(),
      "History",
    );
    await m.evaluate(() => openCase("RC-025", "scope"));
    await m
      .getByRole("button", {
        name: "Review Waterproofing & wet areas",
        exact: true,
      })
      .click();
    await m.locator('[name="rate"]').fill("500000");
    await m
      .locator('[name="note"]')
      .fill("Demo revised quote invalidates the old claim baseline.");
    await m.getByRole("button", { name: "Confirm reviewed line" }).click();
    await m.getByRole("tab", { name: "Changes & claims", exact: true }).click();
    assert.match(
      await m.locator(".claim-content").textContent(),
      /Stale baseline/,
    );
    assert.equal(
      await m
        .getByRole("button", { name: "Review & certify", exact: true })
        .isDisabled(),
      true,
    );
    console.log(
      "PASS: mobile navigation, dialog focus trap, keyboard tabs and stale-claim prevention",
    );
    console.log(
      "PASS: no page errors, external requests or failed application assets",
    );
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
