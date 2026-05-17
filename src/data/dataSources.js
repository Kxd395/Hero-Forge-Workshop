export const DATA_SOURCE_TYPES = {
  canonical: "canonical",
  externalHeroApi: "externalHeroApi",
  officialComicsApi: "officialComicsApi",
  wikiImport: "wikiImport",
  knowledgeGraph: "knowledgeGraph",
  generative: "generative",
  staticDataset: "staticDataset",
  manualCuration: "manualCuration"
};

export const DATA_SOURCE_STRATEGIES = [
  {
    id: "original-canon",
    type: DATA_SOURCE_TYPES.canonical,
    name: "Original Power Canon",
    status: "active",
    priority: 1,
    authModel: "none",
    coverage: "Curated original powers, categories, counters, weaknesses, and balance scores.",
    bestFor: "Core app data and owned worldbuilding.",
    endpoint: "src/data/superpowers.js",
    useCase: "The app's owned taxonomy, base powers, scoring, counters, and weaknesses.",
    securityNotes: ["No external network dependency", "No third-party character licensing exposure"],
    implementationNotes: [
      "Keep this as the default source of truth.",
      "Use imports only as references or opt-in enrichment."
    ]
  },
  {
    id: "akabab-superhero-api",
    type: DATA_SOURCE_TYPES.externalHeroApi,
    name: "Akabab Superhero API",
    status: "candidate",
    priority: 2,
    authModel: "none",
    coverage: "Existing hero records, powerstats, biography fragments, appearance, connections, and images.",
    bestFor: "Fast existing-hero comparisons and prototype search.",
    endpoint: "https://akabab.github.io/superhero-api/api/all.json",
    useCase: "Read existing hero stats for comparison views and inspiration, not as the owned power model.",
    securityNotes: ["Public JSON endpoint", "Cache responses locally before repeated use", "Review image and character usage rights"],
    implementationNotes: [
      "Map powerstats from 0-100 into the app's 1-10 scoring scale.",
      "Do not blend licensed character records into original generated heroes without clear labeling."
    ]
  },
  {
    id: "superpower-list-database",
    type: DATA_SOURCE_TYPES.staticDataset,
    name: "Superpower List Database",
    status: "recommended",
    priority: 3,
    authModel: "none",
    coverage: "12,000+ user-generated superpowers with name, overview, description, pros, cons, tags, moderation state, comparison scores, dates, and submitter metadata.",
    bestFor: "Primary bulk import source for the app's exhaustive superpower option pool.",
    endpoint: "https://github.com/justinmahar/superpowerlistdb/blob/master/superpowers.csv",
    useCase: "Populate a large reviewed ability pool while keeping our curated canon separate.",
    securityNotes: [
      "Requires visible attribution: Copyright © Justin Mahar | The Superpower List",
      "Treat CSV text as untrusted user-generated content",
      "Filter to published records before public display"
    ],
    implementationNotes: [
      "Import at build time or through an admin job, not directly from the browser.",
      "Map overview, description, pro1-pro3, con1-con3, tags, preference_ratio, and moderation state into a staging schema.",
      "Keep imported records in an option pool until a curator promotes them into the app canon."
    ]
  },
  {
    id: "superheroapi-token",
    type: DATA_SOURCE_TYPES.externalHeroApi,
    name: "SuperHero API Token Service",
    status: "deferred",
    priority: 4,
    authModel: "provider token",
    coverage: "Existing superhero and villain lookup with powerstats, biography, appearance, work, and image data.",
    bestFor: "Authenticated existing-character search if we add a backend proxy.",
    endpoint: "https://superheroapi.com/api/{access-token}/{character-id}",
    useCase: "Lookup existing heroes when an authenticated provider is preferred.",
    securityNotes: ["Requires token handling", "Never expose provider tokens in frontend code", "Use a server-side proxy if enabled"],
    implementationNotes: [
      "Create a backend route before integration.",
      "Add rate limiting, retries with backoff, and structured error logging."
    ]
  },
  {
    id: "comic-vine-api",
    type: DATA_SOURCE_TYPES.officialComicsApi,
    name: "Comic Vine API",
    status: "candidate",
    priority: 5,
    authModel: "api key",
    coverage: "Comic characters, concepts, teams, publishers, issues, volumes, series, and images.",
    bestFor: "Broad comic metadata and character search beyond one publisher.",
    endpoint: "https://comicvine.gamespot.com/api/",
    useCase: "Build a richer external character and comic reference layer.",
    securityNotes: ["Requires API key", "Cache responses", "Expect rate limits and occasional provider instability"],
    implementationNotes: [
      "Proxy requests through the server and store only normalized fields needed by the app.",
      "Keep Comic Vine records separate from original app canon."
    ]
  },
  {
    id: "marvel-developer-api",
    type: DATA_SOURCE_TYPES.officialComicsApi,
    name: "Marvel Developer API",
    status: "deferred",
    priority: 6,
    authModel: "public/private key signature",
    coverage: "Marvel characters, comics, creators, events, series, and stories.",
    bestFor: "Official Marvel comic metadata when attribution and terms are acceptable.",
    endpoint: "https://gateway.marvel.com/v1/public",
    useCase: "Add official Marvel metadata references, not original superpower definitions.",
    securityNotes: ["Requires signed requests", "Private key must remain server-side", "Marvel attribution rules apply"],
    implementationNotes: [
      "Use only through a backend integration.",
      "Review terms and attribution requirements before rendering images or character data."
    ]
  },
  {
    id: "powerlisting-mediawiki",
    type: DATA_SOURCE_TYPES.wikiImport,
    name: "Powerlisting MediaWiki Import",
    status: "deferred",
    priority: 7,
    authModel: "none",
    coverage: "Large community-maintained ability pages, aliases, categories, and descriptions.",
    bestFor: "Exhaustive ability-name inspiration after sanitization and attribution review.",
    endpoint: "https://powerlisting.fandom.com/api.php",
    useCase: "Bulk import ability names and descriptions into a reviewed staging dataset.",
    securityNotes: ["Treat wiki content as untrusted text", "Sanitize HTML", "Review attribution and license requirements"],
    implementationNotes: [
      "Import into a staging file, then approve entries into the app canon.",
      "Deduplicate aliases and normalize categories before display."
    ]
  },
  {
    id: "superheroes-fandom-mediawiki",
    type: DATA_SOURCE_TYPES.wikiImport,
    name: "Superheroes Fandom MediaWiki",
    status: "deferred",
    priority: 8,
    authModel: "none",
    coverage: "Community pages for existing characters, teams, powers, and fictional universes.",
    bestFor: "Secondary reference imports when pages need editorial review.",
    endpoint: "https://superheroes.fandom.com/api.php",
    useCase: "Reference existing hero pages without treating wiki text as trusted canonical data.",
    securityNotes: ["Sanitize HTML", "Review license and attribution", "Expect inconsistent page structure"],
    implementationNotes: [
      "Import into staging only.",
      "Normalize page titles, categories, and links before display."
    ]
  },
  {
    id: "wikidata-sparql",
    type: DATA_SOURCE_TYPES.knowledgeGraph,
    name: "Wikidata SPARQL",
    status: "candidate",
    priority: 9,
    authModel: "none",
    coverage: "Structured public facts for fictional characters, publishers, creators, and works.",
    bestFor: "Cross-source entity identifiers and lightweight factual enrichment.",
    endpoint: "https://query.wikidata.org/bigdata/namespace/wdq/sparql",
    useCase: "Resolve character identities and publisher metadata without scraping free-form pages.",
    securityNotes: ["Respect query service limits", "Do not run broad expensive queries from the browser", "Cache normalized results"],
    implementationNotes: [
      "Use server-side query templates with strict parameters.",
      "Store Wikidata QIDs as external references, not as app-owned IDs."
    ]
  },
  {
    id: "ai-power-generator",
    type: DATA_SOURCE_TYPES.generative,
    name: "OpenAI Structured Power Generator",
    status: "planned",
    priority: 10,
    authModel: "server-side API key",
    coverage: "New original powers generated into a strict JSON schema.",
    bestFor: "Creating brand-new powers with balanced stats, drawbacks, counters, and categories.",
    endpoint: "server-side OpenAI endpoint",
    useCase: "Generate new balanced powers with structured JSON fields.",
    securityNotes: ["Validate generated JSON schema", "Log request IDs only", "Do not trust model output as executable code"],
    implementationNotes: [
      "Keep generation server-side.",
      "Require deterministic schema validation before a generated power enters the catalog."
    ]
  },
  {
    id: "gemini-power-generator",
    type: DATA_SOURCE_TYPES.generative,
    name: "Gemini JSON Power Generator",
    status: "candidate",
    priority: 11,
    authModel: "server-side API key",
    coverage: "Generated original powers and descriptions with JSON output constraints.",
    bestFor: "Alternative AI generation provider if we want model/provider redundancy.",
    endpoint: "server-side Gemini endpoint",
    useCase: "Generate new power options through a second provider for comparison or fallback.",
    securityNotes: ["Validate schema locally", "Keep provider keys server-side", "Never auto-publish generated content"],
    implementationNotes: [
      "Use the same app schema as the OpenAI generator.",
      "Run duplicate detection before accepting generated powers."
    ]
  },
  {
    id: "open-json-dataset",
    type: DATA_SOURCE_TYPES.staticDataset,
    name: "Reviewed Static JSON Dataset",
    status: "candidate",
    priority: 12,
    authModel: "none",
    coverage: "Pinned JSON or CSV files with hero, villain, or ability records.",
    bestFor: "Offline autocomplete, demos, and deterministic test fixtures.",
    endpoint: "local import file",
    useCase: "Seed additional menu options or autocomplete without a runtime API dependency.",
    securityNotes: ["Pin source and version", "Scan for malformed content", "Preserve attribution metadata"],
    implementationNotes: [
      "Commit reviewed data only after validation.",
      "Prefer a small curated subset over a noisy scrape."
    ]
  },
  {
    id: "huggingface-superheroes-dataset",
    type: DATA_SOURCE_TYPES.staticDataset,
    name: "Hugging Face Superheroes Dataset",
    status: "candidate",
    priority: 13,
    authModel: "none or hub token for higher limits",
    coverage: "Dataset rows with hero metadata, scores, and many boolean power columns.",
    bestFor: "Bulk analytics, model training experiments, and import evaluation.",
    endpoint: "https://huggingface.co/datasets/jrtec/Superheroes",
    useCase: "Evaluate a large tabular source before deciding whether to import selected fields.",
    securityNotes: ["Pin dataset revision", "Review dataset license", "Avoid storing large unreviewed text blobs in the frontend"],
    implementationNotes: [
      "Use a build-time import script, not browser runtime reads.",
      "Map boolean power columns into app categories through a reviewed dictionary."
    ]
  },
  {
    id: "admin-curation-queue",
    type: DATA_SOURCE_TYPES.manualCuration,
    name: "Admin Curation Queue",
    status: "planned",
    priority: 14,
    authModel: "app admin auth",
    coverage: "Human-reviewed powers from AI generation, imports, or manual entry.",
    bestFor: "Quality control before any new power enters the public catalog.",
    endpoint: "future admin workflow",
    useCase: "Approve, reject, merge, or edit candidate powers before publishing.",
    securityNotes: ["Requires role-based access", "Keep audit history", "Validate every submitted field"],
    implementationNotes: [
      "Add review states: draft, needs-review, approved, rejected, archived.",
      "Require duplicate checks and rollback metadata for every approved entry."
    ]
  }
];
