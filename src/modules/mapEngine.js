/**
 * Map Engine - Procedural Hex Island Generation
 * Generates deterministic islands with biomes, rivers, POIs, and factions
 */

import { HexGrid } from '../utils/hexGrid.js';
import { SimplexNoise } from '../utils/noise.js';
import { SeededRandom } from '../utils/seededRandom.js';

export class MapEngine {
  constructor(seed = Date.now()) {
    this.seed = seed;
    this.rng = new SeededRandom(seed);
    this.hexGrid = new HexGrid(20); // Radius 20 = ~1,200 hexes (approx 40x40)
    this.tiles = new Map(); // Store tiles by "q,r" key
    
    // Generation parameters
    this.config = {
      radius: 20,
      oceanBoundaryWidth: 1, // Hexes from edge that should be ocean
      elevationScale: 0.18,
      moistureScale: 0.14,
      falloffExponent: 1.8, // Lower = gentler falloff (more land)
      beachWidth: 1,
      riverSources: 2,
      landThreshold: 0.30, // Lower = more land coverage
      edgeNoiseStrength: 0.25 // Adds natural irregularity to coastline
    };
  }

  // ========================================
  // MAIN GENERATION PIPELINE
  // ========================================

  generate() {
    console.log(`🏝️ Generating island with seed: ${this.seed}`);
    
    // Step 1: Generate base hex grid
    const hexes = this.hexGrid.generateCircularMap(this.config.radius);
    console.log(`📐 Generated ${hexes.length} hexes in circular pattern`);
    
    // Step 2: Create elevation and moisture fields
    this.generateElevation(hexes);
    console.log(`⛰️  Generated elevation with radial falloff`);
    
    // Step 3: Determine land/sea
    this.thresholdLandSea();
    console.log(`🌊 Separated land from sea`);
    
    // Step 4: Mark beaches
    this.markBeaches();
    console.log(`🏖️  Marked beach tiles`);
    
    // Step 5: Carve rivers
    this.carveRiver();
    console.log(`🏞️  Carved rivers from mountains to sea`);
    
    // Step 6: Generate moisture
    this.generateMoisture();
    console.log(`💧 Generated moisture distribution`);
    
    // Step 7: Assign biomes
    this.assignBiomes();
    console.log(`🌴 Assigned biomes based on elevation and moisture`);
    
    // Step 8: Smooth biome transitions
    this.smoothBiomes();
    console.log(`✨ Smoothed biome transitions`);
    
    // Step 9: Place Points of Interest (POIs) - FUTURE
    // this.placePOIs();
    // console.log(`📍 Placed Points of Interest`);
    
    // Step 10: Define faction territories - FUTURE
    // this.defineFactionTerritories();
    // console.log(`⚔️  Defined faction territories`);
    
    // Step 11: Add resource nodes - FUTURE
    // this.placeResourceNodes();
    // console.log(`💎 Placed resource nodes`);
    
    // Validation
    const stats = this.getMapStats();
    console.log(`📊 Map Stats:`, stats);
    
    return {
      tiles: this.tiles,
      hexGrid: this.hexGrid,
      seed: this.seed,
      stats,
      config: this.config
    };
  }

  // ========================================
  // STEP 1: ELEVATION GENERATION
  // ========================================

  generateElevation(hexes) {
    const noise = new SimplexNoise(this.seed);
    const edgeNoise = new SimplexNoise(this.seed + 500);
    
    for (const hex of hexes) {
      // Distance from center (0 = center, 1 = edge)
      const distFromCenter = this.hexGrid.distance(0, 0, hex.q, hex.r);
      const normalizedDist = distFromCenter / this.config.radius;
      
      // Force ocean boundary at edges
      const oceanBoundaryDist = this.config.radius - this.config.oceanBoundaryWidth;
      if (distFromCenter > oceanBoundaryDist) {
        // This tile is in the ocean boundary zone - force it to be ocean
        this.setTile(hex.q, hex.r, {
          q: hex.q,
          r: hex.r,
          elevation: 0,
          terrain: null,
          moisture: 0,
          isEdge: true
        });
        continue;
      }
      
      // For land tiles: create gentler falloff with natural edge variation
      // Calculate falloff but leave room for land to extend near edges
      const landRadius = oceanBoundaryDist;
      const landDist = distFromCenter / landRadius;
      
      // Add noise to the coastline for natural irregularity
      const coastlineNoise = edgeNoise.noise2D(hex.q * 0.3, hex.r * 0.3);
      const adjustedLandDist = Math.max(0, landDist + coastlineNoise * this.config.edgeNoiseStrength);
      
      // Gentler falloff function - keeps more land near edges
      const falloff = Math.pow(1 - adjustedLandDist, this.config.falloffExponent);
      
      // Fractal noise for natural terrain variation
      const noiseValue = noise.fractal(
        hex.q * this.config.elevationScale,
        hex.r * this.config.elevationScale,
        4, // octaves
        0.5, // persistence
        2.0 // lacunarity
      );
      
      // Combine falloff and noise (50% falloff, 50% noise for more variation)
      const elevation = 0.50 * falloff + 0.50 * (noiseValue * 0.5 + 0.5);
      
      this.setTile(hex.q, hex.r, {
        q: hex.q,
        r: hex.r,
        elevation: Math.max(0, Math.min(1, elevation)),
        terrain: null,
        moisture: 0,
        isEdge: false
      });
    }
  }

  // ========================================
  // STEP 2: LAND/SEA THRESHOLD
  // ========================================

  thresholdLandSea() {
    for (const [key, tile] of this.tiles) {
      // Edge tiles are always ocean (already set to 0 elevation)
      if (tile.isEdge || tile.elevation <= this.config.landThreshold) {
        tile.terrain = 'sea';
        tile.isLand = false;
        tile.isPassable = false;
      } else {
        tile.isLand = true;
        tile.isPassable = true;
      }
    }
  }

  // ========================================
  // STEP 3: BEACHES
  // ========================================

  markBeaches() {
    const beachTiles = [];
    
    for (const [key, tile] of this.tiles) {
      if (!tile.isLand) continue;
      
      // Check if any neighbor is sea
      const neighbors = this.hexGrid.getNeighbors(tile.q, tile.r);
      const hasSeaNeighbor = neighbors.some(n => {
        const neighbor = this.getTile(n.q, n.r);
        return neighbor && neighbor.terrain === 'sea';
      });
      
      if (hasSeaNeighbor) {
        tile.terrain = 'beach';
        tile.distanceToWater = 0;
        beachTiles.push(tile);
      }
    }
    
    // Mark distance from water for other tiles (used for moisture later)
    this.calculateWaterDistance(beachTiles);
  }

  calculateWaterDistance(waterTiles) {
    // BFS to calculate distance from water
    const queue = [...waterTiles];
    const visited = new Set(waterTiles.map(t => this.key(t.q, t.r)));
    
    while (queue.length > 0) {
      const current = queue.shift();
      const neighbors = this.hexGrid.getNeighbors(current.q, current.r);
      
      for (const n of neighbors) {
        const key = this.key(n.q, n.r);
        if (visited.has(key)) continue;
        
        const neighbor = this.getTile(n.q, n.r);
        if (!neighbor || !neighbor.isLand) continue;
        
        neighbor.distanceToWater = (current.distanceToWater || 0) + 1;
        visited.add(key);
        queue.push(neighbor);
      }
    }
  }

  // ========================================
  // STEP 4: RIVER CARVING
  // ========================================

  carveRiver() {
    // Find multiple high elevation sources far from coast
    const potentialSources = [];
    
    for (const [key, tile] of this.tiles) {
      if (!tile.isLand || tile.terrain === 'beach') continue;
      if (tile.elevation > 0.65 && tile.distanceToWater > 3) {
        potentialSources.push(tile);
      }
    }
    
    if (potentialSources.length === 0) {
      console.warn('⚠️  No suitable river sources found');
      return;
    }
    
    // Sort by elevation and pick top sources
    potentialSources.sort((a, b) => b.elevation - a.elevation);
    const numRivers = Math.min(this.config.riverSources, potentialSources.length);
    const riverSources = potentialSources.slice(0, numRivers);
    
    console.log(`🏞️  Carving ${numRivers} river(s) from sources at elevation ${riverSources[0].elevation.toFixed(2)}`);
    
    let totalRiverTiles = 0;
    
    // Carve each river
    for (let i = 0; i < riverSources.length; i++) {
      const source = riverSources[i];
      const riverPath = [];
      let current = source;
      const visited = new Set();
      
      while (current && current.terrain !== 'sea' && riverPath.length < 100) {
        riverPath.push(current);
        visited.add(this.key(current.q, current.r));
        
        // Find lowest neighbor
        const neighbors = this.hexGrid.getNeighbors(current.q, current.r);
        let lowest = null;
        let lowestScore = Infinity;
        
        for (const n of neighbors) {
          const neighbor = this.getTile(n.q, n.r);
          if (!neighbor || visited.has(this.key(n.q, n.r))) continue;
          
          // Score: prefer going downhill and toward water
          // Lower score = better
          const elevationScore = neighbor.elevation * 100;
          const waterScore = (neighbor.distanceToWater || 10) * 2;
          const score = elevationScore + waterScore;
          
          if (score < lowestScore) {
            lowestScore = score;
            lowest = neighbor;
          }
        }
        
        current = lowest;
      }
      
      // Mark river tiles
      for (const tile of riverPath) {
        if (tile.terrain !== 'beach') {
          tile.terrain = 'river';
          tile.isRiver = true;
          tile.isPassable = true;
          tile.distanceToWater = 0;
          totalRiverTiles++;
        }
      }
      
      console.log(`   River ${i + 1}: ${riverPath.length} tiles`);
    }
    
    console.log(`🏞️  Total river tiles: ${totalRiverTiles}`);
  }

  // ========================================
  // STEP 5: MOISTURE GENERATION
  // ========================================

  generateMoisture() {
    const noise = new SimplexNoise(this.seed + 1000);
    
    for (const [key, tile] of this.tiles) {
      if (!tile.isLand) {
        tile.moisture = 0;
        continue;
      }
      
      // Base moisture from noise
      const baseMoisture = noise.fractal(
        tile.q * this.config.moistureScale,
        tile.r * this.config.moistureScale,
        3
      ) * 0.5 + 0.5;
      
      // Bonus moisture near water
      const waterProximity = 1 / (1 + (tile.distanceToWater || 10) * 0.3);
      
      tile.moisture = Math.max(0, Math.min(1, baseMoisture * 0.6 + waterProximity * 0.4));
    }
  }

  // ========================================
  // STEP 6: BIOME ASSIGNMENT
  // ========================================

  assignBiomes() {
    for (const [key, tile] of this.tiles) {
      if (tile.terrain === 'sea' || tile.terrain === 'beach' || tile.terrain === 'river') {
        continue; // Already assigned
      }
      
      const elev = tile.elevation;
      const moist = tile.moisture;
      
      // Elevation × Moisture lookup
      if (elev < 0.5) {
        // Lowlands
        if (moist < 0.3) tile.terrain = 'savanna';
        else if (moist < 0.6) tile.terrain = 'forest';
        else tile.terrain = 'rainforest';
      } else if (elev < 0.7) {
        // Hills
        if (moist < 0.4) tile.terrain = 'dry-hill';
        else if (moist < 0.7) tile.terrain = 'jungle-hill';
        else tile.terrain = 'cloud-forest';
      } else {
        // Mountains
        if (moist < 0.5) tile.terrain = 'rocky-peak';
        else tile.terrain = 'misty-peak';
      }
    }
  }

  // ========================================
  // STEP 7: SMOOTHING
  // ========================================

  smoothBiomes(passes = 2) {
    const biomePriority = {
      'sea': 0,
      'beach': 1,
      'river': 2,
      'savanna': 3,
      'forest': 4,
      'rainforest': 5,
      'dry-hill': 6,
      'jungle-hill': 7,
      'cloud-forest': 8,
      'rocky-peak': 9,
      'misty-peak': 10
    };
    
    for (let pass = 0; pass < passes; pass++) {
      const changes = [];
      
      for (const [key, tile] of this.tiles) {
        if (!tile.isLand || tile.isRiver || tile.terrain === 'beach') continue;
        
        const neighbors = this.hexGrid.getNeighbors(tile.q, tile.r);
        const neighborTerrains = neighbors
          .map(n => this.getTile(n.q, n.r))
          .filter(n => n && n.isLand)
          .map(n => n.terrain);
        
        // If tile disagrees with majority of neighbors, consider flipping
        const counts = {};
        for (const terrain of neighborTerrains) {
          counts[terrain] = (counts[terrain] || 0) + 1;
        }
        
        const modal = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        if (modal && modal[1] >= 4 && modal[0] !== tile.terrain) {
          changes.push({ tile, newTerrain: modal[0] });
        }
      }
      
      // Apply changes
      for (const { tile, newTerrain } of changes) {
        tile.terrain = newTerrain;
      }
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  key(q, r) {
    return `${q},${r}`;
  }

  getTile(q, r) {
    return this.tiles.get(this.key(q, r));
  }

  setTile(q, r, data) {
    this.tiles.set(this.key(q, r), data);
  }

  getMapStats() {
    const stats = {
      totalTiles: this.tiles.size,
      terrainCounts: {},
      landTiles: 0,
      seaTiles: 0,
      landPercentage: 0,
      edgeTiles: 0
    };
    
    for (const [key, tile] of this.tiles) {
      stats.terrainCounts[tile.terrain] = (stats.terrainCounts[tile.terrain] || 0) + 1;
      if (tile.isLand) stats.landTiles++;
      else stats.seaTiles++;
      if (tile.isEdge) stats.edgeTiles++;
    }
    
    stats.landPercentage = ((stats.landTiles / stats.totalTiles) * 100).toFixed(1);
    
    return stats;
  }

  // ========================================
  // FUTURE FEATURES - PLACEHOLDERS
  // ========================================

  /**
   * FUTURE: Place Points of Interest (POIs)
   * Examples: Shipwreck, ancient ruins, cave system, waterfall, 
   * volcano crater, mysterious monolith, abandoned camp, etc.
   * 
   * Design Notes:
   * - Each POI should have narrative significance
   * - Limit to 5-10 major POIs per map
   * - Place based on terrain suitability
   * - Ensure they're discoverable but not too obvious
   * - Can unlock quests, resources, or story events
   */
  placePOIs() {
    const pois = [];
    
    // Example POI types (to be implemented):
    const poiTypes = {
      'shipwreck': { terrain: ['beach', 'sea'], rarity: 'common', narrative: 'crash-related' },
      'ruins': { terrain: ['jungle-hill', 'forest'], rarity: 'rare', narrative: 'ancient-civilization' },
      'cave': { terrain: ['rocky-peak', 'dry-hill'], rarity: 'uncommon', narrative: 'shelter-resource' },
      'waterfall': { terrain: ['river', 'cloud-forest'], rarity: 'rare', narrative: 'scenic-resource' },
      'volcano': { terrain: ['rocky-peak', 'misty-peak'], rarity: 'legendary', narrative: 'danger-power' },
      'monolith': { terrain: ['savanna', 'dry-hill'], rarity: 'rare', narrative: 'mystery' },
      'wreckage': { terrain: ['beach', 'forest'], rarity: 'common', narrative: 'crash-related' }
    };
    
    // TODO: Implement POI placement algorithm
    // 1. Select appropriate tiles based on terrain
    // 2. Ensure minimum distance between POIs
    // 3. Add narrative context
    // 4. Store in tile.poi property
    
    return pois;
  }

  /**
   * FUTURE: Define Faction Territories
   * Examples: Survivor camps, native tribes, wildlife zones, 
   * "claimed" areas, danger zones, etc.
   * 
   * Design Notes:
   * - Factions control regions, not individual tiles
   * - Should have organic boundaries (follow terrain features)
   * - 3-5 major factions maximum
   * - Player starts neutral or with one faction
   * - Territories can overlap (contested zones)
   * - Affects encounters, resources, quests
   */
  defineFactionTerritories() {
    const territories = [];
    
    // Example faction types (to be implemented):
    const factionTypes = {
      'survivors': { preferredTerrain: ['beach', 'forest'], size: 'small', hostility: 'friendly' },
      'natives': { preferredTerrain: ['jungle-hill', 'rainforest'], size: 'large', hostility: 'neutral' },
      'wildlife': { preferredTerrain: ['savanna', 'forest'], size: 'medium', hostility: 'territorial' },
      'pirates': { preferredTerrain: ['beach', 'sea'], size: 'small', hostility: 'hostile' },
      'cultists': { preferredTerrain: ['rocky-peak', 'ruins'], size: 'small', hostility: 'hostile' }
    };
    
    // TODO: Implement territory generation
    // 1. Select central "capital" tile for each faction
    // 2. Grow territory outward based on terrain preference
    // 3. Stop at natural boundaries (rivers, mountains, coast)
    // 4. Add to tile.faction property
    // 5. Mark border tiles as "frontier"
    
    return territories;
  }

  /**
   * FUTURE: Place Resource Nodes
   * Examples: Fruit trees, freshwater springs, stone quarries,
   * fishing spots, herb patches, wildlife dens, etc.
   * 
   * Design Notes:
   * - Should be numerous but not overwhelming
   * - Cluster by terrain type
   * - Some renewable (fruit, fish), some finite (stone, minerals)
   * - Higher quality resources in dangerous areas
   * - Can be depleted and regenerate over time
   */
  placeResourceNodes() {
    const resources = [];
    
    // Example resource types (to be implemented):
    const resourceTypes = {
      'fruit-tree': { terrain: ['forest', 'rainforest'], density: 'high', renewable: true },
      'freshwater': { terrain: ['river', 'cloud-forest'], density: 'medium', renewable: true },
      'stone': { terrain: ['rocky-peak', 'dry-hill'], density: 'high', renewable: false },
      'fish': { terrain: ['river', 'sea', 'beach'], density: 'medium', renewable: true },
      'herbs': { terrain: ['savanna', 'forest'], density: 'medium', renewable: true },
      'hardwood': { terrain: ['jungle-hill', 'rainforest'], density: 'low', renewable: false },
      'wildlife': { terrain: ['savanna', 'forest', 'jungle-hill'], density: 'low', renewable: true },
      'minerals': { terrain: ['rocky-peak'], density: 'very-low', renewable: false }
    };
    
    // TODO: Implement resource placement
    // 1. For each terrain type, place appropriate resources
    // 2. Use Poisson disk sampling for natural distribution
    // 3. Add quality/quantity variation
    // 4. Store in tile.resources array
    // 5. Track depletion state
    
    return resources;
  }

  /**
   * FUTURE: Fog of War System
   * 
   * Design Notes:
   * - All tiles start hidden except player's starting location
   * - Tiles reveal when player moves adjacent to them
   * - Three states: unexplored, explored, visible
   * - Can see terrain type when explored, but not current details
   * - High ground (mountains) reveals larger area
   * - Story events can reveal specific areas
   */
  initializeFogOfWar(startingTile) {
    // TODO: Implement fog of war
    // 1. Mark all tiles as unexplored
    // 2. Reveal starting location and immediate neighbors
    // 3. Add tile.fogState property ('unexplored', 'explored', 'visible')
    // 4. Create reveal() method for when player explores
    // 5. Store vision ranges for different terrain types
  }

  /**
   * FUTURE: Landmarks System
   * Special one-of-a-kind locations that serve as waypoints
   * 
   * Examples: The Great Banyan, Skull Rock, Crystal Lagoon,
   * The Spire, Dead Man's Cove, etc.
   * 
   * Design Notes:
   * - Visually distinctive on map
   * - Named and memorable
   * - Often multi-tile structures
   * - Used for navigation and quests
   * - 3-5 major landmarks per map
   */
  placeLandmarks() {
    const landmarks = [];
    
    // TODO: Implement landmark placement
    // 1. Select dramatic terrain features (highest peak, largest beach, etc.)
    // 2. Assign unique names
    // 3. Make them multi-tile if appropriate
    // 4. Add special visual markers
    // 5. Generate associated lore/quests
    
    return landmarks;
  }
}
