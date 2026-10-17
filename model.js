"use strict";
// Fictional, browser-only workflow data. All stored money is integer IDR.
const RC_STORE = "renovacredit-workflow-v1";
const RC_ROLES = {
  reviewer: { name: "Dewi Anggraini", initials: "DA", label: "Case reviewer" },
  owner: { name: "Nadia Pratama", initials: "NP", label: "Homeowner" },
  lender: { name: "Arif Rahman", initials: "AR", label: "Lender reviewer" },
};
const RC_LINES = [
  [
    "Waterproofing & wet areas",
    "Waterproofing · 2 coat system",
    80,
    "m²",
    600000,
    "p. 1 · item 01",
  ],
  [
    "Bathroom finishes",
    "Ceramic wall & floor finishes",
    60,
    "m²",
    1200000,
    "p. 1 · item 02",
  ],
  [
    "Plumbing & sanitary",
    "Supply, drainage & fixtures",
    24,
    "point",
    2000000,
    "p. 1 · item 03",
  ],
  [
    "Electrical works",
    "Wiring & protected outlets",
    18,
    "point",
    2000000,
    "p. 2 · item 04",
  ],
  [
    "Site protection",
    "Occupied-home protection & cleanup",
    1,
    "package",
    12000000,
    "p. 2 · item 05",
  ],
  [
    "Design & supervision",
    "Drawings and site supervision",
    1,
    "package",
    24000000,
    "p. 2 · item 06",
  ],
];
function rcSeed() {
  const info = [
    [
      "RC-026",
      "Bekasi Family Home",
      "Bekasi, Jawa Barat",
      "Nadia Pratama",
      "Budget review",
      1,
      30000000,
      0,
      "2026-10-19",
      "Confirm waterproofing quantities",
    ],
    [
      "RC-025",
      "Bintaro Courtyard",
      "Bintaro, Tangerang Selatan",
      "Andi Wirawan",
      "Active renovation",
      0.75,
      42000000,
      162000000,
      "2026-10-18",
      "Review milestone claim",
    ],
    [
      "RC-024",
      "Cibubur Garden House",
      "Cibubur, Jakarta Timur",
      "Maya Putri",
      "Awaiting evidence",
      1.2,
      60000000,
      0,
      "2026-10-20",
      "Request an updated contractor quote",
    ],
    [
      "RC-023",
      "Depok Starter Home",
      "Depok, Jawa Barat",
      "Raka Santoso",
      "Packet ready",
      0.6,
      38400000,
      0,
      "2026-10-21",
      "Submit the reviewed financing packet",
    ],
    [
      "RC-022",
      "Serpong Terrace",
      "Serpong, Tangerang Selatan",
      "Sinta Lestari",
      "Scope review",
      0.9,
      50000000,
      0,
      "2026-10-22",
      "Resolve the missing electrical specification",
    ],
    [
      "RC-021",
      "Ciputat Rumah Kita",
      "Ciputat, Tangerang Selatan",
      "Bayu Wicaksono",
      "Completion review",
      0.5,
      36000000,
      102000000,
      "2026-10-23",
      "Collect the final owner acceptance",
    ],
  ];
  return {
    schema: 1,
    cases: info.map(
      (
        [id, name, location, owner, status, scale, cash, facility, due, next],
        ix,
      ) => {
        const lines = RC_LINES.map(
          ([label, spec, quantity, unit, rate, source], i) => ({
            id: `${id}-L${i + 1}`,
            label,
            spec,
            quantity,
            unit,
            rate: Math.round(rate * scale),
            source,
            reviewed: ix === 0 ? i !== 0 : ![2, 4].includes(ix),
            originalQuantity: quantity,
            originalRate: Math.round(rate * scale),
          }),
        );
        const accepted = [1, 3, 5].includes(ix);
        return {
          id,
          name,
          location,
          owner,
          status,
          contractor: "Ruang Karya · demo contractor",
          assignee: "Dewi Anggraini",
          due,
          next,
          version: ix === 0 ? 2 : 1,
          acceptedVersion: accepted ? 1 : null,
          lines,
          contingency: 10,
          fees: 6000000,
          cash,
          facility,
          facilityActive: facility > 0,
          facilityReference: facility > 0 ? `DEMO-FAC-${id}` : null,
          fundingNotes:
            "Site review fees are included. Temporary accommodation is not required in this fictional case.",
          unknownCosts: ix === 4 ? ["Electrical specification not priced"] : [],
          documents: [
            {
              id: "quote",
              name: `RAB-${id}.pdf`,
              type: "Contractor quote",
              status:
                ix === 2
                  ? "Needs correction"
                  : accepted
                    ? "Reviewer accepted"
                    : "Received",
              version: ix === 0 ? 2 : 1,
              source: "Illustrative quote record",
              reviewer: accepted ? "Dewi Anggraini" : null,
              note:
                ix === 2
                  ? "Quote validity date has passed. Request a current version."
                  : "Source line references are available in Scope & budget.",
            },
            {
              id: "site",
              name: `Site-photos-${id}.jpg`,
              type: "Site scope evidence",
              status: ix === 0 ? "Needs correction" : "Reviewer accepted",
              version: 1,
              source: "Illustrative site record",
              reviewer: ix === 0 ? null : "Dewi Anggraini",
              note:
                ix === 0
                  ? "Wet-area measurements need a clearer supporting record."
                  : "Demo record only; no actual site inspection occurred.",
            },
            {
              id: "authority",
              name: "Owner-authority-record.pdf",
              type: "Owner authority",
              status: accepted ? "Reviewer accepted" : "Received",
              version: 1,
              source: "Illustrative authority record",
              reviewer: accepted ? "Dewi Anggraini" : null,
              note: "Not a verified title or registry response.",
            },
            {
              id: "permit",
              name: "Permit-applicability-note.pdf",
              type: "Permit applicability",
              status: accepted ? "Not applicable" : "Missing",
              version: 1,
              source: "Illustrative specialist note",
              reviewer: accepted ? "Demo qualified reviewer" : null,
              note: accepted
                ? "Demo specialist rationale: no structural/footprint change in this scope. Not legal advice."
                : "A qualified reviewer must record applicability; no automatic permit determination.",
            },
          ],
          creditStatus: facility > 0 ? "Facility active" : "Not requested",
          packetStatus:
            facility > 0 ? "Accepted" : accepted ? "Reviewed" : "Draft",
          claim:
            ix === 1
              ? {
                  id: "CL-012",
                  baseline: 1,
                  status: "Submitted",
                  items: [
                    {
                      line: 0,
                      label: "Wet-area preparation",
                      requested: 20000000,
                      certified: null,
                    },
                    {
                      line: 1,
                      label: "Bathroom installation",
                      requested: 40000000,
                      certified: null,
                    },
                  ],
                  note: "Contractor requests Rp60.000.000. The demo site note supports Rp52.000.000; finishing evidence for Rp8.000.000 is still missing.",
                  certificateNote: "",
                  authorization: null,
                  payments: [],
                }
              : null,
          changes:
            ix === 0
              ? [
                  {
                    id: "CO-008",
                    title: "Additional bathroom ventilation",
                    amount: 12000000,
                    days: 3,
                    reason:
                      "Owner requested better ventilation after the initial scope.",
                    ownerAck: false,
                    status: "Awaiting owner",
                  },
                ]
              : [],
          history: [
            {
              id: `seed-${id}`,
              time: "2026-10-16T02:10:00Z",
              actor: "Demo workspace",
              message: accepted
                ? "Reviewed budget baseline recorded"
                : "Project information received",
              detail: `Fictional project · budget v${ix === 0 ? 2 : 1}`,
            },
          ],
          snapshots: [],
        };
      },
    ),
    createdAt: "2026-10-17T00:00:00Z",
  };
}
function rcLoad() {
  try {
    const stored = JSON.parse(localStorage.getItem(RC_STORE));
    if (
      stored?.schema === 1 &&
      Array.isArray(stored.cases) &&
      stored.cases.length &&
      stored.cases.every(
        (c) =>
          typeof c.id === "string" &&
          Array.isArray(c.lines) &&
          Array.isArray(c.history) &&
          Array.isArray(c.documents),
      )
    )
      return stored;
  } catch {}
  return rcSeed();
}
function rcBudget(c) {
  return c.lines.reduce((sum, l) => sum + Math.round(l.quantity * l.rate), 0);
}
function rcFinance(c) {
  const construction = rcBudget(c),
    reserve = Math.round((construction * c.contingency) / 100),
    total = construction + reserve + c.fees;
  const paid = c.claim?.payments.reduce((s, p) => s + p.amount, 0) || 0;
  const committed = c.facilityActive ? c.facility : 0;
  const undrawn = Math.max(0, committed - paid);
  const remaining = Math.max(0, total - paid);
  const gap = Math.max(0, remaining - c.cash - undrawn);
  return {
    construction,
    reserve,
    total,
    paid,
    committed,
    undrawn,
    remaining,
    gap,
    known: c.unknownCosts.length === 0,
  };
}
function rcReadiness(c) {
  const lineCount = c.lines.filter((l) => !l.reviewed).length;
  const docs = c.documents.filter(
    (d) => !["Reviewer accepted", "Not applicable"].includes(d.status),
  );
  const changes = c.changes.filter((x) => x.status !== "Accepted");
  return {
    lineCount,
    docs,
    changes,
    ready: lineCount === 0 && docs.length === 0 && c.unknownCosts.length === 0,
    accepted: c.acceptedVersion === c.version,
  };
}
function rcClaimTotals(c) {
  const x = c.claim;
  if (!x) return null;
  return {
    requested: x.items.reduce((s, i) => s + i.requested, 0),
    certified: x.items.reduce((s, i) => s + (i.certified || 0), 0),
    paid: x.payments.reduce((s, p) => s + p.amount, 0),
    stale: x.baseline !== c.version || c.acceptedVersion !== c.version,
  };
}
function rcEvent(c, actor, message, detail = "") {
  c.history.unshift({
    id: `EV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    time: new Date().toISOString(),
    actor,
    message,
    detail,
  });
}
function rcInvalidate(c) {
  c.snapshots.push({
    version: c.version,
    lines: structuredClone(c.lines),
    acceptedVersion: c.acceptedVersion,
    packetStatus: c.packetStatus,
    contingency: c.contingency,
    fees: c.fees,
    cash: c.cash,
    facility: c.facility,
    time: new Date().toISOString(),
  });
  c.version++;
  c.acceptedVersion = null;
  c.packetStatus = "Draft";
  if (c.creditStatus !== "Not requested") c.creditStatus = "Re-review required";
  c.facilityActive = false;
  c.status = "Budget review";
  c.next = "Review the changed budget and financing conditions";
}
function rcCanReview(role) {
  return role === "reviewer";
}
function rcCanLend(role) {
  return role === "lender";
}
