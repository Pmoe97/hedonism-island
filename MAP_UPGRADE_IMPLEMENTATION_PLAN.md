# Map System Upgrade - Implementation Plan

## Overview
This document outlines a **phased implementation plan** for upgrading the map generation system based on the analysis in `MAP_ANALYSIS_AND_IMPROVEMENTS.md`. The plan is organized by priority and dependencies.

---

## 📊 Current System Analysis

### ✅ What's Working Well
- **Single landmass generation** - Forces ocean boundary, removes small islands
- **Strategic locations** - Villages, sacred sites properly placed with spacing
- **Territory system** - Factions claim regions with growth mechanics
- **Resource nodes** - Robust gathering system with tools, skills, regeneration
- **10 terrain types** - Good baseline biome variety
- **Hex grid foundation** - Solid coordinate system and rendering

### 🔍 Key Findings from Analysis
1. **Ridge Village spawns correctly** in mountains (elevation ≥ 0.6)
2. **All coastlines are beaches** - No cliff variety
3. **Colors are functional** but could be refined
4. **5 POI types, 7-9 locations** - Room for 3-5x more
5. **Strong foundation** for expansion

---

## 🎯 Implementation Phases

### **PHASE 1: Cliff Terrain & Coastline Variety** ⭐ HIGHEST PRIORITY
**Estimated Time:** 2-3 hours  
**Impact:** High visual/gameplay impact, natural fortress locations  
**Difficulty:** Medium  

#### Files to Modify
1. `src/modules/mapEngine.js`
2. `src/modules/mapRenderer.js`

#### Implementation Steps

**A. Add Cliff Detection Logic** (mapEngine.js)
```javascript
// After markBeaches() in generate() pipeline
this.markCliffs();

// New method
markCliffs() {
  const cliffTiles = [];
  
  for (const [key, tile] of this.tiles) {
    if (!tile.isLand) continue;
    
    // Check if adjacent to sea AND high elevation
    const neighbors = this.hexGrid.getNeighbors(tile.q, tile.r);
    const hasSeaNeighbor = neighbors.some(n => {
      const neighbor = this.getTile(n.q, n.r);
      return neighbor && neighbor.terrain === 'sea';
    });
    
    // Cliff criteria: coastal + elevation ≥ 0.6
    if (hasSeaNeighbor && tile.elevation >= 0.6) {
      tile.terrain = 'cliff';
      tile.isPassable = false; // Cannot land from sea
      tile.distanceToWater = 0; // Still coastal
      cliffTiles.push(tile);
    }
  }
  
  console.log(`🏔️  Marked ${cliffTiles.length} cliff tiles`);
}
```

**B. Add Cliff Color** (mapRenderer.js)
```javascript
this.terrainColors = {
  'sea': '#1e3a8a',
  'beach': '#fde047',
  'cliff': '#57534e',      // NEW: Warm grey
  'river': '#3b82f6',
  // ... rest unchanged
};
```

**C. Update Travel System** (src/modules/travel.js)
- Cliffs are impassable from sea direction
- Can be accessed from land side
- Provide defensive bonuses

**D. Testing Checklist**
- [ ] Cliffs only spawn on high-elevation coasts
- [ ] Low-elevation coasts remain beaches
- [ ] Cliffs render with correct color
- [ ] Cannot travel to cliffs from sea tiles
- [ ] Can travel to cliffs from land tiles
- [ ] Villages don't spawn on cliffs

---

### **PHASE 2: Color Refinement & Visual Polish** ⭐ HIGH PRIORITY
**Estimated Time:** 1-2 hours  
**Impact:** Better visual clarity and aesthetics  
**Difficulty:** Easy  

#### Files to Modify
1. `src/modules/mapRenderer.js`

#### Color Adjustments

**Current Issues:**
- Beach yellow (`#fde047`) too bright/neon
- Need better contrast between similar biomes
- Mountains could use more definition

**Proposed Changes:**
```javascript
this.terrainColors = {
  // WATER/COAST
  'sea': '#1e3a8a',           // ✅ Keep (deep blue)
  'beach': '#f4e4c1',         // 🔄 CHANGE: Softer sand/beige
  'cliff': '#57534e',         // ✨ NEW: Warm grey
  'river': '#3b82f6',         // ✅ Keep (bright blue)
  
  // LOWLANDS
  'savanna': '#d4b896',       // 🔄 CHANGE: Tan/golden (less lime)
  'forest': '#22c55e',        // ✅ Keep (green)
  'rainforest': '#15803d',    // ✅ Keep (dark green)
  
  // HILLS
  'dry-hill': '#a8a29e',      // ✅ Keep (tan/grey)
  'jungle-hill': '#65a30d',   // ✅ Keep (olive green)
  'cloud-forest': '#6ee7b7',  // ✅ Keep (mint/teal)
  
  // MOUNTAINS
  'rocky-peak': '#78716c',    // ✅ Keep (dark grey)
  'misty-peak': '#e2e8f0'     // 🔄 CHANGE: Lighter grey/white
};
```

**Testing Checklist**
- [ ] Beach color is softer, less neon
- [ ] Savanna distinguishable from jungle-hill
- [ ] Mountains have clear height distinction
- [ ] Colors work well in different lighting
- [ ] Territory overlays still visible

---

### **PHASE 3: Shipwreck POIs** ⭐ HIGH PRIORITY
**Estimated Time:** 2-3 hours  
**Impact:** New loot locations, story hooks, exploration rewards  
**Difficulty:** Medium  

#### Files to Modify
1. `src/modules/mapEngine.js`
2. `src/modules/mapRenderer.js`
3. `src/ui/gameView.js` (for interactions)

#### Implementation Steps

**A. Add Shipwreck Placement** (mapEngine.js)
```javascript
// In placeStrategicLocations(), after mercenary compound
this.strategicLocations.shipwrecks = this.placeShipwrecks();

// New method
placeShipwrecks() {
  const numWrecks = 2 + Math.floor(this.rng.next() * 2); // 2-3 wrecks
  const wrecks = [];
  const candidates = [];
  
  for (const [key, tile] of this.tiles) {
    // Shipwrecks spawn on beaches or shallow water
    if (tile.terrain !== 'beach') continue;
    
    // Prefer remote beaches
    const distFromCenter = this.hexGrid.distance(0, 0, tile.q, tile.r);
    const remoteness = distFromCenter / this.config.radius;
    
    // Check if near sea (should be coastal)
    const neighbors = this.hexGrid.getNeighbors(tile.q, tile.r);
    const nearSea = neighbors.some(n => {
      const neighbor = this.getTile(n.q, n.r);
      return neighbor && neighbor.terrain === 'sea';
    });
    
    if (!nearSea) continue;
    
    // Score based on remoteness and variety
    const score = remoteness + this.rng.next() * 0.3;
    candidates.push({ tile, score });
  }
  
  if (candidates.length === 0) return wrecks;
  
  candidates.sort((a, b) => b.score - a.score);
  
  // Place shipwrecks with minimum spacing
  for (let i = 0; i < Math.min(numWrecks, candidates.length); i++) {
    const candidate = candidates[i];
    
    // Check distance from other wrecks
    const tooClose = wrecks.some(w => 
      this.hexGrid.distance(w.tile.q, w.tile.r, candidate.tile.q, candidate.tile.r) < 8
    );
    
    if (!tooClose) {
      const wreckNames = ['Broken Promise', 'Sea Maiden', 'Fortune\'s Folly', 'Last Hope'];
      wrecks.push({
        name: `Shipwreck: ${wreckNames[i % wreckNames.length]}`,
        type: 'shipwreck',
        tile: candidate.tile,
        description: 'The remains of a ship that wasn\'t so lucky. May contain salvage.',
        lootQuality: this.rng.next() > 0.5 ? 'rich' : 'normal'
      });
    }
  }
  
  return wrecks;
}
```

**B. Add Shipwreck Markers** (mapRenderer.js)
```javascript
case 'shipwreck':
  // Shipwreck - broken ship icon
  this.ctx.fillStyle = '#92400e'; // Dark brown
  this.ctx.strokeStyle = '#000';
  this.ctx.lineWidth = 2;
  this.ctx.beginPath();
  this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
  this.ctx.fill();
  this.ctx.stroke();
  // Draw anchor/ship symbol
  this.ctx.fillStyle = '#fbbf24';
  this.ctx.font = 'bold 12px sans-serif';
  this.ctx.textAlign = 'center';
  this.ctx.textBaseline = 'middle';
  this.ctx.fillText('⚓', 0, 0);
  break;
```

**C. Add Shipwreck Interactions** (gameView.js)
- Click on shipwreck → Search action
- Generate loot table (tools, materials, food)
- Can be looted once or multiple times with respawn
- Story notes/logs found in wrecks

**D. Loot Tables**
```javascript
// Shipwreck loot possibilities
const shipwreckLoot = {
  common: ['rope', 'cloth', 'wood', 'metal_scrap', 'dirty_water'],
  uncommon: ['knife', 'fishing_rod', 'waterskin', 'leather', 'bandage'],
  rare: ['stone_axe', 'bow', 'leather_backpack', 'herbal_remedy']
};
```

**Testing Checklist**
- [ ] 2-3 shipwrecks spawn per map
- [ ] Located on remote beaches
- [ ] Minimum 8 tiles apart
- [ ] Icons render correctly
- [ ] Can interact with wrecks
- [ ] Loot generates appropriately
- [ ] Story notes add flavor

---

### **PHASE 4: New Biomes** 🌟 MEDIUM PRIORITY
**Estimated Time:** 4-5 hours  
**Impact:** More terrain variety, unique resources  
**Difficulty:** Medium-High  

#### Biomes to Add (Priority Order)

**4A. Mangrove Swamps** (coastal wetlands)
```javascript
// Add to assignBiomes()
if (elev < 0.4 && moist > 0.7 && tile.distanceToWater <= 2) {
  tile.terrain = 'mangrove';
}

// Color
'mangrove': '#166534' // Dark swampy green

// Properties
- Movement speed: 0.7x (slower)
- Resources: Fish, medicinal plants, wood
- Spawns near coasts in wet areas
```

**4B. Bamboo Forest** (renewable resource)
```javascript
// Add to assignBiomes()
if (elev >= 0.45 && elev < 0.6 && moist > 0.65) {
  tile.terrain = 'bamboo-forest';
}

// Color
'bamboo-forest': '#86efac' // Light fresh green

// Properties
- Fast-growing resource nodes
- Good for building materials
- Asian/tropical aesthetic
```

**4C. Palm Grove** (tropical coastal)
```javascript
// Add after beaches are marked
if (tile.terrain !== 'beach' && tile.distanceToWater === 1 && 
    elev < 0.45 && moist > 0.6) {
  tile.terrain = 'palm-grove';
}

// Color
'palm-grove': '#84cc16' // Bright tropical green

// Properties
- Coconuts, dates, shade
- Coastal but not beach
- Beautiful scenery
```

**4D. Scrubland** (arid transition)
```javascript
// Add to assignBiomes() between savanna and dry-hill
if (elev >= 0.35 && elev < 0.55 && moist < 0.35) {
  tile.terrain = 'scrubland';
}

// Color
'scrubland': '#d6d3d1' // Dusty grey-brown

// Properties
- Sparse resources
- Difficult travel
- Hot/dry environment
```

#### Implementation Order
1. **Mangrove** - Highest gameplay impact (new resources)
2. **Bamboo** - Unique renewable resource
3. **Palm Grove** - Coastal variety
4. **Scrubland** - Visual completeness

**Testing Checklist**
- [ ] New biomes spawn in appropriate locations
- [ ] Colors distinct and attractive
- [ ] ensureBiomeDiversity includes new biomes
- [ ] Resource nodes spawn in new biomes
- [ ] Movement/travel modifiers work
- [ ] No biome fragmentation issues

---

### **PHASE 5: Natural Landmark POIs** 🌟 MEDIUM PRIORITY
**Estimated Time:** 3-4 hours  
**Impact:** Navigation waypoints, scenic locations, fast travel  
**Difficulty:** Medium  

#### Landmarks to Add

**5A. Waterfall**
- Spawns where river meets high elevation drop
- Fresh water source
- Rest/meditation spot
- Beautiful scenic location

**5B. Hot Springs**
- High elevation + high moisture + specific conditions
- Healing effects
- Rest area
- Rare spawn (0-1 per map)

**5C. Cave System**
- Mountain/hill areas
- Shelter, storage, secret passages
- Dungeon-like exploration potential

**5D. Natural Harbor**
- Protected coastal area
- Good for boat building/sailing later
- Strategic location

**5E. Volcanic Crater** (if volcanic biome added)
- Highest elevation point
- Dangerous but valuable resources
- Epic landmark

#### Implementation
```javascript
// Add to placeStrategicLocations()
this.strategicLocations.landmarks = this.placeLandmarks();

placeLandmarks() {
  return {
    waterfall: this.findWaterfall(),
    hotSpring: this.findHotSpring(),
    caves: this.findCaves(2), // 2 caves
    harbor: this.findNaturalHarbor()
  };
}
```

**Testing Checklist**
- [ ] Landmarks spawn in appropriate locations
- [ ] Each has unique icon/marker
- [ ] Can interact for benefits
- [ ] Named and memorable
- [ ] Help with navigation

---

### **PHASE 6: Ancient Ruins POIs** 🔮 MEDIUM PRIORITY
**Estimated Time:** 3-4 hours  
**Impact:** Lore, story, high-value loot  
**Difficulty:** Medium  

#### Implementation
```javascript
placeAncientRuins() {
  const numRuins = 1 + Math.floor(this.rng.next() * 2); // 1-2 ruins
  const ruins = [];
  
  // Criteria:
  // - Deep jungle OR mountain peaks
  // - Far from villages
  // - High remoteness score
  // - Different quadrants
  
  // Similar to shipwreck logic but for interior locations
}
```

#### Ruin Types
- **Temple** - Jungle, mystical, puzzles
- **Observatory** - Mountain peak, astronomical
- **Underground complex** - Any terrain, extensive
- **Monoliths** - Open areas, mysterious

**Testing Checklist**
- [ ] 1-2 ruins per map
- [ ] Remote locations
- [ ] Each has unique theme
- [ ] Loot/story content generated
- [ ] Puzzles/challenges (future)

---

### **PHASE 7: Resource Node Expansion** 💎 LOWER PRIORITY
**Estimated Time:** 4-6 hours  
**Impact:** Biome-specific gathering, economy depth  
**Difficulty:** Medium  

#### New Resource Node Types

**Biome-Specific Resources:**
- **Mangrove:** Mud crabs, oysters, mangrove wood
- **Bamboo:** Bamboo shoots, bamboo poles
- **Palm Grove:** Coconuts, palm fronds, dates
- **Cliff:** Seabird nests (eggs), cliff plants
- **Scrubland:** Cacti, desert herbs, lizards

#### Implementation
```javascript
// Update ResourceNodeManager
generateBiomeNodes(tile) {
  const nodesByBiome = {
    'mangrove': ['mud_crab', 'oyster', 'medicinal_plant'],
    'bamboo-forest': ['bamboo', 'bamboo_shoot'],
    'palm-grove': ['coconut_tree', 'date_palm'],
    'cliff': ['seabird_nest'],
    'scrubland': ['cactus', 'desert_herb']
  };
  
  // Spawn appropriate nodes based on biome
}
```

**Testing Checklist**
- [ ] Each new biome has 2-3 unique resources
- [ ] Resources added to itemDatabase
- [ ] Appropriate tool requirements
- [ ] Crafting recipes use new resources
- [ ] Balanced spawn rates

---

### **PHASE 8: Advanced Features** 🚀 FUTURE
**Estimated Time:** 10+ hours  
**Impact:** Major gameplay expansion  
**Difficulty:** High  

These are **not** immediate priorities but noted for future:

#### 8A. Fog of War Enhancement
- High ground vision bonus
- Story reveals specific areas
- Night/day vision differences

#### 8B. Dynamic Weather Effects
- Rain affects moisture/rivers
- Storms damage structures
- Seasons change biomes

#### 8C. Territorial Markers
- Totems, cairns, signs
- Faction boundary indicators
- Player-placed markers

#### 8D. Danger Zones
- Predator dens
- Cursed ground
- Environmental hazards

#### 8E. Multi-Tile Structures
- Large landmarks span multiple hexes
- Buildings/compounds
- Bridges, walls, roads

---

## 🛠️ Development Workflow

### For Each Phase:

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/phase-N-description
   ```

2. **Implement Changes**
   - Follow the detailed steps in each phase
   - Test incrementally
   - Use console logs for debugging

3. **Test Thoroughly**
   - Generate multiple maps (different seeds)
   - Check edge cases
   - Verify no regressions

4. **Commit & Document**
   ```bash
   git add .
   git commit -m "Phase N: Description of changes"
   ```

5. **Merge to Main**
   ```bash
   git checkout main
   git merge feature/phase-N-description
   git push origin main
   ```

---

## 📋 Testing Strategy

### Per-Phase Testing
- Generate 10+ maps with different seeds
- Check terrain generation quality
- Verify POI placement logic
- Test performance (no lag)
- Validate rendering

### Integration Testing
- All biomes present across maps
- POIs properly spaced
- Resource nodes spawn correctly
- Colors/visuals appealing
- No crashes or errors

### User Experience Testing
- Map is interesting to explore
- Rewards curiosity
- Clear visual hierarchy
- Intuitive interactions
- Fun to navigate

---

## 📊 Success Metrics

### Phase 1 (Cliffs)
- ✅ 10-20% of coastline is cliffs
- ✅ Cliffs spawn at high elevations
- ✅ Visual distinction from beaches

### Phase 2 (Colors)
- ✅ Better contrast between biomes
- ✅ Beach not neon yellow
- ✅ Mountains have clear height visual

### Phase 3 (Shipwrecks)
- ✅ 2-3 wrecks per map
- ✅ Loot system works
- ✅ Interesting to discover

### Phase 4 (New Biomes)
- ✅ 4 new biomes spawn reliably
- ✅ Each has unique characteristics
- ✅ Resource variety increased

### Phase 5-6 (Landmarks & Ruins)
- ✅ 3-5 named landmarks per map
- ✅ 1-2 ruins per map
- ✅ Story/lore integration

### Phase 7 (Resources)
- ✅ 10+ new resource types
- ✅ Biome-specific gathering
- ✅ Crafting depth increased

---

## 🎯 Recommended Implementation Order

### Week 1: Foundation
- **Day 1-2:** Phase 1 (Cliffs)
- **Day 3:** Phase 2 (Colors)
- **Day 4-5:** Phase 3 (Shipwrecks)

### Week 2: Content Expansion
- **Day 1-2:** Phase 4A-4B (Mangrove, Bamboo)
- **Day 3-4:** Phase 4C-4D (Palm Grove, Scrubland)
- **Day 5:** Phase 5 (Landmarks - partial)

### Week 3: Polish & Depth
- **Day 1-2:** Phase 5 (Landmarks - complete)
- **Day 3-4:** Phase 6 (Ruins)
- **Day 5:** Integration testing & fixes

### Week 4: Resource Economy
- **Day 1-3:** Phase 7 (Resource Nodes)
- **Day 4-5:** Balancing & polish

---

## 🚧 Known Dependencies

### Must Complete Before Others:
- **Cliffs (Phase 1)** → Before resource node placement
- **New Biomes (Phase 4)** → Before biome-specific resources (Phase 7)
- **Color Refinement (Phase 2)** → Anytime (independent)
- **Shipwrecks (Phase 3)** → Before ruin loot tables (Phase 6)

### Can Be Done In Parallel:
- Phases 2 & 3 (Colors & Shipwrecks)
- Phases 5 & 6 (Landmarks & Ruins)
- Any POI additions (Phases 3, 5, 6)

---

## 💡 Quick Reference: File Change Summary

| Phase | mapEngine.js | mapRenderer.js | gameView.js | itemDatabase.js | resourceNode.js |
|-------|--------------|----------------|-------------|-----------------|-----------------|
| 1     | ✅ Major     | ✅ Minor       | -           | -               | -               |
| 2     | -            | ✅ Major       | -           | -               | -               |
| 3     | ✅ Major     | ✅ Minor       | ✅ Major    | ✅ Minor        | -               |
| 4     | ✅ Major     | ✅ Minor       | -           | -               | -               |
| 5     | ✅ Major     | ✅ Minor       | ✅ Minor    | -               | ✅ Minor        |
| 6     | ✅ Major     | ✅ Minor       | ✅ Major    | ✅ Major        | -               |
| 7     | ✅ Minor     | -              | -           | ✅ Major        | ✅ Major        |

---

## 🎉 Final Notes

This is an **ambitious but achievable** upgrade plan. The phases are designed to:
- ✅ Build incrementally
- ✅ Test thoroughly at each step
- ✅ Maintain stability
- ✅ Add meaningful content
- ✅ Keep development fun

**Start with Phase 1 (Cliffs)** - it's the highest impact with clear implementation steps!

Let me know when you're ready to begin, and I'll guide you through each phase with detailed code changes.
