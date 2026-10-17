"use strict";
// A static, local-first prototype. No production credit decisions or external services.
const paths = {
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h5",
  chart: "M3 3v18h18 M7 14l4-5 4 3 6-8",
  shield: "M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z M8 12l3 3 5-6",
  building:
    "M4 21V7l8-4 8 4v14 M2 21h20 M8 8v2 M12 8v2 M16 8v2 M8 13v2 M12 13v2 M16 13v2 M10 21v-3h4v3",
  wallet:
    "M20 8V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h16v11H5a3 3 0 0 1-3-3V6 M21 12h-6v5h6",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M9 3h6l1 3 3 1 2 5-2 3-1 3-5 3-3-2-3-1-3-5 2-3z",
  search: "M21 21l-5-5 M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4",
  down: "M8 10l4 4 4-4",
  right: "M9 5l7 7-7 7",
  left: "M15 5l-7 7 7 7",
  arrow: "M4 12h16 M14 6l6 6-6 6",
  up: "M7 17L17 7 M7 7h10v10",
  trend: "M3 17l6-6 4 4 8-10 M15 5h6v6",
  plus: "M12 5v14 M5 12h14",
  download: "M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5",
  calendar: "M4 5h16v16H4z M4 10h16 M8 3v4 M16 3v4",
  check: "M5 12l4 4L19 6",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l3 2",
  info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 11v6 M12 7h.01",
  alert: "M12 3L2 21h20z M12 9v5 M12 17h.01",
  close: "M6 6l12 12 M18 6L6 18",
  layers: "M12 3L2 8l10 5 10-5z M2 12l10 5 10-5 M2 16l10 5 10-5",
  help: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M9 9a3 3 0 1 1 4 3v2 M12 17h.01",
  menu: "M4 6h16 M4 12h16 M4 18h16",
  refresh:
    "M20 7v5h-5 M4 17v-5h5 M6 7a7 7 0 0 1 12-2l2 3 M4 16l2 3a7 7 0 0 0 12-2",
  user: "M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M4 21v-3a8 8 0 0 1 16 0v3",
  lock: "M6 10h12v11H6z M8 10V6a4 4 0 0 1 8 0v4",
  leaf: "M20 3C8 2 2 8 6 15s16 4 14-12 M4 21l12-13",
  dots: "M5 12h.01 M12 12h.01 M19 12h.01",
};
const icon = (name, size = 18) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.file}"/></svg>`;
const escapeHTML = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const money = (v) =>
  `Rp ${new Intl.NumberFormat("en-US", { maximumFractionDigits: Math.abs(v) >= 1000 ? 2 : 1 }).format(Math.abs(v) >= 1000 ? v / 1000 : v)}${Math.abs(v) >= 1000 ? "B" : "M"}`;
const today = () => new Date().toISOString();
const defaults = [
  {
    id: "SC-2026-001",
    name: "Menteng Heritage",
    borrower: "Aditya Pratama",
    location: "Menteng, Jakarta",
    amount: 1250,
    value: 2400,
    income: 65,
    debt: 8,
    months: 60,
    contractor: 95,
    score: 92,
    status: "In review",
    progress: 68,
    created: "2026-10-15",
  },
  {
    id: "SC-2026-002",
    name: "BSD Residence",
    borrower: "Diana Putri",
    location: "BSD City, Tangerang",
    amount: 850,
    value: 1650,
    income: 42,
    debt: 5,
    months: 60,
    contractor: 89,
    score: 88,
    status: "In review",
    progress: 42,
    created: "2026-10-14",
  },
  {
    id: "SC-2026-003",
    name: "Kemang Townhouse",
    borrower: "Rizky Santoso",
    location: "Kemang, Jakarta",
    amount: 2100,
    value: 3000,
    income: 80,
    debt: 18,
    months: 84,
    contractor: 75,
    score: 74,
    status: "Pending docs",
    progress: 25,
    created: "2026-10-13",
  },
  {
    id: "SC-2026-004",
    name: "Sentul Green Living",
    borrower: "Maya Kusuma",
    location: "Sentul, Bogor",
    amount: 650,
    value: 1400,
    income: 38,
    debt: 3,
    months: 60,
    contractor: 97,
    score: 95,
    status: "Approved",
    progress: 80,
    created: "2026-10-12",
  },
  {
    id: "SC-2026-005",
    name: "Surabaya Modern",
    borrower: "Budi Wijaya",
    location: "Darmo, Surabaya",
    amount: 1750,
    value: 2800,
    income: 70,
    debt: 12,
    months: 84,
    contractor: 86,
    score: 84,
    status: "In review",
    progress: 55,
    created: "2026-10-11",
  },
  {
    id: "SC-2026-006",
    name: "Bandung Courtyard",
    borrower: "Nadia Rahman",
    location: "Dago, Bandung",
    amount: 920,
    value: 1900,
    income: 50,
    debt: 4,
    months: 60,
    contractor: 92,
    score: 91,
    status: "Approved",
    progress: 62,
    created: "2026-10-10",
  },
  {
    id: "SC-2026-007",
    name: "Canggu Studio",
    borrower: "Andre Saputra",
    location: "Canggu, Bali",
    amount: 1100,
    value: 1300,
    income: 30,
    debt: 12,
    months: 60,
    contractor: 60,
    score: 48,
    status: "Rejected",
    progress: 0,
    created: "2026-10-09",
  },
];
const storageKey = "renovacredit-v3";
let storageAvailable = true;
function load() {
  try {
    const data = JSON.parse(
      localStorage.getItem(storageKey) ||
        localStorage.getItem("secha-credit-v2"),
    );
    if (
      data &&
      Array.isArray(data.apps) &&
      data.apps.length &&
      data.apps.every(
        (a) =>
          typeof a.id === "string" &&
          typeof a.name === "string" &&
          Number.isFinite(a.amount) &&
          a.amount > 0 &&
          Number.isFinite(a.score) &&
          ["In review", "Approved", "Pending docs", "Rejected"].includes(
            a.status,
          ),
      )
    )
      return data;
  } catch {}
  return {
    apps: structuredClone(defaults),
    activity: [],
    settings: {
      name: "Alex Morgan",
      email: "alex@example.com",
      notifications: true,
    },
    milestones: [],
  };
}
let data = load();
data.activity = Array.isArray(data.activity) ? data.activity : [];
data.settings = data.settings || {
  name: "Alex Morgan",
  email: "alex@example.com",
  notifications: true,
};
data.milestones = Array.isArray(data.milestones) ? data.milestones : [];
data.policy = { ...renovaDefaultPolicy, ...data.policy };
data.apps.forEach((a, i) => {
  a.property = a.property || propertyDefaults(a, i, true);
  a.score = assess(a).score;
});
const state = {
  page: "dashboard",
  filter: "All applications",
  query: "",
  range: "6m",
  period: "month",
  pagination: 1,
  role: "bank",
  audience: "bank",
  intelligenceProject: defaults[0].id,
  menu: false,
  notifications: false,
  selectedProject: defaults[3].id,
};
let modalOpener = null,
  toastTimer;
function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch {
    storageAvailable = false;
    toast("Browser storage unavailable. Changes last for this session only.");
  }
}
function toast(message) {
  const el = document.querySelector("#toast");
  el.textContent = message;
  el.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("visible"), 4200);
}
function record(message, project) {
  data.activity.unshift({ message, project, time: today() });
  data.activity = data.activity.slice(0, 20);
  save();
}
const badge = (s) =>
  `<span class="badge ${s === "Approved" ? "approved" : s === "In review" ? "review" : s === "Rejected" ? "rejected" : "pending"}">${escapeHTML(s)}</span>`;
const scoreHTML = (s) =>
  `<span class="score ${s < 60 ? "low" : s < 80 ? "medium" : ""}"><i></i>${s}<span class="muted" style="font-size:8px">/100</span></span>`;
const button = (label, action, ico = "", primary = false) =>
  `<button class="btn ${primary ? "primary" : ""}" data-action="${action}">${ico ? icon(ico, 14) : ""}${label}</button>`;
const names = {
  dashboard: "Overview",
  applications: "Applications",
  portfolio: "Portfolio",
  engine: "Credit simulator",
  intelligence: "Property intelligence",
  passport: "Renovation passport",
  policy: "Lending policy",
  milestones: "Disbursements",
  reports: "Reports",
  settings: "Settings",
  borrower: "My project",
};
function navigate(page) {
  state.page = page;
  state.menu = false;
  state.notifications = false;
  state.query = "";
  state.filter = "All applications";
  state.pagination = 1;
  render();
  window.scrollTo(0, 0);
  document.title = `${names[page]} · RenovaCredit`;
}
function render() {
  const review = data.apps.filter((a) => a.status === "In review").length;
  document.querySelector("#app").innerHTML =
    `${state.menu ? '<div class="mobile-scrim" data-action="menu"></div>' : ""}
<aside class="sidebar ${state.menu ? "open" : ""}" aria-label="Main navigation"><a class="brand" href="#" data-action="home"><img src="assets/favicon.svg" alt=""><div><div class="brand-name">renova<span>credit</span></div><div class="brand-caption">INTELLIGENCE BY SECHA</div></div></a>
<div class="workspace"><div class="workspace-icon">${icon("building", 16)}</div><div><strong>Indonesia workspace</strong><small>Renovation & secondary property</small></div><span style="margin-left:auto;color:#9ba591">${icon("down", 13)}</span></div>
<div class="nav-label">WORKSPACE</div><nav>${(state.role === "bank"
      ? [
          ["dashboard", "grid"],
          ["applications", "file"],
          ["portfolio", "layers"],
          ["intelligence", "shield"],
          ["engine", "chart"],
          ["passport", "file"],
          ["milestones", "wallet"],
          ["reports", "chart"],
        ]
      : [
          ["borrower", "building"],
          ["intelligence", "shield"],
          ["engine", "chart"],
          ["passport", "file"],
          ["milestones", "wallet"],
        ]
    )
      .map(
        ([p, i]) =>
          `<button data-page="${p}" class="nav-item ${state.page === p ? "active" : ""}" ${state.page === p ? 'aria-current="page"' : ""}>${icon(i)}${names[p]}${p === "applications" ? `<span class="nav-count">${review}</span>` : ""}</button>`,
      )
      .join("")}</nav>
<div class="sidebar-bottom"><button class="nav-item ${state.page === "settings" ? "active" : ""}" data-page="settings">${icon("settings")}Settings</button><div class="help-card"><div class="flex gap">${icon("leaf", 16)}<strong style="font-size:11px;font-weight:500">See the potential. Fund it better.</strong></div><p>One property. A complete picture. From first assessment to final handover.</p><button data-action="guide">Explore the workspace ${icon("up", 12)}</button></div><button class="profile" style="width:100%;text-align:left" data-page="settings"><div class="avatar">${escapeHTML(
      (data.settings.name || "Alex Morgan")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2),
    )}</div><div><strong>${escapeHTML(data.settings.name)}</strong><small>${state.role === "bank" ? "Credit operations" : "Borrower workspace"}</small></div>${icon("down", 13)}</button></div></aside>
<div class="main-shell"><header class="topbar"><button class="icon-button mobile-menu" data-action="menu" aria-label="Toggle navigation" aria-expanded="${state.menu}">${icon("menu", 17)}</button><div class="breadcrumb">RenovaCredit ${icon("right", 10)}<strong>${names[state.page]}</strong><span class="prototype">PROTOTYPE</span></div><div class="top-actions"><label class="search-box">${icon("search", 14)}<input id="global-search" aria-label="Search applications" placeholder="Search anything…" value="${escapeHTML(state.query)}"><span class="key">⌘ K</span></label><button class="icon-button" data-action="notifications" aria-label="Notifications" aria-expanded="${state.notifications}">${icon("bell", 16)}${data.settings.notifications ? '<i class="notification-dot"></i>' : ""}</button><div class="top-divider"></div><button class="avatar" aria-label="Account settings" data-page="settings">${escapeHTML(
      (data.settings.name || "Alex Morgan")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2),
    )}</button></div>${state.notifications ? `<section class="panel notification-panel" aria-label="Notifications"><div class="between"><h3>Workspace updates</h3><button data-action="notifications" aria-label="Close notifications">${icon("close", 14)}</button></div><p>${review} applications are waiting for credit review.</p><p>${data.apps.filter((a) => a.status === "Pending docs").length} application needs supporting documents.</p><button class="text-btn" data-page="applications">Open application queue ${icon("arrow", 13)}</button></section>` : ""}</header>
<main id="main-content" class="content" tabindex="-1">${audienceBar()}${view()}<footer class="bottom-note"><span>${icon("shield", 12)} Planning prototype · Human review required</span><span class="live">Local workspace${storageAvailable ? " saved" : ""}</span></footer></main></div>`;
}
function heading(title, desc, actions = "") {
  return `<div class="page-heading"><div><h1>${title}</h1><p>${desc}</p></div><div class="heading-actions">${actions}</div></div>`;
}
function view() {
  switch (state.page) {
    case "applications":
      return applications();
    case "portfolio":
      return portfolio();
    case "engine":
      return engine();
    case "intelligence":
      return intelligenceView();
    case "passport":
      return passportView();
    case "policy":
      return policyView();
    case "milestones":
      return milestones();
    case "reports":
      return reports();
    case "settings":
      return settings();
    case "borrower":
      return borrower();
    default:
      return dashboard();
  }
}
function metrics() {
  const active = data.apps.filter((a) => a.status === "Approved");
  const total = active.reduce((s, a) => s + a.amount, 0);
  const reviewed = data.apps.filter((a) =>
    ["Approved", "Rejected"].includes(a.status),
  );
  const rate = reviewed.length
    ? Math.round((active.length / reviewed.length) * 100)
    : 0;
  const average = Math.round(
    data.apps.reduce((s, a) => s + propertyAnalysis(a).renovaScore, 0) /
      data.apps.length,
  );
  const items = [
    [
      "Active portfolio",
      money(total),
      "wallet",
      "Approved book",
      "committed",
      [30, 25, 27, 18, 21, 10, 12, 3],
    ],
    [
      "Applications",
      String(data.apps.length).padStart(2, "0"),
      "file",
      `${data.apps.filter((a) => a.status === "In review").length} in review`,
      "in workspace",
      [28, 22, 26, 18, 19, 12, 17, 4],
    ],
    [
      "Approval rate",
      `${rate}<small>%</small>`,
      "check",
      `${active.length} approved`,
      "of decided",
      [23, 26, 19, 21, 12, 15, 9, 3],
    ],
    [
      "Average RenovaScore",
      `${average}<small> / 100</small>`,
      "shield",
      "Rule-based",
      "demo model",
      [30, 26, 28, 19, 22, 14, 10, 5],
    ],
  ];
  return `<div class="metrics">${items.map(([l, v, i, c, t, points]) => `<section class="panel metric"><div class="metric-label">${l}${icon(i, 15)}</div><div class="metric-value mono">${v}</div><div class="metric-bottom"><span class="metric-change">${icon("trend", 11)}${c}</span>${t}</div><div class="metric-spark"><svg viewBox="0 0 75 35" aria-hidden="true"><path d="M0 ${points[0]} ${points.map((y, i) => `L${i * 10 + 3} ${y}`).join(" ")}" fill="none" stroke="#9bb880" stroke-width="1.5"/></svg></div></section>`).join("")}</div>`;
}
function dashboard() {
  const persona = renovaAudiences[state.audience];
  return `${heading(persona.headline, persona.description, button("Export report", "export", "download") + button("New application", "new", "plus", true))}
 ${intelligenceHero()}${state.audience === "investor" ? opportunityComparison() : state.audience === "institution" ? institutionSummary() : ""}
 <div class="summary-row"><div class="statusbar"><i class="dot"></i>Portfolio at a glance<span style="color:#cbd1c2;margin:0 2px">/</span><span style="color:#7c8975">IDR · Indonesia</span></div><span>Live calculations · Sample inputs</span></div>${metrics()}
 <div class="dashboard-grid"><section class="panel performance"><div class="panel-header"><div><h2>Capital in motion</h2><p class="sub">Illustrative disbursement & repayment trends</p></div><div class="segmented" aria-label="Chart period">${["3m", "6m", "1y"].map((t) => `<button class="${state.range === t ? "active" : ""}" data-range="${t}" aria-pressed="${state.range === t}">${t.toUpperCase()}</button>`).join("")}</div></div><div class="chart-key"><span><i></i>Disbursed</span><span><i></i>Repaid</span><span style="margin-left:auto">In IDR billion</span></div>${chart()}</section>
 ${health()}
 <section class="panel queue-panel"><div class="panel-header"><div><h2>Renovation pipeline</h2><p class="sub">Every property. Every decision. One clear view.</p></div><button class="text-btn" data-page="applications">View all ${icon("arrow", 13)}</button></div>${filters()}${applicationTable(true)}</section>
 ${attention()}${activity()}</div>`;
}
function chart() {
  const sets = {
    "3m": { labels: ["Aug", "Sep", "Oct"], d: [8, 14, 20], r: [5, 8, 12] },
    "6m": {
      labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
      d: [4, 8, 7, 13, 12, 20],
      r: [2, 5, 4, 8, 8, 12],
    },
    "1y": {
      labels: ["Nov", "Jan", "Mar", "May", "Jul", "Oct"],
      d: [2, 4, 6, 8, 14, 24],
      r: [1, 2, 4, 5, 9, 15],
    },
  };
  const set = sets[state.range];
  const points = (vals) =>
    vals.map((v, i) => [45 + (i * 490) / (vals.length - 1), 160 - v * 5.5]);
  function line(vals) {
    const p = points(vals);
    return p.reduce(
      (s, [x, y], i) =>
        i
          ? s + ` C${p[i - 1][0] + 45} ${p[i - 1][1]} ${x - 45} ${y} ${x} ${y}`
          : `M${x} ${y}`,
      "",
    );
  }
  return `<div class="chart"><svg role="img" aria-label="Illustrative capital chart over ${state.range}: disbursed rises from ${set.d[0]} to ${set.d.at(-1)} billion rupiah" viewBox="0 0 570 195" preserveAspectRatio="none"><defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#dce9c9" stop-opacity=".6"/><stop offset="1" stop-color="#edf4e2" stop-opacity=".05"/></linearGradient></defs>${[0, 5, 10, 15, 20, 25].map((v) => `<line class="grid" x1="45" x2="535" y1="${160 - v * 5.5}" y2="${160 - v * 5.5}"/><text x="5" y="${164 - v * 5.5}">${v}</text>`).join("")}<path d="${line(set.d)} L535 160 L45 160 Z" fill="url(#chart-fill)"/><path d="${line(set.r)}" stroke="#c6d8a7" stroke-width="2" fill="none" stroke-dasharray="5 4"/><path d="${line(set.d)}" stroke="#64834f" stroke-width="2.3" fill="none"/>${points(
    set.d,
  )
    .map(
      ([x, y], i) =>
        `<circle cx="${x}" cy="${y}" r="3" fill="#fff" stroke="#64834f" stroke-width="2"><title>${set.labels[i]}: disbursed Rp ${set.d[i]}B, repaid Rp ${set.r[i]}B</title></circle>`,
    )
    .join(
      "",
    )}${set.labels.map((v, i) => `<text text-anchor="middle" x="${45 + (i * 490) / (set.labels.length - 1)}" y="185">${v}</text>`).join("")}</svg><div class="chart-tooltip">${set.labels.at(-1)} · Illustrative<br>Disbursed <strong>Rp ${set.d.at(-1)}B</strong><br>Repaid <strong>Rp ${set.r.at(-1)}B</strong></div></div>`;
}
function health() {
  const creditOK = (a) => {
    const r = assess(a);
    return (
      r.ltv <= data.policy.maxLtv &&
      r.dsr <= data.policy.maxDsr &&
      r.score >= data.policy.minScore
    );
  };
  const ready = data.apps.filter(
    (a) => creditOK(a) && approvalReasons(a).length === 0,
  ).length;
  const evidence = data.apps.filter(
    (a) => creditOK(a) && approvalReasons(a).length > 0,
  ).length;
  const flagged = data.apps.length - ready - evidence;
  const percent = Math.round((ready / data.apps.length) * 100);
  const items = [
    ["Within policy", ready, "#64814f"],
    ["Evidence gaps", evidence, "#d1bb7e"],
    ["Policy flags", flagged, "#d6dace"],
  ];
  let offset = 0;
  return `<section class="panel health-panel"><div class="panel-header"><div><h2>Decision readiness</h2><p class="sub">Current credit policy & evidence gates</p></div>${icon("info", 14)}</div><div class="health-body"><div class="donut"><svg viewBox="0 0 120 120" role="img" aria-label="${percent}% of applications pass current demo credit and evidence gates"><circle cx="60" cy="60" r="49" stroke="#f1f3ec" stroke-width="11" fill="none"/>${items
    .map(([, n, c]) => {
      const len = (n / data.apps.length) * 307.88;
      const svg = `<circle cx="60" cy="60" r="49" stroke="${c}" stroke-width="11" fill="none" stroke-dasharray="${Math.max(0, len - 4)} ${307.88 - Math.max(0, len - 4)}" stroke-dashoffset="${-offset}"/>`;
      offset += len;
      return svg;
    })
    .join(
      "",
    )}</svg><div class="donut-center"><strong>${percent}<span style="font-size:16px">%</span></strong><small>Within demo policy</small></div></div><div class="legend">${items.map(([n, v, c]) => `<div class="legend-row"><i style="background:${c}"></i>${n}<strong>${v}</strong></div>`).join("")}</div></div><div class="health-note">${icon("shield", 13)}Current gates only · Independent verification required</div></section>`;
}
function filters() {
  return `<div class="table-toolbar"><div class="flex" style="gap:3px">${["All applications", "In review", "Approved"].map((s) => `<button class="filter ${state.filter === s ? "active" : ""}" data-filter="${s}" aria-pressed="${state.filter === s}">${s}<span class="count">${s === "All applications" ? data.apps.length : data.apps.filter((a) => a.status === s).length}</span></button>`).join("")}</div></div>`;
}
function filteredApps() {
  return data.apps.filter(
    (a) =>
      (state.filter === "All applications" || a.status === state.filter) &&
      [a.name, a.id, a.location, a.borrower].some((v) =>
        String(v).toLowerCase().includes(state.query.toLowerCase()),
      ),
  );
}
function applicationTable(compact = false) {
  const rows = filteredApps();
  const perPage = compact ? 5 : 8;
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  state.pagination = Math.min(state.pagination, pages);
  const start = (state.pagination - 1) * perPage;
  return `<div class="table-scroll"><table><thead><tr><th>Project / borrower</th><th>Loan amount</th><th>Credit score</th><th>Status</th><th><span class="muted">Review</span></th></tr></thead><tbody>${
    rows
      .slice(start, start + perPage)
      .map(
        (a) =>
          `<tr><td><div class="project-cell"><span class="project-icon">${icon("building", 16)}</span><div><strong>${escapeHTML(a.name)}</strong><small>${escapeHTML(a.location)}</small></div></div></td><td class="mono" style="font-weight:500">${money(a.amount)}</td><td>${scoreHTML(a.score)}</td><td>${badge(a.status)}</td><td><button class="icon-button" data-review="${escapeHTML(a.id)}" aria-label="Review ${escapeHTML(a.name)}">${icon("right", 12)}</button></td></tr>`,
      )
      .join("") ||
    '<tr><td colspan="5"><div class="empty"><strong>No applications found</strong>Try another search or filter, or create a new application.</div></td></tr>'
  }</tbody></table></div><div class="table-footer"><span>Showing ${rows.length ? start + 1 : 0}–${Math.min(start + perPage, rows.length)} of ${rows.length} applications</span><div class="pager"><button data-action="prev" ${state.pagination === 1 ? "disabled" : ""} aria-label="Previous page">${icon("left", 11)}</button><span class="current" style="padding:4px 7px">${state.pagination}</span><button data-action="next" ${state.pagination === pages ? "disabled" : ""} aria-label="Next page">${icon("right", 11)}</button></div></div>`;
}
function attention() {
  const pending = data.apps.find((a) => a.status === "Pending docs");
  const review = data.apps.find((a) => a.status === "In review");
  const items = [
    ...(pending
      ? [
          {
            title: "Supporting documents needed",
            desc: `${pending.name} · Contractor agreement`,
            id: pending.id,
            icon: "file",
          },
        ]
      : []),
    ...(review
      ? [
          {
            title: "Credit review awaiting decision",
            desc: `${review.name} · Score ${review.score}/100`,
            id: review.id,
            icon: "clock",
          },
        ]
      : []),
  ];
  return `<section class="panel attention-panel"><div class="panel-header"><h2>Needs your attention</h2><span class="badge review">${items.length} open</span></div><div class="attention-list">${items.map((a, i) => `<div class="attention-item"><div class="alert-icon ${i ? "red" : ""}">${icon(a.icon, 14)}</div><div><strong>${a.title}</strong><p>${escapeHTML(a.desc)}</p></div><button data-review="${a.id}" aria-label="Open ${escapeHTML(a.title)}">${icon("right", 13)}</button></div>`).join("") || '<div class="empty">You’re all caught up.</div>'}</div></section>`;
}
function activity() {
  const seeded = [
    {
      message: "Application approved",
      project: "Sentul Green Living",
      time: null,
    },
    {
      message: "Credit assessment completed",
      project: `BSD Residence · Score ${assess(data.apps.find((a) => a.id === defaults[1].id) || data.apps[0]).score}/100`,
      time: null,
    },
    {
      message: "New application received",
      project: "Menteng Heritage",
      time: null,
    },
  ];
  return `<section class="panel activity-panel"><div class="panel-header"><h2>Recent activity</h2><button data-page="reports" aria-label="View workspace activity">${icon("dots", 15)}</button></div><div class="activity-list">${[
    ...data.activity,
    ...seeded,
  ]
    .slice(0, 3)
    .map(
      (a, i) =>
        `<div class="activity"><span class="activity-icon">${icon(i === 0 ? "check" : i === 1 ? "shield" : "file", 12)}</span><div><strong>${escapeHTML(a.message)}</strong><p>${escapeHTML(a.project)}</p></div><time>${a.time ? "Just now" : "Sample"}</time></div>`,
    )
    .join("")}</div></section>`;
}
function applications() {
  return `${heading("Every project starts here.", "Review, assess, and move renovation applications forward.", button("Export CSV", "export", "download") + button("New application", "new", "plus", true))}${metrics()}<section class="panel full-panel"><div class="panel-header"><div><h2>Applications</h2><p class="sub">One queue, from origination to decision.</p></div><label><span class="sr-only" style="font-size:10px;color:#899780">Status </span><select id="status-filter" class="inline-search" aria-label="Filter application status">${["All applications", "In review", "Approved", "Pending docs", "Rejected"].map((s) => `<option ${state.filter === s ? "selected" : ""}>${s}</option>`).join("")}</select></label></div><div class="table-toolbar"><input class="inline-search" id="queue-search" placeholder="Search project, borrower, or ID…" aria-label="Search applications" value="${escapeHTML(state.query)}"><span class="sub">${filteredApps().length} applications</span></div><div id="queue-table">${applicationTable()}</div></section>`;
}
function portfolio() {
  const active = data.apps.filter((a) => a.status === "Approved");
  return `${heading("Capital with a purpose.", "A closer look at your approved renovation projects.", button("Export portfolio", "export-portfolio", "download"))}${metrics()}<div class="between"><h2>Active projects <span class="muted" style="font-size:12px;font-weight:400">${active.length}</span></h2><span class="sub">Approved applications only</span></div><div class="project-grid">${active.map((a) => `<section class="panel project-card"><div class="project-card-top"><svg class="building-art" viewBox="0 0 120 80" fill="none" stroke="#819769" stroke-width="1.4" aria-hidden="true"><path d="M10 80V27L45 5l35 22v53 M80 80V40l30 10v30 M17 32h56 M24 42h15v14H24z M51 42h15v14H51z M39 80V65h15v15 M88 55h12v13H88z"/><path d="M0 79h120"/></svg><span style="position:absolute;top:10px;right:10px">${badge(a.status)}</span></div><h3>${escapeHTML(a.name)}</h3><p class="sub">${escapeHTML(a.location)}</p><div class="between"><span class="amount mono">${money(a.amount)}</span>${scoreHTML(a.score)}</div><div class="between" style="margin-bottom:0"><span class="sub">Renovation progress</span><span style="font-size:10px">${a.progress}%</span></div><div class="progress-track"><i style="width:${a.progress}%"></i></div><div class="between" style="margin:0"><span class="sub">Loan-to-value</span><span style="font-size:11px">${Math.round((a.amount / a.value) * 100)}%</span></div><button class="btn" data-review="${a.id}">View project ${icon("arrow", 13)}</button></section>`).join("") || '<section class="panel empty"><strong>No approved projects yet</strong>Approve an application to add it to your portfolio.</section>'}</div>`;
}
// Model is deliberately transparent and deterministic; never a production recommendation.
function assess(values, policy = data.policy) {
  const { amount, value, income, debt, months, contractor } = values;
  const ltv = (amount / value) * 100;
  const r = policy.interest / 1200;
  const payment =
    r === 0 ? amount / months : (amount * r) / (1 - Math.pow(1 + r, -months));
  const dsr = ((debt + payment) / income) * 100;
  const collateral = Math.max(0, Math.min(100, (100 - ltv) * 2));
  const affordability = Math.max(0, Math.min(100, (70 - dsr) * 2));
  const score = Math.round(
    collateral * 0.4 + affordability * 0.4 + contractor * 0.2,
  );
  const decision =
    ltv > policy.maxLtv || dsr > policy.maxDsr
      ? "Outside policy"
      : score >= policy.minScore
        ? "Eligible for review"
        : score >= 55
          ? "Manual review required"
          : "High risk";
  const availablePayment = Math.max(0, (income * policy.maxDsr) / 100 - debt);
  const affordableLoan =
    r === 0
      ? availablePayment * months
      : (availablePayment * (1 - Math.pow(1 + r, -months))) / r;
  const loanCeiling = Math.max(
    0,
    Math.min((value * policy.maxLtv) / 100, affordableLoan),
  );
  return {
    ltv,
    dsr,
    payment,
    collateral,
    affordability,
    score,
    decision,
    loanCeiling,
  };
}
function field(label, name, value, type = "number", attrs = "") {
  return `<label class="field">${label}<input name="${name}" type="${type}" value="${escapeHTML(value)}" required ${attrs}></label>`;
}
function scoringFields() {
  return `${field("Requested amount (IDR million)", "amount", 850, "number", 'min="1" max="1000000" step="1"')}${field("Post-renovation value (IDR million)", "value", 1800, "number", 'min="1" max="10000000" step="1"')}${field("Monthly income (IDR million)", "income", 50, "number", 'min="0.1" max="1000000" step="0.1"')}${field("Existing monthly debt (IDR million)", "debt", 5, "number", 'min="0" max="1000000" step="0.1"')}<label class="field">Loan tenor<select name="months"><option value="36">36 months</option><option value="60" selected>60 months</option><option value="84">84 months</option><option value="120">120 months</option></select></label>${field("Contractor verification score", "contractor", 90, "number", 'min="0" max="100" step="1"')}`;
}
function engine() {
  return `${heading("Clarity behind every credit score.", "Model renovation financing scenarios with transparent, rules-based assessment.")}<div class="risk-layout"><form class="panel form-panel" id="risk-form"><h2>Credit simulator</h2><p class="sub">Explore affordability, collateral, and contractor quality.</p><div class="form-grid">${scoringFields()}</div><p class="form-help">Amounts in IDR millions. Current demo policy: ${data.policy.interest}% p.a., amortized monthly. Excludes fees and insurance.</p><button class="btn primary" type="submit">${icon("shield", 15)}Run assessment</button></form><div id="risk-result">${riskResult(assess({ amount: 850, value: 1800, income: 50, debt: 5, months: 60, contractor: 90 }))}</div></div><section class="panel form-panel" style="margin-top:22px"><h2>How this prototype scores</h2><p class="sub" style="margin-bottom:0">Collateral contributes 40%, affordability 40%, and contractor verification 20%. Current policy caps loan-to-value at ${data.policy.maxLtv}% and debt service at ${data.policy.maxDsr}%. Credit score must reach ${data.policy.minScore} for approval; evidence must also be complete. An assessment never automatically approves or funds an application. No credit bureau, bank, or property valuation service is connected.</p></section>`;
}
function riskResult(r) {
  return `<section class="panel result" aria-live="polite"><div class="between"><h2>Assessment result</h2><span class="badge ${r.score >= 75 && r.decision !== "Outside policy" ? "approved" : "review"}">${r.decision}</span></div><div class="result-score">${r.score}<small> / 100</small></div><p class="sub">Illustrative credit score</p>${[
    ["Collateral strength", r.collateral],
    ["Repayment capacity", r.affordability],
    ["Loan-to-value", r.ltv],
    ["Debt service ratio", r.dsr],
  ]
    .map(
      ([l, n]) =>
        `<div class="factor"><div class="factor-label"><span>${l}</span><strong>${n.toFixed(1)}%</strong></div><div class="progress-track"><i style="width:${Math.min(n, 100)}%"></i></div></div>`,
    )
    .join(
      "",
    )}<div class="decision-callout"><strong>Estimated monthly payment · ${money(r.payment)}</strong><br>${r.decision === "Outside policy" ? "Reduce the loan amount or existing debt to bring this scenario within demo policy." : "This scenario can inform a human review. Verify borrower documents and independently assess property value."}</div></section>`;
}
function selected() {
  return (
    data.apps.find(
      (a) => a.id === state.selectedProject && a.status === "Approved",
    ) || data.apps.find((a) => a.status === "Approved")
  );
}
function milestones() {
  const a = selected();
  if (!a)
    return `${heading("Progress you can see.", "Milestone-based disbursement for approved renovation projects.")}<div class="panel empty"><strong>No approved project available</strong>Approve an application to begin tracking milestones.</div>`;
  const stages = [
    ["Project preparation", 15],
    ["Foundation & structure", 30],
    ["MEP & installation", 25],
    ["Finishing works", 20],
    ["Final handover", 10],
  ];
  const done = data.milestones
    .filter((m) => m.project === a.id)
    .map((m) => m.stage);
  return `${heading("Progress you can see.", "Verify evidence and track each stage of renovation funding.")}<div class="notice">Prototype workflow · Evidence is tracked locally; files are not uploaded and no money is transferred.</div><div class="risk-layout"><section class="panel timeline"><div class="between" style="margin-bottom:25px"><h2>Project milestones</h2><select class="inline-search" id="project-select" aria-label="Select project">${data.apps
    .filter((x) => x.status === "Approved")
    .map(
      (x) =>
        `<option value="${x.id}" ${x.id === a.id ? "selected" : ""}>${escapeHTML(x.name)}</option>`,
    )
    .join(
      "",
    )}</select></div>${stages.map(([name, weight], i) => `<div class="milestone"><span class="milestone-icon">${icon(done.includes(i) ? "check" : i === done.length ? "clock" : "lock", 16)}</span><div class="stack"><div class="between"><h3>${name}</h3><strong style="font-size:12px">${money((a.amount * weight) / 100)}</strong></div><p class="sub">${weight}% of committed funding · ${done.includes(i) ? "Evidence verified" : i === done.length ? "Ready for evidence review" : "Previous milestone required"}</p>${i === done.length ? `<button class="btn small" style="align-self:flex-start;margin-top:8px" data-milestone="${i}" data-project="${a.id}">${icon("file", 13)}Review evidence</button>` : ""}</div></div>`).join("")}</section><section class="panel result"><h2>Funding overview</h2><p class="sub" style="margin-top:8px">${escapeHTML(a.name)}</p><div class="result-score" style="font-size:38px">${money(a.amount)}</div><p class="sub">Total committed</p><div class="factor"><div class="factor-label"><span>Milestones verified</span><strong>${done.length} / 5</strong></div><div class="progress-track"><i style="width:${done.length * 20}%"></i></div></div><div class="detail-grid" style="grid-template-columns:1fr 1fr"><div><dt>Verified for release</dt><dd>${money(stages.reduce((s, [, w], i) => s + (done.includes(i) ? (a.amount * w) / 100 : 0), 0))}</dd></div><div><dt>Remaining stages</dt><dd>${5 - done.length}</dd></div></div><div class="decision-callout">Every release requires verified site evidence, budget confirmation, and a human reviewer. This demo records verification only.</div></section></div>`;
}
function reports() {
  return `${heading("Turn your pipeline into perspective.", "Export your current workspace and review the decision trail.", button("Download CSV", "export", "download", true))}${metrics()}<div class="risk-layout"><section class="panel form-panel"><h2>Workspace report</h2><p class="sub">Your exported CSV includes every current application, credit score, status, loan-to-value, and reviewer note. Amounts are in IDR millions.</p><div class="settings-row"><div><strong>Application register</strong><p class="sub">${data.apps.length} applications · All statuses</p></div><button class="btn small" data-action="export">${icon("download", 13)}Export</button></div><div class="settings-row"><div><strong>Approved portfolio</strong><p class="sub">${data.apps.filter((a) => a.status === "Approved").length} committed projects</p></div><button class="btn small" data-action="export-portfolio">${icon("download", 13)}Export</button></div></section><section class="panel"><div class="panel-header"><h2>Decision trail</h2></div><div class="activity-list" style="display:block">${data.activity.length ? data.activity.map((a) => `<div class="activity"><span class="activity-icon">${icon("check", 12)}</span><div><strong>${escapeHTML(a.message)}</strong><p>${escapeHTML(a.project)} · ${new Date(a.time).toLocaleString("en-GB")}</p></div></div>`).join("") : '<div class="empty"><strong>No new activity yet</strong>Create an application or record a review to build your local decision trail.</div>'}</div></section></div>`;
}
function settings() {
  return `${heading("Make this workspace yours.", "Manage your demo profile and local prototype data.")}<form id="settings-form" class="panel settings-section"><h2>Profile & preferences</h2><p class="sub">Saved in this browser. No external account is created.</p><div class="form-grid">${field("Full name", "name", data.settings.name, "text", 'maxlength="70"')}${field("Email address", "email", data.settings.email, "email", 'maxlength="120"')}</div><div class="settings-row"><div><strong>Workspace notifications</strong><p class="sub">Show the update indicator in the navigation bar.</p></div><button type="button" role="switch" aria-label="Workspace notifications" aria-checked="${data.settings.notifications}" class="switch" data-action="toggle-notifications"></button></div><button class="btn primary" type="submit">Save profile</button></form><section class="panel settings-section"><h2>Stakeholder perspectives</h2><div class="settings-row"><div><strong>${state.role === "bank" ? "Borrower experience" : "Credit operations"}</strong><p class="sub">Switch between the credit workspace and project tracking.</p></div><button class="btn" data-action="switch-role">Switch view ${icon("arrow", 13)}</button></div></section><section class="panel settings-section"><h2>Lender configuration</h2><p class="sub" style="margin-top:10px">Set credit gates and inspect the integration readiness map.</p><button class="btn" style="margin-top:15px" data-page="policy">${icon("shield", 13)}Lending policy & integrations</button></section><section class="panel settings-section"><h2>Prototype data</h2><p class="sub" style="margin-top:10px">Data is saved in browser local storage, separately for each browser and origin. Use fictional information only. Reset removes your local applications, decisions, profile, and milestone records.</p><button class="btn danger" style="margin-top:20px" data-action="reset">${icon("refresh", 13)}Reset demo workspace</button></section>`;
}
function borrower() {
  const a = intelligenceProject(),
    r = propertyAnalysis(a);
  return `${heading("Your next chapter, taking shape.", "A clearer renovation plan, a realistic budget, and a path to financing.", button("Plan a renovation", "new", "plus", true))}
 <div class="notice">Homeowner planning perspective · Sample projects in a shared demo workspace. This is not an authenticated borrower account.</div>${intelligenceHero()}
 <div class="decision-metrics">${[
   [
     "Renovation + reserve",
     money(a.property.renovation + r.costReserve),
     "RAB plus contingency",
   ],
   [
     "Modeled loan capacity",
     money(r.loanCeiling),
     "From income and collateral inputs",
   ],
   [
     "Monthly installment",
     money(r.payment),
     `${data.policy.interest}% interest · ${a.months} months`,
   ],
   [
     "Evidence readiness",
     `${r.covered} / 7`,
     "Demo checklist, not source verification",
   ],
 ]
   .map(
     ([l, v, d]) =>
       `<section class="panel decision-metric"><span>${l}</span><strong>${v}</strong><small>${d}</small></section>`,
   )
   .join("")}</div>
 <div class="risk-layout"><section class="panel form-panel"><div class="between"><div><h2>Your property plan</h2><p class="sub">${escapeHTML(a.name)} · ${escapeHTML(a.location)}</p></div>${propertySelect()}</div><div class="property-opportunity"><div><strong>01 · Know your renovation budget</strong><p>Model your RAB, contingency, project costs, and scope.</p></div><button class="icon-button" data-page="intelligence" aria-label="Plan renovation budget">${icon("arrow", 14)}</button></div><div class="property-opportunity"><div><strong>02 · Understand what you can finance</strong><p>Test your income, existing debt, and monthly installment.</p></div><button class="icon-button" data-page="engine" aria-label="Calculate affordability">${icon("arrow", 14)}</button></div><div class="property-opportunity"><div><strong>03 · Prepare your Renovation Passport</strong><p>See the evidence a lender needs for a complete review.</p></div><button class="icon-button" data-page="passport" aria-label="Prepare renovation passport">${icon("arrow", 14)}</button></div><div class="property-opportunity"><div><strong>04 · Track construction milestones</strong><p>Follow evidence checks on approved project funding.</p></div><button class="icon-button" data-page="milestones" aria-label="Track project milestones">${icon("arrow", 14)}</button></div></section><section class="panel form-panel"><h2>What to prepare</h2><p class="sub">Your planning checklist</p>${
   renovaEvidence
     .filter(([k]) => !a.property.evidence[k])
     .map(
       ([, l]) =>
         `<div class="document-row">${icon("file", 14)}${l}<span class="badge pending">Required</span></div>`,
     )
     .join("") ||
   '<div class="decision-callout">All demo checks are recorded. A lender still needs to independently verify the underlying source documents.</div>'
 }<button class="btn" style="margin-top:20px" data-page="passport">Open my passport ${icon("arrow", 13)}</button></section></div>`;
}
function openModal(title, body, foot = "") {
  modalOpener = document.activeElement;
  document.querySelector("#modal-root").innerHTML =
    `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1"><div class="modal-head"><h2 id="modal-title">${title}</h2><button class="icon-button" data-action="close-modal" aria-label="Close dialog">${icon("close", 16)}</button></div><div class="modal-body">${body}</div>${foot ? `<div class="modal-foot">${foot}</div>` : ""}</section></div>`;
  document.body.style.overflow = "hidden";
  document.querySelector(".modal input,.modal button,.modal").focus();
}
function closeModal() {
  document.querySelector("#modal-root").innerHTML = "";
  document.body.style.overflow = "";
  if (modalOpener?.isConnected) modalOpener.focus();
  else document.querySelector("#main-content")?.focus();
}
function review(id) {
  const a = data.apps.find((x) => x.id === id);
  if (!a) return;
  const r = assess(a),
    p = a.property,
    reasons = approvalReasons(a),
    lender = isLender();
  openModal(
    escapeHTML(a.name),
    `<div class="between"><div><span class="eyebrow muted">${escapeHTML(a.id)}</span><p class="sub">${escapeHTML(a.borrower)} · ${escapeHTML(a.location)}</p></div>${badge(a.status)}</div>
 <dl class="detail-grid"><div><dt>Requested amount</dt><dd>${money(a.amount)}</dd></div><div><dt>Credit score · current policy</dt><dd>${r.score} / 100</dd></div><div><dt>Loan-to-value</dt><dd>${r.ltv.toFixed(1)}%</dd></div><div><dt>Monthly installment</dt><dd>${money(r.payment)}</dd></div><div><dt>Debt service ratio</dt><dd>${r.dsr.toFixed(1)}%</dd></div><div><dt>Policy-based capacity</dt><dd>${money(r.loanCeiling)}</dd></div></dl>
 <h3>Evidence readiness</h3>${renovaEvidence.map(([k, l]) => `<div class="document-row">${icon("file", 14)}${l}<span class="badge ${p.evidence[k] ? "approved" : "pending"}">${p.evidence[k] ? "Demo checked" : "Required"}</span></div>`).join("")}
 <button class="btn small" style="margin-top:15px" data-docs="${a.id}">${icon("file", 13)}${a.status === "Pending docs" ? "Mark demo documents complete" : "Review demo documents"}</button>
 <div class="decision-callout"><strong>Credit gate · ${r.decision}</strong><br>Policy v${data.policy.version}: LTV ≤ ${data.policy.maxLtv}%, debt service ≤ ${data.policy.maxDsr}%, credit score ≥ ${data.policy.minScore}. ${reasons.length ? `<ul class="gate-list">${reasons.map((v) => `<li>${escapeHTML(v)}</li>`).join("")}</ul>` : "All demo approval gates passed. A human lender decision is still required."}</div>
 <p class="form-help">Evidence checks are local simulations. No bureau, registry, appraisal, or bank verification is connected. ${!lender ? "You are in a planning perspective; choose Bank or Financial institution for credit decisions." : ""}</p>
 ${a.status === "In review" && lender ? `<label class="field" style="margin-top:20px">Reviewer note (required for rejection)<textarea id="review-note" class="review-note" maxlength="1000" placeholder="Record the rationale for your decision…"></textarea></label><p id="review-error" class="error-message" role="alert"></p>` : a.note ? `<div class="notice"><strong>Reviewer note</strong><br>${escapeHTML(a.note)}</div>` : ""}`,
    a.status === "In review" && lender
      ? `<button class="btn" data-action="close-modal">Cancel</button><button class="btn danger" data-decision="Rejected" data-id="${a.id}">Decline</button><button class="btn primary" data-decision="Approved" data-id="${a.id}" ${reasons.length ? "disabled" : ""}>${icon("check", 14)}Approve application</button>`
      : button("Close", "close-modal"),
  );
}
function newApplication() {
  openModal(
    "A new possibility.",
    `<p class="sub" style="margin-bottom:20px">Create a renovation application and generate an initial demo assessment.</p><div class="notice">Use fictional information. Data stays in this browser.</div><form id="new-form"><div class="form-grid">${field("Project name", "project", "", "text", 'maxlength="90" placeholder="e.g. Kebayoran Garden House"')}${field("Borrower name", "borrower", "", "text", 'maxlength="90" placeholder="e.g. Sarah Wijaya"')}<label class="field full">Location<input name="location" required maxlength="100" placeholder="District, city"></label>${scoringFields()}</div><p class="form-help">${data.policy.interest}% illustrative annual interest. The assessment combines collateral (40%), affordability (40%), and contractor verification (20%). This does not approve credit.</p><p class="error-message" id="new-error" role="alert"></p><button type="submit" class="btn primary" style="margin-top:15px">${icon("plus", 14)}Create & assess application</button></form>`,
  );
}
function numbers(form) {
  return Object.fromEntries(
    ["amount", "value", "income", "debt", "months", "contractor"].map((n) => [
      n,
      Number(new FormData(form).get(n)),
    ]),
  );
}
function exportCSV(onlyApproved = false) {
  const rows = onlyApproved
    ? data.apps.filter((a) => a.status === "Approved")
    : data.apps;
  const cell = (v) =>
    '"' +
    String(v ?? "")
      .replace(/^[=+@\-\t\r]/, "'$&")
      .replace(/"/g, '""') +
    '"';
  const csv = [
    [
      "Application ID",
      "Project",
      "Borrower",
      "Location",
      "Amount (IDR million)",
      "Post-renovation value (IDR million)",
      "Credit score",
      "Status",
      "Loan-to-value (%)",
      "Reviewer note",
    ],
    ...rows.map((a) => [
      a.id,
      a.name,
      a.borrower,
      a.location,
      a.amount,
      a.value,
      a.score,
      a.status,
      ((a.amount / a.value) * 100).toFixed(1),
      a.note || "",
    ]),
  ]
    .map((r) => r.map(cell).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `renovacredit-${onlyApproved ? "portfolio" : "applications"}-${today().slice(0, 10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(`${rows.length} applications exported.`);
}
function evidence(project, stage) {
  const a = data.apps.find((x) => x.id === project);
  const labels = [
    "Project preparation",
    "Foundation & structure",
    "MEP & installation",
    "Finishing works",
    "Final handover",
  ];
  openModal(
    "Milestone evidence review",
    `<p class="sub">${escapeHTML(a.name)} · ${labels[stage]}</p><div class="notice" style="margin-top:20px">Sample review checklist. Checking these items simulates a reviewer verification; it does not upload evidence or release funds.</div><form id="evidence-form" data-project="${project}" data-stage="${stage}">${["Site progress photos reviewed", "Contractor invoice and budget matched", "Work completed to the agreed milestone"].map((l) => `<label class="document-row" style="cursor:pointer"><input type="checkbox" required>${l}</label>`).join("")}<button class="btn primary" type="submit" style="margin-top:25px">${icon("check", 14)}Record demo verification</button></form>`,
  );
}
const actions = {
  home: () => navigate(state.role === "bank" ? "dashboard" : "borrower"),
  intelligence: () => navigate("intelligence"),
  "export-passport": () => exportPassport(),
  menu: () => {
    state.menu = !state.menu;
    render();
  },
  new: newApplication,
  export: () => exportCSV(),
  "export-portfolio": () => exportCSV(true),
  "close-modal": closeModal,
  notifications: () => {
    state.notifications = !state.notifications;
    render();
  },
  prev: () => {
    state.pagination--;
    render();
  },
  next: () => {
    state.pagination++;
    render();
  },
  milestones: () => navigate("milestones"),
  guide: () =>
    openModal(
      "Welcome to RenovaCredit",
      `<div class="stack" style="gap:20px"><p class="sub">A working renovation lending prototype, designed for exploring a clearer credit workflow.</p><div><h3>01 · Originate</h3><p class="sub">Create an application with fictional borrower and project information.</p></div><div><h3>02 · Assess & decide</h3><p class="sub">Explore the risk simulator, review an application, and record a decision with a reviewer note.</p></div><div><h3>03 · Track progress</h3><p class="sub">Approved applications appear in the portfolio. Verify sequential milestones in Disbursements.</p></div><div><h3>04 · Take it with you</h3><p class="sub">Export the register as CSV. Your workspace saves locally, separately on each browser.</p></div></div>`,
      button("Got it", "close-modal", "check", true),
    ),
  "toggle-notifications": () => {
    data.settings.notifications = !data.settings.notifications;
    save();
    document
      .querySelector('[role="switch"]')
      .setAttribute("aria-checked", String(data.settings.notifications));
  },
  "switch-role": () => {
    setAudience(state.role === "bank" ? "homeowner" : "bank");
  },
  reset: () =>
    openModal(
      "Reset your demo workspace?",
      `<p class="sub">This removes all local applications, decisions, milestone checks, and profile changes, and restores the sample workspace. Export a CSV first if you want to keep the application register.</p>`,
      `<button class="btn" data-action="close-modal">Keep my workspace</button><button class="btn danger" data-action="confirm-reset">Reset demo data</button>`,
    ),
  "confirm-reset": () => {
    data = {
      apps: structuredClone(defaults),
      activity: [],
      settings: {
        name: "Alex Morgan",
        email: "alex@example.com",
        notifications: true,
      },
      milestones: [],
      policy: { ...renovaDefaultPolicy },
    };
    data.apps.forEach((a, i) => {
      a.property = propertyDefaults(a, i, true);
      a.score = assess(a).score;
    });
    save();
    closeModal();
    state.role = "bank";
    state.audience = "bank";
    navigate("dashboard");
    toast("Sample workspace restored.");
  },
};
document.addEventListener("click", (e) => {
  const el = e.target.closest("button,a,[data-action]");
  if (!el) return;
  const d = el.dataset;
  if (d.action) {
    e.preventDefault();
    actions[d.action]?.();
  } else if (d.page) {
    navigate(d.page);
  } else if (d.filter) {
    state.filter = d.filter;
    state.pagination = 1;
    render();
  } else if (d.range) {
    state.range = d.range;
    render();
  } else if (d.review) {
    review(d.review);
  } else if (d.decision) {
    const a = data.apps.find((x) => x.id === d.id);
    if (!a || a.status !== "In review") return;
    if (!isLender()) {
      toast("Choose a lender workspace to record a credit decision.");
      return;
    }
    if (d.decision === "Approved" && approvalReasons(a).length) {
      toast("Resolve the policy and evidence gates before approval.");
      return;
    }
    const note = document.querySelector("#review-note").value.trim();
    if (d.decision === "Rejected" && !note) {
      document.querySelector("#review-error").textContent =
        "Please add a reviewer note explaining the decision.";
      document.querySelector("#review-note").focus();
      return;
    }
    a.status = d.decision;
    a.note = note;
    a.decidedAt = today();
    a.decisionPolicy = { ...data.policy };
    a.decisionAssessment = assess(a);
    record(
      `Application ${d.decision === "Approved" ? "approved" : "declined"}`,
      a.name,
    );
    closeModal();
    render();
    toast(`${a.name} ${d.decision.toLowerCase()}.`);
  } else if (d.docs) {
    documentReview(d.docs);
  } else if (d.milestone) {
    evidence(d.project, Number(d.milestone));
  }
});
document.addEventListener("submit", (e) => {
  const form = e.target;
  e.preventDefault();
  if (form.id === "risk-form") {
    document.querySelector("#risk-result").innerHTML = riskResult(
      assess(numbers(form)),
    );
    toast("Assessment updated.");
  } else if (form.id === "new-form") {
    const f = new FormData(form);
    const text = {
      name: String(f.get("project")).trim(),
      borrower: String(f.get("borrower")).trim(),
      location: String(f.get("location")).trim(),
    };
    if (Object.values(text).some((v) => !v)) {
      document.querySelector("#new-error").textContent =
        "Please enter a project name, borrower name, and location.";
      return;
    }
    const values = numbers(form);
    const r = assess(values);
    const a = {
      id: `RC-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`,
      ...text,
      ...values,
      score: r.score,
      status: "In review",
      progress: 0,
      created: today().slice(0, 10),
    };
    a.property = propertyDefaults(a, 0, false);
    state.intelligenceProject = a.id;
    data.apps.unshift(a);
    record("New application received", a.name);
    closeModal();
    navigate("applications");
    toast(`${a.name} created · Initial score ${a.score}/100`);
  } else if (form.id === "settings-form") {
    const f = new FormData(form);
    const name = String(f.get("name")).trim();
    if (!name) {
      form.elements.name.setCustomValidity("Enter a name.");
      form.elements.name.reportValidity();
      form.elements.name.setCustomValidity("");
      return;
    }
    data.settings.name = name;
    data.settings.email = String(f.get("email")).trim();
    save();
    render();
    toast("Profile saved in this browser.");
  } else if (form.id === "evidence-form") {
    const project = form.dataset.project;
    const stage = Number(form.dataset.stage);
    const completed = data.milestones.filter((m) => m.project === project);
    if (completed.length !== stage) {
      toast("Complete the preceding milestone first.");
      return;
    }
    data.milestones.push({ project, stage, time: today() });
    record(
      "Milestone evidence verified",
      data.apps.find((a) => a.id === project).name,
    );
    closeModal();
    render();
    toast("Demo verification recorded. No funds transferred.");
  }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "status-filter") {
    state.filter = e.target.value;
    state.pagination = 1;
    render();
  }
  if (e.target.id === "project-select") {
    state.selectedProject = e.target.value;
    render();
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "global-search") {
    const input = e.target;
    state.query = input.value;
    state.page = "applications";
    state.pagination = 1;
    state.filter = "All applications";
    render();
    const next = document.querySelector("#global-search");
    next.focus();
    next.setSelectionRange(next.value.length, next.value.length);
  }
  if (e.target.id === "queue-search") {
    state.query = e.target.value;
    state.pagination = 1;
    document.querySelector("#queue-table").innerHTML = applicationTable();
    const count = e.target.parentElement.querySelector(".sub");
    if (count) count.textContent = `${filteredApps().length} applications`;
  }
});
document.addEventListener("keydown", (e) => {
  const modal = document.querySelector(".modal");
  if (e.key === "Escape") {
    if (modal) closeModal();
    else if (state.menu || state.notifications) {
      state.menu = false;
      state.notifications = false;
      render();
    }
  }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    document.querySelector("#global-search")?.focus();
  }
  if (e.key === "Tab" && modal) {
    const focusable = [
      ...modal.querySelectorAll("button,input,select,textarea,a[href]"),
    ].filter((el) => !el.disabled);
    const first = focusable[0],
      last = focusable.at(-1);
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
