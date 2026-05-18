export const SAVED_DRAFT_SCHEMA_VERSION = 1;

export function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function getPublishedImportedRecords(rawPool) {
  if (!Array.isArray(rawPool)) return [];
  return rawPool.filter((entry) => (
    isRecord(entry) &&
    entry.state === "published" &&
    typeof entry.name === "string" &&
    entry.name.trim().length > 0
  ));
}

export function getVisibleEnrichedPowers(rawPowers) {
  if (!Array.isArray(rawPowers)) return [];
  return rawPowers.filter((power) => (
    isRecord(power) &&
    power.source === "imported" &&
    typeof power.id === "string" &&
    typeof power.name === "string" &&
    power.name.trim().length > 0 &&
    isRecord(power.stats) &&
    isRecord(power.ranking) &&
    power.ranking?.content?.defaultVisible !== false
  ));
}

export function normalizeSavedDraft(rawDraft) {
  if (!isRecord(rawDraft) || !isRecord(rawDraft.heroBuild)) return null;
  const name = typeof rawDraft.name === "string" && rawDraft.name.trim()
    ? rawDraft.name.trim()
    : "Untitled Draft";
  const id = typeof rawDraft.id === "string" && rawDraft.id.trim()
    ? rawDraft.id
    : `${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return {
    schemaVersion: Number.isInteger(rawDraft.schemaVersion)
      ? rawDraft.schemaVersion
      : SAVED_DRAFT_SCHEMA_VERSION,
    id,
    name,
    classification: typeof rawDraft.classification === "string" ? rawDraft.classification : "Unclassified",
    selectedCount: Number.isFinite(rawDraft.selectedCount) ? rawDraft.selectedCount : 0,
    savedAt: typeof rawDraft.savedAt === "string" ? rawDraft.savedAt : new Date().toISOString(),
    heroBuild: rawDraft.heroBuild
  };
}

export function normalizeSavedDrafts(rawDrafts, limit = 12) {
  if (!Array.isArray(rawDrafts)) return [];
  return rawDrafts
    .map(normalizeSavedDraft)
    .filter(Boolean)
    .slice(0, limit);
}
