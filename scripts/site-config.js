// Shared data model for this demo site's structure.
//
// Both scripts/generate.js (writes the HTML) and scripts/traffic-plan.js
// (computes the seed data for project-skyline's tag-collector) read this
// file, so the pages that exist and the traffic story assigned to them can
// never drift apart.
//
// One entry here == one "building" in project-skyline once it compiles a
// city: project-skyline groups pages by generalizing the last URL segment,
// and this site is served from a GitHub Pages *project* page
// (https://orangeandroid.github.io/fake_site/...), so every URL already has
// a leading `/fake_site` segment eaten by that rule. Concretely: a page's
// containing directory is what determines its building. Every landing page
// below is deliberately alone in its own directory (nothing else shares
// that directory) so it forms its own building distinct from its
// subcategories.
//
// `rank` is a 1..50 ranking of expected traffic (1 = busiest / tallest,
// 50 = quietest / shortest) used only by traffic-plan.js to derive a
// peakDailyVisitors target. `tagProfile` picks which analytics tags render
// in that building's pages (see TAG_PROFILES in generate.js) purely for
// visual/governance variety in the rendered city (color + "grime" there are
// driven by tag/cookie clause state, not by height).

const DOMAIN = "orangeandroid.github.io";
const BASE_PATH_PREFIX = "/fake_site";
const SITE_URL = `https://${DOMAIN}${BASE_PATH_PREFIX}`;

const HOME = { rank: 1, tagProfile: "gtm-onetrust" };

const SECTIONS = [
  {
    key: "shop",
    label: "Shop",
    itemNoun: "product",
    landing: { rank: 4, tagProfile: "meta-clarity" },
    categories: [
      { slug: "electronics", label: "Electronics", count: 18, rank: 2, tagProfile: "meta-clarity" },
      { slug: "apparel", label: "Apparel", count: 14, rank: 3, tagProfile: "meta-clarity" },
      { slug: "home-goods", label: "Home Goods", count: 10, rank: 6, tagProfile: "meta-clarity" },
      { slug: "outdoors", label: "Outdoors", count: 8, rank: 9, tagProfile: "meta-clarity" },
      { slug: "beauty", label: "Beauty", count: 6, rank: 14, tagProfile: "meta-clarity" },
      { slug: "toys", label: "Toys", count: 6, rank: 16, tagProfile: "none" },
      { slug: "grocery", label: "Grocery", count: 5, rank: 21, tagProfile: "none" },
      { slug: "books", label: "Books", count: 5, rank: 24, tagProfile: "none" },
      { slug: "sports", label: "Sports", count: 4, rank: 29, tagProfile: "meta-clarity" },
      { slug: "automotive", label: "Automotive", count: 4, rank: 33, tagProfile: "none" },
    ],
  },
  {
    key: "blog",
    label: "Blog",
    itemNoun: "post",
    landing: { rank: 10, tagProfile: "hotjar" },
    categories: [
      { slug: "engineering", label: "Engineering", count: 10, rank: 5, tagProfile: "hotjar" },
      { slug: "product", label: "Product", count: 8, rank: 11, tagProfile: "hotjar" },
      { slug: "culture", label: "Culture", count: 6, rank: 15, tagProfile: "hotjar" },
      { slug: "security", label: "Security", count: 6, rank: 19, tagProfile: "none" },
      { slug: "design", label: "Design", count: 5, rank: 23, tagProfile: "hotjar" },
      { slug: "marketing", label: "Marketing", count: 4, rank: 30, tagProfile: "meta-clarity" },
    ],
  },
  {
    key: "help",
    label: "Help",
    itemNoun: "topic",
    landing: { rank: 7, tagProfile: "none" },
    categories: [
      { slug: "getting-started", label: "Getting Started", count: 8, rank: 12, tagProfile: "none" },
      { slug: "billing", label: "Billing", count: 6, rank: 17, tagProfile: "none" },
      { slug: "account", label: "Account", count: 5, rank: 20, tagProfile: "none" },
      { slug: "troubleshooting", label: "Troubleshooting", count: 5, rank: 25, tagProfile: "none" },
      { slug: "shipping-returns", label: "Shipping & Returns", count: 4, rank: 31, tagProfile: "none" },
    ],
  },
  {
    key: "docs",
    label: "Docs",
    itemNoun: "page",
    landing: { rank: 8, tagProfile: "gtm-onetrust" },
    categories: [
      { slug: "api", label: "API Reference", count: 12, rank: 13, tagProfile: "gtm-onetrust" },
      { slug: "guides", label: "Guides", count: 8, rank: 18, tagProfile: "gtm-onetrust" },
      { slug: "sdks", label: "SDKs", count: 5, rank: 27, tagProfile: "none" },
    ],
  },
];

// Each its own top-level directory (e.g. /about/index.html) so it forms its
// own building rather than collapsing into a shared "/fake_site/*" group
// with every other flat page.
const COMPANY_PAGES = [
  { slug: "about", title: "About Us", rank: 22, tagProfile: "gtm-onetrust" },
  { slug: "careers", title: "Careers", rank: 26, tagProfile: "gtm-onetrust" },
  { slug: "contact", title: "Contact Us", rank: 28, tagProfile: "none" },
  { slug: "press", title: "Press", rank: 32, tagProfile: "gtm-onetrust" },
  { slug: "warranty", title: "Product Warranty", rank: 49, tagProfile: "none" },
  { slug: "faq", title: "Frequently Asked Questions", rank: 34, tagProfile: "none" },
  { slug: "support", title: "Customer Support", rank: 35, tagProfile: "hotjar" },
  { slug: "investors", title: "Investor Relations", rank: 36, tagProfile: "gtm-onetrust" },
  { slug: "partners", title: "Partner Program", rank: 37, tagProfile: "meta-clarity" },
  { slug: "terms", title: "Terms of Service", rank: 38, tagProfile: "none" },
  { slug: "privacy", title: "Privacy Policy", rank: 39, tagProfile: "none" },
  { slug: "accessibility", title: "Accessibility Statement", rank: 40, tagProfile: "none" },
  { slug: "security", title: "Security", rank: 41, tagProfile: "none" },
  { slug: "sitemap", title: "Sitemap", rank: 42, tagProfile: "none" },
  { slug: "affiliates", title: "Affiliate Program", rank: 43, tagProfile: "meta-clarity" },
  { slug: "sustainability", title: "Sustainability", rank: 44, tagProfile: "gtm-onetrust" },
  { slug: "status", title: "System Status", rank: 45, tagProfile: "none" },
  { slug: "brand", title: "Brand Guidelines", rank: 46, tagProfile: "none" },
  { slug: "events", title: "Events", rank: 47, tagProfile: "hotjar" },
  { slug: "newsletter", title: "Newsletter", rank: 48, tagProfile: "meta-clarity" },
  { slug: "media-kit", title: "Media Kit", rank: 50, tagProfile: "none" },
];

module.exports = { DOMAIN, BASE_PATH_PREFIX, SITE_URL, HOME, SECTIONS, COMPANY_PAGES };
