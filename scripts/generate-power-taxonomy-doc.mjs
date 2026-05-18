import { readFile, writeFile } from "node:fs/promises";

import { BASE_SUPERPOWERS, POWER_CATEGORIES } from "../src/data/superpowers.js";
import { ORIGIN_SOURCES } from "../src/utils/heroBuilder.js";
import {
  POWER_SUBCATEGORIES,
  buildCanonLibrary,
  buildImportedLibrary,
  filterLibrary,
  getPowerScope,
  getRecommendedSlot
} from "../src/utils/powerLibrary.js";

const DATA_PATH = new URL("../public/data/superpower-list-pool.json", import.meta.url);
const OUTPUT_PATH = new URL("../docs/power-catalog-taxonomy.md", import.meta.url);

const rawImported = JSON.parse(await readFile(DATA_PATH, "utf8"));
const publishedImported = rawImported.filter((power) => power?.state === "published");
const canonPowers = buildCanonLibrary(BASE_SUPERPOWERS, POWER_CATEGORIES);
const importedPowers = buildImportedLibrary(publishedImported, POWER_CATEGORIES);
const unifiedLibrary = [...canonPowers, ...importedPowers];

function countByCategory(sourcePowers, categoryId) {
  return sourcePowers.filter((power) => power.category === categoryId).length;
}

function countBySubcategory(categoryId, subcategoryId) {
  return filterLibrary({
    powers: unifiedLibrary,
    category: categoryId,
    subcategory: subcategoryId,
    limit: 1
  }).totalMatches;
}

function statLine(power) {
  const { offense, defense, mobility, utility, control, risk } = power.stats;
  return `off ${offense}, def ${defense}, mob ${mobility}, util ${utility}, ctrl ${control}, risk ${risk}`;
}

function categoryName(categoryId) {
  return POWER_CATEGORIES.find((category) => category.id === categoryId)?.name ?? categoryId;
}

function formatPowerRow(power) {
  const slot = getRecommendedSlot(power);
  const scope = getPowerScope(power);
  return `| ${power.name} | ${power.tier} | ${power.role} | ${slot.label} | ${scope.label} | ${statLine(power)} |`;
}

function topImportedForCategory(categoryId) {
  return importedPowers
    .filter((power) => power.category === categoryId)
    .sort(
      (left, right) =>
        right.popularity - left.popularity ||
        right.raw.totalComparisons - left.raw.totalComparisons ||
        left.name.localeCompare(right.name)
    )
    .slice(0, 12);
}

function powerListLine(power) {
  const slot = getRecommendedSlot(power);
  const scope = getPowerScope(power);
  const tags = power.tags.slice(0, 4).join(", ") || "no tags";
  return `- **${power.name}**: ${slot.label}, ${scope.label}; ${power.summary}; tags: ${tags}.`;
}

const lines = [
  "# Power Catalog Taxonomy",
  "",
  "This is the operating index for the Hero Forge Workshop power catalog. It describes how the app groups, recommends, and explains powers without turning the 8,000+ imported records into hand-maintained documentation.",
  "",
  "Generated from:",
  "",
  "- `src/data/superpowers.js` for original canon powers and categories",
  "- `src/utils/powerLibrary.js` for category inference, subcategories, scope, and slot recommendation rules",
  "- `src/utils/heroBuilder.js` for origin sources",
  "- `public/data/superpower-list-pool.json` for imported Superpower List records",
  "",
  "Regenerate with `npm run docs:powers` after changing categories, subcategories, origin sources, ranking logic, or the imported pool.",
  "",
  "## Catalog Summary",
  "",
  `- Canon powers: ${canonPowers.length}`,
  `- Published imported powers: ${importedPowers.length}`,
  `- Unified library total: ${unifiedLibrary.length}`,
  `- Raw imported records: ${rawImported.length}`,
  "",
  "## Category Counts",
  "",
  "| Category | Canon | Imported | Total | Subcategories |",
  "| --- | ---: | ---: | ---: | --- |"
];

for (const category of POWER_CATEGORIES) {
  const canonCount = countByCategory(canonPowers, category.id);
  const importedCount = countByCategory(importedPowers, category.id);
  const subcategories = (POWER_SUBCATEGORIES[category.id] ?? [])
    .map((subcategory) => `${subcategory.label} (${countBySubcategory(category.id, subcategory.id)})`)
    .join(", ");
  lines.push(`| ${category.name} | ${canonCount} | ${importedCount} | ${canonCount + importedCount} | ${subcategories} |`);
}

lines.push(
  "",
  "## Origin To Power Fit",
  "",
  "Origin explains how the hero got powers. It does not occupy a power slot. The selected origin biases recommendations toward preferred categories while still allowing any power to be chosen.",
  "",
  "| Origin | Primary Category | Preferred Categories | Story Use |",
  "| --- | --- | --- | --- |"
);

for (const origin of ORIGIN_SOURCES) {
  const preferred = origin.preferredCategories.map(categoryName).join(", ");
  lines.push(`| ${origin.name} | ${categoryName(origin.categoryId)} | ${preferred} | ${origin.summary} |`);
}

lines.push(
  "",
  "## Slot Model",
  "",
  "| Slot | Count | Purpose |",
  "| --- | ---: | --- |",
  "| Primary | 1 | The signature power people remember. Usually high offense, control, or concept-defining utility. |",
  "| Secondary | 0-3 | Combo powers that broaden the hero without replacing the signature. |",
  "| Utility | 0-1 | Practical field use: movement, rescue, scouting, defense, investigation, support, or escape. |",
  "",
  "Limits are derived from selected powers' weaknesses and optional story constraints. They are not a power category, not a filter, and not a separate build slot.",
  "",
  "## Canon Power Index",
  "",
  "| Power | Tier | Role | Best Slot | Scope | Stats |",
  "| --- | --- | --- | --- | --- | --- |"
);

for (const power of canonPowers.sort((left, right) => left.categoryName.localeCompare(right.categoryName) || left.name.localeCompare(right.name))) {
  lines.push(formatPowerRow(power));
}

lines.push("", "## Category Details", "");

for (const category of POWER_CATEGORIES) {
  const categoryCanon = canonPowers
    .filter((power) => power.category === category.id)
    .sort((left, right) => left.name.localeCompare(right.name));
  const importedExamples = topImportedForCategory(category.id);
  const subcategories = POWER_SUBCATEGORIES[category.id] ?? [];

  lines.push(`### ${category.name}`, "", category.tagline, "");
  lines.push(`- Canon count: ${categoryCanon.length}`);
  lines.push(`- Imported count: ${countByCategory(importedPowers, category.id)}`);
  lines.push(`- Total count: ${countByCategory(unifiedLibrary, category.id)}`);
  lines.push(`- Subcategories: ${subcategories.map((subcategory) => `${subcategory.label} (${countBySubcategory(category.id, subcategory.id)})`).join(", ")}`);
  lines.push("");

  if (categoryCanon.length > 0) {
    lines.push("Canon powers:");
    for (const power of categoryCanon) {
      lines.push(powerListLine(power));
    }
    lines.push("");
  }

  if (importedExamples.length > 0) {
    lines.push("Representative imported powers:");
    for (const power of importedExamples) {
      lines.push(powerListLine(power));
    }
    lines.push("");
  }
}

lines.push(
  "## Full Imported Catalog",
  "",
  "The complete imported list is intentionally stored as data, not prose documentation:",
  "",
  "- Full normalized pool: `public/data/superpower-list-pool.json`",
  "- Import manifest: `public/data/superpower-list-manifest.json`",
  "- Import pipeline: `scripts/import-superpower-list.mjs`",
  "",
  "The documentation lists every canon power and representative imported powers per category. The app itself is the source of truth for browsing every imported record with search, category filters, subcategory filters, source filters, role-fit filters, stat filters, sorting, and pagination.",
  ""
);

await writeFile(OUTPUT_PATH, `${lines.join("\n")}\n`);
