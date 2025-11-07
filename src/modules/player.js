import { Inventory } from './inventory.js';
import { itemDB } from '../data/itemDatabase.js';

/**
 * Player Character System
 * 
 * Multi-layered stat architecture:
 * - Core Stats: Health, Hunger, Thirst, Energy, Sanity
 * - Derived Stats: Max carry weight, movement speed, action efficiency
 * - Status Effects: Bleeding, poisoned, well-rested, etc.
 * - Skill Bonuses: From equipment, perks, faction relationships
 * 
 * Design Philosophy:
 * - Stats influence each other (low hunger reduces max energy)
 * - Status effects can stack and interact
 * - Equipment provides dynamic bonuses
 * - Elegant degradation (you don't just die at 0, you suffer penalties)
 */
export class Player {
  constructor(config = {}) {
    // Identity
    this.name = config.name || 'Survivor';
    this.gender = config.gender || 'male'; // For AI generation context
    
    // Core Stats (0-100 scale)
    // NO MORE ENERGY - actions take time instead!
    this.stats = {
      health: 100,
      maxHealth: 100,
      hunger: 100,      // 100 = full, 0 = starving
      thirst: 100,      // 100 = hydrated, 0 = dehydrated
      sanity: 100       // 100 = stable, 0 = broken
    };
    
    // Status Effects (array of active effects)
    this.statusEffects = [];
    
    // Skills & Abilities
    this.skills = {
      woodcutting: 0,
      mining: 0,
      fishing: 0,
      crafting: 0,
      combat: 0,
      diplomacy: 0,
      survival: 0
    };
    
    // Inventory
    this.inventory = new Inventory();
    
    // Position on map
    this.position = config.position || { q: 0, r: 0 };
    
    // Game time tracking (days only, no hours)
    this.daysAlive = 0;
    
    // Reputation with factions
    this.reputation = {
      castaways: 0,    // -100 to +100
      tidalClan: 0,
      ridgeClan: 0,
      mercenaries: 0,
      island: 0        // The island's will itself
    };
    
    // Moral backbone tracking
    this.moralBackbone = {
      claim: 0,      // Colonial democracy path
      respect: 0,    // Native integration path
      exploit: 0,    // Mercenary domination path
      leave: 0       // Escape path
    };
    
    // Perks/Traits (earned through gameplay)
    this.perks = [];
    
    // State flags
    this.isAlive = true;
    this.isConscious = true;
    this.isMoving = false;
  }

  /**
   * Update stats based on time passage
   * Called whenever in-game time advances
   * @param {number} minutes - In-game minutes that passed
   */
  updateStatsForTime(minutes) {
    // Passive stat drain over time (very slow)
    // At 1x speed: 1 real minute = 1 game minute
    // At 100x speed: actions happen fast but drain is still reasonable
    
    const hours = minutes / 60;
    
    // Hunger drains slowly (2 points per hour = 50 hours to starve)
    this.stats.hunger = Math.max(0, this.stats.hunger - (hours * 2));
    
    // Thirst drains faster (3 points per hour = 33 hours to critical)
    this.stats.thirst = Math.max(0, this.stats.thirst - (hours * 3));
    
    // Sanity recovers very slowly when not in danger (0.5 per hour)
    if (this.stats.sanity < 100 && this.stats.hunger > 30 && this.stats.thirst > 30) {
      this.stats.sanity = Math.min(100, this.stats.sanity + (hours * 0.5));
    }
    
    // Health effects from starvation/dehydration
    if (this.stats.hunger <= 10) {
      this.stats.health = Math.max(0, this.stats.health - (hours * 2)); // Starving damages health
    }
    if (this.stats.thirst <= 10) {
      this.stats.health = Math.max(0, this.stats.health - (hours * 3)); // Dehydration is worse
    }
    
    this.clampStats();
    this.checkCriticalStates();
  }

  /**
   * Update status effects over time
   * Called from game loop
   */
  update(deltaTime) {
    // Only update status effect timers if any exist
    if (this.statusEffects.length > 0) {
      this.updateStatusEffects(deltaTime);
    }
  }
  
  /**
   * Check for critical health states
   */
  checkCriticalStates() {
    // Death from health
    if (this.stats.health <= 0) {
      this.isAlive = false;
      console.warn('💀 Player has died!');
    }
    
    // Unconscious from low health
    if (this.stats.health <= 20 && this.stats.health > 0) {
      this.isConscious = false;
      console.warn('😵 Player is unconscious!');
    } else if (this.stats.health > 20) {
      this.isConscious = true;
    }
  }

  // ===== NEW TURN-BASED SUPPORT METHODS =====

  /**
   * Consume an item (food, water, medicine)
   */
  consumeItem(item) {
    if (!item.consumable) {
      console.warn('Item is not consumable:', item.name);
      return false;
    }
    
    // Apply item effects
    if (item.effects) {
      Object.entries(item.effects).forEach(([stat, value]) => {
        if (this.stats[stat] !== undefined) {
          this.stats[stat] += value;
          console.log(`${stat}: ${value > 0 ? '+' : ''}${value}`);
        }
      });
    }
    
    this.clampStats();
    return true;
  }

  /**
   * Equip an item
   */
  equipItem(item, slot) {
    const result = this.inventory.equip(item, slot);
    if (result) {
      console.log(`Equipped ${item.name} to ${slot} slot`);
    }
    return result;
  }

  /**
   * Unequip an item
   */
  unequipItem(slot) {
    const result = this.inventory.unequip(slot);
    if (result) {
      console.log(`Unequipped ${slot} slot`);
    }
    return result;
  }

  /**
   * Get total bonuses from equipment
   */
  getTotalBonuses() {
    const bonuses = {
      damage: 0,
      defense: 0,
      woodcutting: 0,
      mining: 0,
      fishing: 0,
      crafting: 0,
      capacity: 0,
      speed: 0
    };
    
    // Equipment bonuses
    Object.values(this.inventory.equipment).forEach(item => {
      if (item && item.effects) {
        Object.entries(item.effects).forEach(([key, value]) => {
          if (bonuses[key] !== undefined) {
            bonuses[key] += value;
          }
        });
      }
    });
    
    return bonuses;
  }

  /**
   * Get effective skill level (base + bonuses - penalties)
   */
  getEffectiveSkill(skillName) {
    const base = this.skills[skillName] || 0;
    const bonuses = this.getTotalBonuses();
    const bonus = bonuses[skillName] || 0;
    
    // Stat-based penalties (no more energy)
    let penalty = 0;
    if (this.stats.hunger < 30) {
      penalty += (30 - this.stats.hunger) * 0.3; // Up to -9 at 0 hunger
    }
    if (this.stats.thirst < 30) {
      penalty += (30 - this.stats.thirst) * 0.4; // Up to -12 at 0 thirst
    }
    if (this.stats.health < 50) {
      penalty += (50 - this.stats.health) * 0.2; // Up to -10 at 0 health
    }
    
    return Math.max(0, base + bonus - penalty);
  }

  /**
   * Gain skill experience
   */
  gainSkillXP(skillName, amount) {
    if (this.skills[skillName] !== undefined) {
      this.skills[skillName] += amount;
      console.log(`${skillName} skill increased: +${amount}`);
    }
  }

  /**
   * Adjust reputation with a faction
   */
  adjustReputation(faction, amount) {
    if (this.reputation[faction] !== undefined) {
      this.reputation[faction] += amount;
      this.reputation[faction] = Math.max(-100, Math.min(100, this.reputation[faction]));
      console.log(`Reputation with ${faction}: ${amount > 0 ? '+' : ''}${amount}`);
    }
  }

  /**
   * Adjust moral backbone
   */
  adjustMoralBackbone(path, amount) {
    if (this.moralBackbone[path] !== undefined) {
      this.moralBackbone[path] += amount;
      console.log(`Moral backbone - ${path}: ${amount > 0 ? '+' : ''}${amount}`);
    }
  }

  /**
   * Get dominant moral path
   */
  getDominantPath() {
    let maxPath = null;
    let maxValue = -Infinity;
    
    Object.entries(this.moralBackbone).forEach(([path, value]) => {
      if (value > maxValue) {
        maxValue = value;
        maxPath = path;
      }
    });
    
    return { path: maxPath, value: maxValue };
  }

  /**
   * Move to a new position (now handled by travel system)
   */
  moveTo(q, r) {
    this.position = { q, r };
    console.log(`Moved to (${q}, ${r})`);
  }

  /**
   * Get current state description (for UI/narrative)
   */
  getStateDescription() {
    const descriptions = [];
    
    // Health
    if (this.stats.health < 20) descriptions.push('critically wounded');
    else if (this.stats.health < 50) descriptions.push('injured');
    else if (this.stats.health < 80) descriptions.push('somewhat hurt');
    
    // Hunger
    if (this.stats.hunger < 20) descriptions.push('starving');
    else if (this.stats.hunger < 50) descriptions.push('hungry');
    
    // Thirst
    if (this.stats.thirst < 20) descriptions.push('severely dehydrated');
    else if (this.stats.thirst < 50) descriptions.push('thirsty');
    
    // Sanity
    if (this.stats.sanity < 20) descriptions.push('mentally broken');
    else if (this.stats.sanity < 50) descriptions.push('stressed');
    
    return descriptions.length > 0 ? descriptions.join(', ') : 'in good condition';
  }

  /**
   * Clamp all stats to valid ranges
   */
  clampStats() {
    this.stats.health = Math.max(0, Math.min(this.stats.maxHealth, this.stats.health));
    this.stats.hunger = Math.max(0, Math.min(100, this.stats.hunger));
    this.stats.thirst = Math.max(0, Math.min(100, this.stats.thirst));
    this.stats.sanity = Math.max(0, Math.min(100, this.stats.sanity));
  }

  /**
   * Serialize player state for saving
   */
  toJSON() {
    return {
      name: this.name,
      gender: this.gender,
      stats: { ...this.stats },
      skills: { ...this.skills },
      inventory: this.inventory.toJSON(),
      position: { ...this.position },
      daysAlive: this.daysAlive,
      reputation: { ...this.reputation },
      moralBackbone: { ...this.moralBackbone },
      perks: [...this.perks],
      isAlive: this.isAlive
    };
  }

  /**
   * Deserialize player state from save
   */
  static fromJSON(data) {
    // Handle missing or invalid data
    if (!data) {
      console.warn('⚠️ No player data provided, creating default player');
      return new Player({ name: 'Survivor', gender: 'neutral' });
    }
    
    const player = new Player({ name: data.name || 'Survivor', gender: data.gender || 'neutral' });
    
    // Restore stats with defaults
    if (data.stats) {
      Object.assign(player.stats, data.stats);
    }
    
    // Restore skills with defaults
    if (data.skills) {
      Object.assign(player.skills, data.skills);
    }
    
    // Restore inventory (with itemDatabase)
    if (data.inventory) {
      player.inventory = Inventory.fromJSON(data.inventory, itemDB);
    }
    
    // Restore other properties
    player.position = data.position || { q: 0, r: 0 };
    player.daysAlive = data.daysAlive || 0;
    
    if (data.reputation) {
      Object.assign(player.reputation, data.reputation);
    }
    if (data.moralBackbone) {
      Object.assign(player.moralBackbone, data.moralBackbone);
    }
    
    player.perks = data.perks || [];
    player.isAlive = data.isAlive ?? true;
    
    return player;
  }
}
