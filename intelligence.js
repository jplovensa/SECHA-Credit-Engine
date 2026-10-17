"use strict";
// RenovaCredit RC-1: an explainable prototype model, not a validated credit model.
const renovaDefaultPolicy = {
  interest: 12,
  maxLtv: 80,
  maxDsr: 60,
  minScore: 65,
  version: 1,
};
const renovaAudiences = {
  bank: {
    label: "Bank",
    headline: "See the property. Understand the possibility.",
    description:
      "An intelligence workspace for renovation and secondary-property finance.",
  },
  homeowner: {
    label: "Homeowner",
    headline: "A better home starts with a clearer plan.",
    description:
      "Understand your renovation budget, financing capacity, and next steps.",
  },
  investor: {
    label: "Property investor",
    headline: "Find the upside. Understand the downside.",
    description:
      "Test renovation economics, rental returns, and the cost of uncertainty.",
  },
  institution: {
    label: "Financial institution",
    headline: "One framework. A more informed portfolio.",
    description:
      "Bring property, borrower, and renovation risk into one decision framework.",
  },
};
const renovaEvidence = [
  ["identity", "KTP & borrower identity", "Identity review"],
  ["title", "SHM / SHGB & encumbrances", "Legal due diligence"],
  ["rab", "RAB & scope of work", "Budget review"],
  ["contractor", "Contractor & execution plan", "Execution review"],
  ["permit", "PBG / permit applicability", "Permit applicability review"],
  ["valuation", "Independent valuation", "KJPP / appraiser review"],
  ["slik", "Credit obligations & SLIK review", "Authorized lender review"],
];
const renovaRAB = [
  ["Structure & civil", 0.3],
  ["MEP & utilities", 0.22],
  ["Finishes & interiors", 0.28],
  ["Design & supervision", 0.12],
  ["Site & external works", 0.08],
];
function propertyDefaults(a, index = 0, sample = false) {
  return {
    purpose:
      index % 3 === 0
        ? "Renovate to sell"
        : index % 3 === 1
          ? "Renovate to rent"
          : "Own use",
    title: index === 2 ? "SHGB" : "SHM",
    area: 120 + index * 15,
    currentValue: Math.round(a.value * 0.67),
    renovation: Math.round(a.value * 0.16),
    contingency: 12,
    fees: Math.round(a.value * 0.02),
    monthlyRent: Math.round(a.value * 0.008),
    occupancy: 90,
    opex: 20,
    duration: 6,
    marketDiscount: 10,
    costOverrun: 15,
    evidence: Object.fromEntries(
      renovaEvidence.map(([k]) => [
        k,
        sample && !(a.status === "Pending docs" && k === "contractor"),
      ]),
    ),
    source: sample
      ? "Illustrative sample assumptions"
      : "Unverified planning assumptions",
    revision: 1,
  };
}
function isLender() {
  return ["bank", "institution"].includes(state.audience);
}
function setAudience(value) {
  if (!renovaAudiences[value]) return;
  state.audience = value;
  state.role = value === "homeowner" ? "borrower" : "bank";
  navigate(value === "homeowner" ? "borrower" : "dashboard");
}
function audienceBar() {
  return `<div class="audience-bar"><div class="country-context"><span class="flag-id" aria-hidden="true"></span>INDONESIA <span class="context-separator">/</span><span>Renovation intelligence</span></div><div class="audience-tabs" role="group" aria-label="Workspace perspective">${Object.entries(
    renovaAudiences,
  )
    .map(
      ([id, a]) =>
        `<button data-audience="${id}" aria-pressed="${state.audience === id}" class="${state.audience === id ? "active" : ""}">${a.label}</button>`,
    )
    .join("")}</div></div>`;
}
function intelligenceProject() {
  return (
    data.apps.find((a) => a.id === state.intelligenceProject) || data.apps[0]
  );
}
function propertySelect() {
  return `<select id="intelligence-select" class="inline-search" aria-label="Choose property">${data.apps.map((a) => `<option value="${escapeHTML(a.id)}" ${a.id === intelligenceProject().id ? "selected" : ""}>${escapeHTML(a.name)}</option>`).join("")}</select>`;
}
function propertyAnalysis(a) {
  const p = a.property;
  const credit = assess(a);
  const costReserve = (p.renovation * p.contingency) / 100;
  const totalCost = p.currentValue + p.renovation + costReserve + p.fees;
  const surplus = a.value - totalCost;
  const margin = (surplus / totalCost) * 100;
  const netRent =
    ((p.monthlyRent * 12 * p.occupancy) / 100) * (1 - p.opex / 100);
  const yieldRate = (netRent / totalCost) * 100;
  const dscr = credit.payment > 0 ? netRent / (credit.payment * 12) : 0;
  const stressedCost = totalCost + (p.renovation * p.costOverrun) / 100;
  const stressedValue = a.value * (1 - p.marketDiscount / 100);
  const stressedSurplus = stressedValue - stressedCost;
  const stressRate = (data.policy.interest + 2) / 1200;
  const stressPayment =
    (a.amount * stressRate) / (1 - Math.pow(1 + stressRate, -a.months));
  const stressDsr = ((a.debt + stressPayment) / a.income) * 100;
  const covered = renovaEvidence.filter(([k]) => p.evidence[k]).length;
  const coverage = (covered / renovaEvidence.length) * 100;
  const clamp = (n) => Math.max(0, Math.min(100, n));
  const factors = [
    {
      label: "Borrower affordability",
      score: credit.affordability,
      weight: 25,
      detail: `${credit.dsr.toFixed(1)}% debt service ratio`,
    },
    {
      label: "Collateral coverage",
      score: credit.collateral,
      weight: 25,
      detail: `${credit.ltv.toFixed(1)}% post-renovation LTV`,
    },
    {
      label: "Execution resilience",
      score: clamp(a.contractor - Math.max(0, p.costOverrun - p.contingency)),
      weight: 20,
      detail: `${p.contingency}% contingency vs ${p.costOverrun}% stress`,
    },
    {
      label: "Value creation",
      score: clamp((margin + 10) * 3),
      weight: 15,
      detail: `${margin.toFixed(1)}% modeled margin on total cost`,
    },
    {
      label: "Evidence coverage",
      score: coverage,
      weight: 15,
      detail: `${covered}/${renovaEvidence.length} demo checks recorded`,
    },
  ];
  const score = Math.round(
    factors.reduce((s, f) => s + (f.score * f.weight) / 100, 0),
  );
  const findings = [];
  if (credit.ltv > data.policy.maxLtv)
    findings.push({
      level: "risk",
      title: "Collateral exceeds lender policy",
      text: `LTV is ${credit.ltv.toFixed(1)}%, above the ${data.policy.maxLtv}% policy cap. Lower debt or independently substantiate value.`,
    });
  if (credit.dsr > data.policy.maxDsr)
    findings.push({
      level: "risk",
      title: "Repayment capacity needs attention",
      text: `Debt service is ${credit.dsr.toFixed(1)}% of income. Reduce financing or verify additional sustainable income.`,
    });
  if (stressedSurplus < 0)
    findings.push({
      level: "risk",
      title: "The downside erodes the value buffer",
      text: `A ${p.marketDiscount}% value haircut and ${p.costOverrun}% RAB overrun produce a ${money(Math.abs(stressedSurplus))} modeled loss before holding and sale costs.`,
    });
  else
    findings.push({
      level: "good",
      title: "Positive value buffer under the selected stress",
      text: `${money(stressedSurplus)} remains after the modeled value haircut and cost overrun, before holding and sale costs.`,
    });
  if (p.purpose === "Renovate to rent" && dscr < 1.2)
    findings.push({
      level: "risk",
      title: "Rental income offers limited debt coverage",
      text: `Modeled net rental DSCR is ${dscr.toFixed(2)}×. A 1.20× planning benchmark is illustrative, not an Indonesian regulatory standard.`,
    });
  if (covered < renovaEvidence.length)
    findings.push({
      level: "watch",
      title: `${renovaEvidence.length - covered} evidence checks remain`,
      text: "Complete identity, title, RAB, contractor, permit applicability, valuation, and authorized credit review before a lender decision.",
    });
  if (stressDsr > data.policy.maxDsr)
    findings.push({
      level: "watch",
      title: "Interest-rate sensitivity",
      text: `At ${data.policy.interest + 2}% interest, debt service rises to ${stressDsr.toFixed(1)}%, above the current policy threshold.`,
    });
  return {
    ...credit,
    totalCost,
    costReserve,
    surplus,
    margin,
    netRent,
    yieldRate,
    dscr,
    stressedCost,
    stressedValue,
    stressedSurplus,
    stressPayment,
    stressDsr,
    covered,
    coverage,
    factors,
    renovaScore: score,
    findings,
  };
}
function approvalReasons(a) {
  const r = assess(a),
    reasons = [];
  if (
    a.status === "Pending docs" ||
    renovaEvidence.some(([k]) => !a.property.evidence[k])
  )
    reasons.push("Complete all demo evidence checks");
  if (r.ltv > data.policy.maxLtv)
    reasons.push(`LTV exceeds ${data.policy.maxLtv}%`);
  if (r.dsr > data.policy.maxDsr)
    reasons.push(`Debt service exceeds ${data.policy.maxDsr}%`);
  if (r.score < data.policy.minScore)
    reasons.push(`Credit score below ${data.policy.minScore}`);
  return reasons;
}
function intelligenceHero() {
  const a = intelligenceProject(),
    r = propertyAnalysis(a);
  const loanGap = Math.max(0, a.amount - r.loanCeiling);
  return `<section class="intelligence-hero"><div class="hero-main"><div class="hero-label"><span class="pulse-dot"></span>RENOVACREDIT INTELLIGENCE <span>RC–1 / EXPLAINABLE MODEL</span></div><h2>Potential, with perspective.</h2><p>Connect the value of a property with the reality of its renovation.</p><div class="hero-project"><div class="hero-building">${icon("building", 21)}</div><div><strong>${escapeHTML(a.name)}</strong><span>${escapeHTML(a.location)} · ${escapeHTML(a.property.purpose)}</span></div><button data-action="intelligence" aria-label="Explore property intelligence">${icon("up", 22)}</button></div><div class="hero-bottom"><span>${icon("shield", 13)}${r.covered}/7 demo evidence checks</span><span>${icon("clock", 13)}${a.property.duration}-month renovation plan</span></div></div><div class="hero-score"><div class="orbit-score"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="49" fill="none" stroke="#ffffff18" stroke-width="5"/><circle cx="60" cy="60" r="49" fill="none" stroke="#decebf" stroke-width="5" stroke-dasharray="${r.renovaScore * 3.079} 307.9" stroke-linecap="round" transform="rotate(-90 60 60)"/></svg><div><strong>${r.renovaScore}</strong><small>RENOVASCORE</small></div></div><div class="hero-score-detail"><span>5 dimensions. One decision brief.</span><strong>${r.covered === 7 ? "Evidence recorded" : "Evidence incomplete"} · ${r.decision === "Outside policy" ? "Policy exception" : "Human review required"}</strong></div></div><div class="hero-stats"><div><span>Modeled value creation</span><strong>${money(r.surplus)} ${icon("up", 16)}</strong><small>${r.margin.toFixed(1)}% on total project cost</small></div><div><span>Policy-based loan ceiling</span><strong>${money(r.loanCeiling)}</strong><small>${loanGap > 0 ? `${money(loanGap)} above modeled capacity` : "Based on borrower & collateral inputs"}</small></div><button class="hero-cta" data-action="intelligence">Open decision brief ${icon("arrow", 15)}</button></div></section>`;
}
function intelligenceView() {
  const a = intelligenceProject(),
    p = a.property,
    r = propertyAnalysis(a);
  return `${heading("The whole property picture.", "A transparent decision brief for renovation, makeover, and secondary-property financing.", button("Export passport", "export-passport", "download") + button("Lending policy", "open-policy", "settings"))}<div class="property-context"><div class="flex gap"><div class="project-icon">${icon("building", 17)}</div><div><strong>${escapeHTML(a.name)}</strong><p class="sub">${escapeHTML(a.location)} · ${escapeHTML(p.title)} · ${p.area} m²</p></div></div>${propertySelect()}</div><div class="intelligence-tabs"><span class="active">Decision brief</span><button data-page="passport">Renovation passport ${icon("arrow", 12)}</button><span class="model-source">${escapeHTML(p.source)} · RC–1</span></div><div class="decision-metrics">${[
    [
      "Total project basis",
      money(r.totalCost),
      "Property + RAB + contingency + fees",
    ],
    [
      "Modeled value creation",
      money(r.surplus),
      `${r.margin.toFixed(1)}% return on total project cost`,
    ],
    [
      "Stressed value buffer",
      money(r.stressedSurplus),
      `${p.marketDiscount}% value haircut · ${p.costOverrun}% RAB overrun`,
    ],
    [
      "Net rental yield",
      `${r.yieldRate.toFixed(1)}%`,
      `${r.dscr.toFixed(2)}× rental debt coverage`,
    ],
  ]
    .map(
      ([l, v, d]) =>
        `<div class="panel decision-metric"><span>${l}</span><strong>${v}</strong><small>${d}</small></div>`,
    )
    .join(
      "",
    )}</div><div class="intelligence-layout"><div class="stack intelligence-column"><section class="panel form-panel"><div class="between"><div><h2>Renovation economics</h2><p class="sub">Edit the assumptions. See the trade-offs.</p></div><span class="model-pill">ALL AMOUNTS · IDR MILLION</span></div><form id="property-form" data-project="${a.id}"><div class="form-grid" style="margin-top:22px"><label class="field">Project objective<select name="purpose">${["Own use", "Renovate to sell", "Renovate to rent"].map((v) => `<option ${p.purpose === v ? "selected" : ""}>${v}</option>`).join("")}</select></label><label class="field">Title reported<select name="title">${["SHM", "SHGB", "AJB / other"].map((v) => `<option ${p.title === v ? "selected" : ""}>${v}</option>`).join("")}</select></label>${propertyField("Current value / acquisition basis", "currentValue", p.currentValue, 1)}${propertyField("Post-renovation value assumption", "afterValue", a.value, 1)}${propertyField("Renovation budget · RAB", "renovation", p.renovation, 1)}${propertyField("Planning fees / transaction costs", "fees", p.fees, 0)}${propertyField("Contingency reserve (%)", "contingency", p.contingency, 0, 50)}${propertyField("Renovated floor area (m²)", "area", p.area, 1)}${propertyField("Monthly gross rent", "monthlyRent", p.monthlyRent, 0)}${propertyField("Occupancy (%)", "occupancy", p.occupancy, 0, 100)}${propertyField("Operating cost ratio (%)", "opex", p.opex, 0, 100)}${propertyField("Renovation period (months)", "duration", p.duration, 1, 60)}</div><details class="stress-details" open><summary>${icon("layers", 14)}Downside assumptions</summary><div class="form-grid">${propertyField("Exit / valuation haircut (%)", "marketDiscount", p.marketDiscount, 0, 100)}${propertyField("Additional RAB overrun (%)", "costOverrun", p.costOverrun, 0, 100)}</div><p class="sub">Interest sensitivity uses +2 percentage points. Stressed cost adds the overrun to the baseline, including its existing contingency. Sale taxes, financing carry, selling costs, and vacancy timing are not modeled.</p></details><p class="form-help">Changing property or valuation assumptions sends a previously approved application back for review. These are manual planning inputs, not market valuations.</p><button type="submit" class="btn primary">${icon("refresh", 14)}Recalculate & save assumptions</button></form></section><section class="panel form-panel"><div class="between"><div><h2>RAB allocation</h2><p class="sub">Illustrative scope distribution · edit total budget above</p></div><strong>${money(p.renovation)}</strong></div><div class="rab-bar">${renovaRAB.map(([n, w], i) => `<i title="${n}: ${Math.round(w * 100)}%" style="width:${w * 100}%;background:${["#533125", "#8b7868", "#b3a69a", "#dbcab9", "#ede6dd"][i]}"></i>`).join("")}</div>${renovaRAB.map(([n, w], i) => `<div class="rab-row"><span><i style="background:${["#533125", "#8b7868", "#b3a69a", "#dbcab9", "#ede6dd"][i]}"></i>${n}</span><span>${(w * 100).toFixed(0)}%</span><strong>${money(p.renovation * w)}</strong></div>`).join("")}<p class="form-help">${money(p.renovation / p.area)} / m² modeled renovation cost. Allocation is a template, not a contractor quotation or regional cost benchmark.</p></section></div><div class="stack intelligence-column"><section class="panel renova-scorecard"><div class="between"><span class="eyebrow">RENOVASCORE</span><span class="model-pill">RC–1 · PLANNING</span></div><div class="scorecard-value">${r.renovaScore}<span>/ 100</span></div><p>Explainable renovation readiness</p>${r.factors.map((f) => `<div class="factor"><div class="factor-label"><span>${f.label}</span><strong>${Math.round(f.score)} <small>· ${f.weight}%</small></strong></div><div class="progress-track"><i style="width:${f.score}%"></i></div><small class="factor-explanation">${f.detail}</small></div>`).join("")}<div class="scorecard-foot">This composite is a planning index, not a probability of default. Credit eligibility uses separate lender policy and evidence gates.</div></section><section class="panel form-panel"><h2>What the numbers are telling you</h2><p class="sub" style="margin-top:5px">Deterministic findings from these inputs</p>${r.findings.map((f) => `<div class="finding ${f.level}"><span>${icon(f.level === "good" ? "check" : f.level === "risk" ? "alert" : "info", 15)}</span><div><strong>${f.title}</strong><p>${f.text}</p></div></div>`).join("")}</section><section class="policy-mini"><div class="between"><h3>Financing capacity</h3>${icon("shield", 17)}</div><strong class="capacity-value">${money(r.loanCeiling)}</strong><p>Lower of collateral capacity and income-supported debt capacity.</p><dl class="capacity-detail"><div><dt>Requested loan</dt><dd>${money(a.amount)}</dd></div><div><dt>Base monthly installment</dt><dd>${money(r.payment)}</dd></div><div><dt>+2pp stressed installment</dt><dd>${money(r.stressPayment)}</dd></div></dl><button class="text-btn" data-page="engine">Explore borrower affordability ${icon("arrow", 13)}</button></section></div></div>`;
}
function propertyField(label, name, value, min = 0, max = 10000000) {
  return field(
    label,
    name,
    value,
    "number",
    `min="${min}" max="${max}" step="0.1"`,
  );
}
function passportView() {
  const a = intelligenceProject(),
    p = a.property,
    r = propertyAnalysis(a);
  return `${heading("One property. A shared language.", "A proposed Renovation Passport for consistent handoffs between owners, investors, and lenders.", button("Download passport JSON", "export-passport", "download", true))}<div class="property-context"><div><h2>${escapeHTML(a.name)}</h2><p class="sub">${escapeHTML(a.id)} · Passport revision ${p.revision} · ${escapeHTML(a.location)}</p></div>${propertySelect()}</div><div class="passport-layout"><section class="panel passport-sheet"><div class="passport-top"><div><span class="eyebrow">RENOVACREDIT / INDONESIA</span><h2>Renovation Passport</h2><p>PROPERTY · PROJECT · FINANCING · EVIDENCE</p></div><div class="passport-mark">${icon("building", 34)}</div></div><div class="passport-body"><dl class="detail-grid"><div><dt>Reported title</dt><dd>${escapeHTML(p.title)}</dd></div><div><dt>Renovated floor area</dt><dd>${p.area} m²</dd></div><div><dt>Project objective</dt><dd>${escapeHTML(p.purpose)}</dd></div><div><dt>RAB + contingency</dt><dd>${money(p.renovation + r.costReserve)}</dd></div><div><dt>After-renovation assumption</dt><dd>${money(a.value)}</dd></div><div><dt>Requested financing</dt><dd>${money(a.amount)}</dd></div></dl><div class="passport-score"><div><span>RenovaScore · RC–1</span><strong>${r.renovaScore}<small>/100</small></strong></div><div><span>Credit policy result</span><strong style="font-size:16px">${r.decision}</strong></div><div><span>Demo evidence coverage</span><strong>${r.covered}<small>/7</small></strong></div></div><h3 style="margin-top:26px">Evidence & due diligence</h3>${renovaEvidence.map(([k, label, source]) => `<div class="document-row"><span class="project-icon">${icon("file", 14)}</span><div>${label}<p class="sub">${source} · ${p.evidence[k] ? "Locally recorded demo check" : "Not recorded"}</p></div><span class="badge ${p.evidence[k] ? "approved" : "pending"}">${p.evidence[k] ? "Demo checked" : "Required"}</span></div>`).join("")}<button class="btn" style="margin-top:20px" data-docs="${a.id}">${icon("file", 14)}Review demo evidence</button></div><div class="passport-footer">RC-PASSPORT / 1.0 · Prototype proposal · Not a title certificate, appraisal, bank approval, or adopted industry standard.</div></section><div class="stack intelligence-column"><section class="panel form-panel"><h2>Designed for a better handoff.</h2><p class="sub" style="margin-top:10px">A structured, portable record of the property, financing assumptions, scope, evidence coverage, and decision rationale.</p>${[
    [
      "Bank & financial institution",
      "Review policy gates, borrower affordability, and recorded evidence.",
    ],
    [
      "Homeowner",
      "Understand the planned budget, financing capacity, and documentation gaps.",
    ],
    [
      "Property investor",
      "Compare value creation, rental yield, and downside sensitivity.",
    ],
  ]
    .map(
      ([t, d]) =>
        `<div class="finding"><span>${icon("check", 14)}</span><div><strong>${t}</strong><p>${d}</p></div></div>`,
    )
    .join(
      "",
    )}</section><section class="notice"><strong>Source & provenance</strong><br>${escapeHTML(p.source)}. Evidence marks are local reviewer simulations. SLIK, land registry, KJPP, permit systems, and bank services are not connected. A lender must independently verify documents and obtain all necessary permissions.</section><section class="panel form-panel"><h2>Decision snapshot</h2><p class="sub" style="margin-top:10px">${a.decidedAt ? `${escapeHTML(a.status)} · ${new Date(a.decidedAt).toLocaleDateString("en-GB")} · policy v${a.decisionPolicy?.version || 1}` : "No new lender decision recorded for this property."}</p>${a.note ? `<div class="notice" style="margin-top:15px">${escapeHTML(a.note)}</div>` : ""}<button class="text-btn" style="margin-top:15px" data-review="${a.id}">Open application review ${icon("arrow", 13)}</button></section></div></div>`;
}
function exportPassport() {
  const a = intelligenceProject(),
    p = a.property;
  const payload = {
    schema: "RC-PASSPORT/1.0",
    product: "RenovaCredit by SECHA",
    exportedAt: today(),
    currency: "IDR",
    amountUnit: "million",
    prototype: true,
    source: p.source,
    property: { applicationId: a.id, name: a.name, location: a.location, ...p },
    financing: {
      amount: a.amount,
      afterRenovationValue: a.value,
      monthlyIncome: a.income,
      monthlyDebt: a.debt,
      tenorMonths: a.months,
      contractorScore: a.contractor,
    },
    model: {
      name: "RC-1",
      type: "deterministic planning index",
      policy: { ...data.policy },
      analysis: propertyAnalysis(a),
    },
    decision: {
      status: a.status,
      note: a.note || null,
      at: a.decidedAt || null,
      policySnapshot: a.decisionPolicy || null,
      assessmentSnapshot: a.decisionAssessment || null,
      previousDecision: a.previousDecision || null,
    },
    milestones: data.milestones.filter((m) => m.project === a.id),
    limitations: [
      "Manual and sample inputs, not an independent valuation",
      "Demo evidence checks are not verified source documents",
      "No credit bureau, registry, bank, or payment connection",
      "Not an adopted Indonesian regulatory or industry standard",
    ],
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `renovacredit-passport-${a.id}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Renovation Passport exported with assumptions and policy snapshot.");
}
function policyView() {
  return `${heading("Your institution. Your lending policy.", "Configure the demo credit gates applied to every new reviewer decision.")}<div class="risk-layout"><form class="panel form-panel" id="policy-form"><div class="between"><h2>Policy configuration</h2><span class="model-pill">VERSION ${data.policy.version}</span></div><p class="sub" style="margin-top:8px">Illustrative lender policy. These are not Bank Indonesia or OJK thresholds.</p><div class="form-grid">${propertyField("Annual interest rate (%)", "interest", data.policy.interest, 0, 50)}${propertyField("Maximum post-renovation LTV (%)", "maxLtv", data.policy.maxLtv, 1, 100)}${propertyField("Maximum debt service ratio (%)", "maxDsr", data.policy.maxDsr, 1, 100)}${propertyField("Minimum credit score", "minScore", data.policy.minScore, 0, 100)}</div><div class="decision-callout">Approval is blocked when evidence is incomplete or a policy gate fails. RenovaScore remains an advisory planning index. Policy changes affect new decisions; previously recorded decisions retain their policy snapshots.</div><button class="btn primary" style="margin-top:20px" type="submit" ${!isLender() ? "disabled" : ""}>${icon("shield", 14)}Save lending policy</button>${!isLender() ? '<p class="form-help">Choose Bank or Financial institution to configure policy.</p>' : ""}</form><section class="panel form-panel"><h2>Integration readiness</h2><p class="sub">Services a production deployment would need.</p>${[
    [
      "SLIK / credit obligations",
      "Authorized lender access & borrower consent",
    ],
    ["ATR/BPN / legal title", "Authorized title & encumbrance verification"],
    ["KJPP / valuation", "Independent appraisal and comparables"],
    ["PBG / permit applicability", "Project-specific legal and permit review"],
    [
      "Bank / disbursement",
      "Bank integration, approval controls & reconciliation",
    ],
  ]
    .map(
      ([l, d]) =>
        `<div class="integration-row"><div><strong>${l}</strong><p>${d}</p></div><span class="badge pending">Not connected</span></div>`,
    )
    .join(
      "",
    )}<p class="form-help">No connection, certification, regulatory endorsement, or production readiness is implied.</p></section></div>`;
}
function documentReview(id) {
  const a = data.apps.find((x) => x.id === id);
  if (!a) return;
  openModal(
    "Demo evidence review",
    `<p class="sub">${escapeHTML(a.name)} · Passport revision ${a.property.revision}</p><div class="notice" style="margin-top:18px">This simulates a completed reviewer checklist. It does not upload, verify, or authenticate source documents. All seven checks are required for demo approval.</div><form id="documents-form" data-project="${a.id}">${renovaEvidence.map(([k, l]) => `<label class="document-row"><input type="checkbox" name="${k}" ${a.property.evidence[k] ? "checked" : ""}>${l}</label>`).join("")}<button type="submit" class="btn primary" style="margin-top:22px">Save demo evidence checks</button></form>`,
  );
}
// Extend the existing event system without introducing external runtime dependencies.
document.addEventListener("click", (e) => {
  const el = e.target.closest("button");
  if (!el) return;
  if (el.dataset.audience) setAudience(el.dataset.audience);
  if (el.dataset.action === "open-policy") navigate("policy");
});
document.addEventListener("change", (e) => {
  if (e.target.id === "intelligence-select") {
    state.intelligenceProject = e.target.value;
    render();
  }
});
document.addEventListener("submit", (e) => {
  const form = e.target;
  if (!["property-form", "policy-form", "documents-form"].includes(form.id))
    return;
  e.preventDefault();
  const f = new FormData(form);
  if (form.id === "property-form") {
    const a = data.apps.find((x) => x.id === form.dataset.project);
    const p = a.property;
    const previous = { ...p };
    const previousValue = a.value;
    for (const key of [
      "area",
      "currentValue",
      "renovation",
      "fees",
      "contingency",
      "monthlyRent",
      "occupancy",
      "opex",
      "duration",
      "marketDiscount",
      "costOverrun",
    ])
      p[key] = Number(f.get(key));
    p.purpose = String(f.get("purpose"));
    p.title = String(f.get("title"));
    a.value = Number(f.get("afterValue"));
    p.revision++;
    p.updatedAt = today();
    p.source = "User-entered planning assumptions";
    if (previousValue !== a.value || previous.currentValue !== p.currentValue)
      p.evidence.valuation = false;
    if (
      ["renovation", "fees", "contingency", "area"].some(
        (k) => previous[k] !== p[k],
      )
    )
      p.evidence.rab = false;
    if (previous.title !== p.title) p.evidence.title = false;
    if (previous.purpose !== p.purpose || previous.duration !== p.duration) {
      p.evidence.permit = false;
      p.evidence.contractor = false;
    }
    if (a.status === "Approved") {
      a.status = "In review";
      a.previousDecision = {
        at: a.decidedAt,
        policy: a.decisionPolicy,
        note: a.note,
      };
      delete a.decidedAt;
      delete a.decisionPolicy;
      delete a.decisionAssessment;
      a.note = "";
    }
    a.score = assess(a).score;
    record("Property assumptions recalculated", a.name);
    render();
    toast("Assumptions saved. Review the updated decision brief.");
  } else if (form.id === "policy-form") {
    if (!isLender()) {
      toast("A lender workspace is required.");
      return;
    }
    data.policy = {
      interest: Number(f.get("interest")),
      maxLtv: Number(f.get("maxLtv")),
      maxDsr: Number(f.get("maxDsr")),
      minScore: Number(f.get("minScore")),
      version: data.policy.version + 1,
    };
    data.apps.forEach((a) => (a.score = assess(a).score));
    record("Lending policy updated", `Policy v${data.policy.version}`);
    render();
    toast("Lending policy saved. New reviews use this version.");
  } else {
    const a = data.apps.find((x) => x.id === form.dataset.project);
    for (const [k] of renovaEvidence) a.property.evidence[k] = f.has(k);
    a.property.revision++;
    if (
      a.status === "Pending docs" &&
      renovaEvidence.every(([k]) => a.property.evidence[k])
    )
      a.status = "In review";
    if (
      a.status === "Approved" &&
      renovaEvidence.some(([k]) => !a.property.evidence[k])
    ) {
      a.status = "In review";
      a.previousDecision = {
        at: a.decidedAt,
        policy: a.decisionPolicy,
        note: a.note,
      };
      delete a.decidedAt;
      delete a.decisionPolicy;
      delete a.decisionAssessment;
      a.note = "";
    }
    record("Demo evidence checklist updated", a.name);
    closeModal();
    render();
    review(a.id);
    toast("Demo checks saved locally. Source verification is not connected.");
  }
});
function opportunityComparison() {
  const apps = [...data.apps]
    .filter((a) => a.status !== "Rejected")
    .map((a) => ({ a, r: propertyAnalysis(a) }))
    .sort((x, y) => y.r.margin - x.r.margin)
    .slice(0, 4);
  return `<section class="panel comparison-panel"><div class="panel-header"><div><h2>Compare the potential</h2><p class="sub">Ranked by modeled margin, before financing carry and selling costs · not investment advice</p></div><span class="model-pill">INVESTOR PERSPECTIVE</span></div><div class="table-scroll"><table><thead><tr><th>Property</th><th>Modeled margin</th><th>Net rental yield</th><th>Stressed buffer</th><th>RenovaScore</th><th></th></tr></thead><tbody>${apps.map(({ a, r }) => `<tr><td><strong>${escapeHTML(a.name)}</strong><p class="sub" style="font-size:9px">${escapeHTML(a.location)}</p></td><td>${r.margin.toFixed(1)}%</td><td>${r.yieldRate.toFixed(1)}%</td><td>${money(r.stressedSurplus)}</td><td>${r.renovaScore}/100</td><td><button class="icon-button" data-inspect="${a.id}" aria-label="Inspect ${escapeHTML(a.name)}">${icon("arrow", 13)}</button></td></tr>`).join("")}</tbody></table></div></section>`;
}
function institutionSummary() {
  const out = data.apps.filter((a) => approvalReasons(a).length > 0).length;
  return `<section class="institution-summary"><div>${icon("shield", 21)}<div><strong>One policy framework across your pipeline</strong><p>Policy v${data.policy.version} · LTV ≤ ${data.policy.maxLtv}% · DSR ≤ ${data.policy.maxDsr}% · Credit score ≥ ${data.policy.minScore}</p></div></div><span>${out} applications with current review gates</span><button class="btn small" data-page="policy">Configure policy ${icon("arrow", 12)}</button></section>`;
}
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-inspect]");
  if (el) {
    state.intelligenceProject = el.dataset.inspect;
    navigate("intelligence");
  }
});
function pitchHero() {
  const a = intelligenceProject(),
    r = propertyAnalysis(a),
    uplift =
      ((a.value - a.property.currentValue) / a.property.currentValue) * 100;
  return `<section class="pitch-hero"><div class="pitch-intro"><div class="pitch-kicker"><i></i>RENOVATION INTELLIGENCE, REIMAGINED</div><h2>Good homes.<br>Great potential.</h2><p>A clearer path to unlocking the value<br class="desktop-break"> of Indonesia’s existing properties.</p><button class="btn primary" data-action="intelligence">Explore property intelligence ${icon("arrow", 16)}</button><div class="pitch-audience">For homeowners, investors & lending partners</div></div><div class="pitch-property"><div class="property-illustration"><svg viewBox="0 0 480 250" role="img" aria-label="Illustration of a tropical courtyard home"><defs><linearGradient id="wall" x1="0" x2="1"><stop stop-color="#f0dfc9"/><stop offset="1" stop-color="#e5c8ad"/></linearGradient></defs><circle cx="345" cy="62" r="34" fill="#e5b387" opacity=".45"/><path d="M0 226Q130 207 260 225T480 222V250H0Z" fill="#d6c6ab"/><path d="M100 230V100L230 53l130 47v130" fill="url(#wall)"/><path d="m83 104 147-54 147 54-5 12-142-48-142 48Z" fill="#b76850"/><path d="M230 68v162h130V115Z" fill="#d7b698"/><path d="M140 230v-74a31 31 0 0 1 62 0v74" fill="#98765a"/><path d="M149 230v-72a22 22 0 0 1 44 0v72" fill="#6e7a64"/><path d="M154 161h34M171 137v91" stroke="#c9b499" stroke-width="3"/><path d="M265 146h55v51h-55z" fill="#7d8972"/><path d="M292 146v51M265 171h55" stroke="#dcc5aa" stroke-width="3"/><path d="M69 233h313l21 8H50Z" fill="#bca78c"/><path d="M389 230q-7-78 12-151" stroke="#8e8e68" stroke-width="6" fill="none"/><path d="M401 81q-40-41-77-8 46-5 77 8m0 0q-9-57 29-64-19 29-29 64m0 0q37-37 72-13-35-2-72 13m0 0q29 1 49 38-31-18-49-38m0 0q-43 0-61 31 35-13 61-31" fill="#7d8d6b"/><path d="M46 232q15-56-9-81 2 44 9 81m0 0q0-48 30-61-10 38-30 61m0 0q-24-23-38-16 17 22 38 16" fill="#8d9b78"/><path d="M112 230q-9-30-23-35 0 24 23 35m0 0q-1-31 12-42 9 28-12 42" fill="#7e8a68"/></svg><span class="illustration-label">A VISION OF WHAT’S POSSIBLE</span><span class="pitch-score"><span>RenovaScore</span><strong>${r.renovaScore}<small>/100</small></strong>${icon("shield", 13)}</span></div><div class="featured-property"><div class="between"><div><span class="eyebrow">FEATURED DEMO PROPERTY</span><h3>${escapeHTML(a.name)}</h3><p>${escapeHTML(a.location)}</p></div><button class="icon-button" data-action="intelligence" aria-label="Open featured property">${icon("up", 18)}</button></div><div class="featured-values"><div><span>After-renovation value</span><strong>${money(a.value)}</strong></div><div><span>Potential value uplift</span><strong>${uplift >= 0 ? "+" : ""}${uplift.toFixed(1)}% ${icon("trend", 14)}</strong></div></div><small>Modeled from sample assumptions · Not an independent valuation</small></div></div></section>`;
}
function pitchMetrics() {
  const ready = data.apps.filter((a) => approvalReasons(a).length === 0).length;
  const approved = data.apps.filter((a) => a.status === "Approved");
  return `<section class="pitch-metrics" aria-label="Demo workspace summary">${[
    [
      "building",
      "Properties in workspace",
      String(data.apps.length).padStart(2, "0"),
      "Sample renovation projects",
    ],
    [
      "wallet",
      "Approved financing",
      money(approved.reduce((s, a) => s + a.amount, 0)),
      "Sample commitments, not platform traction",
    ],
    [
      "shield",
      "Ready for lender review",
      String(ready).padStart(2, "0"),
      "Current policy & demo evidence gates",
    ],
  ]
    .map(
      ([i, l, v, d]) =>
        `<div class="panel metric pitch-metric"><span class="pitch-metric-icon">${icon(i, 18)}</span><div><span>${l}</span><strong>${v}</strong><small>${d}</small></div></div>`,
    )
    .join("")}</section>`;
}
