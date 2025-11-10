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
    this.currentTravelDuration = 0; // Store duration for completion event
    
    // Base travel duration (in game minutes)
    this.baseTravelDuration = 10; // 10 minutes base travel time
    
    // Event system
    this.eventHandlers = [];
    this.lastEventCheck = Date.now();
    this.eventCheckInterval = 2000; // Check for events every 2s
  }

  /**
   * Calculate travel duration for traveling to a tile (in game minutes)
   * Duration depends on:
   * - Discovery state (undiscovered takes longer to navigate)
   * - Terrain type (harder terrain = longer travel)
   * - Elevation changes (steep = slower)
   * Range: 5-15 minutes base, with modifiers
   */
  calculateTravelDuration(fromPos, toPos) {
    const fromTerritory = this.territoryManager.getTerritory(fromPos.q, fromPos.r);
    const toTerritory = this.territoryManager.getTerritory(toPos.q, toPos.r);
    
    if (!toTerritory) return Infinity;

    // Base duration depends on discovery state
    let baseDuration;
    if (!toTerritory.discovered) {
      baseDuration = 15; // Exploring unknown terrain takes longer
    } else if (toTerritory.owner === 'player') {
      baseDuration = 5; // Quick travel on owned territory
    } else {
      baseDuration = 10; // Normal travel on discovered terrain
    }

    // Terrain multipliers (harder terrain = longer travel)
    const terrainMultipliers = {
      'deep_water': 999,  // Can't travel through deep water
      'water': 2.0,       // Very slow (swimming/wading)
      'beach': 0.9,       // Easy
      'lowland': 1.0,     // Normal
      'plains': 0.9,      // Easy
      'scrubland': 1.2,   // Slower through brush
      'forest': 1.3,      // Thick vegetation
      'jungle': 1.5,      // Dense jungle
      'highland': 1.4,    // Uphill
      'mountain': 1.6,    // Steep
      'swamp': 1.8,       // Very slow
      'mangrove': 1.4,    // Thick roots
      'bamboo-forest': 1.3, // Dense but navigable
      'palm-grove': 1.1   // Relatively open
    };
    
    const terrainMult = terrainMultipliers[toTerritory.terrain] || 1.2;
    baseDuration *= terrainMult;

    // Elevation change (steeper = slower)
    if (fromTerritory && 
        toTerritory.elevation !== undefined && 
        fromTerritory.elevation !== undefined &&
        !isNaN(toTerritory.elevation) &&
        !isNaN(fromTerritory.elevation)) {
      const elevationChange = Math.abs(toTerritory.elevation - fromTerritory.elevation);
      baseDuration *= (1 + elevationChange * 0.2); // 20% per elevation level
    }

    // Safety check for NaN
    if (isNaN(baseDuration)) {
      console.warn('NaN travel duration calculated for', toPos, 'terrain:', toTerritory.terrain);
      return 10; // Default fallback
    }

    return Math.max(5, Math.ceil(baseDuration)); // Minimum 5 minutes
  }

  /**
   * Check if can travel to position
   */
  canTravelTo(q, r) {
    const territory = this.territoryManager.getTerritory(q, r);
    if (!territory) {
      return false;
    }

    // Can't travel through water - check terrain type
    if (territory.terrain === 'sea' || territory.terrain === 'deep_water') {
      return false;
    }

    // Check if adjacent to current position using proper hex distance
    const dq = Math.abs(q - this.currentPosition.q);
    const dr = Math.abs(r - this.currentPosition.r);
    const ds = Math.abs((-q - r) - (-this.currentPosition.q - this.currentPosition.r));
    const distance = Math.max(dq, dr, ds); // Proper hex distance
    
    if (distance === 0) {
      return false; // Already at this tile
    }
    
    if (distance > 1) {
      return false; // Must be adjacent (hex distance = 1)
    }

    return true;
  }

  /**
   * Start traveling to a position
   * Returns the travel duration so caller can advance game time
   */
  startTravel(q, r) {
    // Prevent starting new travel if already traveling
    if (this.isTraveling) {
      return {
        success: false,
        reason: 'Already traveling'
      };
    }
    
    if (!this.canTravelTo(q, r)) {
      return {
        success: false,
        reason: 'Cannot travel to that location'
      };
    }

    const travelDuration = this.calculateTravelDuration(this.currentPosition, { q, r });
    const travelTimeMs = 1000; // Visual animation time in real-time milliseconds

    this.targetPosition = { q, r };
    this.isTraveling = true;
    this.travelProgress = 0;
    this.travelSpeed = 1000 / travelTimeMs; // Progress per second (for visual animation)
    this.currentTravelDuration = travelDuration; // Store for completion event

    // Emit travel start event
    this.emitEvent('travelStart', {
      from: { ...this.currentPosition },
      to: { q, r },
      duration: travelDuration
    });

    console.log(`🚶 Started travel to (${q}, ${r}) - Duration: ${travelDuration} minutes`);

    return {
      success: true,
      duration: travelDuration // Return duration for time advancement
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
    const duration = this.currentTravelDuration; // Get stored duration
    
    this.currentPosition = { ...this.targetPosition };
    this.targetPosition = null;
    this.isTraveling = false;
    this.travelProgress = 0;
    this.currentTravelDuration = 0; // Reset

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

    // Emit arrival event with duration
    this.emitEvent('travelComplete', {
      from: oldPosition,
      to: this.currentPosition,
      territory,
      duration // Pass duration to event handler
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

    // TODO: NPC discovery (currently handled by NPCManager spawning system)
    // NPCs are spawned at game start, not discovered through travel

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
    const duration = this.calculateTravelDuration(this.currentPosition, { q, r });

    return {
      canTravel,
      duration,
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
    if (territory.terrain === 'deep_water' || territory.terrain === 'sea') return 'Cannot cross water';
    
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
