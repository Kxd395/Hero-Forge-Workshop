export const RANKING_SCHEMA_VERSION = 1;
export const RANKING_PIPELINE_VERSION = "ranking-pipeline-v1";
export const RANKING_RULESET_VERSION = "ranking-rules-v1";

const BROAD_SCOPE_TERMS = [
  "anything", "everything", "omnipotent", "all powers", "reality", "probability",
  "time", "temporal", "dimension", "dimensional", "gravity", "cosmic", "infinite"
];

const RISK_PATTERNS = [
  { tag: "story-breaking", terms: ["anything", "everything", "omnipotent", "reality", "probability", "infinite"] },
  { tag: "privacy-risk", terms: ["mind", "telepathy", "memory", "thought", "privacy", "control people"] },
  { tag: "collateral-damage", terms: ["fire", "explosion", "radiation", "blast", "earthquake", "storm"] },
  { tag: "moral-risk", terms: ["death", "soul", "curse", "control", "manipulate"] },
  { tag: "condition-dependent", terms: ["only", "requires", "must", "while", "if "] }
];

const CONTENT_PATTERNS = [
  { flag: "profanity", terms: ["fuck", "shit", "bitch"] },
  { flag: "graphic-violence", terms: ["gore", "torture", "mutilat"] },
  { flag: "privacy-violation", terms: ["stalk", "blackmail", "spy on"] },
  { flag: "real-world-harm", terms: ["suicide", "self harm", "terror"] }
];

const HIDDEN_QUALITY_FLAGS = new Set([
  "offensive-language",
  "graphic-violence",
  "unsafe-real-world",
  "broken-format"
]);

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

function round(value) {
  return Math.round(clamp(value));
}

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function powerText(power) {
  return [
    power.name,
    power.category,
    power.categoryName,
    power.role,
    power.description,
    power.summary,
    ...(power.strengths ?? []),
    ...(power.weaknesses ?? []),
    ...(power.tags ?? [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function addEvidence(items, field, match, weight, reason) {
  items.push({ field, match, weight, reason });
}

function labelRole(score) {
  if (score >= 70) return "strong";
  if (score >= 45) return "usable";
  return "weak";
}

function average(values) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function getRiskLevel(score) {
  if (score >= 9) return "extreme";
  if (score >= 7) return "high";
  if (score >= 4) return "medium";
  return "low";
}

export function getPopularityProfile(raw = {}) {
  const timesPreferred = Number(raw.timesPreferred ?? 0);
  const timesRejected = Number(raw.timesRejected ?? 0);
  const comparisonCount = Number(raw.totalComparisons ?? timesPreferred + timesRejected);
  const rawRatio = Number.isFinite(raw.preferenceRatio) ? raw.preferenceRatio : 0;
  const alpha = 5;
  const beta = 5;
  const smoothedScore = (timesPreferred + alpha) / (comparisonCount + alpha + beta);
  let label = "unproven";

  if (comparisonCount >= 50 && smoothedScore >= 0.6) {
    label = "known-pick";
  } else if (comparisonCount >= 5) {
    label = "niche-pick";
  }

  return {
    label,
    rawRatio,
    smoothedScore: Number(smoothedScore.toFixed(4)),
    comparisonCount,
    timesPreferred,
    timesRejected
  };
}

function getScope(power, evidence) {
  const text = powerText(power);
  const matches = BROAD_SCOPE_TERMS.filter((term) => text.includes(term));
  matches.forEach((term) => addEvidence(
    evidence.scopeSignals,
    "text",
    term,
    3,
    "broad language increases power scope"
  ));

  if (matches.length >= 2 || power.tier === "legendary") return "expansive";
  if (matches.length === 1 || power.tier === "advanced") return "versatile";
  return "focused";
}

function getRisk(power, scope, evidence) {
  const text = powerText(power);
  const tags = new Set();
  let signalPenalty = 0;

  for (const pattern of RISK_PATTERNS) {
    for (const term of pattern.terms) {
      if (text.includes(term)) {
        tags.add(pattern.tag);
        signalPenalty += pattern.tag === "story-breaking"
          ? 2
          : pattern.tag === "condition-dependent"
            ? 0.5
            : 1;
        addEvidence(
          evidence.riskSignals,
          "text",
          term,
          2,
          `${pattern.tag} signal raises risk`
        );
      }
    }
  }

  if ((power.weaknesses ?? []).length === 0 && power.source === "imported") {
    tags.add("low-drawback-text");
    signalPenalty += 1;
    addEvidence(evidence.riskSignals, "weaknesses", "empty", 2, "missing drawbacks reduce confidence in balance");
  }

  const scopePenalty = scope === "expansive" ? 2 : scope === "versatile" ? 1 : 0;
  const score = clamp((power.stats?.risk ?? 5) * 0.65 + scopePenalty + signalPenalty, 1, 10);

  return {
    score,
    level: getRiskLevel(score),
    tags: [...tags].sort()
  };
}

function getRoleFit(power, evidence) {
  const stats = power.stats ?? {};
  const primary = round((stats.offense ?? 1) * 8 + (stats.control ?? 1) * 7 + (stats.utility ?? 1) * 3 - (stats.risk ?? 1) * 2);
  const secondary = round((power.score ?? 1) * 2 + (stats.utility ?? 1) * 6 + (stats.control ?? 1) * 5 - (stats.risk ?? 1) * 2);
  const utility = round((stats.utility ?? 1) * 9 + (stats.mobility ?? 1) * 7 + (stats.defense ?? 1) * 3 - (stats.offense ?? 1));

  addEvidence(evidence.roleSignals, "stats", "primary", primary, "offense and control drive primary fit");
  addEvidence(evidence.roleSignals, "stats", "secondary", secondary, "utility and control drive secondary fit");
  addEvidence(evidence.roleSignals, "stats", "utility", utility, "utility and mobility drive utility fit");

  return {
    primary: { score: primary, label: labelRole(primary), reasons: ["offense/control identity fit"] },
    secondary: { score: secondary, label: labelRole(secondary), reasons: ["combo support fit"] },
    utility: { score: utility, label: labelRole(utility), reasons: ["field-use fit"] }
  };
}

function getConfidence(power, popularity, evidence) {
  const textLength = powerText(power).length;
  let score = power.source === "canon" ? 95 : 25;
  const reasons = [];

  if (power.source === "canon") reasons.push("canon record");
  if (textLength >= 240) {
    score += 15;
    reasons.push("rich description");
    addEvidence(evidence.confidenceSignals, "text", "rich-description", 2, "longer text improves inference confidence");
  }
  if (popularity.comparisonCount >= 100) {
    score += 20;
    reasons.push("strong comparison data");
    addEvidence(evidence.confidenceSignals, "raw.totalComparisons", String(popularity.comparisonCount), 3, "large comparison sample improves confidence");
  } else if (popularity.comparisonCount >= 20) {
    score += 10;
    reasons.push("comparison data");
    addEvidence(evidence.confidenceSignals, "raw.totalComparisons", String(popularity.comparisonCount), 2, "comparison data improves confidence");
  }
  if ((power.weaknesses ?? []).length > 0) {
    score += 10;
    reasons.push("drawback text");
  }
  if ((power.weaknesses ?? []).length === 0 && power.source === "imported") {
    score -= 20;
    reasons.push("missing drawbacks");
  }

  const clamped = round(score);
  return {
    label: clamped >= 65 ? "strong" : clamped >= 45 ? "inferred" : "low-data",
    score: clamped,
    reasons
  };
}

function getRating(power, popularity, scope, risk, evidence) {
  const stats = power.stats ?? {};
  const capability = average([
    stats.offense ?? 1,
    stats.defense ?? 1,
    stats.mobility ?? 1,
    stats.utility ?? 1,
    stats.control ?? 1
  ]);
  const popularityBoost = popularity.label === "known-pick"
    ? 1
    : popularity.label === "niche-pick"
      ? 0.35
      : 0;
  const scopeBoost = scope === "expansive" ? 1.1 : scope === "versatile" ? 0.45 : 0;
  const riskDrag = risk.level === "extreme" ? 0.7 : risk.level === "high" ? 0.35 : 0;
  const ratingScore = capability + popularityBoost + scopeBoost - riskDrag;

  addEvidence(evidence.qualitySignals, "rating", ratingScore.toFixed(2), 1, "capability, scope, popularity, and risk determine display rating");

  if (ratingScore >= 8.3 && scope === "expansive" && risk.level !== "low") return "legendary";
  if (ratingScore >= 6.7 || (scope === "versatile" && ratingScore >= 6.2)) return "advanced";
  return "core";
}

function getQuality(power, evidence) {
  const flags = [];
  const text = powerText(power);
  const description = power.description ?? power.summary ?? "";

  if (description.length < 40) flags.push("thin-record");
  if (power.name.length > 60) flags.push("long-name");
  if (!description.trim()) flags.push("empty-description");
  if (BROAD_SCOPE_TERMS.some((term) => text.includes(term))) flags.push("too-broad");
  if (!power.stats || Object.values(power.stats).some((value) => !Number.isFinite(value))) flags.push("broken-format");

  flags.forEach((flag) => addEvidence(evidence.qualitySignals, "text", flag, 1, `${flag} quality flag`));
  const clarity = flags.includes("empty-description") || flags.includes("thin-record")
    ? "thin"
    : flags.includes("too-broad")
      ? "confusing"
      : "clear";

  return {
    flags,
    defaultVisible: !flags.some((flag) => HIDDEN_QUALITY_FLAGS.has(flag)),
    reviewed: false,
    reasons: flags,
    duplicateKey: normalizeKey(power.name),
    languageRisk: "none",
    clarity,
    canonCandidate: power.source === "canon",
    categoryConfidence: flags.includes("thin-record") ? 0.55 : 0.75,
    textQualityScore: clamp(100 - flags.length * 20) / 100,
    duplicateGroupId: null
  };
}

function getContent(power, evidence) {
  const text = powerText(power);
  const flags = [];

  for (const pattern of CONTENT_PATTERNS) {
    if (pattern.terms.some((term) => text.includes(term))) {
      flags.push(pattern.flag);
      addEvidence(evidence.contentSignals, "text", pattern.flag, 5, `${pattern.flag} content flag`);
    }
  }

  const hiddenReasons = flags.map((flag) => {
    if (flag === "profanity") return "offensive-language";
    if (flag === "real-world-harm") return "unsafe-real-world";
    return flag;
  });

  return {
    flags,
    reasons: hiddenReasons,
    defaultVisible: flags.length === 0,
    moderationReason: flags.length > 0 ? `${flags[0]} detected` : ""
  };
}

function getSortScores(power, roleFit, risk, popularity, confidence) {
  const usefulStats =
    (power.stats?.offense ?? 0) +
    (power.stats?.defense ?? 0) +
    (power.stats?.mobility ?? 0) +
    (power.stats?.utility ?? 0) +
    (power.stats?.control ?? 0);
  return {
    recommended: round(roleFit.primary.score * 0.25 + roleFit.secondary.score * 0.2 + roleFit.utility.score * 0.2 + confidence.score * 0.2 + popularity.smoothedScore * 15 - risk.score * 2),
    bestBalance: round(usefulStats * 2 - risk.score * 5 + confidence.score * 0.2),
    highestImpact: round((power.stats?.offense ?? 0) * 8 + (power.stats?.control ?? 0) * 6),
    lowestRisk: round(100 - risk.score * 10),
    mostUtility: round((power.stats?.utility ?? 0) * 8 + (power.stats?.mobility ?? 0) * 5),
    bestPrimary: roleFit.primary.score,
    bestSecondary: roleFit.secondary.score,
    bestUtility: roleFit.utility.score,
    mostPopular: round(popularity.smoothedScore * 100 + Math.min(popularity.comparisonCount, 100) * 0.2)
  };
}

export function createRankingProfile(power, { generatedAt = new Date().toISOString(), inputHash = "" } = {}) {
  const evidence = {
    categorySignals: [],
    subcategorySignals: [],
    statSignals: [],
    scopeSignals: [],
    riskSignals: [],
    roleSignals: [],
    confidenceSignals: [],
    popularitySignals: [],
    qualitySignals: [],
    contentSignals: []
  };
  const popularity = getPopularityProfile(power.raw);
  addEvidence(evidence.popularitySignals, "raw.totalComparisons", String(popularity.comparisonCount), 1, "comparison count informs popularity label");
  const scope = getScope(power, evidence);
  const risk = getRisk(power, scope, evidence);
  const roleFit = getRoleFit(power, evidence);
  const bestRole = Object.entries(roleFit).sort((left, right) => right[1].score - left[1].score)[0][0];
  const confidence = getConfidence(power, popularity, evidence);
  const quality = getQuality(power, evidence);
  const content = getContent(power, evidence);
  const rating = getRating(power, popularity, scope, risk, evidence);
  const defaultVisible = quality.defaultVisible && content.defaultVisible;
  const contentReasons = [...new Set([...(quality.reasons ?? []), ...(content.reasons ?? [])])];
  const contentProfile = {
    ...content,
    defaultVisible,
    reasons: contentReasons,
    moderationReason: contentReasons.length > 0 ? contentReasons[0] : ""
  };
  const constraintRequired = scope === "expansive" && (risk.level === "high" || risk.level === "extreme");
  const sort = getSortScores(power, roleFit, risk, popularity, confidence);

  return {
    schemaVersion: RANKING_SCHEMA_VERSION,
    pipelineVersion: RANKING_PIPELINE_VERSION,
    rulesetVersion: RANKING_RULESET_VERSION,
    generatedAt,
    inputHash,
    rating,
    scope,
    risk,
    bestRole,
    roleFit,
    confidence,
    popularity,
    constraint: {
      requiredForPrimary: constraintRequired,
      reason: constraintRequired ? "expansive scope with high risk" : "",
      suggestedConstraintTypes: constraintRequired ? ["range", "cooldown", "line-of-sight", "emotional-cost"] : []
    },
    sort,
    quality,
    content: contentProfile,
    evidenceSummary: [
      `${scope} scope`,
      `${risk.level} risk`,
      `${bestRole} fit`,
      `${confidence.label} confidence`
    ],
    evidence
  };
}

export function stripRankingAudit(ranking) {
  return {
    schemaVersion: ranking.schemaVersion,
    rating: ranking.rating,
    scope: ranking.scope,
    risk: {
      level: ranking.risk.level,
      tags: ranking.risk.tags
    },
    bestRole: ranking.bestRole,
    confidence: {
      label: ranking.confidence.label
    },
    popularity: {
      label: ranking.popularity.label
    },
    constraint: {
      requiredForPrimary: ranking.constraint.requiredForPrimary,
      reason: ranking.constraint.reason,
      suggestedConstraintTypes: ranking.constraint.suggestedConstraintTypes
    },
    content: {
      defaultVisible: ranking.content.defaultVisible,
      reasons: ranking.content.reasons,
      moderationReason: ranking.content.moderationReason
    },
    evidenceSummary: ranking.evidenceSummary
  };
}

function titleCase(value) {
  return String(value || "")
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function getPowerRankingDisplay(power, recommendedSlot = null, scope = null) {
  const riskScore = power.ranking?.risk?.score ?? power.stats?.risk ?? 5;
  const riskLevel = power.ranking?.risk?.level ?? getRiskLevel(riskScore);
  const bestRole = power.ranking?.bestRole ?? recommendedSlot?.slotId ?? "secondary";
  const confidence = power.ranking?.confidence?.label ?? (power.source === "canon" ? "strong" : "inferred");

  return {
    rating: power.ranking?.rating ?? power.tier ?? "core",
    scope: power.ranking?.scope ?? scope?.id ?? "focused",
    scopeLabel: scope?.label ?? titleCase(power.ranking?.scope ?? "focused"),
    riskLevel,
    riskLabel: `${titleCase(riskLevel)} Risk`,
    bestRole,
    bestRoleLabel: titleCase(bestRole),
    confidence,
    confidenceLabel: titleCase(confidence),
    popularityLabel: power.ranking?.popularity?.label ? titleCase(power.ranking.popularity.label) : null,
    constraintRequired: Boolean(power.ranking?.constraint?.requiredForPrimary)
  };
}
