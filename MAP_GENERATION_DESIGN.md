# 🗺️ Map Generation & Features Design Document

## Overview

This document outlines the map generation system for Hedonism Island, including current implementation and planned features.

---

## Current Implementation ✅

### Map Structure
- **Hexagonal grid** using axial coordinates (q, r)
- **Radius 8** = ~200 hexes total
- **1-hex ocean boundary** around entire map edge
- **Natural coastline** with noise-based irregularity

### Generation Pipeline

1. **Elevation Generation**
   - Radial falloff from center (keeps land near edges)
   - Fractal noise for terrain variation (4 octaves)
   - Edge noise for natural coastline shapes
   - Force ocean at outermost ring

2. **Land/Sea Threshold**
   - Configurable threshold (default: 0.30)
   - Edge tiles always ocean
   - Most of map is land with thin ocean boundary

3. **Beach Marking**
   - Land tiles adjacent to sea become beaches
   - Calculates distance to water for all tiles

4. **River Carving**
   - Multiple rivers (configurable, default: 2)
   - Start at high elevation (mountains)
   - Flow downhill toward sea
   - Natural pathfinding based on elevation

5. **Moisture Generation**
   - Fractal noise base
   - Bonus near water sources
   - Used for biome determination

6. **Biome Assignment**
   - Based on elevation × moisture matrix
   - 11 distinct biomes (see below)

7. **Biome Smoothing**
   - 2-pass modal filter
   - Prevents single-tile biome patches
   - Creates natural transitions

### Current Biomes

| Biome | Elevation | Moisture | Description |
|-------|-----------|----------|-------------|
| **Sea** | N/A | N/A | Ocean boundary, impassable |
| **Beach** | Low | N/A | Coastal sand, starting area |
| **River** | N/A | N/A | Freshwater, passable |
| **Savanna** | Low | Low | Grasslands, easy traversal |
| **Forest** | Low | Medium | Temperate woods, resources |
| **Rainforest** | Low | High | Dense jungle, rich resources |
| **Dry Hill** | Medium | Low | Rocky slopes, stone resources |
| **Jungle Hill** | Medium | Medium | Forested slopes |
| **Cloud Forest** | Medium | High | Misty highlands |
| **Rocky Peak** | High | Low | Barren mountains |
| **Misty Peak** | High | High | Mountain tops, difficult terrain |

---

## Planned Features 🚧

### 1. Points of Interest (POIs)

**Purpose:** Named locations with narrative and functional significance

**Design Principles:**
- ✅ Quality over quantity (5-10 major POIs per map)
- ✅ Each has narrative purpose
- ✅ Discoverable but not obvious
- ✅ Unlock quests, resources, or story events

**Proposed POI Types:**

#### Common POIs (3-5 per map)
- **Shipwreck** - Crash site, salvageable supplies, survivor notes
  - Terrain: Beach, shallow sea
  - Resources: Metal, cloth, food caches
  - Narrative: Connect to plane crash backstory

- **Plane Wreckage** - Other pieces of Flight 447
  - Terrain: Various (scattered)
  - Resources: Electronics, luggage, fuel
  - Narrative: Find other survivors' fates

- **Abandoned Camp** - Previous survivor attempt
  - Terrain: Beach, forest clearings
  - Resources: Tools, shelter materials
  - Narrative: Mystery of what happened to them

#### Uncommon POIs (2-4 per map)
- **Cave System** - Natural shelter, mining potential
  - Terrain: Rocky peak, dry hill
  - Resources: Stone, minerals, shelter
  - Narrative: Can hide, store supplies

- **Waterfall** - Scenic freshwater source
  - Terrain: River, cloud forest
  - Resources: Clean water, fish
  - Narrative: Peaceful location, meditation

- **Ancient Ruins** - Pre-crash civilization
  - Terrain: Jungle hill, forest
  - Resources: Artifacts, clues
  - Narrative: Island history, mysteries

#### Rare POIs (1-2 per map)
- **Volcano Crater** - Dangerous but resource-rich
  - Terrain: Rocky peak, misty peak
  - Resources: Obsidian, geothermal vents
  - Narrative: Power source, danger zone

- **Crystal Lagoon** - Hidden paradise
  - Terrain: Beach, special
  - Resources: Rare fish, pristine water
  - Narrative: "True hedonism" - reward for exploration

- **Mysterious Monolith** - Unexplained structure
  - Terrain: Savanna, dry hill
  - Resources: None (narrative only)
  - Narrative: Island's deeper secrets

#### Legendary POI (1 per map)
- **The Spire** - Highest point, observation tower
  - Terrain: Misty peak (tallest mountain)
  - Resources: Overview of entire island
  - Narrative: Ultimate goal, reveals map

**Implementation Strategy:**
1. Define POI data structure with properties:
   ```javascript
   {
     id: 'shipwreck-01',
     type: 'shipwreck',
     name: 'The Broken Wing',
     tile: {q: 3, r: -2},
     discovered: false,
     resources: ['metal', 'cloth'],
     narrative: 'Part of Flight 447...',
     questIds: ['find-survivors', 'salvage-radio']
   }
   ```

2. Placement algorithm:
   - Check terrain suitability
   - Ensure minimum distance between POIs (3-5 hexes)
   - Avoid starting area
   - Weight placement toward exploration routes

3. Discovery mechanics:
   - Player must enter adjacent hex to discover
   - Add to map legend
   - Trigger quest notifications
   - Unlock fast travel (maybe)

---

### 2. Faction Territories

**Purpose:** Create dynamic regions with different rules, encounters, and stories

**Design Principles:**
- ✅ 3-5 factions maximum (avoid overwhelming)
- ✅ Each faction has clear identity and purpose
- ✅ Territories follow natural boundaries
- ✅ Player can interact, ally, or conflict
- ✅ Affects available quests and resources

**Proposed Factions:**

#### The Survivors (Friendly)
- **Territory:** Beach and coastal forest (small, 15-20 tiles)
- **Base:** Makeshift camp on main beach
- **Description:** Other passengers from Flight 447
- **Hostility:** Friendly (player's natural allies)
- **Quests:** Rescue missions, resource gathering, signal fire
- **Resources:** Shared supplies, pooled knowledge
- **Mechanics:** Safe zone, trading, companion recruitment

#### The Natives (Neutral)
- **Territory:** Jungle hills and rainforest (large, 40-50 tiles)
- **Base:** Village near waterfall
- **Description:** Indigenous people who've lived here for generations
- **Hostility:** Neutral (cautious but not hostile)
- **Quests:** Cultural exchange, learning survival skills, mediation
- **Resources:** Advanced crafting recipes, medicinal plants
- **Mechanics:** Must earn trust, can trade, teach skills

#### The Wildlife (Territorial)
- **Territory:** Savanna and forest regions (medium, 30-40 tiles)
- **Base:** No central base (animal territories)
- **Description:** Dangerous predators and protective herds
- **Hostility:** Defensive (attack if threatened)
- **Quests:** None (environmental hazard)
- **Resources:** Meat, hides, bones (from hunting)
- **Mechanics:** Avoid or hunt, some animals tameable

#### The Pirates (Hostile) - OPTIONAL
- **Territory:** North coast beach and sea (small, 10-15 tiles)
- **Base:** Hidden cove with boat wreckage
- **Description:** Criminal survivors who've gone ruthless
- **Hostility:** Hostile (will attack on sight)
- **Quests:** Eliminate threat, rescue captives, reclaim supplies
- **Resources:** Stolen goods, weapons
- **Mechanics:** Combat-focused, can be defeated to reclaim territory

#### The Cultists (Mysterious) - OPTIONAL
- **Territory:** Rocky peaks and ancient ruins (small, 10-15 tiles)
- **Base:** The ruins / volcano crater
- **Description:** Survivors who've "gone native" in a dark way
- **Hostility:** Unpredictable
- **Quests:** Investigate disappearances, stop rituals, save members
- **Resources:** Artifacts, forbidden knowledge
- **Mechanics:** Story-driven, moral choices

**Implementation Strategy:**
1. Territory generation:
   - Select capital tile for each faction
   - Grow outward using flood-fill with terrain preference
   - Stop at rivers, mountains, or faction borders
   - Mark border tiles as "frontier"

2. Tile properties:
   ```javascript
   tile.faction = 'natives';
   tile.factionStrength = 0.8; // How contested
   tile.isBorder = true;
   ```

3. Encounter system:
   - Roll for encounters when entering faction territory
   - Chance based on faction hostility and tile depth
   - Different encounter types per faction

---

### 3. Resource Nodes

**Purpose:** Repeatable, discoverable sources of crafting materials

**Design Principles:**
- ✅ Abundant but not overwhelming
- ✅ Cluster by terrain type
- ✅ Mix of renewable and finite resources
- ✅ Quality scales with danger/remoteness
- ✅ Depletion and regeneration mechanics

**Resource Categories:**

#### Food Resources (Renewable)
- **Fruit Trees** (Forest, Rainforest)
  - Yields: Fruit (1-3 per harvest)
  - Regeneration: 2-3 days
  - Density: High (1 per 3-4 forest tiles)

- **Fishing Spots** (River, Beach, Sea)
  - Yields: Fish (1-2 per attempt)
  - Regeneration: Immediate (chance-based)
  - Density: Medium (along water)

- **Wildlife Dens** (Savanna, Forest, Jungle Hill)
  - Yields: Meat, hide (on successful hunt)
  - Regeneration: 5-7 days
  - Density: Low (1 per 8-10 tiles)

- **Herb Patches** (Savanna, Forest)
  - Yields: Medicinal plants
  - Regeneration: 1-2 days
  - Density: Medium (scattered)

#### Water Resources (Renewable)
- **Freshwater Springs** (River, Cloud Forest)
  - Yields: Clean water (unlimited)
  - Regeneration: N/A (always available)
  - Density: Low (3-5 per map)

- **River Tiles** (River)
  - Yields: Water (needs purification)
  - Regeneration: N/A
  - Density: N/A (defined by rivers)

#### Building Materials (Mixed)
- **Hardwood Trees** (Jungle Hill, Rainforest)
  - Yields: Hardwood (2-4 logs)
  - Regeneration: None (finite)
  - Density: Low (valuable)

- **Stone Outcrops** (Rocky Peak, Dry Hill)
  - Yields: Stone (5-10 pieces)
  - Regeneration: None (finite)
  - Density: High (in mountains)

- **Bamboo Groves** (Forest, Jungle Hill)
  - Yields: Bamboo (3-5 stalks)
  - Regeneration: 3-4 days (fast-growing)
  - Density: Medium (clusters)

#### Rare Resources (Finite)
- **Mineral Deposits** (Rocky Peak, Cave)
  - Yields: Metal ore, gems
  - Regeneration: None
  - Density: Very low (1-2 per map)

- **Ancient Artifacts** (Ruins)
  - Yields: Unique items
  - Regeneration: None
  - Density: One per ruin

**Implementation Strategy:**
1. Poisson disk sampling for natural distribution
2. Resource data structure:
   ```javascript
   tile.resources = [
     {
       type: 'fruit-tree',
       quantity: 3,
       maxQuantity: 3,
       lastHarvested: null,
       regenTime: 48 // hours
     }
   ]
   ```

3. Harvesting mechanics:
   - Click resource to harvest
   - Success rate based on tools and skills
   - Depletion tracking
   - Regeneration timer

---

### 4. Fog of War

**Purpose:** Create sense of exploration and discovery

**Design Principles:**
- ✅ All tiles start hidden except starting area
- ✅ Three states: unexplored, explored, visible
- ✅ High ground reveals more area
- ✅ Can see terrain type when explored, but not resources/POIs
- ✅ Story events can reveal specific areas

**Visibility States:**

1. **Unexplored** (Black)
   - No information visible
   - Not on player's mental map

2. **Explored** (Grayscale/Dimmed)
   - Terrain type visible
   - Elevation visible
   - POIs revealed if discovered
   - Resources not visible
   - Factions not visible

3. **Visible** (Full color)
   - Currently in vision range
   - All information visible
   - Can see movement/changes

**Vision Mechanics:**
- **Standard vision:** 1-2 hex radius
- **High ground bonus:** +1-2 hexes from peaks
- **Fog of war updates:** After every move
- **Permanent reveal:** Visited tiles stay explored

**Implementation Strategy:**
1. Add fog state to tiles:
   ```javascript
   tile.fogState = 'unexplored'; // 'unexplored', 'explored', 'visible'
   ```

2. Reveal algorithm:
   ```javascript
   revealArea(centerTile, radius) {
     // Mark center as visible
     // Mark tiles within radius as visible
     // Mark previously visible as explored
   }
   ```

3. Rendering:
   - Unexplored: Don't render or show black
   - Explored: Render with 50% opacity, no resources
   - Visible: Full color and detail

---

### 5. Landmarks

**Purpose:** Memorable named locations for navigation and narrative

**Design Principles:**
- ✅ Visually distinctive
- ✅ Named and memorable
- ✅ Often multi-tile
- ✅ Used in quest directions
- ✅ 3-5 major landmarks per map

**Proposed Landmarks:**

1. **The Spire** (Highest Mountain)
   - Multi-tile volcanic peak
   - Observation point (reveals large area)
   - Difficult to reach
   - Ultimate exploration goal

2. **Dead Man's Cove** (Notable Beach)
   - Crescent-shaped beach
   - Many shipwrecks
   - Dangerous waters
   - Named for its history

3. **The Great Banyan** (Forest Feature)
   - Massive ancient tree
   - Multi-tile canopy
   - Can build in branches
   - Natural gathering point

4. **Skull Rock** (Coastal Rock Formation)
   - Rock formation resembling skull
   - Navigation landmark
   - Pirate territory marker
   - Ominous atmosphere

5. **Crystal Lagoon** (Hidden Paradise)
   - Beautiful clear water
   - Hidden behind waterfall
   - Rare resources
   - Reward for exploration

**Implementation Strategy:**
1. Auto-detect dramatic features:
   - Highest elevation tile → The Spire
   - Largest contiguous beach → Dead Man's Cove
   - Center of largest forest → The Great Banyan
   - Unique rock formation → Skull Rock
   - Hidden water body → Crystal Lagoon

2. Multi-tile marking:
   ```javascript
   landmark = {
     id: 'the-spire',
     name: 'The Spire',
     tiles: [{q: 0, r: -5}, {q: 1, r: -5}, ...],
     discovered: false,
     description: 'The highest point on the island...'
   }
   ```

3. Quest integration:
   - "Travel to The Spire"
   - "Meet me at Dead Man's Cove"
   - Easier than coordinate-based directions

---

## Configuration Reference

```javascript
config = {
  // Map size
  radius: 8, // Total map radius (8 = ~200 tiles)
  oceanBoundaryWidth: 1, // Ocean ring at edge
  
  // Terrain generation
  elevationScale: 0.18, // Noise frequency (higher = rougher)
  moistureScale: 0.14,
  falloffExponent: 1.8, // Edge falloff (lower = gentler)
  landThreshold: 0.30, // Sea level (lower = more land)
  edgeNoiseStrength: 0.25, // Coastline irregularity
  
  // Features
  riverSources: 2, // Number of rivers
  beachWidth: 1, // Beach tiles around coast
  
  // Future features (not yet implemented)
  poiCount: 7, // Total POIs to place
  factionCount: 4, // Active factions
  resourceDensity: 0.3, // Resources per land tile
  landmarkCount: 5 // Named landmarks
}
```

---

## Testing Checklist

### Current Features
- [ ] Map generates without errors
- [ ] Ocean boundary exists on all edges
- [ ] Land extends to within 1 hex of edge
- [ ] Coastline looks natural (not perfect circle)
- [ ] Rivers flow from mountains to sea
- [ ] Biomes distributed reasonably
- [ ] No single-tile biome artifacts
- [ ] Beach tiles surround all coasts
- [ ] ~70-80% land coverage

### Future Features
- [ ] POIs placed in suitable locations
- [ ] Minimum distance between POIs maintained
- [ ] Faction territories don't overlap excessively
- [ ] Resource distribution feels natural
- [ ] Fog of war reveals correctly
- [ ] Landmarks are visually distinctive
- [ ] Quest system references landmarks properly

---

## Next Steps

1. **Test current map generation** with new parameters
2. **Iterate on coastline** if needed (adjust edgeNoiseStrength)
3. **Design POI system** - Start with shipwrecks and camps
4. **Plan faction interactions** - Define quest chains
5. **Resource placement** - Implement gathering mechanics
6. **Fog of war** - Add to renderer
7. **Landmark system** - Auto-detect and name features

---

## Notes

- All "FUTURE" features have placeholder methods in `mapEngine.js`
- Each feature should be implemented and tested individually
- Narrative integration is key - no feature without purpose
- Performance: Keep total entities under 500 for smooth rendering
- Save/Load: All generated features must be serializable

**Remember:** Quality over quantity. Each addition should enhance gameplay meaningfully!
