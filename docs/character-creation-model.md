# Character Creation Model

This document defines how Hero Forge Workshop should think about building a superhero. It is the design logic behind the Forge flow.

## Core Idea

A strong superhero is not just a list of powers. A strong superhero has:

- a source
- a signature
- support powers
- field use
- limits
- motivation
- story pressure

The app should help the user make those pieces work together.

## The Build Formula

```text
Origin
  + Primary Power
  + Secondary Powers
  + Utility Power
  + Drawbacks / Story Constraint
  + Motivation
  = Coherent Hero Draft
```

## Origin

Origin answers: how did this person get powers?

Origin should influence:

- which categories feel natural
- story premise
- identity tension
- recommended power ordering

Origin should not:

- count as a power
- become a card in the power library
- block the user from choosing other powers

Examples:

| Origin | Natural Power Families | Story Pressure |
| --- | --- | --- |
| Mutation / Gene | Biological, Psychic, Physical, Mobility | Body changes before identity catches up |
| Accident | Energy, Elemental, Biological, Physical | Someone or something caused the disaster |
| Experiment | Tech, Biological, Energy, Physical | The lab may still want control |
| Artifact / Relic | Mystic, Cosmic, Elemental, Tech | The object may have rules or a cost |
| Training | Physical, Stealth, Mobility, Tech | Skill can degrade, doubt can break focus |
| Alien / Species | Cosmic, Biological, Physical, Energy | Heritage creates duty or conflict |

## Primary Power

Primary answers: what is this hero known for?

Good Primary examples:

- Super Strength for a frontline rescue brawler
- Telepathy for a mindlock strategist
- Fire Control for an elemental striker
- Technopathy for a systems operator
- Portal Creation for a transporter

Primary should shape:

- hero name
- role/classification
- main conflict style
- strongest stat direction
- first story arc

Expansive Primary powers must be constrained. Time travel, reality warping, probability, cosmic force, and dimensional control need hard rules.

## Secondary Powers

Secondary answers: how does the hero's signature power become a complete kit?

Good Secondary powers:

- support the primary
- create combos
- cover one weakness
- add tactical personality
- stay related to the concept

Examples:

| Primary | Good Secondary | Why |
| --- | --- | --- |
| Super Strength | Invulnerability | Lets the hero survive frontline use |
| Fire Control | Flight | Adds mobility and rescue response |
| Telepathy | Invisibility | Enables stealth investigation |
| Portal Creation | Technopathy | Creates a spatial systems operator |
| Ice Control | Healing Factor | Adds rescue/survival theme |

Bad Secondary selection is random inventory building. If the user cannot explain why the powers belong together, the build needs refactoring.

## Utility

Utility answers: how does this hero function outside the main fight?

Utility covers:

- movement
- rescue
- scouting
- infiltration
- defense
- communication
- investigation
- escape

A hero with no utility can still be powerful, but the draft may feel less playable.

## Limits

Limits answer: what stops this hero from solving every problem instantly?

Limits come from:

- selected power weaknesses
- counters
- high risk
- broad scope
- user-entered story constraint

Limits should not be manually selected from the library. They should be extracted from the power kit.

Good limits:

- concentration dependent
- line of sight
- range limit
- cooldown
- collateral risk
- emotional cost
- artifact dependency
- public identity risk
- privacy/moral risk

## Motivation

Motivation answers: why do they keep fighting?

Examples:

- protect a neighborhood
- undo harm caused by their origin
- find the group that experimented on them
- repay a debt
- keep a dangerous artifact out of the wrong hands
- prove their humanity after mutation or alien discovery

Motivation should connect origin and powers to story action.

## Story Constraint

Story constraint is the custom cost/rule/range/cooldown field. It exists to balance broad powers and sharpen the story.

Examples:

- can only teleport to places they have personally seen
- fire control fails in low oxygen
- telepathy requires consent or physical contact
- artifact drains memory with each use
- time dilation ages the user faster
- technopathy cannot control isolated analog systems

## Quality Signals

| Signal | Good Build |
| --- | --- |
| Identity | Origin, civilian name, home base, and motivation are filled |
| Field Use | Kit has at least one practical non-combat use |
| Balance | Weaknesses or story constraint explain the power ceiling |
| Cohesion | Powers make sense together and support one readable concept |

## Naming

Hero names should come from:

- primary category
- primary power name
- origin pressure
- role/classification
- strongest visual or tactical motif

Names should not be random. They should communicate the build.

Examples:

| Build | Name Direction |
| --- | --- |
| Psychic + memory + blade theme | Mindblade, Echo Saber, Memory Edge |
| Mobility + teleportation + cosmic origin | Void Runner, Drift Vector, Orbit Step |
| Fire + accident + rescue motivation | Cinder Guard, Flashpoint, Emberline |
| Tech + armor + city defense | Circuit Warden, Iron Signal, Frameguard |

## Recommended App Behavior

- Prompt for origin early.
- Let origin bias the library but not restrict it.
- Make Primary/Secondary/Utility clear on every card.
- Show all selected powers together in review.
- Surface derived limits automatically.
- Flag broad Primary powers that need story constraints.
- Score quality as build completeness, not truth.
- Keep imported power rankings explainable and conservative.
