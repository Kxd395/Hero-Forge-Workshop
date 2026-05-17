import { mkdir, writeFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";

const SOURCE_URL = "https://raw.githubusercontent.com/justinmahar/superpowerlistdb/master/superpowers.csv";
const ATTRIBUTION = "Copyright © Justin Mahar | The Superpower List";
const OUTPUT_DIR = new URL("../public/data/", import.meta.url);
const POOL_OUTPUT = new URL("./superpower-list-pool.json", OUTPUT_DIR);
const MANIFEST_OUTPUT = new URL("./superpower-list-manifest.json", OUTPUT_DIR);

function splitTags(tags) {
  return String(tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function numberOrZero(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeRow(row) {
  return {
    sourceId: Number(row.id),
    name: row.name?.trim() || "Untitled Power",
    overview: row.overview?.trim() || "",
    description: row.description?.trim() || "",
    pros: [row.pro1, row.pro2, row.pro3].map((item) => item?.trim()).filter(Boolean),
    cons: [row.con1, row.con2, row.con3].map((item) => item?.trim()).filter(Boolean),
    tags: splitTags(row.tags),
    state: row.state?.trim() || "unknown",
    preferenceRatio: numberOrZero(row.preference_ratio),
    timesPreferred: numberOrZero(row.times_preferred),
    timesRejected: numberOrZero(row.times_rejected),
    totalComparisons: numberOrZero(row.total_comparisons),
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
    lastComparedAt: row.last_compared_at || null,
    username: row.username?.trim() || "unknown"
  };
}

function buildManifest(records) {
  const states = records.reduce((accumulator, record) => {
    accumulator[record.state] = (accumulator[record.state] || 0) + 1;
    return accumulator;
  }, {});

  return {
    sourceName: "Superpower List Database",
    sourceUrl: "https://github.com/justinmahar/superpowerlistdb",
    csvUrl: SOURCE_URL,
    attribution: ATTRIBUTION,
    importedAt: new Date().toISOString(),
    totalRecords: records.length,
    stateCounts: states,
    fields: [
      "sourceId",
      "name",
      "overview",
      "description",
      "pros",
      "cons",
      "tags",
      "state",
      "preferenceRatio",
      "timesPreferred",
      "timesRejected",
      "totalComparisons",
      "createdAt",
      "updatedAt",
      "lastComparedAt",
      "username"
    ]
  };
}

const response = await fetch(SOURCE_URL);

if (!response.ok) {
  throw new Error(`Failed to download Superpower List CSV: ${response.status} ${response.statusText}`);
}

const csv = await response.text();
const rows = parse(csv, {
  columns: true,
  skip_empty_lines: true,
  bom: true
});
const records = rows.map(normalizeRow).sort((left, right) => {
  if (right.preferenceRatio !== left.preferenceRatio) {
    return right.preferenceRatio - left.preferenceRatio;
  }
  return right.totalComparisons - left.totalComparisons;
});

await mkdir(OUTPUT_DIR, { recursive: true });
await writeFile(POOL_OUTPUT, `${JSON.stringify(records)}\n`);
await writeFile(MANIFEST_OUTPUT, `${JSON.stringify(buildManifest(records), null, 2)}\n`);

console.log(`Imported ${records.length} powers into ${POOL_OUTPUT.pathname}`);
