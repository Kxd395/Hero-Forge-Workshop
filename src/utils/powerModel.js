import { BASE_SUPERPOWERS, POWER_CATEGORIES } from "../data/superpowers.js";

const STAT_KEYS = ["offense", "defense", "mobility", "utility", "control", "risk"];

export function getCategoryById(categoryId, categories = POWER_CATEGORIES) {
  return categories.find((category) => category.id === categoryId);
}

export function getPowersByCategory(powers = BASE_SUPERPOWERS) {
  return POWER_CATEGORIES.map((category) => ({
    ...category,
    powers: powers.filter((power) => power.category === category.id)
  })).filter((category) => category.powers.length > 0);
}

export function calculatePowerScore(power) {
  const capability =
    power.stats.offense +
    power.stats.defense +
    power.stats.mobility +
    power.stats.utility +
    power.stats.control;

  return Math.max(1, Math.round(capability - power.stats.risk * 0.6));
}

export function validatePowerCatalog(powers = BASE_SUPERPOWERS, categories = POWER_CATEGORIES) {
  const categoryIds = new Set(categories.map((category) => category.id));
  const ids = new Set();
  const failures = [];

  powers.forEach((power) => {
    if (ids.has(power.id)) {
      failures.push(`${power.id}: duplicate power id`);
    }
    ids.add(power.id);

    if (!categoryIds.has(power.category)) {
      failures.push(`${power.id}: unknown category '${power.category}'`);
    }

    STAT_KEYS.forEach((key) => {
      const value = power.stats?.[key];
      if (!Number.isInteger(value) || value < 1 || value > 10) {
        failures.push(`${power.id}: stat '${key}' must be an integer from 1 to 10`);
      }
    });

    ["strengths", "weaknesses", "counters"].forEach((field) => {
      if (!Array.isArray(power[field]) || power[field].length === 0) {
        failures.push(`${power.id}: '${field}' must include at least one item`);
      }
    });
  });

  return failures;
}

export function filterPowers({ powers = BASE_SUPERPOWERS, query = "", category = "all", tier = "all" }) {
  const normalizedQuery = query.trim().toLowerCase();

  return powers.filter((power) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [power.name, power.role, power.description, ...power.strengths, ...power.weaknesses]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    const matchesCategory = category === "all" || power.category === category;
    const matchesTier = tier === "all" || power.tier === tier;

    return matchesQuery && matchesCategory && matchesTier;
  });
}
