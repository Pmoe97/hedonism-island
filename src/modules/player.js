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
    
    // Core Stats (0-100 scale)
    this.stats = {
      health: 100,
      maxHealth: 100,
      hunger: 100,      // 100 = full, 0 = starving
      thirst: 100,      // 100 = hydrated, 0 = dehydrated
      energy: 100,      // 100 = well-rested, 0 = exhausted
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
    
    // Game time tracking
    this.daysAlive = 0;
    this.hoursAlive = 0;
    
    // Reputation with factions
    this.reputation = {
      castaways: 0,    // -100 to +100
      nativesClan1: 0,
      nativesClan2: 0,
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
    
    // Stats update tracking
    this.lastUpdateTime = Date.now();
    this.updateInterval = 1000; // Update every second
  }

  /**
   * Update player stats based on time passed
   * Called by game loop
   */
  update(deltaTime) {
    if (!this.isAlive) return;
    
    // Track time
    this.hoursAlive += deltaTime / (60 * 60 * 1000); // Convert ms to hours
    if (this.hoursAlive >= 24) {
      this.daysAlive += Math.floor(this.hoursAlive / 24);
      this.hoursAlive %= 24;
    }
    
    // Apply stat degradation
    this.applyStatDegradation(deltaTime);
    
    // Apply status effects
    this.updateStatusEffects(deltaTime);
    
    // Check for critical states
    this.checkCriticalStates();
    
    // Apply stat influences (hunger affects energy, etc.)
    this.applyStatInteractions();
    
    // Clamp all stats to valid ranges
    this.clampStats();
  }

  /**
   * Natural stat degradation over time
   */
  applyStatDegradation(deltaTime) {
    const hours = deltaTime / (60 * 60 * 1000);
    
    // Hunger decreases faster when active
    const hungerRate = this.isMoving ? 2.5 : 1.5; // % per hour
    this.stats.hunger -= hungerRate * hours;
    
    // Thirst decreases rapidly
    const thirstRate = this.isMoving ? 4 : 2.5; // % per hour
    this.stats.thirst -= thirstRate * hours;
    
    // Energy decreases when active, regenerates when resting
    if (this.isMoving) {
      this.stats.energy -= 3 * hours;
    } else if (this.stats.energy < 100) {
      // Regenerate energy when resting (faster if well-fed)
      const regenRate = this.stats.hunger > 50 ? 10 : 5;
      this.stats.energy += regenRate * hours;
    }
    
    // Health regeneration (very slow, requires food and rest)
    if (this.stats.health < this.stats.maxHealth &&
        this.stats.hunger > 60 &&
        this.stats.energy > 70) {
      this.stats.health += 2 * hours;
    }
    
    // Sanity degradation from various factors
    if (this.stats.hunger < 20 || this.stats.thirst < 20) {
      this.stats.sanity -= 1 * hours; // Starvation affects mind
    }
    if (this.stats.energy < 20) {
      this.stats.sanity -= 0.5 * hours; // Exhaustion affects mind
    }
  }

  /**
   * Status effects system
   */
  updateStatusEffects(deltaTime) {
    this.statusEffects = this.statusEffects.filter(effect => {
      effect.duration -= deltaTime;
      
      if (effect.duration <= 0) {
        this.onEffectExpire(effect);
        return false; // Remove expired effect
      }
      
      // Apply effect's ongoing impact
      this.applyEffectTick(effect, deltaTime);
      return true;
    });
  }

  /**
   * Add a status effect
   */
  addStatusEffect(effect) {
    // Check if effect already exists
    const existing = this.statusEffects.find(e => e.id === effect.id);
    
    if (existing) {
      // Refresh duration or stack intensity
      if (effect.stackable) {
        existing.intensity = (existing.intensity || 1) + (effect.intensity || 1);
        existing.duration = Math.max(existing.duration, effect.duration);
      } else {
        existing.duration = effect.duration; // Just refresh duration
      }
    } else {
      this.statusEffects.push({
        id: effect.id,
        name: effect.name,
        type: effect.type, // 'buff', 'debuff', 'neutral'
        duration: effect.duration,
        intensity: effect.intensity || 1,
        stackable: effect.stackable || false,
        effects: effect.effects,
        icon: effect.icon
      });
      
      this.onEffectApply(effect);
    }
  }

  /**
   * Remove a status effect
   */
  removeStatusEffect(effectId) {
    const index = this.statusEffects.findIndex(e => e.id === effectId);
    if (index !== -1) {
      const effect = this.statusEffects[index];
      this.onEffectExpire(effect);
      this.statusEffects.splice(index, 1);
    }
  }

  /**
   * Called when effect is first applied
   */
  onEffectApply(effect) {
    console.log(`Status effect applied: ${effect.name}`);
    // TODO: Show UI notification
  }

  /**
   * Called every tick while effect is active
   */
  applyEffectTick(effect, deltaTime) {
    const hours = deltaTime / (60 * 60 * 1000);
    const intensity = effect.intensity || 1;
    
    if (effect.effects) {
      Object.entries(effect.effects).forEach(([stat, value]) => {
        if (this.stats[stat] !== undefined) {
          this.stats[stat] += value * intensity * hours;
        }
      });
    }
  }

  /**
   * Called when effect expires
   */
  onEffectExpire(effect) {
    console.log(`Status effect expired: ${effect.name}`);
    // TODO: Show UI notification
  }

  /**
   * Stats influence each other
   */
  applyStatInteractions() {
    // Low hunger reduces max energy
    if (this.stats.hunger < 30) {
      const maxEnergyPenalty = (30 - this.stats.hunger) * 2;
      if (this.stats.energy > 100 - maxEnergyPenalty) {
        this.stats.energy = 100 - maxEnergyPenalty;
      }
    }
    
    // Severe thirst causes health loss
    if (this.stats.thirst < 10) {
      this.stats.health -= 0.5; // Lose health from dehydration
    }
    
    // Zero hunger causes health loss
    if (this.stats.hunger <= 0) {
      this.stats.health -= 1; // Starvation damage
    }
    
    // Very low sanity affects all other stats
    if (this.stats.sanity < 20) {
      // Panic/breakdown reduces efficiency
      const penalty = (20 - this.stats.sanity) * 0.1;
      this.stats.energy -= penalty;
    }
  }

  /**
   * Check for critical states (unconscious, death)
   */
  checkCriticalStates() {
    // Death
    if (this.stats.health <= 0) {
      this.die();
      return;
    }
    
    // Unconsciousness
    if (this.stats.energy <= 0 || this.stats.health <= 10) {
      if (this.isConscious) {
        this.becomeUnconscious();
      }
    } else if (!this.isConscious && this.stats.energy > 20 && this.stats.health > 20) {
      this.regainConsciousness();
    }
  }

  /**
   * Player becomes unconscious
   */
  becomeUnconscious() {
    this.isConscious = false;
    this.isMoving = false;
    console.log('Player has become unconscious!');
    // TODO: Trigger unconscious event/cutscene
  }

  /**
   * Player regains consciousness
   */
  regainConsciousness() {
    this.isConscious = true;
    console.log('Player has regained consciousness!');
    // TODO: Show recovery message
  }

  /**
   * Player death
   */
  die() {
    this.isAlive = false;
    this.isConscious = false;
    this.isMoving = false;
    console.log('Player has died!');
    // TODO: Trigger death event/game over
  }

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
    
    // Some items might apply status effects
    if (item.statusEffect) {
      this.addStatusEffect(item.statusEffect);
    }
    
    // Clamp stats after consumption
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
   * Get total bonuses from equipment and status effects
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
    
    // Status effect bonuses
    this.statusEffects.forEach(effect => {
      if (effect.effects) {
        Object.entries(effect.effects).forEach(([key, value]) => {
          if (bonuses[key] !== undefined) {
            bonuses[key] += value * (effect.intensity || 1);
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
    
    // Stat penalties
    let penalty = 0;
    if (this.stats.energy < 30) {
      penalty = (30 - this.stats.energy) * 0.5; // Exhaustion penalty
    }
    if (this.stats.hunger < 30) {
      penalty += (30 - this.stats.hunger) * 0.3; // Hunger penalty
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
      
      // TODO: Check for skill level-up milestones
    }
  }

  /**
   * Adjust reputation with a faction
   */
  adjustReputation(faction, amount) {
    if (this.reputation[faction] !== undefined) {
      this.reputation[faction] += amount;
      
      // Clamp to -100 to +100
      this.reputation[faction] = Math.max(-100, Math.min(100, this.reputation[faction]));
      
      console.log(`Reputation with ${faction}: ${amount > 0 ? '+' : ''}${amount}`);
      
      // TODO: Check for reputation milestones/events
    }
  }

  /**
   * Adjust moral backbone
   */
  adjustMoralBackbone(path, amount) {
    if (this.moralBackbone[path] !== undefined) {
      this.moralBackbone[path] += amount;
      console.log(`Moral backbone - ${path}: ${amount > 0 ? '+' : ''}${amount}`);
      
      // TODO: Check for path-specific events/unlocks
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
   * Perform an action that costs energy
   */
  performAction(energyCost, onSuccess, onFailure) {
    if (this.stats.energy < energyCost) {
      console.warn('Not enough energy to perform action');
      if (onFailure) onFailure();
      return false;
    }
    
    this.stats.energy -= energyCost;
    if (onSuccess) onSuccess();
    return true;
  }

  /**
   * Move to a new position
   */
  moveTo(q, r) {
    // Calculate energy cost based on distance
    const distance = Math.abs(q - this.position.q) + Math.abs(r - this.position.r);
    const energyCost = distance * 2;
    
    return this.performAction(energyCost, () => {
      this.position = { q, r };
      console.log(`Moved to (${q}, ${r})`);
    }, () => {
      console.log('Too exhausted to move');
    });
  }

  /**
   * Rest to recover energy
   */
  rest(hours) {
    const energyRecovered = hours * 15;
    this.stats.energy = Math.min(100, this.stats.energy + energyRecovered);
    console.log(`Rested for ${hours} hours. Energy: +${energyRecovered}`);
    
    // Resting also helps sanity recovery
    if (this.stats.sanity < 100) {
      const sanityRecovered = hours * 5;
      this.stats.sanity = Math.min(100, this.stats.sanity + sanityRecovered);
    }
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
    if (this.stats.energy < 20) descriptions.push('exhausted');
    else if (this.stats.energy < 50) descriptions.push('tired');
    
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
    this.stats.energy = Math.max(0, Math.min(100, this.stats.energy));
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
      statusEffects: [...this.statusEffects],
      skills: { ...this.skills },
      inventory: this.inventory.toJSON(),
      position: { ...this.position },
      daysAlive: this.daysAlive,
      hoursAlive: this.hoursAlive,
      reputation: { ...this.reputation },
      moralBackbone: { ...this.moralBackbone },
      perks: [...this.perks],
      isAlive: this.isAlive,
      isConscious: this.isConscious
    };
  }

  /**
   * Deserialize player state from save
   */
  static fromJSON(data) {
    const player = new Player({ name: data.name, gender: data.gender });
    
    Object.assign(player.stats, data.stats);
    player.statusEffects = data.statusEffects || [];
    Object.assign(player.skills, data.skills);
    player.inventory = Inventory.fromJSON(data.inventory);
    player.position = data.position;
    player.daysAlive = data.daysAlive;
    player.hoursAlive = data.hoursAlive;
    Object.assign(player.reputation, data.reputation);
    Object.assign(player.moralBackbone, data.moralBackbone);
    player.perks = data.perks || [];
    player.isAlive = data.isAlive;
    player.isConscious = data.isConscious;
    
    return player;
  }
}
