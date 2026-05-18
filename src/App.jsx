import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Check,
  Clipboard,
  Cpu,
  Database,
  Dumbbell,
  EyeOff,
  Filter,
  Flame,
  Globe2,
  Hammer,
  Info,
  Layers,
  Leaf,
  ListChecks,
  Plus,
  Search,
  Shield,
  Sparkles,
  Trash2,
  UserRound,
  Wind,
  X,
  Zap
} from "lucide-react";

import { DATA_SOURCE_STRATEGIES } from "./data/dataSources.js";
import { getDataSourceRoadmap } from "./utils/dataSourceModel.js";
import {
  HERO_SLOTS,
  ORIGIN_SOURCES,
  assignPowerToSlot,
  buildHeroDraft,
  clearHeroSlot,
  createOriginSource,
  createEmptyHeroBuild,
  findPowerSlot,
  formatHeroSheet,
  getHeroBuildPowers,
  removePowerFromBuild
} from "./utils/heroBuilder.js";
import {
  LIBRARY_PREVIEW_LIMIT,
  LIBRARY_PAGE_SIZES,
  LIBRARY_SORTS,
  buildCanonLibrary,
  buildImportedLibrary,
  filterLibrary,
  getLibraryCategoryCounts,
  getLibrarySourceCounts,
  getLibrarySubcategoryCounts,
  getPowerScope,
  getRecommendedSlot,
  mergeLibraries
} from "./utils/powerLibrary.js";
import { appLogger, serializeError } from "./utils/logger.js";
import { getPowerRankingDisplay } from "./utils/rankingModel.js";
import {
  SAVED_DRAFT_SCHEMA_VERSION,
  getPublishedImportedRecords,
  getVisibleEnrichedPowers,
  normalizeSavedDrafts
} from "./utils/runtimeGuards.js";

// ---------------------------------------------------------------------------
// Static config
// ---------------------------------------------------------------------------

const POWER_SLOTS = HERO_SLOTS.filter((slot) => slot.id !== "origin");
const MAX_POWER_SELECTIONS = POWER_SLOTS.reduce((total, slot) => total + (slot.limit ?? 1), 0);

const CATEGORY_ICON = {
  physical: Dumbbell,
  elemental: Flame,
  psychic: Brain,
  energy: Zap,
  mobility: Wind,
  biological: Leaf,
  tech: Cpu,
  mystic: Sparkles,
  cosmic: Globe2,
  stealth: EyeOff
};

const STAT_LABELS = {
  offense: "Offense",
  defense: "Defense",
  mobility: "Mobility",
  utility: "Utility",
  control: "Control",
  risk: "Risk"
};

const STAT_FILTERS = [
  { id: "offense", label: "Min Offense", mode: "min" },
  { id: "defense", label: "Min Defense", mode: "min" },
  { id: "mobility", label: "Min Mobility", mode: "min" },
  { id: "utility", label: "Min Utility", mode: "min" },
  { id: "control", label: "Min Control", mode: "min" },
  { id: "risk", label: "Max Risk", mode: "max" }
];

const DEFAULT_STAT_FILTERS = {
  offense: 1,
  defense: 1,
  mobility: 1,
  utility: 1,
  control: 1,
  risk: 10
};

const DEFAULT_LIBRARY_SORT = "slotFit";
const SAVED_DRAFTS_KEY = "powers-forge:saved-drafts";

const TIER_OPTIONS = [
  { id: "all", label: "All tiers" },
  { id: "core", label: "Core" },
  { id: "advanced", label: "Advanced" },
  { id: "legendary", label: "Legendary" }
];

const SOURCE_OPTIONS = [
  { id: "all", label: "All sources" },
  { id: "canon", label: "Canon" },
  { id: "imported", label: "Imported" }
];

const SLOT_FIT_OPTIONS = [
  { id: "all", label: "All fits" },
  { id: "primary", label: "Primary" },
  { id: "secondary", label: "Secondary" },
  { id: "utility", label: "Utility" }
];

const VIEWS = [
  { id: "forge", label: "Hero Forge", icon: Hammer },
  { id: "taxonomy", label: "Taxonomy", icon: Layers },
  { id: "sources", label: "Data Sources", icon: Database }
];

const RANKING_DISTRIBUTION_LABELS = {
  rating: "Rating",
  risk: "Risk",
  bestRole: "Best role",
  confidence: "Confidence"
};

function formatDistributionLabel(value) {
  return String(value || "")
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

// ---------------------------------------------------------------------------
// Hook: load + normalize imported power pool once
// ---------------------------------------------------------------------------

function useImportedLibrary() {
  const [state, setState] = useState({
    status: "loading",
    powers: [],
    manifest: null,
    rankingManifest: null,
    source: null
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [enrichedResponse, poolResponse, manifestResponse, rankingManifestResponse] = await Promise.all([
          fetch("/data/superpower-list-enriched.json"),
          fetch("/data/superpower-list-pool.json"),
          fetch("/data/superpower-list-manifest.json"),
          fetch("/data/superpower-list-ranking-manifest.json")
        ]);

        if (!manifestResponse.ok) throw new Error(`manifest ${manifestResponse.status}`);
        const manifest = await manifestResponse.json();
        const rankingManifest = rankingManifestResponse.ok
          ? await rankingManifestResponse.json()
          : null;
        let powers = [];
        let source = "enriched";

        if (enrichedResponse.ok) {
          const enriched = await enrichedResponse.json();
          powers = getVisibleEnrichedPowers(enriched);
        }

        if (powers.length === 0) {
          if (!poolResponse.ok) throw new Error(`pool ${poolResponse.status}`);
          const rawPool = await poolResponse.json();
          const published = getPublishedImportedRecords(rawPool);
          powers = buildImportedLibrary(published);
          source = "pool";
          appLogger.warn("imported_library_enriched_fallback", {
            reason: enrichedResponse.ok ? "no-visible-enriched-powers" : `enriched ${enrichedResponse.status}`
          });
        }

        if (!cancelled) {
          setState({ status: "ready", powers, manifest, rankingManifest, source });
        }
      } catch (error) {
        appLogger.error("imported_library_load_failed", {
          error: serializeError(error)
        });
        if (!cancelled) {
          setState({ status: "error", powers: [], manifest: null, rankingManifest: null, error });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

function loadSavedDrafts() {
  try {
    const raw = window.localStorage.getItem(SAVED_DRAFTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return normalizeSavedDrafts(parsed);
  } catch (error) {
    appLogger.warn("saved_drafts_load_failed", {
      error: serializeError(error)
    });
    return [];
  }
}

function getSlotCount(heroBuild, slot) {
  const value = heroBuild[slot.id];
  return Array.isArray(value) ? value.length : value ? 1 : 0;
}

function getNextSlotId(heroBuild, assignedSlotId) {
  if (assignedSlotId === "primary") return "secondary";
  if (assignedSlotId === "secondary") {
    const secondary = POWER_SLOTS.find((slot) => slot.id === "secondary");
    return getSlotCount(heroBuild, secondary) < secondary.limit ? "secondary" : "utility";
  }

  const nextOpenSlot = POWER_SLOTS.find((slot) => getSlotCount(heroBuild, slot) < (slot.limit ?? 1));
  return nextOpenSlot?.id ?? assignedSlotId;
}

// ---------------------------------------------------------------------------
// Small presentational pieces
// ---------------------------------------------------------------------------

function StatMeter({ statKey, value }) {
  const isRisk = statKey === "risk";
  const width = `${Math.min(100, Math.max(0, value * 10))}%`;
  return (
    <div className={`stat-meter${isRisk ? " stat-meter--risk" : ""}`}>
      <span className="stat-meter__label">{STAT_LABELS[statKey]}</span>
      <span className="stat-meter__value">{value}</span>
      <div className="stat-meter__track" aria-hidden="true">
        <span style={{ width }} />
      </div>
    </div>
  );
}

function SlotStrip({ heroBuild, activeSlot, onActiveSlotChange }) {
  const selectedCount = POWER_SLOTS.reduce((total, slot) => total + getSlotCount(heroBuild, slot), 0);

  return (
    <div className="slot-strip-wrap">
      <div className="slot-strip__summary">
        <span>Power slots</span>
        <strong>{selectedCount}/{MAX_POWER_SELECTIONS} powers</strong>
      </div>
      <div className="slot-strip" aria-label="Choose which hero slot receives selected powers">
        {POWER_SLOTS.map((slot) => {
          const count = getSlotCount(heroBuild, slot);
          const limit = slot.limit ?? 1;
          return (
            <button
              className={activeSlot === slot.id ? "is-active" : undefined}
              key={slot.id}
              onClick={() => onActiveSlotChange(slot.id)}
              type="button"
              title={slot.description}
            >
              <span>{slot.shortLabel}</span>
              <strong>{count}/{limit}</strong>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PowerCard({
  power,
  assignedSlot,
  activeSlot,
  fitsOrigin,
  isCompared,
  isDetailsOpen,
  onAssign,
  onToggleCompare,
  onToggleDetails,
  onCloseDetails
}) {
  const Icon = CATEGORY_ICON[power.category] ?? Sparkles;
  const cardStyle = { "--card-accent": power.categoryAccent };
  const sourceLabel = power.source === "canon" ? "Canon" : "Imported";
  const isSelected = Boolean(assignedSlot);
  const recommendedSlot = getRecommendedSlot(power);
  const scope = getPowerScope(power);
  const ranking = getPowerRankingDisplay(power, recommendedSlot, scope);
  const activeSlotLabel = HERO_SLOTS.find((slot) => slot.id === activeSlot)?.shortLabel ?? "slot";
  const assignedSlotLabel = HERO_SLOTS.find((slot) => slot.id === assignedSlot)?.shortLabel ?? "In draft";
  const quickSlotIds = ["primary", "secondary", "utility"];
  const quickSlots = quickSlotIds
    .map((slotId) => HERO_SLOTS.find((slot) => slot.id === slotId))
    .filter(Boolean);
  const detailId = `power-details-${power.id.replace(/[^a-z0-9_-]/gi, "-")}`;

  return (
    <article
      className={`power-card${isSelected ? " is-selected" : ""}`}
      style={cardStyle}
    >
      <header className="power-card__header">
        <div className="power-card__identity">
          <div className="power-card__identity-row">
            <span className="power-card__icon" aria-hidden="true">
              <Icon size={18} />
            </span>
            <h3>{power.name}</h3>
          </div>
          <p>{power.categoryName} · {power.role}</p>
        </div>
      </header>

      <div className="power-card__meta-row">
        {fitsOrigin && (
          <span className="power-card__origin-fit">
            Fits origin
          </span>
        )}
        <span className="power-card__fit" data-slot={ranking.bestRole}>
          {ranking.bestRoleLabel} Fit
        </span>
        <span className="power-card__scope" data-scope={ranking.scope}>
          {ranking.scopeLabel}
        </span>
        <span className="power-card__source" data-source={power.source}>
          {sourceLabel}
        </span>
        <span className="power-card__chip" data-tier={ranking.rating}>{ranking.rating}</span>
        <span className="power-card__score" data-risk={ranking.riskLevel}>{ranking.riskLabel}</span>
        <span className="power-card__chip">{ranking.confidenceLabel}</span>
        {ranking.constraintRequired && (
          <span className="power-card__scope" data-scope="expansive">Needs Constraint</span>
        )}
      </div>
      <p className="power-card__fit-reason">{recommendedSlot.reason}</p>

      <p className="power-card__summary">{power.summary || power.description}</p>

      <div className="skill-card__stats">
        {Object.entries(power.stats).map(([key, value]) => (
          <StatMeter key={key} statKey={key} value={value} />
        ))}
      </div>

      {(power.strengths[0] || power.weaknesses[0]) && (
        <div className="power-card__footer">
          {power.strengths[0] && (
            <div className="power-card__footer-cell">
              <span>Boost</span>
              <strong>{power.strengths[0]}</strong>
            </div>
          )}
          {power.weaknesses[0] && (
            <div className="power-card__footer-cell power-card__footer-cell--risk">
              <span>Risk</span>
              <strong>{power.weaknesses[0]}</strong>
            </div>
          )}
        </div>
      )}

      <div className="power-card__actions">
        <button
          type="button"
          className={`select-power${isSelected ? " is-selected" : ""}`}
          onClick={() => onAssign(power, activeSlot)}
          title={`Assign ${power.name} to ${activeSlotLabel}`}
        >
          {isSelected ? (
            <>
              <Check size={16} /> {assignedSlotLabel}
            </>
          ) : (
            <>
              <Plus size={16} /> Set {activeSlotLabel}
            </>
          )}
        </button>
        <button
          type="button"
          className={`compare-power${isCompared ? " is-selected" : ""}`}
          onClick={() => onToggleCompare(power)}
          aria-pressed={isCompared}
        >
          Compare
        </button>
      </div>

      <div className={`power-card__details${isDetailsOpen ? " is-open" : ""}`}>
        <button
          type="button"
          className="power-card__details-trigger"
          aria-expanded={isDetailsOpen}
          aria-controls={detailId}
          onClick={() => onToggleDetails(power.id)}
        >
          <Info size={14} aria-hidden="true" /> {isDetailsOpen ? "Hide details" : "Full details"}
        </button>
        {isDetailsOpen && (
          <div id={detailId} className="power-detail-popover">
            <div className="power-detail-popover__header">
              <strong>Complete power card</strong>
              <button type="button" onClick={() => onCloseDetails(power.id)}>
                <X size={14} aria-hidden="true" /> Close
              </button>
            </div>
            <div className="power-detail-popover__section">
              <span>Description</span>
              <p>{power.description || power.summary}</p>
            </div>
            <div className="power-detail-popover__grid">
              <div>
                <span>Best use</span>
                <p>{ranking.bestRoleLabel}: {recommendedSlot.reason}. {scope.guidance}</p>
              </div>
              <div>
                <span>Role</span>
                <p>{power.categoryName} · {power.role} · {power.tier}</p>
              </div>
            </div>
            {power.source === "imported" && (
              <div className="power-detail-popover__notice">
                Imported from the Superpower List Database. Ranking labels are inferred guidance, not reviewed canon.
              </div>
            )}
            <div className="power-detail-popover__lists">
              <div>
                <span>Strengths</span>
                <ul>
                  {(power.strengths.length > 0 ? power.strengths : ["No strengths listed."]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span>Risks</span>
                <ul>
                  {(power.weaknesses.length > 0 ? power.weaknesses : ["No risks listed."]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span>Counters</span>
                <ul>
                  {(power.counters.length > 0 ? power.counters : ["No counters listed."]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span>Tags</span>
                <div className="power-detail-tags">
                  {(power.tags.length > 0 ? power.tags : [power.category, power.tier]).map((tag) => (
                    <strong key={tag}>{tag}</strong>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="power-card__quick-slots" aria-label={`Assign ${power.name} directly to a hero role`}>
        <span>Assign to</span>
        <div>
          {quickSlots.map((slot) => {
            const isAssignedSlot = assignedSlot === slot.id;
            const isRecommendedSlot = recommendedSlot.slotId === slot.id;
            const className = [
              isAssignedSlot ? "is-assigned" : "",
              isRecommendedSlot ? "is-recommended" : ""
            ].filter(Boolean).join(" ");

            return (
              <button
                key={slot.id}
                type="button"
                className={className || undefined}
                onClick={() => onAssign(power, slot.id)}
                title={`Assign ${power.name} to ${slot.shortLabel}`}
              >
                {slot.shortLabel}
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function CategoryRail({
  categoryCounts,
  active,
  onSelect,
  totalAll
}) {
  return (
    <nav className="category-rail" aria-label="Power categories">
      <button
        type="button"
        className={`category-pill${active === "all" ? " is-active" : ""}`}
        onClick={() => onSelect("all")}
      >
        <Layers size={16} />
        <span>All categories</span>
        <strong>{totalAll}</strong>
      </button>
      {categoryCounts.map((category) => {
        const Icon = CATEGORY_ICON[category.id] ?? Sparkles;
        const isActive = active === category.id;
        const disabled = category.count === 0;
        return (
          <button
            key={category.id}
            type="button"
            className={`category-pill${isActive ? " is-active" : ""}`}
            onClick={() => !disabled && onSelect(category.id)}
            disabled={disabled}
            style={{ "--category-accent": category.accent }}
          >
            <Icon size={16} />
            <span>{category.name}</span>
            <strong>{category.count}</strong>
          </button>
        );
      })}
    </nav>
  );
}

function SubcategoryRail({ category, subcategoryCounts, active, onSelect }) {
  if (category === "all" || subcategoryCounts.length === 0) return null;

  return (
    <div className="subcategory-panel" aria-label="Power subcategories">
      <div className="subcategory-panel__heading">
        <p className="eyebrow">Category Focus</p>
        <h3>Narrow this category</h3>
      </div>
      <div className="subcategory-chip-row">
        <button
          type="button"
          className={`subcategory-chip${active === "all" ? " is-active" : ""}`}
          onClick={() => onSelect("all")}
        >
          All
        </button>
        {subcategoryCounts.map((subcategory) => (
          <button
            type="button"
            key={subcategory.id}
            className={`subcategory-chip${active === subcategory.id ? " is-active" : ""}`}
            disabled={subcategory.count === 0}
            onClick={() => onSelect(subcategory.id)}
          >
            <span>{subcategory.label}</span>
            <strong>{subcategory.count}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}

function CompareTray({ comparedPowers, activeSlot, onAssignPower, onRemove, onClear }) {
  if (comparedPowers.length === 0) return null;
  const activeSlotLabel = HERO_SLOTS.find((slot) => slot.id === activeSlot)?.shortLabel ?? "slot";
  const quickSlots = HERO_SLOTS.filter((slot) => ["primary", "secondary", "utility"].includes(slot.id));

  return (
    <section className="compare-tray" aria-label="Power comparison">
      <div className="compare-tray__header">
        <div>
          <p className="eyebrow">Compare</p>
          <h3>{comparedPowers.length}/4 powers pinned</h3>
        </div>
        <button type="button" onClick={onClear}>Clear compare</button>
      </div>
      <div className="compare-grid">
        {comparedPowers.map((power) => (
          <article key={power.id} className="compare-card" style={{ "--card-accent": power.categoryAccent }}>
            <header>
              <div>
                <h4>{power.name}</h4>
                <p>{power.categoryName} · {power.role}</p>
              </div>
              <button type="button" onClick={() => onRemove(power.id)} aria-label={`Remove ${power.name} from compare`}>
                <X size={14} />
              </button>
            </header>
            <div className="compare-card__stats">
              {Object.entries(power.stats).map(([key, value]) => (
                <span key={key}>
                  {STAT_LABELS[key]}
                  <strong>{value}</strong>
                </span>
              ))}
            </div>
            <div className="compare-card__actions">
              <button type="button" className="select-power" onClick={() => onAssignPower(power, activeSlot)}>
                <Plus size={14} /> Set {activeSlotLabel}
              </button>
              <div className="compare-card__quick-slots" aria-label={`Assign ${power.name} directly from compare`}>
                {quickSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => onAssignPower(power, slot.id)}
                  >
                    {slot.shortLabel}
                  </button>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Power Library (single grid for canon + imported)
// ---------------------------------------------------------------------------

function PowerLibrary({
  library,
  categoryCounts,
  subcategoryCounts,
  sourceCounts,
  assignedSlotById,
  comparedIds,
  comparedPowers,
  heroBuild,
  originCategoryLabels,
  prioritizeOriginFit,
  onPrioritizeOriginFitChange,
  activeSlot,
  onActiveSlotChange,
  onAssignPower,
  onToggleCompare,
  onRemoveCompare,
  onClearCompare,
  query,
  onQueryChange,
  category,
  onCategoryChange,
  subcategory,
  onSubcategoryChange,
  tier,
  onTierChange,
  source,
  onSourceChange,
  slotFit,
  onSlotFitChange,
  sortBy,
  onSortChange,
  statFilters,
  onStatFilterChange,
  onClearFilters,
  hasActiveFilters,
  reviewSlot,
  onClearReview,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  hasNextPage,
  hasPreviousPage,
  totalMatches,
  visible,
  importedStatus,
  assignmentNotice
}) {
  const showingImported = importedStatus !== "ready";
  const [openPowerDetailsId, setOpenPowerDetailsId] = useState(null);
  const reviewSlotLabel = reviewSlot === "all"
    ? "All selected powers"
    : HERO_SLOTS.find((slot) => slot.id === reviewSlot)?.label;
  const originCategoryIds = heroBuild.origin?.preferredCategories ?? [];
  const hasOriginBias = originCategoryIds.length > 0;

  useEffect(() => {
    setOpenPowerDetailsId(null);
  }, [activeSlot, category, page, query, reviewSlot, slotFit, sortBy, source, subcategory, tier]);

  function togglePowerDetails(powerId) {
    setOpenPowerDetailsId((current) => (current === powerId ? null : powerId));
  }

  function closePowerDetails(powerId) {
    setOpenPowerDetailsId((current) => (current === powerId ? null : current));
  }

  return (
    <section className="panel catalog-panel" aria-label="Power library">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Unified Power Library</p>
          <h2>Browse, filter, and pick powers</h2>
        </div>
        <p className="catalog-summary">
          <strong>{visible.length}</strong> shown of <strong>{totalMatches}</strong>
          {" matches"} · page <strong>{page}</strong>/<strong>{totalPages}</strong> · canon <strong>{sourceCounts.canon || 0}</strong> · imported{" "}
          <strong>{sourceCounts.imported || 0}</strong>
        </p>
      </div>

      {reviewSlot && (
        <div className="review-filter-banner" role="status">
          <div>
            <strong>Reviewing {reviewSlotLabel}</strong>
            <span>
              {reviewSlot === "all"
                ? "Showing every power currently assigned to the hero."
                : "Showing only powers already assigned to this slot."}
            </span>
          </div>
          <button type="button" onClick={onClearReview}>Back to browsing</button>
        </div>
      )}

      {assignmentNotice && (
        <div className="assignment-status" role="status" aria-live="polite">
          <Check size={14} aria-hidden="true" />
          <span>{assignmentNotice}</span>
        </div>
      )}

      <div className="toolbar">
        <label className="search-field">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by name, tag, strength, or weakness…"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>
        <div className="pill-group" role="group" aria-label="Source">
          {SOURCE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={source === option.id ? "is-active" : undefined}
              onClick={() => onSourceChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <CategoryRail
        categoryCounts={categoryCounts}
        active={category}
        onSelect={(categoryId) => {
          onSlotFitChange("all");
          onCategoryChange(categoryId);
        }}
        totalAll={library.length}
      />

      <SubcategoryRail
        category={category}
        subcategoryCounts={subcategoryCounts}
        active={subcategory}
        onSelect={onSubcategoryChange}
      />

      {hasOriginBias && (
        <div className="origin-bias-panel" role="status">
          <div>
            <span>Power origin</span>
            <strong>{heroBuild.origin.name}</strong>
            <p>Suggested categories: {originCategoryLabels.join(", ")}</p>
          </div>
          <label>
            <input
              type="checkbox"
              checked={prioritizeOriginFit}
              onChange={(event) => onPrioritizeOriginFitChange(event.target.checked)}
            />
            Prioritize origin-matched powers
          </label>
        </div>
      )}

      <SlotStrip
        heroBuild={heroBuild}
        activeSlot={activeSlot}
        onActiveSlotChange={onActiveSlotChange}
      />

      <div className="slot-guidance">
        <div>
          <strong>Primary</strong>
          <span>Signature power. Usually offense, control, or the concept people remember.</span>
        </div>
        <div>
          <strong>Secondary</strong>
          <span>Combo powers. Add up to 3 supports that broaden the hero without replacing the signature.</span>
        </div>
        <div>
          <strong>Utility</strong>
          <span>Practical power. Movement, rescue, scouting, defense, investigation, or support.</span>
        </div>
      </div>

      <div className="slot-fit-filter" aria-label="Filter by recommended hero role">
        <span>Show powers best as</span>
        <div className="pill-group pill-group--wrap" role="group" aria-label="Recommended role">
          {SLOT_FIT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={slotFit === option.id ? "is-active" : undefined}
              onClick={() => onSlotFitChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <CompareTray
        comparedPowers={comparedPowers}
        activeSlot={activeSlot}
        onAssignPower={onAssignPower}
        onRemove={onRemoveCompare}
        onClear={onClearCompare}
      />

      <div className="toolbar toolbar--stacked" role="group" aria-label="Tier and sort">
        <div className="pill-group" aria-label="Tier">
          {TIER_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={tier === option.id ? "is-active" : undefined}
              onClick={() => onTierChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="pill-group pill-group--wrap" aria-label="Sort">
          {LIBRARY_SORTS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={sortBy === option.id ? "is-active" : undefined}
              onClick={() => onSortChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="stat-filter-panel" aria-label="Stat filters">
        <div className="stat-filter-panel__header">
          <div>
            <p className="eyebrow">Stat Filters</p>
            <h3>Shape the pool before paging</h3>
          </div>
          <button type="button" onClick={onClearFilters} disabled={!hasActiveFilters}>
            Clear filters
          </button>
        </div>
        <div className="stat-filter-grid">
          {STAT_FILTERS.map((filter) => (
            <label key={filter.id} className="stat-filter">
              <span>
                {filter.label}
                <strong>{statFilters[filter.id]}</strong>
              </span>
              <input
                type="range"
                min="1"
                max="10"
                value={statFilters[filter.id]}
                onChange={(event) => onStatFilterChange(filter.id, Number(event.target.value))}
              />
            </label>
          ))}
        </div>
      </div>

      {importedStatus === "loading" && (
        <p className="catalog-summary" role="status">
          Loading imported power pool…
        </p>
      )}
      {importedStatus === "error" && (
        <p className="catalog-summary" role="status">
          <AlertTriangle size={14} /> Could not load imported pool. Showing canon only.
        </p>
      )}

      {visible.length === 0 ? (
        <div className="empty-state">
          <Filter size={28} />
          <h2>No powers match those filters</h2>
          <p>Clear a filter or try a different search term.</p>
          <button type="button" onClick={onClearFilters}>Clear filters</button>
        </div>
      ) : (
        <div className="skill-grid">
          {visible.map((power) => (
            <PowerCard
              key={power.id}
              power={power}
              assignedSlot={assignedSlotById.get(power.id)}
              fitsOrigin={originCategoryIds.includes(power.category)}
              isCompared={comparedIds.has(power.id)}
              isDetailsOpen={openPowerDetailsId === power.id}
              activeSlot={activeSlot}
              onAssign={onAssignPower}
              onToggleCompare={onToggleCompare}
              onToggleDetails={togglePowerDetails}
              onCloseDetails={closePowerDetails}
            />
          ))}
        </div>
      )}

      {totalMatches > visible.length && (
        <div className="library-pager" role="navigation" aria-label="Power library pagination">
          <p role="status">
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong>
            {showingImported ? " · imported pool still loading" : ""}
          </p>
          <div className="library-pager__controls">
            <label>
              Per page
              <select
                value={pageSize}
                onChange={(event) => onPageSizeChange(Number(event.target.value))}
              >
                {LIBRARY_PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={() => onPageChange(page - 1)} disabled={!hasPreviousPage}>
              Previous
            </button>
            <button type="button" onClick={() => onPageChange(page + 1)} disabled={!hasNextPage}>
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Hero Draft (sticky aside)
// ---------------------------------------------------------------------------

function SlotPowerList({ slot, powers, onRemove, onClearSlot, onReviewSlot }) {
  const isEmpty = powers.length === 0;
  const emptyText = slot.id === "origin" ? "No origin selected." : "No power assigned.";

  return (
    <section className="slot-panel">
      <header>
        <div>
          <h4>{slot.label}</h4>
          <p>{slot.description}</p>
        </div>
        {!isEmpty && (
          <div className="slot-panel__actions">
            <button type="button" onClick={() => onReviewSlot(slot.id)}>
              Review
            </button>
            <button type="button" onClick={() => onClearSlot(slot.id)}>
              Clear
            </button>
          </div>
        )}
      </header>
      {isEmpty ? (
        <p className="slot-empty">{emptyText}</p>
      ) : (
        <ul className="selected-power-list">
          {powers.map((power) => (
            <li key={power.id} className="selected-power">
              <span>{power.categoryName}</span>
              <strong>{power.name}</strong>
              <p>{power.summary}</p>
              <button
                type="button"
                onClick={() => onRemove(power)}
                aria-label={`Remove ${power.name}`}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DraftCoach({ draft, heroBuild, primaryScope, onFocusSlot }) {
  const modelRecommendation = draft.recommendations?.[0];
  const fallbackStep = draft.checklist.find((step) => !step.complete);
  const hasExpansivePrimary = primaryScope?.id === "expansive" && draft.weaknesses.length === 0 && !heroBuild.storyConstraint?.trim();
  const focusStep = modelRecommendation ?? fallbackStep;
  const isComplete = !focusStep;
  const isStoryStep = focusStep?.slotId === "all";

  return (
    <section className={`draft-coach${isComplete ? " is-complete" : ""}`} aria-label="Next hero build action">
      <div>
        <p className="eyebrow">{isComplete ? "Forge Review" : hasExpansivePrimary ? "Balance Warning" : "Next Best Step"}</p>
        <h3>{isComplete ? "Hero sheet is structurally complete" : focusStep.label}</h3>
        <p>
          {isComplete
            ? "Review the full loadout, tighten the name, and export the sheet when the story rules feel clear."
            : focusStep.detail}
        </p>
      </div>
      <div className="draft-coach__actions">
        <button
          type="button"
          onClick={() => onFocusSlot(isComplete || isStoryStep ? "all" : focusStep.slotId, isComplete || isStoryStep ? "review" : "browse")}
        >
          {isComplete || isStoryStep ? "Review draft" : "Browse this slot"} <ArrowRight size={14} />
        </button>
        {draft.selectedCount > 0 && (
          <button type="button" onClick={() => onFocusSlot("all", "review")}>
            Review draft
          </button>
        )}
      </div>
    </section>
  );
}

function RecommendationPanel({ recommendations, onFocusSlot }) {
  return (
    <section className="recommendation-panel" aria-label="Hero build recommendations">
      <div className="builder-panel-heading">
        <h3>Action plan</h3>
        <span>{recommendations.length}</span>
      </div>
      <ol>
        {recommendations.map((item) => (
          <li key={item.id} data-priority={item.priority}>
            <div>
              <span>{item.priority}</span>
              <strong>{item.label}</strong>
              <p>{item.detail}</p>
            </div>
            <button
              type="button"
              onClick={() => onFocusSlot(item.slotId, item.slotId === "all" ? "review" : "browse")}
            >
              {item.slotId === "all" ? "Review" : "Browse"}
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

function LoadoutMap({ heroBuild, onFocusSlot }) {
  return (
    <section className="loadout-map" aria-label="Current hero loadout map">
      <div className="builder-panel-heading">
        <h3>Loadout map</h3>
        <button type="button" onClick={() => onFocusSlot("all", "review")} disabled={getHeroBuildPowers(heroBuild).length === 0}>
          Review all
        </button>
      </div>
      <div className="loadout-map__grid">
        {HERO_SLOTS.map((slot) => {
          const value = heroBuild[slot.id];
          const powers = Array.isArray(value) ? value : [value].filter(Boolean);
          const label = powers.length > 0
            ? powers.map((power) => power.name).join(", ")
            : "Unassigned";
          const isComplete = powers.length > 0;
          return (
            <button
              key={slot.id}
              type="button"
              className={isComplete ? "is-complete" : undefined}
              onClick={() => onFocusSlot(slot.id, isComplete ? "review" : "browse")}
            >
              <span>{slot.shortLabel}</span>
              <strong>{label}</strong>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function OriginSourcePicker({ value, onSelect, onClear }) {
  return (
    <section
      id="origin-source-picker"
      className="origin-source-panel"
      aria-label="Origin source"
      tabIndex="-1"
    >
      <header>
        <div>
          <p className="eyebrow">Origin Source</p>
          <h3>How did they get their powers?</h3>
        </div>
        {value && (
          <button type="button" onClick={onClear}>Clear</button>
        )}
      </header>
      <div className="origin-source-grid">
        {ORIGIN_SOURCES.map((origin) => {
          const isActive = value?.id === `origin:${origin.id}`;
          return (
            <button
              key={origin.id}
              type="button"
              className={isActive ? "is-active" : undefined}
              onClick={() => onSelect(origin.id)}
            >
              <strong>{origin.name}</strong>
              <span>{origin.summary}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function HeroDraftPanel({
  heroBuild,
  savedDrafts,
  onSaveDraft,
  onLoadDraft,
  onDeleteDraft,
  onRemove,
  onClear,
  onClearSlot,
  onFocusSlot,
  onSetAlias,
  onSetProfileField,
  onSetOriginSource
}) {
  const draft = useMemo(() => buildHeroDraft(heroBuild), [heroBuild]);
  const exportText = useMemo(() => formatHeroSheet(draft), [draft]);
  const primaryScope = useMemo(
    () => (heroBuild.primary ? getPowerScope(heroBuild.primary) : null),
    [heroBuild.primary]
  );
  const [copyStatus, setCopyStatus] = useState("idle");

  async function copyExportText() {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  useEffect(() => {
    if (copyStatus === "idle") return undefined;
    const timeout = window.setTimeout(() => setCopyStatus("idle"), 1800);
    return () => window.clearTimeout(timeout);
  }, [copyStatus]);

  return (
    <section className="hero-builder" aria-label="Hero draft">
      <header className="builder-summary">
        <div>
          <p className="eyebrow">Hero Forge</p>
          <h2>{draft.heroName}</h2>
          <p>{draft.readiness}</p>
        </div>
        <div className="builder-id">
          <UserRound size={18} aria-hidden="true" />
          <span>Classification</span>
          <strong>{draft.classification}</strong>
          <p>
            {draft.filledSlots}/{HERO_SLOTS.length} slots · {draft.selectedCount} powers · canon {draft.canonCount} ·
            imported {draft.importedCount}
          </p>
        </div>
        {primaryScope && (
          <div className="builder-scope" data-scope={primaryScope.id}>
            <span>Primary scope</span>
            <strong>{primaryScope.label}</strong>
            <p>{primaryScope.guidance}</p>
          </div>
        )}
      </header>

      <div className="builder-grid">
        <div className="builder-selection">
          <DraftCoach
            draft={draft}
            heroBuild={heroBuild}
            primaryScope={primaryScope}
            onFocusSlot={onFocusSlot}
          />

          <OriginSourcePicker
            value={heroBuild.origin}
            onSelect={onSetOriginSource}
            onClear={() => onClearSlot("origin")}
          />

          <div className="build-checklist" aria-label="Hero build checklist">
            <div className="builder-panel-heading">
              <h3>Build path</h3>
              <span>{draft.checklist.filter((step) => step.complete).length}/{draft.checklist.length}</span>
            </div>
            <button
              type="button"
              className="review-all-powers"
              onClick={() => onFocusSlot("all", "review")}
              disabled={draft.selectedCount === 0}
            >
              Review all selected powers
            </button>
            <ol>
              {draft.checklist.map((step) => (
                <li key={step.id} className={step.complete ? "is-complete" : undefined}>
                  <span aria-hidden="true">{step.complete ? <Check size={13} /> : step.label.slice(0, 1)}</span>
                  <div>
                    <strong>{step.label}</strong>
                    <p>{step.detail}</p>
                  </div>
                  <button type="button" onClick={() => onFocusSlot(step.slotId, step.complete ? "review" : "browse")}>
                    {step.complete ? "Review" : "Browse"}
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="builder-panel-heading">
            <h3>Selected powers</h3>
            <span>{draft.selectedCount}</span>
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={draft.selectedCount === 0}
            >
              Save draft
            </button>
            <button
              type="button"
              onClick={onClear}
              disabled={draft.selectedCount === 0}
            >
              Clear all
            </button>
          </div>

          {draft.selectedCount === 0 ? (
            <div className="builder-empty">
              <ListChecks size={26} aria-hidden="true" />
              <p>Pick a slot, then assign powers from the library to build a structured hero.</p>
            </div>
          ) : (
            <div className="slot-stack">
              {HERO_SLOTS.map((slot) => {
                const value = heroBuild[slot.id];
                const powers = Array.isArray(value) ? value : [value].filter(Boolean);
                return (
                  <SlotPowerList
                    key={slot.id}
                    slot={slot}
                    powers={powers}
                    onRemove={onRemove}
                    onClearSlot={onClearSlot}
                    onReviewSlot={(slotId) => onFocusSlot(slotId, "review")}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="builder-output">
          <div className="builder-panel-heading">
            <h3>Profile</h3>
            <span>aggregate</span>
          </div>

          <LoadoutMap heroBuild={heroBuild} onFocusSlot={onFocusSlot} />

          <RecommendationPanel recommendations={draft.recommendations} onFocusSlot={onFocusSlot} />

          <div className="character-sheet">
            <div>
              <span>Alias</span>
              <strong>{draft.characterSheet.alias}</strong>
            </div>
            <div>
              <span>Threat</span>
              <strong>{draft.characterSheet.threatLevel}</strong>
            </div>
            <div>
              <span>Origin</span>
              <strong>{draft.characterSheet.origin}</strong>
            </div>
            <div>
              <span>Primary</span>
              <strong>{draft.characterSheet.powerLoadout.primary}</strong>
            </div>
          </div>

          <div className="identity-editor" aria-label="Editable identity profile">
            <label>
              <span>Civilian name</span>
              <input
                type="text"
                value={heroBuild.civilianName ?? ""}
                placeholder={draft.characterSheet.civilianName}
                onChange={(event) => onSetProfileField("civilianName", event.target.value)}
              />
            </label>
            <label>
              <span>Home base</span>
              <input
                type="text"
                value={heroBuild.homeBase ?? ""}
                placeholder="Unassigned home base"
                onChange={(event) => onSetProfileField("homeBase", event.target.value)}
              />
            </label>
            <label>
              <span>Motivation</span>
              <input
                type="text"
                value={heroBuild.motivation ?? ""}
                placeholder="Why they keep fighting"
                onChange={(event) => onSetProfileField("motivation", event.target.value)}
              />
            </label>
            <label>
              <span>Story constraint</span>
              <input
                type="text"
                value={heroBuild.storyConstraint ?? ""}
                placeholder="Cost, rule, range, cooldown, vow"
                onChange={(event) => onSetProfileField("storyConstraint", event.target.value)}
              />
            </label>
          </div>

          <div className="builder-stat-grid">
            {Object.entries(draft.stats).map(([key, value]) => (
              <StatMeter key={key} statKey={key} value={value} />
            ))}
          </div>

          <div className="quality-panel" aria-label="Build quality">
            <div className="quality-panel__summary">
              <span>Build Quality</span>
              <strong>{draft.quality.overall}</strong>
            </div>
            <div className="quality-metrics">
              {draft.quality.metrics.map((metric) => (
                <div key={metric.id}>
                  <span>
                    {metric.label}
                    <strong>{metric.score}</strong>
                  </span>
                  <div className="quality-meter" aria-hidden="true">
                    <i style={{ width: `${metric.score}%` }} />
                  </div>
                  <p>{metric.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="builder-output-lists">
            <div>
              <h4><Shield size={14} /> Strengths</h4>
              <ul>
                {draft.strengths.length === 0 ? (
                  <li className="quiet">Select powers to surface strengths.</li>
                ) : (
                  draft.strengths.map((item) => <li key={item}>{item}</li>)
                )}
              </ul>
            </div>
            <div>
              <h4><AlertTriangle size={14} /> Limits</h4>
              <ul>
                {draft.weaknesses.length === 0 ? (
                  <li className="quiet">Select powers to surface limits.</li>
                ) : (
                  draft.weaknesses.map((item) => <li key={item}>{item}</li>)
                )}
              </ul>
            </div>
          </div>

          {draft.tags.length > 0 && (
            <div className="builder-tags">
              {draft.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}

          <div className="synergy-panel">
            <div className="synergy-panel__score">
              <span>Synergy</span>
              <strong>{draft.synergy.score}</strong>
            </div>
            <ul>
              {draft.synergy.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
              {draft.synergy.conflicts.map((conflict) => (
                <li className="is-conflict" key={conflict}>{conflict}</li>
              ))}
            </ul>
          </div>

          <div className="interaction-panel" aria-label="Power interactions">
            <div className="builder-panel-heading">
              <h3>Power interactions</h3>
              <span>{draft.interactions.length}</span>
            </div>
            <div className="interaction-list">
              {draft.interactions.map((interaction) => (
                <article key={interaction.id} data-tone={interaction.tone}>
                  <span>{interaction.label}</span>
                  <p>{interaction.text}</p>
                </article>
              ))}
            </div>
          </div>

          <p className="story-hook">
            <span>Story hook</span>
            {draft.characterSheet.storyHook}
          </p>

          <div className="identity-brief">
            {draft.storyBrief.nameCandidates.length > 0 && (
              <div>
                <span>Name options</span>
                <div className="name-option-list">
                  {draft.storyBrief.nameCandidates.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className={draft.heroName === name ? "is-active" : undefined}
                      onClick={() => onSetAlias(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                {heroBuild.alias && (
                  <button type="button" className="name-reset" onClick={() => onSetAlias("")}>
                    Use generated name: {draft.generatedName}
                  </button>
                )}
              </div>
            )}
            <div>
              <span>Name logic</span>
              <p>{draft.storyBrief.nameRationale}</p>
            </div>
            <div>
              <span>Premise</span>
              <p>{draft.storyBrief.premise}</p>
            </div>
            <div>
              <span>First arc</span>
              <p>{draft.storyBrief.arc}</p>
            </div>
            <div>
              <span>Story beats</span>
              <ol className="story-beat-list">
                {draft.storyBrief.beats.map((beat) => (
                  <li key={beat.label}>
                    <strong>{beat.label}</strong>
                    <p>{beat.text}</p>
                  </li>
                ))}
              </ol>
            </div>
            {draft.storyBrief.missing.length > 0 && (
              <div className="identity-brief__missing">
                <span>Missing</span>
                <ul>
                  {draft.storyBrief.missing.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="export-sheet">
            <div className="builder-panel-heading">
              <h3>Export sheet</h3>
              <button
                type="button"
                onClick={copyExportText}
                disabled={draft.selectedCount === 0}
              >
                <Clipboard size={14} /> {copyStatus === "copied" ? "Copied" : copyStatus === "failed" ? "Select text" : "Copy"}
              </button>
            </div>
            <textarea
              readOnly
              value={exportText}
              aria-label="Generated hero character sheet"
            />
          </div>

          <div className="saved-drafts">
            <div className="builder-panel-heading">
              <h3>Saved drafts</h3>
              <span>{savedDrafts.length}</span>
            </div>
            {savedDrafts.length === 0 ? (
              <p className="saved-drafts__empty">Saved hero builds will appear here.</p>
            ) : (
              <ul className="saved-draft-list">
                {savedDrafts.map((savedDraft) => (
                  <li key={savedDraft.id}>
                    <button type="button" onClick={() => onLoadDraft(savedDraft)}>
                      <strong>{savedDraft.name}</strong>
                      <span>{savedDraft.selectedCount} powers · {savedDraft.classification}</span>
                    </button>
                    <button
                      type="button"
                      className="saved-draft-list__delete"
                      onClick={() => onDeleteDraft(savedDraft.id)}
                      aria-label={`Delete ${savedDraft.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Secondary views
// ---------------------------------------------------------------------------

function TaxonomyView({ library, categoryCounts }) {
  return (
    <section className="panel breakdown" aria-label="Power taxonomy">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Reference</p>
          <h2>Category breakdown</h2>
        </div>
        <p className="catalog-summary">
          <strong>{library.length}</strong> powers across{" "}
          <strong>{categoryCounts.length}</strong> categories
        </p>
      </div>
      <div className="breakdown-grid">
        {categoryCounts.map((category) => {
          const Icon = CATEGORY_ICON[category.id] ?? Sparkles;
          return (
            <article
              key={category.id}
              className="breakdown-item"
              style={{ "--category-accent": category.accent }}
            >
              <Icon size={22} aria-hidden="true" />
              <h3>{category.name}</h3>
              <p>{category.tagline}</p>
              <strong>{category.count} powers</strong>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SourcesView({ rankingManifest, importedSource }) {
  const roadmap = useMemo(() => getDataSourceRoadmap(DATA_SOURCE_STRATEGIES), []);
  return (
    <section className="panel source-roadmap" aria-label="Data sources">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Admin · Roadmap</p>
          <h2>Data source strategy</h2>
        </div>
        <p className="catalog-summary">
          <strong>{roadmap.length}</strong> tracked sources, prioritized
        </p>
      </div>
      {rankingManifest && (
        <div className="ranking-manifest-card" aria-label="Imported power quality gate">
          <div>
            <p className="eyebrow">Imported Quality Gate</p>
            <h3>{rankingManifest.visibleRecords?.toLocaleString()} visible imported powers</h3>
            <p>
              {rankingManifest.hiddenRecords?.toLocaleString()} records are hidden by deterministic quality/content rules before browsing.
            </p>
            {importedSource && (
              <p className="ranking-manifest-card__source">
                Active imported source: {importedSource === "enriched" ? "quality-gated enriched data" : "fallback imported pool"}
              </p>
            )}
          </div>
          {rankingManifest.hiddenReasons && (
            <dl>
              {Object.entries(rankingManifest.hiddenReasons).map(([reason, count]) => (
                <div key={reason}>
                  <dt>{reason}</dt>
                  <dd>{count}</dd>
                </div>
              ))}
            </dl>
          )}
          {rankingManifest.rankingDistribution && (
            <div className="ranking-distribution">
              <p className="eyebrow">Ranking Distribution</p>
              {Object.entries(RANKING_DISTRIBUTION_LABELS).map(([group, label]) => {
                const distribution = rankingManifest.rankingDistribution[group] ?? {};
                return (
                  <section key={group}>
                    <h4>{label}</h4>
                    <div>
                      {Object.entries(distribution).map(([value, count]) => (
                        <span key={value}>
                          {formatDistributionLabel(value)}
                          <strong>{Number(count).toLocaleString()}</strong>
                        </span>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      )}
      <div className="source-grid">
        {roadmap.map((source) => (
          <article
            key={source.id}
            className={`source-card source-card--${source.status}`}
          >
            <header>
              <Database size={18} aria-hidden="true" />
              <div>
                <p>#{source.priority} · {source.type}</p>
                <h3>{source.name}</h3>
              </div>
            </header>
            <p className="source-card__use">{source.useCase}</p>
            <dl>
              <div>
                <dt>Status</dt>
                <dd>{source.status}</dd>
              </div>
              <div>
                <dt>Auth</dt>
                <dd>{source.authModel}</dd>
              </div>
              <div>
                <dt>Endpoint</dt>
                <dd>{source.endpoint}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Top bar
// ---------------------------------------------------------------------------

function TopBar({ view, onViewChange, selectedCount }) {
  return (
    <header className="top-bar">
      <a className="top-bar__brand" href="#forge" onClick={(e) => { e.preventDefault(); onViewChange("forge"); }}>
        <span className="top-bar__brand-mark"><span>S</span></span>
        <span>Powers Forge</span>
      </a>
      <nav className="top-bar__nav" aria-label="Primary">
        {VIEWS.map((entry) => {
          const Icon = entry.icon;
          const isActive = view === entry.id;
          return (
            <a
              key={entry.id}
              href={`#${entry.id}`}
              aria-current={isActive ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                onViewChange(entry.id);
              }}
              style={isActive ? { color: "var(--ink)", background: "rgb(255 255 255 / 6%)" } : undefined}
            >
              <Icon size={14} /> {entry.label}
            </a>
          );
        })}
      </nav>
      <a
        className="top-bar__cta"
        href="#forge"
        onClick={(event) => {
          event.preventDefault();
          onViewChange("forge");
        }}
      >
        <UserRound size={14} /> Draft · {selectedCount}/{MAX_POWER_SELECTIONS}
      </a>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export default function App() {
  const canonLibrary = useMemo(() => buildCanonLibrary(), []);
  const imported = useImportedLibrary();

  const library = useMemo(
    () => mergeLibraries(canonLibrary, imported.powers),
    [canonLibrary, imported.powers]
  );

  const categoryCounts = useMemo(
    () => getLibraryCategoryCounts(library),
    [library]
  );
  const sourceCounts = useMemo(
    () => getLibrarySourceCounts(library),
    [library]
  );

  const [view, setView] = useState("forge");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [subcategory, setSubcategory] = useState("all");
  const [tier, setTier] = useState("all");
  const [source, setSource] = useState("all");
  const [slotFit, setSlotFit] = useState("all");
  const [prioritizeOriginFit, setPrioritizeOriginFit] = useState(true);
  const [sortBy, setSortBy] = useState(DEFAULT_LIBRARY_SORT);
  const [statFilters, setStatFilters] = useState(DEFAULT_STAT_FILTERS);
  const [pageSize, setPageSize] = useState(LIBRARY_PREVIEW_LIMIT);
  const [libraryPage, setLibraryPage] = useState(1);
  const [activeSlot, setActiveSlot] = useState("primary");
  const [reviewSlot, setReviewSlot] = useState(null);
  const [heroBuild, setHeroBuild] = useState(() => createEmptyHeroBuild());
  const [savedDrafts, setSavedDrafts] = useState(() => loadSavedDrafts());
  const [comparedPowers, setComparedPowers] = useState([]);
  const [assignmentNotice, setAssignmentNotice] = useState("");

  useEffect(() => {
    setLibraryPage(1);
  }, [query, category, subcategory, tier, source, slotFit, sortBy, activeSlot, reviewSlot, pageSize, statFilters]);

  useEffect(() => {
    setSubcategory("all");
  }, [category]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SAVED_DRAFTS_KEY, JSON.stringify(savedDrafts));
    } catch (error) {
      appLogger.warn("saved_drafts_persist_failed", {
        error: serializeError(error),
        draftCount: savedDrafts.length
      });
    }
  }, [savedDrafts]);

  const hasActiveFilters = useMemo(
    () =>
      query.trim() !== "" ||
      category !== "all" ||
      subcategory !== "all" ||
      tier !== "all" ||
      source !== "all" ||
      slotFit !== "all" ||
      reviewSlot !== null ||
      sortBy !== DEFAULT_LIBRARY_SORT ||
      STAT_FILTERS.some((filter) => statFilters[filter.id] !== DEFAULT_STAT_FILTERS[filter.id]),
    [query, category, subcategory, tier, source, slotFit, reviewSlot, sortBy, statFilters]
  );

  const subcategoryCounts = useMemo(
    () =>
      getLibrarySubcategoryCounts({
        powers: library,
        category,
        query,
        tier,
        source,
        slotFit,
        statFilters
      }),
    [library, category, query, tier, source, slotFit, statFilters]
  );

  const selectedPowers = useMemo(() => getHeroBuildPowers(heroBuild), [heroBuild]);
  const originCategoryIds = useMemo(
    () => heroBuild.origin?.preferredCategories ?? [],
    [heroBuild.origin]
  );
  const originCategoryLabels = useMemo(() => {
    const namesById = new Map(categoryCounts.map((entry) => [entry.id, entry.name]));
    return originCategoryIds.map((categoryId) => namesById.get(categoryId) ?? categoryId);
  }, [categoryCounts, originCategoryIds]);
  const reviewPowerIds = useMemo(() => {
    if (!reviewSlot) return null;
    if (reviewSlot === "all") return new Set(selectedPowers.map((power) => power.id));
    if (reviewSlot === "origin") return null;
    const value = heroBuild[reviewSlot];
    const powers = Array.isArray(value) ? value : [value].filter(Boolean);
    return new Set(powers.map((power) => power.id));
  }, [heroBuild, reviewSlot, selectedPowers]);
  const assignedSlotById = useMemo(() => {
    const entries = selectedPowers.map((power) => [power.id, findPowerSlot(heroBuild, power.id)]);
    return new Map(entries);
  }, [heroBuild, selectedPowers]);
  const comparedIds = useMemo(
    () => new Set(comparedPowers.map((power) => power.id)),
    [comparedPowers]
  );

  const {
    totalMatches,
    totalPages,
    page,
    visible,
    hasNextPage,
    hasPreviousPage
  } = useMemo(
    () =>
      filterLibrary({
        powers: library,
        query,
        category,
        subcategory,
        tier,
        source,
        slotFit,
        originCategoryIds,
        prioritizeOriginFit: Boolean(heroBuild.origin && prioritizeOriginFit),
        statFilters,
        sortBy,
        activeSlot,
        selectedPowerIds: reviewPowerIds,
        limit: pageSize,
        page: libraryPage
      }),
    [library, query, category, subcategory, tier, source, slotFit, originCategoryIds, prioritizeOriginFit, heroBuild.origin, statFilters, sortBy, activeSlot, reviewPowerIds, pageSize, libraryPage]
  );

  function updateLibraryPage(nextPage) {
    setLibraryPage(Math.min(Math.max(1, nextPage), totalPages));
  }

  function updateStatFilter(statId, value) {
    setStatFilters((current) => ({ ...current, [statId]: value }));
  }

  function clearLibraryFilters() {
    setQuery("");
    setCategory("all");
    setSubcategory("all");
    setTier("all");
    setSource("all");
    setSlotFit("all");
    setReviewSlot(null);
    setSortBy(DEFAULT_LIBRARY_SORT);
    setStatFilters(DEFAULT_STAT_FILTERS);
  }

  function resetLibraryFacets() {
    setQuery("");
    setCategory("all");
    setSubcategory("all");
    setTier("all");
    setSource("all");
    setSortBy(DEFAULT_LIBRARY_SORT);
    setStatFilters(DEFAULT_STAT_FILTERS);
  }

  function assignPower(power, slotId = activeSlot) {
    setHeroBuild((current) => {
      const next = assignPowerToSlot(current, power, slotId);
      const nextSlotId = getNextSlotId(next, slotId);
      const assignedSlotLabel = HERO_SLOTS.find((slot) => slot.id === slotId)?.shortLabel ?? "slot";
      const nextSlotLabel = HERO_SLOTS.find((slot) => slot.id === nextSlotId)?.shortLabel ?? assignedSlotLabel;
      setActiveSlot(nextSlotId);
      setAssignmentNotice(`Assigned ${power.name} to ${assignedSlotLabel}. Next slot: ${nextSlotLabel}.`);
      return next;
    });
  }

  function toggleComparePower(power) {
    setComparedPowers((current) => {
      if (current.some((item) => item.id === power.id)) {
        return current.filter((item) => item.id !== power.id);
      }
      return [power, ...current].slice(0, 4);
    });
  }

  function removeComparePower(powerId) {
    setComparedPowers((current) => current.filter((power) => power.id !== powerId));
  }

  function removePower(power) {
    setHeroBuild((current) => removePowerFromBuild(current, power.id));
  }

  function clearSelections() {
    setHeroBuild(createEmptyHeroBuild());
    setAssignmentNotice("");
  }

  function clearSlot(slotId) {
    setHeroBuild((current) => clearHeroSlot(current, slotId));
  }

  function setHeroAlias(alias) {
    setHeroBuild((current) => ({ ...current, alias }));
  }

  function setHeroProfileField(field, value) {
    setHeroBuild((current) => ({ ...current, [field]: value }));
  }

  function setHeroOriginSource(originId) {
    setHeroBuild((current) => ({ ...current, origin: createOriginSource(originId) }));
  }

  function focusOriginPicker() {
    window.requestAnimationFrame(() => {
      const originPicker = document.getElementById("origin-source-picker");
      if (!originPicker) return;
      originPicker.scrollIntoView({ behavior: "smooth", block: "start" });
      originPicker.focus({ preventScroll: true });
    });
  }

  function focusBuildSlot(slotId, mode = "browse") {
    if (slotId === "all") {
      setActiveSlot("primary");
      resetLibraryFacets();
      setSlotFit("all");
      setReviewSlot("all");
      setView("forge");
      return;
    }
    if (slotId === "limitation") {
      setActiveSlot("primary");
      resetLibraryFacets();
      setSlotFit("all");
      setReviewSlot("all");
      setView("forge");
      return;
    }
    if (slotId === "origin") {
      setActiveSlot("primary");
      setReviewSlot(null);
      setView("forge");
      focusOriginPicker();
      return;
    }
    setActiveSlot(slotId);
    resetLibraryFacets();
    setSlotFit(mode === "review" ? "all" : slotId);
    setReviewSlot(mode === "review" ? slotId : null);
    setView("forge");
  }

  function saveCurrentDraft() {
    const draft = buildHeroDraft(heroBuild);
    if (draft.selectedCount === 0) return;

    const savedDraft = {
      id: `${Date.now()}-${draft.heroName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      schemaVersion: SAVED_DRAFT_SCHEMA_VERSION,
      name: draft.heroName,
      classification: draft.classification,
      selectedCount: draft.selectedCount,
      savedAt: new Date().toISOString(),
      heroBuild
    };

    setSavedDrafts((current) => [savedDraft, ...current].slice(0, 12));
  }

  function loadDraft(savedDraft) {
    setHeroBuild(savedDraft.heroBuild ?? createEmptyHeroBuild());
    setActiveSlot("primary");
    setAssignmentNotice(`Loaded ${savedDraft.name || "saved draft"}.`);
    setView("forge");
  }

  function deleteDraft(draftId) {
    setSavedDrafts((current) => current.filter((draft) => draft.id !== draftId));
  }

  return (
    <>
      <TopBar view={view} onViewChange={setView} selectedCount={selectedPowers.length} />

      <main className="app-shell">
        {view === "forge" && (
          <>
            <section className="hero-panel" aria-label="Forge overview">
              <div>
                <p className="eyebrow">Hero Forge · Workshop</p>
                <h1>Draft a hero from one unified power library.</h1>
                <p className="hero-panel__lede">
                  Canon ({sourceCounts.canon || 0}) and imported (
                  {sourceCounts.imported || 0}) powers share one model, one card,
                  one search. Pick up to {MAX_POWER_SELECTIONS} powers and the draft on the
                  right updates live.
                </p>
                <div className="hero-panel__ctas">
                  <a
                    href="#taxonomy"
                    onClick={(event) => {
                      event.preventDefault();
                      setView("taxonomy");
                    }}
                  >
                    <Layers size={14} /> See taxonomy
                  </a>
                  <a
                    href="#sources"
                    onClick={(event) => {
                      event.preventDefault();
                      setView("sources");
                    }}
                  >
                    <Database size={14} /> Data sources <ArrowRight size={14} />
                  </a>
                </div>
              </div>
              <div className="hero-panel__metric">
                <p className="eyebrow">Library</p>
                <p className="value">{library.length.toLocaleString()}</p>
                <p className="label">unified powers</p>
                <p className="meta">
                  canon {sourceCounts.canon || 0} · imported{" "}
                  {(sourceCounts.imported || 0).toLocaleString()}
                </p>
                {imported.source === "enriched" && imported.rankingManifest?.hiddenRecords > 0 && (
                  <p className="quality-meta">
                    {imported.rankingManifest.hiddenRecords.toLocaleString()} imported records hidden by quality gate
                  </p>
                )}
              </div>
            </section>

            <div className="forge-workspace">
              <div className="forge-main">
                <PowerLibrary
                  library={library}
                  categoryCounts={categoryCounts}
                  subcategoryCounts={subcategoryCounts}
                  sourceCounts={sourceCounts}
                  assignedSlotById={assignedSlotById}
                  comparedIds={comparedIds}
                  comparedPowers={comparedPowers}
                  heroBuild={heroBuild}
                  originCategoryLabels={originCategoryLabels}
                  prioritizeOriginFit={prioritizeOriginFit}
                  onPrioritizeOriginFitChange={setPrioritizeOriginFit}
                  activeSlot={activeSlot}
                  onActiveSlotChange={setActiveSlot}
                  onAssignPower={assignPower}
                  onToggleCompare={toggleComparePower}
                  onRemoveCompare={removeComparePower}
                  onClearCompare={() => setComparedPowers([])}
                  query={query}
                  onQueryChange={setQuery}
                  category={category}
                  onCategoryChange={setCategory}
                  subcategory={subcategory}
                  onSubcategoryChange={setSubcategory}
                  tier={tier}
                  onTierChange={setTier}
                  source={source}
                  onSourceChange={setSource}
                  slotFit={slotFit}
                  onSlotFitChange={setSlotFit}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  statFilters={statFilters}
                  onStatFilterChange={updateStatFilter}
                  onClearFilters={clearLibraryFilters}
                  hasActiveFilters={hasActiveFilters}
                  reviewSlot={reviewSlot}
                  onClearReview={() => setReviewSlot(null)}
                  page={page}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  onPageChange={updateLibraryPage}
                  onPageSizeChange={setPageSize}
                  hasNextPage={hasNextPage}
                  hasPreviousPage={hasPreviousPage}
                  totalMatches={totalMatches}
                  visible={visible}
                  importedStatus={imported.status}
                  assignmentNotice={assignmentNotice}
                />
              </div>
              <aside className="forge-aside">
                <HeroDraftPanel
                  heroBuild={heroBuild}
                  savedDrafts={savedDrafts}
                  onSaveDraft={saveCurrentDraft}
                  onLoadDraft={loadDraft}
                  onDeleteDraft={deleteDraft}
                  onRemove={removePower}
                  onClear={clearSelections}
                  onClearSlot={clearSlot}
                  onFocusSlot={focusBuildSlot}
                  onSetAlias={setHeroAlias}
                  onSetProfileField={setHeroProfileField}
                  onSetOriginSource={setHeroOriginSource}
                />
              </aside>
            </div>
          </>
        )}

        {view === "taxonomy" && (
          <TaxonomyView library={library} categoryCounts={categoryCounts} />
        )}

        {view === "sources" && (
          <SourcesView rankingManifest={imported.rankingManifest} importedSource={imported.source} />
        )}

        <footer className="site-footer">
          Powers Forge · {sourceCounts.canon || 0} canon +{" "}
          {(sourceCounts.imported || 0).toLocaleString()} imported powers ·{" "}
          See <code>docs/design.md</code> for the design system.
          {imported.manifest?.attribution && (
            <>
              {" "}
              <br />
              {imported.manifest.attribution}
            </>
          )}
        </footer>
      </main>

      {view !== "forge" && selectedPowers.length > 0 && (
        <a
          className="selection-pill"
          href="#forge"
          onClick={(event) => {
            event.preventDefault();
            setView("forge");
          }}
        >
          <span>
            Drafting <strong>{selectedPowers.length}</strong>/{MAX_POWER_SELECTIONS} powers
          </span>
          <span className="selection-pill__cta">
            Open forge <ArrowRight size={14} />
          </span>
        </a>
      )}
    </>
  );
}
