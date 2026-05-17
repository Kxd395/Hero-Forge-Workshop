import { BASE_SUPERPOWERS, POWER_CATEGORIES } from "../data/superpowers.js";
import { calculatePowerScore, getCategoryById } from "./powerModel.js";

/**
 * Unified Power shape used everywhere in the UI.
 *
 *   {
 *     id:          string   // globally unique, prefixed by source
 *     source:      'canon' | 'imported' | 'generated'
 *     name:        string
 *     category:    string   // POWER_CATEGORIES id
 *     categoryName:string
 *     tier:        'core' | 'advanced' | 'legendary'
 *     role:        string
 *     description: string
 *     summary:     string   // short, single-line
 *     strengths:   string[]
 *     weaknesses:  string[]
 *     counters:    string[]
 *     tags:        string[]
 *     stats:       { offense, defense, mobility, utility, control, risk }
 *     score:       number   // calculatePowerScore()
 *     popularity:  number   // 0..1 (preference ratio for imported, derived for canon)
 *     raw:         object   // original payload for traceability
 *   }
 *
 * The whole UI consumes this single shape. The library does not care which
 * source a power came from -- a small badge on the card is the only place
 * `source` is visible.
 */

// ---------------------------------------------------------------------------
// Category inference
// ---------------------------------------------------------------------------

// Keyword vocabulary per category. Each entry is a *root* matched against
// whole words in the input. We use word-prefix matching so "invuln" still
// captures "invulnerable" / "invulnerability" without bleeding into unrelated
// substrings (e.g. "mental" must not match "elemental").
const CATEGORY_KEYWORDS = {
  physical: [
    "strength", "strong", "muscle", "punch", "kick", "fight", "fist",
    "durab", "tough", "invuln", "endur", "stamina", "body", "bone", "skin",
    "armor", "armour", "giant", "tiny"
  ],
  elemental: [
    "fire", "flame", "burn", "lava", "magma",
    "ice", "frost", "freeze", "snow", "cold",
    "water", "aqua", "ocean", "rain", "wave",
    "earth", "rock", "stone", "sand",
    "air", "wind", "storm", "tornado", "weather"
  ],
  psychic: [
    "mind", "telepa", "psych", "thought", "mental", "memory", "emotion",
    "dream", "hypno", "illusion", "perceive", "perception", "empath"
  ],
  energy: [
    "energy", "laser", "beam", "blast", "plasma", "radiation",
    "electric", "lightning", "shock", "voltage",
    "magnet", "aura", "charge"
  ],
  mobility: [
    "fly", "flight", "speed", "swift", "run", "sprint",
    "jump", "leap", "bounce", "teleport", "portal", "phase",
    "travel", "transport", "swim"
  ],
  biological: [
    "heal", "regen", "mutat", "shift", "shape", "morph",
    "smell", "vision", "hear", "taste",
    "animal", "plant", "tree", "vine", "blood", "venom", "poison", "toxin",
    "clone", "grow"
  ],
  tech: [
    "tech", "comput", "cyber", "machine", "robot", "android", "drone",
    "digital", "data", "hack", "code", "electronic", "device",
    "weapon", "gun", "tool", "gear", "suit", "gadget"
  ],
  mystic: [
    "magic", "spell", "curse", "ritual", "rune", "arcane", "occult",
    "demon", "angel", "soul", "spirit", "ghost", "haunt",
    "divin", "bless", "alche", "summon", "incant"
  ],
  cosmic: [
    "space", "star", "cosmic", "galaxy", "planet", "solar", "lunar",
    "time", "temporal", "chrono", "gravity",
    "dimension", "reality", "universe", "void", "quantum", "infinity"
  ],
  stealth: [
    "invisib", "stealth", "shadow", "hide", "hidden",
    "silent", "sneak", "camoufl", "disguise", "mask", "intang",
    "spy", "ninja"
  ]
};

export const POWER_SUBCATEGORIES = {
  physical: [
    { id: "strength", label: "Strength", roots: ["strength", "strong", "muscle", "lift", "punch", "strike"] },
    { id: "durability", label: "Durability", roots: ["durab", "tough", "invuln", "endurance", "armor", "resist"] },
    { id: "size", label: "Size Change", roots: ["giant", "grow", "shrink", "tiny", "size"] },
    { id: "combat", label: "Combat", roots: ["fight", "combat", "martial", "weapon", "brawl"] }
  ],
  elemental: [
    { id: "fire", label: "Fire", roots: ["fire", "flame", "burn", "lava", "heat"] },
    { id: "ice", label: "Ice", roots: ["ice", "frost", "freeze", "snow", "cold"] },
    { id: "water", label: "Water", roots: ["water", "aqua", "ocean", "rain", "wave"] },
    { id: "earth", label: "Earth", roots: ["earth", "rock", "stone", "sand", "metal"] },
    { id: "air-weather", label: "Air / Weather", roots: ["air", "wind", "storm", "weather", "tornado", "lightning"] }
  ],
  psychic: [
    { id: "telepathy", label: "Telepathy", roots: ["telepa", "mind", "thought", "mental"] },
    { id: "emotion", label: "Emotion", roots: ["emotion", "empath", "fear", "rage", "calm"] },
    { id: "illusion", label: "Illusion", roots: ["illusion", "dream", "hypno", "halluc"] },
    { id: "memory", label: "Memory", roots: ["memory", "forget", "remember", "cognition"] },
    { id: "perception", label: "Perception", roots: ["perceive", "perception", "sense", "awareness"] }
  ],
  energy: [
    { id: "blast", label: "Blasts", roots: ["blast", "beam", "laser", "bolt", "ray"] },
    { id: "electricity", label: "Electricity", roots: ["electric", "lightning", "shock", "voltage"] },
    { id: "light", label: "Light", roots: ["light", "radiant", "photon", "glow"] },
    { id: "magnetism", label: "Magnetism", roots: ["magnet", "metal", "polarity"] },
    { id: "absorption", label: "Absorption", roots: ["absorb", "battery", "charge", "convert"] }
  ],
  mobility: [
    { id: "speed", label: "Speed", roots: ["speed", "swift", "run", "sprint", "accelerat"] },
    { id: "flight", label: "Flight", roots: ["fly", "flight", "wing", "aerial", "levitat"] },
    { id: "teleportation", label: "Teleportation", roots: ["teleport", "blink", "instant", "relocat"] },
    { id: "portals", label: "Portals", roots: ["portal", "gateway", "doorway", "passage"] },
    { id: "phasing", label: "Phasing", roots: ["phase", "intang", "pass through", "density"] },
    { id: "time-travel", label: "Time Travel", roots: ["time travel", "temporal", "chrono", "timeline"] },
    { id: "dimensional", label: "Dimensional", roots: ["dimension", "realm", "space", "distance"] },
    { id: "jumping", label: "Jumping", roots: ["jump", "leap", "bounce"] }
  ],
  biological: [
    { id: "healing", label: "Healing", roots: ["heal", "regen", "recover", "repair"] },
    { id: "mutation", label: "Mutation", roots: ["mutat", "evolve", "adapt", "gene"] },
    { id: "shifting", label: "Shifting", roots: ["shift", "shape", "morph", "transform"] },
    { id: "senses", label: "Senses", roots: ["vision", "hear", "smell", "taste", "sense"] },
    { id: "toxins", label: "Toxins", roots: ["venom", "poison", "toxin", "acid"] }
  ],
  tech: [
    { id: "cyber", label: "Cyber", roots: ["cyber", "hack", "digital", "data", "code"] },
    { id: "machines", label: "Machines", roots: ["machine", "robot", "android", "drone"] },
    { id: "gadgets", label: "Gadgets", roots: ["gadget", "gear", "tool", "device"] },
    { id: "armor", label: "Armor", roots: ["armor", "suit", "helmet", "exoskeleton"] },
    { id: "weapons", label: "Weapons", roots: ["weapon", "gun", "blade", "cannon"] }
  ],
  mystic: [
    { id: "magic", label: "Magic", roots: ["magic", "spell", "arcane", "occult"] },
    { id: "curses", label: "Curses", roots: ["curse", "hex", "jinx", "doom"] },
    { id: "summoning", label: "Summoning", roots: ["summon", "conjure", "call", "entity"] },
    { id: "spirits", label: "Spirits", roots: ["soul", "spirit", "ghost", "haunt"] },
    { id: "rituals", label: "Rituals", roots: ["ritual", "rune", "sigil", "incant"] }
  ],
  cosmic: [
    { id: "space", label: "Space", roots: ["space", "star", "galaxy", "planet", "solar", "lunar"] },
    { id: "time", label: "Time", roots: ["time", "temporal", "chrono", "timeline"] },
    { id: "gravity", label: "Gravity", roots: ["gravity", "mass", "orbit"] },
    { id: "dimensions", label: "Dimensions", roots: ["dimension", "reality", "universe", "realm"] },
    { id: "void", label: "Void", roots: ["void", "dark", "nothing", "abyss"] }
  ],
  stealth: [
    { id: "invisibility", label: "Invisibility", roots: ["invisib", "camoufl", "cloak"] },
    { id: "shadow", label: "Shadow", roots: ["shadow", "dark", "night"] },
    { id: "silence", label: "Silence", roots: ["silent", "sound", "noise"] },
    { id: "disguise", label: "Disguise", roots: ["disguise", "mask", "identity", "mimic"] },
    { id: "infiltration", label: "Infiltration", roots: ["sneak", "spy", "ninja", "infiltrat"] }
  ]
};

const CATEGORY_FALLBACK = "physical";

const KEYWORD_PATTERNS = Object.fromEntries(
  Object.entries(CATEGORY_KEYWORDS).map(([category, roots]) => [
    category,
    roots.map((root) => new RegExp(`\\b${root}[a-z]*\\b`, "i"))
  ])
);

const SUBCATEGORY_PATTERNS = Object.fromEntries(
  Object.entries(POWER_SUBCATEGORIES).map(([category, subcategories]) => [
    category,
    subcategories.map((subcategory) => ({
      ...subcategory,
      patterns: subcategory.roots.map((root) => new RegExp(`\\b${root.replaceAll(" ", "\\s+")}[a-z]*\\b`, "i"))
    }))
  ])
);

/**
 * Score every category against a blob of text and return the best match.
 * Matching uses word-prefix regexes (`\bfire\w*`) so we don't get spurious
 * hits from substrings (e.g. "mental" inside "elemental").
 */
export function inferCategory(text) {
  const haystack = String(text || "").toLowerCase();
  if (!haystack.trim()) return CATEGORY_FALLBACK;

  let bestCategory = CATEGORY_FALLBACK;
  let bestScore = 0;

  for (const [category, patterns] of Object.entries(KEYWORD_PATTERNS)) {
    let score = 0;
    for (const pattern of patterns) {
      if (pattern.test(haystack)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

function getPowerSearchText(power) {
  return [
    power.name,
    power.description,
    power.summary,
    power.role,
    power.categoryName,
    ...(power.strengths ?? []),
    ...(power.weaknesses ?? []),
    ...(power.tags ?? [])
  ].join(" ");
}

function matchesSubcategory(power, subcategoryId) {
  if (!subcategoryId || subcategoryId === "all") return true;
  const subcategories = SUBCATEGORY_PATTERNS[power.category] ?? [];
  const subcategory = subcategories.find((entry) => entry.id === subcategoryId);
  if (!subcategory) return false;
  const haystack = getPowerSearchText(power);
  return subcategory.patterns.some((pattern) => pattern.test(haystack));
}

// ---------------------------------------------------------------------------
// Stat / tier / role inference for imported powers
// ---------------------------------------------------------------------------

// Baseline stat profile per category. Used as a starting point and then
// modulated by popularity + cons count.
const CATEGORY_BASELINE = {
  physical:   { offense: 7, defense: 7, mobility: 4, utility: 4, control: 3, risk: 5 },
  elemental:  { offense: 8, defense: 5, mobility: 4, utility: 6, control: 6, risk: 7 },
  psychic:    { offense: 5, defense: 5, mobility: 2, utility: 8, control: 8, risk: 7 },
  energy:     { offense: 8, defense: 5, mobility: 5, utility: 6, control: 6, risk: 7 },
  mobility:   { offense: 3, defense: 5, mobility: 9, utility: 7, control: 5, risk: 4 },
  biological: { offense: 4, defense: 7, mobility: 5, utility: 7, control: 4, risk: 5 },
  tech:       { offense: 5, defense: 5, mobility: 4, utility: 9, control: 7, risk: 6 },
  mystic:     { offense: 6, defense: 6, mobility: 4, utility: 9, control: 8, risk: 8 },
  cosmic:     { offense: 7, defense: 7, mobility: 7, utility: 9, control: 8, risk: 9 },
  stealth:    { offense: 3, defense: 4, mobility: 6, utility: 8, control: 7, risk: 5 }
};

const ROLE_BY_CATEGORY = {
  physical: "Frontline Paragon",
  elemental: "Elemental Striker",
  psychic: "Mindlock Strategist",
  energy: "Energy Striker",
  mobility: "Field Responder",
  biological: "Recovery Specialist",
  tech: "Systems Operator",
  mystic: "Arcane Specialist",
  cosmic: "Cosmic Controller",
  stealth: "Infiltration Specialist"
};

function clampStat(value) {
  return Math.max(1, Math.min(10, Math.round(value)));
}

/**
 * Build a deterministic stat block for an imported power based on its
 * inferred category and signal density.
 */
export function inferStatsForImported({ category, popularity = 0.5, consCount = 0 }) {
  const baseline = CATEGORY_BASELINE[category] ?? CATEGORY_BASELINE[CATEGORY_FALLBACK];
  const bump = (popularity - 0.5) * 4; // -2 .. +2

  return {
    offense:  clampStat(baseline.offense  + bump),
    defense:  clampStat(baseline.defense  + bump * 0.5),
    mobility: clampStat(baseline.mobility + bump * 0.5),
    utility:  clampStat(baseline.utility  + bump * 0.75),
    control:  clampStat(baseline.control  + bump * 0.75),
    risk:     clampStat(baseline.risk     + consCount * 0.6)
  };
}

export function inferTierForImported({ popularity = 0, totalComparisons = 0 } = {}) {
  if (popularity >= 0.6 && totalComparisons >= 80) return "legendary";
  if (popularity >= 0.5 || totalComparisons >= 30) return "advanced";
  return "core";
}

export function inferRoleForImported(category) {
  return ROLE_BY_CATEGORY[category] ?? "Field Specialist";
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

function buildSummary(text, maxLength = 120) {
  const trimmed = String(text || "").trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

function popularityFromCanon(power) {
  // Canon powers are hand-curated; derive a stable popularity from score so
  // sorting still works when canon and imported are mixed.
  const score = calculatePowerScore(power);
  return Math.min(1, Math.max(0, score / 40));
}

export function normalizeCanonPower(power, categories = POWER_CATEGORIES) {
  const category = getCategoryById(power.category, categories);
  return {
    id: `canon:${power.id}`,
    source: "canon",
    name: power.name,
    category: power.category,
    categoryId: power.category,
    categoryName: category?.name ?? power.category,
    categoryAccent: category?.accent ?? "#34d2ff",
    tier: power.tier,
    role: power.role,
    description: power.description,
    summary: buildSummary(power.description),
    strengths: [...power.strengths],
    weaknesses: [...power.weaknesses],
    counters: [...power.counters],
    tags: [power.category, power.tier, power.role.toLowerCase()].filter(Boolean),
    stats: { ...power.stats },
    score: calculatePowerScore(power),
    popularity: popularityFromCanon(power),
    raw: power
  };
}

export function normalizeImportedPower(raw, categories = POWER_CATEGORIES) {
  const text = [raw.name, raw.overview, raw.description, ...(raw.tags || [])].join(" ");
  const category = inferCategory(text);
  const categoryMeta = getCategoryById(category, categories);
  const popularity = Number.isFinite(raw.preferenceRatio) ? raw.preferenceRatio : 0.5;
  const consCount = Array.isArray(raw.cons) ? raw.cons.length : 0;
  const stats = inferStatsForImported({ category, popularity, consCount });
  const tier = inferTierForImported({ popularity, totalComparisons: raw.totalComparisons || 0 });
  const role = inferRoleForImported(category);
  const description = raw.description?.trim() || `The ability to ${raw.overview || "do something extraordinary"}.`;

  return {
    id: `imported:${raw.sourceId}`,
    source: "imported",
    name: raw.name,
    category,
    categoryId: category,
    categoryName: categoryMeta?.name ?? category,
    categoryAccent: categoryMeta?.accent ?? "#34d2ff",
    tier,
    role,
    description,
    summary: buildSummary(raw.overview ? `The ability to ${raw.overview}` : description),
    strengths: Array.isArray(raw.pros) ? [...raw.pros] : [],
    weaknesses: Array.isArray(raw.cons) ? [...raw.cons] : [],
    counters: [],
    tags: Array.isArray(raw.tags) ? [...raw.tags] : [],
    stats,
    score: calculatePowerScore({ stats }),
    popularity,
    raw
  };
}

export function buildCanonLibrary(rawCanon = BASE_SUPERPOWERS, categories = POWER_CATEGORIES) {
  return rawCanon.map((power) => normalizeCanonPower(power, categories));
}

export function buildImportedLibrary(rawImported = [], categories = POWER_CATEGORIES) {
  if (!Array.isArray(rawImported)) return [];
  return rawImported
    .filter((entry) => entry && entry.name)
    .map((entry) => normalizeImportedPower(entry, categories));
}

export function mergeLibraries(...libraries) {
  return libraries.flat().filter(Boolean);
}

// ---------------------------------------------------------------------------
// Filtering + sorting
// ---------------------------------------------------------------------------

export const LIBRARY_SORTS = [
  { id: "slotFit",  label: "Recommended" },
  { id: "balanced", label: "Best Balance" },
  { id: "popular",  label: "Most Popular" },
  { id: "risk",     label: "Lowest Risk" },
  { id: "riskHigh", label: "Highest Risk" },
  { id: "offense",  label: "Offense High" },
  { id: "defense",  label: "Defense High" },
  { id: "mobility", label: "Mobility High" },
  { id: "utility",  label: "Utility High" },
  { id: "control",  label: "Control High" },
  { id: "name",     label: "A–Z" }
];

function getTierWeight(tier) {
  if (tier === "legendary") return 3;
  if (tier === "advanced") return 2;
  return 1;
}

export function calculateSlotFitScore(power, activeSlot = "primary") {
  const stats = power.stats;
  const tierWeight = getTierWeight(power.tier);
  const storyCategoryBonus = ["cosmic", "mystic", "biological", "tech"].includes(power.category) ? 3 : 0;

  if (activeSlot === "origin") {
    return power.popularity * 10 + stats.utility + stats.control + tierWeight + storyCategoryBonus;
  }
  if (activeSlot === "utility") {
    return stats.utility * 1.5 + stats.mobility * 1.2 + stats.defense * 0.5 - stats.risk * 0.35 + power.score * 0.2;
  }
  if (activeSlot === "secondary") {
    return power.score * 0.65 + stats.utility + stats.control * 0.7 + stats.mobility * 0.4 - stats.risk * 0.25;
  }

  return stats.offense * 1.3 + stats.control + stats.utility * 0.7 + power.score * 0.25 - stats.risk * 0.2;
}

const BROAD_SCOPE_PATTERNS = [
  /\b(all|any|every|universal|infinite|reality|timeline|temporal|time|dimension|space|cosmic|quantum)\b/i,
  /\b(force|gravity|probability|matter|energy|power|magic|spell|system|technology)\b/i,
  /\b(manipulat|control|create|alter|rewrite|absorb|adapt|transform|summon|generate)\w*\b/i
];

const FOCUSED_SCOPE_PATTERNS = [
  /\b(sword|punch|jump|leap|run|flight|invisible|fire|ice|electric|heal|armor|shield)\w*\b/i,
  /\b(self|single|localized|visual|aerial|muscular|tissue)\b/i
];

export function getPowerScope(power) {
  const stats = power.stats;
  const text = getPowerSearchText(power);
  const highStatCount = Object.values(stats).filter((value) => value >= 8).length;
  const broadSignals = BROAD_SCOPE_PATTERNS.filter((pattern) => pattern.test(text)).length;
  const focusedSignals = FOCUSED_SCOPE_PATTERNS.filter((pattern) => pattern.test(text)).length;
  const categoryWeight = ["cosmic", "mystic", "tech"].includes(power.category) ? 1 : 0;
  const tierWeight = power.tier === "legendary" ? 2 : power.tier === "advanced" ? 1 : 0;
  const score = highStatCount + broadSignals * 2 + categoryWeight + tierWeight - focusedSignals;

  if (score >= 7) {
    return {
      id: "expansive",
      label: "Expansive",
      score,
      guidance: "Rules-level power. Needs a hard cost, range limit, cooldown, or story constraint before it can carry the hero."
    };
  }

  if (score >= 4) {
    return {
      id: "versatile",
      label: "Versatile",
      score,
      guidance: "Flexible power. Pair it with focused secondary powers so the hero has a readable specialty."
    };
  }

  return {
    id: "focused",
    label: "Focused",
    score,
    guidance: "Narrow power. Safe as a signature if the supporting kit covers movement, defense, or utility gaps."
  };
}

export function getRecommendedSlot(power) {
  const stats = power.stats;
  let slotId = "secondary";

  if (stats.utility >= 8 && stats.mobility >= 7 && stats.offense <= 5) {
    slotId = "utility";
  } else if (stats.offense >= 8 || stats.control >= 9 || (stats.utility >= 9 && stats.control >= 8)) {
    slotId = "primary";
  }

  const scores = ["primary", "secondary", "utility"]
    .map((slotId) => [slotId, calculateSlotFitScore(power, slotId)])
    .sort((left, right) => right[1] - left[1]);
  const label = {
    primary: "Primary",
    secondary: "Secondary",
    utility: "Utility"
  }[slotId];
  const reason = {
    primary: "signature impact",
    secondary: "combo support",
    utility: "practical field use"
  }[slotId];

  return {
    slotId,
    label,
    reason,
    score: Math.round(scores.find(([scoreSlot]) => scoreSlot === slotId)?.[1] ?? scores[0][1])
  };
}

const SORT_FUNCTIONS = {
  balanced: (a, b) => b.score - a.score || a.name.localeCompare(b.name),
  popular:  (a, b) => b.popularity - a.popularity || b.score - a.score || a.name.localeCompare(b.name),
  risk:     (a, b) => a.stats.risk - b.stats.risk || b.score - a.score || a.name.localeCompare(b.name),
  riskHigh: (a, b) => b.stats.risk - a.stats.risk || b.score - a.score || a.name.localeCompare(b.name),
  offense:  (a, b) => b.stats.offense - a.stats.offense || b.score - a.score || a.name.localeCompare(b.name),
  defense:  (a, b) => b.stats.defense - a.stats.defense || b.score - a.score || a.name.localeCompare(b.name),
  mobility: (a, b) => b.stats.mobility - a.stats.mobility || b.score - a.score || a.name.localeCompare(b.name),
  utility:  (a, b) => b.stats.utility - a.stats.utility || b.score - a.score || a.name.localeCompare(b.name),
  control:  (a, b) => b.stats.control - a.stats.control || b.score - a.score || a.name.localeCompare(b.name),
  name:     (a, b) => a.name.localeCompare(b.name)
};

function getLibrarySorter(sortBy, activeSlot, originCategoryIds = [], prioritizeOriginFit = false) {
  const originSet = new Set(originCategoryIds);
  const originFitScore = (power) => prioritizeOriginFit && originSet.has(power.category) ? 1000 : 0;

  if (sortBy === "slotFit") {
    return (
      (a, b) =>
        originFitScore(b) - originFitScore(a) ||
        calculateSlotFitScore(b, activeSlot) - calculateSlotFitScore(a, activeSlot) ||
        b.score - a.score ||
        a.name.localeCompare(b.name)
    );
  }
  const baseSorter = SORT_FUNCTIONS[sortBy] ?? SORT_FUNCTIONS.balanced;
  return (a, b) => originFitScore(b) - originFitScore(a) || baseSorter(a, b);
}

export const LIBRARY_PREVIEW_LIMIT = 60;
export const LIBRARY_PAGE_SIZES = [24, 60, 120];

/**
 * Single, unified filter for the whole library. Supports every facet the UI
 * needs (search, category, tier, source, sort, pagination).
 */
export function filterLibrary({
  powers,
  query = "",
  category = "all",
  subcategory = "all",
  tier = "all",
  source = "all",
  slotFit = "all",
  originCategoryIds = [],
  prioritizeOriginFit = false,
  statFilters = {},
  sortBy = "balanced",
  activeSlot = "primary",
  selectedPowerIds = null,
  limit = LIBRARY_PREVIEW_LIMIT,
  page = 1
} = {}) {
  const normalizedQuery = query.trim().toLowerCase();
  const selectedSet = selectedPowerIds?.size > 0
    ? selectedPowerIds
    : Array.isArray(selectedPowerIds) && selectedPowerIds.length > 0
      ? new Set(selectedPowerIds)
      : null;

  const matches = (powers || []).filter((power) => {
    if (selectedSet) return selectedSet.has(power.id);
    if (category !== "all" && power.category !== category) return false;
    if (!matchesSubcategory(power, subcategory)) return false;
    if (tier !== "all" && power.tier !== tier) return false;
    if (source !== "all" && power.source !== source) return false;
    if (slotFit !== "all" && getRecommendedSlot(power).slotId !== slotFit) return false;
    if (statFilters.offense && power.stats.offense < statFilters.offense) return false;
    if (statFilters.defense && power.stats.defense < statFilters.defense) return false;
    if (statFilters.mobility && power.stats.mobility < statFilters.mobility) return false;
    if (statFilters.utility && power.stats.utility < statFilters.utility) return false;
    if (statFilters.control && power.stats.control < statFilters.control) return false;
    if (statFilters.risk && power.stats.risk > statFilters.risk) return false;

    if (normalizedQuery.length === 0) return true;

    const haystack = getPowerSearchText(power).toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const sorter = getLibrarySorter(sortBy, activeSlot, originCategoryIds, prioritizeOriginFit);
  const sorted = [...matches].sort(sorter);
  const pageSize = Math.max(1, Number(limit) || LIBRARY_PREVIEW_LIMIT);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    totalMatches: sorted.length,
    totalPages,
    page: currentPage,
    visible: sorted.slice(start, start + pageSize),
    limit: pageSize,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };
}

export function getLibrarySubcategoryCounts({
  powers,
  category = "all",
  query = "",
  tier = "all",
  source = "all",
  slotFit = "all",
  statFilters = {}
} = {}) {
  if (category === "all") return [];
  const subcategories = POWER_SUBCATEGORIES[category] ?? [];
  if (subcategories.length === 0) return [];

  return subcategories.map((subcategory) => {
    const result = filterLibrary({
      powers,
      query,
      category,
      subcategory: subcategory.id,
      tier,
      source,
      slotFit,
      statFilters,
      limit: 1
    });
    return {
      id: subcategory.id,
      label: subcategory.label,
      count: result.totalMatches
    };
  });
}

/**
 * Per-category counts on the active library. Used by the category filter row
 * so users can see how big each bucket is before they pick one.
 */
export function getLibraryCategoryCounts(powers, categories = POWER_CATEGORIES) {
  const counts = new Map(categories.map((category) => [category.id, 0]));
  (powers || []).forEach((power) => {
    if (counts.has(power.category)) {
      counts.set(power.category, counts.get(power.category) + 1);
    }
  });
  return categories.map((category) => ({
    ...category,
    count: counts.get(category.id) || 0
  }));
}

export function getLibrarySourceCounts(powers) {
  return (powers || []).reduce(
    (totals, power) => {
      totals.total += 1;
      totals[power.source] = (totals[power.source] || 0) + 1;
      return totals;
    },
    { total: 0 }
  );
}
