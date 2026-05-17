export const POWER_CATEGORIES = [
  {
    id: "physical",
    name: "Physical",
    tagline: "Body-first abilities built for force, endurance, and survival.",
    accent: "#ff6b4a"
  },
  {
    id: "elemental",
    name: "Elemental",
    tagline: "Matter and climate control across fire, ice, air, earth, and storm states.",
    accent: "#00a878"
  },
  {
    id: "psychic",
    name: "Psychic",
    tagline: "Mind, perception, emotion, and cognition as the operating surface.",
    accent: "#8e7cff"
  },
  {
    id: "energy",
    name: "Energy",
    tagline: "Projection, absorption, shielding, and directed force manipulation.",
    accent: "#f7b801"
  },
  {
    id: "mobility",
    name: "Mobility",
    tagline: "Movement powers that change distance, access, and escape windows.",
    accent: "#00a6fb"
  },
  {
    id: "biological",
    name: "Biological",
    tagline: "Healing, mutation, adaptation, senses, and living-system control.",
    accent: "#9bc53d"
  },
  {
    id: "tech",
    name: "Tech",
    tagline: "Invented, worn, deployed, or networked abilities powered by systems.",
    accent: "#5c677d"
  },
  {
    id: "mystic",
    name: "Mystic",
    tagline: "Ritual, symbols, artifacts, and reality rules outside normal science.",
    accent: "#d81159"
  },
  {
    id: "cosmic",
    name: "Cosmic",
    tagline: "Large-scale powers tied to gravity, space, time, and universal forces.",
    accent: "#3a0ca3"
  },
  {
    id: "stealth",
    name: "Stealth",
    tagline: "Concealment, misdirection, infiltration, and precision control.",
    accent: "#2f3e46"
  }
];

export const BASE_SUPERPOWERS = [
  {
    id: "super-strength",
    name: "Super Strength",
    category: "physical",
    tier: "core",
    role: "Brawler",
    description: "Amplified muscular output for lifting, striking, grappling, and structural rescue.",
    strengths: ["High direct damage", "Strong rescue utility", "Simple to understand"],
    weaknesses: ["Limited range", "Collateral risk", "Needs durability to scale safely"],
    counters: ["Telekinesis", "Phasing", "Gravity Control"],
    stats: { offense: 9, defense: 5, mobility: 4, utility: 6, control: 3, risk: 7 }
  },
  {
    id: "invulnerability",
    name: "Invulnerability",
    category: "physical",
    tier: "core",
    role: "Tank",
    description: "Extreme resistance to impact, heat, pressure, toxins, and environmental hazards.",
    strengths: ["Excellent survivability", "Front-line protection", "High rescue value"],
    weaknesses: ["May not protect allies", "Can be bypassed by mental attacks", "Encourages overexposure"],
    counters: ["Telepathy", "Reality Warping", "Power Nullification"],
    stats: { offense: 4, defense: 10, mobility: 3, utility: 6, control: 2, risk: 5 }
  },
  {
    id: "flight",
    name: "Flight",
    category: "mobility",
    tier: "core",
    role: "Responder",
    description: "Self-propelled aerial movement for rapid travel, scouting, and vertical access.",
    strengths: ["Excellent repositioning", "Fast emergency response", "Strong terrain bypass"],
    weaknesses: ["Weather exposure", "Anti-air vulnerability", "Limited enclosed-space value"],
    counters: ["Gravity Control", "Wind Manipulation", "Energy Nets"],
    stats: { offense: 3, defense: 5, mobility: 10, utility: 8, control: 5, risk: 4 }
  },
  {
    id: "telepathy",
    name: "Telepathy",
    category: "psychic",
    tier: "advanced",
    role: "Strategist",
    description: "Reading, transmitting, shielding, or influencing thoughts across active minds.",
    strengths: ["Information advantage", "Non-violent resolution paths", "Team coordination"],
    weaknesses: ["Consent and privacy risk", "Mental shielding", "Cognitive overload"],
    counters: ["Mind Shielding", "Machine Intelligence", "Emotion Dampening"],
    stats: { offense: 5, defense: 6, mobility: 2, utility: 10, control: 9, risk: 9 }
  },
  {
    id: "telekinesis",
    name: "Telekinesis",
    category: "psychic",
    tier: "advanced",
    role: "Controller",
    description: "Remote manipulation of objects, pressure, barriers, and momentum fields.",
    strengths: ["Range advantage", "Flexible defense", "Precise containment"],
    weaknesses: ["Concentration dependent", "Line-of-sight constraints", "Mental fatigue"],
    counters: ["Psychic Disruption", "Phase Shifting", "Anchor Fields"],
    stats: { offense: 8, defense: 8, mobility: 6, utility: 9, control: 10, risk: 8 }
  },
  {
    id: "fire-control",
    name: "Fire Control",
    category: "elemental",
    tier: "core",
    role: "Striker",
    description: "Ignition, shaping, heat regulation, and suppression of flame states.",
    strengths: ["High area denial", "Strong intimidation factor", "Useful heat generation"],
    weaknesses: ["Collateral fire risk", "Oxygen and fuel constraints", "Poor stealth"],
    counters: ["Water Control", "Vacuum Fields", "Heat Absorption"],
    stats: { offense: 9, defense: 4, mobility: 3, utility: 6, control: 7, risk: 10 }
  },
  {
    id: "ice-control",
    name: "Ice Control",
    category: "elemental",
    tier: "core",
    role: "Controller",
    description: "Freezing, shaping ice, reducing temperature, and creating slick or rigid terrain.",
    strengths: ["Containment value", "Defensive barriers", "Rescue cooling and preservation"],
    weaknesses: ["Heat vulnerability", "Slippery collateral hazards", "Humidity dependence"],
    counters: ["Fire Control", "Thermal Absorption", "Vibration"],
    stats: { offense: 7, defense: 7, mobility: 5, utility: 8, control: 8, risk: 7 }
  },
  {
    id: "electricity-control",
    name: "Electricity Control",
    category: "energy",
    tier: "core",
    role: "Disruptor",
    description: "Generation and routing of electrical charge through targets, grids, or fields.",
    strengths: ["Disables devices", "Fast attacks", "Infrastructure utility"],
    weaknesses: ["Grounding risk", "Water hazards", "Can endanger medical devices"],
    counters: ["Insulation", "Grounding Fields", "Rubberized Armor"],
    stats: { offense: 8, defense: 5, mobility: 6, utility: 8, control: 7, risk: 8 }
  },
  {
    id: "healing-factor",
    name: "Healing Factor",
    category: "biological",
    tier: "core",
    role: "Survivor",
    description: "Accelerated tissue repair, toxin processing, and recovery from physical trauma.",
    strengths: ["Long-term endurance", "Toxin resistance", "Strong field survivability"],
    weaknesses: ["Pain still applies", "Does not guarantee immunity", "Can be overwhelmed"],
    counters: ["Power Suppression", "Cellular Stasis", "Extreme Disintegration"],
    stats: { offense: 3, defense: 9, mobility: 4, utility: 7, control: 3, risk: 4 }
  },
  {
    id: "invisibility",
    name: "Invisibility",
    category: "stealth",
    tier: "core",
    role: "Infiltrator",
    description: "Visual concealment through light bending, perception masking, or active camouflage.",
    strengths: ["Recon advantage", "Avoids direct conflict", "Strong escape utility"],
    weaknesses: ["Thermal and sound detection", "Environmental traces", "Low direct defense"],
    counters: ["Thermal Vision", "Motion Sensors", "Area Effects"],
    stats: { offense: 3, defense: 4, mobility: 6, utility: 9, control: 7, risk: 6 }
  },
  {
    id: "shapeshifting",
    name: "Shapeshifting",
    category: "biological",
    tier: "advanced",
    role: "Operative",
    description: "Controlled biological transformation of appearance, size, structure, or function.",
    strengths: ["Deep infiltration", "Adaptive survival", "Identity flexibility"],
    weaknesses: ["Authentication risk", "Physical strain", "DNA or biometric detection"],
    counters: ["Biometric Scans", "Truth Detection", "Power Lock Fields"],
    stats: { offense: 5, defense: 6, mobility: 6, utility: 10, control: 8, risk: 9 }
  },
  {
    id: "technopathy",
    name: "Technopathy",
    category: "tech",
    tier: "advanced",
    role: "Systems Operator",
    description: "Direct communication with, control over, or rapid understanding of digital systems.",
    strengths: ["Cyber advantage", "Infrastructure control", "Remote utility"],
    weaknesses: ["Air-gapped systems", "Malware exposure", "Requires clear access boundaries"],
    counters: ["Analog Systems", "Faraday Shielding", "Zero-Trust Controls"],
    stats: { offense: 4, defense: 5, mobility: 3, utility: 10, control: 9, risk: 8 }
  },
  {
    id: "portal-creation",
    name: "Portal Creation",
    category: "mobility",
    tier: "legendary",
    role: "Transporter",
    description: "Opening stable passages between separate physical locations or dimensions.",
    strengths: ["Instant relocation", "Team evacuation", "High logistics value"],
    weaknesses: ["Destination validation", "Catastrophic placement risk", "Energy intensive"],
    counters: ["Spatial Anchors", "Wards", "Coordinate Jamming"],
    stats: { offense: 5, defense: 7, mobility: 10, utility: 10, control: 8, risk: 10 }
  },
  {
    id: "time-dilation",
    name: "Time Dilation",
    category: "cosmic",
    tier: "legendary",
    role: "Temporal Controller",
    description: "Localized alteration of perceived or physical time rate for people and objects.",
    strengths: ["Extreme tactical edge", "Rescue timing", "Threat containment"],
    weaknesses: ["Paradox risk", "Severe energy cost", "Hard to audit outcomes"],
    counters: ["Temporal Anchors", "Precognition", "Reality Stabilizers"],
    stats: { offense: 7, defense: 9, mobility: 9, utility: 10, control: 10, risk: 10 }
  },
  {
    id: "spellcraft",
    name: "Spellcraft",
    category: "mystic",
    tier: "advanced",
    role: "Arcane Specialist",
    description: "Ritualized casting that produces shields, bindings, illusions, curses, or blessings.",
    strengths: ["Highly flexible effects", "Can bind unusual threats", "Strong support utility"],
    weaknesses: ["Preparation dependent", "Artifact and language constraints", "Backfire risk"],
    counters: ["Counterspell", "Silence Fields", "Anti-Magic Wards"],
    stats: { offense: 7, defense: 8, mobility: 5, utility: 10, control: 9, risk: 9 }
  }
];
