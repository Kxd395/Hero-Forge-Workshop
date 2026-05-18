const STAT_KEYS = ["offense", "defense", "mobility", "utility", "control", "risk"];

export const HERO_SLOTS = [
  {
    id: "origin",
    label: "Origin Source",
    shortLabel: "Origin",
    description: "The source, event, or condition that created the hero."
  },
  {
    id: "primary",
    label: "Primary Power",
    shortLabel: "Primary",
    description: "The hero's signature ability."
  },
  {
    id: "secondary",
    label: "Secondary Powers",
    shortLabel: "Secondary",
    description: "Supporting powers that round out the build.",
    multiple: true,
    limit: 3
  },
  {
    id: "utility",
    label: "Utility",
    shortLabel: "Utility",
    description: "Movement, investigation, defense, or support."
  }
];

const SLOT_BY_ID = Object.fromEntries(HERO_SLOTS.map((slot) => [slot.id, slot]));

export const ORIGIN_SOURCES = [
  {
    id: "natural-born",
    name: "Natural Born",
    categoryId: "biological",
    preferredCategories: ["biological", "physical", "psychic"],
    summary: "Born with powers through species, ancestry, dormant biology, or inherited traits.",
    storySeed: "Their power is part of who they are before they understand what it means."
  },
  {
    id: "mutation-gene",
    name: "Mutation / Gene",
    categoryId: "biological",
    preferredCategories: ["biological", "psychic", "physical", "mobility"],
    summary: "A gene, mutation, or sudden biological awakening changed what their body can do.",
    storySeed: "Their body becomes the first mystery they have to solve."
  },
  {
    id: "accident",
    name: "Accident",
    categoryId: "energy",
    preferredCategories: ["energy", "elemental", "biological", "physical"],
    summary: "Radiation, chemicals, lightning, a machine failure, or disaster triggered the power.",
    storySeed: "A random disaster left them changed, and someone may be responsible."
  },
  {
    id: "bite-infection",
    name: "Bite / Infection",
    categoryId: "biological",
    preferredCategories: ["biological", "physical", "mobility", "stealth"],
    summary: "A bite, parasite, venom, alien organism, or supernatural infection rewrote them.",
    storySeed: "The thing that changed them may still be alive, spreading, or evolving."
  },
  {
    id: "experiment",
    name: "Experiment",
    categoryId: "tech",
    preferredCategories: ["tech", "biological", "energy", "physical"],
    summary: "Created by a lab, serum, field test, weapon program, or failed procedure.",
    storySeed: "Someone built the conditions that made them powerful, and may still want control."
  },
  {
    id: "artifact-relic",
    name: "Artifact / Relic",
    categoryId: "mystic",
    preferredCategories: ["mystic", "cosmic", "elemental", "tech"],
    summary: "Power flows through a relic, suit, weapon, symbol, or inherited object.",
    storySeed: "The hero must learn whether they wield the artifact or the artifact uses them."
  },
  {
    id: "cosmic-event",
    name: "Cosmic Event",
    categoryId: "cosmic",
    preferredCategories: ["cosmic", "energy", "mobility", "psychic"],
    summary: "A space, time, dimensional, radiation, or universal-force event rewrote their life.",
    storySeed: "The event was not random; it may be part of a larger pattern."
  },
  {
    id: "magic-pact",
    name: "Magic / Pact",
    categoryId: "mystic",
    preferredCategories: ["mystic", "cosmic", "psychic", "elemental"],
    summary: "Power comes from a vow, bargain, curse, order, ritual, or patron.",
    storySeed: "Every victory tests the promise that gave them power."
  },
  {
    id: "training",
    name: "Training",
    categoryId: "physical",
    preferredCategories: ["physical", "stealth", "mobility", "tech"],
    summary: "Discipline, combat mastery, study, or extreme conditioning created the hero.",
    storySeed: "Their limits are earned, maintained, and vulnerable to doubt."
  },
  {
    id: "tech-upgrade",
    name: "Tech Upgrade",
    categoryId: "tech",
    preferredCategories: ["tech", "energy", "mobility", "physical"],
    summary: "Cybernetics, armor, implants, AI bonding, or engineered systems enable the hero.",
    storySeed: "Upgrades make them stronger while raising questions of identity and dependence."
  },
  {
    id: "alien-species",
    name: "Alien / Species",
    categoryId: "cosmic",
    preferredCategories: ["cosmic", "biological", "physical", "energy"],
    summary: "Alien heritage, non-human species, or otherworldly biology explains the powers.",
    storySeed: "Their people, planet, or bloodline may bring duties they did not choose."
  },
  {
    id: "dimensional-contact",
    name: "Dimensional Contact",
    categoryId: "cosmic",
    preferredCategories: ["cosmic", "mobility", "mystic", "psychic"],
    summary: "Alien, extradimensional, or otherworldly contact opened access to impossible rules.",
    storySeed: "The source world may come looking for what it left behind."
  }
];

export function createOriginSource(originId) {
  const origin = ORIGIN_SOURCES.find((entry) => entry.id === originId)
    ?? ORIGIN_SOURCES.find((entry) => entry.id === "mutation-gene")
    ?? ORIGIN_SOURCES[0];
  return {
    id: `origin:${origin.id}`,
    selectionId: `origin:${origin.id}`,
    source: "origin",
    name: origin.name,
    category: "Origin Source",
    categoryId: origin.categoryId,
    categoryName: "Origin Source",
    preferredCategories: [...(origin.preferredCategories ?? [origin.categoryId])],
    summary: origin.summary,
    storySeed: origin.storySeed,
    strengths: [origin.storySeed],
    weaknesses: [],
    tags: ["origin", origin.id, origin.categoryId, ...(origin.preferredCategories ?? [])],
    stats: null
  };
}

const ROLE_BY_SIGNAL = [
  { signal: "psychic", role: "Mindlock Strategist" },
  { signal: "mind", role: "Mindlock Strategist" },
  { signal: "fire", role: "Elemental Striker" },
  { signal: "energy", role: "Energy Striker" },
  { signal: "weapon", role: "Arsenal Operative" },
  { signal: "dimension", role: "Spatial Operative" },
  { signal: "time", role: "Temporal Controller" },
  { signal: "healing", role: "Recovery Specialist" },
  { signal: "stealth", role: "Infiltration Specialist" },
  { signal: "strength", role: "Frontline Paragon" },
  { signal: "cosmic", role: "Cosmic Controller" },
  { signal: "tech", role: "Systems Operator" },
  { signal: "mystic", role: "Arcane Specialist" }
];

const NAME_WORDS = {
  physical: ["Titan", "Fist", "Bulwark", "Breaker"],
  elemental: ["Cinder", "Storm", "Frost", "Tide"],
  psychic: ["Mind", "Echo", "Signal", "Veil"],
  energy: ["Volt", "Pulse", "Radiant", "Arc"],
  mobility: ["Runner", "Vector", "Drift", "Wing"],
  biological: ["Bloom", "Pulse", "Vigor", "Graft"],
  tech: ["Circuit", "Frame", "Kernel", "Forge"],
  mystic: ["Rune", "Warden", "Hex", "Saint"],
  cosmic: ["Void", "Atlas", "Nova", "Orbit"],
  stealth: ["Shade", "Ghost", "Whisper", "Night"]
};

export function createEmptyHeroBuild() {
  return {
    alias: "",
    civilianName: "",
    homeBase: "",
    motivation: "",
    storyConstraint: "",
    origin: null,
    primary: null,
    secondary: [],
    utility: null,
    limitation: null
  };
}

export function toCanonSelection(power, categoryName) {
  return {
    selectionId: `canon:${power.id}`,
    source: "canon",
    name: power.name,
    category: categoryName,
    summary: power.description,
    strengths: power.strengths,
    weaknesses: power.weaknesses,
    tags: [power.category, power.tier, power.role].filter(Boolean),
    stats: power.stats
  };
}

export function toImportedSelection(power) {
  return {
    selectionId: `imported:${power.sourceId}`,
    source: "imported",
    name: power.name,
    category: "Imported",
    summary: `The ability to ${power.overview}`,
    strengths: power.pros,
    weaknesses: power.cons,
    tags: power.tags,
    preferenceRatio: power.preferenceRatio
  };
}

export function toSelection(power) {
  return {
    selectionId: power.id,
    id: power.id,
    source: power.source,
    name: power.name,
    category: power.categoryName ?? power.category,
    categoryId: power.category,
    summary: power.summary ?? power.description,
    strengths: power.strengths ?? [],
    weaknesses: power.weaknesses ?? [],
    tags: power.tags ?? [],
    stats: power.stats,
    score: power.score,
    popularity: power.popularity
  };
}

function getPowerId(power) {
  return power?.id ?? power?.selectionId;
}

function truncateConstraint(text, maxLength = 96) {
  const trimmed = String(text || "").trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

function cloneBuild(build) {
  return {
    alias: build.alias ?? "",
    civilianName: build.civilianName ?? "",
    homeBase: build.homeBase ?? "",
    motivation: build.motivation ?? "",
    storyConstraint: build.storyConstraint ?? "",
    origin: build.origin ?? null,
    primary: build.primary ?? null,
    secondary: [...(build.secondary ?? [])],
    utility: build.utility ?? null,
    limitation: build.limitation ?? null
  };
}

export function getHeroBuildPowers(build) {
  return [
    build.primary,
    ...(build.secondary ?? []),
    build.utility
  ].filter(Boolean);
}

export function findPowerSlot(build, powerId) {
  if (!powerId) return null;
  if (getPowerId(build.primary) === powerId) return "primary";
  if ((build.secondary ?? []).some((power) => getPowerId(power) === powerId)) return "secondary";
  if (getPowerId(build.utility) === powerId) return "utility";
  if (getPowerId(build.limitation) === powerId) return "limitation";
  return null;
}

export function removePowerFromBuild(build, powerId) {
  const next = cloneBuild(build);
  if (getPowerId(next.primary) === powerId) next.primary = null;
  next.secondary = next.secondary.filter((power) => getPowerId(power) !== powerId);
  if (getPowerId(next.utility) === powerId) next.utility = null;
  if (getPowerId(next.limitation) === powerId) next.limitation = null;
  return next;
}

export function assignPowerToSlot(build, power, slotId) {
  if (slotId === "limitation") return cloneBuild(build);
  const slot = SLOT_BY_ID[slotId] ?? SLOT_BY_ID.primary;
  if (slot.id === "origin") {
    return {
      ...cloneBuild(build),
      origin: power?.source === "origin" ? power : createOriginSource(power?.id ?? "mutation-gene")
    };
  }
  const normalizedPower = power.id ? power : toSelection(power);
  const powerId = getPowerId(normalizedPower);
  const next = removePowerFromBuild(build, powerId);

  if (slot.multiple) {
    next[slot.id] = [normalizedPower, ...(next[slot.id] ?? [])].slice(0, slot.limit ?? 3);
  } else {
    next[slot.id] = normalizedPower;
  }

  return next;
}

export function clearHeroSlot(build, slotId) {
  const next = cloneBuild(build);
  if (SLOT_BY_ID[slotId]?.multiple) {
    next[slotId] = [];
  } else if (slotId in next) {
    next[slotId] = null;
  }
  return next;
}

function normalizeOriginSelection(origin) {
  if (!origin) return null;
  const originKey = String(origin.selectionId || origin.id || "").replace(/^origin:/, "");
  const knownOrigin = ORIGIN_SOURCES.find((entry) => entry.id === originKey);
  if (knownOrigin) return createOriginSource(knownOrigin.id);
  return origin?.source === "origin" ? origin : null;
}

function rehydratePowerSelection(power, libraryById, missingPowerIds) {
  if (!power) return null;
  const powerId = getPowerId(power);
  const currentPower = libraryById.get(powerId);
  if (currentPower) return toSelection(currentPower);
  if (powerId) missingPowerIds.push(powerId);
  return power?.name ? power : null;
}

export function rehydrateHeroBuild(savedBuild = createEmptyHeroBuild(), library = []) {
  const base = cloneBuild(savedBuild);
  const libraryById = new Map(library.map((power) => [power.id, power]));
  const missingPowerIds = [];

  const heroBuild = {
    ...base,
    origin: normalizeOriginSelection(base.origin),
    primary: rehydratePowerSelection(base.primary, libraryById, missingPowerIds),
    secondary: (base.secondary ?? [])
      .map((power) => rehydratePowerSelection(power, libraryById, missingPowerIds))
      .filter(Boolean)
      .slice(0, SLOT_BY_ID.secondary.limit ?? 3),
    utility: rehydratePowerSelection(base.utility, libraryById, missingPowerIds),
    limitation: null
  };

  return {
    heroBuild,
    missingPowerIds: [...new Set(missingPowerIds)]
  };
}

function unique(items, limit) {
  return [...new Set(items.filter(Boolean))].slice(0, limit);
}

function getSignals(selectedPowers) {
  return selectedPowers
    .flatMap((power) => [power.name, power.category, power.categoryId, ...(power.tags || [])])
    .join(" ")
    .toLowerCase();
}

function getPowerCategoryId(power) {
  return power ? power.categoryId || power.category || "physical" : null;
}

function getPowerSignalText(power) {
  return [
    power?.name,
    power?.summary,
    power?.category,
    power?.categoryId,
    ...(power?.tags ?? [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isExpansivePower(power) {
  if (!power) return false;
  const text = getPowerSignalText(power);
  return (
    /\b(time|temporal|reality|cosmic|dimension|dimensional|probability|force|gravity|space)\b/.test(text) ||
    power.stats?.risk >= 8 ||
    (power.stats?.control >= 8 && power.stats?.utility >= 8)
  );
}

function hasCategory(build, categoryId) {
  return getHeroBuildPowers(build).some((power) => getPowerCategoryId(power) === categoryId);
}

function getPrimaryCategory(build, selectedPowers) {
  return getPowerCategoryId(build.primary) || getPowerCategoryId(build.origin) || getPowerCategoryId(selectedPowers[0]) || "physical";
}

function buildHeroNameFromSlots(build, selectedPowers) {
  if (selectedPowers.length === 0) return "No hero drafted";

  const primaryCategory = getPrimaryCategory(build, selectedPowers);
  const secondaryCategory = getPowerCategoryId(build.utility) || getPowerCategoryId(build.secondary?.[0]) || getPowerCategoryId(build.origin) || primaryCategory;
  const firstPool = NAME_WORDS[primaryCategory] ?? NAME_WORDS.physical;
  const secondPool = NAME_WORDS[secondaryCategory] ?? NAME_WORDS.physical;

  if (primaryCategory === secondaryCategory) {
    return `${firstPool[0]} ${firstPool[1]}`;
  }

  return `${firstPool[0]}${secondPool[1]}`;
}

function buildHeroNameCandidates(build, selectedPowers) {
  if (selectedPowers.length === 0) return [];

  const primaryCategory = getPrimaryCategory(build, selectedPowers);
  const secondaryCategory = getPowerCategoryId(build.utility) || getPowerCategoryId(build.secondary?.[0]) || getPowerCategoryId(build.origin) || primaryCategory;
  const originCategory = getPowerCategoryId(build.origin) || primaryCategory;
  const primaryPool = NAME_WORDS[primaryCategory] ?? NAME_WORDS.physical;
  const secondaryPool = NAME_WORDS[secondaryCategory] ?? NAME_WORDS.physical;
  const originPool = NAME_WORDS[originCategory] ?? NAME_WORDS.physical;

  return unique([
    buildHeroNameFromSlots(build, selectedPowers),
    `${primaryPool[1]} ${secondaryPool[0]}`,
    `${primaryPool[2]} ${originPool[3]}`,
    `${secondaryPool[0]}${primaryPool[3]}`,
    `The ${primaryPool[2]}`
  ], 5);
}

function buildNameRationale(build, selectedPowers) {
  if (selectedPowers.length === 0) {
    return "Pick an origin and primary power before naming the hero.";
  }

  const primaryCategory = getPrimaryCategory(build, selectedPowers);
  const secondaryCategory = getPowerCategoryId(build.utility) || getPowerCategoryId(build.secondary?.[0]) || getPowerCategoryId(build.origin) || primaryCategory;
  const primaryName = build.primary?.name || selectedPowers[0]?.name || "the first selected power";
  const supportName = build.utility?.name || build.secondary?.[0]?.name || build.origin?.name || primaryName;

  if (primaryCategory === secondaryCategory) {
    return `Name leans into ${primaryName} because the build is concentrated in ${primaryCategory}.`;
  }

  return `Name blends ${primaryName} with ${supportName} so the alias reflects both signature and support powers.`;
}

function classifyHero(selectedPowers) {
  const signals = getSignals(selectedPowers);
  const matchedRole = ROLE_BY_SIGNAL.find((item) => signals.includes(item.signal));

  if (matchedRole) return matchedRole.role;
  if (selectedPowers.length >= 4) return "Hybrid Paragon";
  return "Field Specialist";
}

export function getHeroBuildChecklist(build = createEmptyHeroBuild()) {
  const secondaryCount = build.secondary?.length ?? 0;
  return [
    {
      id: "origin",
      slotId: "origin",
      label: "Origin",
      complete: Boolean(build.origin),
      detail: build.origin ? `Powers come from ${build.origin.name}.` : "Choose how the hero got their powers."
    },
    {
      id: "primary",
      slotId: "primary",
      label: "Primary",
      complete: Boolean(build.primary),
      detail: build.primary ? `Signature is ${build.primary.name}.` : "Choose one signature primary power."
    },
    {
      id: "support",
      slotId: "secondary",
      label: "Support",
      complete: secondaryCount > 0 || Boolean(build.utility),
      detail: secondaryCount > 0
        ? `${secondaryCount}/3 secondary powers selected.`
        : "Add at least one support power: secondary or utility."
    },
    {
      id: "utility",
      slotId: "utility",
      label: "Utility",
      complete: Boolean(build.utility),
      detail: build.utility ? `${build.utility.name} covers field use.` : "Add a utility power for movement, rescue, scouting, or defense."
    }
  ];
}

function getMissingBuildSteps(build) {
  return getHeroBuildChecklist(build)
    .filter((step) => !step.complete)
    .map((step) => step.detail);
}

function getDerivedLimitations(build) {
  return unique(
    getHeroBuildPowers(build)
      .flatMap((power) => power.weaknesses || [])
      .map((item) => truncateConstraint(item, 120)),
    5
  );
}

function clampStat(value) {
  return Math.max(1, Math.min(10, Math.round(value)));
}

function aggregateStats(selectedPowers, build = createEmptyHeroBuild()) {
  const weighted = [];
  if (build.origin) weighted.push({ power: build.origin, weight: 0.8 });
  if (build.primary) weighted.push({ power: build.primary, weight: 1.45 });
  (build.secondary ?? []).forEach((power) => weighted.push({ power, weight: 1 }));
  if (build.utility) weighted.push({ power: build.utility, weight: 1.1 });
  if (build.limitation) weighted.push({ power: build.limitation, weight: 0.45 });

  const statPowers = weighted.filter(({ power }) => power.stats);
  if (statPowers.length === 0) {
    return STAT_KEYS.reduce((stats, key) => ({ ...stats, [key]: 5 }), {});
  }

  const totalWeight = statPowers.reduce((sum, item) => sum + item.weight, 0);
  return STAT_KEYS.reduce((stats, key) => {
    const total = statPowers.reduce((sum, item) => sum + item.power.stats[key] * item.weight, 0);
    return { ...stats, [key]: clampStat(total / totalWeight) };
  }, {});
}

export function calculateSynergy(build) {
  const powers = getHeroBuildPowers(build);
  if (powers.length === 0) {
    return {
      score: 0,
      notes: ["Select powers to calculate synergy."],
      conflicts: []
    };
  }

  const categories = new Set(powers.map((power) => getPowerCategoryId(power)).filter(Boolean));
  const tags = new Set(powers.flatMap((power) => power.tags ?? []).map((tag) => String(tag).toLowerCase()));
  const tagText = [...tags].join(" ");
  const derivedLimitations = getDerivedLimitations(build);
  const notes = [];
  const conflicts = [];
  let score = 50;

  if (build.primary && build.utility) {
    score += 12;
    notes.push("Primary and utility slots create a usable field kit.");
  }
  if ((build.secondary ?? []).length >= 2) {
    score += 8;
    notes.push("Secondary powers add tactical flexibility.");
  }
  if (derivedLimitations.length > 0) {
    score += 10;
    notes.push("Selected power drawbacks surface natural story limits.");
  }
  if (build.storyConstraint?.trim()) {
    score += 6;
    notes.push("A custom story constraint gives the power set clearer rules.");
  }
  if (categories.has("mobility") && (categories.has("elemental") || categories.has("energy"))) {
    score += 8;
    notes.push("Mobility supports ranged and area-control powers.");
  }
  if (categories.has("psychic") && categories.has("stealth")) {
    score += 8;
    notes.push("Psychic and stealth powers form a strong infiltration profile.");
  }
  if (categories.has("physical") && !categories.has("biological") && !categories.has("mobility")) {
    conflicts.push("Physical power without recovery or mobility can become one-dimensional.");
    score -= 8;
  }
  if (/\b(time|temporal|reality)\b/.test(tagText) && categories.has("cosmic") && derivedLimitations.length === 0 && !build.storyConstraint?.trim()) {
    conflicts.push("Cosmic/time signals need a strong limitation to avoid overpowering the build.");
    score -= 12;
  }
  if (powers.length < 3) {
    conflicts.push("Add at least three powers to make the concept feel complete.");
    score -= 10;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    notes: notes.length > 0 ? notes : ["Power mix is readable but still needs stronger slot definition."],
    conflicts
  };
}

function buildRecommendations(build, draft) {
  const recommendations = [];
  const secondaryCount = build.secondary?.length ?? 0;
  const hasRule = Boolean(build.storyConstraint?.trim() || getDerivedLimitations(build).length > 0);

  if (!build.origin) {
    recommendations.push({
      id: "origin",
      priority: "critical",
      slotId: "origin",
      label: "Choose how they got powers",
      detail: "The origin explains whether the powers came from genes, an accident, training, tech, magic, or something stranger."
    });
  }

  if (!build.primary) {
    recommendations.push({
      id: "primary",
      priority: "critical",
      slotId: "primary",
      label: "Pick the signature power",
      detail: "The primary slot should be the one ability readers remember first."
    });
  }

  if (isExpansivePower(build.primary) && !hasRule) {
    recommendations.push({
      id: "expansive-primary-limit",
      priority: "critical",
      slotId: "all",
      label: "Constrain the signature",
      detail: `${build.primary.name} is broad enough to solve too many problems. Use its listed drawbacks or write a custom story constraint.`
    });
  }

  if (secondaryCount === 0) {
    recommendations.push({
      id: "secondary",
      priority: "important",
      slotId: "secondary",
      label: "Add a support power",
      detail: "A secondary power should set up the primary, cover its blind spot, or create a readable combo."
    });
  }

  if (!build.utility) {
    recommendations.push({
      id: "utility",
      priority: "important",
      slotId: "utility",
      label: "Add field utility",
      detail: "Utility gives the hero movement, rescue, scouting, defense, or investigation outside direct combat."
    });
  }

  if (build.primary && hasCategory(build, "physical") && !hasCategory(build, "mobility") && !hasCategory(build, "biological")) {
    recommendations.push({
      id: "physical-support",
      priority: "important",
      slotId: "utility",
      label: "Give the physical kit reach",
      detail: "Physical builds need mobility, recovery, or protection so they do not become a single punch line."
    });
  }

  if (draft.stats.risk >= 8 && !hasRule) {
    recommendations.push({
      id: "risk-limit",
      priority: "important",
      slotId: "all",
      label: "Lower the risk profile",
      detail: "The current stats are dangerous enough that the hero needs a clear counterplay rule in the story constraint."
    });
  }

  if (!build.motivation?.trim()) {
    recommendations.push({
      id: "motivation",
      priority: "story",
      slotId: "all",
      label: "Define motivation",
      detail: "A motivation turns the power list into a character with a reason to act."
    });
  }

  if (!build.homeBase?.trim()) {
    recommendations.push({
      id: "home-base",
      priority: "story",
      slotId: "all",
      label: "Set a home base",
      detail: "A base gives the hero a social world, recurring problems, and stakes."
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "ready-review",
      priority: "complete",
      slotId: "all",
      label: "Review and export",
      detail: "The loadout has identity, field use, balance, and story pressure. Review the full sheet before saving."
    });
  }

  return recommendations.slice(0, 6);
}

function buildCharacterSheet(build, draft) {
  const origin = build.origin?.name || "Unassigned origin";
  const primary = build.primary?.name || "Unassigned primary power";
  const utility = build.utility?.name || "Unassigned utility";
  const derivedLimitations = getDerivedLimitations(build);
  const limitation = build.storyConstraint?.trim() || derivedLimitations[0] || "No surfaced limitation yet";
  const secondary = (build.secondary ?? []).map((power) => power.name);
  const motivation = build.motivation?.trim() || "Undefined motivation";
  const storyConstraint = build.storyConstraint?.trim() || limitation;

  return {
    alias: draft.heroName,
    civilianName: build.civilianName?.trim() || `${draft.heroName.split(/\s+/)[0]} Vale`,
    homeBase: build.homeBase?.trim() || "Unassigned home base",
    motivation,
    storyConstraint,
    origin,
    archetype: draft.classification,
    powerLoadout: {
      primary,
      secondary,
      utility,
      limitation
    },
    threatLevel: draft.stats.risk >= 8 ? "Critical" : draft.stats.offense >= 8 ? "High" : draft.stats.utility >= 8 ? "Specialist" : "Developing",
    storyHook: `${draft.heroName} is a ${draft.classification.toLowerCase()} shaped by ${origin}, driven by ${motivation.toLowerCase()}, built around ${primary}, and constrained by ${storyConstraint}.`
  };
}

function buildPowerInteractions(build) {
  const interactions = [];
  const secondary = build.secondary ?? [];
  const firstSecondary = secondary[0];
  const limitation = build.storyConstraint?.trim() || getDerivedLimitations(build)[0];

  if (build.origin && build.primary) {
    interactions.push({
      id: "origin-primary",
      label: "Origin drives signature",
      tone: "story",
      text: `${build.origin.name} explains why ${build.primary.name} became the power the hero is known for.`
    });
  }

  if (build.primary && firstSecondary) {
    interactions.push({
      id: "primary-secondary",
      label: "Primary plus support",
      tone: "combo",
      text: `${firstSecondary.name} should either set up ${build.primary.name}, cover its blind spot, or make it usable under pressure.`
    });
  } else if (build.primary) {
    interactions.push({
      id: "primary-needs-support",
      label: "Support gap",
      tone: "warning",
      text: `${build.primary.name} is readable as a signature, but it still needs a secondary or utility power to avoid feeling isolated.`
    });
  }

  if (build.primary && build.utility) {
    interactions.push({
      id: "primary-utility",
      label: "Field pattern",
      tone: "combo",
      text: `${build.utility.name} is how the hero gets into position, rescues people, or survives long enough to use ${build.primary.name}.`
    });
  }

  if (build.primary && limitation) {
    interactions.push({
      id: "primary-limitation",
      label: "Story pressure",
      tone: "constraint",
      text: `${limitation} gives opponents and plot complications a fair way to challenge ${build.primary.name}.`
    });
  }

  if (interactions.length === 0) {
    interactions.push({
      id: "empty",
      label: "No interaction yet",
      tone: "warning",
      text: "Assign at least a primary and one support, utility, or origin to define how the build works."
    });
  }

  return interactions;
}

function buildQualityMetrics(build, draft) {
  if (draft.selectedCount === 0) {
    const metrics = [
      {
        id: "identity",
        label: "Identity",
        score: 0,
        note: "Add motivation, origin, civilian name, or base."
      },
      {
        id: "field",
        label: "Field Use",
        score: 0,
        note: "Add utility for movement, rescue, scouting, or defense."
      },
      {
        id: "balance",
        label: "Balance",
        score: 0,
        note: "Select powers to surface drawbacks and pressure points."
      },
      {
        id: "cohesion",
        label: "Cohesion",
        score: 0,
        note: "Add slots that explain how the powers interact."
      }
    ];

    return {
      overall: 0,
      metrics
    };
  }

  const secondaryCount = build.secondary?.length ?? 0;
  const hasLimits = getDerivedLimitations(build).length > 0 || build.storyConstraint?.trim();
  const hasIdentity = Boolean(draft.heroName && draft.heroName !== "No hero drafted");
  const identityScore =
    (hasIdentity ? 30 : 0) +
    (build.origin ? 20 : 0) +
    (build.civilianName?.trim() ? 15 : 0) +
    (build.homeBase?.trim() ? 15 : 0) +
    (build.motivation?.trim() ? 20 : 0);
  const fieldScore =
    (build.primary ? 30 : 0) +
    (build.utility ? 25 : 0) +
    Math.min(25, secondaryCount * 9) +
    Math.min(20, (draft.stats.mobility + draft.stats.defense) * 1.2);
  const balanceScore =
    (getDerivedLimitations(build).length > 0 ? 32 : 0) +
    (build.storyConstraint?.trim() ? 28 : 0) +
    Math.max(0, 25 - draft.stats.risk * 2) +
    (draft.synergy.conflicts.length === 0 ? 15 : 0);
  const cohesionScore =
    Math.min(70, draft.synergy.score) +
    Math.min(20, draft.interactions.filter((interaction) => interaction.tone === "combo").length * 10) +
    (draft.interactions.some((interaction) => interaction.tone === "story") ? 10 : 0);

  const metrics = [
    {
      id: "identity",
      label: "Identity",
      score: Math.min(100, Math.round(identityScore)),
      note: build.motivation?.trim() ? "Motivation and profile are anchored." : "Add motivation, origin, civilian name, or base."
    },
    {
      id: "field",
      label: "Field Use",
      score: Math.min(100, Math.round(fieldScore)),
      note: build.utility ? "Utility gives the kit practical use." : "Add utility for movement, rescue, scouting, or defense."
    },
    {
      id: "balance",
      label: "Balance",
      score: Math.min(100, Math.round(balanceScore)),
      note: hasLimits ? "Rules and pressure points are visible." : "Use selected power drawbacks or add a custom constraint."
    },
    {
      id: "cohesion",
      label: "Cohesion",
      score: Math.min(100, Math.round(cohesionScore)),
      note: draft.interactions.length > 1 ? "Slot interactions are connected." : "Add slots that explain how the powers interact."
    }
  ];

  return {
    overall: Math.round(metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length),
    metrics
  };
}

function buildStoryBrief(build, draft) {
  const origin = build.origin?.name || "an undefined origin";
  const primary = build.primary?.name || "an undefined signature power";
  const utility = build.utility?.name || "no field utility yet";
  const limitation = build.storyConstraint?.trim() || getDerivedLimitations(build)[0] || "no clear limitation yet";
  const secondary = (build.secondary ?? []).map((power) => power.name).join(", ") || "no secondary support yet";
  const homeBase = build.homeBase?.trim() || "an unassigned home base";
  const motivation = build.motivation?.trim() || "an undefined motivation";
  const storyConstraint = build.storyConstraint?.trim() || limitation;

  return {
    nameRationale: buildNameRationale(build, getHeroBuildPowers(build)),
    nameCandidates: unique([draft.heroName, ...buildHeroNameCandidates(build, getHeroBuildPowers(build))], 5),
    premise: `${draft.heroName} is built from ${origin}, operates out of ${homeBase}, acts because of ${motivation}, expresses identity through ${primary}, and survives the field through ${utility}.`,
    arc: `Their first story should test whether ${secondary} can support ${primary} without being overwhelmed by ${storyConstraint}.`,
    beats: [
      { label: "Inciting incident", text: `${origin} changes the rules of ${draft.heroName}'s life before the hero understands the cost.` },
      { label: "Public test", text: `${primary} solves the visible crisis, but ${utility} determines who survives the aftermath.` },
      { label: "Pressure point", text: `${storyConstraint} gives the antagonist a clean way to challenge the power set.` }
    ],
    missing: getMissingBuildSteps(build)
  };
}

function buildHeroDraftFromPowers(selectedPowers) {
  const build = createEmptyHeroBuild();
  const [primary, ...rest] = selectedPowers;
  build.primary = primary ?? null;
  build.secondary = rest.slice(0, 3);
  return buildHeroDraftFromSlots(build);
}

export function buildHeroDraftFromSlots(build) {
  const selectedPowers = getHeroBuildPowers(build);
  const stats = aggregateStats(selectedPowers, build);
  const strengths = unique(selectedPowers.flatMap((power) => power.strengths || []), 6);
  const weaknesses = unique([
    ...selectedPowers.flatMap((power) => power.weaknesses || [])
  ], 6);
  const tags = unique(selectedPowers.flatMap((power) => power.tags || []), 10);
  const importedCount = selectedPowers.filter((power) => power.source === "imported").length;
  const canonCount = selectedPowers.filter((power) => power.source === "canon").length;
  const filledSlots = HERO_SLOTS.filter((slot) => {
    const value = build[slot.id];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  }).length;
  const synergy = calculateSynergy(build);
  const missingSteps = getMissingBuildSteps(build);
  const checklist = getHeroBuildChecklist(build);
  const generatedName = buildHeroNameFromSlots(build, selectedPowers);
  const draftBase = {
    heroName: build.alias?.trim() || generatedName,
    generatedName,
    classification: classifyHero(selectedPowers),
    selectedCount: selectedPowers.length,
    filledSlots,
    canonCount,
    importedCount,
    stats,
    strengths,
    weaknesses,
    tags,
    synergy,
    interactions: buildPowerInteractions(build),
    missingSteps,
    checklist,
    readiness:
      selectedPowers.length === 0
        ? "Assign powers into slots to generate a hero draft."
        : filledSlots < 3
          ? "Fill at least origin, primary, and one support slot."
          : synergy.score >= 70
            ? "Character sheet ready for story work."
            : "Draft needs stronger synergy or a clearer limitation."
  };
  const quality = buildQualityMetrics(build, draftBase);
  const recommendations = buildRecommendations(build, draftBase);
  const draft = {
    ...draftBase,
    quality,
    recommendations
  };
  return {
    ...draft,
    characterSheet: buildCharacterSheet(build, draft),
    storyBrief: buildStoryBrief(build, draft)
  };
}

export function buildHeroDraft(input) {
  if (Array.isArray(input)) return buildHeroDraftFromPowers(input);
  return buildHeroDraftFromSlots(input ?? createEmptyHeroBuild());
}

export function formatHeroSheet(draft) {
  const sheet = draft.characterSheet;
  const secondary = sheet.powerLoadout.secondary.length > 0
    ? sheet.powerLoadout.secondary.join(", ")
    : "None assigned";
  const stats = STAT_KEYS
    .map((key) => `${key[0].toUpperCase()}${key.slice(1)} ${draft.stats[key]}`)
    .join(" / ");
  const strengths = draft.strengths.length > 0 ? draft.strengths.join("; ") : "None surfaced";
  const limits = draft.weaknesses.length > 0 ? draft.weaknesses.join("; ") : "None surfaced";
  const synergyNotes = [
    ...draft.synergy.notes,
    ...draft.synergy.conflicts.map((conflict) => `Conflict: ${conflict}`)
  ].join(" ");
  const missing = draft.storyBrief.missing.length > 0 ? draft.storyBrief.missing.join("; ") : "None";
  const nameOptions = draft.storyBrief.nameCandidates.length > 0 ? draft.storyBrief.nameCandidates.join(", ") : "None";
  const beats = draft.storyBrief.beats.map((beat) => `${beat.label}: ${beat.text}`).join(" ");
  const interactions = draft.interactions.map((interaction) => `${interaction.label}: ${interaction.text}`).join(" ");
  const quality = draft.quality.metrics.map((metric) => `${metric.label} ${metric.score}/100`).join(" / ");

  return [
    `${sheet.alias}`,
    `Civilian Name: ${sheet.civilianName}`,
    `Home Base: ${sheet.homeBase}`,
    `Motivation: ${sheet.motivation}`,
    `Story Constraint: ${sheet.storyConstraint}`,
    `Archetype: ${sheet.archetype}`,
    `Threat Level: ${sheet.threatLevel}`,
    `Readiness: ${draft.readiness}`,
    "",
    "Power Loadout",
    `Origin: ${sheet.origin}`,
    `Primary: ${sheet.powerLoadout.primary}`,
    `Secondary: ${secondary}`,
    `Utility: ${sheet.powerLoadout.utility}`,
    `Limitation: ${sheet.powerLoadout.limitation}`,
    "",
    `Stats: ${stats}`,
    `Strengths: ${strengths}`,
    `Limits: ${limits}`,
    `Build Quality: ${draft.quality.overall}/100. ${quality}`,
    `Synergy: ${draft.synergy.score}/100. ${synergyNotes}`,
    `Power Interactions: ${interactions}`,
    "",
    `Story Hook: ${sheet.storyHook}`,
    `Name Options: ${nameOptions}`,
    `Name Rationale: ${draft.storyBrief.nameRationale}`,
    `Story Premise: ${draft.storyBrief.premise}`,
    `Story Arc: ${draft.storyBrief.arc}`,
    `Story Beats: ${beats}`,
    `Missing Build Steps: ${missing}`
  ].join("\n");
}
