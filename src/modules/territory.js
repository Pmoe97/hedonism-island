/**
 * Territory & Faction Control System
 * Manages hex ownership, fog of war, and faction territories
 */

export class Territory {
  constructor(position) {
    this.position = position; // { q, r }
    this.owner = null; // 'player', 'castaways', 'natives_clan1', 'natives_clan2', 'mercenaries', null
    this.discovered = false;
    this.visited = false;
    this.visibleFromFog = false;
    
    // Resources and features
    this.hasResourceNode = false;
    this.resourceNodeId = null;
    this.hasEvent = false;
    this.eventId = null;
    this.hasNPC = false;
    this.npcId = null;
    
    // Territory properties
    this.controlStrength = 0; // 0-100, how strongly controlled
    this.lastVisited = null;
    this.discoveredBy = null; // Who discovered it
    
    // Travel modifiers
    this.travelCostModifier = 1.0; // Multiplier for energy cost
    this.travelSpeedModifier = 1.0; // Multiplier for travel time
    
    // Terrain (from map generation)
    this.terrain = null; // Will be set from MapEngine
    this.elevation = 0;
    this.biome = null;
  }

  /**
   * Set the owner of this territory
   */
  setOwner(faction, strength = 50) {
    this.owner = faction;
    this.controlStrength = strength;
    
    // Update travel modifiers based on owner
    this.updateTravelModifiers();
  }

  /**
   * Update travel modifiers based on ownership
   */
  updateTravelModifiers() {
    if (this.owner === 'player') {
      this.travelCostModifier = 0.5; // Half energy cost in own territory
      this.travelSpeedModifier = 1.5; // 50% faster in own territory
    } else if (this.owner) {
      this.travelCostModifier = 1.2; // 20% more energy in faction territory
      this.travelSpeedModifier = 0.9; // 10% slower (cautious)
    } else {
      this.travelCostModifier = 1.0;
      this.travelSpeedModifier = 1.0;
    }
  }

  /**
   * Discover this territory
   */
  discover(discoveredBy) {
    if (!this.discovered) {
      this.discovered = true;
      this.discoveredBy = discoveredBy;
      
      // Reveal adjacent tiles (partial fog of war)
      this.visibleFromFog = true;
    }
  }

  /**
   * Visit this territory
   */
  visit() {
    this.visited = true;
    this.lastVisited = Date.now();
    this.discover('player');
  }

  /**
   * Get faction color
   */
  getFactionColor() {
    const colors = {
      player: '#4dd0e1',        // Cyan
      castaways: '#4ade80',     // Green
      natives_clan1: '#fbbf24', // Yellow
      natives_clan2: '#f97316', // Orange
      mercenaries: '#dc2626'    // Red
    };
    return colors[this.owner] || null;
  }

  /**
   * Get control strength color (for visualization)
   */
  getControlColor() {
    const baseColor = this.getFactionColor();
    if (!baseColor) return null;
    
    const alpha = this.controlStrength / 100;
    return `${baseColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
  }

  /**
   * Serialize for saving
   */
  toJSON() {
    return {
      position: this.position,
      owner: this.owner,
      discovered: this.discovered,
      visited: this.visited,
      controlStrength: this.controlStrength,
      hasResourceNode: this.hasResourceNode,
      resourceNodeId: this.resourceNodeId,
      hasEvent: this.hasEvent,
      eventId: this.eventId,
      hasNPC: this.hasNPC,
      npcId: this.npcId,
      lastVisited: this.lastVisited
    };
  }

  /**
   * Load from saved data
   */
  static fromJSON(data) {
    const territory = new Territory(data.position);
    Object.assign(territory, data);
    territory.updateTravelModifiers();
    return territory;
  }
}

/**
 * Territory Manager
 * Manages all territories on the island
 */
export class TerritoryManager {
  constructor() {
    this.territories = new Map(); // key: "q,r" -> Territory
    this.factionTerritories = {
      player: [],
      castaways: [],
      natives_clan1: [],
      natives_clan2: [],
      mercenaries: []
    };
  }

  /**
   * Initialize territories from map data
   */
  initFromMap(mapData) {
    mapData.tiles.forEach((tile, key) => {
      const [q, r] = key.split(',').map(Number);
      const territory = new Territory({ q, r });
      
      // Set terrain data from tile properties
      territory.terrain = tile.terrain || tile.type; // Support both property names
      territory.elevation = tile.elevation;
      territory.biome = tile.biome || this.getBiomeFromTerrain(tile.terrain || tile.type);
      territory.isPassable = tile.isPassable !== false; // Default to true if not specified
      
      this.territories.set(key, territory);
    });

    console.log(`🗺️ Initialized ${this.territories.size} territories`);
  }

  /**
   * Get biome from terrain type
   */
  getBiomeFromTerrain(terrain) {
    const biomes = {
      'deep_water': 'ocean',
      'water': 'ocean',
      'beach': 'coastal',
      'lowland': 'tropical',
      'forest': 'jungle',
      'highland': 'hills',
      'mountain': 'mountain'
    };
    return biomes[terrain] || 'tropical';
  }

  /**
   * Get territory at position
   */
  getTerritory(q, r) {
    return this.territories.get(`${q},${r}`) || null;
  }

  /**
   * Get all territories owned by faction
   */
  getFactionTerritories(faction) {
    return Array.from(this.territories.values())
      .filter(t => t.owner === faction);
  }

  /**
   * Set territory owner
   */
  setOwner(q, r, faction, strength = 50) {
    const territory = this.getTerritory(q, r);
    if (territory) {
      territory.setOwner(faction, strength);
      return true;
    }
    return false;
  }

  /**
   * Expand faction territory (claim adjacent tiles)
   */
  expandTerritory(q, r, faction, strength = 30) {
    const adjacent = this.getAdjacentTerritories(q, r);
    const claimed = [];

    for (const territory of adjacent) {
      // Only claim unclaimed or weakly controlled tiles
      if (!territory.owner || territory.controlStrength < 30) {
        territory.setOwner(faction, strength);
        claimed.push(territory);
      }
    }

    return claimed;
  }

  /**
   * Get adjacent territories
   */
  getAdjacentTerritories(q, r) {
    const directions = [
      { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
      { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
    ];

    return directions
      .map(dir => this.getTerritory(q + dir.q, r + dir.r))
      .filter(t => t !== null);
  }

  /**
   * Get visible territories (fog of war)
   */
  getVisibleTerritories(playerPosition, visionRange = 2) {
    const visible = [];
    const center = this.getTerritory(playerPosition.q, playerPosition.r);
    
    if (!center) return visible;

    // Mark center as visible
    center.visibleFromFog = true;
    visible.push(center);

    // Get territories within vision range
    for (let q = -visionRange; q <= visionRange; q++) {
      for (let r = -visionRange; r <= visionRange; r++) {
        const distance = Math.abs(q) + Math.abs(r) + Math.abs(-q - r);
        if (distance <= visionRange * 2) {
          const territory = this.getTerritory(
            playerPosition.q + q,
            playerPosition.r + r
          );
          if (territory) {
            territory.visibleFromFog = true;
            visible.push(territory);
          }
        }
      }
    }

    return visible;
  }

  /**
   * Update fog of war based on discoveries
   */
  updateFogOfWar(discoveredPositions) {
    discoveredPositions.forEach(pos => {
      const territory = this.getTerritory(pos.q, pos.r);
      if (territory) {
        territory.discover('player');
      }
    });
  }

  /**
   * Generate starting territories
   */
  generateStartingTerritories(playerStart) {
    console.log(`🏁 Generating starting territories at (${playerStart.q}, ${playerStart.r})`);
    
    // Player starts with 1 tile
    this.setOwner(playerStart.q, playerStart.r, 'player', 100);
    
    // Discover starting area
    const territory = this.getTerritory(playerStart.q, playerStart.r);
    if (territory) {
      territory.discover('player');
      territory.visit();
      console.log(`✅ Player territory discovered and visited`);
    } else {
      console.error(`❌ No territory found at player start position (${playerStart.q}, ${playerStart.r})`);
    }

    // Reveal adjacent tiles in fog (vision range 2 for better initial visibility)
    const visible = this.getVisibleTerritories(playerStart, 2);
    console.log(`👁️ Revealed ${visible.length} visible territories`);

    // Generate faction starting territories
    this.generateFactionTerritories();

    console.log('🏁 Starting territories generated');
  }

  /**
   * Generate faction territories across the island
   */
  generateFactionTerritories() {
    const allTerritories = Array.from(this.territories.values());
    
    // Filter suitable territories (not water, not too high elevation)
    const suitable = allTerritories.filter(t => 
      t.terrain !== 'deep_water' && 
      t.terrain !== 'water' &&
      t.elevation < 0.85 &&
      !t.owner // Not already claimed
    );

    // Randomly select starting points for each faction
    const factions = [
      { id: 'castaways', count: 3, strength: 40 },
      { id: 'natives_clan1', count: 5, strength: 60 },
      { id: 'natives_clan2', count: 4, strength: 55 },
      { id: 'mercenaries', count: 2, strength: 70 }
    ];

    factions.forEach(faction => {
      for (let i = 0; i < faction.count; i++) {
        // Pick random territory
        const randomIndex = Math.floor(Math.random() * suitable.length);
        const territory = suitable[randomIndex];
        
        if (territory) {
          // Claim it
          territory.setOwner(faction.id, faction.strength);
          
          // Expand around it
          const expanded = this.expandTerritory(
            territory.position.q,
            territory.position.r,
            faction.id,
            faction.strength - 10
          );

          // Remove from suitable pool
          suitable.splice(randomIndex, 1);
          expanded.forEach(t => {
            const idx = suitable.indexOf(t);
            if (idx !== -1) suitable.splice(idx, 1);
          });
        }
      }
    });

    // Log faction territory counts
    Object.keys(this.factionTerritories).forEach(faction => {
      const count = this.getFactionTerritories(faction).length;
      if (count > 0) {
        console.log(`  ${faction}: ${count} territories`);
      }
    });
  }

  /**
   * Get territory statistics
   */
  getStats() {
    const stats = {
      total: this.territories.size,
      discovered: 0,
      visited: 0,
      owned: {},
      unclaimed: 0
    };

    this.territories.forEach(territory => {
      if (territory.discovered) stats.discovered++;
      if (territory.visited) stats.visited++;
      
      if (territory.owner) {
        stats.owned[territory.owner] = (stats.owned[territory.owner] || 0) + 1;
      } else {
        stats.unclaimed++;
      }
    });

    return stats;
  }

  /**
   * Serialize for saving
   */
  toJSON() {
    const territories = {};
    this.territories.forEach((territory, key) => {
      territories[key] = territory.toJSON();
    });
    return { territories };
  }

  /**
   * Load from saved data
   */
  static fromJSON(data) {
    const manager = new TerritoryManager();
    Object.entries(data.territories).forEach(([key, territoryData]) => {
      manager.territories.set(key, Territory.fromJSON(territoryData));
    });
    return manager;
  }
}
