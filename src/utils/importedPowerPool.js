export const IMPORTED_POWER_PREVIEW_LIMIT = 72;
export const IMPORTED_POWER_SORTS = [
  { id: "ranked", label: "Ranked" },
  { id: "popular", label: "Most Compared" },
  { id: "newest", label: "Newest" },
  { id: "name", label: "A-Z" }
];

function sortImportedPowers(powers, sortBy) {
  const sorted = [...powers];

  if (sortBy === "popular") {
    return sorted.sort((left, right) => right.totalComparisons - left.totalComparisons || left.name.localeCompare(right.name));
  }

  if (sortBy === "newest") {
    return sorted.sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")));
  }

  if (sortBy === "name") {
    return sorted.sort((left, right) => left.name.localeCompare(right.name));
  }

  return sorted.sort((left, right) => {
    if (right.preferenceRatio !== left.preferenceRatio) {
      return right.preferenceRatio - left.preferenceRatio;
    }
    return right.totalComparisons - left.totalComparisons || left.name.localeCompare(right.name);
  });
}

export function filterImportedPowers({
  powers,
  query = "",
  state = "published",
  tag = "all",
  sortBy = "ranked",
  limit = IMPORTED_POWER_PREVIEW_LIMIT
}) {
  const normalizedQuery = query.trim().toLowerCase();

  const matches = powers.filter((power) => {
    const matchesState = state === "all" || power.state === state;
    const matchesTag = tag === "all" || power.tags.includes(tag);
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [power.name, power.overview, power.description, ...power.pros, ...power.cons, ...power.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

    return matchesState && matchesTag && matchesQuery;
  });

  const sortedMatches = sortImportedPowers(matches, sortBy);

  return {
    totalMatches: sortedMatches.length,
    visible: sortedMatches.slice(0, limit)
  };
}

export function getTopImportedTags(powers, limit = 12) {
  const counts = new Map();

  powers.forEach((power) => {
    power.tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

export function getImportedStateOptions(manifest) {
  if (!manifest?.stateCounts) {
    return ["published", "all"];
  }

  return ["published", "all", ...Object.keys(manifest.stateCounts).filter((state) => state !== "published").sort()];
}
