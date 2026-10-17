"use strict";
const SHAPES = {
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  home: "m3 10 9-7 9 7 M5 9v12h14V9 M9 21v-7h6v7",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12V8z M14 2v6h6 M8 13h8 M8 17h5",
  layers: "m12 3 10 5-10 5L2 8z M2 12l10 5 10-5 M2 16l10 5 10-5",
  wallet: "M20 8V4H5a3 3 0 0 0 0 6h16v11H5a3 3 0 0 1-3-3V7 M21 13h-6v4h6",
  shield: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z m-4 9 3 3 5-6",
  search: "m21 21-5-5 M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4",
  arrow: "M4 12h16 M14 6l6 6-6 6",
  up: "M7 17 17 7 M7 7h10v10",
  down: "m7 10 5 5 5-5",
  right: "m9 5 7 7-7 7",
  left: "m15 5-7 7 7 7",
  plus: "M12 5v14 M5 12h14",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l3 2",
  check: "m5 12 4 4L19 6",
  alert: "m12 3 10 18H2z M12 9v5 M12 17h.01",
  close: "m6 6 12 12 M18 6 6 18",
  download: "M12 3v12 m-5-5 5 5 5-5 M4 17v4h16v-4",
  history: "M3 10a9 9 0 1 1 2 8 M3 4v6h6 M12 7v5l3 2",
  info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 11v6 M12 7h.01",
  menu: "M4 6h16 M4 12h16 M4 18h16",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M9 3h6l1 3 3 1 2 5-2 3-1 3-5 3-3-2-3-1-3-5 2-3z",
  leaf: "M20 3C8 2 2 8 6 15s16 4 14-12 M4 21 16 8",
  paperclip: "m8 13 7-7a3 3 0 0 1 4 4l-9 9a5 5 0 0 1-7-7l9-9",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12 M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  edit: "m16 3 5 5-13 13H3v-5z M14 5l5 5",
  calendar: "M4 5h16v16H4z M4 10h16 M8 3v4 M16 3v4",
  filter: "M3 5h18 M6 12h12 M10 19h4",
  link: "m10 13 4-4 M8 15l-2 2a3 3 0 0 1-4-4l5-5a3 3 0 0 1 4 0 M16 9l2-2a3 3 0 0 1 4 4l-5 5a3 3 0 0 1-4 0",
};
const ico = (n, s = 18) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${SHAPES[n] || SHAPES.file}"/></svg>`;
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
const compact = (n) =>
  `${n < 0 ? "−" : ""}Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(Math.abs(n) / 1000000)}<small> jt</small>`;
const shortMoney = (n) =>
  `Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(n / 1000000)} jt`;
const when = (t) =>
  new Date(t).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
let store = rcLoad();
let ui = {
  page: "overview",
  caseId: "RC-026",
  tab: "scope",
  role: "reviewer",
  query: "",
  filter: "All cases",
  menu: false,
  notifications: false,
  language: "en",
};
let opener = null,
  toastTimer,
  persistent = true;
const pages = {
  overview: "Overview",
  cases: "Cases",
  claims: "Claims & payments",
  evidence: "Evidence inbox",
  activity: "Activity",
  settings: "Workspace settings",
  case: "Case workspace",
};
function activeCase() {
  return store.cases.find((c) => c.id === ui.caseId) || store.cases[0];
}
function save() {
  try {
    localStorage.setItem(RC_STORE, JSON.stringify(store));
  } catch {
    persistent = false;
    notify("Storage unavailable. Changes will last for this session only.");
  }
}
function log(c, message, detail = "") {
  rcEvent(c, RC_ROLES[ui.role].name, message, detail);
  save();
}
function notify(text) {
  const el = document.querySelector("#toast");
  el.textContent = text;
  el.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("visible"), 4500);
}
function badge(text) {
  let kind = /accepted|active|ready|reviewed|reconciled|paid|complete/i.test(
    text,
  )
    ? "sage"
    : /missing|correction|stale|hold|disputed/i.test(text)
      ? "clay"
      : /awaiting|review|submitted|draft|received|pending|requested|conditional/i.test(
            text,
          )
        ? "sand"
        : "neutral";
  if (text === "Partially paid") kind = "sand";
  return `<span class="badge ${kind}"><i></i>${esc(text)}</span>`;
}
function btn(text, action, icon = "", primary = false, more = "") {
  return `<button class="btn ${primary ? "primary" : ""}" data-action="${action}" ${more}>${icon ? ico(icon, 15) : ""}${text}</button>`;
}
function navigate(page) {
  ui.page = page;
  ui.menu = false;
  ui.notifications = false;
  ui.query = "";
  render();
  window.scrollTo(0, 0);
}
function openCase(id, tab = "scope") {
  ui.caseId = id;
  ui.tab = tab;
  navigate("case");
  document.title = `${activeCase().name} · RenovaCredit`;
}
function heading(title, sub, actions = "") {
  return `<div class="heading"><div><div class="eyebrow">RENOVATION FINANCE WORKSPACE</div><h1>${title}</h1><p>${sub}</p></div><div class="heading-actions">${actions}</div></div>`;
}
function render() {
  const role = RC_ROLES[ui.role],
    pending = store.cases.reduce((s, c) => s + rcReadiness(c).docs.length, 0);
  document.querySelector("#app").innerHTML =
    `${ui.menu ? '<button class="scrim" data-action="menu" aria-label="Close navigation"></button>' : ""}<aside class="sidebar ${ui.menu ? "open" : ""}" aria-label="Main navigation"><a class="brand" href="#" data-page="overview"><img class="brand-lockup" src="assets/renovacredit-logo.svg" alt="RenovaCredit by SECHA"></a><div class="workspace-picker"><span class="workspace-symbol">${ico("home", 17)}</span><div><strong>Renovation workspace</strong><small>Jabodetabek · Demo</small></div></div><div class="nav-label">WORKSPACE</div><nav>${[
      ["overview", "grid"],
      ["cases", "layers"],
      ["claims", "wallet"],
      ["evidence", "file"],
      ["activity", "history"],
    ]
      .map(
        ([id, i]) =>
          `<button class="nav-item ${ui.page === id || (ui.page === "case" && id === "cases") ? "active" : ""}" data-page="${id}" ${ui.page === id ? 'aria-current="page"' : ""}>${ico(i)}${pages[id]}${id === "cases" ? `<span>${String(store.cases.length).padStart(2, "0")}</span>` : id === "evidence" ? `<span>${pending}</span>` : ""}</button>`,
      )
      .join(
        "",
      )}</nav><div class="sidebar-bottom"><div class="pilot-card"><span class="pilot-icon">${ico("leaf", 19)}</span><strong>A clearer way to renovate.</strong><button data-action="walkthrough">Take a quick tour ${ico("arrow", 13)}</button></div><button class="nav-item" data-page="settings">${ico("settings")}Workspace settings</button><button class="profile" data-action="perspective"><span class="avatar">${role.initials}</span><div><strong>${role.name}</strong><small>${role.label} · demo</small></div>${ico("down", 12)}</button></div></aside><div class="shell"><header class="topbar"><button class="icon-btn mobile-menu" data-action="menu" aria-label="Toggle navigation" aria-expanded="${ui.menu}">${ico("menu", 18)}</button><div class="breadcrumb">Workspace ${ico("right", 12)}<strong>${ui.page === "case" ? esc(activeCase().id) : pages[ui.page]}</strong><span class="demo-tag">INTERACTIVE DEMO</span></div><div class="top-actions"><label class="global-search">${ico("search", 15)}<input id="global-search" placeholder="Find a project…" aria-label="Find a project"><kbd>⌘ K</kbd></label><button class="icon-btn" data-action="notifications" aria-label="Workspace updates" aria-expanded="${ui.notifications}">${ico("bell", 17)}<i class="notification-dot"></i></button><button class="avatar small" data-action="perspective" aria-label="Change demo perspective">${role.initials}</button></div>${ui.notifications ? `<section class="notification-menu panel"><h3>Needs attention</h3><p>${pending} evidence records need review or correction.</p><button class="text-link" data-page="evidence">Open evidence inbox ${ico("arrow", 14)}</button></section>` : ""}</header><main id="main-content" tabindex="-1"><div class="workspace-context"><span class="country"><i></i>INDONESIA <b>/</b> Existing-home renovation</span><button class="perspective" data-action="perspective">${ico("eye", 13)}${role.label} view ${ico("down", 11)}</button></div>${view()}<footer><span>${ico("shield", 12)}Fictional cases · No bank connection or money movement</span><span><i></i>${persistent ? "Saved in this browser" : "Session only"}</span></footer></main></div>`;
}
function view() {
  if (ui.page === "case") return caseView();
  if (ui.page === "cases") return casesView();
  if (ui.page === "claims") return claimsView();
  if (ui.page === "evidence") return evidenceInbox();
  if (ui.page === "activity") return activityView();
  if (ui.page === "settings") return settingsView();
  return overview();
}
function stat(label, value, icon, note, variant = "") {
  return `<section class="stat panel ${variant}"><div class="stat-label">${label}<span>${ico(icon, 16)}</span></div><strong>${value}</strong><p>${note}</p></section>`;
}
function overview() {
  const attention = store.cases
    .filter((c) => c.next && c.status !== "Closed")
    .sort((a, b) => a.due.localeCompare(b.due));
  const evidence = store.cases.filter(
    (c) => rcReadiness(c).docs.length > 0,
  ).length;
  const gap = store.cases.reduce((s, c) => s + rcFinance(c).gap, 0);
  const claims = store.cases.filter(
    (c) => c.claim && c.claim.status !== "Reconciled",
  ).length;
  return `${heading(ui.role === "owner" ? "Your renovation, one step clearer." : "Your workspace, at a glance.", ui.role === "owner" ? "Know your budget, what to prepare, and what happens next." : "Keep renovation plans moving. Start with what needs you today.", btn("New case", "new-case", "plus", true))}<div class="summary-label"><span><i></i>WORKSPACE SNAPSHOT</span><small>Sample cases · amounts in IDR</small></div><div class="stats">${stat("Active cases", String(store.cases.length).padStart(2, "0"), "home", "Across one demo workspace")}${stat("Awaiting evidence", String(evidence).padStart(2, "0"), "file", "Cases with open evidence checks")}${stat("Uncommitted funding gap", compact(gap), "wallet", "Known costs less cash & usable facility")}${stat("Claims to review", String(claims).padStart(2, "0"), "layers", "Certification is separate from payment", "tinted")}</div><div class="overview-grid"><section class="panel action-panel"><div class="panel-header"><div><span class="eyebrow">YOUR ACTION QUEUE</span><h2>Needs attention <span class="count-pill">${attention.length}</span></h2></div><button class="text-link" data-page="cases">All cases ${ico("arrow", 14)}</button></div><div class="action-list">${attention
    .slice(0, 4)
    .map(
      (c, i) =>
        `<button class="action-item" data-case="${c.id}" data-tab="${c.claim ? "changes" : c.status === "Awaiting evidence" ? "evidence" : c.status === "Packet ready" ? "funding" : "scope"}"><span class="case-icon ${c.claim ? "sage" : ""}">${ico(c.claim ? "wallet" : i === 2 ? "file" : "home", 19)}</span><span class="action-copy"><strong>${esc(c.next)}</strong><span>${esc(c.name)} <i>·</i> ${esc(c.id)}</span><small><span class="person-dot">${c.assignee
          .split(" ")
          .map((x) => x[0])
          .join(
            "",
          )}</span>${esc(c.assignee)} <i>·</i> Due ${new Date(c.due + "T00:00:00+07:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" })}</small></span>${badge(c.claim ? "Claim review" : rcReadiness(c).docs.length ? "Evidence needed" : "Budget review")}<span class="row-arrow">${ico("arrow", 15)}</span></button>`,
    )
    .join(
      "",
    )}</div><div class="panel-foot">Sorted by due date · Select an action to continue the review.</div></section>${focusCard()}<section class="panel case-list-panel"><div class="panel-header"><div><span class="eyebrow">FROM PLAN TO PROGRESS</span><h2>Your renovation cases</h2></div><button class="text-link" data-page="cases">View all ${ico("arrow", 14)}</button></div>${caseTable(store.cases.slice(0, 4))}</section></div>`;
}
function focusCard() {
  const c = store.cases.find((x) => x.id === "RC-026") || store.cases[0],
    f = rcFinance(c),
    r = rcReadiness(c);
  return `<section class="focus-card"><div class="between"><span class="eyebrow">CONTINUE A CASE</span>${ico("home", 18)}</div><h2>${esc(c.name)}</h2><p>${esc(c.location)} · ${esc(c.owner)}</p><div class="focus-money"><span>Known project cost</span><strong>${compact(f.total)}</strong><small>Construction, contingency & known fees</small></div><div class="focus-split"><div><span>Owner cash</span><strong>${shortMoney(c.cash)}</strong></div><div><span>Funding gap</span><strong>${shortMoney(f.gap)}</strong></div></div><div class="focus-status"><span>${r.docs.length} evidence check${r.docs.length === 1 ? "" : "s"} to resolve</span><span>Budget v${c.version}</span></div><button class="btn" data-case="${c.id}" data-tab="funding">Review funding plan ${ico("arrow", 15)}</button><small class="focus-disclaimer">A funding gap is not a loan approval.</small></section>`;
}
function caseTable(cases) {
  return `<div class="table-scroll"><table><thead><tr><th>Project</th><th>Known cost</th><th>Funding gap</th><th>Stage</th><th>Next</th></tr></thead><tbody>${cases.map((c) => `<tr><td><button class="project-link" data-case="${c.id}"><span class="case-icon mini">${ico("home", 15)}</span><span><strong>${esc(c.name)}</strong><small>${esc(c.location)} · v${c.version}</small><small class="mobile-case-meta">${rcFinance(c).gap ? `Gap ${shortMoney(rcFinance(c).gap)}` : "Funding covered"} · ${rcReadiness(c).docs.length} evidence checks</small></span></button></td><td>${shortMoney(rcFinance(c).total)}${c.unknownCosts.length ? '<small class="table-note">Unpriced items</small>' : ""}</td><td><span class="gap-value ${rcFinance(c).gap === 0 ? "zero" : ""}">${rcFinance(c).gap ? shortMoney(rcFinance(c).gap) : "Covered"}</span></td><td>${badge(c.status)}</td><td><button class="icon-btn" data-case="${c.id}" aria-label="Open ${esc(c.name)}">${ico("arrow", 14)}</button></td></tr>`).join("") || '<tr><td colspan="5" class="empty">No cases match this search.</td></tr>'}</tbody></table></div>`;
}
function filteredCases() {
  return store.cases.filter(
    (c) =>
      (ui.filter === "All cases" ||
        (ui.filter === "Needs attention" &&
          (!rcReadiness(c).accepted || rcReadiness(c).docs.length)) ||
        (ui.filter === "Active renovation" && c.facilityActive)) &&
      [c.name, c.id, c.owner, c.location].some((v) =>
        v.toLowerCase().includes(ui.query.toLowerCase()),
      ),
  );
}
function casesView() {
  return `${heading("Every case, in clearer focus.", "Scope, evidence, and funding progress in one shared place.", btn("New case", "new-case", "plus", true))}<section class="panel"><div class="list-toolbar"><div class="filter-tabs">${["All cases", "Needs attention", "Active renovation"].map((f) => `<button data-filter="${f}" class="${ui.filter === f ? "active" : ""}" aria-pressed="${ui.filter === f}">${f}</button>`).join("")}</div><label class="local-search">${ico("search", 15)}<input id="case-search" placeholder="Search project or owner…" aria-label="Search cases" value="${esc(ui.query)}"></label></div><div id="case-results">${caseTable(filteredCases())}</div><div class="panel-foot">Shared fictional dataset · Perspective switching is not authentication.</div></section>`;
}
function caseView() {
  const c = activeCase(),
    r = rcReadiness(c);
  const tabs = [
    ["scope", "Scope & budget"],
    ["funding", "Funding plan"],
    ["evidence", "Evidence"],
    ["changes", "Changes & claims"],
    ["history", "History"],
  ];
  return `<button class="back-link" data-page="cases">${ico("left", 13)}All cases</button><div class="case-heading"><div><div class="eyebrow">${esc(c.id)} <span>·</span> ${esc(c.location)}</div><h1>${esc(c.name)}</h1><p>${esc(c.owner)} <span>·</span> Existing-home renovation <span>·</span> ${esc(c.assignee)}</p></div><div class="heading-actions">${badge(c.status)}${btn("Export packet", "export-packet", "download")}</div></div><div class="case-ribbon"><span>${ico("layers", 14)}Budget v${c.version} ${r.accepted ? '<b class="sage-text">Reviewed baseline</b>' : "<b>Review in progress</b>"}</span><span>${ico("clock", 14)}Next: ${esc(c.next)}</span></div><div class="case-tabs" role="tablist" aria-label="Case sections">${tabs.map(([id, t]) => `<button role="tab" id="tab-${id}" aria-selected="${ui.tab === id}" aria-controls="case-tab-panel" tabindex="${ui.tab === id ? "0" : "-1"}" class="${ui.tab === id ? "active" : ""}" data-tab="${id}"><span class="tab-step" aria-hidden="true" data-step="${String(tabs.findIndex(([key]) => key === id) + 1).padStart(2, "0")}"></span>${t}${id === "evidence" && r.docs.length ? `<i>${r.docs.length}</i>` : ""}</button>`).join("")}</div><div id="case-tab-panel" role="tabpanel" aria-labelledby="tab-${ui.tab}">${ui.tab === "funding" ? fundingTab(c) : ui.tab === "evidence" ? evidenceTab(c) : ui.tab === "changes" ? changesTab(c) : ui.tab === "history" ? historyTab(c) : scopeTab(c)}</div>`;
}
function scopeTab(c) {
  const r = rcReadiness(c),
    f = rcFinance(c);
  return `<div class="case-grid"><section class="panel budget-panel"><div class="panel-header"><div><span class="eyebrow">RENCANA ANGGARAN BIAYA</span><h2>The scope behind the numbers</h2><p>Itemized work, with a source for every line.</p></div><div class="heading-actions">${btn("View quote", "quote", "file")}${btn("Add line", "add-line", "plus", false, ui.role !== "reviewer" ? "disabled" : "")}</div></div><div class="budget-meta"><span>${ico("file", 13)}RAB-${esc(c.id)}.pdf <b>·</b> Quote v${c.documents.find((d) => d.id === "quote")?.version || 1}</span><span>${r.lineCount ? `${r.lineCount} line${r.lineCount === 1 ? "" : "s"} to review` : "All scope lines reviewed"}</span></div><div class="table-scroll"><table class="budget-table"><thead><tr><th>Work item / source</th><th>Quantity</th><th>Unit rate</th><th>Amount</th><th>Review</th></tr></thead><tbody>${c.lines.map((l) => `<tr><td><strong>${esc(l.label)}</strong><small>${esc(l.spec)}</small><button class="source-link" data-source="${l.id}">${ico("link", 11)}${esc(l.source)}</button></td><td>${new Intl.NumberFormat("id-ID").format(l.quantity)} <small>${esc(l.unit)}</small></td><td>${shortMoney(l.rate)}</td><td><strong>${shortMoney(Math.round(l.quantity * l.rate))}</strong></td><td><button class="review-line ${l.reviewed ? "reviewed" : ""}" data-line="${l.id}" ${!rcCanReview(ui.role) ? "disabled" : ""} aria-label="Review ${esc(l.label)}">${ico(l.reviewed ? "check" : "edit", 14)}${l.reviewed ? "Reviewed" : "Review"}</button></td></tr>`).join("")}</tbody></table></div><div class="budget-total"><span>Construction subtotal</span><strong>${rupiah(f.construction)}</strong></div><div class="budget-note">${ico("info", 14)}Original and revised values remain in case history. All sources here are illustrative.</div></section><div class="right-stack"><section class="panel summary-card"><span class="eyebrow">BUDGET SNAPSHOT</span><h2>What it takes to finish.</h2><div class="summary-amount">${compact(f.total)}</div><p>Known cost floor${!f.known ? " · unpriced items remain" : ""}</p><div class="cost-row"><span>Construction</span><strong>${shortMoney(f.construction)}</strong></div><div class="cost-row"><span>Contingency · ${c.contingency}%</span><strong>${shortMoney(f.reserve)}</strong></div><div class="cost-row"><span>Known fees</span><strong>${shortMoney(c.fees)}</strong></div><div class="summary-footer">${badge(r.accepted ? "Reviewed" : "Review in progress")}<span>Budget v${c.version}</span></div><button class="btn primary full" data-action="accept-budget" ${!rcCanReview(ui.role) || r.lineCount || r.accepted || !f.known ? "disabled" : ""}>${ico("check", 15)}${r.accepted ? "Budget baseline reviewed" : "Accept reviewed budget"}</button><small class="helper">Budget acceptance confirms a demo review. Credit approval remains separate.</small></section><section class="note-card"><span class="note-icon">${ico("shield", 18)}</span><h3>A source, not a score.</h3><p>This case shows what is known, what needs review, and what could change. No valuation uplift or prediction is used to approve it.</p></section></div></div>`;
}
function fundingTab(c) {
  const f = rcFinance(c);
  return `<div class="case-grid"><section class="panel funding-panel"><div class="panel-header"><div><span class="eyebrow">SOURCES & USES</span><h2>Know the gap before work begins.</h2><p>Property value is not counted as available cash.</p></div>${btn("Edit assumptions", "edit-funding", "edit")}</div><div class="funding-equation"><div><span>Known project cost</span><strong>${compact(f.total)}</strong></div><b>−</b><div><span>Owner cash</span><strong>${compact(c.cash)}</strong></div><b>−</b><div><span>Usable facility</span><strong>${compact(f.committed)}</strong></div><b>=</b><div class="gap"><span>Uncommitted gap</span><strong>${compact(f.gap)}</strong></div></div><div class="funding-bars"><div class="bar-label"><span>How this project is covered</span><strong>${Math.round(Math.min(100, ((c.cash + f.committed) / f.total) * 100))}% committed</strong></div><div class="funding-bar"><i class="owner" style="width:${Math.min(100, (c.cash / f.total) * 100)}%"></i><i class="facility" style="width:${Math.max(0, Math.min(100 - (c.cash / f.total) * 100, (f.committed / f.total) * 100))}%"></i></div><div class="bar-legend"><span><i></i>Owner cash</span><span><i></i>Usable committed facility</span><span><i></i>Uncommitted</span></div></div><div class="funding-lines"><div class="cost-row"><span>Remaining project cash outflows</span><strong>${rupiah(f.remaining)}</strong></div><div class="cost-row"><span>Recorded external payments</span><strong>${rupiah(f.paid)}</strong></div><div class="cost-row"><span>Undrawn usable facility</span><strong>${rupiah(f.undrawn)}</strong></div><div class="cost-row"><span>Owner committed cash · remaining</span><strong>${rupiah(c.cash)}</strong></div></div><div class="inline-note">${ico("info", 16)}<p>Certified work is not necessarily paid. The remaining cash need includes unpaid work. Only a usable, explicitly committed facility reduces the gap.</p></div><div class="funding-assumptions"><h3>What is included?</h3><p>${esc(c.fundingNotes)}</p>${c.unknownCosts.length ? `<div class="notice clay">Unpriced: ${c.unknownCosts.map(esc).join(", ")}. The total is a known-cost floor, not an all-in quote.</div>` : '<span class="source-chip">All listed demo cost categories are priced</span>'}</div></section><div class="right-stack"><section class="panel summary-card"><span class="eyebrow">LENDER PROCESS</span><h2>A packet is not an approval.</h2><ol class="stage-list"><li class="${rcReadiness(c).accepted ? "done" : ""}"><span>${ico(rcReadiness(c).accepted ? "check" : "file", 15)}</span><div><strong>Reviewed budget</strong><small>${rcReadiness(c).accepted ? "Baseline accepted" : "Scope review required"}</small></div></li><li class="${c.packetStatus === "Accepted" ? "done" : ""}"><span>${ico("file", 15)}</span><div><strong>Financing packet</strong><small>${esc(c.packetStatus)}</small></div></li><li class="${c.facilityActive ? "done" : ""}"><span>${ico("shield", 15)}</span><div><strong>Lender decision</strong><small>${esc(c.creditStatus)}</small></div></li><li class="${c.facilityActive ? "done" : ""}"><span>${ico("wallet", 15)}</span><div><strong>Usable facility</strong><small>${c.facilityActive ? shortMoney(c.facility) : "No committed facility recorded"}</small></div></li></ol>${btn("Review packet", "packet-review", "file", true)}<small class="helper">Demo workflow only. No institution has approved these fictional cases.</small></section><section class="note-card"><h3>One clear next step</h3><p>${f.gap ? "Resolve the funding shortfall and outstanding evidence before representing this renovation as fully funded." : "Keep the accepted budget, owner cash, and facility conditions aligned as the work changes."}</p></section></div></div>`;
}
function evidenceTab(c) {
  const open = rcReadiness(c).docs.length;
  return `<section class="panel"><div class="panel-header"><div><span class="eyebrow">A CLEARER RECORD</span><h2>Evidence, with context.</h2><p>Received is not verified. Every review records its source, scope, and rationale.</p></div>${btn("Add demo record", "add-evidence", "plus")}</div><div class="evidence-summary"><span>${c.documents.length - open} records accepted / not applicable</span><span>${open} need attention</span></div><div class="document-list">${c.documents.map((d) => `<button class="document-item" data-document="${d.id}"><span class="document-icon">${ico(d.id === "site" ? "eye" : "file", 21)}</span><span class="document-copy"><strong>${esc(d.type)}</strong><span>${esc(d.name)} <i>·</i> v${d.version}</span><small>${esc(d.note)}</small></span>${badge(d.status)}<span class="row-arrow">${ico("right", 15)}</span></button>`).join("")}</div><div class="panel-foot">${ico("info", 13)}Illustrative source records only. No real identity, legal, site, or bank document has been verified.</div></section>`;
}
function changesTab(c) {
  const x = c.claim,
    t = rcClaimTotals(c);
  return `<div class="case-grid"><div class="right-stack"><section class="panel"><div class="panel-header"><div><span class="eyebrow">KEEP THE AGREEMENT CLEAR</span><h2>Change orders</h2><p>Owner consent, revised cost, and review are separate steps.</p></div>${btn("New change", "new-change", "plus")}</div><div class="changes-list">${c.changes.map((change) => `<article class="change-card"><div class="between"><span class="eyebrow">${esc(change.id)}</span>${badge(change.status)}</div><h3>${esc(change.title)}</h3><p>${esc(change.reason)}</p><div class="change-values"><span>+ ${shortMoney(change.amount)}</span><span>+ ${change.days} days</span><span>${change.ownerAck ? "Owner acknowledged" : "Owner acknowledgment required"}</span></div>${change.status !== "Accepted" ? `<button class="btn small" data-change="${change.id}" ${ui.role === "owner" ? (change.ownerAck ? "disabled" : "") : ui.role === "reviewer" && change.ownerAck ? "" : "disabled"}>${ui.role === "owner" ? "Acknowledge scope & cost" : "Review change order"}${ico("arrow", 13)}</button>` : ""}</article>`).join("") || '<div class="empty"><span class="empty-icon">' + ico("layers", 23) + "</span><h3>No change orders yet</h3><p>Keep scope changes visible before they become unexpected costs.</p></div>"}</div></section><section class="panel milestone-panel ${x ? "has-claim" : ""}"><div class="panel-header"><div><span class="eyebrow">WORK BEFORE PAYMENT</span><h2>Milestone claim</h2><p>Requested, certified, authorized, and paid stay distinct.</p></div></div>${x ? `<div class="claim-content"><div class="between"><strong>${x.id} · Wet-area works</strong>${badge(t.stale ? "Stale baseline" : x.status)}</div><div class="claim-amounts"><div><span>Claimed</span><strong>${shortMoney(t.requested)}</strong></div><div><span>Certified</span><strong>${x.status === "Submitted" ? "Not reviewed" : shortMoney(t.certified)}</strong></div><div><span>Authorized</span><strong>${x.authorization ? shortMoney(x.authorization.amount) : "Not authorized"}</strong></div><div><span>Paid</span><strong>${shortMoney(t.paid)}</strong></div></div><p class="sub">${esc(x.note)}</p><div class="notice ${t.stale ? "clay" : ""}">${t.stale ? "Budget changed. This claim cannot progress against a stale baseline." : `Linked to accepted budget v${x.baseline}. Demo agreement: no advance recovery or retention. Claims cannot exceed eligible scope.`}</div><div class="claim-actions">${x.status === "Submitted" ? `<button class="btn primary" data-action="certify-claim" ${ui.role !== "reviewer" || t.stale ? "disabled" : ""}>Review & certify ${ico("arrow", 14)}</button><button class="btn" data-action="request-correction" ${ui.role !== "reviewer" || t.stale ? "disabled" : ""}>Request correction</button>` : x.status === "Correction requested" ? `<button class="btn" data-action="revised-claim" ${ui.role !== "reviewer" || t.stale ? "disabled" : ""}>Review revised submission</button>` : x.status === "Certified" ? `<button class="btn primary" data-action="authorize-claim" ${ui.role !== "lender" || t.stale ? "disabled" : ""}>Record demo authorization ${ico("shield", 14)}</button>` : ["Authorized", "Partially paid"].includes(x.status) ? `<button class="btn primary" data-action="record-payment" ${ui.role !== "lender" || t.stale ? "disabled" : ""}>Record external payment ${ico("wallet", 14)}</button>` : x.status === "Paid" ? `<button class="btn primary" data-action="reconcile-claim" ${ui.role !== "reviewer" || t.stale ? "disabled" : ""}>Reconcile payment records ${ico("check", 14)}</button>` : badge("Reconciled")}<button class="text-link" data-action="claim-detail">View claim detail ${ico("arrow", 13)}</button></div>${ui.role === "owner" ? '<p class="helper">Certification and authorization belong to the reviewer and lender perspectives.</p>' : x.status === "Certified" && ui.role !== "lender" ? '<p class="helper">Switch to the lender perspective to record a separate authorization.</p>' : ""}</div>` : '<div class="empty"><span class="empty-icon">' + ico("wallet", 23) + '</span><h3>No claim submitted</h3><p>The Bintaro Courtyard demo includes a claim you can review end to end.</p><button class="btn" data-case="RC-025" data-tab="changes">Explore the sample claim ' + ico("arrow", 14) + "</button></div>"}</section></div><div class="right-stack"><section class="panel summary-card"><span class="eyebrow">THE EVIDENCE CHAIN</span><h2>Every step means something.</h2><ol class="stage-list">${[
    ["Contractor claim", "What was requested"],
    ["Reviewer certification", "What evidence supports"],
    ["Lender authorization", "What is permitted"],
    ["External payment record", "What was actually recorded"],
    ["Reconciliation", "What matches the authorization"],
  ]
    .map(
      ([l, n], i) =>
        `<li><span>${String(i + 1).padStart(2, "0")}</span><div><strong>${l}</strong><small>${n}</small></div></li>`,
    )
    .join(
      "",
    )}</ol></section><section class="note-card"><h3>Keep the gap visible.</h3><p>A difference between the claimed and certified amount needs a reason. It does not disappear when an authorized amount is paid.</p>${x && x.status !== "Submitted" ? `<strong class="held-amount">${shortMoney(t.requested - t.certified)} held from this claim</strong>` : ""}</section></div></div>`;
}
function historyTab(c) {
  return `<section class="panel"><div class="panel-header"><div><span class="eyebrow">THE STORY OF THIS CASE</span><h2>A record of what changed.</h2><p>Local demo events and preserved budget snapshots.</p></div><span class="count-pill">${c.history.length} events</span></div><div class="history-list">${c.history.map((e) => `<article class="history-item"><span class="history-icon">${ico("history", 15)}</span><div><strong>${esc(e.message)}</strong><p>${esc(e.detail)}</p><small>${esc(e.actor)} <span>·</span> ${when(e.time)} WIB</small></div></article>`).join("")}</div>${c.snapshots.length ? `<div class="snapshot-list"><h3>Preserved budget versions</h3>${c.snapshots.map((s) => `<div class="cost-row"><span>Budget v${s.version} · ${s.lines.length} lines</span><strong>${shortMoney(s.lines.reduce((sum, l) => sum + Math.round(l.quantity * l.rate), 0))}</strong></div>`).join("")}</div>` : ""}<div class="panel-foot">This browser-only history demonstrates the workflow; it is not a secure or immutable audit system.</div></section>`;
}
function claimsView() {
  const cases = store.cases.filter((c) => c.claim);
  return `${heading("Work, evidence, and the payment between.", "Keep every stage of a claim visible. No money moves in this mockup.")}<div class="claim-register">${
    cases
      .map((c) => {
        const t = rcClaimTotals(c);
        return `<section class="panel register-card"><div class="between"><span class="eyebrow">${c.claim.id} / ${c.id}</span>${badge(t.stale ? "Stale baseline" : c.claim.status)}</div><h2>${esc(c.name)}</h2><p class="sub">Wet-area works · Budget v${c.claim.baseline}</p><div class="claim-amounts"><div><span>Claimed</span><strong>${shortMoney(t.requested)}</strong></div><div><span>Certified</span><strong>${c.claim.status === "Submitted" ? "Not reviewed" : shortMoney(t.certified)}</strong></div><div><span>Paid</span><strong>${shortMoney(t.paid)}</strong></div></div><button class="btn primary" data-case="${c.id}" data-tab="changes">Open claim workspace ${ico("arrow", 14)}</button></section>`;
      })
      .join("") || '<div class="panel empty">No submitted claims.</div>'
  }</div>`;
}
function evidenceInbox() {
  const pending = store.cases.flatMap((c) =>
    c.documents
      .filter(
        (d) => !["Reviewer accepted", "Not applicable"].includes(d.status),
      )
      .map((d) => ({ c, d })),
  );
  return `${heading("The facts behind every next step.", "Review the records that need a correction, a source, or a qualified decision.")}<section class="panel"><div class="panel-header"><h2>Evidence needing attention</h2><span class="count-pill">${pending.length} records</span></div><div class="document-list">${pending.map(({ c, d }) => `<button class="document-item" data-evidence-case="${c.id}" data-document="${d.id}"><span class="document-icon">${ico("file", 21)}</span><span class="document-copy"><strong>${esc(d.type)}</strong><span>${esc(c.name)} <i>·</i> ${esc(d.name)}</span><small>${esc(d.note)}</small></span>${badge(d.status)}${ico("right", 14)}</button>`).join("") || '<div class="empty"><h3>The inbox is clear.</h3><p>New source records and corrections will appear here.</p></div>'}</div></section>`;
}
function activityView() {
  const entries = store.cases
    .flatMap((c) =>
      c.history.map((e) => ({ ...e, caseId: c.id, caseName: c.name })),
    )
    .sort((a, b) => new Date(b.time) - new Date(a.time));
  return `${heading("A shared record of progress.", "Every review, change, and demo payment record in one place.")}<section class="panel"><div class="history-list">${entries.map((e) => `<article class="history-item"><span class="history-icon">${ico("history", 16)}</span><div><strong>${esc(e.message)}</strong><p>${esc(e.caseName)} · ${esc(e.detail)}</p><small>${esc(e.actor)} · ${when(e.time)} WIB</small></div><button class="text-link" data-case="${e.caseId}" data-tab="history">Open ${ico("arrow", 13)}</button></article>`).join("")}</div></section>`;
}
function settingsView() {
  return `${heading("A workspace for the next conversation.", "Explore the mockup with fictional information only.")}<section class="panel settings-panel"><h2>Demo perspectives</h2><p>The role switch demonstrates a workflow. It does not create accounts or enforce real authorization.</p><div class="perspective-options">${Object.entries(
    RC_ROLES,
  )
    .map(
      ([id, r]) =>
        `<button data-role="${id}" class="${ui.role === id ? "selected" : ""}"><span class="avatar">${r.initials}</span><strong>${r.label}</strong>${ui.role === id ? ico("check", 16) : ico("arrow", 16)}</button>`,
    )
    .join(
      "",
    )}</div></section><section class="panel settings-panel"><h2>What this prototype demonstrates</h2><div class="scope-list">${["Source-linked scope and RAB review", "Known costs, cash commitments, and funding gaps", "Evidence states and reasoned review", "Owner-acknowledged change orders", "Separate certification, authorization, and payment records", "Frozen packet exports and printable lender memo"].map((l) => `<span>${ico("check", 15)}${l}</span>`).join("")}</div><p class="helper">No real document verification, bank integration, lending decision, multi-user security, or funds transfer is connected. Browser data does not synchronize across devices. Use only fictional information.</p></section><section class="panel settings-panel"><h2>Restore the sample workspace</h2><p>Reset removes changes to this mockup's local demo data. Older RenovaCredit prototype storage is left untouched.</p>${btn("Reset demo data", "reset", "history", false)}</section>`;
}
function openModal(title, body, foot = "") {
  opener = document.activeElement;
  document.querySelector("#modal-root").innerHTML =
    `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1"><div class="modal-head"><div><span class="eyebrow">RENOVACREDIT / DEMO WORKFLOW</span><h2 id="dialog-title">${title}</h2></div><button class="icon-btn" data-action="close" aria-label="Close dialog">${ico("close", 17)}</button></div><div class="modal-body">${body}</div>${foot ? `<div class="modal-foot">${foot}</div>` : ""}</section></div>`;
  document.body.style.overflow = "hidden";
  document.querySelector(".modal button,.modal input,.modal").focus();
}
function closeModal() {
  document.querySelector("#modal-root").innerHTML = "";
  document.body.style.overflow = "";
  if (opener?.isConnected) opener.focus();
  else document.querySelector("#main-content")?.focus();
}
function field(label, name, value, type = "number", attrs = "") {
  return `<label class="field">${label}<input type="${type}" name="${name}" value="${esc(value)}" required ${attrs}></label>`;
}
function noteField(label = "Review rationale", name = "note", value = "") {
  return `<label class="field full">${label}<textarea name="${name}" required maxlength="1200" placeholder="Describe the source, scope of review, and what remains unresolved…">${esc(value)}</textarea></label>`;
}
function formError(form, msg) {
  const error = form.querySelector(".form-error");
  if (error) error.textContent = msg;
  else notify(msg);
}
function safeAmount(v) {
  return Number.isSafeInteger(v) && v >= 0 && v <= 1000000000000;
}
function sourceQuote(c, lineId = null) {
  openModal(
    "The quote behind this budget",
    `<div class="notice">Illustrative source record. This is a generated demo quote, not an uploaded or verified contractor document.</div><div class="quote-paper"><div class="between"><div><span class="eyebrow">RUANG KARYA / DEMO QUOTE</span><h3>${esc(c.name)}</h3><p>${esc(c.location)}</p></div><span class="quote-stamp">SAMPLE</span></div><div class="table-scroll"><table><thead><tr><th>Item / reference</th><th>Qty</th><th>Unit price</th></tr></thead><tbody>${c.lines.map((l) => `<tr class="${l.id === lineId ? "source-highlight" : ""}"><td><strong>${esc(l.label)}</strong><small>${esc(l.source)}</small></td><td>${l.originalQuantity} ${esc(l.unit)}</td><td>${rupiah(l.originalRate)}</td></tr>`).join("")}</tbody></table></div><small>Original source values are preserved separately from reviewed edits.</small></div>`,
    btn("Close source", "close"),
  );
}
function reviewLine(id) {
  const c = activeCase(),
    l = c.lines.find((x) => x.id === id);
  if (!l || !rcCanReview(ui.role)) return;
  openModal(
    "Review a scope line",
    `<div class="source-summary">${ico("file", 17)}<div><strong>${esc(l.label)}</strong><p>RAB-${c.id}.pdf · ${esc(l.source)}</p></div></div><div class="notice">Original: ${l.originalQuantity} ${esc(l.unit)} × ${rupiah(l.originalRate)}. Reviewing this demo line does not verify a real quote or site measurement.</div><form id="line-form" data-line="${id}"><div class="form-grid">${field(`Reviewed quantity (${esc(l.unit)})`, "quantity", l.quantity, "number", 'min="0.01" max="100000" step="0.01"')}${field("Unit rate (IDR)", "rate", l.rate, "number", 'min="0" max="1000000000000" step="1"')}${noteField("Review note · required", "note", l.reviewed ? "Demo source reviewed; quantities and specification agree with the sample quote." : "")}</div><p class="form-error" role="alert"></p><button class="btn primary" type="submit">${ico("check", 15)}Confirm reviewed line</button></form>`,
  );
}
function documentModal(id) {
  const c = activeCase(),
    d = c.documents.find((x) => x.id === id);
  if (!d) return;
  openModal(
    "Review evidence, with its context",
    `<div class="source-summary">${ico("file", 21)}<div><strong>${esc(d.type)}</strong><p>${esc(d.name)} · v${d.version}</p></div>${badge(d.status)}</div><dl class="source-details"><div><dt>Source</dt><dd>${esc(d.source)}</dd></div><div><dt>Case</dt><dd>${esc(c.name)}</dd></div><div><dt>Reviewer</dt><dd>${esc(d.reviewer || "Not reviewed")}</dd></div><div><dt>Verification scope</dt><dd>Demo record only · no external verification</dd></div></dl><div class="notice">No real file has been uploaded or authenticated. Record a reasoned demo review, not a claim of title, identity, or site verification.</div><form id="document-form" data-document="${id}"><div class="form-grid"><label class="field full">Review outcome<select name="status">${["Received", "Needs correction", "Reviewer accepted", "Not applicable", "Missing"].map((s) => `<option ${d.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></label>${noteField("Review scope / correction / non-applicability rationale", "note", d.note)}</div><p class="form-error" role="alert"></p><button class="btn primary" type="submit" ${!rcCanReview(ui.role) ? "disabled" : ""}>Save demo evidence review</button>${!rcCanReview(ui.role) ? '<p class="helper">Use the reviewer perspective to change review states.</p>' : ""}</form>`,
  );
}
function fundingModal() {
  const c = activeCase();
  openModal(
    "Make the funding assumptions explicit",
    `<form id="funding-form"><div class="form-grid">${field("Committed owner cash remaining (IDR)", "cash", c.cash, "number", 'min="0" max="1000000000000" step="1"')}${field("Contingency reserve (%)", "contingency", c.contingency, "number", 'min="0" max="50" step="1"')}${field("Known fees and other costs (IDR)", "fees", c.fees, "number", 'min="0" max="1000000000000" step="1"')}${ui.role === "lender" ? `${field("Usable committed facility (IDR)", "facility", c.facility, "number", 'min="0" max="1000000000000" step="1"')}<label class="field">Demo facility reference<input name="facilityReference" maxlength="80" value="${esc(c.facilityReference || "")}" placeholder="DEMO-FAC-026"></label><label class="check-field full"><input name="active" type="checkbox" ${c.facilityActive ? "checked" : ""}>Record this as a usable demo facility with accepted current budget conditions</label>` : '<div class="notice full">Usable facility amounts can only be changed in the lender demo perspective. Unrequested or conditional financing does not reduce the gap.</div>'}${noteField("Included costs and assumptions", "notes", c.fundingNotes)}<label class="field full">Unpriced items (leave empty if all listed categories are priced)<input name="unknown" maxlength="200" value="${esc(c.unknownCosts.join(", "))}" placeholder="e.g. temporary accommodation"></label></div><p class="form-error" role="alert"></p><button class="btn primary" type="submit">Save funding assumptions</button></form>`,
  );
}
function newCase() {
  openModal(
    "Start with the renovation, not a score.",
    `<p class="sub">Capture the objective and what you know. Add source-backed quantities and costs in the case workspace.</p><div class="notice">Use fictional information only. This is a local interactive mockup.</div><form id="new-case-form"><div class="form-grid">${field("Project name", "name", "", "text", 'maxlength="90" placeholder="e.g. Bekasi kitchen refresh"')}${field("Homeowner display name", "owner", "", "text", 'maxlength="80" placeholder="Fictional homeowner"')}${field("Location", "location", "", "text", 'maxlength="120" placeholder="Area, city"')}<label class="field">Scope class<select name="scope"><option>Non-structural interior renovation</option><option>Waterproofing & wet areas</option><option>Light services renovation</option><option>Structural / specialist review needed</option></select></label>${field("Working construction budget (IDR)", "budget", 240000000, "number", 'min="1000000" max="1000000000000" step="1"')}${field("Committed owner cash (IDR)", "cash", 30000000, "number", 'min="0" max="1000000000000" step="1"')}${noteField("Renovation objective", "objective", "")}</div><p class="form-error" role="alert"></p><button class="btn primary" type="submit">Create draft case ${ico("arrow", 15)}</button></form>`,
  );
}
function certifyModal() {
  const c = activeCase(),
    x = c.claim,
    t = rcClaimTotals(c);
  if (!x || ui.role !== "reviewer" || t.stale || x.status !== "Submitted")
    return;
  openModal(
    "Certify what the evidence supports.",
    `<div class="notice">Demo site note: Rp52.000.000 is supported. Rp8.000.000 of finishing work needs evidence. No real measurement or inspection has taken place.</div><form id="certify-form"><div class="claim-form-lines">${x.items.map((i, n) => `<label class="field">${esc(i.label)}<span class="sub">Claimed: ${rupiah(i.requested)} · approved scope: ${rupiah(Math.round(c.lines[i.line].quantity * c.lines[i.line].rate))}</span><input name="certified-${n}" aria-label="Certified amount for ${esc(i.label)}" type="number" min="0" max="${i.requested}" step="1" value="${n === 0 ? 20000000 : 32000000}" required></label>`).join("")}</div>${noteField("Certification rationale", "note", "Demo record: Rp8.000.000 of bathroom finishing is not yet supported by the illustrative evidence.")}<p class="form-error" role="alert"></p><button type="submit" class="btn primary">Record demo certification ${ico("check", 15)}</button></form>`,
  );
}
function authorizationModal() {
  const c = activeCase(),
    x = c.claim,
    t = rcClaimTotals(c);
  if (!x || ui.role !== "lender" || t.stale || x.status !== "Certified") return;
  openModal(
    "A separate lender authorization.",
    `<div class="notice">This records a fictional authorization only. It does not connect to a bank or release funds.</div><div class="modal-amount"><span>Certified eligible amount</span><strong>${rupiah(t.certified)}</strong></div><form id="authorize-form">${field("Demo authorization reference", "reference", "", "text", 'maxlength="80" placeholder="DEMO-AUTH-012"')}${noteField("Authorization note", "note", "Demo authorization limited to certified work under budget v" + c.version + ". No retention or advances apply in this sample agreement.")}<p class="form-error" role="alert"></p><button class="btn primary" type="submit">Record demo authorization</button></form>`,
  );
}
function paymentModal() {
  const c = activeCase(),
    x = c.claim,
    t = rcClaimTotals(c);
  if (
    !x ||
    ui.role !== "lender" ||
    t.stale ||
    !["Authorized", "Partially paid"].includes(x.status)
  )
    return;
  openModal(
    "Record a payment made elsewhere.",
    `<div class="notice">Fictional external payment record. This form never transfers money. Partial payments stay separate until reconciled.</div><form id="payment-form"><div class="form-grid">${field("External payment reference", "reference", "", "text", 'maxlength="80" placeholder="DEMO-PAY-012"')}${field("Recorded amount (IDR)", "amount", x.authorization.amount - t.paid, "number", `min="1" max="${x.authorization.amount - t.paid}" step="1"`)}</div><p class="helper">Remaining authorized amount: ${rupiah(x.authorization.amount - t.paid)}. The same external reference cannot be recorded twice.</p><p class="form-error" role="alert"></p><button class="btn primary" type="submit">Save demo payment record</button></form>`,
  );
}
function newChange() {
  openModal(
    "A scope change, with no surprises.",
    `<form id="change-form"><div class="form-grid">${field("Change title", "title", "", "text", 'maxlength="120"')}${field("Additional cost (IDR)", "amount", 12000000, "number", 'min="1" max="1000000000000" step="1"')}${field("Schedule impact (days)", "days", 3, "number", 'min="0" max="365" step="1"')}${noteField("Reason and proposed scope", "reason", "")}</div><p class="notice">The homeowner must acknowledge the cost and scope before a reviewer can accept this demo change. Acceptance creates a new budget version requiring re-review.</p><p class="form-error" role="alert"></p><button class="btn primary" type="submit">Create proposed change</button></form>`,
  );
}
function packetData(c) {
  const f = rcFinance(c),
    r = rcReadiness(c);
  return {
    schema: "RC-PACKET/1.0",
    product: "RenovaCredit by SECHA",
    prototype: true,
    currency: "IDR",
    amountUnit: "rupiah",
    exportedAt: new Date().toISOString(),
    budgetVersion: c.version,
    case: {
      id: c.id,
      name: c.name,
      location: c.location,
      owner: c.owner,
      status: c.status,
    },
    scope: c.lines.map((l) => ({
      ...l,
      amount: Math.round(l.quantity * l.rate),
    })),
    funding: {
      ...f,
      facilityReference: c.facilityReference || null,
      ownerCash: c.cash,
      notes: c.fundingNotes,
      unpriced: c.unknownCosts,
    },
    evidence: c.documents.map((d) => ({
      type: d.type,
      status: d.status,
      source: d.source,
      version: d.version,
      reviewer: d.reviewer,
      note: d.note,
    })),
    readiness: {
      budgetReviewed: r.accepted,
      unreviewedLines: r.lineCount,
      openEvidence: r.docs.map((d) => d.type),
      packetStatus: c.packetStatus,
      creditStatus: c.creditStatus,
    },
    changes: structuredClone(c.changes),
    claim: c.claim ? structuredClone(c.claim) : null,
    history: structuredClone(c.history),
    limits: [
      "Fictional browser-only workflow; no authenticated or professional verification.",
      "No bank or payment integration; no money is moved.",
      "A reviewed packet is not a lending decision.",
    ],
  };
}
function exportModal() {
  const c = activeCase(),
    r = rcReadiness(c);
  openModal(
    "A clear packet for the next reviewer.",
    `<div class="source-summary">${ico("file", 22)}<div><strong>${esc(c.name)}</strong><p>${esc(c.id)} · budget v${c.version} · ${c.packetStatus}</p></div></div><div class="notice">The export freezes the current demo values. It includes evidence status and source references, not real identity or credit files. It is not a loan approval.</div><div class="export-options"><button data-action="download-json"><span class="document-icon">${ico("download", 21)}</span><span><strong>Structured packet</strong><small>JSON · current version, amounts in IDR</small></span>${ico("arrow", 16)}</button><button data-action="print-packet"><span class="document-icon">${ico("file", 21)}</span><span><strong>Readable lender memo</strong><small>Print or save as PDF in your browser</small></span>${ico("arrow", 16)}</button></div><div class="export-state">${badge(r.accepted ? "Budget reviewed" : "Draft budget")}<span>${r.docs.length} open evidence checks · no real lender approval</span></div>`,
  );
}
function downloadJSON() {
  const c = activeCase(),
    packet = packetData(c);
  const blob = new Blob([JSON.stringify(packet, null, 2)], {
      type: "application/json",
    }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = `renovacredit-${c.id}-v${c.version}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  log(c, "Case packet exported", `Frozen JSON snapshot · budget v${c.version}`);
  notify("Current demo packet exported as JSON.");
}
function printPacket() {
  const c = activeCase(),
    p = packetData(c),
    f = p.funding;
  const win = window.open("", "_blank");
  if (!win) {
    notify("Allow the print window to open, then try again.");
    return;
  }
  win.document.write(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>RenovaCredit memo · ${esc(c.id)}</title><style>body{font:14px/1.7 Arial,sans-serif;max-width:850px;margin:45px auto;color:#44362f;padding:0 25px}h1{font-size:30px}h2{font-size:18px;margin-top:27px}.label{color:#aa5239;font-size:11px;letter-spacing:2px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{text-align:left;padding:10px;border-bottom:1px solid #dfd6c9}.notice{padding:16px;background:#f6eddf;border:1px solid #e4d4bc}.print{padding:10px 15px;border:0;background:#b65c43;color:white;border-radius:5px;cursor:pointer}small{color:#746253}@media print{.print{display:none}body{margin:0;max-width:none}.notice{break-inside:avoid}}</style></head><body><button class="print" onclick="window.print()">Print / Save as PDF</button><p class="label">RENOVACREDIT / REVIEW MEMO / FICTIONAL DEMO</p><h1>${esc(c.name)}</h1><p>${esc(c.id)} · ${esc(c.location)} · Budget v${c.version}</p><div class="notice">This memo records a fictional case snapshot. It is not a bank approval, appraisal, legal verification, or payment instruction.</div><h2>What is known</h2><p>Construction: ${rupiah(f.construction)} · Contingency: ${rupiah(f.reserve)} · Fees: ${rupiah(c.fees)}<br>Known project cost: <strong>${rupiah(f.total)}</strong><br>Owner cash: ${rupiah(c.cash)} · Usable facility: ${rupiah(f.committed)}<br>Uncommitted funding gap: <strong>${rupiah(f.gap)}</strong></p><h2>What needs attention</h2><p>${p.readiness.budgetReviewed ? "Budget baseline reviewed." : "Budget review is incomplete."} ${p.readiness.openEvidence.length ? esc(p.readiness.openEvidence.join("; ")) : "All demo evidence review states are recorded."}</p><p>Unpriced costs: ${esc(c.unknownCosts.join("; ") || "None recorded in this demo")}<br>${esc(c.fundingNotes)}</p><h2>Scope & budget</h2><table><thead><tr><th>Work</th><th>Qty</th><th>Amount</th><th>Source</th></tr></thead><tbody>${p.scope.map((l) => `<tr><td>${esc(l.label)}</td><td>${l.quantity} ${esc(l.unit)}</td><td>${rupiah(l.amount)}</td><td>${esc(l.source)}</td></tr>`).join("")}</tbody></table><h2>Evidence status</h2><table><tbody>${p.evidence.map((d) => `<tr><td>${esc(d.type)}</td><td>${esc(d.status)}</td><td>${esc(d.reviewer || "Not reviewed")}</td></tr>`).join("")}</tbody></table><h2>What action is requested</h2><p>${esc(c.next)}</p><p>Packet: ${esc(c.packetStatus)} · Lender: ${esc(c.creditStatus)}</p><small>RC-PACKET/1.0 · ${esc(p.exportedAt)} · Amounts in IDR. Illustrative sources only. No sensitive original files are attached.</small></body></html>`,
  );
  win.document.close();
}
function packetReview() {
  const c = activeCase(),
    r = rcReadiness(c);
  openModal(
    "Is the packet ready for the lender?",
    `<div class="readiness-checks"><div>${ico(r.accepted ? "check" : "clock", 17)}<span>Reviewed budget v${c.version}</span>${badge(r.accepted ? "Ready" : "Review needed")}</div><div>${ico(r.docs.length ? "clock" : "check", 17)}<span>Evidence review states</span>${badge(r.docs.length ? `${r.docs.length} unresolved` : "Ready")}</div><div>${ico(c.unknownCosts.length ? "clock" : "check", 17)}<span>Unpriced cost categories</span>${badge(c.unknownCosts.length ? "Needs correction" : "None recorded")}</div></div><div class="notice">Packet acceptance is separate from credit approval and facility availability. Only the lender demo perspective can accept a ready packet.</div><form id="packet-form">${noteField("Demo acceptance / conditions", "note", "Demo packet accepted for review only. No actual institution or credit decision is represented.")}<p class="form-error" role="alert"></p><button class="btn primary" type="submit" ${ui.role !== "lender" || !r.ready || !r.accepted ? "disabled" : ""}>Record demo packet acceptance</button></form>`,
  );
}
function claimDetail() {
  const c = activeCase(),
    x = c.claim,
    t = rcClaimTotals(c);
  if (!x) return;
  openModal(
    "Follow the claim, all the way through.",
    `<div class="between"><h3>${esc(x.id)} · ${esc(c.name)}</h3>${badge(t.stale ? "Stale baseline" : x.status)}</div><div class="table-scroll"><table><thead><tr><th>Work</th><th>Claimed</th><th>Certified</th></tr></thead><tbody>${x.items.map((i) => `<tr><td>${esc(i.label)}</td><td>${rupiah(i.requested)}</td><td>${i.certified === null ? "Not reviewed" : rupiah(i.certified)}</td></tr>`).join("")}</tbody></table></div><div class="notice">${esc(x.certificateNote || x.note)}</div><h3>Authorization</h3><p class="sub">${x.authorization ? `${esc(x.authorization.reference)} · ${rupiah(x.authorization.amount)} · ${esc(x.authorization.actor)}` : "No demo authorization recorded."}</p><h3 class="spaced">External payment records</h3>${x.payments.length ? x.payments.map((p) => `<div class="cost-row"><span>${esc(p.reference)}</span><strong>${rupiah(p.amount)}</strong></div>`).join("") : '<p class="sub">No external payment recorded.</p>'}<small class="helper">All references and amounts in this workflow are fictional. No money is transferred.</small>`,
  );
}
const actions = {
  menu: () => {
    ui.menu = !ui.menu;
    render();
  },
  notifications: () => {
    ui.notifications = !ui.notifications;
    render();
  },
  close: closeModal,
  "new-case": newCase,
  "request-correction": () => {
    const c = activeCase();
    if (
      ui.role !== "reviewer" ||
      c.claim?.status !== "Submitted" ||
      rcClaimTotals(c).stale
    )
      return;
    openModal(
      "Ask for the evidence that is missing.",
      `<div class="notice">This places the demo claim on hold. Nothing can be certified, authorized, or paid until a corrected submission is reviewed.</div><form id="correction-form">${noteField("Correction request", "note", "")}<p class="form-error" role="alert"></p><button class="btn primary" type="submit">Record correction request</button></form>`,
    );
  },
  "revised-claim": () => {
    const c = activeCase();
    if (ui.role !== "reviewer" || c.claim?.status !== "Correction requested")
      return;
    openModal(
      "Review a revised demo submission.",
      `<div class="notice">Simulate receiving a corrected source record. No file is uploaded or authenticated. The claim returns for a new certification review.</div><form id="resubmission-form">${field("Fictional revised source reference", "reference", "", "text", 'maxlength="100" placeholder="DEMO-REV-012"')}${noteField("What was corrected?", "note", "")}<p class="form-error" role="alert"></p><button class="btn primary" type="submit">Record revised demo submission</button></form>`,
    );
  },
  "add-line": () =>
    openModal(
      "Add a source-linked scope item.",
      `<div class="notice">Use a fictional source reference. This mockup does not verify a document or site quantity.</div><form id="add-line-form"><div class="form-grid">${field("Work item", "label", "", "text", 'maxlength="100"')}${field("Specification", "spec", "", "text", 'maxlength="160"')}${field("Quantity", "quantity", 1, "number", 'min="0.01" max="100000" step="0.01"')}<label class="field">Unit<select name="unit"><option>m²</option><option>m³</option><option>point</option><option>package</option><option>unit</option></select></label>${field("Unit rate (IDR)", "rate", 1000000, "number", 'min="0" max="1000000000000" step="1"')}${field("Source reference", "source", "", "text", 'maxlength="140" placeholder="Demo quote · page 1 · item 7"')}</div><p class="form-error" role="alert"></p><button class="btn primary" type="submit">Add unreviewed scope line</button></form>`,
    ),
  quote: () => sourceQuote(activeCase()),
  "edit-funding": fundingModal,
  "new-change": newChange,
  "certify-claim": certifyModal,
  "authorize-claim": authorizationModal,
  "record-payment": paymentModal,
  "claim-detail": claimDetail,
  "export-packet": exportModal,
  "download-json": downloadJSON,
  "print-packet": printPacket,
  "packet-review": packetReview,
  perspective: () =>
    openModal(
      "Choose a demo perspective.",
      `<p class="sub">Explore the handoffs between people. This switch simulates roles; it is not authentication or a production permission boundary.</p><div class="perspective-options vertical">${Object.entries(
        RC_ROLES,
      )
        .map(
          ([id, r]) =>
            `<button data-role="${id}" class="${ui.role === id ? "selected" : ""}"><span class="avatar">${r.initials}</span><span><strong>${r.label}</strong><small>${id === "reviewer" ? "Review scope, evidence, and certify work" : id === "owner" ? "Acknowledge scope changes and understand funding" : "Accept packets, authorize claims, record demo payments"}</small></span>${ui.role === id ? ico("check", 17) : ico("arrow", 17)}</button>`,
        )
        .join("")}</div>`,
    ),
  "accept-budget": () => {
    const c = activeCase(),
      r = rcReadiness(c);
    if (
      !rcCanReview(ui.role) ||
      r.lineCount ||
      c.unknownCosts.length ||
      r.accepted
    )
      return;
    c.acceptedVersion = c.version;
    c.packetStatus = "Reviewed";
    c.status = "Packet ready";
    c.next = r.docs.length
      ? "Resolve the remaining evidence reviews"
      : "Submit the reviewed financing packet";
    log(
      c,
      "Budget baseline reviewed",
      `Version ${c.version} · ${rupiah(rcBudget(c))} construction`,
    );
    render();
    notify("Budget baseline reviewed. This is separate from credit approval.");
  },
  "add-evidence": () =>
    openModal(
      "Add an illustrative record.",
      `<div class="notice">No real file upload is provided in this mockup. Add a fictional source record to explore the review workflow.</div><form id="add-evidence-form">${field("Evidence type", "type", "", "text", 'maxlength="90" placeholder="e.g. Updated wet-area measurement"')}${field("Fictional filename", "filename", "", "text", 'maxlength="120" placeholder="demo-measurements.pdf"')}<p class="form-error" role="alert"></p><button class="btn primary" type="submit">Add demo record</button></form>`,
    ),
  "reconcile-claim": () => {
    const c = activeCase(),
      x = c.claim,
      t = rcClaimTotals(c);
    if (
      !x ||
      ui.role !== "reviewer" ||
      t.stale ||
      x.status !== "Paid" ||
      t.paid !== x.authorization.amount
    )
      return;
    x.status = "Reconciled";
    c.next = "Continue work and resolve unsupported finishing";
    log(
      c,
      "Demo payment records reconciled",
      `${x.id} · ${rupiah(t.paid)} matched; ${rupiah(t.requested - t.certified)} remains unsupported`,
    );
    render();
    notify("Authorized amount reconciled. Unsupported work remains visible.");
  },
  walkthrough: () =>
    openModal(
      "From a quote to a clearer decision.",
      `<div class="walkthrough"><div><span>01</span><section><h3>Review the scope</h3><p>Open Bekasi Family Home. Inspect source references, review a RAB line, and accept the budget baseline.</p></section></div><div><span>02</span><section><h3>Understand the funding</h3><p>See the difference between known cost, owner cash, usable facility, and the uncommitted gap.</p></section></div><div><span>03</span><section><h3>Resolve the evidence</h3><p>Review records with an explicit scope and rationale. A checkmark is never a title, appraisal, or bank verification.</p></section></div><div><span>04</span><section><h3>Connect work to payment</h3><p>Open Bintaro Courtyard. Certify Rp52 jt of a Rp60 jt claim, switch to the lender to authorize, record partial demo payments, and reconcile as reviewer.</p></section></div></div><div class="notice">This interactive mockup uses fictional data, browser storage, and demo role switching. It does not implement the PRD's production security or integrations.</div>`,
      btn("Explore the workspace", "close", "arrow", true),
    ),
  reset: () =>
    openModal(
      "Restore the fictional sample cases?",
      `<p class="sub">This removes this mockup's local edits, reviews, events, and payment records. Old prototype data is not touched.</p>`,
      btn("Keep changes", "close") +
        btn("Reset sample workspace", "confirm-reset", "history", true),
    ),
  "confirm-reset": () => {
    store = rcSeed();
    save();
    closeModal();
    ui.caseId = "RC-026";
    ui.role = "reviewer";
    navigate("overview");
    notify("Sample workspace restored.");
  },
};
document.addEventListener("click", (e) => {
  const el = e.target.closest("button,a");
  if (!el) return;
  const d = el.dataset;
  if (d.action) {
    e.preventDefault();
    actions[d.action]?.();
  } else if (d.page) {
    e.preventDefault();
    navigate(d.page);
  } else if (d.role) {
    ui.role = d.role;
    closeModal();
    render();
    notify(`${RC_ROLES[ui.role].label} demo perspective selected.`);
  } else if (d.evidenceCase) {
    ui.caseId = d.evidenceCase;
    documentModal(d.document);
  } else if (d.document) {
    documentModal(d.document);
  } else if (d.case) {
    openCase(d.case, d.tab || "scope");
  } else if (d.tab) {
    ui.tab = d.tab;
    render();
    document.querySelector(`#tab-${ui.tab}`)?.focus();
  } else if (d.filter) {
    ui.filter = d.filter;
    render();
  } else if (d.line) {
    reviewLine(d.line);
  } else if (d.source) {
    sourceQuote(activeCase(), d.source);
  } else if (d.change) {
    const c = activeCase(),
      x = c.changes.find((x) => x.id === d.change);
    if (!x) return;
    if (ui.role === "owner" && !x.ownerAck) {
      openModal(
        "Acknowledge the change before it grows.",
        `<h3>${esc(x.title)}</h3><p class="sub">${esc(x.reason)}</p><div class="modal-amount"><span>Additional cost / schedule</span><strong>${rupiah(x.amount)} · ${x.days} days</strong></div><form id="ack-change-form" data-change="${x.id}"><label class="check-field"><input name="ack" type="checkbox" required>I understand this proposed scope, cost, and time change. This demo acknowledgment is not a financing approval.</label><button class="btn primary" type="submit">Record demo owner acknowledgment</button></form>`,
      );
    } else if (
      ui.role === "reviewer" &&
      x.ownerAck &&
      x.status !== "Accepted"
    ) {
      openModal(
        "Review the acknowledged change.",
        `<h3>${esc(x.title)}</h3><p class="sub">${esc(x.reason)}</p><div class="notice">Accepting this change adds ${rupiah(x.amount)} to the scope and creates a new budget version. The budget must be reviewed again and any old claim baseline becomes stale.</div><form id="accept-change-form" data-change="${x.id}">${noteField("Review rationale", "note", "")}<p class="form-error" role="alert"></p><button class="btn primary" type="submit">Accept change for budget re-review</button></form>`,
      );
    }
  }
});
document.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target,
    f = new FormData(form),
    c = activeCase();
  const value = (n) => Number(f.get(n));
  const text = (n) => String(f.get(n) || "").trim();
  if (form.id === "correction-form") {
    if (
      ui.role !== "reviewer" ||
      c.claim?.status !== "Submitted" ||
      rcClaimTotals(c).stale ||
      !text("note")
    ) {
      formError(form, "A reviewer and correction rationale are required.");
      return;
    }
    c.claim.status = "Correction requested";
    c.claim.correctionNote = text("note");
    c.next = "Await corrected claim evidence";
    log(
      c,
      "Demo claim returned for correction",
      `${c.claim.id} · ${text("note")}`,
    );
    closeModal();
    render();
    notify("Claim held for correction. No payment action is available.");
  } else if (form.id === "resubmission-form") {
    if (
      ui.role !== "reviewer" ||
      c.claim?.status !== "Correction requested" ||
      rcClaimTotals(c).stale ||
      !text("note") ||
      !text("reference")
    ) {
      formError(
        form,
        "Record a revised source reference and a correction note.",
      );
      return;
    }
    c.claim.status = "Submitted";
    c.claim.revisedSource = text("reference");
    c.next = "Review the revised milestone claim";
    log(
      c,
      "Revised demo claim received",
      `${text("reference")} · ${text("note")}`,
    );
    closeModal();
    render();
    notify("Revised submission recorded. Certification review is required.");
  } else if (form.id === "add-line-form") {
    const q = value("quantity"),
      rate = value("rate");
    if (
      ui.role !== "reviewer" ||
      !text("label") ||
      !text("spec") ||
      !text("source") ||
      !Number.isFinite(q) ||
      q <= 0 ||
      !safeAmount(rate) ||
      !safeAmount(Math.round(q * rate))
    ) {
      formError(
        form,
        "Complete the description, source reference, quantity, and integer IDR rate.",
      );
      return;
    }
    rcInvalidate(c);
    c.lines.push({
      id: `${c.id}-L${Date.now()}`,
      label: text("label"),
      spec: text("spec"),
      quantity: q,
      unit: text("unit"),
      rate,
      originalQuantity: q,
      originalRate: rate,
      source: text("source"),
      reviewed: false,
    });
    log(
      c,
      "Unreviewed scope line added",
      `${text("label")} · budget v${c.version}`,
    );
    closeModal();
    render();
    notify("Source-linked line added. The revised budget needs review.");
  } else if (form.id === "line-form") {
    if (ui.role !== "reviewer") return;
    const l = c.lines.find((l) => l.id === form.dataset.line),
      q = value("quantity"),
      rate = value("rate");
    if (
      !l ||
      !Number.isFinite(q) ||
      q <= 0 ||
      q > 100000 ||
      !safeAmount(rate) ||
      !safeAmount(Math.round(q * rate)) ||
      !text("note")
    ) {
      formError(
        form,
        "Enter valid quantities, integer IDR rates, and a review rationale.",
      );
      return;
    }
    const changed = q !== l.quantity || rate !== l.rate;
    if (changed) rcInvalidate(c);
    l.quantity = q;
    l.rate = rate;
    l.reviewed = true;
    l.reviewNote = text("note");
    l.reviewedBy = RC_ROLES[ui.role].name;
    log(
      c,
      changed ? "Scope line revised and reviewed" : "Scope line reviewed",
      `${l.label} · ${q} ${l.unit} × ${rupiah(rate)} · ${text("note")}`,
    );
    closeModal();
    render();
    notify(
      changed
        ? "New budget version created. Prior baseline preserved."
        : "Reviewed line recorded.",
    );
  } else if (form.id === "document-form") {
    if (ui.role !== "reviewer") return;
    const d = c.documents.find((d) => d.id === form.dataset.document),
      status = text("status");
    if (
      !d ||
      ![
        "Received",
        "Needs correction",
        "Reviewer accepted",
        "Not applicable",
        "Missing",
      ].includes(status) ||
      !text("note")
    ) {
      formError(form, "Choose a review state and give a rationale.");
      return;
    }
    d.status = status;
    d.note = text("note");
    d.reviewer = RC_ROLES[ui.role].name;
    d.reviewedAt = new Date().toISOString();
    if (!["Reviewer accepted", "Not applicable"].includes(status)) {
      c.packetStatus = "Draft";
      if (c.facilityActive) {
        c.facilityActive = false;
        c.creditStatus = "Re-review required";
      }
    }
    log(c, "Demo evidence review recorded", `${d.type}: ${status} · ${d.note}`);
    closeModal();
    render();
    notify(
      "Evidence state and rationale saved. No real verification occurred.",
    );
  } else if (form.id === "funding-form") {
    const cash = value("cash"),
      reserve = value("contingency"),
      fees = value("fees");
    if (
      !safeAmount(cash) ||
      !safeAmount(fees) ||
      !Number.isInteger(reserve) ||
      reserve < 0 ||
      reserve > 50 ||
      !text("notes")
    ) {
      formError(
        form,
        "Enter integer IDR amounts, a reserve from 0–50%, and the cost assumptions.",
      );
      return;
    }
    const budgetChanged = reserve !== c.contingency || fees !== c.fees;
    const active = ui.role === "lender" && f.has("active"),
      facility = ui.role === "lender" ? value("facility") : c.facility;
    const currentR = rcReadiness(c);
    if (
      ui.role === "lender" &&
      (!safeAmount(facility) ||
        (active &&
          (!currentR.accepted ||
            !currentR.ready ||
            c.packetStatus !== "Accepted" ||
            budgetChanged ||
            text("unknown"))))
    ) {
      formError(
        form,
        "Accept the current budget and financing packet before recording a usable facility. Changing budget costs requires re-review first.",
      );
      return;
    }
    if (active && !text("facilityReference")) {
      formError(
        form,
        "Record a fictional facility reference before marking it usable.",
      );
      return;
    }
    if (
      active &&
      facility >
        Math.max(
          0,
          rcBudget(c) + Math.round((rcBudget(c) * reserve) / 100) + fees - cash,
        )
    ) {
      formError(
        form,
        "This renovation-only demo facility cannot exceed the cost less committed owner cash.",
      );
      return;
    }
    if (budgetChanged) rcInvalidate(c);
    if (c.cash !== cash && c.facilityActive && !active) {
      c.facilityActive = false;
      c.creditStatus = "Re-review required";
    }
    c.cash = cash;
    c.fees = fees;
    c.contingency = reserve;
    c.fundingNotes = text("notes");
    c.unknownCosts = text("unknown") ? [text("unknown")] : [];
    if (c.unknownCosts.length) {
      c.packetStatus = "Draft";
      c.facilityActive = false;
      c.creditStatus = "Re-review required";
    }
    if (ui.role === "lender") {
      c.facility = facility;
      c.facilityReference = text("facilityReference");
      c.facilityActive = active;
      c.creditStatus = active ? "Facility active" : "Conditional";
      if (active) {
        c.status = "Funding ready";
        c.next = "Agree the start date and first milestone evidence";
      }
    }
    log(
      c,
      "Funding assumptions updated",
      `${rupiah(c.cash)} owner cash · ${c.contingency}% reserve · ${c.facilityActive ? "demo facility usable" : "no usable facility"}`,
    );
    closeModal();
    render();
    notify(
      "Funding assumptions saved. Only usable commitments reduce the gap.",
    );
  } else if (form.id === "new-case-form") {
    const name = text("name"),
      owner = text("owner"),
      location = text("location"),
      budget = value("budget"),
      cash = value("cash");
    if (
      !name ||
      !owner ||
      !location ||
      !text("objective") ||
      !safeAmount(budget) ||
      budget < 1000000 ||
      !safeAmount(cash)
    ) {
      formError(
        form,
        "Complete the case details with fictional names and valid integer IDR amounts.",
      );
      return;
    }
    const source = rcSeed().cases[0],
      id = `RC-${Date.now().toString(36).toUpperCase()}`;
    const fresh = {
      ...structuredClone(source),
      id,
      name,
      owner,
      location,
      status: "Scope review",
      version: 1,
      acceptedVersion: null,
      packetStatus: "Draft",
      creditStatus: "Not requested",
      facility: 0,
      facilityActive: false,
      cash,
      fees: 0,
      contingency: 10,
      next: text("scope").startsWith("Structural")
        ? "Specialist scope review required"
        : "Replace the provisional budget with source-backed scope",
      unknownCosts: ["Fees and site-specific costs not priced"],
      lines: [
        {
          id: `${id}-L1`,
          label: "Provisional renovation scope",
          spec: text("objective"),
          quantity: 1,
          unit: "package",
          rate: budget,
          source: "Owner planning input · no quote yet",
          originalQuantity: 1,
          originalRate: budget,
          reviewed: false,
        },
      ],
      documents: source.documents.map((d) => ({
        ...d,
        name: `demo-${d.id}-not-received`,
        status: "Missing",
        reviewer: null,
        note: "No supporting demo record received.",
        version: 1,
      })),
      changes: [],
      claim: null,
      history: [],
      snapshots: [],
    };
    store.cases.unshift(fresh);
    log(
      fresh,
      "Draft renovation case created",
      `${text("scope")} · ${text("objective")}`,
    );
    closeModal();
    openCase(id);
    notify("Draft case created. The provisional amount is not a reviewed RAB.");
  } else if (form.id === "add-evidence-form") {
    if (!text("type") || !text("filename")) {
      formError(form, "Enter a fictional record type and filename.");
      return;
    }
    c.documents.push({
      id: `doc-${Date.now()}`,
      name: text("filename"),
      type: text("type"),
      status: "Received",
      version: 1,
      source: "User-created illustrative record",
      reviewer: null,
      note: "Demo metadata only; no file has been uploaded.",
    });
    c.packetStatus = "Draft";
    log(c, "Illustrative evidence record added", text("type"));
    closeModal();
    render();
    notify("Demo record added. No real file uploaded.");
  } else if (form.id === "packet-form") {
    const r = rcReadiness(c);
    if (ui.role !== "lender" || !r.ready || !r.accepted || !text("note")) {
      formError(
        form,
        "Complete the budget and evidence reviews, then use the lender perspective.",
      );
      return;
    }
    c.packetStatus = "Accepted";
    c.status = "Awaiting lender";
    c.next = "Record lender conditions and facility availability";
    log(
      c,
      "Demo packet accepted for lender review",
      `Budget v${c.version} · ${text("note")} · not a credit approval`,
    );
    closeModal();
    render();
    notify("Demo packet accepted. No credit approval is implied.");
  } else if (form.id === "change-form") {
    if (
      !text("title") ||
      !text("reason") ||
      !safeAmount(value("amount")) ||
      value("amount") <= 0 ||
      !Number.isInteger(value("days")) ||
      value("days") < 0 ||
      value("days") > 365
    ) {
      formError(
        form,
        "Enter a change, rationale, integer IDR amount, and valid days.",
      );
      return;
    }
    c.changes.push({
      id: `CO-${Date.now().toString(36).toUpperCase()}`,
      title: text("title"),
      reason: text("reason"),
      amount: value("amount"),
      days: value("days"),
      ownerAck: false,
      status: "Awaiting owner",
    });
    log(
      c,
      "Scope change proposed",
      `${text("title")} · ${rupiah(value("amount"))}`,
    );
    closeModal();
    render();
    notify("Proposed change saved. Owner acknowledgment is required.");
  } else if (form.id === "ack-change-form") {
    const x = c.changes.find((x) => x.id === form.dataset.change);
    if (ui.role !== "owner" || !x || !f.has("ack") || x.status === "Accepted")
      return;
    x.ownerAck = true;
    x.status = "Awaiting review";
    log(
      c,
      "Demo owner acknowledged a scope change",
      `${x.title} · ${rupiah(x.amount)} · ${x.days} days`,
    );
    closeModal();
    render();
    notify("Acknowledgment recorded. Reviewer acceptance is still required.");
  } else if (form.id === "accept-change-form") {
    const x = c.changes.find((x) => x.id === form.dataset.change);
    if (
      ui.role !== "reviewer" ||
      !x ||
      !x.ownerAck ||
      x.status === "Accepted" ||
      !text("note")
    ) {
      formError(
        form,
        "Owner acknowledgment and a reviewer rationale are required.",
      );
      return;
    }
    rcInvalidate(c);
    x.status = "Accepted";
    x.reviewNote = text("note");
    c.lines.push({
      id: `${c.id}-${x.id}`,
      label: x.title,
      spec: x.reason,
      quantity: 1,
      unit: "package",
      rate: x.amount,
      originalQuantity: 1,
      originalRate: x.amount,
      source: `${x.id} · owner acknowledgment`,
      reviewed: true,
      reviewedBy: RC_ROLES[ui.role].name,
    });
    log(
      c,
      "Acknowledged change accepted into revised scope",
      `${x.id} · budget v${c.version} needs re-review`,
    );
    closeModal();
    render();
    notify(
      "New budget version created. Existing claim baseline must be reviewed again.",
    );
  } else if (form.id === "certify-form") {
    const x = c.claim,
      t = rcClaimTotals(c);
    if (!x || ui.role !== "reviewer" || t.stale || x.status !== "Submitted")
      return;
    const values = x.items.map((i, n) => value(`certified-${n}`));
    if (
      !text("note") ||
      values.some(
        (v, n) =>
          !safeAmount(v) ||
          v > x.items[n].requested ||
          v >
            Math.round(
              c.lines[x.items[n].line].quantity * c.lines[x.items[n].line].rate,
            ),
      ) ||
      values.reduce((s, v) => s + v, 0) <= 0
    ) {
      formError(
        form,
        "Certified amounts must be positive in total and within claimed and accepted scope, with a rationale.",
      );
      return;
    }
    x.items.forEach((i, n) => (i.certified = values[n]));
    x.status = "Certified";
    x.certificateNote = text("note");
    x.certifiedBy = RC_ROLES[ui.role].name;
    log(
      c,
      "Demo claim certified",
      `${x.id} · ${rupiah(values.reduce((s, v) => s + v, 0))} supported · ${text("note")}`,
    );
    closeModal();
    render();
    notify(
      "Certification recorded. Authorization and payment remain separate.",
    );
  } else if (form.id === "authorize-form") {
    const x = c.claim,
      t = rcClaimTotals(c);
    if (!x || ui.role !== "lender" || t.stale || x.status !== "Certified")
      return;
    if (
      !text("reference") ||
      !text("note") ||
      x.certifiedBy === RC_ROLES[ui.role].name ||
      !c.facilityActive ||
      t.certified > rcFinance(c).undrawn
    ) {
      formError(
        form,
        "Use a separate lender, an active demo facility, a unique reference, and a rationale within the usable amount.",
      );
      return;
    }
    if (
      store.cases.some(
        (z) =>
          z.claim?.authorization?.reference.toLowerCase() ===
          text("reference").toLowerCase(),
      )
    ) {
      formError(form, "This authorization reference is already recorded.");
      return;
    }
    x.authorization = {
      reference: text("reference"),
      amount: t.certified,
      actor: RC_ROLES[ui.role].name,
      note: text("note"),
      time: new Date().toISOString(),
      budgetVersion: c.version,
    };
    x.status = "Authorized";
    log(
      c,
      "Demo claim authorization recorded",
      `${x.id} · ${rupiah(t.certified)} · ${text("reference")}`,
    );
    closeModal();
    render();
    notify("Demo authorization recorded. No money has moved.");
  } else if (form.id === "payment-form") {
    const x = c.claim,
      t = rcClaimTotals(c),
      amount = value("amount"),
      ref = text("reference");
    if (
      !x ||
      ui.role !== "lender" ||
      t.stale ||
      !["Authorized", "Partially paid"].includes(x.status)
    )
      return;
    if (
      !ref ||
      !safeAmount(amount) ||
      amount <= 0 ||
      amount > x.authorization.amount - t.paid
    ) {
      formError(
        form,
        "Enter a reference and a positive integer amount within the remaining authorization.",
      );
      return;
    }
    if (
      store.cases.some((z) =>
        z.claim?.payments.some(
          (p) => p.reference.toLowerCase() === ref.toLowerCase(),
        ),
      )
    ) {
      formError(
        form,
        "This external payment reference is already recorded. Duplicate records are not allowed.",
      );
      return;
    }
    x.payments.push({
      reference: ref,
      amount,
      recordedBy: RC_ROLES[ui.role].name,
      time: new Date().toISOString(),
      fictional: true,
    });
    x.status =
      rcClaimTotals(c).paid === x.authorization.amount
        ? "Paid"
        : "Partially paid";
    log(
      c,
      "Fictional external payment recorded",
      `${x.id} · ${rupiah(amount)} · ${ref} · no transfer performed`,
    );
    closeModal();
    render();
    notify("Fictional external payment recorded. No funds transferred.");
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "global-search") {
    const q = e.target.value;
    ui.page = "cases";
    ui.query = q;
    ui.filter = "All cases";
    render();
    const input = document.querySelector("#global-search");
    input.value = q;
    input.focus();
    input.setSelectionRange(q.length, q.length);
  } else if (e.target.id === "case-search") {
    ui.query = e.target.value;
    document.querySelector("#case-results").innerHTML =
      caseTable(filteredCases());
  }
});
document.addEventListener("keydown", (e) => {
  const modal = document.querySelector(".modal");
  if (e.key === "Escape") {
    if (modal) closeModal();
    else if (ui.menu || ui.notifications) {
      ui.menu = false;
      ui.notifications = false;
      render();
    }
  }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    if (window.innerWidth <= 1050) {
      navigate("cases");
      document.querySelector("#case-search")?.focus();
    } else document.querySelector("#global-search")?.focus();
  }
  if (
    e.target.getAttribute("role") === "tab" &&
    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
  ) {
    e.preventDefault();
    const tabs = ["scope", "funding", "evidence", "changes", "history"],
      n = tabs.indexOf(ui.tab);
    ui.tab =
      e.key === "Home"
        ? tabs[0]
        : e.key === "End"
          ? tabs.at(-1)
          : tabs[(n + (e.key === "ArrowRight" ? 1 : 4)) % 5];
    render();
    document.querySelector(`#tab-${ui.tab}`).focus();
  }
  if (modal && e.key === "Tab") {
    const all = [
      ...modal.querySelectorAll("button,input,textarea,select,a[href]"),
    ].filter((el) => !el.disabled && el.getClientRects().length);
    const first = all[0],
      last = all.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
render();
