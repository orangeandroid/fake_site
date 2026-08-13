#!/usr/bin/env node
// Generates a multi-page demo "eCommerce" static site (Home/Shop/Blog/Help)
// with placeholder lorem-ipsum content. No dependencies required.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SITE_NAME = "Northwind Goods";

const CONFIG = {
  products: 12,
  posts: 12,
  topics: 10,
};

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

const PRODUCT_ADJ = ["Classic", "Modern", "Rustic", "Compact", "Premium", "Everyday", "Heritage", "Urban", "Coastal", "Alpine"];
const PRODUCT_NOUN = ["Leather Wallet", "Canvas Backpack", "Ceramic Mug", "Wool Scarf", "Desk Lamp", "Water Bottle", "Notebook Set", "Sunglasses", "Bluetooth Speaker", "Throw Blanket", "Cutting Board", "Candle"];

const BLOG_ADJ = ["5 Tips for", "The Complete Guide to", "Why We Love", "Behind the Scenes:", "How to Choose", "A Closer Look at", "Seasonal Guide:", "Customer Favorites:"];
const BLOG_TOPIC = ["Sustainable Materials", "Gift Wrapping", "Small-Batch Manufacturing", "Our Fall Collection", "Everyday Carry Essentials", "Product Care", "Minimalist Living", "Supporting Local Makers"];

const HELP_TOPICS = [
  "Shipping & Delivery", "Returns & Exchanges", "Order Tracking", "Payment Methods",
  "Account Management", "Sizing Guide", "Gift Cards", "Product Warranty",
  "Privacy & Security", "International Orders", "Promotions & Discounts", "Contact Support",
];

const AUTHORS = ["Jamie Rivera", "Sam Okafor", "Priya Nair", "Casey Lindqvist", "Morgan Ellis"];

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
                        ${link("shop/index.html", "Shop", "shop")}
                        ${link("blog/index.html", "Blog", "blog")}
                        ${link("help/index.html", "Help", "help")}
                    </ul>
                    <form class="d-flex">
                        <button class="btn btn-outline-dark" type="submit"><i class="bi-cart-fill me-1"></i>Cart<span class="badge bg-dark text-white ms-1 rounded-pill">0</span></button>
                    </form>
                </div>
            </div>
        </nav>`;
}

function footerHtml(basePath) {
  return `
        <footer class="py-5 bg-dark">
            <div class="container"><p class="m-0 text-center text-white">Copyright &copy; ${SITE_NAME} 2026 &mdash; Demo site, not a real store</p></div>
        </footer>`;
}

function pageShell({ title, basePath, active, bodyContent }) {
  return `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>${title} - ${SITE_NAME}</title>
        <link rel="icon" type="image/x-icon" href="${basePath}assets/favicon.ico" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css" rel="stylesheet" />
        <link href="${basePath}css/styles.css" rel="stylesheet" />
    </head>
    <body>
${navHtml(basePath, active)}
${bodyContent}
${footerHtml(basePath)}
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
        <script src="${basePath}js/scripts.js"></script>
    </body>
</html>
`;
}

function write(relPath, content) {
  const full = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

// ---------- data ----------

const products = Array.from({ length: CONFIG.products }, (_, i) => {
  const n = i + 1;
  const name = `${pick(PRODUCT_ADJ)} ${pick(PRODUCT_NOUN)}`;
  const price = (randInt(1200, 12000) / 100).toFixed(2);
  return { n, name, price, img: `https://picsum.photos/seed/shop-${n}/450/300` };
});

const posts = Array.from({ length: CONFIG.posts }, (_, i) => {
  const n = i + 1;
  const title = `${pick(BLOG_ADJ)} ${pick(BLOG_TOPIC)}`;
  const daysAgo = (CONFIG.posts - i) * 5;
  const date = new Date(Date.UTC(2026, 6, 15));
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return { n, title, author: pick(AUTHORS), dateStr: date.toISOString().slice(0, 10) };
});

const topics = Array.from({ length: CONFIG.topics }, (_, i) => {
  const n = i + 1;
  const title = HELP_TOPICS[i % HELP_TOPICS.length];
  return { n, title };
});

// ---------- home page ----------

write(
  "index.html",
  pageShell({
    title: "Home",
    basePath: "",
    active: "home",
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
                <div class="row gx-4 gx-lg-5 row-cols-1 row-cols-md-3 justify-content-center">
                    <div class="col mb-5">
                        <div class="card h-100 text-center p-4">
                            <i class="bi-bag-fill" style="font-size: 2.5rem;"></i>
                            <h3 class="mt-3">Shop</h3>
                            <p>${loremSentence(10, 16)}</p>
                            <a class="btn btn-outline-dark mt-auto" href="shop/index.html">Browse products</a>
                        </div>
                    </div>
                    <div class="col mb-5">
                        <div class="card h-100 text-center p-4">
                            <i class="bi-journal-text" style="font-size: 2.5rem;"></i>
                            <h3 class="mt-3">Blog</h3>
                            <p>${loremSentence(10, 16)}</p>
                            <a class="btn btn-outline-dark mt-auto" href="blog/index.html">Read the blog</a>
                        </div>
                    </div>
                    <div class="col mb-5">
                        <div class="card h-100 text-center p-4">
                            <i class="bi-question-circle-fill" style="font-size: 2.5rem;"></i>
                            <h3 class="mt-3">Help</h3>
                            <p>${loremSentence(10, 16)}</p>
                            <a class="btn btn-outline-dark mt-auto" href="help/index.html">Get help</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section class="py-3">
            <div class="container px-4 px-lg-5">
                <h2 class="text-center mb-4">Featured Products</h2>
                <div class="row gx-4 gx-lg-5 row-cols-2 row-cols-md-4 justify-content-center">
                    ${pickSome(products, 4)
                      .map(
                        (p) => `
                    <div class="col mb-5">
                        <div class="card h-100">
                            <img class="card-img-top" src="${p.img}" alt="${p.name}" />
                            <div class="card-body p-4 text-center">
                                <h5 class="fw-bolder">${p.name}</h5>
                                $${p.price}
                            </div>
                            <div class="card-footer p-4 pt-0 border-top-0 bg-transparent text-center">
                                <a class="btn btn-outline-dark" href="shop/product-${p.n}.html">View</a>
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

// ---------- shop ----------

write(
  "shop/index.html",
  pageShell({
    title: "Shop",
    basePath: "../",
    active: "shop",
    bodyContent: `
        <header class="bg-dark py-5">
            <div class="container px-4 px-lg-5 my-5 text-center text-white">
                <h1 class="display-4 fw-bolder">Shop All Products</h1>
            </div>
        </header>
        <section class="py-5">
            <div class="container px-4 px-lg-5 mt-5">
                <div class="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">
                    ${products
                      .map(
                        (p) => `
                    <div class="col mb-5">
                        <div class="card h-100">
                            <img class="card-img-top" src="${p.img}" alt="${p.name}" />
                            <div class="card-body p-4">
                                <div class="text-center">
                                    <h5 class="fw-bolder">${p.name}</h5>
                                    $${p.price}
                                </div>
                            </div>
                            <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
                                <div class="text-center"><a class="btn btn-outline-dark mt-auto" href="product-${p.n}.html">View options</a></div>
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

products.forEach((p) => {
  const related = pickSome(
    products.filter((x) => x.n !== p.n),
    3
  );
  write(
    `shop/product-${p.n}.html`,
    pageShell({
      title: p.name,
      basePath: "../",
      active: "shop",
      bodyContent: `
        <section class="py-5">
            <div class="container px-4 px-lg-5 my-5">
                <p><a href="index.html">Home</a> / <a href="index.html">Shop</a> / ${p.name}</p>
                <div class="row gx-4 gx-lg-5 align-items-center">
                    <div class="col-md-6"><img class="card-img-top mb-5 mb-md-0" src="${p.img}" alt="${p.name}" /></div>
                    <div class="col-md-6">
                        <h1 class="display-5 fw-bolder">${p.name}</h1>
                        <div class="fs-5 mb-5"><span>$${p.price}</span></div>
                        ${loremParagraphsHtml(2)}
                        <div class="d-flex"><button class="btn btn-outline-dark flex-shrink-0" type="button">Add to cart</button></div>
                    </div>
                </div>
                <hr class="my-5" />
                <h2 class="mb-4">Related Products</h2>
                <div class="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 justify-content-center">
                    ${related
                      .map(
                        (r) => `
                    <div class="col mb-5">
                        <div class="card h-100">
                            <img class="card-img-top" src="${r.img}" alt="${r.name}" />
                            <div class="card-body p-4 text-center">
                                <h5 class="fw-bolder">${r.name}</h5>
                                $${r.price}
                            </div>
                            <div class="card-footer p-4 pt-0 border-top-0 bg-transparent text-center">
                                <a class="btn btn-outline-dark" href="product-${r.n}.html">View</a>
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
});

// ---------- blog ----------

write(
  "blog/index.html",
  pageShell({
    title: "Blog",
    basePath: "../",
    active: "blog",
    bodyContent: `
        <header class="bg-dark py-5">
            <div class="container px-4 px-lg-5 my-5 text-center text-white">
                <h1 class="display-4 fw-bolder">From the Blog</h1>
            </div>
        </header>
        <section class="py-5">
            <div class="container px-4 px-lg-5 mt-5">
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
    `blog/post-${p.n}.html`,
    pageShell({
      title: p.title,
      basePath: "../",
      active: "blog",
      bodyContent: `
        <section class="py-5">
            <div class="container px-4 px-lg-5 my-5" style="max-width: 800px;">
                <p><a href="index.html">Home</a> / <a href="index.html">Blog</a></p>
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

// ---------- help ----------

write(
  "help/index.html",
  pageShell({
    title: "Help Center",
    basePath: "../",
    active: "help",
    bodyContent: `
        <header class="bg-dark py-5">
            <div class="container px-4 px-lg-5 my-5 text-center text-white">
                <h1 class="display-4 fw-bolder">Help Center</h1>
            </div>
        </header>
        <section class="py-5">
            <div class="container px-4 px-lg-5 mt-5">
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
  const related = pickSome(
    topics.filter((x) => x.n !== t.n),
    3
  );
  write(
    `help/topic-${t.n}.html`,
    pageShell({
      title: t.title,
      basePath: "../",
      active: "help",
      bodyContent: `
        <section class="py-5">
            <div class="container px-4 px-lg-5 my-5" style="max-width: 800px;">
                <p><a href="index.html">Home</a> / <a href="index.html">Help</a></p>
                <h1 class="fw-bolder mb-4">${t.title}</h1>
                ${qa}
                <hr class="my-5" />
                <h2 class="mb-3">Related Topics</h2>
                <ul>${related.map((r) => `<li><a href="topic-${r.n}.html">${r.title}</a></li>`).join("")}</ul>
            </div>
        </section>`,
    })
  );
});

console.log(`Generated 1 home page, ${products.length} shop pages (+index), ${posts.length} blog posts (+index), ${topics.length} help topics (+index).`);
