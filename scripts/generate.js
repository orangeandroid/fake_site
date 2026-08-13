#!/usr/bin/env node
// Generates a multi-page demo "eCommerce" static site (Home/Shop/Blog/Help/Docs
// + a company footer) with placeholder lorem-ipsum content. No dependencies
// required. Structure and per-page tag profiles come from ./site-config.js —
// edit that file to add/resize sections, not this one.

const fs = require("fs");
const path = require("path");
const { SECTIONS, COMPANY_PAGES, BASE_PATH_PREFIX, HOME } = require("./site-config");

const ROOT = path.join(__dirname, "..");
const SITE_NAME = "Northwind Goods";

// ---------- lorem content helpers ----------

const LOREM_WORDS = (
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod " +
  "tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam " +
  "quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo " +
  "consequat duis aute irure in reprehenderit voluptate velit esse cillum " +
  "eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident " +
  "sunt culpa qui officia deserunt mollit anim id est laborum"
).split(" ");

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function pickSome(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(randInt(0, copy.length - 1), 1)[0]);
  }
  return out;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function loremSentence(minWords = 6, maxWords = 14) {
  const n = randInt(minWords, maxWords);
  const words = Array.from({ length: n }, () => pick(LOREM_WORDS));
  return capitalize(words.join(" ")) + ".";
}

function loremParagraph(minSentences = 4, maxSentences = 7) {
  const n = randInt(minSentences, maxSentences);
  return Array.from({ length: n }, () => loremSentence()).join(" ");
}

function loremParagraphsHtml(n) {
  return Array.from({ length: n }, () => `<p>${loremParagraph()}</p>`).join("\n");
}

// ---------- name pools ----------
// Reused across categories/sections by index (modulo) rather than one pool
// per category, to keep this file's length reasonable.

const PRODUCT_ADJ = ["Classic", "Modern", "Rustic", "Compact", "Premium", "Everyday", "Heritage", "Urban", "Coastal", "Alpine"];
const PRODUCT_NOUN = ["Wallet", "Backpack", "Mug", "Scarf", "Lamp", "Water Bottle", "Notebook", "Sunglasses", "Speaker", "Blanket", "Cutting Board", "Candle", "Charger", "Tote Bag", "Umbrella", "Sneakers", "Keychain", "Planter"];

const BLOG_ADJ = ["5 Tips for", "The Complete Guide to", "Why We Love", "Behind the Scenes:", "How to Choose", "A Closer Look at", "Seasonal Guide:", "Customer Favorites:"];
const BLOG_TOPIC = ["Sustainable Materials", "Gift Wrapping", "Small-Batch Manufacturing", "Our Fall Collection", "Everyday Carry Essentials", "Product Care", "Minimalist Living", "Supporting Local Makers", "Remote Work Setups", "Team Culture", "Open Source Tools", "Incident Response"];

const HELP_TOPIC_NOUNS = ["Shipping & Delivery", "Returns & Exchanges", "Order Tracking", "Payment Methods", "Account Management", "Sizing Guide", "Gift Cards", "Product Warranty", "Privacy & Security", "International Orders", "Promotions & Discounts", "Contact Support"];

const DOCS_TOPIC_NOUNS = ["Authentication", "Rate Limits", "Webhooks", "Pagination", "Error Codes", "Quickstart", "SDK Installation", "Changelog", "Data Models", "Environments"];

const AUTHORS = ["Jamie Rivera", "Sam Okafor", "Priya Nair", "Casey Lindqvist", "Morgan Ellis"];

// ---------- tag profiles ----------
// Purely cosmetic/governance variety: which analytics tags render on a
// building's pages. Every page always keeps the CloudFront tag.js — that's
// project-skyline's own instrumentation for this demo, not a governance tag.

const TAG_PROFILES = {
  none: () => "",
  "gtm-onetrust": () => `
        <!-- Google tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-DEMO123456"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DEMO123456');
        </script>
        <!-- OneTrust Cookie Consent -->
        <script src="https://cdn.cookielaw.org/scripttemplates/otSDKStub.js" type="text/javascript" charset="UTF-8" data-domain-script="00000000-0000-0000-0000-000000000000"></script>
        <script type="text/javascript">function OptanonWrapper() {}</script>`,
  "meta-clarity": () => `
        <!-- Meta Pixel -->
        <script>
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '000000000000000');
            fbq('track', 'PageView');
        </script>
        <!-- Microsoft Clarity -->
        <script type="text/javascript">
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "demo0000000");
        </script>`,
  hotjar: () => `
        <!-- Hotjar -->
        <script>
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:0000000,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        </script>`,
};

function tagHtml(profile) {
  return (TAG_PROFILES[profile] || TAG_PROFILES.none)();
}

// ---------- page shell ----------

function navHtml(basePath, active) {
  const link = (href, label, key) =>
    `<li class="nav-item"><a class="nav-link${active === key ? " active" : ""}" href="${basePath}${href}">${label}</a></li>`;
  return `
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container px-4 px-lg-5">
                <a class="navbar-brand" href="${basePath}index.html">${SITE_NAME}</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
                        ${link("index.html", "Home", "home")}
                        ${SECTIONS.map((s) => link(`${s.key}/index.html`, s.label, s.key)).join("\n                        ")}
                    </ul>
                    <form class="d-flex">
                        <button class="btn btn-outline-dark" type="submit"><i class="bi-cart-fill me-1"></i>Cart<span class="badge bg-dark text-white ms-1 rounded-pill">0</span></button>
                    </form>
                </div>
            </div>
        </nav>`;
}

function footerHtml(basePath) {
  const half = Math.ceil(COMPANY_PAGES.length / 2);
  const columns = [COMPANY_PAGES.slice(0, half), COMPANY_PAGES.slice(half)];
  const columnHtml = (col) =>
    `<ul class="list-unstyled small">${col
      .map((p) => `<li><a class="text-white-50" href="${basePath}${p.slug}/index.html">${p.title}</a></li>`)
      .join("")}</ul>`;
  return `
        <footer class="py-5 bg-dark">
            <div class="container">
                <div class="row gx-4 gx-lg-5">
                    <div class="col-6 col-md-3">${columnHtml(columns[0])}</div>
                    <div class="col-6 col-md-3">${columnHtml(columns[1])}</div>
                </div>
                <p class="m-0 text-center text-white mt-4">Copyright &copy; ${SITE_NAME} 2026 &mdash; Demo site, not a real store</p>
            </div>
        </footer>`;
}

function pageShell({ title, basePath, active, bodyContent, tagProfile = "none" }) {
  return `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>${title} - ${SITE_NAME}</title>
        <link rel="icon" type="image/x-icon" href="${basePath}assets/favicon.ico" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css" rel="stylesheet" />
        <link href="${basePath}css/styles.css" rel="stylesheet" />${tagHtml(tagProfile)}
    </head>
    <body>
${navHtml(basePath, active)}
${bodyContent}
${footerHtml(basePath)}
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
        <script src="${basePath}js/scripts.js"></script>
        <script src="https://d3dd1jpmmxdmgr.cloudfront.net/tag.js"></script>
    </body>
</html>
`;
}

const writtenPaths = [];

function write(relPath, content) {
  const full = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  writtenPaths.push(relPath.replace(/\\/g, "/"));
}

function itemCard(item, viewHref) {
  return `
                    <div class="col mb-5">
                        <div class="card h-100">
                            <img class="card-img-top" src="${item.img}" alt="${item.name}" />
                            <div class="card-body p-4 text-center">
                                <h5 class="fw-bolder">${item.name}</h5>
                                ${item.price ? `$${item.price}` : ""}
                            </div>
                            <div class="card-footer p-4 pt-0 border-top-0 bg-transparent text-center">
                                <a class="btn btn-outline-dark" href="${viewHref}">View</a>
                            </div>
                        </div>
                    </div>`;
}

// ---------- home page ----------

function buildHomePage(featured) {
  write(
    "index.html",
    pageShell({
      title: "Home",
      basePath: "",
      active: "home",
      tagProfile: require("./site-config").HOME.tagProfile,
      bodyContent: `
        <header class="bg-dark py-5">
            <div class="container px-4 px-lg-5 my-5">
                <div class="text-center text-white">
                    <h1 class="display-4 fw-bolder">${SITE_NAME}</h1>
                    <p class="lead fw-normal text-white-50 mb-0">Thoughtfully made goods for everyday life. (Demo site &mdash; content is placeholder.)</p>
                </div>
            </div>
        </header>
        <section class="py-5">
            <div class="container px-4 px-lg-5 mt-5">
                <div class="row gx-4 gx-lg-5 row-cols-1 row-cols-md-4 justify-content-center">
                    ${SECTIONS.map(
                      (s) => `
                    <div class="col mb-5">
                        <div class="card h-100 text-center p-4">
                            <h3 class="mt-3">${s.label}</h3>
                            <p>${loremSentence(10, 16)}</p>
                            <a class="btn btn-outline-dark mt-auto" href="${s.key}/index.html">Browse ${s.label.toLowerCase()}</a>
                        </div>
                    </div>`
                    ).join("\n")}
                </div>
            </div>
        </section>
        <section class="py-3">
            <div class="container px-4 px-lg-5">
                <h2 class="text-center mb-4">Featured Products</h2>
                <div class="row gx-4 gx-lg-5 row-cols-2 row-cols-md-4 justify-content-center">
                    ${featured.map((p) => itemCard(p, `shop/${p.categorySlug}/product-${p.n}.html`)).join("\n")}
                </div>
            </div>
        </section>`,
    })
  );
}

// ---------- section landing page (e.g. shop/index.html) ----------

function buildSectionLanding(section) {
  write(
    `${section.key}/index.html`,
    pageShell({
      title: section.label,
      basePath: "../",
      active: section.key,
      tagProfile: section.landing.tagProfile,
      bodyContent: `
        <header class="bg-dark py-5">
            <div class="container px-4 px-lg-5 my-5 text-center text-white">
                <h1 class="display-4 fw-bolder">${section.label}</h1>
            </div>
        </header>
        <section class="py-5">
            <div class="container px-4 px-lg-5 mt-5">
                <div class="row gx-4 gx-lg-5 row-cols-1 row-cols-md-2 row-cols-lg-3 justify-content-center">
                    ${section.categories
                      .map(
                        (c) => `
                    <div class="col mb-5">
                        <div class="card h-100 p-4 text-center">
                            <h5 class="fw-bolder">${c.label}</h5>
                            <p>${loremSentence(10, 16)}</p>
                            <a class="btn btn-outline-dark mt-auto" href="${c.slug}/index.html">View ${c.label.toLowerCase()}</a>
                        </div>
                    </div>`
                      )
                      .join("\n")}
                </div>
            </div>
        </section>`,
    })
  );
}

// ---------- category index + detail pages ----------

function buildShopCategory(section, category) {
  const products = Array.from({ length: category.count }, (_, i) => {
    const n = i + 1;
    const name = `${pick(PRODUCT_ADJ)} ${pick(PRODUCT_NOUN)}`;
    const price = (randInt(1200, 12000) / 100).toFixed(2);
    return { n, name, price, img: `https://picsum.photos/seed/${category.slug}-${n}/450/300`, categorySlug: category.slug };
  });

  write(
    `shop/${category.slug}/index.html`,
    pageShell({
      title: category.label,
      basePath: "../../",
      active: "shop",
      tagProfile: category.tagProfile,
      bodyContent: `
        <header class="bg-dark py-5">
            <div class="container px-4 px-lg-5 my-5 text-center text-white">
                <h1 class="display-4 fw-bolder">${category.label}</h1>
            </div>
        </header>
        <section class="py-5">
            <div class="container px-4 px-lg-5 mt-5">
                <p><a href="../index.html">Shop</a> / ${category.label}</p>
                <div class="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">
                    ${products.map((p) => itemCard(p, `product-${p.n}.html`)).join("\n")}
                </div>
            </div>
        </section>`,
    })
  );

  products.forEach((p) => {
    const related = pickSome(products.filter((x) => x.n !== p.n), Math.min(3, products.length - 1));
    write(
      `shop/${category.slug}/product-${p.n}.html`,
      pageShell({
        title: p.name,
        basePath: "../../",
        active: "shop",
        tagProfile: category.tagProfile,
        bodyContent: `
        <section class="py-5">
            <div class="container px-4 px-lg-5 my-5">
                <p><a href="../index.html">Shop</a> / <a href="index.html">${category.label}</a> / ${p.name}</p>
                <div class="row gx-4 gx-lg-5 align-items-center">
                    <div class="col-md-6"><img class="card-img-top mb-5 mb-md-0" src="${p.img}" alt="${p.name}" /></div>
                    <div class="col-md-6">
                        <h1 class="display-5 fw-bolder">${p.name}</h1>
                        <div class="fs-5 mb-5"><span>$${p.price}</span></div>
                        ${loremParagraphsHtml(2)}
                        <div class="d-flex"><button class="btn btn-outline-dark flex-shrink-0" type="button">Add to cart</button></div>
                    </div>
                </div>
                ${
                  related.length
                    ? `<hr class="my-5" /><h2 class="mb-4">Related Products</h2><div class="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 justify-content-center">${related
                        .map((r) => itemCard(r, `product-${r.n}.html`))
                        .join("\n")}</div>`
                    : ""
                }
            </div>
        </section>`,
      })
    );
  });

  return products;
}

function buildBlogCategory(section, category) {
  const posts = Array.from({ length: category.count }, (_, i) => {
    const n = i + 1;
    const title = `${pick(BLOG_ADJ)} ${pick(BLOG_TOPIC)}`;
    const daysAgo = (category.count - i) * 5;
    const date = new Date(Date.UTC(2026, 6, 15));
    date.setUTCDate(date.getUTCDate() - daysAgo);
    return { n, title, author: pick(AUTHORS), dateStr: date.toISOString().slice(0, 10) };
  });

  write(
    `blog/${category.slug}/index.html`,
    pageShell({
      title: category.label,
      basePath: "../../",
      active: "blog",
      tagProfile: category.tagProfile,
      bodyContent: `
        <header class="bg-dark py-5">
            <div class="container px-4 px-lg-5 my-5 text-center text-white">
                <h1 class="display-4 fw-bolder">${category.label}</h1>
            </div>
        </header>
        <section class="py-5">
            <div class="container px-4 px-lg-5 mt-5">
                <p><a href="../index.html">Blog</a> / ${category.label}</p>
                <div class="row gx-4 gx-lg-5 row-cols-1 row-cols-md-2 justify-content-center">
                    ${posts
                      .map(
                        (p) => `
                    <div class="col mb-5">
                        <div class="card h-100">
                            <div class="card-body p-4">
                                <div class="text-muted small mb-2">${p.dateStr} &middot; ${p.author}</div>
                                <h5 class="fw-bolder">${p.title}</h5>
                                <p>${loremSentence(14, 22)}</p>
                                <a class="btn btn-outline-dark" href="post-${p.n}.html">Read more</a>
                            </div>
                        </div>
                    </div>`
                      )
                      .join("\n")}
                </div>
            </div>
        </section>`,
    })
  );

  posts.forEach((p, idx) => {
    const prev = posts[idx - 1];
    const next = posts[idx + 1];
    write(
      `blog/${category.slug}/post-${p.n}.html`,
      pageShell({
        title: p.title,
        basePath: "../../",
        active: "blog",
        tagProfile: category.tagProfile,
        bodyContent: `
        <section class="py-5">
            <div class="container px-4 px-lg-5 my-5" style="max-width: 800px;">
                <p><a href="../index.html">Blog</a> / <a href="index.html">${category.label}</a></p>
                <h1 class="fw-bolder mb-1">${p.title}</h1>
                <div class="text-muted mb-4">${p.dateStr} &middot; ${p.author}</div>
                ${loremParagraphsHtml(randInt(5, 8))}
                <hr class="my-5" />
                <div class="d-flex justify-content-between">
                    <div>${prev ? `<a href="post-${prev.n}.html">&larr; ${prev.title}</a>` : ""}</div>
                    <div>${next ? `<a href="post-${next.n}.html">${next.title} &rarr;</a>` : ""}</div>
                </div>
            </div>
        </section>`,
      })
    );
  });
}

function buildHelpCategory(section, category) {
  const topics = Array.from({ length: category.count }, (_, i) => {
    const n = i + 1;
    const title = HELP_TOPIC_NOUNS[i % HELP_TOPIC_NOUNS.length];
    return { n, title };
  });

  write(
    `help/${category.slug}/index.html`,
    pageShell({
      title: category.label,
      basePath: "../../",
      active: "help",
      tagProfile: category.tagProfile,
      bodyContent: `
        <header class="bg-dark py-5">
            <div class="container px-4 px-lg-5 my-5 text-center text-white">
                <h1 class="display-4 fw-bolder">${category.label}</h1>
            </div>
        </header>
        <section class="py-5">
            <div class="container px-4 px-lg-5 mt-5">
                <p><a href="../index.html">Help</a> / ${category.label}</p>
                <div class="row gx-4 gx-lg-5 row-cols-1 row-cols-md-2 row-cols-lg-3 justify-content-center">
                    ${topics
                      .map(
                        (t) => `
                    <div class="col mb-5">
                        <div class="card h-100 p-4">
                            <h5 class="fw-bolder"><i class="bi-question-circle me-2"></i>${t.title}</h5>
                            <p>${loremSentence(10, 16)}</p>
                            <a class="btn btn-outline-dark mt-auto" href="topic-${t.n}.html">View articles</a>
                        </div>
                    </div>`
                      )
                      .join("\n")}
                </div>
            </div>
        </section>`,
    })
  );

  topics.forEach((t) => {
    const qaCount = randInt(3, 5);
    const qa = Array.from(
      { length: qaCount },
      () => `<h5 class="mt-4">${loremSentence(6, 10).replace(/\.$/, "?")}</h5><p>${loremParagraph(2, 4)}</p>`
    ).join("\n");
    const related = pickSome(topics.filter((x) => x.n !== t.n), Math.min(3, topics.length - 1));
    write(
      `help/${category.slug}/topic-${t.n}.html`,
      pageShell({
        title: t.title,
        basePath: "../../",
        active: "help",
        tagProfile: category.tagProfile,
        bodyContent: `
        <section class="py-5">
            <div class="container px-4 px-lg-5 my-5" style="max-width: 800px;">
                <p><a href="../index.html">Help</a> / <a href="index.html">${category.label}</a></p>
                <h1 class="fw-bolder mb-4">${t.title}</h1>
                ${qa}
                ${
                  related.length
                    ? `<hr class="my-5" /><h2 class="mb-3">Related Topics</h2><ul>${related
                        .map((r) => `<li><a href="topic-${r.n}.html">${r.title}</a></li>`)
                        .join("")}</ul>`
                    : ""
                }
            </div>
        </section>`,
      })
    );
  });
}

function buildDocsCategory(section, category) {
  const pages = Array.from({ length: category.count }, (_, i) => {
    const n = i + 1;
    const title = DOCS_TOPIC_NOUNS[i % DOCS_TOPIC_NOUNS.length];
    return { n, title };
  });

  write(
    `docs/${category.slug}/index.html`,
    pageShell({
      title: category.label,
      basePath: "../../",
      active: "docs",
      tagProfile: category.tagProfile,
      bodyContent: `
        <header class="bg-dark py-5">
            <div class="container px-4 px-lg-5 my-5 text-center text-white">
                <h1 class="display-4 fw-bolder">${category.label}</h1>
            </div>
        </header>
        <section class="py-5">
            <div class="container px-4 px-lg-5 mt-5">
                <p><a href="../index.html">Docs</a> / ${category.label}</p>
                <div class="row gx-4 gx-lg-5 row-cols-1 row-cols-md-2 row-cols-lg-3 justify-content-center">
                    ${pages
                      .map(
                        (p) => `
                    <div class="col mb-5">
                        <div class="card h-100 p-4">
                            <h5 class="fw-bolder"><i class="bi-file-earmark-code me-2"></i>${p.title}</h5>
                            <p>${loremSentence(10, 16)}</p>
                            <a class="btn btn-outline-dark mt-auto" href="page-${p.n}.html">Read</a>
                        </div>
                    </div>`
                      )
                      .join("\n")}
                </div>
            </div>
        </section>`,
    })
  );

  pages.forEach((p) => {
    write(
      `docs/${category.slug}/page-${p.n}.html`,
      pageShell({
        title: p.title,
        basePath: "../../",
        active: "docs",
        tagProfile: category.tagProfile,
        bodyContent: `
        <section class="py-5">
            <div class="container px-4 px-lg-5 my-5" style="max-width: 800px;">
                <p><a href="../index.html">Docs</a> / <a href="index.html">${category.label}</a></p>
                <h1 class="fw-bolder mb-4">${p.title}</h1>
                ${loremParagraphsHtml(randInt(3, 6))}
                <pre class="bg-light p-3 border rounded"><code>GET /v1/${category.slug}/${p.title.toLowerCase().replace(/\s+/g, "-")}</code></pre>
            </div>
        </section>`,
      })
    );
  });
}

// ---------- company pages ----------

function buildCompanyPage(page) {
  write(
    `${page.slug}/index.html`,
    pageShell({
      title: page.title,
      basePath: "../",
      active: "",
      tagProfile: page.tagProfile,
      bodyContent: `
        <header class="bg-dark py-5">
            <div class="container px-4 px-lg-5 my-5 text-center text-white">
                <h1 class="display-4 fw-bolder">${page.title}</h1>
            </div>
        </header>
        <section class="py-5">
            <div class="container px-4 px-lg-5 my-5" style="max-width: 800px;">
                ${loremParagraphsHtml(randInt(3, 5))}
            </div>
        </section>`,
    })
  );
}

// ---------- run ----------

let allProducts = [];
SECTIONS.forEach((section) => {
  buildSectionLanding(section);
  section.categories.forEach((category) => {
    if (section.key === "shop") allProducts = allProducts.concat(buildShopCategory(section, category));
    else if (section.key === "blog") buildBlogCategory(section, category);
    else if (section.key === "help") buildHelpCategory(section, category);
    else if (section.key === "docs") buildDocsCategory(section, category);
  });
});

COMPANY_PAGES.forEach(buildCompanyPage);

buildHomePage(pickSome(allProducts, 4));

// ---------- self-check: simulate project-skyline's page-group algorithm ----------
// (single URL segment after the site prefix -> its own group; 2+ segments ->
// the path with its last segment generalized). This tells us, without
// needing project-skyline itself, how many buildings this run will produce.

function groupPatternFor(urlPath) {
  const segments = urlPath.split("/").filter(Boolean); // includes the BASE_PATH_PREFIX segment
  if (segments.length <= 1) return "/";
  return `/${segments.slice(0, -1).join("/")}/*`;
}

const pathsByGroup = new Map();
for (const p of writtenPaths) {
  const pattern = groupPatternFor(`${BASE_PATH_PREFIX}/${p}`);
  if (!pathsByGroup.has(pattern)) pathsByGroup.set(pattern, []);
  pathsByGroup.get(pattern).push(p);
}

console.log(
  `Generated ${writtenPaths.length} HTML files across ${SECTIONS.length} sections + ${COMPANY_PAGES.length} company pages.`
);
console.log(`Simulated project-skyline building count: ${pathsByGroup.size} (target: ~50)`);

// ---------- manifest for scripts/traffic-plan.js ----------
// Cross-references each config entry (which carries rank/tagProfile) with
// the actual pattern+pages the grouping algorithm above assigned it, using
// the same directory-shape logic, so the two scripts can never disagree
// about which building a page belongs to.

const dirPattern = (parts) => `/${["fake_site", ...parts].join("/")}/*`;

const manifestBuildings = [];

function addBuilding(key, dirParts, meta) {
  const pattern = dirPattern(dirParts);
  const pages = pathsByGroup.get(pattern) || [];
  manifestBuildings.push({ key, pattern, rank: meta.rank, tagProfile: meta.tagProfile, pages });
}

addBuilding("home", [], HOME);
SECTIONS.forEach((section) => {
  addBuilding(`${section.key}`, [section.key], section.landing);
  section.categories.forEach((category) => {
    addBuilding(`${section.key}/${category.slug}`, [section.key, category.slug], category);
  });
});
COMPANY_PAGES.forEach((page) => addBuilding(page.slug, [page.slug], page));

const unmatched = manifestBuildings.filter((b) => b.pages.length === 0);
if (unmatched.length) {
  console.error(`ERROR: ${unmatched.length} building(s) matched zero generated pages:`, unmatched.map((b) => b.key));
  process.exitCode = 1;
} else if (manifestBuildings.length !== pathsByGroup.size) {
  console.error(
    `ERROR: manifest has ${manifestBuildings.length} buildings but the grouping simulation found ${pathsByGroup.size} — they should match exactly.`
  );
  process.exitCode = 1;
} else {
  fs.writeFileSync(
    path.join(__dirname, ".generated-manifest.json"),
    JSON.stringify({ domain: require("./site-config").DOMAIN, basePathPrefix: BASE_PATH_PREFIX, buildings: manifestBuildings }, null, 2)
  );
  console.log(`Wrote scripts/.generated-manifest.json (${manifestBuildings.length} buildings, all matched).`);
}
