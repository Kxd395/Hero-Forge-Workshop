# Power Catalog Taxonomy

This is the operating index for the Hero Forge Workshop power catalog. It describes how the app groups, recommends, and explains powers without turning the 8,000+ imported records into hand-maintained documentation.

Generated from:

- `src/data/superpowers.js` for original canon powers and categories
- `src/utils/powerLibrary.js` for category inference, subcategories, scope, and slot recommendation rules
- `src/utils/heroBuilder.js` for origin sources
- `public/data/superpower-list-pool.json` for imported Superpower List records

Regenerate with `npm run docs:powers` after changing categories, subcategories, origin sources, ranking logic, or the imported pool.

## Catalog Summary

- Canon powers: 15
- Published imported powers: 8531
- Unified library total: 8546
- Raw imported records: 12798

## Category Counts

| Category | Canon | Imported | Total | Subcategories |
| --- | ---: | ---: | ---: | --- |
| Physical | 2 | 2811 | 2813 | Strength (1026), Durability (443), Size Change (305), Combat (618) |
| Elemental | 2 | 1236 | 1238 | Fire (566), Ice (264), Water (478), Earth (328), Air / Weather (473) |
| Psychic | 2 | 1131 | 1133 | Telepathy (1133), Emotion (205), Illusion (189), Memory (143), Perception (311) |
| Energy | 1 | 525 | 526 | Blasts (230), Electricity (168), Light (166), Magnetism (49), Absorption (133) |
| Mobility | 2 | 414 | 416 | Speed (190), Flight (136), Teleportation (133), Portals (36), Phasing (22), Time Travel (32), Dimensional (72), Jumping (66) |
| Biological | 2 | 882 | 884 | Healing (883), Mutation (66), Shifting (329), Senses (255), Toxins (84) |
| Tech | 1 | 287 | 288 | Cyber (55), Machines (82), Gadgets (58), Armor (20), Weapons (159) |
| Mystic | 1 | 509 | 510 | Magic (510), Curses (61), Summoning (269), Spirits (157), Rituals (12) |
| Cosmic | 1 | 639 | 640 | Space (300), Time (403), Gravity (48), Dimensions (272), Void (89) |
| Stealth | 1 | 97 | 98 | Invisibility (46), Shadow (33), Silence (20), Disguise (19), Infiltration (98) |

## Origin To Power Fit

Origin explains how the hero got powers. It does not occupy a power slot. The selected origin biases recommendations toward preferred categories while still allowing any power to be chosen.

| Origin | Primary Category | Preferred Categories | Story Use |
| --- | --- | --- | --- |
| Natural Born | Biological | Biological, Physical, Psychic | Born with powers through species, ancestry, dormant biology, or inherited traits. |
| Mutation / Gene | Biological | Biological, Psychic, Physical, Mobility | A gene, mutation, or sudden biological awakening changed what their body can do. |
| Accident | Energy | Energy, Elemental, Biological, Physical | Radiation, chemicals, lightning, a machine failure, or disaster triggered the power. |
| Bite / Infection | Biological | Biological, Physical, Mobility, Stealth | A bite, parasite, venom, alien organism, or supernatural infection rewrote them. |
| Experiment | Tech | Tech, Biological, Energy, Physical | Created by a lab, serum, field test, weapon program, or failed procedure. |
| Artifact / Relic | Mystic | Mystic, Cosmic, Elemental, Tech | Power flows through a relic, suit, weapon, symbol, or inherited object. |
| Cosmic Event | Cosmic | Cosmic, Energy, Mobility, Psychic | A space, time, dimensional, radiation, or universal-force event rewrote their life. |
| Magic / Pact | Mystic | Mystic, Cosmic, Psychic, Elemental | Power comes from a vow, bargain, curse, order, ritual, or patron. |
| Training | Physical | Physical, Stealth, Mobility, Tech | Discipline, combat mastery, study, or extreme conditioning created the hero. |
| Tech Upgrade | Tech | Tech, Energy, Mobility, Physical | Cybernetics, armor, implants, AI bonding, or engineered systems enable the hero. |
| Alien / Species | Cosmic | Cosmic, Biological, Physical, Energy | Alien heritage, non-human species, or otherworldly biology explains the powers. |
| Dimensional Contact | Cosmic | Cosmic, Mobility, Mystic, Psychic | Alien, extradimensional, or otherworldly contact opened access to impossible rules. |

## Slot Model

| Slot | Count | Purpose |
| --- | ---: | --- |
| Primary | 1 | The signature power people remember. Usually high offense, control, or concept-defining utility. |
| Secondary | 0-3 | Combo powers that broaden the hero without replacing the signature. |
| Utility | 0-1 | Practical field use: movement, rescue, scouting, defense, investigation, support, or escape. |

Limits are derived from selected powers' weaknesses and optional story constraints. They are not a power category, not a filter, and not a separate build slot.

## Canon Power Index

| Power | Tier | Role | Best Slot | Scope | Stats |
| --- | --- | --- | --- | --- | --- |
| Healing Factor | core | Survivor | Secondary | Focused | off 3, def 9, mob 4, util 7, ctrl 3, risk 4 |
| Shapeshifting | advanced | Operative | Primary | Versatile | off 5, def 6, mob 6, util 10, ctrl 8, risk 9 |
| Time Dilation | legendary | Temporal Controller | Primary | Expansive | off 7, def 9, mob 9, util 10, ctrl 10, risk 10 |
| Fire Control | core | Striker | Primary | Focused | off 9, def 4, mob 3, util 6, ctrl 7, risk 10 |
| Ice Control | core | Controller | Secondary | Focused | off 7, def 7, mob 5, util 8, ctrl 8, risk 7 |
| Electricity Control | core | Disruptor | Primary | Versatile | off 8, def 5, mob 6, util 8, ctrl 7, risk 8 |
| Flight | core | Responder | Utility | Focused | off 3, def 5, mob 10, util 8, ctrl 5, risk 4 |
| Portal Creation | legendary | Transporter | Utility | Expansive | off 5, def 7, mob 10, util 10, ctrl 8, risk 10 |
| Spellcraft | advanced | Arcane Specialist | Primary | Versatile | off 7, def 8, mob 5, util 10, ctrl 9, risk 9 |
| Invulnerability | core | Tank | Secondary | Focused | off 4, def 10, mob 3, util 6, ctrl 2, risk 5 |
| Super Strength | core | Brawler | Primary | Focused | off 9, def 5, mob 4, util 6, ctrl 3, risk 7 |
| Telekinesis | advanced | Controller | Primary | Expansive | off 8, def 8, mob 6, util 9, ctrl 10, risk 8 |
| Telepathy | advanced | Strategist | Primary | Focused | off 5, def 6, mob 2, util 10, ctrl 9, risk 9 |
| Invisibility | core | Infiltrator | Secondary | Focused | off 3, def 4, mob 6, util 9, ctrl 7, risk 6 |
| Technopathy | advanced | Systems Operator | Primary | Expansive | off 4, def 5, mob 3, util 10, ctrl 9, risk 8 |

## Category Details

### Physical

Body-first abilities built for force, endurance, and survival.

- Canon count: 2
- Imported count: 2811
- Total count: 2813
- Subcategories: Strength (1026), Durability (443), Size Change (305), Combat (618)

Canon powers:
- **Invulnerability**: Secondary, Focused; Extreme resistance to impact, heat, pressure, toxins, and environmental hazards.; tags: physical, core, tank.
- **Super Strength**: Primary, Focused; Amplified muscular output for lifting, striking, grappling, and structural rescue.; tags: physical, core, brawler.

Representative imported powers:
- **Causality Ability Generation**: Primary, Versatile; The ability to gain temporary abilities based on one's actions.; tags: cause, effect, power.
- **Ability Reader**: Primary, Versatile; The ability to See your  opponents/ally's powers and  skills.; tags: Ability Reader, sight, power, skill.
- **Angels Power**: Primary, Expansive; The ability to be half human half Archangel; tags: angelic, wings, spirtual, holy.
- **Healing Stone**: Primary, Versatile; The ability to Heal yourself by going into a stony  slumber.; tags: Stone, Healed, Health.
- **Hero Choosing**: Primary, Focused; The ability to choose the choosen one.; tags: main, character, choosen, one.
- **Probability Field Adaption**: Primary, Expansive; The ability to adapt based on the likelihood of might happen to you; tags: Adaption, Probable Events, Strength.
- **Instinctive Reality Warping**: Primary, Versatile; The ability to warp reality based on one's instincts and reflexes.; tags: Instincts, Reflex, Reality.
- **Instant Learning**: Primary, Expansive; The ability to instantly and perfectly learn any subject.; tags: Knowledge, Skills, Learn.
- **Axiokinesis**: Primary, Expansive; The ability to manipulate the value of things; tags: value, money, cheap, protection.
- **Advanced Regeneration**: Primary, Versatile; The ability to regenerate bodily damage; tags: regeneration, advanced, stronger, healing.
- **Aether Manipulation**: Primary, Expansive; The ability to manipulate the Aether.; tags: Aether, Nether, Manipulate.
- **Tele Automation**: Primary, Expansive; The ability to control any form of orderly process or system automatically via telekinesis.; tags: Automation, Telekinesis, Productivity.

### Elemental

Matter and climate control across fire, ice, air, earth, and storm states.

- Canon count: 2
- Imported count: 1236
- Total count: 1238
- Subcategories: Fire (566), Ice (264), Water (478), Earth (328), Air / Weather (473)

Canon powers:
- **Fire Control**: Primary, Focused; Ignition, shaping, heat regulation, and suppression of flame states.; tags: elemental, core, striker.
- **Ice Control**: Secondary, Focused; Freezing, shaping ice, reducing temperature, and creating slick or rigid terrain.; tags: elemental, core, controller.

Representative imported powers:
- **Power Versatility**: Primary, Expansive; The ability to make any ability apply to any situation.; tags: Situation, Ability, Application.
- **True Sword Mastery**: Primary, Versatile; The ability to use anything as a sword including nothing; tags: sword, cut, mystic, dugu qiubai.
- **Waveform Manipulation**: Primary, Expansive; The ability to convert one form of energy wave into another.; tags: Energy, Wave, convert, conversion.
- **Materialized Luck**: Primary, Expansive; The ability to possess extraordinary luck that takes on the form of a material.; tags: Luck, Materialization, conceptual.
- **Tactile Cryokinesis**: Primary, Expansive; The ability to control ice while either in direct contact with it, or in close proximity; tags: Ice, control, power, tactile.
- **Elemental Iris**: Primary, Expansive; The ability to control elements; tags: elemental, iris, element.
- **Infinite Supply**: Primary, Versatile; The ability to give any item/container an infinite supply.; tags: infinite, supply, epic.
- **Petrifactive Hibernation**: Primary, Versatile; The ability to enter a dormant state as a statue, from which the user emerges fully rejuvenated.; tags: stone, turned, to, petrifaction.
- **Ultimate Kinesis**: Primary, Expansive; The ability to control any element known to man.; tags: Ultimate, power, kinesis, fire.
- **Lexiconicy**: Primary, Expansive; The ability to transform a written word into the actual object; tags: dictionary, writing, spelling.
- **Answers**: Primary, Expansive; The ability to cause people to truthfully answer any question you ask them while look at them; tags: answers, questions, sight.
- **Elemental Weapons**: Primary, Expansive; The ability to form weapons out of the elements; tags: element, weapon, fire, water.

### Psychic

Mind, perception, emotion, and cognition as the operating surface.

- Canon count: 2
- Imported count: 1131
- Total count: 1133
- Subcategories: Telepathy (1133), Emotion (205), Illusion (189), Memory (143), Perception (311)

Canon powers:
- **Telekinesis**: Primary, Expansive; Remote manipulation of objects, pressure, barriers, and momentum fields.; tags: psychic, advanced, controller.
- **Telepathy**: Primary, Focused; Reading, transmitting, shielding, or influencing thoughts across active minds.; tags: psychic, advanced, strategist.

Representative imported powers:
- **Probability Falsification**: Primary, Expansive; The ability to hide or create false information, factor, or variables that affects probability..; tags: Falseness, Probability, Illusion.
- **Memory Sword**: Primary, Focused; The ability to Wield a sword and access the tactical knowledge and sword skills of previous wielders.; tags: Sword, Memory, Weapon.
- **Spectral Death Weapons**: Primary, Expansive; The ability to summon any weapon from a plane of death.; tags: death, mark, weapon.
- **Imaginative Causality**: Primary, Expansive; The ability to imagine any action in one's mind in order to create the effects in the real world.; tags: Causality, Imagination, Action.
- **Grandmaster Of All**: Primary, Expansive; The ability to be extremely, superbly talented at everything.; tags: skill, knowledge, experience, upgrading.
- **Storage**: Primary, Expansive; The ability to store info, powers, skills, mental defects, personality traits, memories or talents in objects; tags: Transference, Possession, Enchantment.
- **Theory Of Relativity**: Primary, Expansive; The ability to manipulate gravity and forces.; tags: Gravity, Manipulate, Psychokinesis, Orbit.
- **Psychic Powers**: Primary, Expansive; The ability to have a different psychic power every day; tags: psychic, power, psychokinesis, clairvoyance.
- **Natural Talent Power**: Primary, Expansive; The ability to increase your natural talents; tags: natural talents, talent, super powers.
- **Thought Weaponary**: Primary, Expansive; The ability to manifest various types of weapons through your imagination.; tags: manifest, weapons, create.
- **Library**: Primary, Expansive; The ability to know the contents of every single book ever written; tags: book, knowledge, library.
- **Quantakinesis**: Primary, Expansive; The ability to psychically manipulate numbers and quantities; tags: number, amount, quantity, how.

### Energy

Projection, absorption, shielding, and directed force manipulation.

- Canon count: 1
- Imported count: 525
- Total count: 526
- Subcategories: Blasts (230), Electricity (168), Light (166), Magnetism (49), Absorption (133)

Canon powers:
- **Electricity Control**: Primary, Versatile; Generation and routing of electrical charge through targets, grids, or fields.; tags: energy, core, disruptor.

Representative imported powers:
- **Electricity**: Primary, Versatile; The ability to can shoot electricity bolls, give power to stuff that doesn't have power, you can take power and you can…; tags: These powers can be very dangerous, they are very powerful, they need to be used for good not for bad..
- **Bio Energy Communication**: Primary, Expansive; The ability to communicate through one's bio-electrical field.; tags: biology, communication, frequency.
- **Energy Manipulation/Control**: Primary, Expansive; The ability to control many forms of energy; tags: energy, control, electricity, lasers.
- **Psionic Energy Manipulation**: Primary, Expansive; The ability to absorb and emit powerful psionic energy at will from both the mind AND the body; tags: mind, power, control, psionic energy.
- **Tactile Superpower Creation**: Primary, Expansive; The ability to turn anything the user touches into an external superpower that they can use.; tags: Power, Reforming, Usefulness, Touch.
- **Magno Solar Absorption**: Primary, Expansive; The ability to absorb the energy and magnetism of the sun for a weapon; tags: power, mind, control, magnetism.
- **Tactile Electrokinesis**: Primary, Expansive; The ability to control electricity by touching objects powered by it; tags: power, control, lightning, mind.
- **Shadow Kinetic Great Force**: Primary, Expansive; The ability to indirectly vampirize potiential energy to create a powerful force.; tags: Kinetic, Force, Absorb.
- **Electrophite**: Primary, Expansive; The ability to control electricity and manipulate it.; tags: electricity, electrophite, Power.
- **Pure Energy**: Primary, Expansive; The ability to blast pure energy from your eyes, hands, and/or entire body; tags: energy, blast, eyes.
- **Radiation Immunity**: Primary, Expansive; The ability to be immune to any kind of harmful radiation; tags: radiation, immunity, radiation immunity.
- **Infinite Energy Storage**: Primary, Expansive; The ability to store an infinite amount of energy within yourself.; tags: Infinite, Energy, Storage, Limit.

### Mobility

Movement powers that change distance, access, and escape windows.

- Canon count: 2
- Imported count: 414
- Total count: 416
- Subcategories: Speed (190), Flight (136), Teleportation (133), Portals (36), Phasing (22), Time Travel (32), Dimensional (72), Jumping (66)

Canon powers:
- **Flight**: Utility, Focused; Self-propelled aerial movement for rapid travel, scouting, and vertical access.; tags: mobility, core, responder.
- **Portal Creation**: Utility, Expansive; Opening stable passages between separate physical locations or dimensions.; tags: mobility, legendary, transporter.

Representative imported powers:
- **Situational Adaptation**: Utility, Expansive; The ability to have a superpower useful in a given situation; tags: Adaptation, Random, Omnipotent.
- **Jumper**: Utility, Expansive; The ability to teleport to any location on Earth.; tags: space-time, teleport, teleportation.
- **Memory Tap**: Utility, Versatile; The ability to travel back in time to the memory of another person.; tags: Time, travel, memory.
- **Physics Rejector**: Utility, Expansive; The ability to do anything you want because physics doesn't apply to you; tags: sonic, physics, Gravity, Fly.
- **Superhuman Energy**: Utility, Versatile; The ability to have increased levels of mental and psysical energy when you activate this power.; tags: Super speed, Fast, Quick, Energy.
- **Omnipotent Power Mimicry**: Utility, Expansive; The ability to have every power in the world; tags: omnipotent, one, world, every.
- **Teleportation**: Utility, Versatile; The ability to teleport yourself to any location.; tags: teleport, teleportation, move, moving.
- **Space/Time Manipulation**: Utility, Expansive; The ability to manipulate space and time; tags: time, psychic, space.
- **Door To Anywhere**: Utility, Versatile; The ability to use any door as a portal to any other door in the world.; tags: door, portal, transport, anywhere.
- **Memory/Sight  Jump**: Utility, Versatile; The ability to jump or teleport to places you have visited in the past; tags: memory, teleport, sight, jump.
- **Comic Word**: Utility, Focused; The ability to say comic words and make them happen; tags: non exhausting, cool, fantastic.
- **Shadow Walking**: Utility, Expansive; The ability to teleport through shadows; tags: shadow, teleportation, walking.

### Biological

Healing, mutation, adaptation, senses, and living-system control.

- Canon count: 2
- Imported count: 882
- Total count: 884
- Subcategories: Healing (883), Mutation (66), Shifting (329), Senses (255), Toxins (84)

Canon powers:
- **Healing Factor**: Secondary, Focused; Accelerated tissue repair, toxin processing, and recovery from physical trauma.; tags: biological, core, survivor.
- **Shapeshifting**: Primary, Versatile; Controlled biological transformation of appearance, size, structure, or function.; tags: biological, advanced, operative.

Representative imported powers:
- **Return To Self Genesis**: Secondary, Versatile; The ability to repair and heal any damage you cause; tags: Repair, heal, damage.
- **Useless Invisibility**: Secondary, Focused; The ability to be invisible when no one is watching you.; tags: invisibility, useless, animals, people.
- **Superpower Manifestation**: Secondary, Expansive; The ability to create superhuman abilities in a externalized form.; tags: External, Physical, Ability.
- **Rapid Cell Regeneration**: Secondary, Versatile; The ability to heal from any wound instantaneously.; tags: Healing, Everlasting, Immortality, ageless.
- **Reality Coder**: Secondary, Expansive; The ability to manipulate reality with a programming language; tags: code, coding, programmer, nerd.
- **Shifting Elements**: Secondary, Expansive; The ability to change and control all know elements through hand controls; tags: physics, chemistry, alchemy, hand controls.
- **Ultimate Shapeshifting**: Secondary, Versatile; The ability to become anything.; tags: Shape, shift, change.
- **Omni Solid Manipulation**: Secondary, Expansive; The ability to manipulate anything that is a solid or is solid matter.; tags: Omni, solid, manipulation, matter.
- **Shape Shifting**: Secondary, Versatile; The ability to morph yourself into any shape or size.; tags: shape, shift, change, body.
- **Regeneration**: Secondary, Expansive; The ability to reincarnate and heal; tags: regeneration, reincarnation, heal.
- **Healing Touch**: Secondary, Versatile; The ability to completely heal anyone afflicted with any disease or injury.; tags: heal, healing, ill, sick.
- **Shape Shifter Reality**: Secondary, Versatile; The ability to shape shift your form and make the world believe that is who you are.; tags: shape shift, reality wrap, warping.

### Tech

Invented, worn, deployed, or networked abilities powered by systems.

- Canon count: 1
- Imported count: 287
- Total count: 288
- Subcategories: Cyber (55), Machines (82), Gadgets (58), Armor (20), Weapons (159)

Canon powers:
- **Technopathy**: Primary, Expansive; Direct communication with, control over, or rapid understanding of digital systems.; tags: tech, advanced, systems operator.

Representative imported powers:
- **Shattersoul**: Primary, Versatile; The ability to cause any weapon you handle to remotely explode.; tags: Weapon, explosion, ranged.
- **Single Solution Causality**: Primary, Versatile; The ability to warp causality in order to make a single object or method become the solution to any problem.; tags: Causality, SIngle, Solution.
- **Physical Understanding**: Primary, Expansive; The ability to understand the inner workings, and physical aspects on any machine.; tags: Logical, Scientific, Useful invention.
- **Infinite  Weapon Arsenal**: Primary, Versatile; The ability to carry an infinite amount of weapons; tags: Infinite, Weapons, Arsenal.
- **Function Mimicry**: Primary, Expansive; The ability to mimic an object's primary function.; tags: Object, Copy, Function.
- **Hacking**: Primary, Expansive; The ability to hack anything; tags: Hack, Hacking, Hacker.
- **Ultimate Technopath**: Primary, Expansive; The ability to control any technology anywhere in the galaxy; tags: technology, technopath, technopathy, gadgets.
- **Tactile Efficiency**: Primary, Expansive; The ability to make any object or tool work/perform better when you are touching it.; tags: touch, tools, objects.
- **Weapon Summoning**: Primary, Expansive; The ability to summon any kind of weapon in existence.; tags: weapon, summoning, magic.
- **Feather Weight Touch**: Primary, Expansive; The ability to make anything as light as a feather by touching it.; tags: feather, weight, touch, lifting.
- **Transmutation**: Primary, Expansive; The ability to change ANYTHING into ANYTHING else one can clearly imagine; tags: change, anything, mutation.
- **Weapon Manipulation**: Primary, Expansive; The ability to psychically manipulate anything that is intended to be a weapon; tags: weapon, tool, fight, injury.

### Mystic

Ritual, symbols, artifacts, and reality rules outside normal science.

- Canon count: 1
- Imported count: 509
- Total count: 510
- Subcategories: Magic (510), Curses (61), Summoning (269), Spirits (157), Rituals (12)

Canon powers:
- **Spellcraft**: Primary, Versatile; Ritualized casting that produces shields, bindings, illusions, curses, or blessings.; tags: mystic, advanced, arcane specialist.

Representative imported powers:
- **Videogame Reality**: Primary, Expansive; The ability to make anything and anyone from any videogame real.; tags: Videogame, Reality, Real, Playstation2.
- **Real Gamer**: Primary, Expansive; The ability to use items from video games; tags: video games, items, summoning.
- **Unlock True Potential**: Primary, Expansive; The ability to unlock someone's true potential; tags: unlock, potential, increase, ability.
- **Astrakinesis**: Primary, Expansive; The ability to psychically manipulate psychic energy, ectoplasm and ectenic force; tags: psychic, spirit, soul, astral.
- **Arch Demon**: Primary, Expansive; The ability to become a demon; tags: Demon, Demonic, Other Form.
- **Summon**: Primary, Expansive; The ability to summon creatures from your imagination; tags: summon, magical, creature.
- **Supernatural Sense**: Primary, Expansive; The ability to be alerted when something Supernatural is where you are; tags: Supernatural, Warning, Sense.
- **Awakened Mage**: Primary, Expansive; The ability to cast your own personalized spells; tags: magic, custom, personalized, awakened.
- **Potion Creation**: Primary, Expansive; The ability to brew potions.; tags: potion, magic, drink, beverage.
- **Mythical Weapon Summon**: Primary, Expansive; The ability to summon any weapons use in any mythology; tags: weapons, mythology, summoning, magic.
- **Legend's Armory**: Primary, Expansive; The ability to summon objects from myth and legend.; tags: summon, weapons, magic, myth.
- **Divine Protection**: Primary, Expansive; The ability to be protected by an unknown force; tags: protection, help, unknown, divine.

### Cosmic

Large-scale powers tied to gravity, space, time, and universal forces.

- Canon count: 1
- Imported count: 639
- Total count: 640
- Subcategories: Space (300), Time (403), Gravity (48), Dimensions (272), Void (89)

Canon powers:
- **Time Dilation**: Primary, Expansive; Localized alteration of perceived or physical time rate for people and objects.; tags: cosmic, legendary, temporal controller.

Representative imported powers:
- **Weaponverse**: Primary, Expansive; The ability to Pull any imagined weapon from a separate personal dimension or armory.; tags: Weapon, dimension, infinite.
- **Imagination Manifestation**: Primary, Expansive; The ability to manifest your imagination into a physical being only you can see.; tags: imagination, manifestation, invisible, creative.
- **Imagination Creation**: Primary, Expansive; The ability to bring what ever you imagine to life within an area.; tags: imagine, creation, fantasy.
- **Reality Effect Manipulation**: Primary, Expansive; The ability to control or change how realities/dimensions affects people, objects, or etc. to give them effects.; tags: Reality, Dimension, Change, effects.
- **Portal Mastery**: Primary, Expansive; The ability to open portals to anywhere you can see in your mind, for travel or isolation in suspended time.; tags: Superpower, Portal, Dimensions.
- **Force Manipulation**: Primary, Expansive; The ability to manipulate all forces; tags: force, manipulation, gravity, friction.
- **Personal Realm**: Primary, Expansive; The ability to create your own realm.; tags: personal, realm, world, create.
- **Hysteresis**: Primary, Expansive; The ability to induce a metaphysical delay between cause and effect; tags: wait, delay, hinder, hindrance.
- **Solar Eater**: Primary, Expansive; The ability to absorb potential energy generated by stars.; tags: Stars, Sunlight, Sun, Energy.
- **Words Of Power**: Primary, Expansive; The ability to turn words into reality; tags: word, reality, change, create.
- **Limited Reality Manipulation**: Primary, Expansive; The ability to manipulate reality with certain limitations; tags: reality, manipulation, limited.
- **Space Time Warp**: Primary, Expansive; The ability to warp the fabric of the space-time continuum in any way; tags: space, time, warp, destruction.

### Stealth

Concealment, misdirection, infiltration, and precision control.

- Canon count: 1
- Imported count: 97
- Total count: 98
- Subcategories: Invisibility (46), Shadow (33), Silence (20), Disguise (19), Infiltration (98)

Canon powers:
- **Invisibility**: Secondary, Focused; Visual concealment through light bending, perception masking, or active camouflage.; tags: stealth, core, infiltrator.

Representative imported powers:
- **Powermatrix**: Primary, Versatile; The ability to have an indestructible gauntlet that provides you access to all your superhuman powers and abilities; tags: Power, Matrix, Gauntlet.
- **Invisibility**: Primary, Versatile; The ability to become invisible to the naked eye.; tags: invisibility, sneaky, transparent, locker rooms.
- **The Shadow Dragon**: Primary, Expansive; The ability to have all the powers over shadows and darkness; tags: fire, dragon, shadows, darkness.
- **Shadow Clone Technique**: Primary, Expansive; The ability to create clones of yourself by splitting your powers in two; tags: Clone, split, spying.
- **Darkness Manipulation**: Primary, Versatile; The ability to manipulate darkness and shadows; tags: Darkness, Manipulation, Shadows, Cloaking.
- **Shadow Speed**: Primary, Focused; The ability to able to move exceedingly fast within shadows; tags: shadow, super speed, ninjas.
- **Reflective Invisibility**: Primary, Expansive; The ability to turn yourself invisible by touching a mirror; tags: Mind, power, control, mirror.
- **Ghost Field**: Primary, Expansive; The ability to make fields of intangibility; tags: intangible, ghost, invisible.
- **Thief's Power**: Primary, Versatile; The ability to become an expert thief.; tags: sneak, steal, theif, fight.
- **Stealth Deception**: Primary, Versatile; The ability to cheat on any contest without the possibilty of being caught; tags: awesome, knowledge, wisdom.
- **Stealth**: Secondary, Versatile; The ability to become partially invisible and partially silent; tags: obscure, warp, difficult to see.
- **Event Cloak**: Secondary, Expansive; The ability to create a time gap within light; tags: light, invisibility, cloak.

## Full Imported Catalog

The complete imported list is intentionally stored as data, not prose documentation:

- Full normalized pool: `public/data/superpower-list-pool.json`
- Import manifest: `public/data/superpower-list-manifest.json`
- Import pipeline: `scripts/import-superpower-list.mjs`

The documentation lists every canon power and representative imported powers per category. The app itself is the source of truth for browsing every imported record with search, category filters, subcategory filters, source filters, role-fit filters, stat filters, sorting, and pagination.

