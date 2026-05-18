import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { DATA_SOURCE_STRATEGIES } from "../data/dataSources.js";
import { getActiveDataSource, getDataSourceRoadmap, validateDataSources } from "./dataSourceModel.js";
import { filterImportedPowers, getImportedStateOptions, getTopImportedTags } from "./importedPowerPool.js";
import { createLogger, redactMetadata, serializeError } from "./logger.js";
import {
  createRankingProfile,
  getPowerRankingDisplay,
  getPopularityProfile,
  getRiskLevel,
  stripRankingAudit
} from "./rankingModel.js";
import {
  SAVED_DRAFT_SCHEMA_VERSION,
  getPublishedImportedRecords,
  getVisibleEnrichedPowers,
  normalizeSavedDraft,
  normalizeSavedDrafts
} from "./runtimeGuards.js";
import {
  assignPowerToSlot,
  buildHeroDraft,
  calculateSynergy,
  createOriginSource,
  createEmptyHeroBuild,
  findPowerSlot,
  formatHeroSheet,
  getHeroBuildChecklist,
  getHeroBuildPowers,
  removePowerFromBuild,
  toCanonSelection,
  toImportedSelection,
  toSelection
} from "./heroBuilder.js";
import { BASE_SUPERPOWERS, POWER_CATEGORIES } from "../data/superpowers.js";
import { calculatePowerScore, filterPowers, getPowersByCategory, validatePowerCatalog } from "./powerModel.js";
import {
  buildCanonLibrary,
  buildImportedLibrary,
  calculateSlotFitScore,
  filterLibrary,
  getLibraryCategoryCounts,
  getLibrarySourceCounts,
  getLibrarySubcategoryCounts,
  getPowerScope,
  getRecommendedSlot,
  inferCategory,
  inferStatsForImported,
  inferTierForImported,
  mergeLibraries,
  normalizeCanonPower,
  normalizeImportedPower
} from "./powerLibrary.js";

describe("power catalog model", () => {
  it("keeps the base catalog structurally valid", () => {
    expect(validatePowerCatalog(BASE_SUPERPOWERS, POWER_CATEGORIES)).toEqual([]);
  });

  it("groups powers only into categories that have powers", () => {
    const grouped = getPowersByCategory(BASE_SUPERPOWERS);
    expect(grouped.length).toBeGreaterThan(0);
    expect(grouped.every((category) => category.powers.length > 0)).toBe(true);
  });

  it("filters by query, category, and tier together", () => {
    const result = filterPowers({
      powers: BASE_SUPERPOWERS,
      query: "containment",
      category: "elemental",
      tier: "core"
    });

    expect(result.map((power) => power.id)).toContain("ice-control");
    expect(result.every((power) => power.category === "elemental" && power.tier === "core")).toBe(true);
  });

  it("calculates deterministic scores that penalize high risk", () => {
    const safePower = {
      stats: { offense: 5, defense: 5, mobility: 5, utility: 5, control: 5, risk: 1 }
    };
    const riskyPower = {
      stats: { offense: 5, defense: 5, mobility: 5, utility: 5, control: 5, risk: 10 }
    };

    expect(calculatePowerScore(safePower)).toBeGreaterThan(calculatePowerScore(riskyPower));
  });
});

describe("structured logger", () => {
  it("serializes errors without dropping message context", () => {
    const error = new Error("Import failed");

    expect(serializeError(error)).toMatchObject({
      name: "Error",
      message: "Import failed"
    });
  });

  it("redacts sensitive metadata recursively", () => {
    expect(redactMetadata({
      token: "abc",
      nested: { password: "secret", visible: "ok" }
    })).toEqual({
      token: "[REDACTED]",
      nested: { password: "[REDACTED]", visible: "ok" }
    });
  });

  it("writes JSON log payloads with correlation ids", () => {
    const lines = [];
    const logger = createLogger({
      namespace: "test",
      sink: { info: (line) => lines.push(line) },
      getCorrelationId: () => "request-1"
    });

    const payload = logger.info("example_event", { visible: true });
    const parsed = JSON.parse(lines[0]);

    expect(payload.event).toBe("example_event");
    expect(parsed.namespace).toBe("test");
    expect(parsed.correlationId).toBe("request-1");
    expect(parsed.visible).toBe(true);
  });
});

describe("data source model", () => {
  it("keeps source definitions structurally valid", () => {
    expect(validateDataSources(DATA_SOURCE_STRATEGIES)).toEqual([]);
  });

  it("keeps the original canon as the active source", () => {
    expect(getActiveDataSource(DATA_SOURCE_STRATEGIES)?.id).toBe("original-canon");
  });

  it("promotes Superpower List Database as the recommended bulk import source", () => {
    const recommended = DATA_SOURCE_STRATEGIES.find((source) => source.status === "recommended");
    expect(recommended?.id).toBe("superpower-list-database");
    expect(recommended.securityNotes.join(" ")).toContain("Justin Mahar");
  });

  it("sorts source roadmap by priority", () => {
    const priorities = getDataSourceRoadmap(DATA_SOURCE_STRATEGIES).map((source) => source.priority);
    expect(priorities).toEqual([...priorities].sort((left, right) => left - right));
  });
});

describe("runtime guards", () => {
  it("keeps only usable published imported records", () => {
    const records = getPublishedImportedRecords([
      { state: "published", name: "Flight" },
      { state: "submitted", name: "Draft" },
      { state: "published", name: "" },
      null
    ]);

    expect(records).toEqual([{ state: "published", name: "Flight" }]);
  });

  it("keeps only visible enriched powers", () => {
    const powers = getVisibleEnrichedPowers([
      {
        id: "imported:1",
        source: "imported",
        name: "Visible Power",
        stats: { risk: 4 },
        ranking: { content: { defaultVisible: true } }
      },
      {
        id: "imported:2",
        source: "imported",
        name: "Hidden Power",
        stats: { risk: 9 },
        ranking: { content: { defaultVisible: false } }
      },
      { id: "bad", name: "Missing Source" }
    ]);

    expect(powers.map((power) => power.name)).toEqual(["Visible Power"]);
  });

  it("normalizes saved drafts and adds schema versions", () => {
    const heroBuild = createEmptyHeroBuild();
    const draft = normalizeSavedDraft({
      id: "draft-1",
      name: "  Signal Guard  ",
      classification: "Strategist",
      selectedCount: 2,
      savedAt: "2026-05-18T00:00:00.000Z",
      heroBuild
    });

    expect(draft).toMatchObject({
      schemaVersion: SAVED_DRAFT_SCHEMA_VERSION,
      id: "draft-1",
      name: "Signal Guard",
      classification: "Strategist",
      selectedCount: 2,
      savedAt: "2026-05-18T00:00:00.000Z",
      heroBuild
    });
  });

  it("drops malformed saved drafts", () => {
    expect(normalizeSavedDrafts([
      { name: "No Build" },
      { id: "valid", name: "Valid", heroBuild: createEmptyHeroBuild() }
    ])).toHaveLength(1);
  });
});

describe("ranking model", () => {
  it("uses smoothed popularity so tiny samples are not treated as known picks", () => {
    expect(getPopularityProfile({
      preferenceRatio: 1,
      timesPreferred: 1,
      timesRejected: 0,
      totalComparisons: 1
    })).toMatchObject({
      label: "unproven",
      comparisonCount: 1
    });

    expect(getPopularityProfile({
      preferenceRatio: 0.8,
      timesPreferred: 80,
      timesRejected: 20,
      totalComparisons: 100
    }).label).toBe("known-pick");
  });

  it("maps risk levels deterministically", () => {
    expect(getRiskLevel(2)).toBe("low");
    expect(getRiskLevel(5)).toBe("medium");
    expect(getRiskLevel(8)).toBe("high");
    expect(getRiskLevel(10)).toBe("extreme");
  });

  it("creates ranking profiles with role fit, confidence, and audit evidence", () => {
    const power = normalizeImportedPower({
      sourceId: 999,
      name: "Reality Anything",
      overview: "do anything by warping reality.",
      description: "The user can change anything and everything in reality.",
      pros: ["Unlimited options"],
      cons: [],
      tags: ["reality", "anything"],
      state: "published",
      preferenceRatio: 1,
      timesPreferred: 1,
      timesRejected: 0,
      totalComparisons: 1
    });
    const ranking = createRankingProfile(power, {
      generatedAt: "2026-05-18T00:00:00.000Z",
      inputHash: "hash"
    });

    expect(ranking.rating).toBe("legendary");
    expect(ranking.scope).toBe("expansive");
    expect(ranking.risk.level).toBe("extreme");
    expect(ranking.constraint.requiredForPrimary).toBe(true);
    expect(ranking.popularity.label).toBe("unproven");
    expect(ranking.roleFit.primary.label).toMatch(/usable|strong/);
    expect(ranking.quality).toMatchObject({
      reviewed: false,
      duplicateKey: "reality-anything",
      clarity: "confusing",
      canonCandidate: false
    });
    expect(ranking.quality.reasons).toContain("too-broad");
    expect(ranking.evidence.scopeSignals.length).toBeGreaterThan(0);
    expect(stripRankingAudit(ranking).evidence).toBeUndefined();
    expect(stripRankingAudit(ranking)).toMatchObject({
      rating: "legendary",
      scope: "expansive",
      content: {
        defaultVisible: true,
        reasons: ["too-broad"]
      },
      constraint: {
        requiredForPrimary: true
      }
    });
    expect(stripRankingAudit(ranking).quality).toBeUndefined();
    expect(stripRankingAudit(ranking).sort).toBeUndefined();
  });

  it("hides imported powers with unsafe content flags", () => {
    const power = normalizeImportedPower({
      sourceId: 1000,
      name: "Terror Signal",
      overview: "A power about terror and blackmail.",
      description: "The user can terrorize crowds and blackmail people by spying on their private lives.",
      pros: ["Information leverage"],
      cons: ["Can ruin innocent lives"],
      tags: ["terror", "blackmail"],
      state: "published"
    });
    const ranking = createRankingProfile(power);

    expect(ranking.content.defaultVisible).toBe(false);
    expect(ranking.content.reasons).toEqual(expect.arrayContaining(["privacy-violation", "unsafe-real-world"]));
  });

  it("builds public ranking labels without exposing numeric score text", () => {
    const power = {
      source: "imported",
      tier: "advanced",
      stats: { risk: 8 },
      ranking: {
        rating: "advanced",
        scope: "focused",
        risk: { level: "high", score: 8 },
        bestRole: "secondary",
        confidence: { label: "inferred" },
        popularity: { label: "niche-pick" }
      }
    };
    const display = getPowerRankingDisplay(power);

    expect(display).toMatchObject({
      rating: "advanced",
      scopeLabel: "Focused",
      riskLabel: "High Risk",
      bestRoleLabel: "Secondary",
      confidenceLabel: "Inferred",
      popularityLabel: "Niche Pick"
    });
    expect(Object.values(display).join(" ")).not.toContain("Score");
  });
});

describe("imported superpower pool", () => {
  const sampleImportedPowers = [
    {
      name: "Jumping Jack",
      overview: "jump as high as you want.",
      description: "Leap safely through the air.",
      pros: ["Reach high places"],
      cons: ["Ceilings"],
      tags: ["jumping", "air"],
      state: "published"
    },
    {
      name: "Weaponverse",
      overview: "summon imagined weapons.",
      description: "Open a personal armory dimension.",
      pros: ["Instant weapon access"],
      cons: ["Energy drain"],
      tags: ["weapon", "dimension"],
      state: "published"
    },
    {
      name: "Draft Power",
      overview: "needs review.",
      description: "Not ready.",
      pros: [],
      cons: [],
      tags: ["draft"],
      state: "submitted"
    }
  ];

  it("filters imported powers by query, state, and tag", () => {
    const result = filterImportedPowers({
      powers: sampleImportedPowers,
      query: "armory",
      state: "published",
      tag: "dimension"
    });

    expect(result.totalMatches).toBe(1);
    expect(result.visible[0].name).toBe("Weaponverse");
  });

  it("sorts imported powers by popularity", () => {
    const result = filterImportedPowers({
      powers: [
        { ...sampleImportedPowers[0], totalComparisons: 5, preferenceRatio: 0.1 },
        { ...sampleImportedPowers[1], totalComparisons: 50, preferenceRatio: 0.1 }
      ],
      state: "published",
      sortBy: "popular"
    });

    expect(result.visible[0].name).toBe("Weaponverse");
  });

  it("extracts popular tags from imported powers", () => {
    expect(getTopImportedTags(sampleImportedPowers, 2)).toEqual([
      { tag: "air", count: 1 },
      { tag: "dimension", count: 1 }
    ]);
  });

  it("loads the generated Superpower List manifest", () => {
    const manifest = JSON.parse(readFileSync("public/data/superpower-list-manifest.json", "utf8"));

    expect(manifest.totalRecords).toBeGreaterThan(12000);
    expect(manifest.stateCounts.published).toBeGreaterThan(8000);
    expect(getImportedStateOptions(manifest)).toContain("published");
  });
});

describe("hero builder model", () => {
  it("does not score quality or synergy before powers are selected", () => {
    const draft = buildHeroDraft(createEmptyHeroBuild());

    expect(draft.selectedCount).toBe(0);
    expect(draft.synergy.score).toBe(0);
    expect(draft.synergy.notes).toEqual(["Select powers to calculate synergy."]);
    expect(draft.synergy.conflicts).toEqual([]);
    expect(draft.quality.overall).toBe(0);
    expect(draft.quality.metrics.every((metric) => metric.score === 0)).toBe(true);
    expect(draft.readiness).toBe("Assign powers into slots to generate a hero draft.");
  });

  it("models origin as how the hero got powers and carries category bias", () => {
    const origin = createOriginSource("bite-infection");
    const checklist = getHeroBuildChecklist({ ...createEmptyHeroBuild(), origin });

    expect(origin.name).toBe("Bite / Infection");
    expect(origin.preferredCategories).toEqual(expect.arrayContaining(["biological", "physical", "mobility"]));
    expect(origin.summary).toContain("bite");
    expect(checklist.find((step) => step.id === "origin")?.detail).toContain("Powers come from Bite / Infection");
  });

  it("keeps array-based drafts compatible with canon and imported powers", () => {
    const canonPower = toCanonSelection(BASE_SUPERPOWERS.find((power) => power.id === "telepathy"), "Psychic");
    const importedPower = toImportedSelection({
      sourceId: 123,
      name: "Weaponverse",
      overview: "summon imagined weapons.",
      pros: ["Instant weapon access"],
      cons: ["Energy drain"],
      tags: ["weapon", "dimension"],
      preferenceRatio: 1
    });
    const draft = buildHeroDraft([canonPower, importedPower]);

    expect(draft.selectedCount).toBe(2);
    expect(draft.canonCount).toBe(1);
    expect(draft.importedCount).toBe(1);
    expect(draft.heroName).toBeTruthy();
    expect(draft.classification).toBe("Mindlock Strategist");
    expect(draft.strengths).toContain("Instant weapon access");
    expect(draft.characterSheet.alias).toBe(draft.heroName);
    expect(draft.synergy.conflicts).toContain("Add at least three powers to make the concept feel complete.");
  });

  it("assigns powers into role slots and generates a character sheet", () => {
    const canon = buildCanonLibrary();
    const powerById = new Map(canon.map((power) => [power.id, power]));

    const withOrigin = assignPowerToSlot(createEmptyHeroBuild(), createOriginSource("cosmic-event"), "origin");
    const withPrimary = assignPowerToSlot(withOrigin, powerById.get("canon:telepathy"), "primary");
    const withUtility = assignPowerToSlot(withPrimary, powerById.get("canon:flight"), "utility");
    const draft = buildHeroDraft(withUtility);

    expect(getHeroBuildPowers(withUtility)).toHaveLength(2);
    expect(findPowerSlot(withUtility, "canon:telepathy")).toBe("primary");
    expect(draft.filledSlots).toBe(3);
    expect(draft.characterSheet.powerLoadout.primary).toBe("Telepathy");
    expect(draft.characterSheet.powerLoadout.utility).toBe("Flight");
    expect(draft.characterSheet.powerLoadout.limitation).toBe("Consent and privacy risk");
    expect(draft.characterSheet.homeBase).toBe("Unassigned home base");
    expect(draft.characterSheet.storyHook).toContain("built around Telepathy");
    expect(draft.storyBrief.nameRationale).toContain("Name");
    expect(draft.storyBrief.nameCandidates).toContain(draft.heroName);
    expect(draft.storyBrief.beats).toHaveLength(3);
    expect(draft.interactions.map((interaction) => interaction.id)).toEqual(
      expect.arrayContaining(["origin-primary", "primary-utility", "primary-limitation"])
    );
    expect(draft.quality.overall).toBeGreaterThan(50);
    expect(draft.quality.metrics.map((metric) => metric.id)).toEqual(["identity", "field", "balance", "cohesion"]);
    expect(draft.recommendations.map((item) => item.id)).toContain("motivation");
    expect(draft.storyBrief.missing).toEqual([]);
    expect(draft.checklist.every((step) => step.complete)).toBe(true);
    expect(draft.heroName).toMatch(/^Mind/);
    expect(draft.readiness).toBe("Draft needs stronger synergy or a clearer limitation.");
    expect(calculateSynergy(withUtility).score).toBeGreaterThanOrEqual(60);

    const exportSheet = formatHeroSheet(draft);
    expect(exportSheet).toContain(draft.heroName);
    expect(exportSheet).toContain("Power Loadout");
    expect(exportSheet).toContain("Primary: Telepathy");
    expect(exportSheet).toContain("Limitation: Consent and privacy risk");
    expect(exportSheet).toContain("Story Hook:");
    expect(exportSheet).toContain("Name Options:");
    expect(exportSheet).toContain("Story Beats:");
    expect(exportSheet).toContain("Power Interactions:");
    expect(exportSheet).toContain("Build Quality:");
    expect(exportSheet).toContain("Name Rationale:");
    expect(exportSheet).toContain("Missing Build Steps:");
  });

  it("allows a selected alias to override the generated hero name", () => {
    const canon = buildCanonLibrary();
    const telepathy = canon.find((power) => power.id === "canon:telepathy");
    const build = {
      ...assignPowerToSlot(createEmptyHeroBuild(), telepathy, "primary"),
      alias: "The Quiet Signal"
    };
    const draft = buildHeroDraft(build);

    expect(draft.generatedName).toMatch(/^Mind/);
    expect(draft.heroName).toBe("The Quiet Signal");
    expect(draft.characterSheet.alias).toBe("The Quiet Signal");
    expect(draft.storyBrief.nameCandidates[0]).toBe("The Quiet Signal");
    expect(formatHeroSheet(draft)).toContain("The Quiet Signal");
  });

  it("persists editable civilian identity fields into the sheet and story", () => {
    const canon = buildCanonLibrary();
    const flight = canon.find((power) => power.id === "canon:flight");
    const build = {
      ...assignPowerToSlot(createEmptyHeroBuild(), flight, "utility"),
      alias: "Skyline",
      civilianName: "Mara Vale",
      homeBase: "Harbor District"
    };
    const draft = buildHeroDraft(build);
    const exportSheet = formatHeroSheet(draft);

    expect(draft.characterSheet.civilianName).toBe("Mara Vale");
    expect(draft.characterSheet.homeBase).toBe("Harbor District");
    expect(draft.storyBrief.premise).toContain("Harbor District");
    expect(exportSheet).toContain("Civilian Name: Mara Vale");
    expect(exportSheet).toContain("Home Base: Harbor District");
  });

  it("uses motivation and custom story constraints to balance broad builds", () => {
    const canon = buildCanonLibrary();
    const time = canon.find((power) => power.id === "canon:time-dilation");
    const buildWithoutConstraint = assignPowerToSlot(
      assignPowerToSlot(createEmptyHeroBuild(), createOriginSource("cosmic-event"), "origin"),
      time,
      "primary"
    );
    const buildWithConstraint = {
      ...buildWithoutConstraint,
      motivation: "Protect people from preventable disasters",
      storyConstraint: "Can only bend time for twelve seconds before memory loss"
    };
    const withoutConstraint = buildHeroDraft(buildWithoutConstraint);
    const withConstraint = buildHeroDraft(buildWithConstraint);

    expect(withoutConstraint.synergy.conflicts).not.toContain("Cosmic/time signals need a strong limitation to avoid overpowering the build.");
    expect(withoutConstraint.characterSheet.powerLoadout.limitation).toBe("Paradox risk");
    expect(withoutConstraint.recommendations.map((item) => item.id)).not.toContain("expansive-primary-limit");
    expect(withConstraint.synergy.conflicts).not.toContain("Cosmic/time signals need a strong limitation to avoid overpowering the build.");
    expect(withConstraint.recommendations.map((item) => item.id)).not.toContain("expansive-primary-limit");
    expect(withConstraint.characterSheet.motivation).toBe("Protect people from preventable disasters");
    expect(withConstraint.characterSheet.storyConstraint).toContain("twelve seconds");
    expect(withConstraint.storyBrief.arc).toContain("twelve seconds");
    expect(formatHeroSheet(withConstraint)).toContain("Story Constraint: Can only bend time");
  });

  it("derives story limitations from selected power drawbacks", () => {
    const primalism = {
      id: "imported:4824",
      source: "imported",
      name: "Primalism (Primal Lord)",
      category: "cosmic",
      categoryName: "Cosmic",
      role: "Cosmic Controller",
      summary: "The ability to control life and evolution.",
      strengths: ["Create life"],
      weaknesses: ["Causes great cosmic calamity to creation itself if the user is too power crazy of being like a God"],
      tags: ["Life", "god", "evolution"],
      stats: { offense: 7, defense: 7, mobility: 7, utility: 10, control: 10, risk: 10 },
      score: 31,
      popularity: 0.7
    };
    const build = assignPowerToSlot(createEmptyHeroBuild(), primalism, "primary");
    const draft = buildHeroDraft(build);

    const checklist = getHeroBuildChecklist(build);
    expect(build.limitation).toBeNull();
    expect(getHeroBuildPowers(build)).toHaveLength(1);
    expect(draft.characterSheet.powerLoadout.limitation).toContain("cosmic calamity");
    expect(draft.characterSheet.storyConstraint).toContain("cosmic calamity");
    expect(checklist.some((step) => step.id === "limitation")).toBe(false);
  });

  it("promotes review when identity, field use, balance, and story are complete", () => {
    const canon = buildCanonLibrary();
    const powerById = new Map(canon.map((power) => [power.id, power]));
    const build = {
      ...assignPowerToSlot(
        assignPowerToSlot(
          assignPowerToSlot(
            assignPowerToSlot(createEmptyHeroBuild(), createOriginSource("experiment"), "origin"),
            powerById.get("canon:fire-control"),
            "primary"
          ),
          powerById.get("canon:flight"),
          "utility"
        ),
        powerById.get("canon:telepathy"),
        "secondary"
      ),
      motivation: "Prevent the program that created them from hurting anyone else",
      homeBase: "Foundry Row",
      storyConstraint: "Power spikes reveal their location"
    };
    const draft = buildHeroDraft(build);

    expect(draft.recommendations[0]).toMatchObject({
      id: "ready-review",
      priority: "complete",
      slotId: "all"
    });
  });

  it("moves and removes powers idempotently across hero slots", () => {
    const canon = buildCanonLibrary();
    const telepathy = canon.find((power) => power.id === "canon:telepathy");
    const flight = canon.find((power) => power.id === "canon:flight");

    const build = assignPowerToSlot(
      assignPowerToSlot(createEmptyHeroBuild(), telepathy, "primary"),
      flight,
      "secondary"
    );
    const moved = assignPowerToSlot(build, telepathy, "utility");
    const removed = removePowerFromBuild(moved, "canon:telepathy");

    expect(findPowerSlot(moved, "canon:telepathy")).toBe("utility");
    expect(moved.primary).toBeNull();
    expect(getHeroBuildPowers(moved)).toHaveLength(2);
    expect(findPowerSlot(removed, "canon:telepathy")).toBeNull();
    expect(getHeroBuildPowers(removed)).toHaveLength(1);
  });

  it("summarizes the next build steps from slot state", () => {
    const canon = buildCanonLibrary();
    const telepathy = canon.find((power) => power.id === "canon:telepathy");
    const build = assignPowerToSlot(createEmptyHeroBuild(), telepathy, "primary");
    const checklist = getHeroBuildChecklist(build);

    expect(checklist.find((step) => step.id === "primary")?.complete).toBe(true);
    expect(checklist.find((step) => step.id === "origin")?.complete).toBe(false);
    expect(checklist.find((step) => step.id === "utility")?.detail).toContain("movement");
  });
});

describe("unified power library", () => {
  const sampleImportedRaw = [
    {
      sourceId: 901,
      name: "Pyrokinesis",
      overview: "ignite and shape flame at will.",
      description: "Conjure and control fire.",
      pros: ["Area denial", "Intimidation"],
      cons: ["Collateral fire", "Oxygen dependent"],
      tags: ["fire", "burn"],
      state: "published",
      preferenceRatio: 0.72,
      totalComparisons: 140
    },
    {
      sourceId: 902,
      name: "Stealth Walk",
      overview: "move without making any sound.",
      description: "Vanish from sound and sight.",
      pros: ["Recon advantage"],
      cons: ["Low direct defense"],
      tags: ["stealth", "shadow", "sneak"],
      state: "published",
      preferenceRatio: 0.4,
      totalComparisons: 10
    },
    {
      sourceId: 903,
      name: "Quantum Drift",
      overview: "slip between dimensions.",
      description: "Phase across realities.",
      pros: ["Escape any trap"],
      cons: ["Disorientation", "Anchor risk", "Energy drain"],
      tags: ["dimension", "quantum", "time"],
      state: "published",
      preferenceRatio: 0.85,
      totalComparisons: 220
    }
  ];

  it("infers categories from keywords in the power text", () => {
    expect(inferCategory("Pyrokinesis ignite and shape flame at will")).toBe("elemental");
    expect(inferCategory("read minds and project thoughts")).toBe("psychic");
    expect(inferCategory("teleport instantly to any place")).toBe("mobility");
    expect(inferCategory("hack any computer or drone")).toBe("tech");
    expect(inferCategory("cast a curse using an arcane rune")).toBe("mystic");
    expect(inferCategory("walk silently in the shadows")).toBe("stealth");
    expect(inferCategory("bend gravity across a galaxy")).toBe("cosmic");
    expect(inferCategory("")).toBe("physical");
  });

  it("normalizes canon powers into the unified shape", () => {
    const canon = normalizeCanonPower(BASE_SUPERPOWERS.find((power) => power.id === "telepathy"));

    expect(canon.id).toBe("canon:telepathy");
    expect(canon.source).toBe("canon");
    expect(canon.category).toBe("psychic");
    expect(canon.categoryId).toBe("psychic");
    expect(canon.categoryName).toBe("Psychic");
    expect(canon.stats).toBeDefined();
    expect(canon.score).toBeGreaterThan(0);
    expect(canon.popularity).toBeGreaterThan(0);
  });

  it("normalizes imported powers, inferring category and tier", () => {
    const [pyro, stealth, drift] = sampleImportedRaw.map((raw) => normalizeImportedPower(raw));

    expect(pyro.source).toBe("imported");
    expect(pyro.category).toBe("elemental");
    expect(pyro.categoryId).toBe("elemental");
    expect(pyro.tier).toBe("legendary");

    expect(stealth.category).toBe("stealth");
    expect(stealth.tier).toBe("core");

    expect(drift.category).toBe("cosmic");
    expect(drift.stats.risk).toBeGreaterThanOrEqual(drift.raw.cons.length);
  });

  it("uses popularity and cons count when inferring stats", () => {
    const lowPop = inferStatsForImported({ category: "physical", popularity: 0.2, consCount: 0 });
    const highPop = inferStatsForImported({ category: "physical", popularity: 0.9, consCount: 0 });

    expect(highPop.offense).toBeGreaterThan(lowPop.offense);

    const safer = inferStatsForImported({ category: "tech", popularity: 0.5, consCount: 0 });
    const risky = inferStatsForImported({ category: "tech", popularity: 0.5, consCount: 3 });
    expect(risky.risk).toBeGreaterThan(safer.risk);
  });

  it("tiers imported powers from popularity and votes", () => {
    expect(inferTierForImported({ popularity: 0.7, totalComparisons: 200 })).toBe("legendary");
    expect(inferTierForImported({ popularity: 0.55, totalComparisons: 10 })).toBe("advanced");
    expect(inferTierForImported({ popularity: 0.3, totalComparisons: 5 })).toBe("core");
  });

  it("filters the merged library by category, source, tier and query", () => {
    const canon = buildCanonLibrary();
    const imported = buildImportedLibrary(sampleImportedRaw);
    const library = mergeLibraries(canon, imported);

    const elemental = filterLibrary({ powers: library, category: "elemental" });
    expect(elemental.totalMatches).toBeGreaterThan(0);
    expect(elemental.visible.every((power) => power.category === "elemental")).toBe(true);

    const onlyImported = filterLibrary({ powers: library, source: "imported" });
    expect(onlyImported.visible.every((power) => power.source === "imported")).toBe(true);

    const search = filterLibrary({ powers: library, query: "telepathy" });
    expect(search.visible.some((power) => power.id === "canon:telepathy")).toBe(true);

    const sortedByRisk = filterLibrary({ powers: library, sortBy: "risk" });
    const risks = sortedByRisk.visible.map((power) => power.stats.risk);
    expect(risks).toEqual([...risks].sort((a, b) => a - b));

    const sortedByOffense = filterLibrary({ powers: library, sortBy: "offense" });
    const offense = sortedByOffense.visible.map((power) => power.stats.offense);
    expect(offense).toEqual([...offense].sort((a, b) => b - a));
  });

  it("sorts recommendations by the active hero slot", () => {
    const library = mergeLibraries(buildCanonLibrary(), buildImportedLibrary(sampleImportedRaw));
    const primary = filterLibrary({ powers: library, sortBy: "slotFit", activeSlot: "primary", limit: 5 });
    const utility = filterLibrary({ powers: library, sortBy: "slotFit", activeSlot: "utility", limit: 5 });
    const primaryScores = primary.visible.map((power) => calculateSlotFitScore(power, "primary"));
    const utilityScores = utility.visible.map((power) => calculateSlotFitScore(power, "utility"));

    expect(primaryScores).toEqual([...primaryScores].sort((a, b) => b - a));
    expect(utilityScores).toEqual([...utilityScores].sort((a, b) => b - a));
    expect(primary.visible.map((power) => power.id)).not.toEqual(utility.visible.map((power) => power.id));
  });

  it("labels the best hero slot for a power", () => {
    const library = buildCanonLibrary();
    const flight = library.find((power) => power.id === "canon:flight");
    const fire = library.find((power) => power.id === "canon:fire-control");

    expect(getRecommendedSlot(flight).slotId).toBe("utility");
    expect(getRecommendedSlot(fire).slotId).toBe("primary");
  });

  it("classifies broad powers separately from narrow powers", () => {
    const library = buildCanonLibrary();
    const time = library.find((power) => power.id === "canon:time-dilation");
    const strength = library.find((power) => power.id === "canon:super-strength");

    expect(getPowerScope(time).id).toBe("expansive");
    expect(getPowerScope(strength).id).toBe("focused");
    expect(getRecommendedSlot(time).slotId).toBe("primary");
  });

  it("filters the merged library by recommended hero slot", () => {
    const library = mergeLibraries(buildCanonLibrary(), buildImportedLibrary(sampleImportedRaw));
    const utility = filterLibrary({ powers: library, slotFit: "utility", limit: 100 });
    const primary = filterLibrary({ powers: library, slotFit: "primary", limit: 100 });

    expect(utility.totalMatches).toBeGreaterThan(0);
    expect(primary.totalMatches).toBeGreaterThan(0);
    expect(utility.visible.every((power) => getRecommendedSlot(power).slotId === "utility")).toBe(true);
    expect(primary.visible.every((power) => getRecommendedSlot(power).slotId === "primary")).toBe(true);
  });

  it("can prioritize powers that match the selected origin categories", () => {
    const library = mergeLibraries(buildCanonLibrary(), buildImportedLibrary(sampleImportedRaw));
    const prioritized = filterLibrary({
      powers: library,
      originCategoryIds: ["biological"],
      prioritizeOriginFit: true,
      sortBy: "slotFit",
      limit: 10
    });

    expect(prioritized.visible.length).toBeGreaterThan(0);
    expect(prioritized.visible[0].category).toBe("biological");
  });

  it("can filter directly to selected power ids for review mode", () => {
    const library = mergeLibraries(buildCanonLibrary(), buildImportedLibrary(sampleImportedRaw));
    const telepathy = library.find((power) => power.id === "canon:telepathy");
    const flight = library.find((power) => power.id === "canon:flight");
    const result = filterLibrary({
      powers: library,
      category: "mobility",
      subcategory: "teleportation",
      slotFit: "utility",
      selectedPowerIds: new Set([telepathy.id, flight.id])
    });

    expect(result.totalMatches).toBe(2);
    expect(result.visible.map((power) => power.id).sort()).toEqual(["canon:flight", "canon:telepathy"]);
  });

  it("filters the merged library by stat thresholds", () => {
    const library = mergeLibraries(buildCanonLibrary(), buildImportedLibrary(sampleImportedRaw));
    const result = filterLibrary({
      powers: library,
      statFilters: {
        offense: 8,
        utility: 6,
        risk: 8
      }
    });

    expect(result.totalMatches).toBeGreaterThan(0);
    expect(result.visible.every((power) => power.stats.offense >= 8)).toBe(true);
    expect(result.visible.every((power) => power.stats.utility >= 6)).toBe(true);
    expect(result.visible.every((power) => power.stats.risk <= 8)).toBe(true);
  });

  it("builds category-specific subcategory counts and filters by subcategory", () => {
    const library = mergeLibraries(buildCanonLibrary(), buildImportedLibrary(sampleImportedRaw));
    const counts = getLibrarySubcategoryCounts({ powers: library, category: "mobility" });
    const flight = counts.find((subcategory) => subcategory.id === "flight");
    const portals = counts.find((subcategory) => subcategory.id === "portals");

    expect(flight?.count).toBeGreaterThan(0);
    expect(portals?.count).toBeGreaterThan(0);

    const result = filterLibrary({ powers: library, category: "mobility", subcategory: "portals" });
    expect(result.visible.some((power) => power.id === "canon:portal-creation")).toBe(true);
    expect(result.visible.every((power) => power.category === "mobility")).toBe(true);
  });

  it("paginates the merged library beyond the first page", () => {
    const library = mergeLibraries(buildCanonLibrary(), buildImportedLibrary(sampleImportedRaw));
    const firstPage = filterLibrary({ powers: library, sortBy: "name", limit: 2, page: 1 });
    const secondPage = filterLibrary({ powers: library, sortBy: "name", limit: 2, page: 2 });

    expect(firstPage.visible).toHaveLength(2);
    expect(secondPage.visible).toHaveLength(2);
    expect(firstPage.totalPages).toBeGreaterThan(1);
    expect(firstPage.hasNextPage).toBe(true);
    expect(secondPage.hasPreviousPage).toBe(true);
    expect(secondPage.visible.map((power) => power.id)).not.toEqual(firstPage.visible.map((power) => power.id));
  });

  it("computes category and source counts for the library", () => {
    const library = mergeLibraries(buildCanonLibrary(), buildImportedLibrary(sampleImportedRaw));
    const counts = getLibraryCategoryCounts(library);
    const elemental = counts.find((category) => category.id === "elemental");
    expect(elemental.count).toBeGreaterThan(0);

    const sourceCounts = getLibrarySourceCounts(library);
    expect(sourceCounts.total).toBe(library.length);
    expect(sourceCounts.canon).toBe(BASE_SUPERPOWERS.length);
    expect(sourceCounts.imported).toBe(sampleImportedRaw.length);
  });

  it("builds a hero draft directly from unified powers via toSelection", () => {
    const library = mergeLibraries(buildCanonLibrary(), buildImportedLibrary(sampleImportedRaw));
    const picks = [
      library.find((power) => power.id === "canon:flight"),
      library.find((power) => power.id === "imported:901")
    ].map(toSelection);

    const draft = buildHeroDraft(picks);
    expect(draft.selectedCount).toBe(2);
    expect(draft.canonCount).toBe(1);
    expect(draft.importedCount).toBe(1);
    expect(draft.stats.offense).toBeGreaterThan(0);
  });
});
