# Friends of SAP Project Giving — Interactive Prototype

A React/Vite prototype for a Kiva-style project-funding site for Friends of sncəcmałqtn Agricultural Park.

## What is included

- Full homepage with park hero image, mission, impact statistics, and campaign summary
- Searchable, filterable, sortable project-card grid
- Funding goals, progress bars, supporter counts, and preset donation amounts
- Hash-based individual project views that work on GitHub Pages
- Mock one-time/monthly checkout drawer
- Responsive layouts for desktop, tablet, and mobile
- GitHub Actions workflow for automatic GitHub Pages deployment
- A project-page scraper that produces a review file from the current public website

## Prototype limitations

- No payments are processed.
- Most goals, amounts raised, supporter counts, proposed uses of funds, and prioritization values are illustrative.
- The Gathering Place / Outdoor Classroom is marked as funded based on the public project page's stated Community Works Fund commitments.
- Project photographs are currently loaded from the public Friends of SAP Wix site. Obtain organizational approval and store approved copies locally before a production launch.
- All project text, images, funding designations, tax-receipt language, and donation restrictions require board review.

## Run locally

Install Node.js 22 or later, then run:

```bash
npm install
npm run dev
```

Open the local address printed by Vite, usually `http://localhost:5173`.

## Build and test the production version

```bash
npm run build
npm run preview
```

The compiled static site is written to `dist/`.

## Refresh the public project-page extraction

```bash
npm run fetch:projects
```

This fetches `https://www.friendsofsap.ca/projects` and writes a review file:

```text
src/data/projects.scraped.json
```

It does **not** overwrite the curated `src/data/projects.json`, because the latter also contains mock budgets, categories, tags, expected impacts, donation settings, and image choices. Compare the scraped review file with the curated data and update the curated file manually.

## Create the GitHub repository

### GitHub website

1. Sign in to GitHub and create a new repository, for example `friends-sap-donation-mockup`.
2. Do not initialize it with a README because this folder already contains one.
3. In this project folder, run:

```bash
git init
git add .
git commit -m "Create Friends of SAP donation prototype"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/friends-sap-donation-mockup.git
git push -u origin main
```

### GitHub CLI alternative

```bash
git init
git add .
git commit -m "Create Friends of SAP donation prototype"
gh auth login
gh repo create friends-sap-donation-mockup --public --source=. --remote=origin --push
```

## Publish on GitHub Pages

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. Open the **Actions** tab and confirm that `Deploy static site to GitHub Pages` succeeds.
5. GitHub will publish the site at an address like:

```text
https://YOUR-USERNAME.github.io/friends-sap-donation-mockup/
```

Every push to `main` rebuilds and republishes the site.

## Optional custom domain

The site works without a custom domain. To use `sap.ginkgo.land` later:

1. Rename `public/CNAME.example` to `public/CNAME`.
2. In the DNS settings for `ginkgo.land`, add:

```text
Type: CNAME
Host: sap
Target: YOUR-USERNAME.github.io
```

3. In **GitHub repository → Settings → Pages → Custom domain**, enter `sap.ginkgo.land`.
4. After DNS validation, turn on **Enforce HTTPS**.

## Main files to edit

```text
src/main.jsx                 Page structure and interactions
src/styles.css               Visual design and responsive layouts
src/data/projects.json       Project text and mock campaign data
scripts/fetch-projects.mjs   Public website extraction script
.github/workflows/deploy.yml GitHub Pages deployment workflow
```

## Moving from prototype to live donations

A production launch should normally keep card handling outside this React site. Use a processor-hosted checkout or donation form and link each project to the appropriate campaign or designation. Before launch, confirm:

- Payment processor and bank-account ownership
- Charitable status and tax-receipt process
- Whether gifts are legally restricted or are donor preferences
- Privacy policy, consent, data retention, and refund policy
- Approved project budgets, goals, timelines, and project leads
- Reporting process for expenditures and project outcomes
- Image and content permissions
- Accessibility, device, and browser testing
