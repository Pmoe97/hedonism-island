import { Inventory } from './inventory.js';

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
    
    // Turn-Based Energy System
    this.energy = 100;           // Current energy for this turn
    this.maxEnergy = 100;        // Maximum energy (affected by hunger/thirst/shelter)
    
    // Core Stats (0-100 scale)
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
   * Spend energy on an action
   * Returns true if successful, false if not enough energy
   */
  spendEnergy(amount) {
    if (this.energy >= amount) {
      this.energy -= amount;
      this.clampStats();
      return true;
    }
    return false;
  }

  /**
   * Check if player has enough energy for an action
   */
  hasEnergy(amount) {
    return this.energy >= amount;
  }

  /**
   * Get energy percentage (0-1)
   */
  getEnergyPercentage() {
    return this.energy / this.maxEnergy;
  }

  /**
   * Restore energy (called at end of turn)
   */
  restoreEnergy(amount) {
    this.energy = Math.min(this.maxEnergy, this.energy + amount);
  }

  /**
   * Calculate max energy based on hunger/thirst
   * Called when starting a new turn
   */
  calculateMaxEnergy() {
    let baseMax = 100;
    
    // Hunger penalty: if hunger < 50, reduce max energy
    if (this.stats.hunger < 50) {
      const hungerPenalty = (50 - this.stats.hunger) * 0.4; // Up to -20 at 0 hunger
      baseMax -= hungerPenalty;
    }
    
    // Thirst penalty: if thirst < 50, reduce max energy
    if (this.stats.thirst < 50) {
      const thirstPenalty = (50 - this.stats.thirst) * 0.6; // Up to -30 at 0 thirst
      baseMax -= thirstPenalty;
    }
    
    // Health penalty: if health < 50, reduce max energy
    if (this.stats.health < 50) {
      const healthPenalty = (50 - this.stats.health) * 0.4; // Up to -20 at 0 health
      baseMax -= healthPenalty;
    }
    
    // Apply perks and bonuses
    // TODO: Add perk bonuses here
    
    this.maxEnergy = Math.max(20, Math.floor(baseMax)); // Minimum 20 energy
  }

  /**
   * Apply night effects (hunger/thirst decay)
   * Called when player ends turn
   */
  applyNightEffects() {
    // Hunger decreases overnight
    this.stats.hunger = Math.max(0, this.stats.hunger - 10);
    
    // Thirst decreases overnight  
    this.stats.thirst = Math.max(0, this.stats.thirst - 15);
    
    // Sanity slowly recovers during rest
    this.stats.sanity = Math.min(100, this.stats.sanity + 5);
    
    // Recalculate max energy based on current stats
    this.calculateMaxEnergy();
    
    this.checkCriticalStates();
  }

  /**
   * NO MORE TIME-BASED UPDATE
   * Game is turn-based now, no passive stat decay
   */
  update(deltaTime) {
    // Only update status effect timers if any exist
    if (this.statusEffects.length > 0) {
      this.updateStatusEffects(deltaTime);
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
   * Get effective skill level (base + bonuses)
   */
  getEffectiveSkill(skillName) {
    const base = this.skills[skillName] || 0;
    const bonuses = this.getTotalBonuses();
    const bonus = bonuses[skillName] || 0;
    
    // Energy-based penalty
    let penalty = 0;
    if (this.energy < 30) {
      penalty = (30 - this.energy) * 0.3;
    }
    if (this.stats.hunger < 30) {
      penalty += (30 - this.stats.hunger) * 0.2;
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
    
    // Energy
    if (this.energy < 20) descriptions.push('exhausted');
    else if (this.energy < 50) descriptions.push('tired');
    
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
    this.energy = Math.max(0, Math.min(this.maxEnergy, this.energy));
  }

  /**
   * Serialize player state for saving
   */
  toJSON() {
    return {
      name: this.name,
      gender: this.gender,
      stats: { ...this.stats },
      energy: this.energy,
      maxEnergy: this.maxEnergy,
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
    const player = new Player({ name: data.name, gender: data.gender });
    
    Object.assign(player.stats, data.stats);
    player.energy = data.energy ?? player.energy;
    player.maxEnergy = data.maxEnergy ?? player.maxEnergy;
    Object.assign(player.skills, data.skills);
    player.inventory = Inventory.fromJSON(data.inventory);
    player.position = data.position;
    player.daysAlive = data.daysAlive;
    Object.assign(player.reputation, data.reputation);
    Object.assign(player.moralBackbone, data.moralBackbone);
    player.perks = data.perks || [];
    player.isAlive = data.isAlive;
    
    return player;
  }
}
