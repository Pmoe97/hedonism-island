# 📍 Strategic Locations System

## Overview
Implemented automatic placement of story-critical locations that serve as faction capitals and major POIs for the narrative.

---

## Strategic Locations

### 1. **Castaway Starting Beach** ⭐
- **Type**: Player spawn point
- **Location**: Southern beach area
- **Requirements**:
  - Beach terrain
  - Good land access (multiple land neighbors)
  - Not too central (some exploration challenge)
- **Visual**: Yellow circle with star (★)
- **Purpose**: Where the player begins their journey

### 2. **Tidal Clan Village** 🏠 (Blue)
- **Type**: Native settlement
- **Faction**: Tidal Clan
- **Location**: Coastal lowlands
- **Requirements**:
  - Near beach/coast
  - Prefer near river mouth
  - Low elevation (< 0.5)
  - Forest or savanna terrain
- **Visual**: Blue circle with house (⌂)
- **Purpose**: Diplomatic native faction (adapt and flow like water)

### 3. **Ridge Clan Village** 🏠 (Green)
- **Type**: Native settlement
- **Faction**: Ridge Clan
- **Location**: Mountain highlands
- **Requirements**:
  - High elevation (> 0.6)
  - Hills or peaks
  - Defensible position
  - Interior/remote location
- **Visual**: Green circle with house (⌂)
- **Purpose**: Traditional native faction (stand firm like stone)

### 4. **Mercenary Compound** ⚔️
- **Type**: Hostile base
- **Faction**: Mercenaries
- **Location**: Defensible, resource-rich area
- **Requirements**:
  - Moderate elevation (~0.55)
  - Resource-rich biomes (forest, jungle-hill, dry-hill)
  - Defensible (limited approaches)
  - Not too remote (central position)
- **Visual**: Red circle with crossed swords (⚔)
- **Purpose**: Antagonist faction base

### 5. **Sacred Sites** ✦ (3-5 locations)
- **Type**: Mystical locations
- **Importance**: Story-critical for Respect path
- **Location**: Distributed across map
- **Requirements**:
  - Mountain peaks (misty-peak, rocky-peak)
  - Cloud forests (mystical areas)
  - Remote locations
  - Minimum 5 hex spacing between sites
- **Visual**: Purple circle with sparkle (✦)
- **Purpose**: Native spiritual centers, protected by taboo

---

## Implementation Details

### Placement Algorithm

Each strategic location uses a **scoring system** to find optimal tiles:

```javascript
Score = Factor1 * Weight1 + Factor2 * Weight2 + ...
```

**Example - Tidal Village:**
```
coastalScore  * 0.4  (near beach)
riverScore    * 0.3  (near river mouth)
elevScore     * 0.2  (lowlands)
terrainScore  * 0.1  (forest/savanna)
= Total Score
```

Candidates are sorted by score and the best match is selected.

### Tile Properties

Strategic tiles receive special properties:
```javascript
tile.isStrategic = true
tile.strategicLocation = {
  name: "Tidal Village",
  type: "native-village",
  faction: "tidal-clan",
  description: "The Tidal Clan's seaside settlement...",
  tile: <reference>
}
tile.faction = "tidal-clan" // For territory system
```

### Visual Markers

**Map Renderer** draws colored circles with icons:
- Size: 8-10 pixel radius
- Stroke: Black outline
- Fill: Faction/type color
- Icon: Unicode symbol for type

**Hover Info** shows:
- Location name (highlighted box)
- Description text
- Faction control
- All standard tile info

---

## Story Integration

### Faction Alignment

The system creates natural faction territories:

**Tidal Clan (Coastal)**
- Peaceful, diplomatic
- Fishing and trade specialists
- Elder Council leadership
- Philosophy: "Adapt and flow"

**Ridge Clan (Mountain)**
- Traditional, protective
- Warriors and spiritual guides  
- Chieftain leadership
- Philosophy: "Stand firm"

**Mercenaries (Central)**
- Hostile, exploitative
- Modern weapons and tactics
- Ruthless hierarchy
- Goal: Strip island resources

### Path Support

**Claim Path:**
- Start at Castaway Beach
- Build democratic community
- Negotiate with both clans
- Defeat mercenaries

**Respect Path:**
- Learn from both clans
- Protect sacred sites
- Unite the clans
- Become guardian

**Exploit Path:**
- Join mercenaries
- Raid villages
- Desecrate sacred sites
- Dominate all factions

**Leave Path:**
- Neutral with all
- Gather boat materials
- Navigate between factions
- Escape island

---

## Next Steps: Territory System

### Phase 1: Territory Generation (Next Priority)

Use strategic locations as "capital" tiles and grow territories:

```javascript
1. Start at capital (village/compound/beach)
2. Flood-fill outward based on:
   - Terrain preference (each faction prefers certain biomes)
   - Distance from capital (max radius)
   - Natural boundaries (rivers, mountains, coast)
3. Stop when:
   - Hit another faction's territory
   - Reach max size
   - Encounter impassable terrain
4. Mark all tiles with faction ownership
```

### Phase 2: Visual Borders

Add colored borders between territories:
- Detect frontier tiles (adjacent to different faction)
- Draw thicker borders on hex edges
- Color-code by faction
- Show "contested" zones (overlap)

### Phase 3: Territory Control

Link to population and resources:
```javascript
territory.population = tiles.length * populationDensity
territory.resources = countResourcesInTerritory()
territory.strength = calculateMilitaryStrength()
```

Player can capture territory through:
- Combat victories
- Reputation building
- Quest completion
- Strategic alliances

---

## Configuration

### Adjusting Placement

**Want more sacred sites?**
```javascript
// In placeSacredSites()
const numSites = 5 + Math.floor(this.rng.random() * 3); // 5-7 instead of 3-5
```

**Change location preferences?**
```javascript
// Adjust weights in scoring functions
coastalScore * 0.5  // Increase coastal importance
riverScore * 0.2    // Decrease river importance
```

**Minimum distances:**
```javascript
// In placeSacredSites()
if (distance < 7) tooClose = true; // Increase from 5 to 7
```

---

## Testing Checklist

- [x] Castaway beach placed successfully
- [x] Tidal village near coast/river
- [x] Ridge village in highlands
- [x] Mercenary compound defensible
- [x] 3-5 sacred sites distributed
- [x] Visual markers render correctly
- [x] Hover shows location info
- [x] Tiles marked with faction property
- [x] No placement conflicts
- [x] Deterministic (same seed = same locations)

---

## Map Statistics

After generation, check console log:
```
📍 Strategic Locations: {
  castawayBeach: (12, 8),
  tidalVillage: (-5, 3),
  ridgeVillage: (2, -9),
  mercenaryCompound: (4, -2),
  sacredSites: 4
}
```

---

## Known Issues & Future Improvements

### Current Limitations:
1. Single-tile locations (should be multi-tile for villages/compounds)
2. No territory boundaries yet
3. No population mechanics tied to locations
4. Sacred sites need unique names (currently "A", "B", "C")

### Planned Enhancements:
1. **Multi-tile structures**: Villages span 3-7 tiles
2. **Territory generation**: Grow from capitals
3. **Dynamic names**: Procedural naming for sacred sites
4. **Building system**: Player can build in controlled territory
5. **Diplomacy UI**: Interact with faction leaders at villages
6. **Quest markers**: NPCs spawn at strategic locations

---

## Code References

**Main Implementation:**
- `src/modules/mapEngine.js` - Lines 100-450 (strategic location methods)

**Rendering:**
- `src/modules/mapRenderer.js` - `renderStrategicMarker()` method

**UI Integration:**
- `src/ui/gameView.js` - `showTileInfo()` updated for locations

**Tile Properties:**
```javascript
tile.isStrategic: boolean
tile.strategicLocation: object
tile.faction: string
tile.isSacred: boolean
```

---

## Summary

✅ **Castaway Beach** - Player starting point  
✅ **Tidal Village** - Coastal native faction  
✅ **Ridge Village** - Highland native faction  
✅ **Mercenary Compound** - Hostile faction base  
✅ **Sacred Sites (3-5)** - Mystical native locations  
✅ **Visual Markers** - Colored icons on map  
✅ **Hover Info** - Detailed location descriptions  
✅ **Faction Properties** - Tiles marked for territory system  

**Foundation complete for territory and population systems!**
