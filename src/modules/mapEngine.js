/**
 * Map Engine - Procedural Hex Island Generation
 * Generates deterministic islands with biomes, rivers, POIs, and factions
 */

import { HexGrid } from '../utils/hexGrid.js';
import { SimplexNoise } from '../utils/noise.js';
import { SeededRandom } from '../utils/seededRandom.js';

export class MapEngine {
  constructor(hexGrid, noise, rng) {
    this.hexGrid = hexGrid;
    this.noise = noise;
    this.rng = rng;
    this.seed = rng.seed; // Get seed from the rng
    this.tiles = new Map(); // Store tiles by "q,r" key
    
    // Generation parameters
    this.config = {
      radius: 20,
      oceanBoundaryWidth: 1, // Minimal ocean boundary - land extends to near edge
      elevationScale: 0.12, // Lower = smoother terrain (less fragmentation)
      moistureScale: 0.14,
      falloffExponent: 1.5, // Lower = gentler falloff (land extends further out)
      beachWidth: 1,
      riverSources: 3, // More rivers for a larger island
      landThreshold: 0.25, // Lower = more land coverage
      edgeNoiseStrength: 0.15, // Reduced for smoother coastline
      continentBlend: 0.60 // Balanced blend (60% falloff, 40% noise for natural edges)
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
    
    // Step 3.5: Remove small islands to ensure single landmass
    this.ensureSingleLandmass();
    console.log(`🏝️  Ensured single connected landmass`);
    
    // Step 4: Mark beaches
    this.markBeaches();
    console.log(`🏖️  Marked beach tiles`);
    
    // Step 4.5: Mark cliffs (high-elevation coastlines)
    this.markCliffs();
    console.log(`🏔️  Marked cliff coastlines`);
    
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
    
    // Step 9: Place Strategic Locations (Villages, Sacred Sites, etc.)
    this.placeStrategicLocations();
    console.log(`📍 Placed strategic locations`);
    
    // Step 10: Generate Faction Territories
    this.generateFactionTerritories();
    console.log(`⚔️  Generated faction territories`);
    
    // Step 11: Place Points of Interest (POIs) - FUTURE
    // this.placePOIs();
    // console.log(`📍 Placed Points of Interest`);
    
    // Step 12: Add resource nodes - FUTURE
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
      config: this.config,
      strategicLocations: this.strategicLocations,
      territories: this.territories
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
      
      // Force ocean boundary at edges (wider boundary for single landmass)
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
      
      // For land tiles: create stronger falloff for continent-like shape
      const landRadius = oceanBoundaryDist;
      const landDist = distFromCenter / landRadius;
      
      // Add subtle noise to coastline for natural irregularity (reduced)
      const coastlineNoise = edgeNoise.noise2D(hex.q * 0.2, hex.r * 0.2);
      const adjustedLandDist = Math.max(0, landDist + coastlineNoise * this.config.edgeNoiseStrength);
      
      // Stronger falloff function - creates more centralized landmass
      const falloff = Math.pow(1 - adjustedLandDist, this.config.falloffExponent);
      
      // Fractal noise for natural terrain variation (reduced scale = smoother)
      const noiseValue = noise.fractal(
        hex.q * this.config.elevationScale,
        hex.r * this.config.elevationScale,
        4, // octaves
        0.5, // persistence
        2.0 // lacunarity
      );
      
      // Blend falloff and noise - higher continentBlend = more circular/cohesive
      // This prevents noise from fragmenting the landmass
      const elevation = this.config.continentBlend * falloff + 
                       (1 - this.config.continentBlend) * (noiseValue * 0.5 + 0.5);
      
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
  // STEP 2.5: ENSURE SINGLE LANDMASS
  // ========================================

  ensureSingleLandmass() {
    // Find all connected landmasses using flood fill
    const landmasses = [];
    const visited = new Set();
    
    // Find all land tiles and group them into connected components
    for (const [key, tile] of this.tiles) {
      if (!tile.isLand || visited.has(key)) continue;
      
      // Start a new landmass
      const landmass = [];
      const queue = [tile];
      visited.add(key);
      
      while (queue.length > 0) {
        const current = queue.shift();
        landmass.push(current);
        
        // Check all neighbors
        const neighbors = this.hexGrid.getNeighbors(current.q, current.r);
        for (const n of neighbors) {
          const neighborKey = this.key(n.q, n.r);
          if (visited.has(neighborKey)) continue;
          
          const neighbor = this.getTile(n.q, n.r);
          if (!neighbor || !neighbor.isLand) continue;
          
          visited.add(neighborKey);
          queue.push(neighbor);
        }
      }
      
      landmasses.push(landmass);
    }
    
    if (landmasses.length === 0) {
      console.warn('⚠️  No landmass found! Adjusting parameters...');
      return;
    }
    
    // Find the largest landmass (this is our main continent)
    landmasses.sort((a, b) => b.length - a.length);
    const mainLandmass = landmasses[0];
    
    console.log(`🏝️  Found ${landmasses.length} landmass(es). Largest: ${mainLandmass.length} tiles`);
    
    // Convert all smaller landmasses to ocean
    let removedTiles = 0;
    for (let i = 1; i < landmasses.length; i++) {
      for (const tile of landmasses[i]) {
        tile.terrain = 'sea';
        tile.isLand = false;
        tile.isPassable = false;
        tile.elevation = 0;
        removedTiles++;
      }
    }
    
    if (removedTiles > 0) {
      console.log(`🌊 Removed ${removedTiles} tiles from ${landmasses.length - 1} small island(s)`);
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
  // STEP 3.5: CLIFFS
  // ========================================

  markCliffs() {
    let cliffCount = 0;
    
    for (const [key, tile] of this.tiles) {
      // Skip if not currently a beach
      if (tile.terrain !== 'beach') continue;
      
      // Check elevation - high elevation beaches become cliffs
      if (tile.elevation >= 0.6) {
        tile.terrain = 'cliff';
        tile.isPassable = true; // Can walk on cliff top from land
        tile.canLandFromSea = false; // Cannot approach from sea
        tile.isCliff = true;
        cliffCount++;
      }
    }
    
    console.log(`🏔️  Converted ${cliffCount} high-elevation beaches to cliffs`);
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
      if (tile.terrain === 'sea' || tile.terrain === 'beach' || tile.terrain === 'cliff' || tile.terrain === 'river') {
        continue; // Already assigned
      }
      
      const elev = tile.elevation;
      const moist = tile.moisture;
      const distToWater = tile.distanceToWater || 999;
      
      // Special coastal biomes (after beaches/cliffs marked)
      // Mangrove swamps - coastal wetlands
      if (elev < 0.4 && moist > 0.7 && distToWater <= 2) {
        tile.terrain = 'mangrove';
        continue;
      }
      
      // Palm groves - tropical coastal (just inland from beach)
      if (elev < 0.45 && moist > 0.6 && distToWater === 1) {
        tile.terrain = 'palm-grove';
        continue;
      }
      
      // Elevation × Moisture lookup
      if (elev < 0.5) {
        // Lowlands
        if (moist < 0.3) tile.terrain = 'savanna';
        else if (moist < 0.6) tile.terrain = 'forest';
        else tile.terrain = 'rainforest';
      } else if (elev < 0.7) {
        // Hills
        if (moist < 0.35) {
          // Scrubland - arid transition zone
          tile.terrain = 'scrubland';
        } else if (moist < 0.5) {
          tile.terrain = 'dry-hill';
        } else if (moist < 0.75) {
          // Bamboo forest - mid-elevation, wet
          if (moist > 0.65 && elev >= 0.45 && elev < 0.6) {
            tile.terrain = 'bamboo-forest';
          } else {
            tile.terrain = 'jungle-hill';
          }
        } else {
          tile.terrain = 'cloud-forest';
        }
      } else {
        // Mountains
        if (moist < 0.5) tile.terrain = 'rocky-peak';
        else tile.terrain = 'misty-peak';
      }
    }
    
    // Ensure biome diversity
    this.ensureBiomeDiversity();
  }

  /**
   * Ensure all major biomes are represented on the map
   * This prevents unlucky RNG from creating monotonous islands
   */
  ensureBiomeDiversity() {
    const requiredBiomes = [
      'savanna', 'forest', 'rainforest',
      'dry-hill', 'jungle-hill', 'cloud-forest',
      'rocky-peak', 'misty-peak',
      // New biomes (optional but encouraged)
      'mangrove', 'palm-grove', 'bamboo-forest', 'scrubland'
    ];
    
    const biomeCounts = {};
    for (const [key, tile] of this.tiles) {
      if (tile.isLand && tile.terrain !== 'beach' && tile.terrain !== 'cliff' && tile.terrain !== 'river') {
        biomeCounts[tile.terrain] = (biomeCounts[tile.terrain] || 0) + 1;
      }
    }
    
    // Check for missing biomes (require at least 3 tiles)
    const missingBiomes = requiredBiomes.filter(b => !biomeCounts[b] || biomeCounts[b] < 3);
    
    if (missingBiomes.length > 0) {
      console.log(`🎲 Seeding missing biomes: ${missingBiomes.join(', ')}`);
      
      for (const biome of missingBiomes) {
        // Find suitable tiles to convert
        const candidates = [];
        
        for (const [key, tile] of this.tiles) {
          if (!tile.isLand || tile.terrain === 'beach' || tile.terrain === 'cliff' || tile.terrain === 'river') continue;
          
          // Check if tile's elevation/moisture is close to biome requirements
          const suitability = this.getBiomeSuitability(tile, biome);
          if (suitability > 0.5) {
            candidates.push({ tile, suitability });
          }
        }
        
        // Convert a few tiles to this biome
        candidates.sort((a, b) => b.suitability - a.suitability);
        const numToConvert = Math.min(5, candidates.length);
        for (let i = 0; i < numToConvert; i++) {
          candidates[i].tile.terrain = biome;
        }
      }
    }
  }

  /**
   * Calculate how suitable a tile is for a given biome (0-1)
   */
  getBiomeSuitability(tile, biome) {
    const elev = tile.elevation;
    const moist = tile.moisture;
    const distToWater = tile.distanceToWater || 999;
    
    const biomeRanges = {
      'savanna': { elevMin: 0.35, elevMax: 0.5, moistMin: 0.0, moistMax: 0.3 },
      'forest': { elevMin: 0.35, elevMax: 0.5, moistMin: 0.3, moistMax: 0.6 },
      'rainforest': { elevMin: 0.35, elevMax: 0.5, moistMin: 0.6, moistMax: 1.0 },
      'mangrove': { elevMin: 0.25, elevMax: 0.4, moistMin: 0.7, moistMax: 1.0, maxDistToWater: 2 },
      'palm-grove': { elevMin: 0.25, elevMax: 0.45, moistMin: 0.6, moistMax: 1.0, maxDistToWater: 1 },
      'scrubland': { elevMin: 0.35, elevMax: 0.55, moistMin: 0.0, moistMax: 0.35 },
      'dry-hill': { elevMin: 0.5, elevMax: 0.7, moistMin: 0.0, moistMax: 0.5 },
      'jungle-hill': { elevMin: 0.5, elevMax: 0.7, moistMin: 0.4, moistMax: 0.75 },
      'bamboo-forest': { elevMin: 0.45, elevMax: 0.6, moistMin: 0.65, moistMax: 1.0 },
      'cloud-forest': { elevMin: 0.5, elevMax: 0.7, moistMin: 0.7, moistMax: 1.0 },
      'rocky-peak': { elevMin: 0.7, elevMax: 1.0, moistMin: 0.0, moistMax: 0.5 },
      'misty-peak': { elevMin: 0.7, elevMax: 1.0, moistMin: 0.5, moistMax: 1.0 }
    };
    
    const range = biomeRanges[biome];
    if (!range) return 0;
    
    // Calculate how well tile matches the biome's ideal range
    const elevScore = (elev >= range.elevMin && elev <= range.elevMax) ? 1 : 0;
    const moistScore = (moist >= range.moistMin && moist <= range.moistMax) ? 1 : 0;
    
    // Check water distance requirement if specified
    let waterScore = 1;
    if (range.maxDistToWater !== undefined) {
      waterScore = distToWater <= range.maxDistToWater ? 1 : 0;
    }
    
    return (elevScore + moistScore + waterScore) / 3;
  }

  // ========================================
  // STEP 7: SMOOTHING
  // ========================================

  smoothBiomes(passes = 2) {
    const biomePriority = {
      'sea': 0,
      'beach': 1,
      'cliff': 2,
      'river': 3,
      'mangrove': 4,
      'palm-grove': 5,
      'savanna': 6,
      'scrubland': 7,
      'forest': 8,
      'rainforest': 9,
      'dry-hill': 10,
      'jungle-hill': 11,
      'bamboo-forest': 12,
      'cloud-forest': 13,
      'rocky-peak': 14,
      'misty-peak': 15
    };
    
    for (let pass = 0; pass < passes; pass++) {
      const changes = [];
      
      for (const [key, tile] of this.tiles) {
        if (!tile.isLand || tile.isRiver || tile.terrain === 'beach' || tile.terrain === 'cliff') continue;
        
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
  // STRATEGIC LOCATIONS PLACEMENT
  // ========================================

  /**
   * Get the quadrant of a hex coordinate (for distributing locations)
   * Returns: 'NE', 'SE', 'SW', 'NW' based on q and r values
   */
  getQuadrant(q, r) {
    // In axial coordinates:
    // NE: q > 0, r < 0
    // SE: q > 0, r > 0  
    // SW: q < 0, r > 0
    // NW: q < 0, r < 0
    if (q >= 0 && r < 0) return 'NE';
    if (q > 0 && r >= 0) return 'SE';
    if (q <= 0 && r > 0) return 'SW';
    return 'NW'; // q < 0 && r <= 0
  }

  /**
   * Place strategic locations: villages, sacred sites, compounds, etc.
   * These are story-critical locations that serve as faction capitals
   * and major POIs for the narrative.
   */
  placeStrategicLocations() {
    this.strategicLocations = {
      tidalVillage: null,
      ridgeVillage: null,
      mercenaryCompound: null,
      castawayBeach: null,
      sacredSites: [],
      shipwrecks: [],
      landmarks: {
        waterfall: null,
        hotSpring: null,
        caves: [],
        harbor: null
      },
      ruins: []
    };

    const minDistanceBetweenBases = Math.floor(this.config.radius * 0.6); // At least 60% of radius apart
    const placedLocations = []; // Track all placed locations for distance checking

    // 1. Find castaway starting beach (southern-ish beach, accessible)
    this.strategicLocations.castawayBeach = this.findCastawayStartingBeach();
    if (this.strategicLocations.castawayBeach) {
      placedLocations.push(this.strategicLocations.castawayBeach.tile);
    }
    
    // 2. Find Tidal Clan village (coastal, near river mouth, far from castaway beach)
    this.strategicLocations.tidalVillage = this.findTidalVillage(placedLocations, minDistanceBetweenBases);
    if (this.strategicLocations.tidalVillage) {
      placedLocations.push(this.strategicLocations.tidalVillage.tile);
    }
    
    // 3. Find Ridge Clan village (mountains/highlands, far from other bases)
    this.strategicLocations.ridgeVillage = this.findRidgeVillage(placedLocations, minDistanceBetweenBases);
    if (this.strategicLocations.ridgeVillage) {
      placedLocations.push(this.strategicLocations.ridgeVillage.tile);
    }
    
    // 4. Find mercenary compound (defensible, resource-rich, far from other bases)
    this.strategicLocations.mercenaryCompound = this.findMercenaryCompound(placedLocations, minDistanceBetweenBases);
    if (this.strategicLocations.mercenaryCompound) {
      placedLocations.push(this.strategicLocations.mercenaryCompound.tile);
    }
    
    // 5. Place sacred sites (mountains, special locations, distributed)
    this.strategicLocations.sacredSites = this.placeSacredSites();
    
    // 6. Place shipwrecks (coastal, loot locations)
    this.strategicLocations.shipwrecks = this.placeShipwrecks();
    
    // 7. Place natural landmarks (waterfalls, caves, hot springs, harbors)
    this.placeNaturalLandmarks();
    
    // 8. Place ancient ruins (mysterious ancient civilization sites)
    this.strategicLocations.ruins = this.placeAncientRuins();
    
    // Mark these tiles with special properties
    this.markStrategicTiles();
    
    // Log results summary
    const totalPOIs = 
      (this.strategicLocations.castawayBeach ? 1 : 0) +
      (this.strategicLocations.tidalVillage ? 1 : 0) +
      (this.strategicLocations.ridgeVillage ? 1 : 0) +
      (this.strategicLocations.mercenaryCompound ? 1 : 0) +
      this.strategicLocations.sacredSites.length +
      this.strategicLocations.shipwrecks.length +
      (this.strategicLocations.landmarks.waterfall ? 1 : 0) +
      (this.strategicLocations.landmarks.hotSpring ? 1 : 0) +
      this.strategicLocations.landmarks.caves.length +
      (this.strategicLocations.landmarks.harbor ? 1 : 0) +
      this.strategicLocations.ruins.length;
    
    console.log(`📍 POI Summary: ${totalPOIs} total locations`, {
      villages: 2,
      compounds: 1,
      sacredSites: this.strategicLocations.sacredSites.length,
      shipwrecks: this.strategicLocations.shipwrecks.length,
      landmarks: 
        (this.strategicLocations.landmarks.waterfall ? 1 : 0) +
        (this.strategicLocations.landmarks.hotSpring ? 1 : 0) +
        this.strategicLocations.landmarks.caves.length +
        (this.strategicLocations.landmarks.harbor ? 1 : 0),
      ruins: this.strategicLocations.ruins.length
    });
    
    // Log distances between bases for verification
    if (this.strategicLocations.castawayBeach && this.strategicLocations.tidalVillage) {
      const dist = this.hexGrid.distance(
        this.strategicLocations.castawayBeach.tile.q, this.strategicLocations.castawayBeach.tile.r,
        this.strategicLocations.tidalVillage.tile.q, this.strategicLocations.tidalVillage.tile.r
      );
      console.log(`  📏 Castaway ↔ Tidal: ${dist} tiles`);
    }
  }

  /**
   * Find suitable location for castaway starting beach
   * Requirements: Beach, southern area, accessible to interior
   */
  findCastawayStartingBeach() {
    const candidates = [];
    
    for (const [key, tile] of this.tiles) {
      // ONLY regular beaches - not cliffs or rocky shores
      if (tile.terrain !== 'beach') continue;
      if (tile.isCliff) continue; // Extra safety check
      
      // Prefer southern beaches (positive r coordinate)
      const southScore = Math.max(0, tile.r) / this.config.radius;
      
      // Check accessibility - should have land neighbors for expansion
      const neighbors = this.hexGrid.getNeighbors(tile.q, tile.r);
      const landNeighbors = neighbors.filter(n => {
        const neighbor = this.getTile(n.q, n.r);
        return neighbor && neighbor.isLand && neighbor.terrain !== 'sea';
      }).length;
      
      const accessScore = landNeighbors / 6;
      
      // Not too close to center (want some exploration challenge)
      const distFromCenter = this.hexGrid.distance(0, 0, tile.q, tile.r);
      const edgeScore = distFromCenter / this.config.radius;
      
      const totalScore = southScore * 0.4 + accessScore * 0.4 + edgeScore * 0.2;
      
      candidates.push({ tile, score: totalScore });
    }
    
    if (candidates.length === 0) return null;
    
    candidates.sort((a, b) => b.score - a.score);
    return {
      name: 'Castaway Beach',
      type: 'starting-point',
      tile: candidates[0].tile,
      description: 'Where your journey began. The wreckage of your arrival still litters the sand.'
    };
  }

  /**
   * Find suitable location for Tidal Clan village
   * Requirements: Coastal, near river mouth, moderate elevation, far from other bases
   */
  findTidalVillage(existingLocations = [], minDistance = 10) {
    const candidates = [];
    
    for (const [key, tile] of this.tiles) {
      // Must be near coast (beach or adjacent to beach)
      if (tile.terrain === 'sea') continue;
      
      // Check distance from existing locations
      if (existingLocations.length > 0) {
        const tooClose = existingLocations.some(loc => 
          this.hexGrid.distance(tile.q, tile.r, loc.q, loc.r) < minDistance
        );
        if (tooClose) continue;
      }
      
      let coastalScore = 0;
      if (tile.terrain === 'beach') {
        coastalScore = 1.0;
      } else {
        const neighbors = this.hexGrid.getNeighbors(tile.q, tile.r);
        const hasBeachNeighbor = neighbors.some(n => {
          const neighbor = this.getTile(n.q, n.r);
          return neighbor && neighbor.terrain === 'beach';
        });
        if (hasBeachNeighbor && tile.isLand) {
          coastalScore = 0.7;
        } else {
          continue;
        }
      }
      
      // Prefer near river
      let riverScore = 0;
      const neighbors = this.hexGrid.getNeighbors(tile.q, tile.r);
      const nearRiver = neighbors.some(n => {
        const neighbor = this.getTile(n.q, n.r);
        return neighbor && neighbor.terrain === 'river';
      });
      if (nearRiver) riverScore = 1.0;
      
      // Prefer lowlands (not mountains)
      const elevScore = tile.elevation < 0.5 ? 1.0 : 0.3;
      
      // Prefer forest or savanna terrain
      const terrainScore = (tile.terrain === 'forest' || tile.terrain === 'savanna') ? 1.0 : 0.5;
      
      // Bonus for being in a different quadrant than existing locations
      let quadrantBonus = 0;
      if (existingLocations.length > 0) {
        const tileQuadrant = this.getQuadrant(tile.q, tile.r);
        const differentQuadrants = existingLocations.every(loc => 
          this.getQuadrant(loc.q, loc.r) !== tileQuadrant
        );
        if (differentQuadrants) quadrantBonus = 0.5;
      }
      
      const totalScore = coastalScore * 0.4 + riverScore * 0.3 + elevScore * 0.15 + terrainScore * 0.1 + quadrantBonus * 0.05;
      
      candidates.push({ tile, score: totalScore });
    }
    
    if (candidates.length === 0) return null;
    
    candidates.sort((a, b) => b.score - a.score);
    return {
      name: 'Tidal Village',
      type: 'native-village',
      faction: 'tidal-clan',
      tile: candidates[0].tile,
      description: 'The Tidal Clan\'s seaside settlement. They are masters of fishing and sailing.'
    };
  }

  /**
   * Find suitable location for Ridge Clan village
   * Requirements: Highland/mountain area, defensible, far from other bases
   */
  findRidgeVillage(existingLocations = [], minDistance = 10) {
    const candidates = [];
    
    for (const [key, tile] of this.tiles) {
      if (!tile.isLand || tile.terrain === 'beach' || tile.terrain === 'sea') continue;
      
      // Must be in highlands or mountains
      if (tile.elevation < 0.6) continue;
      
      // Check distance from existing locations
      if (existingLocations.length > 0) {
        const tooClose = existingLocations.some(loc => 
          this.hexGrid.distance(tile.q, tile.r, loc.q, loc.r) < minDistance
        );
        if (tooClose) continue;
      }
      
      const elevScore = tile.elevation;
      
      // Prefer hills and peaks
      const terrainScore = (tile.terrain.includes('hill') || tile.terrain.includes('peak')) ? 1.0 : 0.5;
      
      // Check defensibility (not too many accessible neighbors)
      const neighbors = this.hexGrid.getNeighbors(tile.q, tile.r);
      const difficultNeighbors = neighbors.filter(n => {
        const neighbor = this.getTile(n.q, n.r);
        return !neighbor || !neighbor.isPassable || neighbor.elevation > 0.6;
      }).length;
      const defenseScore = difficultNeighbors / 6;
      
      // Should be far from coast (interior)
      const interiorScore = (tile.distanceToWater || 0) / 10;
      
      // Bonus for being in a different quadrant than existing locations
      let quadrantBonus = 0;
      if (existingLocations.length > 0) {
        const tileQuadrant = this.getQuadrant(tile.q, tile.r);
        const differentQuadrants = existingLocations.every(loc => 
          this.getQuadrant(loc.q, loc.r) !== tileQuadrant
        );
        if (differentQuadrants) quadrantBonus = 0.5;
      }
      
      const totalScore = elevScore * 0.25 + terrainScore * 0.25 + defenseScore * 0.2 + interiorScore * 0.15 + quadrantBonus * 0.15;
      
      candidates.push({ tile, score: totalScore });
    }
    
    if (candidates.length === 0) return null;
    
    candidates.sort((a, b) => b.score - a.score);
    return {
      name: 'Ridge Village',
      type: 'native-village',
      faction: 'ridge-clan',
      tile: candidates[0].tile,
      description: 'The Ridge Clan\'s highland fortress. They are fierce warriors and spiritual guides.'
    };
  }

  /**
   * Find suitable location for mercenary compound
   * Requirements: Defensible, resource-rich area, not too remote, far from other bases
   */
  findMercenaryCompound(existingLocations = [], minDistance = 10) {
    const candidates = [];
    
    for (const [key, tile] of this.tiles) {
      if (!tile.isLand || tile.terrain === 'beach' || tile.terrain === 'sea') continue;
      
      // Check distance from existing locations
      if (existingLocations.length > 0) {
        const tooClose = existingLocations.some(loc => 
          this.hexGrid.distance(tile.q, tile.r, loc.q, loc.r) < minDistance
        );
        if (tooClose) continue;
      }
      
      // Prefer moderate elevation (hills) - defensible but accessible
      const idealElev = 0.55;
      const elevScore = 1 - Math.abs(tile.elevation - idealElev);
      
      // Prefer resource-rich biomes
      const resourceBiomes = ['forest', 'jungle-hill', 'dry-hill'];
      const resourceScore = resourceBiomes.includes(tile.terrain) ? 1.0 : 0.5;
      
      // Check defensibility
      const neighbors = this.hexGrid.getNeighbors(tile.q, tile.r);
      const passableNeighbors = neighbors.filter(n => {
        const neighbor = this.getTile(n.q, n.r);
        return neighbor && neighbor.isPassable;
      }).length;
      const defenseScore = 1 - (passableNeighbors / 6); // Fewer approaches = better
      
      // Not too remote (want to be near valuable areas)
      const centralityScore = 1 - (this.hexGrid.distance(0, 0, tile.q, tile.r) / this.config.radius);
      
      // Bonus for being in a different quadrant than existing locations
      let quadrantBonus = 0;
      if (existingLocations.length > 0) {
        const tileQuadrant = this.getQuadrant(tile.q, tile.r);
        const differentQuadrants = existingLocations.every(loc => 
          this.getQuadrant(loc.q, loc.r) !== tileQuadrant
        );
        if (differentQuadrants) quadrantBonus = 0.5;
      }
      
      const totalScore = elevScore * 0.25 + resourceScore * 0.25 + defenseScore * 0.15 + centralityScore * 0.15 + quadrantBonus * 0.2;
      
      candidates.push({ tile, score: totalScore });
    }
    
    if (candidates.length === 0) return null;
    
    candidates.sort((a, b) => b.score - a.score);
    return {
      name: 'Blacksteel Compound',
      type: 'hostile-base',
      faction: 'mercenaries',
      tile: candidates[0].tile,
      description: 'A fortified compound controlled by ruthless mercenaries. Approach with caution.'
    };
  }

  /**
   * Place sacred sites (3-5 locations)
   * Requirements: High elevation, special biomes, distributed across map
   */
  placeSacredSites() {
    const sacredSites = [];
    const numSites = 3 + Math.floor(this.rng.next() * 3); // 3-5 sites
    
    const candidates = [];
    
    for (const [key, tile] of this.tiles) {
      if (!tile.isLand || tile.terrain === 'beach' || tile.terrain === 'cliff' || tile.terrain === 'sea') continue;
      
      // Sacred sites are in special locations
      let score = 0;
      
      // Highest priority: Mountain peaks
      if (tile.terrain === 'misty-peak' || tile.terrain === 'rocky-peak') {
        score += tile.elevation * 2.0;
      }
      
      // Medium priority: Cloud forests (mystical)
      if (tile.terrain === 'cloud-forest') {
        score += 1.5;
      }
      
      // Bonus for remote locations
      const remoteness = (tile.distanceToWater || 5) / 10;
      score += remoteness * 0.5;
      
      if (score > 0) {
        candidates.push({ tile, score });
      }
    }
    
    if (candidates.length === 0) return sacredSites;
    
    // Sort and select top candidates, ensuring they're spread out
    candidates.sort((a, b) => b.score - a.score);
    
    for (let i = 0; i < Math.min(numSites, candidates.length); i++) {
      const candidate = candidates[i];
      
      // Check if too close to existing sacred sites
      const tooClose = sacredSites.some(site => {
        return this.hexGrid.distance(
          site.tile.q, site.tile.r,
          candidate.tile.q, candidate.tile.r
        ) < 5;
      });
      
      if (!tooClose) {
        sacredSites.push({
          name: `Sacred Site ${String.fromCharCode(65 + sacredSites.length)}`, // A, B, C...
          type: 'sacred-site',
          tile: candidate.tile,
          description: 'A place where the Pulse flows strong. The natives hold this land as sacred.'
        });
      }
    }
    
    return sacredSites;
  }

  /**
   * Place shipwrecks (2-3 locations)
   * Requirements: Beach/coast, remote, salvageable loot
   */
  placeShipwrecks() {
    const numWrecks = 2 + Math.floor(this.rng.next() * 2); // 2-3 wrecks
    const wrecks = [];
    const candidates = [];
    
    for (const [key, tile] of this.tiles) {
      // Shipwrecks spawn on beaches (not cliffs)
      if (tile.terrain !== 'beach') continue;
      
      // Prefer remote beaches
      const distFromCenter = this.hexGrid.distance(0, 0, tile.q, tile.r);
      const remoteness = distFromCenter / this.config.radius;
      
      // Must be near sea
      const neighbors = this.hexGrid.getNeighbors(tile.q, tile.r);
      const nearSea = neighbors.some(n => {
        const neighbor = this.getTile(n.q, n.r);
        return neighbor && neighbor.terrain === 'sea';
      });
      
      if (!nearSea) continue;
      
      // Score based on remoteness and randomness for variety
      const score = remoteness * 0.7 + this.rng.next() * 0.3;
      candidates.push({ tile, score });
    }
    
    if (candidates.length === 0) {
      console.warn('⚠️  No suitable shipwreck locations found');
      return wrecks;
    }
    
    candidates.sort((a, b) => b.score - a.score);
    
    // Place shipwrecks with minimum spacing
    for (let i = 0; i < Math.min(numWrecks, candidates.length); i++) {
      const candidate = candidates[i];
      
      // Check distance from other wrecks
      const tooClose = wrecks.some(w => 
        this.hexGrid.distance(w.tile.q, w.tile.r, candidate.tile.q, candidate.tile.r) < 8
      );
      
      if (!tooClose) {
        const wreckNames = ['Broken Promise', 'Sea Maiden', 'Fortune\'s Folly', 'Last Hope', 'Wayward Soul'];
        const lootQuality = this.rng.next();
        wrecks.push({
          name: `Shipwreck: ${wreckNames[i % wreckNames.length]}`,
          type: 'shipwreck',
          tile: candidate.tile,
          description: 'The remains of a ship that wasn\'t so lucky. May contain salvage.',
          lootQuality: lootQuality > 0.7 ? 'rich' : (lootQuality > 0.3 ? 'normal' : 'poor'),
          looted: false
        });
      }
    }
    
    console.log(`⚓ Placed ${wrecks.length} shipwrecks on remote beaches`);
    return wrecks;
  }

  /**
   * Place natural landmarks (waterfalls, caves, hot springs, harbors)
   */
  placeNaturalLandmarks() {
    // Find waterfall (where river meets elevation drop)
    this.strategicLocations.landmarks.waterfall = this.findWaterfall();
    
    // Find hot spring (high elevation + high moisture, rare)
    this.strategicLocations.landmarks.hotSpring = this.findHotSpring();
    
    // Find caves (2 caves in mountains/hills)
    this.strategicLocations.landmarks.caves = this.findCaves(2);
    
    // Find natural harbor (protected coastal area)
    this.strategicLocations.landmarks.harbor = this.findNaturalHarbor();
    
    const landmarkCount = 
      (this.strategicLocations.landmarks.waterfall ? 1 : 0) +
      (this.strategicLocations.landmarks.hotSpring ? 1 : 0) +
      this.strategicLocations.landmarks.caves.length +
      (this.strategicLocations.landmarks.harbor ? 1 : 0);
    
    console.log(`🗻 Placed ${landmarkCount} natural landmarks`);
  }

  /**
   * Find a waterfall location (river + elevation drop)
   */
  findWaterfall() {
    const candidates = [];
    
    for (const [key, tile] of this.tiles) {
      if (tile.terrain !== 'river') continue;
      
      // Check if river is on an elevation change
      const neighbors = this.hexGrid.getNeighbors(tile.q, tile.r);
      let maxElevDiff = 0;
      
      for (const n of neighbors) {
        const neighbor = this.getTile(n.q, n.r);
        if (!neighbor || !neighbor.isLand) continue;
        
        const elevDiff = Math.abs(tile.elevation - neighbor.elevation);
        maxElevDiff = Math.max(maxElevDiff, elevDiff);
      }
      
      // Waterfall requires significant elevation change
      if (maxElevDiff > 0.15) {
        candidates.push({ tile, elevDiff: maxElevDiff });
      }
    }
    
    if (candidates.length === 0) return null;
    
    candidates.sort((a, b) => b.elevDiff - a.elevDiff);
    return {
      name: 'Cascade Falls',
      type: 'waterfall',
      tile: candidates[0].tile,
      description: 'A beautiful waterfall cascading down the mountainside. Fresh water and a peaceful resting spot.'
    };
  }

  /**
   * Find hot spring (rare, high elevation + high moisture)
   */
  findHotSpring() {
    // Only 30% chance to have a hot spring
    if (this.rng.next() > 0.3) return null;
    
    const candidates = [];
    
    for (const [key, tile] of this.tiles) {
      if (!tile.isLand || tile.terrain === 'beach' || tile.terrain === 'cliff') continue;
      
      // Must be high elevation and high moisture
      if (tile.elevation >= 0.6 && tile.moisture >= 0.7) {
        // Prefer misty peaks and cloud forests
        const terrainBonus = (tile.terrain === 'misty-peak' || tile.terrain === 'cloud-forest') ? 0.5 : 0;
        const score = tile.elevation + tile.moisture + terrainBonus;
        candidates.push({ tile, score });
      }
    }
    
    if (candidates.length === 0) return null;
    
    candidates.sort((a, b) => b.score - a.score);
    return {
      name: 'Steaming Springs',
      type: 'hot-spring',
      tile: candidates[0].tile,
      description: 'Natural hot springs warmed by geothermal activity. Restorative and relaxing.'
    };
  }

  /**
   * Find cave systems
   */
  findCaves(numCaves = 2) {
    const caves = [];
    const candidates = [];
    
    for (const [key, tile] of this.tiles) {
      if (!tile.isLand || tile.terrain === 'beach' || tile.terrain === 'cliff') continue;
      
      // Caves in mountains and hills
      if (tile.elevation >= 0.55) {
        const score = tile.elevation + this.rng.next() * 0.3;
        candidates.push({ tile, score });
      }
    }
    
    if (candidates.length === 0) return caves;
    
    candidates.sort((a, b) => b.score - a.score);
    
    for (let i = 0; i < Math.min(numCaves, candidates.length); i++) {
      const candidate = candidates[i];
      
      // Check distance from other caves
      const tooClose = caves.some(c => 
        this.hexGrid.distance(c.tile.q, c.tile.r, candidate.tile.q, candidate.tile.r) < 10
      );
      
      if (!tooClose) {
        caves.push({
          name: `Cave ${caves.length === 0 ? 'of Echoes' : 'of Shadows'}`,
          type: 'cave',
          tile: candidate.tile,
          description: 'A dark cave entrance. Could provide shelter, or hide dangers.'
        });
      }
    }
    
    return caves;
  }

  /**
   * Find natural harbor (protected coastal area)
   */
  findNaturalHarbor() {
    const candidates = [];
    
    for (const [key, tile] of this.tiles) {
      if (tile.terrain !== 'beach') continue;
      
      // Count surrounding land vs sea
      const neighbors = this.hexGrid.getNeighbors(tile.q, tile.r);
      let seaCount = 0;
      let landCount = 0;
      
      for (const n of neighbors) {
        const neighbor = this.getTile(n.q, n.r);
        if (!neighbor) continue;
        
        if (neighbor.terrain === 'sea') seaCount++;
        else if (neighbor.isLand) landCount++;
      }
      
      // Natural harbor: some sea access but mostly protected by land
      if (seaCount >= 2 && seaCount <= 3 && landCount >= 3) {
        const score = landCount + this.rng.next() * 2;
        candidates.push({ tile, score });
      }
    }
    
    if (candidates.length === 0) return null;
    
    candidates.sort((a, b) => b.score - a.score);
    return {
      name: 'Safe Harbor',
      type: 'harbor',
      tile: candidates[0].tile,
      description: 'A naturally protected cove, sheltered from rough seas. Perfect for boats.'
    };
  }

  /**
   * Place ancient ruins (1-2 mysterious locations)
   */
  placeAncientRuins() {
    const numRuins = 1 + Math.floor(this.rng.next() * 2); // 1-2 ruins
    const ruins = [];
    const candidates = [];
    
    for (const [key, tile] of this.tiles) {
      if (!tile.isLand || tile.terrain === 'beach' || tile.terrain === 'cliff' || tile.terrain === 'sea') continue;
      
      // Ruins in deep jungle OR mountain peaks
      let score = 0;
      
      if (tile.terrain === 'rainforest' || tile.terrain === 'jungle-hill') {
        // Jungle ruins
        score = 2.0 + (tile.distanceToWater || 0) / 10;
      } else if (tile.terrain === 'rocky-peak' || tile.terrain === 'misty-peak') {
        // Mountain ruins
        score = 1.8 + tile.elevation;
      } else if (tile.terrain === 'cloud-forest' || tile.terrain === 'bamboo-forest') {
        // Hidden in mystical forests
        score = 1.5 + (tile.distanceToWater || 0) / 10;
      }
      
      if (score > 0) {
        // Must be far from villages
        let tooCloseToVillage = false;
        if (this.strategicLocations.tidalVillage) {
          const dist = this.hexGrid.distance(
            tile.q, tile.r,
            this.strategicLocations.tidalVillage.tile.q,
            this.strategicLocations.tidalVillage.tile.r
          );
          if (dist < 8) tooCloseToVillage = true;
        }
        if (this.strategicLocations.ridgeVillage) {
          const dist = this.hexGrid.distance(
            tile.q, tile.r,
            this.strategicLocations.ridgeVillage.tile.q,
            this.strategicLocations.ridgeVillage.tile.r
          );
          if (dist < 8) tooCloseToVillage = true;
        }
        
        if (!tooCloseToVillage) {
          candidates.push({ tile, score });
        }
      }
    }
    
    if (candidates.length === 0) {
      console.warn('⚠️  No suitable ruin locations found');
      return ruins;
    }
    
    candidates.sort((a, b) => b.score - a.score);
    
    const ruinTypes = [
      { name: 'Ancient Temple', description: 'Stone ruins covered in vines. What civilization built this?' },
      { name: 'Observatory Ruins', description: 'Crumbling stone circles aligned with the stars. Ancient astronomers worked here.' },
      { name: 'Forgotten Shrine', description: 'A weathered shrine to unknown gods. Strange energy lingers.' },
      { name: 'Overgrown Plaza', description: 'Stone pathways and broken pillars hint at a once-great city.' }
    ];
    
    // Place ruins with minimum spacing
    for (let i = 0; i < Math.min(numRuins, candidates.length); i++) {
      const candidate = candidates[i];
      
      // Check distance from other ruins
      const tooClose = ruins.some(r => 
        this.hexGrid.distance(r.tile.q, r.tile.r, candidate.tile.q, candidate.tile.r) < 10
      );
      
      if (!tooClose) {
        const ruinType = ruinTypes[i % ruinTypes.length];
        ruins.push({
          name: ruinType.name,
          type: 'ruins',
          tile: candidate.tile,
          description: ruinType.description,
          explored: false,
          lootQuality: this.rng.next() > 0.5 ? 'rich' : 'abundant'
        });
      }
    }
    
    console.log(`🏛️  Placed ${ruins.length} ancient ruins`);
    return ruins;
  }

  /**
   * Mark strategic location tiles with special properties
   */
  markStrategicTiles() {
    // Mark castaway beach
    if (this.strategicLocations.castawayBeach) {
      const tile = this.strategicLocations.castawayBeach.tile;
      tile.strategicLocation = this.strategicLocations.castawayBeach;
      tile.isStrategic = true;
    }
    
    // Mark Tidal Village
    if (this.strategicLocations.tidalVillage) {
      const tile = this.strategicLocations.tidalVillage.tile;
      tile.strategicLocation = this.strategicLocations.tidalVillage;
      tile.isStrategic = true;
      tile.faction = 'tidal-clan';
    }
    
    // Mark Ridge Village
    if (this.strategicLocations.ridgeVillage) {
      const tile = this.strategicLocations.ridgeVillage.tile;
      tile.strategicLocation = this.strategicLocations.ridgeVillage;
      tile.isStrategic = true;
      tile.faction = 'ridge-clan';
    }
    
    // Mark Mercenary Compound
    if (this.strategicLocations.mercenaryCompound) {
      const tile = this.strategicLocations.mercenaryCompound.tile;
      tile.strategicLocation = this.strategicLocations.mercenaryCompound;
      tile.isStrategic = true;
      tile.faction = 'mercenaries';
    }
    
    // Mark Sacred Sites
    for (const site of this.strategicLocations.sacredSites) {
      const tile = site.tile;
      tile.strategicLocation = site;
      tile.isStrategic = true;
      tile.isSacred = true;
    }
    
    // Mark Shipwrecks
    for (const wreck of this.strategicLocations.shipwrecks) {
      const tile = wreck.tile;
      tile.strategicLocation = wreck;
      tile.isStrategic = true;
      tile.isShipwreck = true;
    }
    
    // Mark Landmarks
    const landmarks = this.strategicLocations.landmarks;
    if (landmarks.waterfall) {
      const tile = landmarks.waterfall.tile;
      tile.strategicLocation = landmarks.waterfall;
      tile.isStrategic = true;
      tile.isLandmark = true;
    }
    if (landmarks.hotSpring) {
      const tile = landmarks.hotSpring.tile;
      tile.strategicLocation = landmarks.hotSpring;
      tile.isStrategic = true;
      tile.isLandmark = true;
    }
    for (const cave of landmarks.caves) {
      const tile = cave.tile;
      tile.strategicLocation = cave;
      tile.isStrategic = true;
      tile.isLandmark = true;
    }
    if (landmarks.harbor) {
      const tile = landmarks.harbor.tile;
      tile.strategicLocation = landmarks.harbor;
      tile.isStrategic = true;
      tile.isLandmark = true;
    }
    
    // Mark Ruins
    for (const ruin of this.strategicLocations.ruins) {
      const tile = ruin.tile;
      tile.strategicLocation = ruin;
      tile.isStrategic = true;
      tile.isRuin = true;
    }
  }

  // ========================================
  // FACTION TERRITORY GENERATION
  // ========================================

  /**
   * Generate faction territories based on strategic locations
   * Uses flood-fill from capital tiles with terrain preferences
   */
  generateFactionTerritories() {
    this.territories = {
      castaways: { capital: null, tiles: [], color: '#fbbf24', name: 'Castaways' },
      tidalClan: { capital: null, tiles: [], color: '#3b82f6', name: 'Tidal Clan' },
      ridgeClan: { capital: null, tiles: [], color: '#84cc16', name: 'Ridge Clan' },
      mercenaries: { capital: null, tiles: [], color: '#dc2626', name: 'Mercenaries' },
      neutral: { tiles: [] }
    };

    // Define territory parameters for each faction
    const factionConfigs = {
      castaways: {
        capital: this.strategicLocations.castawayBeach?.tile,
        maxRadius: 6,
        preferredTerrains: ['beach', 'savanna', 'forest'],
        growthRate: 0.8
      },
      tidalClan: {
        capital: this.strategicLocations.tidalVillage?.tile,
        maxRadius: 12,
        preferredTerrains: ['beach', 'forest', 'savanna', 'river'],
        growthRate: 1.0
      },
      ridgeClan: {
        capital: this.strategicLocations.ridgeVillage?.tile,
        maxRadius: 10,
        preferredTerrains: ['jungle-hill', 'cloud-forest', 'dry-hill', 'rocky-peak', 'misty-peak'],
        growthRate: 0.9
      },
      mercenaries: {
        capital: this.strategicLocations.mercenaryCompound?.tile,
        maxRadius: 8,
        preferredTerrains: ['forest', 'jungle-hill', 'dry-hill', 'savanna'],
        growthRate: 0.7
      }
    };

    // Grow territories in order (Tidal, Ridge, Mercenaries, Castaways)
    // This gives established factions priority
    const growthOrder = ['tidalClan', 'ridgeClan', 'mercenaries', 'castaways'];
    
    for (const factionKey of growthOrder) {
      const config = factionConfigs[factionKey];
      if (!config.capital) {
        console.warn(`⚠️  No capital for ${factionKey}, skipping territory`);
        continue;
      }

      this.territories[factionKey].capital = config.capital;
      this.growTerritory(factionKey, config);
    }

    // Mark all remaining land as neutral
    for (const [key, tile] of this.tiles) {
      if (tile.isLand && !tile.faction && !tile.isSacred) {
        tile.faction = 'neutral';
        this.territories.neutral.tiles.push(tile);
      }
    }

    // Mark frontier tiles (borders between territories)
    this.markFrontierTiles();

    // Log territory stats
    console.log('🗺️  Territory Distribution:', {
      castaways: this.territories.castaways.tiles.length,
      tidalClan: this.territories.tidalClan.tiles.length,
      ridgeClan: this.territories.ridgeClan.tiles.length,
      mercenaries: this.territories.mercenaries.tiles.length,
      neutral: this.territories.neutral.tiles.length
    });
  }

  /**
   * Grow territory from capital using flood-fill with constraints
   */
  growTerritory(factionKey, config) {
    const { capital, maxRadius, preferredTerrains, growthRate } = config;
    const territory = this.territories[factionKey];
    
    // BFS queue: tiles to expand from
    const queue = [{ tile: capital, distance: 0 }];
    const visited = new Set([this.key(capital.q, capital.r)]);
    
    // Mark capital
    capital.faction = factionKey;
    capital.territoryDistance = 0;
    territory.tiles.push(capital);

    while (queue.length > 0) {
      const { tile: current, distance } = queue.shift();
      
      // Stop if we've reached max radius
      if (distance >= maxRadius) continue;
      
      // Get neighbors
      const neighbors = this.hexGrid.getNeighbors(current.q, current.r);
      
      for (const n of neighbors) {
        const key = this.key(n.q, n.r);
        if (visited.has(key)) continue;
        
        const neighbor = this.getTile(n.q, n.r);
        if (!neighbor || !neighbor.isLand) continue;
        
        // Skip if already claimed by another faction
        if (neighbor.faction) continue;
        
        // Skip sacred sites (protected)
        if (neighbor.isSacred) continue;
        
        visited.add(key);
        
        // Calculate expansion probability
        let expandChance = growthRate;
        
        // Bonus for preferred terrain
        if (preferredTerrains.includes(neighbor.terrain)) {
          expandChance += 0.3;
        }
        
        // Penalty for rivers (natural boundary)
        if (neighbor.terrain === 'river') {
          expandChance -= 0.5;
        }
        
        // Penalty for distance
        const distancePenalty = distance / maxRadius;
        expandChance -= distancePenalty * 0.4;
        
        // Randomness
        if (this.rng.next() < Math.max(0.1, expandChance)) {
          // Claim this tile
          neighbor.faction = factionKey;
          neighbor.territoryDistance = distance + 1;
          territory.tiles.push(neighbor);
          
          // Add to queue for further expansion
          queue.push({ tile: neighbor, distance: distance + 1 });
        }
      }
    }
  }

  /**
   * Mark frontier tiles (borders between different factions)
   */
  markFrontierTiles() {
    for (const [key, tile] of this.tiles) {
      if (!tile.faction || tile.faction === 'neutral') continue;
      
      const neighbors = this.hexGrid.getNeighbors(tile.q, tile.r);
      const hasDifferentFactionNeighbor = neighbors.some(n => {
        const neighbor = this.getTile(n.q, n.r);
        return neighbor && neighbor.faction && neighbor.faction !== tile.faction;
      });
      
      if (hasDifferentFactionNeighbor) {
        tile.isFrontier = true;
      }
    }
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
      'castaway': { preferredTerrain: ['beach', 'forest'], size: 'small', hostility: 'friendly' },
      'native': { preferredTerrain: ['jungle-hill', 'rainforest'], size: 'large', hostility: 'neutral' },
      'mercenary': { preferredTerrain: ['ruins', 'rocky-peak'], size: 'medium', hostility: 'hostile' },
      'wildlife': { preferredTerrain: ['savanna', 'forest'], size: 'medium', hostility: 'territorial' }
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
