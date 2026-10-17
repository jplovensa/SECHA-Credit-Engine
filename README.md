# RenovaCredit by SECHA

An interactive mockup of an evidence-led renovation finance workflow for Indonesia. The terracotta, ivory, sand and sage identity is retained, while the dashboard now prioritizes case actions, budget review, evidence and funding gaps. No composite credit score or property-value prediction is used.

## Run

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Run from this checkout. Use the existing isolated checkout; no Git worktree is needed. The application is static, with local JavaScript, CSS, Inter fonts and original SVG branding. It needs no build, package installation, runtime CDN, API key or backend.

## What to try

1. **Overview:** see cases needing action, their owner/due date, the known funding gaps and outstanding claims.
2. **Bekasi Family Home:** open the five-tab case workspace. In **Scope & budget**, inspect the illustrative quote and review the waterproofing line with a note. Accept the budget baseline.
3. **Evidence:** review each fictional record with its source and rationale. Statuses distinguish missing, received, correction, accepted and non-applicable. Adding a record creates metadata only; no actual file upload occurs.
4. **Funding plan:** Rp240M construction + Rp24M reserve + Rp6M known fees − Rp30M owner cash = Rp240M uncommitted gap. A reviewed budget and complete demo evidence permit packet acceptance in the lender perspective; neither alone is a credit approval. Only an explicitly usable demo facility reduces the gap.
5. **Changes:** switch to Homeowner to acknowledge the sample ventilation change. Switch to Case reviewer to accept it into a new budget version. Budget changes preserve snapshots, invalidate the old review/facility conditions, and make claims against old baselines stale.
6. **Bintaro Courtyard:** in **Changes & claims**, certify Rp52M of a Rp60M claim. Rp8M stays unsupported. Switch to Lender reviewer to record a separate authorization, then two partial fictional external payments (for example Rp40M + Rp12M). Duplicate payment references are rejected. Switch back to Case reviewer to reconcile the paid authorized amount. No money moves.
7. A reviewer can also return a submitted claim for correction and record a revised fictional submission before reviewing it again.
8. **Export packet:** download a frozen current-version JSON packet or open a readable memo to print/save as PDF through the browser. The memo identifies missing evidence and separates packet status from the lender process.
9. **New case:** create fictional intake data without entering a future valuation or contractor score. A working budget stays provisional; missing costs and sources remain visible. Add source-referenced scope lines to demonstrate the next step.

Use the perspective control in the header or profile to switch between **Case reviewer**, **Homeowner**, and **Lender reviewer**. It demonstrates handoffs, not authenticated accounts or production access control. Role-specific actions are guarded in the mockup UI/handlers, but the browser is not a secure permission boundary.

## Mockup scope and limitations

All cases, people, sources, professional reviews, facility references and payment records are fictional. No financing partner or actual project pipeline is represented by the sample workspace. No real document, title, permit, site, bank or credit-bureau check is performed. No funds are transferred. Keep actual borrower information out of the application.

This implements an interactive demonstration of the PRD workflow, not the production PRD's server authorization, tenant isolation, secure uploads, professional review, immutable ledger, institutional approval, payment integration, backup/retention, or predictive models. A print-ready memo uses browser Print / Save as PDF; the app has no PDF server.

`model.js` contains the fictional dataset and calculation helpers. `app.js` implements the five tabs and demo transitions. `styles.css` supplies the responsive terracotta design. Money is stored/displayed as integer IDR in this browser mockup; production accounting still needs the specified decimal/transaction-safe server implementation. Quantity × rate totals round to whole IDR.

Funding calculations distinguish known project costs, owner cash remaining, usable/undrawn facility and externally recorded payments. Certified-but-unpaid work remains within the remaining cash need. The demo claim agreement explicitly has no retention or advance recovery; it does not imply a universal bank disbursement formula. A stale baseline is held for re-review; automatic claim migration/rebasing is deliberately not provided.

Changes persist in local browser storage under `renovacredit-workflow-v1`, separately for each browser/origin. Existing `renovacredit-v3` and earlier prototype storage are not modified or migrated. Use **Workspace settings → Reset demo data** to restore fictional sample cases. Local events/snapshots are useful for the mockup, not tamper-proof records. State does not synchronize between devices.

The reviewer's interface is primarily English with Indonesian RAB and IDR conventions. Full Bahasa Indonesia localization and full assistive-technology conformance are not claimed by this mockup.

## Development checks

Node is needed only for development checks:

```sh
npm ci
npm run check
npx playwright install chromium
npm test
```

Or reuse system Chromium:

```sh
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test
```

Tests launch a temporary server beneath a GitHub Pages-style project subpath and isolated browser contexts. They cover funding arithmetic, source/evidence review, budget versioning, owner acknowledgment, packet acceptance, bounded facility records, certification, authorization, partial payments, duplicate reference protection, reconciliation, persistence, exports, intake, mobile navigation, keyboard dialogs/tabs, and stale claims. The runner fails on page errors, external runtime requests or missing assets.

## GitHub Pages

`.github/workflows/pages.yml` runs syntax and browser checks, then packages only `index.html`, `styles.css`, `app.js`, `model.js` and `assets/`. Enable **Settings → Pages → GitHub Actions**. Pushes to `main` or manual workflow dispatch trigger validation/deployment. Publishing is confirmed only by a successful Pages deployment, not by a source push.

The original arch-and-leaf mark and wordmark are in `assets/renovacredit-mark.svg` and `assets/renovacredit-logo.svg`. Inter licensing is in `assets/fonts/OFL.txt`.
