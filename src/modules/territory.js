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
    this.hasSettlement = false;
    
    // Territory properties
    this.controlStrength = 0; // 0-100, how strongly controlled
    this.lastVisited = null;
    this.discoveredBy = null; // Who discovered it
    
    // Exploration system
    this.explorationProgress = 0; // 0-100, requires 100 to be fully explored
    this.fullyExplored = false;
    this.explorationAttempts = 0;
    this.explorationDifficulty = 50; // Base difficulty, modified by terrain
    
    // Claiming system
    this.claimProgress = 0; // 0-100, requires 100 to claim
    this.claimingInProgress = false;
    this.claimingBy = null; // Faction attempting to claim
    this.claimAttempts = 0;
    this.claimDifficulty = 50; // Base difficulty
    this.previousOwner = null; // Track for contested claims
    this.factionAlerted = false; // Whether defending faction knows about claim attempt
    
    // Perimeter tracking
    this.isPerimeter = false; // True if this territory borders a different faction
    
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
   * Explore this territory (skill-based, incremental progress)
   * Reveals resources and POIs as exploration progresses
   */
  explore(player) {
    if (this.fullyExplored) {
      return {
        success: false,
        message: 'This area has already been fully explored.',
        alreadyComplete: true
      };
    }

    // Calculate exploration difficulty based on terrain
    const terrainDifficulty = this.getExplorationDifficulty();
    
    // Skill check: exploration skill vs difficulty
    const skillLevel = player.skills.exploration || 0;
    const roll = Math.random() * 100;
    const successChance = 50 + skillLevel - terrainDifficulty;
    const success = roll < successChance;
    
    this.explorationAttempts++;
    
    if (success) {
      // Progress based on skill level (10-30% per success)
      const progress = 10 + Math.floor(skillLevel / 5);
      const oldProgress = this.explorationProgress;
      this.explorationProgress = Math.min(100, this.explorationProgress + progress);
      
      // Check for resource/POI discovery at certain thresholds
      const discoveries = this.checkForDiscoveries(oldProgress, this.explorationProgress);
      
      // Grant XP
      const xpGained = Math.floor(terrainDifficulty / 2);
      player.gainSkillXP('exploration', xpGained);
      
      // Check if fully explored
      if (this.explorationProgress >= 100) {
        this.fullyExplored = true;
        return {
          success: true,
          progress: this.explorationProgress,
          complete: true,
          message: `You've fully explored this ${this.terrain}! The area holds no more secrets.`,
          xpGained,
          discoveries
        };
      }
      
      return {
        success: true,
        progress: this.explorationProgress,
        complete: false,
        message: `Exploration progress: ${this.explorationProgress}%. You learn more about the area.`,
        xpGained,
        discoveries
      };
    } else {
      // Failed exploration still grants small XP
      player.gainSkillXP('exploration', 1);
      
      return {
        success: false,
        progress: this.explorationProgress,
        message: `You didn't discover anything new this time. Keep exploring!`,
        xpGained: 1,
        discoveries: []
      };
    }
  }

  /**
   * Check if exploration progress reveals any resources or POIs
   * Resources are discovered at different exploration thresholds
   */
  checkForDiscoveries(oldProgress, newProgress) {
    const discoveries = [];
    
    // Get resource manager to check for resources at this location
    const resourceManager = window.game?.resourceNodeManager;
    if (!resourceManager) return discoveries;
    
    // Find resources at this location - nodes is a Map, convert to array
    const allNodes = Array.from(resourceManager.nodes.values());
    const resourcesHere = allNodes.filter(node => 
      node.position.q === this.position.q && 
      node.position.r === this.position.r &&
      !node.discovered
    );
    
    // Reveal resources at thresholds: 25%, 50%, 75%, 100%
    const thresholds = [25, 50, 75, 100];
    
    thresholds.forEach(threshold => {
      if (oldProgress < threshold && newProgress >= threshold && resourcesHere.length > 0) {
        // Discover one resource per threshold
        const undiscovered = resourcesHere.filter(r => !r.discovered);
        if (undiscovered.length > 0) {
          const resource = undiscovered[0];
          resource.discovered = true;
          discoveries.push({
            type: 'resource',
            resourceType: resource.type,
            name: resource.resourceType,
            threshold
          });
        }
      }
    });
    
    // Check for POIs (NPCs, events, strategic locations) - revealed at 50% and 100%
    if (oldProgress < 50 && newProgress >= 50) {
      if (this.hasNPC) {
        discoveries.push({
          type: 'npc',
          name: 'an inhabitant',
          threshold: 50
        });
      }
    }
    
    if (oldProgress < 100 && newProgress >= 100) {
      if (this.hasEvent) {
        discoveries.push({
          type: 'event',
          name: 'something unusual',
          threshold: 100
        });
      }
      
      if (this.hasSettlement) {
        discoveries.push({
          type: 'settlement',
          name: 'a settlement',
          threshold: 100
        });
      }
    }
    
    return discoveries;
  }

  /**
   * Calculate exploration difficulty based on terrain
   */
  getExplorationDifficulty() {
    const terrainDifficulties = {
      'beach': 20,
      'lowland': 30,
      'grassland': 25,
      'forest': 40,
      'rainforest': 60,
      'jungle': 70,
      'swamp': 65,
      'mangrove': 55,
      'rocky': 50,
      'highland': 55,
      'mountain': 80,
      'cliff': 85,
      'bamboo_forest': 45,
      'volcanic': 90
    };
    
    return terrainDifficulties[this.terrain] || this.explorationDifficulty;
  }

  /**
   * Attempt to claim this territory (skill-based, time-consuming, potentially dangerous)
   */
  attemptClaim(player, gameState) {
    // Must be fully explored first
    if (!this.fullyExplored) {
      return {
        success: false,
        message: 'You must fully explore this area before claiming it.',
        requiresExploration: true
      };
    }

    // Check if already owned by player
    if (this.owner === 'player' && this.controlStrength >= 100) {
      return {
        success: false,
        message: 'You already control this territory.',
        alreadyOwned: true
      };
    }

    const isContested = this.owner && this.owner !== 'player';
    const previousOwner = this.owner;
    
    // Alert faction if claiming their territory (first attempt only)
    if (isContested && !this.factionAlerted) {
      this.factionAlerted = true;
      this.previousOwner = this.owner;
      // TODO: Trigger faction alert event - they may send forces
    }

    // Calculate claiming difficulty
    const baseDifficulty = 40;
    const contestedModifier = isContested ? 30 : 0;
    const strengthModifier = this.controlStrength * 0.3;
    const totalDifficulty = baseDifficulty + contestedModifier + strengthModifier;
    
    // Skill check
    const skillLevel = player.skills.claiming || 0;
    const roll = Math.random() * 100;
    const successChance = 50 + skillLevel - totalDifficulty;
    const success = roll < successChance;
    
    this.claimAttempts++;
    this.claimingInProgress = true;
    this.claimingBy = 'player';
    
    // Advance time by 1 hour (claiming takes time)
    const timeAdvanced = 60; // 1 hour in minutes
    if (gameState && gameState.advanceTime) {
      gameState.advanceTime(timeAdvanced);
    }
    
    if (success) {
      // Progress based on skill (15-35% per success)
      const progress = 15 + Math.floor(skillLevel / 4);
      this.claimProgress = Math.min(100, this.claimProgress + progress);
      
      // Grant XP
      const xpGained = Math.floor(totalDifficulty / 3);
      player.gainSkillXP('claiming', xpGained);
      
      // Check if claim complete
      if (this.claimProgress >= 100) {
        this.setOwner('player', 100);
        this.claimingInProgress = false;
        this.factionAlerted = false;
        
        return {
          success: true,
          progress: this.claimProgress,
          complete: true,
          contested: isContested,
          previousOwner,
          timeAdvanced,
          message: isContested 
            ? `You've successfully claimed this territory from the ${previousOwner}!`
            : `You've claimed this territory! It's now under your control.`,
          xpGained
        };
      }
      
      return {
        success: true,
        progress: this.claimProgress,
        complete: false,
        contested: isContested,
        timeAdvanced,
        message: `Claiming progress: ${this.claimProgress}%. ${isContested ? 'The ' + this.owner + ' may respond soon!' : 'Continue to establish control.'}`,
        xpGained
      };
    } else {
      // Failed claim attempt
      player.gainSkillXP('claiming', 2);
      
      // Small chance to lose progress if contested
      if (isContested && Math.random() < 0.3) {
        this.claimProgress = Math.max(0, this.claimProgress - 10);
        return {
          success: false,
          progress: this.claimProgress,
          contested: true,
          timeAdvanced,
          message: `Your claim attempt was resisted! You lost some progress. (${this.claimProgress}%)`,
          xpGained: 2
        };
      }
      
      return {
        success: false,
        progress: this.claimProgress,
        contested: isContested,
        timeAdvanced,
        message: `Claim attempt failed. Current progress: ${this.claimProgress}%`,
        xpGained: 2
      };
    }
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
      // Update perimeters when ownership changes
      this.updatePerimeters();
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
   * Update perimeter status for all territories
   * A perimeter tile is one that borders a different faction or neutral territory
   */
  updatePerimeters() {
    this.territories.forEach(territory => {
      if (!territory.owner || territory.owner === 'neutral') {
        territory.isPerimeter = false;
        return;
      }

      // Check if any neighbor has different ownership
      const adjacent = this.getAdjacentTerritories(territory.position.q, territory.position.r);
      territory.isPerimeter = adjacent.some(neighbor => 
        neighbor.owner !== territory.owner
      );
    });
  }

  /**
   * Generate starting territories
   */
  generateStartingTerritories(playerStart) {
    console.log(`🏁 Generating starting territories at (${playerStart.q}, ${playerStart.r})`);
    
    // Player starts with NO owned territory - Castaways must build from scratch
    // Just discover and visit the starting location
    const territory = this.getTerritory(playerStart.q, playerStart.r);
    if (territory) {
      territory.discover('player');
      territory.visit();
      console.log(`✅ Starting location discovered and visited (NOT owned - must claim)`);
    } else {
      console.error(`❌ No territory found at player start position (${playerStart.q}, ${playerStart.r})`);
    }

    // Reveal adjacent tiles in fog (vision range 2 for better initial visibility)
    const visible = this.getVisibleTerritories(playerStart, 2);
    console.log(`👁️ Revealed ${visible.length} visible territories`);

    // Generate faction starting territories (not near player)
    this.generateFactionTerritories(playerStart);

    // Update perimeters after all territories are assigned
    this.updatePerimeters();

    console.log('🏁 Starting territories generated');
  }

  /**
   * Generate faction territories across the island
   */
  generateFactionTerritories(playerStart) {
    const allTerritories = Array.from(this.territories.values());
    
    // Calculate minimum distance from player start (keep factions away from player)
    const minDistanceFromPlayer = 15;
    
    // Filter suitable territories (not water, not too high elevation, far from player)
    const suitable = allTerritories.filter(t => {
      if (t.terrain === 'deep_water' || t.terrain === 'water') return false;
      if (t.elevation > 0.85) return false;
      if (t.owner) return false; // Already claimed
      
      // Calculate distance from player start
      const dq = Math.abs(t.position.q - playerStart.q);
      const dr = Math.abs(t.position.r - playerStart.r);
      const distance = (dq + dr + Math.abs(-dq - dr)) / 2;
      
      return distance >= minDistanceFromPlayer;
    });

    // Randomly select starting points for each faction (NO castaways - player builds that)
    const factions = [
      { id: 'natives_clan1', count: 5, strength: 60 },
      { id: 'natives_clan2', count: 4, strength: 55 },
      { id: 'mercenaries', count: 2, strength: 70 }
    ];

    factions.forEach(faction => {
      for (let i = 0; i < faction.count; i++) {
        if (suitable.length === 0) break;
        
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
