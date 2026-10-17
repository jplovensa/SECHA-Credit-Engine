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
      !/^(index\.html|app\.js|model\.js|passport\.js|styles\.css|assets\/[a-zA-Z0-9/_.-]+)$/.test(
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
      const previous = await page.evaluate(() => ({page:ui.page, caseId:ui.caseId, tab:ui.tab}));
      await page.locator(".workspace-context .perspective").click();
      await page.locator(`.modal [data-role="${name}"]`).click();
      assert.equal(await page.evaluate(() => ui.page), "overview");
      // Return to the case to exercise a handoff after opening the role dashboard.
      if (previous.page === "case") await page.evaluate(({caseId,tab}) => openCase(caseId,tab), previous);
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
    // Audience dashboards must differ in data, tasks and navigation, not just titles.
    const audience = await context.newPage();
    audience.on("pageerror", e => errors.push(e.message));
    await audience.goto(base + prefix);
    await audience.evaluate(() => { store = rcSeed(); ui.page = "overview"; render(); });
    const switchAudience = async id => {
      await audience.locator(".workspace-context .perspective").click();
      await audience.locator(`.modal [data-role="${id}"]`).click();
    };
    const home = async () => audience.locator('.sidebar button[data-page="overview"]').click();
    assert.match(await audience.locator("h1").textContent(), /review desk/);
    assert.match(await audience.locator(".stats").textContent(), /Scope lines to review/);
    await switchAudience("owner");
    assert.match(await audience.locator("h1").textContent(), /Your renovation/);
    assert.equal(await audience.locator(".owner-hero h2").textContent(), "Bekasi Family Home");
    assert.equal(await audience.getByRole("button", {name:"New case",exact:true}).count(),0);
    assert.equal(await audience.locator('.sidebar [data-page="claims"]').count(),0);
    assert.equal(await audience.locator(".owner-decision").count(),2);
    assert.match(await audience.locator(".stats").textContent(), /Rp240/);
    for (const target of ["evidence","activity","cases","overview"]) {
      await audience.evaluate(target => navigate(target),target);
      assert.doesNotMatch(await audience.locator("#main-content").textContent(), /Bintaro Courtyard|Cibubur Garden House|Serpong Terrace|Ciputat Rumah Kita/);
    }
    await audience.evaluate(() => openCase("RC-025","changes"));
    assert.equal(await audience.evaluate(() => ui.caseId), "RC-026");
    await audience.getByRole("button", {name:"Review scope change",exact:true}).click();
    await audience.locator('[data-change="CO-008"]').click();
    await audience.locator('[name="ack"]').check();
    await audience.getByRole("button",{name:"Record demo owner acknowledgment"}).click();
    await home();
    assert.equal(await audience.getByRole("button",{name:"Review scope change",exact:true}).count(),0);
    assert.equal(await audience.locator(".stat").last().locator("strong").textContent(),"00");
    await switchAudience("reviewer");
    assert.match(await audience.locator(".action-list").textContent(), /Review the acknowledged scope change/);
    await switchAudience("lender");
    assert.match(await audience.locator("h1").textContent(), /lending decision/);
    assert.match(await audience.locator(".stats").textContent(), /Usable facilities.*Rp264/);
    assert.equal(await audience.locator('.stats .stat').nth(2).locator('strong').textContent(),"01");
    assert.equal(await audience.locator('.stats .stat').nth(3).locator('strong').textContent(),"00");
    assert.equal(await audience.locator('.action-list [data-case="RC-025"]').count(),0);
    assert.equal(await audience.locator('.action-list [data-case="RC-023"]').count(),1);
    await audience.locator('.action-list [data-case="RC-023"]').click();
    assert.equal(await audience.getByRole("tab",{name:"Funding plan",exact:true}).getAttribute("aria-selected"),"true");
    await home();
    await audience.locator('.sidebar [data-page="cases"]').click();
    await audience.locator('[data-filter="Ready for decision"]').click();
    assert.equal(await audience.locator('#case-results tbody tr').count(),1);
    assert.match(await audience.locator('#case-results').textContent(),/Depok Starter Home/);
    await audience.locator('[data-filter="Unresolved conditions"]').click();
    assert.equal(await audience.locator('#case-results tbody tr').count(),3);
    assert.doesNotMatch(await audience.locator('#case-results').textContent(),/Bintaro Courtyard|Depok Starter Home/);
    await home();
    // A certified current claim enters the lender queue; a stale one leaves it.
    await audience.evaluate(() => {
      const c=store.cases.find(c=>c.id==="RC-025");
      c.claim.status="Certified"; c.claim.items[0].certified=20000000; c.claim.items[1].certified=32000000;
      render();
    });
    assert.equal(await audience.locator('.action-list [data-case="RC-025"]').count(),1);
    assert.match(await audience.locator('.action-list [data-case="RC-025"]').textContent(),/Authorize certified work/);
    await audience.locator('.action-list [data-case="RC-025"]').click();
    assert.equal(await audience.getByRole("button",{name:"Record demo authorization",exact:true}).isEnabled(),true);
    await audience.evaluate(() => { activeCase().version++; navigate("overview"); });
    assert.equal(await audience.locator('.action-list [data-case="RC-025"]').count(),0);
    await audience.evaluate(() => openCase("RC-025","changes"));
    await switchAudience("owner");
    assert.equal(await audience.evaluate(() => ui.page),"overview");
    assert.equal(await audience.locator('.owner-hero h2').textContent(),"Bekasi Family Home");
    for (const width of [320,390,768,1440]) {
      await audience.setViewportSize({width,height:900});
      for (const roleId of ["owner","reviewer","lender"]) {
        await audience.evaluate(roleId=>{ui.role=roleId;ui.page="overview";render()},roleId);
        assert.equal(await audience.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${roleId} dashboard overflows at ${width}`);
      }
    }
    console.log("PASS: distinct audience dashboards, scoped homeowner views, consent updates, readiness queues and responsive layouts");
    assert.deepEqual(errors, []);
    await audience.close();
    const passportContext = await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:"reduce"});
    const passport = await passportContext.newPage();
    passport.on("pageerror",e=>errors.push(e.message));
    await passport.goto(base+prefix);
    const passportRole = async id => {
      await passport.locator(".workspace-context .perspective").click();
      await passport.locator(`.modal [data-role="${id}"]`).click();
      await passport.locator('.sidebar [data-page="passport"]').click();
    };
    await passportRole("owner");
    assert.equal(await passport.locator("#passport-case").count(),0);
    assert.match(await passport.locator(".passport-cover").textContent(),/RP-RC-026/);
    assert.equal(await passport.locator(".passport-cover .badge.clay").textContent(),"Review incomplete");
    assert.doesNotMatch(await passport.locator("#main-content").textContent(),/Bintaro Courtyard/);
    await passport.getByRole("button",{name:"Edit property facts",exact:true}).click();
    await passport.locator('[name="address"]').fill("Jl. Contoh 10, Bekasi");
    await passport.locator('[name="buildingArea"]').fill("97.5");
    await passport.locator('[name="yearBuilt"]').fill("2002");
    await passport.locator('[name="source"]').fill("Fictional homeowner property brief");
    await passport.getByRole("button",{name:"Save reported property facts",exact:true}).click();
    assert.match(await passport.locator(".passport-facts").textContent(),/Jl. Contoh 10, Bekasi/);
    assert.match(await passport.locator(".passport-facts").textContent(),/97.5 m²/);
    await passport.locator('[data-passport-section="care"]').click();
    assert.equal(await passport.evaluate(()=>document.activeElement.id),"passport-care");
    await passport.getByRole("button",{name:"Add care record",exact:true}).click();
    await passport.locator('[name="title"]').fill("Wet area <warranty>");
    await passport.locator('[name="recordDate"]').fill("2026-10-17");
    await passport.locator('[name="dueDate"]').fill("2025-10-17");
    await passport.locator('[name="source"]').fill("DEMO-WARRANTY-01");
    await passport.locator('[name="detail"]').fill("PRIVATE CARE DETAIL owner@example.test");
    await passport.getByRole("button",{name:"Save reported record",exact:true}).click();
    assert.match(await passport.locator(".form-error").textContent(),/on or after/);
    assert.equal(await passport.evaluate(()=>activeCase().passportRecords?.length||0),0);
    await passport.locator('[name="dueDate"]').fill("2027-10-17");
    await passport.getByRole("button",{name:"Save reported record",exact:true}).click();
    assert.match(await passport.locator(".passport-care-list").textContent(),/Wet area <warranty>.*Reported/);
    assert.equal(await passport.locator(".passport-care-list warranty").count(),0);
    await passport.reload();
    await passportRole("reviewer");
    assert.equal(await passport.evaluate(()=>activeCase().passportRecords.length),1);
    await passport.locator('[data-passport-record]').click();
    await passport.locator('[name="status"]').selectOption("Needs correction");
    await passport.locator('[name="note"]').fill("Provide the revised warranty source reference.");
    await passport.getByRole("button",{name:"Save care record review",exact:true}).click();
    await passportRole("owner");
    await passport.locator('[data-passport-record]').click();
    assert.equal(await passport.getByRole("button",{name:"Save care record review",exact:true}).count(),0);
    await passport.getByRole("button",{name:"Amend reported record",exact:true}).click();
    await passport.locator('[name="source"]').fill("DEMO-WARRANTY-01-REV2");
    await passport.getByRole("button",{name:"Save reported record",exact:true}).click();
    assert.equal(await passport.evaluate(()=>activeCase().passportRecords[0].status),"Reported");
    assert.equal(await passport.evaluate(()=>activeCase().passportRecords[0].revisions[0].status),"Needs correction");
    assert.equal(await passport.evaluate(()=>activeCase().passportRecords.length),1);
    await passportRole("reviewer");
    await passport.locator('[data-passport-record]').click();
    await passport.locator('[name="note"]').fill("Demo source and coverage reviewed. Not independent verification.");
    await passport.getByRole("button",{name:"Save care record review",exact:true}).click();
    assert.match(await passport.locator(".passport-care-list").textContent(),/Reviewer accepted/);
    assert.equal(await passport.evaluate(()=>activeCase().version),2);
    assert.equal(await passport.evaluate(()=>activeCase().status),"Budget review");
    const snapshots=await passport.evaluate(()=>({summary:rcPassportData(activeCase()),full:rcPassportData(activeCase(),"financing")}));
    assert.equal(snapshots.summary.schema,"RC-PASSPORT/1.0");
    assert.equal(snapshots.summary.property.address,"Jl. Contoh 10, Bekasi");
    assert.equal(snapshots.summary.property.factsStatus,"Reported, not verified");
    assert.equal(snapshots.summary.budgetVersions[0].knownCost,270000000);
    assert.equal(snapshots.summary.review.budgetReviewed,false);
    assert.equal(snapshots.summary.review.openEvidence.length,4);
    assert.equal("owner" in snapshots.summary,false);
    assert.equal("funding" in snapshots.summary,false);
    assert.equal("history" in snapshots.summary,false);
    assert.equal("detail" in snapshots.summary.careRecords[0],false);
    assert.doesNotMatch(JSON.stringify(snapshots.summary),/Nadia Pratama|PRIVATE CARE DETAIL|owner@example/);
    assert.equal(snapshots.full.owner,"Nadia Pratama");
    assert.equal(snapshots.full.funding.gap,240000000);
    assert.equal(snapshots.full.careRecords[0].detail,"PRIVATE CARE DETAIL owner@example.test");
    assert.equal(snapshots.full.careRecords[0].reviewedBy,"Dewi Anggraini");
    assert.equal(snapshots.full.careRecords[0].source,"DEMO-WARRANTY-01-REV2");
    assert.equal(snapshots.full.careRecords[0].revisions[0].source,"DEMO-WARRANTY-01");
    await passport.getByRole("button",{name:"Export passport",exact:true}).click();
    const passportDownload=passport.waitForEvent("download");
    await passport.getByRole("button",{name:"Download passport JSON",exact:false}).click();
    const exported=await passportDownload;
    assert.match(exported.suggestedFilename(),/RP-RC-026-v2-property\.json/);
    const exportedData=JSON.parse(await fs.readFile(await exported.path(),"utf8"));
    assert.equal(exportedData.profile,"property");
    assert.equal(exportedData.careRecords[0].status,"Reviewer accepted");
    const passportPopup=passport.waitForEvent("popup");
    await passport.getByRole("button",{name:"Print / save passport as PDF",exact:false}).click();
    const readable=await passportPopup;
    await readable.waitForLoadState();
    assert.match(await readable.locator("body").textContent(),/Renovation Passport/);
    assert.match(await readable.locator("body").textContent(),/Wet area <warranty>/);
    assert.doesNotMatch(await readable.locator("body").textContent(),/Nadia Pratama|PRIVATE CARE DETAIL/);
    await readable.close();
    await passport.locator('#passport-profile').selectOption("financing");
    const privateDownload=passport.waitForEvent("download");
    await passport.getByRole("button",{name:"Download passport JSON",exact:false}).click();
    const privateData=JSON.parse(await fs.readFile(await (await privateDownload).path(),"utf8"));
    assert.equal(privateData.funding.ownerCash,30000000);
    await passport.keyboard.press("Escape");
    // A frozen passport cannot silently change when the source case changes.
    assert.equal(await passport.evaluate(()=>{const c=activeCase(),p=rcPassportData(c);rcInvalidate(c);return p.review.budgetVersion===2&&c.version===3&&rcPassportData(c).budgetVersions.length===2}),true);
    await passportRole("lender");
    assert.equal(await passport.getByRole("button",{name:"Edit property facts",exact:true}).count(),0);
    assert.equal(await passport.getByRole("button",{name:"Add care record",exact:true}).count(),0);
    await passport.locator('[data-passport-record]').click();
    assert.equal(await passport.getByRole("button",{name:"Save care record review",exact:true}).count(),0);
    await passport.keyboard.press("Escape");
    await passport.locator('#passport-case').selectOption('RC-025');
    assert.match(await passport.locator('.passport-cover').textContent(),/Bintaro Courtyard/);
    assert.equal(await passport.evaluate(()=>rcPassportData(activeCase(),"financing").claim.id),"CL-012");
    await passportRole("owner");
    assert.match(await passport.locator('.passport-cover').textContent(),/Bekasi Family Home/);
    for (const width of [320,390,768,1024,1440]) {
      await passport.setViewportSize({width,height:900});
      assert.equal(await passport.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Passport overflows at ${width}`);
    }
    await passportContext.close();
    assert.deepEqual(errors,[]);
    console.log("PASS: property-scoped passports, persistent aftercare and reviewer states, private export profiles, frozen snapshots and printable record");
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
