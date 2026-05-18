import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

import { POWER_CATEGORIES } from "../src/data/superpowers.js";
import { buildImportedLibrary } from "../src/utils/powerLibrary.js";
import {
  RANKING_PIPELINE_VERSION,
  RANKING_RULESET_VERSION,
  RANKING_SCHEMA_VERSION,
  createRankingProfile,
  stripRankingAudit
} from "../src/utils/rankingModel.js";

const POOL_INPUT = new URL("../public/data/superpower-list-pool.json", import.meta.url);
const ENRICHED_OUTPUT = new URL("../public/data/superpower-list-enriched.json", import.meta.url);
const AUDIT_OUTPUT = new URL("../public/data/superpower-list-ranking-audit.json", import.meta.url);
const HIDDEN_REVIEW_OUTPUT = new URL("../public/data/superpower-list-hidden-review.json", import.meta.url);
const MANIFEST_OUTPUT = new URL("../public/data/superpower-list-ranking-manifest.json", import.meta.url);

function hashRecord(record) {
  return createHash("sha256")
    .update(JSON.stringify(record))
    .digest("hex");
}

function buildManifest({
  generatedAt,
  inputHash,
  totalRecords,
  visibleRecords,
  hiddenRecords,
  hiddenReasons,
  rankingDistribution
}) {
  return {
    schemaVersion: RANKING_SCHEMA_VERSION,
    pipelineVersion: RANKING_PIPELINE_VERSION,
    rulesetVersion: RANKING_RULESET_VERSION,
    generatedAt,
    inputHash,
    sourceFile: "public/data/superpower-list-pool.json",
    enrichedFile: "public/data/superpower-list-enriched.json",
    auditFile: "public/data/superpower-list-ranking-audit.json",
    hiddenReviewFile: "public/data/superpower-list-hidden-review.json",
    totalRecords,
    visibleRecords,
    hiddenRecords,
    hiddenReasons,
    rankingDistribution,
    fields: [
      "ranking.rating",
      "ranking.scope",
      "ranking.risk",
      "ranking.bestRole",
      "ranking.confidence",
      "ranking.popularity",
      "ranking.constraint",
      "ranking.content",
      "ranking.evidenceSummary"
    ]
  };
}

const rawPoolText = await readFile(POOL_INPUT, "utf8");
const rawPool = JSON.parse(rawPoolText);
const published = Array.isArray(rawPool)
  ? rawPool.filter((entry) => entry?.state === "published" && entry?.name)
  : [];
const inputHash = createHash("sha256").update(rawPoolText).digest("hex");
const generatedAt = new Date().toISOString();
const importedLibrary = buildImportedLibrary(published, POWER_CATEGORIES);

const enriched = [];
const audit = [];
const hiddenReview = [];
const hiddenReasons = {};
const rankingDistribution = {
  rating: {},
  scope: {},
  risk: {},
  bestRole: {},
  confidence: {}
};

function incrementDistribution(group, value) {
  rankingDistribution[group][value] = (rankingDistribution[group][value] ?? 0) + 1;
}

for (const power of importedLibrary) {
  const ranking = createRankingProfile(power, {
    generatedAt,
    inputHash: hashRecord(power.raw)
  });
  const { raw, ...publicPower } = power;
  enriched.push({
    ...publicPower,
    sourceId: raw.sourceId,
    tier: ranking.rating,
    ranking: stripRankingAudit(ranking)
  });
  if (!ranking.content.defaultVisible) {
    for (const reason of ranking.content.reasons ?? ["hidden"]) {
      hiddenReasons[reason] = (hiddenReasons[reason] ?? 0) + 1;
    }
    hiddenReview.push({
      id: power.id,
      sourceId: raw.sourceId,
      name: power.name,
      category: power.category,
      categoryName: power.categoryName,
      role: power.role,
      rating: ranking.rating,
      scope: ranking.scope,
      risk: ranking.risk.level,
      bestRole: ranking.bestRole,
      confidence: ranking.confidence.label,
      reasons: ranking.content.reasons,
      contentFlags: ranking.content.flags,
      qualityFlags: ranking.quality.flags,
      evidenceSummary: ranking.evidenceSummary
    });
  }
  incrementDistribution("rating", ranking.rating);
  incrementDistribution("scope", ranking.scope);
  incrementDistribution("risk", ranking.risk.level);
  incrementDistribution("bestRole", ranking.bestRole);
  incrementDistribution("confidence", ranking.confidence.label);
  audit.push({
    id: power.id,
    sourceId: power.raw.sourceId,
    name: power.name,
    ranking: {
      schemaVersion: ranking.schemaVersion,
      pipelineVersion: ranking.pipelineVersion,
      rulesetVersion: ranking.rulesetVersion,
      inputHash: ranking.inputHash,
      evidence: ranking.evidence
    }
  });
}

const manifest = buildManifest({
  generatedAt,
  inputHash,
  totalRecords: enriched.length,
  visibleRecords: enriched.filter((power) => power.ranking.content.defaultVisible).length,
  hiddenRecords: enriched.filter((power) => !power.ranking.content.defaultVisible).length,
  hiddenReasons: Object.fromEntries(Object.entries(hiddenReasons).sort((left, right) => right[1] - left[1])),
  rankingDistribution
});

await writeFile(ENRICHED_OUTPUT, `${JSON.stringify(enriched)}\n`);
await writeFile(AUDIT_OUTPUT, `${JSON.stringify(audit)}\n`);
await writeFile(HIDDEN_REVIEW_OUTPUT, `${JSON.stringify(hiddenReview)}\n`);
await writeFile(MANIFEST_OUTPUT, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Enriched ${enriched.length} imported powers into ${ENRICHED_OUTPUT.pathname}`);
