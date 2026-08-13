#!/usr/bin/env node
// Turns scripts/.generated-manifest.json (written by generate.js) into a
// concrete traffic-seed plan for project-skyline's tag-collector database:
// one peakDailyVisitors target per building (derived from its `rank` in
// site-config.js via a log-spaced curve, so 50 buildings span a real NYC-style
// skyline instead of a flat plateau), split across that building's actual
// pages, on a single fixed day.
//
// Why a single day: the collector's `daily_page_counts` table is
// (domain, path, day, count). project-skyline hasn't wired up the join from
// that table to a building's peakDailyVisitors yet (see
// project-skyline/docs/live-tag-contract.md — "what remains is on the city
// side"), so the exact aggregation (sum-per-day vs max-per-day, sum-across-a
// building's-pages vs max-across-them) isn't settled. Seeding only one day
// per page removes the day-aggregation ambiguity entirely: whatever reads
// this table, sum-over-window and max-over-window are identical when there's
// only one row. The remaining ambiguity (sum-across-pages vs max-across-a
// building's pages) is hedged in how the target is split below.
//
// Usage: node scripts/traffic-plan.js > /tmp/preview.txt   (just prints)
//        node scripts/traffic-plan.js --write               (also writes
//        scripts/.traffic-seed.json with the row-level data used for the
//        actual EC2 seed step)

const fs = require("fs");
const path = require("path");

const manifest = require("./.generated-manifest.json");

// ---- height formula, copied verbatim from project-skyline's
// packages/city-core/src/constants.ts + compile/height.ts, so this preview
// matches what the real compiler will render. ----
const HEIGHT_MIN = 9;
const HEIGHT_LINEAR_MAX_VISITORS = 10_000;
const HEIGHT_LINEAR_MAX = 130;
const HEIGHT_MAX = 260;

function compileHeight(peakDailyVisitors) {
  if (peakDailyVisitors <= 0) return HEIGHT_MIN;
  if (peakDailyVisitors <= HEIGHT_LINEAR_MAX_VISITORS) {
    const share = peakDailyVisitors / HEIGHT_LINEAR_MAX_VISITORS;
    return HEIGHT_MIN + (HEIGHT_LINEAR_MAX - HEIGHT_MIN) * share;
  }
  const doublings = Math.log2(peakDailyVisitors / HEIGHT_LINEAR_MAX_VISITORS);
  const compressed = HEIGHT_LINEAR_MAX + doublings * ((HEIGHT_MAX - HEIGHT_LINEAR_MAX) / 6);
  return Math.min(HEIGHT_MAX, compressed);
}

// ---- rank -> target peakDailyVisitors ----
// rank 1 (home) is hand-set to land at the log-compressed ceiling — the one
// unmistakable "Empire State Building" of the demo. Ranks 2..50 follow a
// smooth geometric decay from a lower ceiling down to a small-shop floor.
const HOME_TARGET = 900_000; // compileHeight(900000) ~= 260 (clipped ceiling)
const TIER_MAX = 180_000; // rank 2
const TIER_MIN = 25; // rank 50
const TIER_COUNT = 49; // ranks 2..50

function targetForRank(rank) {
  if (rank === 1) return HOME_TARGET;
  const i = rank - 2; // 0..48
  const t = i / (TIER_COUNT - 1);
  const value = TIER_MAX * Math.pow(TIER_MIN / TIER_MAX, t);
  return Math.round(value);
}

// ---- split a building's target across its pages ----
// The first page in the manifest's `pages` array is always that building's
// index/landing page (see generate.js's write order). Give it the dominant
// share so a "max across this building's pages" reading and a "sum across
// this building's pages" reading both land close to the intended target;
// spread the rest across the remaining pages with light jitter so secondary
// pages still show nonzero, realistic traffic.
function splitAcrossPages(target, pageCount) {
  if (pageCount <= 1) return [target];
  const leadShare = 0.7;
  const lead = Math.round(target * leadShare);
  const remaining = target - lead;
  const others = pageCount - 1;
  const base = remaining / others;
  const shares = [lead];
  let allocated = 0;
  for (let i = 0; i < others; i++) {
    const isLast = i === others - 1;
    const jitter = 0.7 + Math.random() * 0.6; // 0.7x - 1.3x
    const raw = isLast ? remaining - allocated : base * jitter;
    const val = Math.max(1, Math.round(raw));
    shares.push(val);
    allocated += val;
  }
  return shares;
}

const PEAK_DAY = (() => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1); // "yesterday" UTC — safely inside any 30-day window, not the current partial day
  return d.toISOString().slice(0, 10);
})();

const rows = [];
const summary = [];

for (const building of manifest.buildings) {
  const target = targetForRank(building.rank);
  const shares = splitAcrossPages(target, building.pages.length);
  building.pages.forEach((relPath, i) => {
    rows.push({
      domain: manifest.domain,
      path: `${manifest.basePathPrefix}/${relPath}`,
      day: PEAK_DAY,
      count: shares[i],
    });
  });
  summary.push({
    building: building.key,
    rank: building.rank,
    pages: building.pages.length,
    target,
    height: Math.round(compileHeight(target) * 10) / 10,
    tagProfile: building.tagProfile,
  });
}

summary.sort((a, b) => a.rank - b.rank);

console.log(`Peak day: ${PEAK_DAY}  |  domain: ${manifest.domain}  |  total rows: ${rows.length}\n`);
console.log(
  "rank".padEnd(5) + "building".padEnd(22) + "pages".padEnd(7) + "target/day".padEnd(12) + "height".padEnd(8) + "tags"
);
for (const s of summary) {
  console.log(
    String(s.rank).padEnd(5) +
      s.building.padEnd(22) +
      String(s.pages).padEnd(7) +
      s.target.toLocaleString().padEnd(12) +
      String(s.height).padEnd(8) +
      s.tagProfile
  );
}

if (process.argv.includes("--write")) {
  const outPath = path.join(__dirname, ".traffic-seed.json");
  fs.writeFileSync(outPath, JSON.stringify({ peakDay: PEAK_DAY, domain: manifest.domain, rows, summary }, null, 2));
  console.log(`\nWrote ${outPath} (${rows.length} rows).`);
}
