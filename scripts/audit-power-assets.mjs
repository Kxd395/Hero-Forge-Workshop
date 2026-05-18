import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const ENRICHED_PATH = new URL("../public/data/superpower-list-enriched.json", import.meta.url);
const AUDIT_PATH = new URL("../public/data/superpower-list-ranking-audit.json", import.meta.url);
const HIDDEN_REVIEW_PATH = new URL("../public/data/superpower-list-hidden-review.json", import.meta.url);
const MANIFEST_PATH = new URL("../public/data/superpower-list-ranking-manifest.json", import.meta.url);

const BUDGETS = {
  enrichedGzipBytes: 3.5 * 1024 * 1024,
  auditGzipBytes: 5 * 1024 * 1024,
  hiddenReviewGzipBytes: 250 * 1024
};

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}

function gzipSize(text) {
  return gzipSync(text).byteLength;
}

function assert(condition, message, failures) {
  if (!condition) failures.push(message);
}

const [enrichedText, auditText, hiddenReviewText, manifestText] = await Promise.all([
  readFile(ENRICHED_PATH, "utf8"),
  readFile(AUDIT_PATH, "utf8"),
  readFile(HIDDEN_REVIEW_PATH, "utf8"),
  readFile(MANIFEST_PATH, "utf8")
]);

const enriched = JSON.parse(enrichedText);
const audit = JSON.parse(auditText);
const hiddenReview = JSON.parse(hiddenReviewText);
const manifest = JSON.parse(manifestText);
const visibleRecords = enriched.filter((power) => power?.ranking?.content?.defaultVisible !== false).length;
const hiddenRecords = enriched.length - visibleRecords;
const enrichedGzipBytes = gzipSize(enrichedText);
const auditGzipBytes = gzipSize(auditText);
const hiddenReviewGzipBytes = gzipSize(hiddenReviewText);
const failures = [];

assert(Array.isArray(enriched), "enriched payload must be an array", failures);
assert(Array.isArray(audit), "audit payload must be an array", failures);
assert(Array.isArray(hiddenReview), "hidden review payload must be an array", failures);
assert(manifest.totalRecords === enriched.length, "manifest totalRecords does not match enriched payload", failures);
assert(manifest.visibleRecords === visibleRecords, "manifest visibleRecords does not match enriched payload", failures);
assert(manifest.hiddenRecords === hiddenRecords, "manifest hiddenRecords does not match enriched payload", failures);
assert(manifest.hiddenReviewFile === "public/data/superpower-list-hidden-review.json", "manifest hiddenReviewFile is missing or incorrect", failures);
assert(audit.length === enriched.length, "audit payload count does not match enriched payload", failures);
assert(hiddenReview.length === hiddenRecords, "hidden review payload count does not match hidden records", failures);
assert(enrichedGzipBytes <= BUDGETS.enrichedGzipBytes, `enriched gzip size exceeds ${formatBytes(BUDGETS.enrichedGzipBytes)}`, failures);
assert(auditGzipBytes <= BUDGETS.auditGzipBytes, `audit gzip size exceeds ${formatBytes(BUDGETS.auditGzipBytes)}`, failures);
assert(hiddenReviewGzipBytes <= BUDGETS.hiddenReviewGzipBytes, `hidden review gzip size exceeds ${formatBytes(BUDGETS.hiddenReviewGzipBytes)}`, failures);

const report = {
  totalRecords: enriched.length,
  visibleRecords,
  hiddenRecords,
  enriched: {
    raw: formatBytes(Buffer.byteLength(enrichedText)),
    gzip: formatBytes(enrichedGzipBytes)
  },
  audit: {
    raw: formatBytes(Buffer.byteLength(auditText)),
    gzip: formatBytes(auditGzipBytes)
  },
  hiddenReview: {
    raw: formatBytes(Buffer.byteLength(hiddenReviewText)),
    gzip: formatBytes(hiddenReviewGzipBytes)
  },
  hiddenReasons: manifest.hiddenReasons ?? {},
  rankingDistribution: manifest.rankingDistribution ?? {}
};

console.log(JSON.stringify(report, null, 2));

if (failures.length > 0) {
  console.error("Power asset audit failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
}
