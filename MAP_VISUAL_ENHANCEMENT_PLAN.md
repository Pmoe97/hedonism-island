# Map Visual Enhancement Plan
## "Civilization-Level" Map Visualization

### Vision
Transform the flat hex map into a rich, information-dense visual experience where every pixel tells a story. Players should be able to read the map like a living document—understanding elevation, biomes, danger, resources, faction control, and strategic value at a glance.

---

## Core Design Principles

1. **Information Density**: Every visual element serves a purpose
2. **Natural Interpretation**: Colors/textures match real-world expectations
3. **Layered Complexity**: Multiple information layers that don't conflict
4. **Strategic Clarity**: Important game information jumps out visually
5. **Performance**: Beautiful but smooth (target 60fps)

---

## Visual Enhancement Layers

### 1. **Elevation & Topography** (Foundation Layer)
**Current**: Flat uniform colors  
**Target**: Rich elevation-aware rendering

**Techniques**:
- **Gradient shading** based on height (lighter = higher, darker = lower)
- **Contour lines** at major elevation breaks (every 20-30m)
- **Hillshading**: Simulate directional lighting to show slopes
  - NW light source creates realistic shadows on SE-facing slopes
  - Subtle but gives instant 3D perception
- **Elevation tinting**: Cool blues (low) → greens → warm browns (high)

```javascript
// Pseudocode
tileColor = baseTerrain Color + 
            elevationGradient * 0.3 + 
            hillshade * 0.2 +
            slopeFacing * 0.1
```

---

### 2. **Biome/Terrain Textures** (Identity Layer)
**Current**: Solid colors per terrain type  
**Target**: Rich, recognizable textures

**Techniques**:
- **Procedural noise patterns** for each terrain:
  - **Forest**: Dark green base + lighter green speckles (tree clusters)
  - **Beach**: Sandy tan + scattered white dots (shells/coral)
  - **Jungle**: Deep green + varied darkness (dense foliage)
  - **Mountain**: Gray/brown + angular patterns (rock faces)
  - **Plains**: Light green + subtle horizontal striations (grass)
  
- **Terrain transitions**: Blend adjacent terrains at borders
  - Forest→Plains: Gradual tree density decrease
  - Beach→Ocean: Foam pattern at waterline
  
- **Canvas noise overlay**: Add subtle grain for organic feel

---

### 3. **Faction Territory** (Political Layer)
**Current**: Basic owner coloring  
**Target**: Clear sovereignty with depth

**Techniques**:
- **Territory tinting**: Subtle color overlay (15-25% opacity)
  - Castaway: Warm yellow/orange tint
  - Natives Clan 1: Forest green tint
  - Natives Clan 2: Turquoise tint
  - Mercenaries: Cold blue/gray tint
  
- **Border rendering**:
  - **Thick glowing borders** between different factions
  - **Dashed/dotted borders** for claimed vs controlled
  - **Border strength**: Line thickness = control strength %
  
- **Capital/stronghold indicators**: Special icons for key territories
  
- **Disputed territories**: Animated "contested" pattern (striped or pulsing)

---

### 4. **Resource & POI Indicators** (Economic Layer)
**Current**: Generic markers  
**Target**: Clear, prioritized resource visualization

**Techniques**:
- **Resource quality**: Icon size/brightness scales with yield
  - Small dim icon = depleted/low yield
  - Large bright icon = abundant resource
  
- **Resource type icons**:
  - 🪵 Wood (brown tree)
  - 🪨 Stone (gray rock)
  - 🍖 Food (varies by biome)
  - 🌿 Herbs (green leaf)
  - ⚒️ Metal (silver pickaxe)
  
- **Discovery state**:
  - Undiscovered: No icon
  - Rumored: Faint "?" icon
  - Discovered: Full color icon
  - Depleted: Grayed out icon
  
- **NPC indicators**:
  - Friendly: Green dot
  - Neutral: Yellow dot  
  - Hostile: Red dot
  - Number badge if multiple NPCs

---

### 5. **Danger & Strategic Value** (Tactical Layer)
**Current**: Not visualized  
**Target**: Instant threat assessment

**Techniques**:
- **Danger heatmap** (optional toggle):
  - Red tint: High danger (hostile NPCs, predators)
  - Yellow: Moderate risk
  - Green: Safe zones
  - Intensity = threat level
  
- **Strategic value** (optional toggle):
  - Resource-rich tiles: Golden glow
  - Chokepoints: Blue highlight
  - High elevation (defensible): Purple tint
  
- **Path visualization**:
  - Movement cost overlay (darker = harder to traverse)
  - Recommended paths highlighted in green

---

### 6. **Environmental Effects** (Atmosphere Layer)
**Current**: Static tiles  
**Target**: Living, breathing world

**Techniques**:
- **Time of day**: Lighting changes
  - Dawn/dusk: Warm orange tones
  - Midday: Bright, high contrast
  - Night: Desaturated, blue-tinted
  
- **Weather effects** (if implemented):
  - Rain: Animated rain streaks, darker terrain
  - Fog: Reduced visibility, gray overlay
  - Storms: Darkened sky, wind effects
  
- **Visited/explored state**:
  - Unexplored: Darker, slightly desaturated
  - Visited: Full color
  - Current tile: Bright highlight pulse
  
- **Seasonal variation** (future):
  - Spring: Green, flowers
  - Summer: Bright, warm
  - Fall: Orange/red foliage
  - Winter: Snow coverage

---

## Technical Implementation Strategy

### Phase 1: Foundation (Week 1)
✅ **Goal**: Elevation-aware rendering + basic textures

**Tasks**:
1. Implement hillshading algorithm
2. Add elevation gradient coloring
3. Create procedural noise for each terrain type
4. Add subtle grain overlay
5. Optimize rendering pipeline

**Files to modify**:
- `src/modules/mapRenderer.js` - Core rendering
- `src/modules/mapEngine.js` - Data structure support
- Create `src/utils/terrainTextures.js` - Texture generation

---

### Phase 2: Territory & Borders (Week 2)
✅ **Goal**: Clear faction visualization

**Tasks**:
1. Implement faction territory tinting
2. Create border detection algorithm (neighboring tiles)
3. Render thick, colored borders between factions
4. Add border strength visualization
5. Implement disputed territory patterns

**Files to modify**:
- `src/modules/mapRenderer.js` - Border rendering
- `src/modules/territory.js` - Territory data
- Create `src/utils/borderRenderer.js` - Border algorithms

---

### Phase 3: POI & Resources (Week 3)
✅ **Goal**: Rich resource visualization

**Tasks**:
1. Design icon set for resources
2. Implement quality-based scaling
3. Add discovery state rendering
4. Create NPC indicator system
5. Add icon hover tooltips

**Files to modify**:
- `src/modules/mapRenderer.js` - Icon rendering
- `src/modules/resourceNode.js` - Resource data
- `src/ui/gameView.js` - Hover interactions

---

### Phase 4: Strategic Layers (Week 4)
✅ **Goal**: Optional information overlays

**Tasks**:
1. Implement danger heatmap calculation
2. Create strategic value algorithm
3. Add layer toggle UI
4. Implement path cost visualization
5. Performance optimization

**Files to modify**:
- Create `src/modules/mapLayers.js` - Layer system
- `src/ui/gameView.js` - Layer controls
- `src/modules/mapRenderer.js` - Multi-layer rendering

---

### Phase 5: Atmosphere & Polish (Week 5)
✅ **Goal**: Living world feel

**Tasks**:
1. Add time-of-day lighting
2. Implement explored/unexplored states
3. Create current tile highlight
4. Add subtle animations (pulse, shimmer)
5. Performance profiling & optimization

**Files to modify**:
- `src/modules/mapRenderer.js` - Lighting & effects
- `src/modules/gameState.js` - Time tracking
- `src/utils/animations.js` - Animation system

---

## Rendering Optimization Strategies

### 1. **Layer Caching**
- Pre-render base terrain layer to off-screen canvas
- Only redraw dynamic elements (NPCs, selection) each frame
- Cache hillshading calculations

### 2. **View Culling**
- Only render tiles in viewport + 1 tile buffer
- Skip rendering for distant/zoomed-out tiles

### 3. **Progressive Enhancement**
- Low zoom: Simplified rendering (no textures)
- Medium zoom: Full terrain + borders
- High zoom: All details + icons

### 4. **WebGL Upgrade** (Optional, Phase 6)
- Move to WebGL for GPU-accelerated rendering
- Shader-based hillshading & effects
- Instanced rendering for icons

---

## Immediate Quick Wins (Can Implement Today)

### 1. **Elevation Gradient** (30 minutes)
```javascript
const elevationFactor = (tile.elevation - minElevation) / (maxElevation - minElevation);
const brightness = 0.7 + (elevationFactor * 0.6); // 0.7-1.3 range
ctx.fillStyle = adjustBrightness(baseColor, brightness);
```

### 2. **Territory Tinting** (20 minutes)
```javascript
if (tile.owner) {
  ctx.fillStyle = factionColors[tile.owner] + '33'; // 20% opacity
  ctx.fill(); // Overlay on terrain
}
```

### 3. **Thick Faction Borders** (45 minutes)
```javascript
// Detect border tiles (neighbors with different owner)
if (hasDifferentNeighbor(tile)) {
  ctx.lineWidth = 4;
  ctx.strokeStyle = factionColors[tile.owner];
  ctx.stroke();
}
```

### 4. **Resource Icon Scaling** (15 minutes)
```javascript
const iconSize = 10 + (node.yield / maxYield) * 10; // 10-20px
drawIcon(node.type, position, iconSize);
```

### 5. **Visited/Unexplored Darkness** (10 minutes)
```javascript
if (!tile.visited) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fill(); // Darken unexplored tiles
}
```

**Total time for quick wins: ~2 hours**  
**Impact**: Immediate visual improvement

---

## Color Palette Reference

### Elevation Gradient
```
Sea Level (-50m):  #2E5266 (deep blue)
Low (0-20m):       #4A7BA7 (light blue)
Mid (20-50m):      #7DAA92 (sea green)
High (50-100m):    #A9B388 (olive)
Peak (100m+):      #8B7355 (brown)
```

### Faction Colors
```
Castaway:       #F4A460 (sandy brown)
Natives Clan 1: #228B22 (forest green)
Natives Clan 2: #20B2AA (light sea green)
Mercenaries:    #4682B4 (steel blue)
Neutral:        #D3D3D3 (light gray)
```

### Terrain Base Colors
```
Forest:         #2D5016
Jungle:         #1A3A1A
Plains:         #7DAA5B
Beach:          #F4E4C1
Ocean:          #1E3A5F
Mountain:       #6B6B6B
Swamp:          #3A4A3A
Desert:         #E4C49A
```

---

## Success Metrics

**Visual Quality**:
- [ ] Players can identify terrain type at a glance
- [ ] Elevation changes are immediately obvious
- [ ] Faction boundaries are crystal clear
- [ ] Strategic tiles (resources, danger) stand out
- [ ] Map feels "alive" and dynamic

**Performance**:
- [ ] Maintains 60fps on standard hardware
- [ ] Render time < 16ms per frame
- [ ] No janky scrolling or zooming
- [ ] Smooth on mobile devices (30fps minimum)

**Usability**:
- [ ] New players understand map without tutorial
- [ ] Information hierarchy is intuitive
- [ ] Toggle layers don't overwhelm
- [ ] Accessible color choices (colorblind-friendly)

---

## Next Steps

**Decision Point**: Which phase should we tackle first?

**Recommendation**: Start with **Quick Wins** (2 hours) to see immediate impact, then proceed with **Phase 1: Foundation** for the biggest visual transformation.

Would you like me to:
1. **Implement the Quick Wins** right now for instant improvement?
2. **Start Phase 1** for comprehensive elevation & texture system?
3. **Show mockups** of what each enhancement would look like?
4. **Focus on a specific aspect** you're most excited about?
