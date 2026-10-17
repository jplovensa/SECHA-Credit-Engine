# RenovaCredit by SECHA

A locally hosted, responsive property intelligence prototype for Indonesian renovation, makeover, and secondary-property finance. Built around a shared decision brief for **banks, homeowners, property investors, and financial institutions**.

Inter typography, a warm terracotta / sand / sage palette, a simplified stakeholder dashboard, property economics, transparent scoring, lending policy gates, and a portable Renovation Passport. The application uses local assets and works on GitHub Pages without a backend, build step, API keys, or runtime CDN access.

## Run locally

```sh
cd /workspace/SECHA-Credit-Engine
python3 -m http.server 8000 --bind 127.0.0.1
```

Use the existing isolated checkout; no Git worktree is needed. On another machine, run the server from the checkout directory. The browser needs JavaScript. Node is needed only for development checks.

## Stakeholder workflows

Select a perspective at the top of the workspace. These are demo views of a shared sample dataset, not authenticated accounts or security boundaries.

- **Bank:** originate, review evidence, assess affordability, and record credit decisions.
- **Homeowner:** plan a RAB and contingency, understand installment capacity, prepare evidence, and track approved-project milestones.
- **Property investor:** compare modeled project margins, rental yields, stressed value buffers, and RenovaScores; open a property for deeper analysis.
- **Financial institution:** configure a versioned policy and inspect application gates across the pipeline.

Create applications with fictional information. Open **Property intelligence** and select a project to edit its planning assumptions. **Renovation passport** shows its evidence gaps and exports the structured record as JSON. **Reports** exports the application register and decision trail. **Settings** manages the local profile and resets demo data.

## Intelligence model

**RC–1** is a deterministic, explainable prototype model, not a trained AI credit model, a validated risk model, or a probability of default.

The decision brief calculates:

- **Total project basis:** reported current/acquisition value + RAB + contingency reserve + entered planning fees/transaction costs.
- **Value creation:** assumed after-renovation value minus total project basis; margin is surplus divided by that basis. For an existing owner, this is an economic basis, not a cash acquisition requirement.
- **Rental economics:** entered gross rent × occupancy × (1 − operating cost ratio). Net rental yield uses total project basis; rental DSCR compares annual net rent with annual installment payments.
- **Stress:** an editable value haircut and additional RAB overrun applied on top of the baseline including contingency, plus installment sensitivity at +2 percentage points of annual interest.
- **Financing capacity:** the lower of policy-based collateral capacity and the amortized loan supported by the allowed monthly debt service, after existing obligations.

Holding periods, construction vacancy timing, financing carry, selling expenses, and sale taxes are not included. Entered transaction/fee estimates are not statutory tax calculations. Floor-area cost and RAB category allocation are planning outputs, not regional construction benchmarks or contractor quotations. Values and rental inputs are manual assumptions, not market appraisals.

**RenovaScore** is a 0–100 planning index: borrower affordability 25%, collateral coverage 25%, execution resilience 20%, value creation 15%, and demo evidence coverage 15%. Every component and its input rationale are visible. It is separate from the **credit score** (collateral 40%, affordability 40%, contractor input 20%) used by lender policy gates.

Default illustrative policy is 12% annual interest, 80% maximum post-renovation LTV, 60% maximum debt service ratio, and minimum credit score 65. These are configurable demo thresholds, not Indonesian regulatory requirements. The 1.20× rental DSCR planning benchmark is also illustrative.

## Decision and evidence controls

New applications have no recorded evidence. Demo approval requires all seven local evidence checks and passing credit policy gates. Missing documents, excessive LTV or debt service, or a credit score below policy block the approval handler as well as the UI. Only lender perspectives expose decision actions. Declining requires a reviewer note.

Evidence covers identity, reported SHM/SHGB title and encumbrances, RAB, contractor, PBG/permit applicability, independent valuation, and authorized lender credit/SLIK review. Checks only simulate local reviewer completion. They do not validate, upload, or authenticate any document. Permit applicability must be assessed for the actual project; the prototype does not decide the legal requirement.

Changing property assumptions invalidates a current approval. Changes to value, budget, title, or execution assumptions clear the associated evidence checks. A prior decision snapshot is retained. Recorded decisions store their policy/assessment snapshots; later policy edits affect new reviews without rewriting existing approvals. Seeded approvals are sample records, not actual decisions. Policy versioning and the local activity trail are demo features, not tamper-resistant audit controls.

## Renovation Passport

The proposed `RC-PASSPORT/1.0` JSON record contains property and project inputs, financing assumptions, current model output, policy version, evidence coverage, milestones, and current/prior decision snapshots. Currency is IDR and monetary amounts are in millions. It is intended to explore a consistent handoff between stakeholders; it is not an adopted industry standard, property title certificate, appraisal, approval, or regulatory certification.

SLIK, ATR/BPN, KJPP, PBG systems, banks, identity services, and disbursement rails are **not connected**. Integration readiness is shown under **Lending policy**. Production adoption would require independently authorized data access, appropriate consent, verified source data, secured accounts and role permissions, durable server-side records, validated models and policies, and institution-specific legal and regulatory review. No money is transferred.

## Local data

Changes persist in browser `localStorage` under `renovacredit-v3`. Existing valid `secha-credit-v2` workspace data is read as a migration fallback. Data is separate per browser/origin and does not sync between users or devices. Use fictional information only. Restricted browser storage may limit changes to the session. Reset restores sample data. CSV reports and a property passport are separate exports, not complete backup/restore mechanisms.

## GitHub Pages

`.github/workflows/pages.yml` validates and deploys the static site when source reaches `main`, or when manually dispatched. In **Settings → Pages**, select **GitHub Actions**. The **Deploy RenovaCredit prototype to GitHub Pages** workflow installs development test dependencies and Chromium, runs checks, and packages only `index.html`, `styles.css`, `app.js`, `intelligence.js`, and `assets/`. The successful deployment result provides the published URL.

All asset URLs are relative, including the intelligence module and bundled Inter fonts, so project subpaths are supported. A source push is not proof of a successful Pages deployment.

## Development checks

```sh
npm ci
npm run check
npx playwright install chromium
npm test
```

To reuse installed system Chromium:

```sh
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test
```

The browser runner starts its own temporary server beneath a GitHub-style project subpath and uses fresh isolated contexts. It checks origination, evidence gates, credit decisions, persistence, repayment calculations, project economics, negative stress scenarios, approval/evidence invalidation, passport contents, policy versioning, stakeholder views, CSV formula escaping, keyboard dialogs, and mobile behavior. It fails on page errors, missing resources, or external requests. Test dependencies are excluded from deployment and are not needed to serve the application.

Inter is bundled under the SIL Open Font License; see `assets/fonts/OFL.txt`.

## Investor demo & visual identity

The overview is deliberately concise: one featured property, three calculated workspace numbers, a short pipeline (or investor comparison), and a three-step product journey. Illustrative trend charts live in Reports. For a pitch, start with the overview, open Property intelligence to show the economics and downside assumptions, then export the Renovation Passport. Switching to Property investor shows a comparison table instead of repeating the pipeline.

The arch-and-leaf RenovaCredit mark represents a home with room to grow. Original vector assets are included as `assets/renovacredit-mark.svg` (square mark) and `assets/renovacredit-logo.svg` (wordmark lockup). The mark also serves as the favicon. Palette: terracotta `#B65C43`, warm ivory `#F8F5EF`, sand `#F0E4D2`, and garden sage `#7E8D68`. All illustrations and brand assets are bundled locally. Sample commitments and modeled property uplift must not be presented as actual platform traction or realized investment returns.
