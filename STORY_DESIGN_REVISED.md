# 🏝️ Hedonism Island - Complete Story & System Design

**Genre:** Adult Survival RPG with Moral Complexity  
**Rating:** AO (Adults Only) - Explicit Sexual Content, Violence, Dark Themes  
**Core Theme:** Power, Identity, Colonialism, and the Will of the Land

---

## Table of Contents
1. [Core Premise](#core-premise)
2. [The Island's Will](#the-islands-will)
3. [Faction System](#faction-system)
4. [Population & Demographics](#population--demographics)
5. [The Castaway System](#the-castaway-system)
6. [Moral Backbone System](#moral-backbone-system)
7. [The Four Paths](#the-four-paths)
8. [NPC System & AI Generation](#npc-system--ai-generation)
9. [Content & Themes](#content--themes)
10. [Gameplay Systems](#gameplay-systems)

---

## Core Premise

You wake up on a beach with no memory of how you got here. Just fragments - feelings, skills, flashes of a life you can't quite grasp. The island is beautiful, dangerous, and alive. Others like you wash ashore, drawn by something you can't explain. 

**The island wants something. And it's pulling you all here for a reason.**

Three groups already inhabit this place:
- **The Castaways** - Lost souls like you, slowly arriving one by one
- **The Natives** - Two clans who've lived here for generations, now divided
- **The Mercenaries** - Ruthless exploiters with guns, greed, and no conscience

Your choices will determine:
- Which faction you align with (if any)
- How the island's story unfolds
- Whether you conquer, respect, exploit, or escape
- The fate of everyone trapped here

**This is a hardcore adult game.** Expect explicit sexual content, violence, moral complexity, and dark themes including slavery and sexual assault (particularly in the Mercenary path).

---

## The Island's Will

### The Core Mystery

**The island is sentient.** Not in a speaking, anthropomorphic way, but in the way a predator is aware of prey. It has agency, desire, and power.

**What it does:**
- **Pulls people through disasters** - Shipwrecks, plane crashes, lost boats
- **Erases memories** - Survivors remember skills/feelings, not facts
- **Influences weather and terrain** - Storms to trap, calm seas to lure
- **Empowers those who respect it** - Natives draw strength from the land
- **Resists those who harm it** - Resources dwindle, land fights back

**Why it does this:**
This is the **central mystery** of the game. Theories include:
- Ancient entity seeking worshippers
- Protective spirit defending sacred ground
- Hungry god feeding on human emotion/conflict
- Natural force maintaining balance
- Prison for the damned
- Gateway to something beyond

**Different paths reveal different truths:**
- **Claim Path:** You're perpetuating a cycle of colonialism the island has seen before
- **Respect Path:** The island is a guardian, and you've finally learned to listen
- **Exploit Path:** The island is a resource to be dominated, and you're breaking its will
- **Leave Path:** The island is a trap, and you're the first to escape its gravity

### Mechanical Impact

The island's will manifests as:

**Environmental Responses:**
- Respect natives → Bountiful harvests, calm weather, animal cooperation
- Exploit resources → Storms, landslides, predator attacks, resource depletion
- Build too much → Earthquakes, sinkholes, structural collapses
- Desecrate sacred sites → Immediate hostile response

**Castaway Arrival Rate:**
- Low population → More frequent arrivals
- High conflict → More diverse skill sets arrive (island sends what you need)
- Near endgame → Arrivals slow or stop (island's purpose fulfilled or rejected)

**Faction Interactions:**
- Natives in tune with island's will → Never lost, always know where resources are
- Mercenaries fighting the island → Constant accidents, bad luck, mysterious deaths
- Player's alignment → Island helps or hinders based on actions

### Breaking the Island's Will (Exploit/Claim Paths)

To truly "conquer" the island, you must:
1. **Desecrate all sacred sites** (removes native power)
2. **Extract massive resources** (weaken the land itself)
3. **Establish permanent structures** (impose human order)
4. **Kill or subjugate the natives** (remove those in tune with the land)
5. **Signal for rescue/development** (break the isolation)

**Consequence:** The island becomes mundane. Magic fades. It's just land now. You've won... but at what cost?

---

## Faction System

### Total Island Population: 80-100 NPCs

**Dynamic Population:**
- NPCs can die (combat, execution)
- NPCs can be enslaved (Exploit path, combat can be "Non-Lethal" depending on weapons, downed enemies can be released, killed or enslaved)
- New NPCs arrive to replace losses (island's will pulls more)
- Population maintains thematic balance unless player actively disrupts it
- Population of any faction is directly correlated to the land that faction "Owns" or controls. More land -> more Resources -> more power
  - To expand on this, if you are attempting to erradicate the mercanary faction and you reclaim their stolen land, as their controlled tiles dwindle, so will their numbers.


---

### 1. The Castaways (~30-40 NPCs, including player, expands as "Castaway" land control increases)

**Who They Are:**
- Survivors from different disasters spanning months or years
- Each arrived separately, alone or in pairs, three at a time AT MOST (rare)
- Memory-wiped by the island - remember skills/personality, not history
- Slowly building a community through shared trauma

**Player is the first castaway the game follows, but not necessarily the first to arrive.**

#### The Amnesia Mechanic

**What They Remember:**
- ✅ **Skills & Vocations** - "I'm a doctor" (but not where they practiced)
- ✅ **Personality traits** - Brave, cautious, kind, ruthless, this will be A HUGE pool. Every individual should feel like an individual.
- ✅ **General knowledge** - How to build, cook, fight, etc.
- ✅ **Emotional impressions** - "I had someone I loved" (but not who)
- ✅ **Moral framework** - Their basic values intact
- ✅ **Names** - They can recall that much about themselves.

**What They Don't Remember:**
- ❌ **Where they came from** (country, city, home)
- ❌ **How they got here** (memories of their disasters are vague or blank)
- ❌ **Personal history** (family, friends, career details)
- ❌ **Time passage** (don't recall how long they have been "missing" from the world)

**Why This Matters:**
- Creates blank slate for player choice (no "I have a wife at home" obligations)
- Allows focus on island conflicts, not rescue obsession
- Mystery element (why does the island do this?)
- Freedom to rebuild identity through gameplay
- Some NPCs slowly remember things (quest opportunities)

#### Castaway Arrival System

**Frequency:** 1 new castaway every 2-4 in-game days (random, affected by island will)

**Discovery Methods:**
1. **Beach Arrivals** (50%) - Wash up on shore, player finds them
2. **Island Interior** (30%) - Been here longer, hiding or surviving alone
3. **Rescue Missions** (20%) - Trapped, injured, or captured by mercenaries
4. **Recruitment Efforts** - While castaways can be found by accident, they do have to be found. The system will generate one on specific tiles, and then the player has a %chance of finding them by exploring that tile. Castaways can move around before being found but will tend to stick closer to the beaches/less dense jungle.

**Arrival Triggers:**
- Random timer (background system)
- Story needs (island sends specific skills when needed)
- Population loss (island replenishes if below threshold)
- Player actions (exploiting island reduces arrivals)

**First Encounter:**
- Procedural introduction scene (AI-generated)
- Memory confusion dialogue ("Who am I? Who are you?")
- Skill assessment (what can they contribute?)
- Personality reveal (how do they react to situation?)
- Choice: Invite to camp, help then leave them, ignore, or exploit

#### Castaway Community Structure

**No fixed leadership initially.** Emerges organically based on:
- Player's reputation and choices
- NPC personalities (some natural leaders, some followers)
- Crisis moments (who steps up?)
- Faction alignment (democratic vs. authoritarian)

**Potential roles NPCs fill:**
- **Doctor/Healer** - Medical care, reduces death risk
- **Builder** - Construction, faster/better structures
- **Hunter** - Food provider, combat capable
- **Farmer** - Sustainable food, requires setup time
- **Scout** - Exploration, finds resources
- **Craftsman** - Tools, weapons, upgrades
- **Diplomat** - Native relations, negotiation
- **Enforcer** - Security, combat, intimidation
- **Spiritual** - Morale, rituals, meaning


**Player naturally fills the Leader role, and NPC's will often ask for guidance/help. Though reputation can impact their attitude/thankfulness**

#### Castaway Fates

Depending on path:
- **Claim Path:** Core of new society, democratic community
- **Respect Path:** Some integrate with natives, some stay separate but respectful
- **Exploit Path:** Enslaved, killed, or join mercenaries out of fear
- **Leave Path:** Some join escape, others left behind

---

### 2. The Natives (~40-50 NPCs, two clans)

**Population Breakdown:**
- **Tidal Clan (Seaside Village):** ~25 NPCs
- **Ridge Clan (Mountain Village):** ~20 NPCs
- **Elders/Leaders:** 3-5 key NPCs (scripted)
- **General population:** Rest are procedural

#### The Two Clans

**Tidal Clan (Coastal/Fishing Focus)**
- **Location:** Beachside village, near river mouth
- **Specialty:** Fishing, sailing, trade, diplomacy
- **Philosophy:** "Adapt and flow like water"
- **Attitude:** More open to outsiders, pragmatic
- **Leadership:** Elder Council of 3 (matriarchal)
- **Conflict stance:** Negotiate with castaways, avoid mercenaries

**Ridge Clan (Mountain/Hunting Focus)**
- **Location:** Highland village, near sacred peak
- **Specialty:** Hunting, warfare, spiritual practices
- **Philosophy:** "Stand firm like stone"
- **Attitude:** Traditional, suspicious of outsiders
- **Leadership:** Single Chieftain (chosen by trial)
- **Conflict stance:** Defend sacred sites, eliminate mercenary threat

#### The Clan Tension

**Historical split** ~50 years ago over:
- How to handle first shipwreck survivors (Tidal welcomed, Ridge expelled)
- Resource sharing disputes (coastal vs. mountain resources)
- Spiritual interpretation (flexible vs. rigid traditions)

**Current status:** Peaceful but cold. They:
- Don't intermarry anymore
- Have separate ceremonies
- Trade minimally
- Disagree on handling new arrivals

**The mercenaries exploit this division:**
- Play clans against each other
- Raid one, blame the other
- Prevent unified resistance

**Player's Role:**
- Can unite the clans (Respect path requirement)
- Can exploit division (Exploit path opportunity)
- Can side with one over the other (Claim path complication)
- Can ignore entirely (Leave path option)

#### Native Culture (Original, Not Based on Real-World)

**To avoid misrepresentation, creating unique culture:**

**Spiritual Beliefs:**
- **"The Pulse"** - Life force flowing through all things
- **Sacred sites** - Places where Pulse is strongest
- **Ancestor reverence** - Past generations guide from beyond
- **Seasonal rituals** - Align with island's natural cycles
- **Dream walking** - Shamans can enter spirit realm

**Social Structure:**
- **Matrilineal** - Heritage through mother's line
- **Council leadership** - Elders make decisions together
- **Age-based respect** - Young listen, old teach
- **Skill-based roles** - Everyone contributes based on ability
- **Communal property** - Land belongs to all, personal items are private

**Values:**
- **Balance** - Take only what you need
- **Respect** - For land, ancestors, and each other
- **Hospitality** - Feed strangers, but protect sacred spaces
- **Reciprocity** - Gift for gift, help for help
- **Strength** - Physical and spiritual courage valued

**Taboos (Tapu):**
- Entering sacred sites without permission (punishable by death)
- Taking more than you need (upsets the Pulse)
- Disrespecting elders (social exile)
- Breaking sworn oaths (spiritual consequences)
- Harming pregnant women or children (worst crime)

**Language:**
- Original constructed language (simple vocabulary for game)
- Player can learn it (Respect path requirement)
- Understanding unlocks deeper dialogue/quests
- Some NPCs speak broken English/common tongue

#### Native-Player Interactions

**Initial Contact:**
- Cautious observation (they've seen castaways before)
- Test of character (how does player respond to challenges?)
- Gradual trust building or immediate hostility

**Possible Relationships:**
- **Allies:** Help against mercenaries, teach skills, trade
- **Neutral:** Keep distance, occasional trade, no conflict
- **Hostile:** Defend territory, attack on sight in sacred areas
- **Integrated:** (Respect path) Full clan membership

**Romance Options:**
- All natives are theoretically romanceable (once trust is established)
- Cultural differences explored (not fetishized)
- Player must prove worth, learn customs
- Relationships have social impact (clan reputation)

#### Native Response to Paths

**Claim Path:**
- Negotiate boundaries (keep sacred lands)
- Wary but pragmatic
- Some young natives defect to castaways
- Elders maintain separation
- "They'll destroy what we protect, but we're too few to stop them"

**Respect Path:**
- Test player rigorously
- Slow acceptance
- Eventually integrate player into clan
- United front against mercenaries
- "You understand. You are one of us now."

**Exploit Path:**
- Open warfare
- Guerrilla tactics
- Some captured/enslaved
- Others hide in sacred sites
- Final stand if player pushes too far
- "You are the enemy. We will fight until none remain."

**Leave Path:**
- Neutral but sad
- "You could have stayed. But we understand freedom."
- May help with boat-building (respect earned)
- Ask player to keep island secret
- Gift and blessing for journey

---

### 3. The Mercenaries (~20-25 NPCs)

**Who They Are:**
- NOT castaways (they came here intentionally or were here already)
- Mix of: poachers, smugglers, treasure hunters, criminals on the run
- Armed with modern weapons (guns, explosives)
- Organized under ruthless hierarchy
- Exploiting island for maximum profit

**Leadership Structure:**
1. **Vance Creed** - De facto leader (scripted major NPC)
2. **Lieutenant tier** - 2-3 trusted seconds (scripted or high-tier AI)
3. **Soldier tier** - 10-15 armed members (mostly AI-generated)
4. **Slave tier** - Captured natives/castaways (player-created through actions)

#### Why They Have Power

Despite being outnumbered, mercenaries dominate through:
- **Firearms** - Natives have bows/spears, castaways have nothing (at first, tools require crafting or trade)
- **Tactical knowledge** - Trained fighters vs. civilians
- **Ruthlessness** - No moral limits, use terror tactics
- **Resources** - Stole/brought supplies (medicine, tools, ammo)
- **Base location** - Fortified compound, defensible position

#### What They Want

**Primary Goal: Strip the island of resources**
- Gold deposits (rumored to exist)
- Rare minerals and gems
- Exotic animal products (pelts, tusks)
- Timber (valuable hardwoods)
- Anything that can be sold

**Secondary Goal: Control the population**
- Enslave natives for labor/sex
- Intimidate castaways into compliance
- Sexual exploitation (rape is tool of control)
- Eliminate resistance

**Long-term Plan:**
- Extract maximum value
- Eventually signal for "rescue" (actually extraction team)
- Claim discovery rights, sell island location
- Leave nothing but ruins

#### Mercenary Methodology

**Terror Tactics:**
- Public executions/punishments
- Rape as weapon of war
- Destroy native sacred sites (break their spirit)
- Kidnap children (force compliance)
- Burn villages (show dominance)

**Economic Control:**
- Monopolize best resources
- Demand tribute from natives/castaways
- Trade guns/medicine for obedience
- Create dependency

**Divide and Conquer:**
- Play clans against each other
- Turn castaways into informants
- Reward collaborators
- Punish resistance severely

#### Joining the Mercenaries (Exploit Path)

**Requirements:**
- Prove ruthlessness (commit atrocity)
- Bring valuable resource/information
- Demonstrate combat capability
- Show zero empathy

**Benefits:**
- Access to weapons
- Protection and power
- Share in plunder
- Multiple partners (forced or "rewarded")
- Fast resource accumulation

**Costs:**
- Moral degradation (tracking mechanic)
- Paranoia (everyone is threat or tool)
- Isolation (trusted by no one)
- Inevitable rebellion/downfall

**Player can rise to leadership** by:
- Outperforming in raids
- Bringing in major score
- Challenging Vance (combat/cunning)
- Proving more ruthless

#### Defeating the Mercenaries

**Required for Claim/Respect Paths:**

**Claim Path Approach:**
- Unite castaways into militia
- Negotiate native alliance (temporary)
- Cut off supply lines
- Siege compound
- Final assault

**Respect Path Approach:**
- Unite both native clans
- Guerrilla warfare tactics
- Spiritual/magical assistance (island helps)
- Sabotage and ambush
- Turn mercenaries against each other

**Exploit Path:**
- Join them, then take over from within
- OR eliminate them as competition

#### Mercenary Fates

- **Claim/Respect Paths:** Killed, imprisoned, or exiled
- **Exploit Path:** Player leads them or competes with them
- **Leave Path:** Left as someone else's problem

---

## Population & Demographics

### Total Population Management

**Target Range:** 80-100 NPCs total across all factions

**Breakdown:**
- Castaways: 30-40 (including player)
- Natives (Tidal): 20-25
- Natives (Ridge): 15-20
- Mercenaries: 15-25
- Slaves/Prisoners: Variable (Exploit path)

### Dynamic Population System

**NPCs can:**
- ✅ Die (combat, disease, accidents, execution)
- ✅ Leave (exile, join different faction)
- ✅ Arrive (castaways wash up)
- ✅ Be born (long-term gameplay, children)
- ✅ Change faction (defection, capture, integration)

**The Island's Will maintains thematic balance:**
- Low population → More frequent castaway arrivals
- Faction decimated → Island "attracts" replacements of that type
- Excessive exploitation → Fewer arrivals (island dying)
- Perfect harmony → Arrivals slow (island satisfied)

**No hard-coded population requirements** - It's organic and reactive.

### Gender Distribution System

**Player-Controlled Sliders (Settings Menu):**

```
Gender Distribution:
100% total.
Genders can be Male, Female, Futanari, Cuntboy, non-binary

Castaway Gender Ratio: [Slider]
Native Gender Ratio: [Slider]
Mercenary Gender Ratio: [Slider]

Apply to: New NPCs Only, if change is made after generation, previous NPC's are not overwritten
```

**Functionality:**
- Sliders for each faction
- Can set different ratios per faction
- New NPCs generated according to ratio

**Why This Matters:**
- Player preference for romantic/sexual content
- Representation options
- Replayability (different dynamics each run)
- Accessibility (some players want all-female cast, etc.)

**Mechanical Impact:**
- No gameplay penalties for gender choice
- Roles gender-neutral (female warriors, male healers, etc.)
- Romance available regardless (all orientations represented)

---

## The Castaway System

### Discovery & Integration

#### Phase 1: Discovery
**Triggers:**
- Random event timer (3-7 days)
- Story beat (island sends specific skill)
- Player exploration (find hidden castaway)
- Faction quest (rescue mission)

**Discovery Scenarios:**
1. **Beach Arrival**
   - Unconscious on shore
   - Player choice: Help, rob, ignore, enslave
   - First impression matters

2. **Interior Discovery**
   - Been here weeks/months
   - Hiding or surviving alone
   - May be suspicious/grateful

3. **Rescue Needed**
   - Trapped (tide pool, cave-in, injured)
   - Captured by mercenaries
   - Player must save them

4. **They Find You**
   - Approach your camp
   - Seeking help/community
   - Trust or turn away?

#### Phase 2: Assessment
**AI Generation During Discovery:**
- Name and appearance (2 minutes background generation)
- Personality traits (generated during conversation)
- Skill/vocation (determined by island's needs + randomness)
- Background feelings (vague memories)
- Sexual preferences (for romance mechanics)

**Player Learns Through Interaction:**
- Dialogue reveals personality
- Observation reveals skills
- Time reveals trustworthiness

#### Phase 3: Integration
**Player Choices:**
1. **Welcome to camp** - Full community member
2. **Keep at distance** - Ally but separate
3. **Exploit** - Force labor/sexual servitude
4. **Turn away** - They leave (may return with different faction)
5. **Kill** - Immediate removal (reputation hit)

**Camp Integration Mechanics:**
- Assigned role (based on skill)
- Housing (share space or build new)
- Resource contribution
- Social bonds with other NPCs
- Romance possibility

### Memory & Identity

**Progressive Memory Recovery:**
- Some NPCs slowly remember fragments
- Triggers: Visiting certain locations, specific events, dreams
- Quest opportunity: Help NPC recover full memory
- Consequence: May want to leave island to return home

**Identity Rebuilding:**
- NPCs adopt new names (or player names them)
- Form new relationships (island is their life now)
- Develop skills they didn't know they had
- Personality evolves based on island experiences

**The Mystery:**
- Why does the island erase memories?
- Is it protective (forget trauma)?
- Is it predatory (make them stay)?
- Is it natural (side effect of arriving)?
- **Answer varies by path chosen**

---

## Moral Backbone System

### Dynamic Morality (No Hard Locks)

**Core Principle:** Morality is fluid throughout the game. Your reputation and path emerge from consistent actions, not single choices.

#### Reputation System

**Four Reputation Tracks:**
1. **Castaway Reputation** (-100 to +100)
2. **Native Reputation** (-100 to +100, separate per clan)
3. **Mercenary Reputation** (-100 to +100)
4. **Island Favor** (-100 to +100) - The land itself

**Reputation Effects:**
- -100 to -51: **Hostile** (attack on sight, refuse all interaction)
- -50 to -1: **Unfriendly** (cold, refuse help, avoid you)
- 0 to 25: **Neutral** (cautious, transactional only)
- 26 to 50: **Friendly** (help willingly, trust building)
- 51 to 75: **Trusted** (share resources, protect you)
- 76 to 100: **Beloved** (family-level loyalty, die for you)

#### Morality Tracking

**Alignment Spectrum (Not Visible to Player):**
```
Respect <----[====|=====]----> Exploit
      -100              0              +100
```

**Actions modify this score:**

**Respect Actions (+points):**
- Help others without expecting reward (+2 to +10)
- Share resources fairly (+1 to +5)
- Learn native language/customs (+5)
- Protect sacred sites (+10)
- Defend the weak (+5)
- Keep promises (+3)
- Refuse mercenary offers (+5)
- Environmental care (+2)

**Exploit Actions (-points):**
- Take more than fair share (-2 to -5)
- Lie or manipulate (-3 to -7)
- Violence against innocents (-10 to -30)
- Rape or sexual coercion (-50)
- Enslavement (-40)
- Desecrate sacred sites (-20)
- Join mercenary raids (-15)
- Break promises (-5)
- Environmental destruction (-10)

**The Score Determines:**
- Which faction trusts you
- Which quests are available
- NPC reactions to you
- Island's environmental responses
- Endgame path possibilities

**No Single Point of No Return:**
- Can shift morality late-game (redemption or fall)
- Extreme actions lock out certain paths (genocide = can't join natives)
- But generally fluid until final act

#### Conversation System Impact

**NPC Interactions Affect Morality:**

**Dialogue Tone Tracking:**
- **Aggressive:** Threats, demands, insults
- **Manipulative:** Lies, flattery, exploitation
- **Neutral:** Transactional, direct, businesslike
- **Friendly:** Kind, helpful, collaborative
- **Romantic:** Flirty, intimate, emotional

**Consistent Behavior Patterns:**
- Always aggressive → Reputation as brute/bully
- Always manipulative → Reputation as liar/untrustworthy
- Always friendly → Reputation as kind/leader
- Always romantic → Reputation as passionate/flirt
- Mixed → Reputation as complex/unpredictable

**NPC Memory:**
- Remember how you treated them specifically
- Share experiences with others (word spreads)
- Hold grudges or develop loyalty
- May forgive or never forget

**Examples:**

*Meeting a new castaway:*
- **Aggressive:** "You'll work for your keep or starve." → Fear-based compliance, -Reputation
- **Friendly:** "Welcome. You're safe now. Let's get you settled." → Trust, +Reputation
- **Romantic:** "You're beautiful. Stay close to me." → Depends on their reaction (wanted = positive, unwanted = negative)
- **Manipulative:** "I saved your life. You owe me." → Short-term compliance, long-term resentment

*Negotiating with natives:*
- **Aggressive:** "Give us access or we'll take it." → Hostility, possible combat
- **Respectful:** "We seek permission to fish here." → Opens dialogue
- **Exploitative:** "We'll trade you trinkets for gold." → Insult, relationship damage

---

## The Four Paths

### Path Emergence System

**Paths are not chosen, they emerge from consistent behavior.**

**Emergent Path Indicators (Player Sees):**
- Reputation screen shows faction standings
- Journal entries reflect player's philosophy
- NPC comments reference your approach
- Environmental changes (island response)

**Path Crystallization:**
Late in the game, player is presented with **Final Commitment Moment** for each path:
- "This is who you are. Confirm your path?"
- Can refuse and continue on current trajectory
- Ultimate endgame determined by final arc actions

### Path 1: CLAIM THE ISLAND (Colonial Democracy)

#### Requirements to Unlock
- Castaway Reputation: 60+
- Native Reputation: -25 to +50 (not hostile, but not integrated)
- Mercenary Reputation: -50 or lower (enemy)
- Island Favor: -10 to +30 (tolerated but not embraced)
- Population: 25+ castaways in your community

#### Core Philosophy
"We didn't ask to be here, but we'll make the best of it. Together, we can build something better than what we left behind."

#### The Path Forward

**Phase 1: Community Building**
- Establish democratic governance (elections, councils)
- Build permanent structures (houses, farms, walls)
- Develop sustainable resource systems
- Create laws and social order

**Phase 2: Territory Negotiation**
- Approach natives diplomatically
- Negotiate borders (they keep sacred lands)
- Establish trade agreements
- Mutual defense pact against mercenaries

**Phase 3: Mercenary Elimination**
- Unite castaways into militia
- Train with native tactics (if alliance good)
- Siege mercenary compound
- Final battle

**Phase 4: Nation-Building**
- Signal for rescue (optional)
- Decide: Tourism development or isolationism?
- Balance native relations with expansion
- Establish permanent society

#### Moral Complexity

**What You're Doing Right:**
- Democratic governance (all voices heard)
- Consensual community
- Respecting native boundaries
- Defeating evil (mercenaries)
- Providing safety and order

**What You Can't Escape:**
- Still colonialism (claiming land not yours)
- Cultural erosion (natives influenced by contact)
- Environmental impact (development changes island)
- Paternalism ("we'll govern ourselves AND trade with you")
- The island's will is being ignored/suppressed

**NPCs Will Challenge You:**
- Natives: "You say you respect us, but you claim our ancestors' land."
- Castaways: "Are we building a democracy or a dictatorship?"
- The Island: Subtle resistance (poorer harvests, more storms)

#### Endgame: THE GOVERNOR

**Endless Mode Gameplay:**
- **City Management:** Build/upgrade structures (town hall, farms, workshops, temple, docks, walls)
- **Population Management:** New arrivals, births, deaths, elections
- **Resource Economy:** Production, trade, consumption, storage
- **Native Relations:** Ongoing diplomacy, trade deals, cultural exchange
- **External Threats:** Pirate raids, rescue ships (opportunity or threat?), natural disasters
- **Political Drama:** Factions within castaways, elections, policy debates
- **Development Choice:** Isolationist paradise vs. tourist destination
- **Law System:** Create and enforce laws, court system, crime and punishment

**Tourism Development (If Rescue Signaled):**
- Build resort structures
- Attract wealthy visitors
- Economic boom
- Native culture commodified
- Lose isolationist paradise

**Victory Condition:** None. Keep society thriving indefinitely.

#### Romance & Sexual Content

**Themes:**
- Democratic free love (consent-focused)
- Power dynamics (earned status, not forced)
- Celebratory sexuality (festivals, parties)
- Relationship diversity (monogamy or polyamory available)
- Integration attempts (castaway-native relationships)

**Scenarios:**
- Election victory celebrations
- Harvest festivals
- Diplomatic sealing-the-deal intimacy
- Leadership comes with admirers
- Building relationships through shared governance

---

### Path 2: RESPECT THE LAND (Native Integration)

#### Requirements to Unlock
- Native Reputation (Tidal): 65+
- Native Reputation (Ridge): 65+
- Island Favor: 50+
- Mercenary Reputation: -75 or lower (bitter enemy)
- Learned native language (skill check)
- Completed clan unity quest

#### Core Philosophy
"This land has guardians. We're not here to take—we're here to learn, protect, and earn our place."

#### The Path Forward

**Phase 1: Earning Trust**
- Learn language (skill progression)
- Participate in daily life (hunting, gathering, ceremonies)
- Defend villages from mercenary raids
- Respect tapu (never violate sacred sites)
- Show humility (acknowledge you're the outsider)

**Phase 2: Clan Unity**
- Understand the historical split
- Complete quests for both clans
- Mediate disputes
- Prove value to both sides
- Facilitate reunion ceremony

**Phase 3: The Test**
- Ritual initiation (spiritual/physical trial)
- Vision quest (encounter island's will directly)
- Acceptance by both clans
- Given native name
- Become true member

**Phase 4: The Defense**
- United clans + integrated castaways vs. mercenaries
- Guerrilla warfare tactics
- Island itself aids you (storms, landslides at key moments)
- Spiritual warfare (shamans vs. guns)
- Decisive victory

**Phase 5: Integration**
- Live within native structure
- Teach other willing castaways native ways
- Small respectful castaway village nearby
- Maintain balance and tradition

#### Moral Complexity

**What You're Doing Right:**
- Anti-colonial praxis (recognize indigenous sovereignty)
- Cultural humility (learning, not teaching)
- Environmental stewardship
- Defeating exploitation (mercenaries)
- Spiritual growth

**The Uncomfortable Questions:**
- Can outsiders ever truly "become" native?
- Are you performing culture or living it?
- What about castaways who don't want this path?
- Is hiding the island from rescue ethical (denying others escape)?
- Are you noble savage romanticizing?

**NPCs Will Challenge You:**
- Natives: "You wear our clothes and speak our tongue, but are you one of us or playing dress-up?"
- Other Castaways: "You've abandoned us for them. We're still your people."
- Yourself: "Have I lost who I was to become who they need?"

#### Endgame: THE GUARDIAN

**Endless Mode Gameplay:**
- **Seasonal Cycles:** Spring planting, summer gathering, fall harvest, winter ceremonies
- **Skill Mastery:** Hunting, fishing, crafting, spiritual progression
- **Ceremonies & Rituals:** Participate in weekly/monthly/seasonal events
- **Teaching Role:** New castaways arrive, you help integrate them (or turn them away)
- **Sacred Site Defense:** Random threats (mercenary remnants, treasure hunters, natural disasters)
- **Family & Relationships:** Marriage, children (raising next generation)
- **Spiritual Growth:** Unlock deeper practices, become shaman/elder
- **Story Keeping:** Record history, teach language, preserve culture
- **Island Communion:** Direct interaction with the island's will

**Quiet Life Simulator:**
- No big battles (conflict resolved)
- Focus on daily rhythms and meaning
- Relationship deepening
- Spiritual progression
- Community maintenance

**Victory Condition:** Inner peace and cultural mastery (spiritual "levels")

#### Romance & Sexual Content

**Themes:**
- Ritual sexuality (sacred, not casual)
- Polyamory as cultural norm (some clans practice this)
- Coming-of-age ceremonies
- Fertility celebrations
- Spiritual union (sex as connection to the Pulse)
- Nature/outdoor intimate settings
- Deep emotional bonds

**Scenarios:**
- Initiation rituals (tasteful, consensual)
- Seasonal fertility festivals
- Marriage ceremonies (different structure than modern)
- Sacred grove encounters
- Moonlit beach intimacy
- Teaching and being taught

**Difference from Claim Path:**
- More spiritual/meaningful framing
- Less casual/recreational
- Community-blessed (not hidden)
- Connection to land/nature element

---

### Path 3: EXPLOIT THE ISLAND (Mercenary Rule)

**⚠️ CONTENT WARNING: This path contains slavery, rape, extreme violence, and moral degradation. ⚠️**

#### Requirements to Unlock
- Mercenary Reputation: 60+
- Moral Alignment: -50 or lower (exploitative actions)
- Committed atrocity (raided village, enslaved NPC, or killed innocent)
- Island Favor: -75 or lower (land hates you)

#### Core Philosophy
"Power is the only truth. The strong take what they want. Mercy is weakness."

#### The Path Forward

**Phase 1: Proving Ruthlessness**
- Approach mercenaries (or they recruit you after witnessing cruelty)
- Initiation test (commit atrocity to prove loyalty)
- Gain access to weapons and supplies
- Begin participating in raids

**Phase 2: Rise Through Ranks**
- Complete mercenary missions (raids, kidnapping, assassination)
- Bring valuable intelligence or resources
- Demonstrate combat prowess
- Eliminate rivals within the faction
- Become lieutenant

**Phase 3: Subjugation**
- Raid native villages (kill resistors, enslave survivors)
- Capture castaways (recruit or enslave)
- Desecrate sacred sites (break native morale)
- Establish dominance through terror

**Phase 4: Seizing Power**
- Challenge Vance for leadership (or support his total domination)
- Consolidate control
- Maximize resource extraction
- Build fortress/compound

**Phase 5: Total Dominance**
- Control entire island
- Slave labor force
- Broken resistance
- Signal extraction team (or keep kingdom to yourself)

#### Moral Complexity

**The Path's "Logic":**
- Survival of the fittest (natural selection)
- Honesty (no pretense of morality like Claim path)
- Efficiency (gets results fast)
- Freedom from social constraints
- Power fantasy fulfillment

**The Reality:**
- You're the monster
- Built on suffering
- Hollow victory (no one truly loyal)
- Paranoia and fear
- Losing humanity piece by piece

**NPCs Will React:**
- Slaves: Broken, terrified, plotting revenge
- Mercenaries: Respectful but waiting for you to show weakness
- Natives: Undying hatred, guerrilla resistance
- Island: Actively fighting you (storms, accidents, disease)

#### Degradation Mechanics

**Mental State Tracking:**
- Start: Ruthless but sane
- Mid: Paranoid, seeing threats everywhere
- Late: Psychotic breaks, hallucinations
- End: Megalomaniacal or broken

**Consequences:**
- NPCs plot rebellion (ongoing threat)
- Island causes "accidents" (falling trees, landslides)
- Disease spreads in slave camps
- Resources become harder to extract (island resists)
- Loyalty always questionable
- Sleep plagued by nightmares

#### Endgame: THE WARLORD

**Endless Mode Gameplay:**
- **Territory Control:** Expand or maintain dominance
- **Slave Management:** Keep them working, suppress rebellion
- **Resource Extraction:** Strip-mine island (timer-based depletion)
- **Combat:** Constant skirmishes with resistance
- **Fortification:** Build walls, traps, defenses
- **Internal Threats:** Mercenaries plotting against you
- **External Threats:** Rescue parties arrive (to stop you)
- **Degradation:** Mental state deteriorates over time

**The Inevitable End:**
This path cannot be "won." Eventually:
1. **Rebellion succeeds** - Slaves/natives kill you
2. **Madness takes over** - You lose control, game over
3. **Island destroys you** - Cataclysmic event (earthquake, etc.)
4. **Mercenaries betray you** - Killed by your own people

**OR you can choose:**
5. **Burn it all down** - Destroy everything in final act of spite
6. **Leave with the spoils** - Escape with resources, bad ending

**Victory Condition:** There is none. This is a tragedy.

#### Romance & Sexual Content

**⚠️ EXTREMELY DARK CONTENT - Player Configurable ⚠️**

**Settings Menu Options:**
```
[ ] Enable Non-Consensual Content (Exploit Path)
    ⚠️ Warning: Contains rape and slavery themes
    
[ ] Enable "Power Exchange" Alternative (Consensual Dom/Sub Instead)
    ✓ All content remains consensual BDSM roleplay
```

**If Non-Con DISABLED (Default):**
- All sexual content is consensual BDSM power exchange
- "Slaves" are actually willing submissives
- Dom/sub relationship dynamics
- Safe words and boundaries respected
- Still morally dark (exploitation themes) but not assault

**If Non-Con ENABLED:**
- **Heavy content warnings before every scene**
- Rape as weapon of war (not eroticized, shown as trauma)
- Sexual slavery (victims shown as suffering)
- Coerced "consent" (not treated as real consent)
- Game makes clear this is evil (not glamorized)

**Themes (Dark):**
- Power and control (forced submission)
- Harem management (multiple captives)
- Trophy taking (conquering)
- Dehumanization (treating people as objects)
- Sadism (enjoying others' pain)

**Narrative Framing:**
- Game does NOT portray this as "good"
- Victims hate you, plot revenge
- Psychological toll on player character
- Other NPCs horrified
- Ultimate consequence (bad ending)

**Why Include This?**
- Acknowledges historical reality of colonialism
- Explores dark power fantasies safely (fiction with warnings)
- Player choice to engage or not
- Makes moral weight of other paths clearer by contrast

---

### Path 4: LEAVE THE ISLAND (Escape)

#### Requirements to Unlock
- Any reputation configuration (doesn't matter)
- Island Favor: -50 to +50 (island doesn't prevent or help)
- Boat-building materials gathered
- Navigation knowledge acquired
- Provisions stockpiled

#### Core Philosophy
"Paradise is a cage. Freedom means choice. I choose to leave."

#### The Path Forward

**Phase 1: The Plan**
- Design seaworthy vessel (research/planning)
- Identify necessary materials (wood, rope, tools, sail)
- Calculate provisions needed (food, water, medicine)
- Learn navigation (stars, currents, wind)

**Phase 2: Gathering**
- Materials from all territories (neutral with all factions)
- Rare components (from mercenary compound, native villages, deep jungle)
- Bartering and stealing as needed
- Avoid deep factional commitments

**Phase 3: Building**
- Construct boat (time-consuming mini-game)
- Test phases (short voyages around island)
- Improve based on failures
- Weather and sabotage threats

**Phase 4: Recruitment**
- Who will join you?
- Some NPCs want to leave, others want to stay
- Capacity limits (can't take everyone)
- Heartbreaking choices

**Phase 5: The Final Choice**
- Do you expose island location to rescuers?
- Do you tell natives about outside world?
- Do you leave others to their fate?
- Do you take NPCs who'll be missed?

**Phase 6: The Voyage**
- Open ocean survival (storms, starvation, navigation challenges)
- Bonding with those who came
- Flashbacks to island life
- Question if you made right choice

#### Moral Complexity

**What You're Doing Right:**
- Exercising autonomy (not forced into others' conflicts)
- Returning to loved ones (if you remember them)
- Rejecting false dichotomies (all paths flawed)
- Freedom as highest value

**The Uncomfortable Questions:**
- Are you brave or cowardly (running from hard choices)?
- What about those left behind?
- Did you expose natives to danger (if you signal rescue)?
- Is "civilization" really better?
- Were you needed here?

**NPCs Will Challenge You:**
- Those who want to leave: "Take me with you! Please!"
- Those who want to stay: "You're abandoning us."
- Natives: "Will you keep our secret?"
- Yourself: "Am I doing the right thing?"

#### Endgame: THE END

**True Ending:**
- Reach civilization (or die trying)
- Epilogue showing what happened to those left behind
- Aftermath: How did your choices affect the island?
- Your life afterward: Can you readjust?

**Credits Roll**

**Post-Credits:**
- NG+ unlocked (new knowledge/skills)
- Secret fifth path revealed? ("Return to Island")

**Victory Condition:** Escape successfully OR die trying heroically

#### Romance & Sexual Content

**Themes:**
- Final nights before departure (bittersweet)
- Journey bonding (intimacy on open ocean)
- New beginnings (if you reach civilization)
- Lost connections (those left behind)
- Freedom and loneliness

**Scenarios:**
- Beach farewell sex (goodbye to lover staying behind)
- Boat encounters (those who came with you)
- Remembering island loves (flashbacks)
- Civilization dating (very different post-escape)

**Less focus than other paths** - Journey itself is the point, not sexual content

---

## NPC System & AI Generation

### The Challenge: 2-Minute Generation Time

**Problem:** Full NPC generation (name, appearance, background, personality, image) takes ~2 minutes.

**Solution: Staged Generation + Background Loading**

#### Stage 1: Instant Shell (0 seconds)
When NPC is needed immediately:
```javascript
NPC = {
  id: generate_uuid(),
  name: "Stranger",  // Temporary
  sprite: default_silhouette,  // Placeholder
  faction: determined_by_context,
  state: "generating"
}
```

Player sees: "A figure approaches..." / "Someone unconscious on the beach..."

#### Stage 2: Basic Details (15-30 seconds)
Generated first, displayed quickly:
```javascript
NPC = {
  name: "Sarah", // Simple name generator
  gender: rolled_based_on_settings,
  age: 25-40,
  vocation: "Doctor", // Rolled from needs list
  personality_traits: ["kind", "cautious", "skilled"], // Template
  sprite: generic_avatar_matching_gender_age
}
```

Player can now interact with basic dialogue.

#### Stage 3: Deep Background (1-2 minutes, background)
Generated while player is doing other things:
```javascript
// AI generates during gameplay
NPC.background = {
  memory_fragments: ["I remember... hospitals? Blood? Saving lives."],
  specific_skills: ["Surgery", "Diagnosis", "Herbal Medicine"],
  personality_depth: [detailed AI profile],
  quirks: ["Hums while working", "Afraid of deep water"],
  secrets: ["Remembers more than they admit"]
}
```

#### Stage 4: Portrait (1-2 minutes, background)
AI image generation happens in parallel:
```javascript
// Perchance AI generates portrait
NPC.portrait = generated_image_url
```

**When it's ready:**
- Update NPC sprite from generic to unique
- Enhance dialogue with personality depth
- Unlock personal quests

#### Stage 5: Personal Quest (Generated lazily)
Only if player builds relationship:
- Personal backstory quest
- Memory recovery arc
- Deep character moments

### Background Generation Queue

**System Prioritizes:**
1. **Immediate needs** - NPC player is interacting with right now
2. **Announced arrivals** - Castaway arriving in 1 day (generate early)
3. **Faction leaders** - Pre-generate scripted important NPCs
4. **Romance candidates** - Higher priority if player is building relationship
5. **Background NPCs** - Lower priority, generic until needed

**Smart Loading:**
- Generate during low-activity moments (player sleeping, traveling, crafting)
- Never block gameplay waiting for generation
- Cache generated NPCs (don't regenerate same ones)
- Pool of pre-generated NPCs (pull from pool when needed quickly)

### Character Persistence

**Once generated, NPCs are persistent:**
- Save all details to game state
- Remember interactions with player
- Evolve over time
- Can die, leave, or change factions (but data remains for memory/epilogue)

### NPC Categories

#### Tier 1: Scripted Major NPCs (Hand-Crafted)
- Faction leaders (Vance, Native Elders, etc.)
- Key story characters (5-10 per playthrough)
- Pre-generated, full detail
- Complex personality and arcs
- **Not AI-generated** (too important to risk)

#### Tier 2: Semi-Scripted (AI-Enhanced)
- Named characters with roles (lieutenants, craftsmen, shamans)
- Basic arc scripted, personality AI-generated
- Mix of hand-crafted and procedural
- 10-15 per playthrough

#### Tier 3: Procedural NPCs (Fully AI)
- General population (warriors, workers, slaves)
- Fully AI-generated
- Simpler personality templates
- Can become important through emergent gameplay
- 50-80 per playthrough

---

## Content & Themes

### Content Rating: AO (Adults Only)

**This game contains:**
- ✅ Explicit sexual content (hardcore)
- ✅ Nudity (full frontal)
- ✅ Violence (combat, death, torture)
- ✅ Sexual violence (rape on Exploit path, configurable)
- ✅ Slavery
- ✅ Colonialism themes
- ✅ Drug use (alcohol, native substances)
- ✅ Mature language (profanity)
- ✅ Psychological horror (degradation, paranoia)

### Content Settings System

**Player Control Panel (Before Starting Game):**

```
=== CONTENT SETTINGS ===

SEXUAL CONTENT:
[x] Explicit Sexual Scenes (Required for adult game)
[ ] Non-Consensual Content (Enable for Exploit path realism)
    ⚠️ WARNING: Contains rape. Can substitute with consensual BDSM.
[x] Nudity
[ ] Censored Mode (Black bars/mosaics over genitals)

VIOLENCE:
[x] Combat Violence
[x] Blood and Gore
[ ] Character Death (Toggle: NPCs can die permanently)
[ ] Torture Scenes (Exploit path)

THEMES:
[x] Slavery (Exploit path mechanic)
[x] Drug Use
[x] Colonialism Discussion (Meta-narrative)
[ ] Horror Elements (Psychological degradation, nightmares)

LANGUAGE:
[x] Profanity
[ ] Slurs (Can NPCs use discriminatory language?)

=== Apply Settings ===
```

**Respect Player Boundaries:**
- Can disable non-con entirely (use power exchange instead)
- Can reduce violence (text descriptions less graphic)
- Can enable character immortality (knocked out, not killed)
- Cannot disable core sexual content (it's a porn game)

### Thematic Exploration

**Colonialism:**
- Examined from multiple angles
- No "correct" answer provided
- Player must grapple with implications
- Native NPCs challenge player assumptions
- Historical parallels drawn (but not preachy)

**Power Dynamics:**
- Consent vs. coercion
- Authority vs. authoritarianism
- Democracy vs. dictatorship
- Individual vs. collective rights

**Identity:**
- Who are you without memory?
- Do your actions define you?
- Can you change who you were?
- What does belonging mean?

**Freedom:**
- Is leaving the only freedom?
- Is paradise worth the price?
- Can you be free under any system?
- What are you free from, and free to do?

### Pornographic Content Integration

**Not Just Sex Scenes:**
Sex is integrated into:
- Character relationships (builds bonds)
- Faction culture (different approaches to sexuality)
- Power dynamics (both healthy and unhealthy)
- Ritual and meaning (spiritual sex in Respect path)
- Conquest and domination (dark sex in Exploit path)
- Celebration and joy (community sex in Claim path)

**Variety:**
- Solo, paired, group scenarios
- All orientations represented
- Kink variety (vanilla to extreme)
- Player choice in participation
- Scenes advance plot or character

**Quality Over Quantity:**
- Meaningful scenes > constant grinding
- Character-driven > mechanical
- Responsive to player relationship building
- Optional but rewarding

---

## Gameplay Systems (Overview)

### Core Loops

**Survival Loop:**
- Gather resources (food, water, materials)
- Craft tools and items
- Build shelter and structures
- Manage health, hunger, thirst, energy

**Social Loop:**
- Meet NPCs
- Build relationships (conversation trees)
- Manage reputation
- Romance and sex

**Exploration Loop:**
- Discover locations
- Find POIs
- Encounter random events
- Unlock fast travel

**Conflict Loop:**
- Faction tensions
- Combat (when necessary)
- Stealth and sabotage
- Negotiation and diplomacy

**Story Loop:**
- Main quests (scripted beats)
- Side quests (procedural and scripted)
- Character arcs (companion stories)
- Path progression (toward endgame)

### Systems Detail (To Be Designed)

Future documents will detail:
- Combat mechanics
- Crafting trees
- Building system
- Skill progression
- Reputation formulas
- Romance mechanics
- Random events
- Weather/seasons
- Day/night cycle

---

## Implementation Priorities

### Phase 1: Foundation (Months 1-3)
1. **Core engine** - Movement, interaction, UI
2. **Basic survival** - Resources, hunger, crafting
3. **NPC system** - Generation, conversation, basic AI
4. **Faction basics** - Reputation tracking, simple quests

### Phase 2: Content (Months 4-6)
1. **Story beats** - Scripted main quest line
2. **Procedural content** - Side quests, random events
3. **Sexual content** - Scene system, variety
4. **NPC depth** - Relationships, arcs, romance

### Phase 3: Paths (Months 7-9)
1. **Path divergence** - Four paths fully implemented
2. **Endgame modes** - Unique gameplay for each
3. **Faction completion** - All three factions fleshed out
4. **Moral complexity** - Nuanced writing and consequences

### Phase 4: Polish (Months 10-12)
1. **Balance** - Gameplay tuning
2. **Content volume** - More quests, scenes, NPCs
3. **Bug fixes** - Stability and performance
4. **Feedback integration** - Alpha/beta testing

---

## Summary

**Hedonism Island** is an adult survival RPG about:
- **Power** - Who has it, how it's used, what it costs
- **Identity** - Who you are when memory fails
- **Freedom** - What it means and what it's worth
- **Morality** - Complex, fluid, player-defined

**Four paths emerge from behavior:**
1. **Claim** - Colonial democracy (build new society)
2. **Respect** - Native integration (become one with the land)
3. **Exploit** - Mercenary rule (dominate and extract)
4. **Leave** - Escape (reject all choices)

**Hardcore adult content** with player-configurable boundaries.

**Dynamic world** where NPCs live, die, change, and remember.

**The island itself** is a character with will and power.

**No single right answer** - Every path has costs and benefits.

---

## Next Steps

**What needs detailed design next:**

1. **Native Culture Expansion** - Language, rituals, social structure details
2. **Key NPC Creation** - Scripted characters (names, personalities, arcs)
3. **Quest Design** - Specific quest chains for each path
4. **Combat System** - Mechanics (real-time? turn-based? skill-based?)
5. **Sexual Content Framework** - Scene triggers, variety, integration
6. **Map & POI Design** - Specific locations (villages, sacred sites, compound)
7. **Crafting Trees** - What can be made, recipes, progression
8. **Skill System** - Character advancement
9. **Day Cycle & Time** - How does time flow?
10. **Save System Integration** - How to save all this complexity?

**Which would you like to develop next?**
