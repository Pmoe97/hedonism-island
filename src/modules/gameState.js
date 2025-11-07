import { Player } from './player.js';
import { ResourceNodeManager } from './resourceNode.js';
import { itemDB } from '../data/itemDatabase.js';

/**
 * GameState - Central state management for Hedonism Island
 * Modernized version with Player class, Inventory system, and ResourceNode integration
 * 
 * Design Philosophy:
 * - Player class handles all character logic (stats, inventory, skills)
 * - ResourceNodeManager handles all resource nodes
 * - GameState orchestrates everything and manages save/load
 * - Event bus for loose coupling between systems
 */

export class GameState {
  constructor() {
    this.version = "4.0.0"; // v4: Real-time with speed controls, time-based actions
    this.listeners = new Map(); // Event bus for state changes
    
    // Modern system instances
    this.player = null;
    this.resourceManager = null;
    this.uiManagers = {
      playerHUD: null,
      inventoryUI: null,
      gatheringUI: null,
      nodeInspector: null
    };
    
    // Time control
    this.isPaused = false;
    this.timeSpeed = 1; // 1, 10, 20, 100
    this.currentTime = 0; // Total minutes since game start
    
    // Legacy/metadata state
    this.state = {
      meta: {
        version: this.version,
        saveDate: null,
        saveName: "Autosave",
        playTime: 0, // Real-world seconds
        lastTick: Date.now()
      },
      island: {
        seed: null,
        mapRadius: 8,
        discoveredTiles: [],
        controlledZones: []
      },
      characters: [], // NPCs
      time: {
        day: 1,
        hour: 6,      // 0-23 (starts at 6am)
        minute: 0,    // 0-59
        season: "summer"
      },
      flags: {
        phase: 1, // 1-4 (story phases)
        tutorialComplete: false,
        firstCastawayFound: false,
        mercLeaderDefeated: false,
        islanderAlliance: null, // null, 'ally', 'enslaved'
        completedQuests: []
      },
      buildings: [],
      economy: {
        money: 0,
        income: 0,
        expenses: 0
      }
    };
    
    // Game loop control
    this.gameLoopInterval = null;
  }

  /**
   * Initialize game state (new game or load)
   */
  init(config = {}) {
    const {
      playerName = "Survivor",
      playerGender = "male",
      savedState = null,
      spawnPosition = { q: 0, r: 0 }
    } = config;

    if (savedState) {
      // Load from save
      this.loadState(savedState);
    } else {
      // New game
      this.state.island.seed = this.generateSeed();
      
      // Create new player
      this.player = new Player({
        name: playerName,
        gender: playerGender,
        position: spawnPosition
      });
      
      // Create resource manager
      this.resourceManager = new ResourceNodeManager();
      
      // Generate starter resources around spawn
      this.resourceManager.generateStarterNodes(spawnPosition, 3);
    }
    
    // Start game loop
    this.startGameLoop();
    
    this.emit('stateInitialized', {
      player: this.player,
      resourceManager: this.resourceManager,
      state: this.state
    });
  }

  /**
   * Register UI managers (called by UI initialization)
   */
  registerUI(name, uiInstance) {
    this.uiManagers[name] = uiInstance;
    console.log(`Registered UI: ${name}`);
  }

  /**
   * Get UI manager
   */
  getUI(name) {
    return this.uiManagers[name];
  }

  /**
   * Generate random seed for island generation
   */
  generateSeed() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Start game loop (real-time with speed controls)
   * Time advances continuously based on timeSpeed setting
   */
  startGameLoop() {
    this.gameLoopInterval = setInterval(() => {
      if (this.isPaused) return;
      
      const now = Date.now();
      const deltaTime = (now - this.state.meta.lastTick); // Real milliseconds
      this.state.meta.lastTick = now;
      this.state.meta.playTime += deltaTime / 1000; // Track real playtime in seconds

      // Calculate in-game time advancement based on speed
      // At 1x:   1 real second = 1 game minute
      // At 10x:  1 real second = 10 game minutes
      // At 100x: 1 real second = 100 game minutes
      const gameMinutes = (deltaTime / 1000) * this.timeSpeed;
      
      if (gameMinutes > 0) {
        this.advanceTime(gameMinutes);
      }

      // Auto-save every 5 minutes of real playtime
      if (Math.floor(this.state.meta.playTime / 300) > Math.floor((this.state.meta.playTime - deltaTime / 1000) / 300)) {
        this.autoSave();
      }

      this.emit('gameLoopTick', { 
        deltaTime, 
        playTime: this.state.meta.playTime,
        gameTime: this.currentTime,
        timeSpeed: this.timeSpeed
      });
    }, 100); // Run 10 times per second for smooth updates
  }

  /**
   * Advance in-game time by a specified number of minutes
   * Updates day/hour/minute and all time-dependent systems
   */
  advanceTime(minutes) {
    const oldHour = this.state.time.hour;
    const oldDay = this.state.time.day;
    
    // Add minutes to current time
    this.currentTime += minutes;
    
    // Calculate day/hour/minute from total minutes
    const totalMinutes = this.currentTime;
    this.state.time.day = Math.floor(totalMinutes / 1440) + 1; // 1440 minutes per day
    this.state.time.hour = Math.floor((totalMinutes % 1440) / 60);
    this.state.time.minute = Math.floor(totalMinutes % 60);
    
    // Update player stats based on time passed
    if (this.player) {
      this.player.updateStatsForTime(minutes);
    }
    
    // Update resource nodes
    if (this.resourceManager) {
      this.resourceManager.update(minutes * 60 * 1000); // Convert to milliseconds for compatibility
    }
    
    // Check for day/night transitions
    const newHour = this.state.time.hour;
    if (oldHour !== newHour) {
      this.handleHourChange(oldHour, newHour);
    }
    
    // Check for day transitions
    if (oldDay !== this.state.time.day) {
      this.handleDayChange();
    }
    
    this.emit('timeAdvanced', { 
      minutes, 
      currentTime: this.currentTime,
      day: this.state.time.day,
      hour: this.state.time.hour,
      minute: this.state.time.minute
    });
  }

  /**
   * Handle hour changes (for time-of-day effects)
   */
  handleHourChange(oldHour, newHour) {
    const timeOfDay = this.getTimeOfDay();
    
    // Auto-pause on certain transitions (optional)
    // if (newHour === 18) { // Evening
    //   this.pause();
    //   this.emit('timeOfDayChanged', { timeOfDay: 'evening' });
    // }
    
    this.emit('hourChanged', { 
      oldHour, 
      newHour, 
      timeOfDay 
    });
  }

  /**
   * Handle day changes
   */
  handleDayChange() {
    // Daily resource regeneration
    if (this.resourceManager) {
      // Some resources regenerate daily
      // (Most regenerate over time now, but some could be daily)
    }
    
    this.emit('newDay', { 
      day: this.state.time.day
    });
    
    console.log(`🌅 Day ${this.state.time.day} begins`);
  }

  /**
   * Get time of day category
   */
  getTimeOfDay() {
    const hour = this.state.time.hour;
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 21) return 'evening';
    return 'night';
  }

  /**
   * Pause/resume game
   */
  pause() {
    this.isPaused = true;
    this.emit('gamePaused');
  }

  resume() {
    this.isPaused = false;
    this.state.meta.lastTick = Date.now(); // Reset to prevent large delta
    this.emit('gameResumed');
  }

  togglePause() {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  /**
   * Set time speed (1, 10, 20, 100)
   */
  setTimeSpeed(speed) {
    const validSpeeds = [1, 10, 20, 100];
    if (!validSpeeds.includes(speed)) {
      console.warn('Invalid time speed:', speed, 'Valid speeds:', validSpeeds);
      return;
    }
    
    this.timeSpeed = speed;
    this.emit('timeSpeedChanged', { speed });
    console.log(`⏩ Time speed set to ${speed}x`);
  }

  /**
   * Get current day number
   */
  getCurrentDay() {
    return this.state.time.day;
  }

  /**
   * Get formatted time string
   */
  getTimeString() {
    const hour = this.state.time.hour;
    const minute = this.state.time.minute;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    
    return `Day ${this.state.time.day}, ${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }

  /**
   * Player actions - Consume item
   * Consuming an item is instant (no time passes)
   */
  consumeItem(itemId) {
    if (!this.player) return false;
    
    const item = itemDB.get(itemId);
    if (!item || !item.consumable) {
      console.warn('Item cannot be consumed:', itemId);
      return false;
    }
    
    // Check if player has the item
    const hasItem = this.player.inventory.hasItem(itemId);
    if (!hasItem) {
      console.warn('Player does not have item:', itemId);
      return false;
    }
    
    // Apply effects
    const success = this.player.consumeItem(item);
    
    if (success) {
      // Remove from inventory
      this.player.inventory.removeItem(itemId, 1);
      
      this.emit('itemConsumed', { itemId, item, effects: item.effects });
      return true;
    }
    
    return false;
  }

  /**
   * Player actions - Gather from resource node
   * Gathering takes time based on the node's gather duration
   */
  gatherFromNode(nodeId, onProgress = null) {
    if (!this.player || !this.resourceManager) return null;
    
    const node = this.resourceManager.getNode(nodeId);
    if (!node) {
      console.warn('Node not found:', nodeId);
      return null;
    }
    
    // Check if can gather
    const canGather = node.canGather(this.player);
    if (!canGather.success) {
      this.emit('gatherFailed', { nodeId, reason: canGather.reason });
      return { success: false, reason: canGather.reason };
    }
    
    // Get gather duration (in game minutes)
    // Base: 15-45 minutes depending on node type and player skill
    const gatherDuration = node.getGatherDuration ? node.getGatherDuration(this.player) : 30;
    
    // Start gathering (UI will handle progress animation)
    const gatherTimeMs = 2000; // 2 seconds real-time animation
    const startTime = Date.now();
    
    // Simulate gathering progress
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / gatherTimeMs) * 100, 100);
      
      if (onProgress) onProgress(progress);
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        
        // Complete gathering
        const result = node.gather(this.player);
        
        if (result.success) {
          // Add items to inventory
          result.items.forEach(item => {
            this.player.inventory.addItem(item);
          });
          
          // Advance game time by gather duration
          this.advanceTime(gatherDuration);
          
          this.emit('gatherComplete', { nodeId, result, duration: gatherDuration });
        }
        
        return result;
      }
    }, 100);
    
    return { success: true, gathering: true, duration: gatherDuration };
  }

  /**
   * Player actions - Equip item
   */
  equipItem(itemId, slot) {
    if (!this.player) return false;
    
    const item = this.player.inventory.slots.find(s => !s.isEmpty() && s.item.id === itemId)?.item;
    if (!item) {
      console.warn('Item not in inventory:', itemId);
      return false;
    }
    
    const success = this.player.equipItem(item, slot);
    
    if (success) {
      this.emit('itemEquipped', { itemId, slot });
    }
    
    return success;
  }

  /**
   * Player actions - Move to position
   */
  movePlayer(q, r) {
    if (!this.player) return false;
    
    const success = this.player.moveTo(q, r);
    
    if (success) {
      this.emit('playerMoved', { position: { q, r } });
    }
    
    return success;
  }

  /**
   * Add character to the game
   */
  addCharacter(character) {
    this.state.characters.push(character);
    this.emit('characterAdded', character);
  }

  /**
   * Update character relationship
   */
  updateRelationship(characterId, delta) {
    const character = this.state.characters.find(c => c.id === characterId);
    if (character) {
      character.relationship = Math.max(0, Math.min(100, character.relationship + delta));
      this.emit('relationshipChanged', { characterId, relationship: character.relationship, delta });
    }
  }

  /**
   * Add item to player inventory (legacy support + new system)
   */
  addItem(itemId, quantity = 1) {
    if (!this.player) return false;
    
    for (let i = 0; i < quantity; i++) {
      const item = itemDB.get(itemId);
      if (item) {
        this.player.inventory.addItem(item);
      }
    }
    
    this.emit('inventoryUpdated', this.player.inventory);
    return true;
  }

  /**
   * Remove item from inventory (legacy support + new system)
   */
  removeItem(itemId, quantity = 1) {
    if (!this.player) return false;
    
    const removed = this.player.inventory.removeItem(itemId, quantity);
    
    if (removed) {
      this.emit('inventoryUpdated', this.player.inventory);
    }
    
    return removed;
  }

  /**
   * Get player inventory (for UI/external access)
   */
  getInventory() {
    return this.player?.inventory || null;
  }

  /**
   * Save game state to localStorage
   */
  save(slotName = 'autosave') {
    const saveData = {
      version: this.version,
      meta: {
        ...this.state.meta,
        saveDate: new Date().toISOString(),
        saveName: slotName
      },
      player: this.player ? this.player.toJSON() : null,
      resourceManager: this.resourceManager ? this.resourceManager.toJSON() : null,
      state: {
        ...this.state,
        meta: undefined // Don't duplicate meta
      }
    };
    
    try {
      localStorage.setItem(`hedonism_save_${slotName}`, JSON.stringify(saveData));
      this.emit('gameSaved', { slotName, saveData });
      console.log(`✅ Game saved: ${slotName}`);
      return true;
    } catch (e) {
      console.error('Failed to save game:', e);
      this.emit('saveFailed', { error: e.message });
      return false;
    }
  }

  /**
   * Auto-save
   */
  autoSave() {
    this.save('autosave');
  }

  /**
   * Load game state from localStorage
   */
  load(slotName = 'autosave') {
    try {
      const savedData = localStorage.getItem(`hedonism_save_${slotName}`);
      if (!savedData) {
        console.warn(`No save found: ${slotName}`);
        return false;
      }
      
      const data = JSON.parse(savedData);
      
      // Handle backward compatibility from v1.0.0 saves
      if (!data.version || data.version === '1.0.0') {
        console.log('⚠️ Loading legacy v1.0.0 save - migrating to v2.0.0');
        this.migrateLegacySave(data);
      } else {
        // Modern v2.0.0+ save
        this.loadState(data);
      }
      
      this.emit('gameLoaded', { slotName, data });
      console.log(`✅ Game loaded: ${slotName} (v${data.version || '1.0.0'})`);
      return true;
    } catch (e) {
      console.error('Failed to load game:', e);
      this.emit('loadFailed', { error: e.message });
      return false;
    }
  }

  /**
   * Load state object into current state
   */
  loadState(data) {
    // Restore base state (keeping new fields from current version)
    if (data.state) {
      this.state = { ...this.state, ...data.state };
    }
    
    // Restore meta
    if (data.meta) {
      this.state.meta = { ...data.meta, lastTick: Date.now() };
    }
    
    // Restore time control settings (v4.0.0+)
    if (data.timeControl) {
      this.isPaused = data.timeControl.isPaused || false;
      this.timeSpeed = data.timeControl.timeSpeed || 1;
      this.currentTime = data.timeControl.currentTime || 0;
    }
    
    // Recreate Player from saved data
    if (data.player) {
      this.player = Player.fromJSON(data.player);
    }
    
    // Recreate ResourceNodeManager from saved data
    if (data.resourceManager) {
      // Define node configurations for deserialization
      const nodeConfigs = {
        'tree': {
          resourceType: 'wood',
          baseYield: { min: 2, max: 4 },
          requiredTool: 'axe',
          requiredSkill: 'woodcutting',
          sprite: '🌳',
          depletedSprite: '🪵',
          gatherDuration: 30,
          gatherTimeMs: 2000
        },
        'rock': {
          resourceType: 'stone',
          baseYield: { min: 2, max: 3 },
          requiredTool: 'pickaxe',
          requiredSkill: 'mining',
          sprite: '🪨',
          depletedSprite: '⚫',
          gatherDuration: 40,
          gatherTimeMs: 2500
        },
        'berry_bush': {
          resourceType: 'berries',
          baseYield: { min: 3, max: 6 },
          requiredTool: null,
          sprite: '🫐',
          depletedSprite: '🍂',
          gatherDuration: 15,
          gatherTimeMs: 1500
        },
        'coconut_tree': {
          resourceType: 'coconut',
          baseYield: { min: 1, max: 2 },
          requiredTool: null,
          sprite: '🌴',
          depletedSprite: '🌴',
          gatherDuration: 20,
          gatherTimeMs: 1800
        }
      };
      
      this.resourceManager = ResourceNodeManager.fromJSON(data.resourceManager, nodeConfigs);
    }
    
    this.emit('stateLoaded', { version: data.version || '4.0.0' });
  }

  /**
   * Migrate legacy v1.0.0 save to v2.0.0 format
   */
  migrateLegacySave(legacyData) {
    // Restore old state structure
    this.state = { ...legacyData };
    this.state.meta.lastTick = Date.now();
    
    // Create Player from old player data
    const oldPlayer = legacyData.player || {};
    this.player = new Player({
      name: oldPlayer.name || 'Survivor',
      gender: oldPlayer.gender || 'neutral'
    });
    
    // Migrate stats
    if (oldPlayer.health !== undefined) this.player.stats.health.current = oldPlayer.health;
    if (oldPlayer.hunger !== undefined) this.player.stats.hunger.current = oldPlayer.hunger;
    if (oldPlayer.thirst !== undefined) this.player.stats.thirst.current = oldPlayer.thirst;
    if (oldPlayer.energy !== undefined) this.player.stats.energy.current = oldPlayer.energy;
    
    // Migrate position
    if (oldPlayer.position) {
      this.player.position = { ...oldPlayer.position };
    }
    
    // Migrate old inventory (item counts) to new slot-based system
    if (legacyData.inventory) {
      Object.entries(legacyData.inventory).forEach(([itemId, quantity]) => {
        const item = itemDB.get(itemId);
        if (item) {
          this.player.inventory.addItem(item, quantity);
        }
      });
    }
    
    // Create ResourceNodeManager (legacy saves won't have nodes, so start fresh)
    this.resourceManager = new ResourceNodeManager();
    this.resourceManager.generateStarterNodes(this.player.position);
    
    console.log('✅ Legacy save migrated to v2.0.0');
  }

  /**
   * Export save to JSON file
   */
  exportSave() {
    const saveData = {
      version: this.version,
      meta: {
        ...this.state.meta,
        saveDate: new Date().toISOString()
      },
      player: this.player ? this.player.toJSON() : null,
      resourceManager: this.resourceManager ? this.resourceManager.toJSON() : null,
      timeControl: {
        isPaused: this.isPaused,
        timeSpeed: this.timeSpeed,
        currentTime: this.currentTime
      },
      state: {
        ...this.state,
        meta: undefined // Don't duplicate meta
      }
    };
    
    const dataStr = JSON.stringify(saveData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `hedonism_island_day${this.state.time.day}_${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    this.emit('saveExported', { filename: a.download });
  }

  /**
   * Import save from JSON file
   */
  importSave(fileContent) {
    try {
      const loadedState = JSON.parse(fileContent);
      this.loadState(loadedState);
      this.save('imported');
      return true;
    } catch (e) {
      console.error('Failed to import save:', e);
      return false;
    }
  }

  /**
   * List all available saves
   */
  listSaves() {
    const saves = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('hedonism_save_')) {
        const slotName = key.replace('hedonism_save_', '');
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const version = data.version || '1.0.0';
          
          // Extract relevant metadata based on version
          let saveInfo = {
            slotName,
            version,
            saveDate: data.meta?.saveDate || 'Unknown'
          };
          
          if (version === '2.0.0') {
            // Modern save format
            saveInfo.playerName = data.player?.name || 'Survivor';
            saveInfo.day = data.state?.time?.day || 0;
            saveInfo.playTime = data.meta?.playTime || 0;
            saveInfo.health = data.player?.stats?.health?.current || 100;
            saveInfo.characterCount = data.state?.characters?.length || 0;
          } else {
            // Legacy v1.0.0 format
            saveInfo.playerName = data.player?.name || 'Survivor';
            saveInfo.day = data.time?.day || 0;
            saveInfo.playTime = data.meta?.playTime || 0;
            saveInfo.health = data.player?.health || 100;
            saveInfo.characterCount = data.characters?.length || 0;
          }
          
          saves.push(saveInfo);
        } catch (e) {
          console.error(`Failed to parse save ${slotName}:`, e);
        }
      }
    }
    return saves.sort((a, b) => new Date(b.saveDate) - new Date(a.saveDate));
  }

  /**
   * Delete save
   */
  deleteSave(slotName) {
    localStorage.removeItem(`hedonism_save_${slotName}`);
    this.emit('saveDeleted', { slotName });
  }

  /**
   * Event bus - subscribe to state changes
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Event bus - subscribe once (auto-removes after first call)
   */
  once(event, callback) {
    const wrapper = (data) => {
      callback(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  /**
   * Event bus - unsubscribe from event
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Event bus - emit event
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  /**
   * Stop game loop (cleanup)
   */
  destroy() {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
    }
  }

  /**
   * Get current state (read-only)
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Set flag
   */
  setFlag(flagName, value) {
    this.state.flags[flagName] = value;
    this.emit('flagChanged', { flagName, value });
  }

  /**
   * Check flag
   */
  hasFlag(flagName) {
    return !!this.state.flags[flagName];
  }
}
