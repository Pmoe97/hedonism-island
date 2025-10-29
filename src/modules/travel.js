/**
 * Travel & Movement System
 * Handles player movement, pathfinding, energy costs, and travel events
 */

export class TravelSystem {
  constructor(player, territoryManager) {
    this.player = player;
    this.territoryManager = territoryManager;
    
    this.currentPosition = { q: 0, r: 0 };
    this.targetPosition = null;
    this.travelPath = [];
    this.isTraveling = false;
    this.travelProgress = 0;
    this.travelSpeed = 1.0; // tiles per second
    
    // Base travel costs
    this.baseEnergyCost = 5; // Per tile
    this.baseTravelTime = 1000; // ms per tile
    
    // Event system
    this.eventHandlers = [];
    this.lastEventCheck = Date.now();
    this.eventCheckInterval = 2000; // Check for events every 2s
  }

  /**
   * Calculate energy cost for traveling to a tile
   * Now uses fog-of-war system:
   * - Undiscovered: 15-20 energy (exploring unknown terrain)
   * - Discovered but not developed: 8-12 energy (rough paths)
   * - Player-owned/developed: 3-5 energy (roads/trails)
   */
  calculateEnergyCost(fromPos, toPos) {
    const fromTerritory = this.territoryManager.getTerritory(fromPos.q, fromPos.r);
    const toTerritory = this.territoryManager.getTerritory(toPos.q, toPos.r);
    
    if (!toTerritory) return Infinity;

    // Base cost depends on discovery state
    let baseCost;
    if (!toTerritory.discovered) {
      baseCost = 17; // Average of 15-20 for undiscovered
    } else if (toTerritory.owner === 'player') {
      baseCost = 4; // Average of 3-5 for player-owned
    } else {
      baseCost = 10; // Average of 8-12 for discovered
    }

    // Terrain multipliers (harder terrain = more energy)
    const terrainMultipliers = {
      'deep_water': 999,  // Can't travel through deep water
      'water': 2.0,       // Very expensive (swimming/wading)
      'beach': 1.0,       // Easy
      'lowland': 1.1,     // Slightly harder
      'plains': 1.0,      // Easy
      'scrubland': 1.2,   // Brushy terrain
      'forest': 1.3,      // Thick vegetation
      'jungle': 1.4,      // Dense jungle
      'highland': 1.4,    // Uphill
      'mountain': 1.5,    // Steep
      'swamp': 1.6,       // Very difficult
      'mangrove': 1.3,    // Thick roots
      'bamboo-forest': 1.2, // Dense but passable
      'palm-grove': 1.1   // Relatively open
    };
    
    const terrainMult = terrainMultipliers[toTerritory.terrain] || 1.2;
    baseCost *= terrainMult;

    // Elevation change cost (steeper = harder)
    if (fromTerritory) {
      const elevationChange = Math.abs(toTerritory.elevation - fromTerritory.elevation);
      baseCost *= (1 + elevationChange * 0.15); // 15% per elevation level
    }

    // Add slight randomness to undiscovered tiles (15-20 range)
    if (!toTerritory.discovered) {
      const variance = 2.5; // +/- 2.5
      baseCost += (Math.random() * variance * 2) - variance;
    }

    return Math.max(3, Math.ceil(baseCost)); // Minimum 3 energy
  }

  /**
   * Calculate travel time for a tile
   */
  calculateTravelTime(fromPos, toPos) {
    const toTerritory = this.territoryManager.getTerritory(toPos.q, toPos.r);
    if (!toTerritory) return Infinity;

    let time = this.baseTravelTime;

    // Apply territory speed modifier
    time /= toTerritory.travelSpeedModifier;

    // Terrain modifiers
    const terrainSpeed = {
      'beach': 0.9,
      'lowland': 1.0,
      'forest': 1.3,
      'highland': 1.5,
      'mountain': 2.0
    };
    time *= (terrainSpeed[toTerritory.terrain] || 1.0);

    return Math.ceil(time);
  }

  /**
   * Check if can travel to position
   */
  canTravelTo(q, r) {
    const territory = this.territoryManager.getTerritory(q, r);
    if (!territory) {
      return false;
    }

    // Can't travel through deep water
    if (territory.terrain === 'deep_water') {
      return false;
    }

    // Check if adjacent to current position using proper hex distance
    const dq = Math.abs(q - this.currentPosition.q);
    const dr = Math.abs(r - this.currentPosition.r);
    const ds = Math.abs((-q - r) - (-this.currentPosition.q - this.currentPosition.r));
    const distance = Math.max(dq, dr, ds); // Proper hex distance
    
    if (distance > 1) {
      return false; // Must be adjacent (hex distance = 1)
    }

    // Check energy cost using player's new hasEnergy method
    const energyCost = this.calculateEnergyCost(this.currentPosition, { q, r });
    if (!this.player.hasEnergy(energyCost)) {
      return false;
    }

    return true;
  }

  /**
   * Start traveling to a position
   */
  startTravel(q, r) {
    if (!this.canTravelTo(q, r)) {
      return {
        success: false,
        reason: 'Cannot travel to that location'
      };
    }

    const energyCost = this.calculateEnergyCost(this.currentPosition, { q, r });
    const travelTime = this.calculateTravelTime(this.currentPosition, { q, r });

    this.targetPosition = { q, r };
    this.isTraveling = true;
    this.travelProgress = 0;
    this.travelSpeed = 1000 / travelTime; // Progress per second

    // Deduct energy using player's new energy system
    const success = this.player.spendEnergy(energyCost);
    if (!success) {
      // Shouldn't happen (canTravelTo checks this), but safety check
      this.isTraveling = false;
      this.targetPosition = null;
      return {
        success: false,
        reason: 'Not enough energy'
      };
    }

    // Emit travel start event
    this.emitEvent('travelStart', {
      from: { ...this.currentPosition },
      to: { q, r },
      energyCost,
      travelTime
    });

    console.log(`🚶 Started travel to (${q}, ${r}) - Cost: ${energyCost} energy`);

    return {
      success: true,
      energyCost,
      travelTime
    };
  }

  /**
   * Update travel progress (called from game loop)
   */
  update(deltaTime) {
    if (!this.isTraveling) return;

    // Update progress
    this.travelProgress += (this.travelSpeed * deltaTime) / 1000;

    // Check if arrived
    if (this.travelProgress >= 1) {
      this.arriveAtDestination();
    }

    // Check for random events periodically
    const now = Date.now();
    if (now - this.lastEventCheck >= this.eventCheckInterval) {
      this.checkForTravelEvents();
      this.lastEventCheck = now;
    }
  }

  /**
   * Arrive at destination
   */
  arriveAtDestination() {
    if (!this.targetPosition) return;

    const oldPosition = { ...this.currentPosition };
    this.currentPosition = { ...this.targetPosition };
    this.targetPosition = null;
    this.isTraveling = false;
    this.travelProgress = 0;

    // Update territory
    const territory = this.territoryManager.getTerritory(
      this.currentPosition.q,
      this.currentPosition.r
    );

    if (territory) {
      // Visit territory (marks as discovered and visited)
      territory.visit();

      // Discover adjacent territories (expand fog of war)
      const adjacentTiles = this.territoryManager.getVisibleTerritories(this.currentPosition, 1);
      adjacentTiles.forEach(tile => {
        if (!tile.discovered) {
          tile.discover('player');
          console.log(`🔍 Discovered adjacent tile at (${tile.position.q}, ${tile.position.r})`);
        }
      });

      // Check for discoveries
      this.checkForDiscoveries(territory);
    }

    // Update player position
    this.player.moveTo(this.currentPosition.q, this.currentPosition.r);

    // Emit arrival event
    this.emitEvent('travelComplete', {
      from: oldPosition,
      to: this.currentPosition,
      territory
    });

    console.log(`🚶 Arrived at (${this.currentPosition.q}, ${this.currentPosition.r})`);
  }

  /**
   * Check for discoveries at new territory
   */
  checkForDiscoveries(territory) {
    const discoveries = [];

    // Resource nodes (30% chance if not already has one)
    if (!territory.hasResourceNode && Math.random() < 0.30) {
      const nodeTypes = ['tree', 'rock', 'bush'];
      const nodeType = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
      
      territory.hasResourceNode = true;
      territory.resourceNodeId = `${nodeType}_${territory.position.q}_${territory.position.r}`;
      
      discoveries.push({
        type: 'resource',
        nodeType,
        nodeId: territory.resourceNodeId
      });
    }

    // Random events (20% chance)
    if (!territory.hasEvent && Math.random() < 0.20) {
      territory.hasEvent = true;
      territory.eventId = this.generateRandomEvent(territory);
      
      discoveries.push({
        type: 'event',
        eventId: territory.eventId
      });
    }

    // Castaways/NPCs (15% chance)
    if (!territory.hasNPC && Math.random() < 0.15) {
      territory.hasNPC = true;
      territory.npcId = `npc_${territory.position.q}_${territory.position.r}`;
      
      discoveries.push({
        type: 'npc',
        npcId: territory.npcId
      });
    }

    // Emit discovery events
    if (discoveries.length > 0) {
      this.emitEvent('discoveries', {
        territory,
        discoveries
      });
    }
  }

  /**
   * Check for travel events (while traveling)
   */
  checkForTravelEvents() {
    if (!this.isTraveling) return;

    const currentTerritory = this.territoryManager.getTerritory(
      this.currentPosition.q,
      this.currentPosition.r
    );

    if (!currentTerritory || !currentTerritory.owner) return;

    // Get relationship with faction
    const faction = currentTerritory.owner;
    const relationship = this.getRelationshipWithFaction(faction);

    // Roll for faction encounters based on relationship
    this.rollFactionEncounter(faction, relationship, currentTerritory);
  }

  /**
   * Get relationship with faction
   */
  getRelationshipWithFaction(faction) {
    if (faction === 'player') return 100;
    
    // Get from player reputation
    const rep = this.player.reputation[faction] || 0;
    
    if (rep >= 75) return 'ally';
    if (rep >= 50) return 'friendly';
    if (rep >= 25) return 'neutral';
    if (rep >= -25) return 'unfriendly';
    if (rep >= -50) return 'hostile';
    return 'enemy';
  }

  /**
   * Roll for faction encounters
   */
  rollFactionEncounter(faction, relationship, territory) {
    let encounterChance = 0;

    // Base chances by faction
    const baseChances = {
      castaways: 0.15,
      natives_clan1: 0.20,
      natives_clan2: 0.18,
      mercenaries: 0.30
    };
    encounterChance = baseChances[faction] || 0.10;

    // Modify by control strength
    encounterChance *= (territory.controlStrength / 50);

    // Roll for encounter
    if (Math.random() > encounterChance) return;

    // Determine encounter type based on relationship
    const encounterType = this.determineEncounterType(relationship);

    this.emitEvent('factionEncounter', {
      faction,
      relationship,
      encounterType,
      territory
    });
  }

  /**
   * Determine encounter type based on relationship
   */
  determineEncounterType(relationship) {
    const encounters = {
      ally: ['trade', 'gift', 'quest', 'chat'],
      friendly: ['trade', 'chat', 'help'],
      neutral: ['chat', 'ignore', 'warning'],
      unfriendly: ['warning', 'demand', 'threat'],
      hostile: ['ambush', 'attack', 'chase'],
      enemy: ['attack', 'ambush']
    };

    const options = encounters[relationship] || ['ignore'];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Generate random event
   */
  generateRandomEvent(territory) {
    const events = [
      'chest_found',
      'strange_sound',
      'animal_tracks',
      'abandoned_camp',
      'mysterious_shrine',
      'hidden_cave',
      'fruit_tree',
      'fresh_water'
    ];

    return events[Math.floor(Math.random() * events.length)];
  }

  /**
   * Get current territory
   */
  getCurrentTerritory() {
    return this.territoryManager.getTerritory(
      this.currentPosition.q,
      this.currentPosition.r
    );
  }

  /**
   * Set player position (for initialization)
   */
  setPosition(q, r) {
    this.currentPosition = { q, r };
    const territory = this.territoryManager.getTerritory(q, r);
    if (territory) {
      territory.visit();
    }
  }

  /**
   * Event system
   */
  on(event, handler) {
    this.eventHandlers.push({ event, handler });
  }

  emitEvent(event, data) {
    this.eventHandlers
      .filter(h => h.event === event)
      .forEach(h => h.handler(data));
  }

  /**
   * Get travel info for UI
   */
  getTravelInfo(q, r) {
    const territory = this.territoryManager.getTerritory(q, r);
    if (!territory) return null;

    const canTravel = this.canTravelTo(q, r);
    const energyCost = this.calculateEnergyCost(this.currentPosition, { q, r });
    const travelTime = this.calculateTravelTime(this.currentPosition, { q, r });

    return {
      canTravel,
      energyCost,
      travelTime,
      territory,
      reason: !canTravel ? this.getCannotTravelReason(q, r) : null
    };
  }

  /**
   * Get reason why can't travel
   */
  getCannotTravelReason(q, r) {
    const territory = this.territoryManager.getTerritory(q, r);
    if (!territory) return 'Invalid location';
    if (territory.terrain === 'deep_water') return 'Cannot cross deep water';
    
    const energyCost = this.calculateEnergyCost(this.currentPosition, { q, r });
    if (this.player.energy < energyCost) return `Need ${energyCost} energy`;
    
    return 'Too far away';
  }

  /**
   * Serialize for saving
   */
  toJSON() {
    return {
      currentPosition: this.currentPosition,
      isTraveling: this.isTraveling,
      targetPosition: this.targetPosition,
      travelProgress: this.travelProgress
    };
  }

  /**
   * Load from saved data
   */
  loadFromJSON(data) {
    this.currentPosition = data.currentPosition || { q: 0, r: 0 };
    this.isTraveling = data.isTraveling || false;
    this.targetPosition = data.targetPosition || null;
    this.travelProgress = data.travelProgress || 0;
  }
}
