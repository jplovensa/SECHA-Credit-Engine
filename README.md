# SECHA Credit Engine

A responsive renovation lending prototype built for GitHub Pages. Inter typography, a portfolio dashboard, application origination and review, transparent risk simulation, sequential milestone verification, borrower preview, and CSV reports. All assets, including fonts, are hosted locally; no runtime CDN, build step, API key, or backend is needed.

## Run locally

Requires Python 3 (for the static server only):

```sh
cd /workspace/SECHA-Credit-Engine
python3 -m http.server 8000 --bind 127.0.0.1
```

Open the server in a browser. Use the existing isolated checkout; no Git worktree is needed. On other machines, run the same command from the checkout directory. JavaScript must be enabled.

## GitHub hosting

The workflow in `.github/workflows/pages.yml` deploys the static site when changes reach `main`, or when run manually. In the repository's **Settings → Pages**, select **GitHub Actions** as the source. Commit and push the changes to GitHub, then check the **Deploy SECHA prototype to GitHub Pages** workflow. Its deployment result provides the actual published URL. The workflow packages only the static application, excluding repository metadata and local development files. All asset URLs are relative, so GitHub project subpaths are supported.

Adding the workflow does not publish the site. GitHub Pages must be enabled and a successful workflow deployment must complete before the app is hosted.

## Try the prototype

1. Select **New application**, enter fictional project and affordability data, and create the application.
2. Search/filter the application queue and open a project to review it. Approve it, or decline with a reviewer note. Pending-document applications must first have their demo checklist completed.
3. See approved projects in **Portfolio**. Use **Disbursements** to verify sequential milestone checklists; no money is transferred.
4. Use **Risk engine** to calculate scenarios. Scores weight collateral 40%, repayment capacity 40%, and contractor verification 20%. Monthly repayments assume a fixed 12% annual rate. LTV over 80% or debt service over 60% is flagged outside demo policy.
5. Export the register or approved portfolio from **Reports**. Use **Settings** to change the demo profile, switch to the borrower preview, or reset the sample workspace.

## Data and scope

This is a frontend prototype, not a production credit system. Seed data, document statuses, portfolio trends, and existing project progress are illustrative. New scores are calculated from the form inputs. Reviewer decisions do not automatically enforce the simulated lending policy. Milestone checks record local verification only; no files, identity verification, credit bureau, valuation, banking, or disbursement services are connected. The borrower view is a preview of the approved book, not an authenticated account.

Changes persist in `localStorage` under `secha-credit-v2` for each browser/origin. Data does not synchronize between users, devices, localhost, or GitHub Pages. Use fictional information only; do not enter personal or financial information. Resetting the workspace removes local changes. Browser storage restrictions may limit persistence to the current session. CSV exports contain application data and reviewer notes, not the complete workspace state.

## Validation

Node.js is optional for development checks; the hosted application needs no Node runtime. Install the pinned development-only browser test dependency with `npm ci`.

```sh
npm ci
npm run check
npx playwright install chromium
npm test
```

To reuse an existing system browser instead of downloading one:

```sh
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test
```

The test runner starts and stops its own local HTTP server, serves the app beneath a GitHub-style project subpath, and uses fresh browser contexts. It checks local font loading, application creation, approval/rejection, document gates, persistence, risk thresholds and repayments, sequential milestones, CSV content and formula escaping, profile and borrower views, mobile navigation, and dialog keyboard behavior. It fails on browser errors, missing resources, or external requests.

The Playwright dependency is used only by tests and is excluded from the deployment artifact. No dependencies need installing to serve or use the application.

Inter is bundled under the SIL Open Font License; see `assets/fonts/OFL.txt`.
