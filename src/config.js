// ---------------------------------------------------------------------------
// Demo configuration.
//
// This is the ONLY file the Jira story asks you to change during the demo.
// Keep the baseline values below exactly as they are on `main` so every demo
// starts from the same place (see docs/DEMO_RUNBOOK.md).
// ---------------------------------------------------------------------------

module.exports = {
  appName: 'Harness Shop',
  headline: 'Welcome to Harness Shop',
  tagline: 'Built, secured and deployed to GKE by Harness',
  // Accent colour for the banner (any CSS colour)
  themeColor: '#C8102E',
  // Products shown on the home page
  products: [
    { name: 'Pipeline Hoodie', price: 49 },
    { name: 'Delegate Mug', price: 15 },
    { name: 'GitOps Sticker Pack', price: 5 },
    { name: 'Harness Holiday Beanie', price: 25 },
  ],
  // Optional promo banner. Empty string hides it.
  promoBanner: 'Holiday Sale: 20% off everything this week!',
};
