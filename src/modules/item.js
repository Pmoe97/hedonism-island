/**
 * Item Class - Represents any item in the game
 */
export class Item {
  constructor(data) {
    // Basic Properties
    this.id = data.id;
    this.name = data.name;
    this.description = data.description || '';
    this.type = data.type; // 'consumable', 'material', 'tool', 'weapon', 'equipment', 'special'
    this.category = data.category; // 'food', 'wood', 'axe', etc.
    
    // Visual
    this.icon = data.icon || 'items/default.png';
    this.sprite = data.sprite || null;
    
    // Inventory Properties
    this.stackable = data.stackable ?? false;
    this.maxStack = data.maxStack || 1;
    this.weight = data.weight || 1;
    
    // Usage Properties
    this.consumable = data.consumable ?? false;
    this.equippable = data.equippable ?? false;
    this.usable = data.usable ?? false;
    
    // Effects
    this.effects = data.effects || {}; // { hunger: 20, health: 10, thirst: 15 }
    this.durability = data.durability ?? null;
    this.maxDurability = data.maxDurability ?? null;
    
    // Value & Rarity
    this.value = data.value || 0;
    this.rarity = data.rarity || 'common'; // common, uncommon, rare, legendary
    
    // Requirements
    this.requirements = data.requirements || {};
  }

  /**
   * Use the item (consume, activate, etc.)
   */
  use(player) {
    if (!this.usable && !this.consumable) {
      console.warn(`${this.name} cannot be used`);
      return false;
    }
    
    if (this.consumable) {
      return this.consume(player);
    }
    
    if (this.usable) {
      return this.activate(player);
    }
    
    return false;
  }

  /**
   * Consume the item (food, water, medicine)
   */
  consume(player) {
    Object.entries(this.effects).forEach(([stat, value]) => {
      player.modifyStat(stat, value);
    });
    
    console.log(`${player.name} consumed ${this.name}`);
    return true; // Item should be removed from inventory
  }

  /**
   * Activate special item behavior
   */
  activate(player) {
    console.log(`${this.name} was activated`);
    // Override in specific item types
    return false;
  }

  /**
   * Check if this item can stack with another
   */
  canStack(otherItem) {
    if (!this.stackable || !otherItem.stackable) return false;
    if (this.id !== otherItem.id) return false;
    
    // Tools with different durability can't stack
    if (this.durability !== null && this.durability !== otherItem.durability) {
      return false;
    }
    
    return true;
  }

  /**
   * Create a copy of this item
   */
  clone() {
    return new Item({
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      category: this.category,
      icon: this.icon,
      sprite: this.sprite,
      stackable: this.stackable,
      maxStack: this.maxStack,
      weight: this.weight,
      consumable: this.consumable,
      equippable: this.equippable,
      usable: this.usable,
      effects: { ...this.effects },
      durability: this.durability,
      maxDurability: this.maxDurability,
      value: this.value,
      rarity: this.rarity,
      requirements: { ...this.requirements }
    });
  }

  /**
   * Get rarity color for UI
   */
  getRarityColor() {
    const colors = {
      common: '#ffffff',
      uncommon: '#00ff00',
      rare: '#0099ff',
      legendary: '#ff9900'
    };
    return colors[this.rarity] || colors.common;
  }

  /**
   * Get durability percentage
   */
  getDurabilityPercent() {
    if (this.durability === null) return 100;
    return (this.durability / this.maxDurability) * 100;
  }

  /**
   * Damage the item (tools/weapons)
   */
  damage(amount = 1) {
    if (this.durability === null) return false;
    
    this.durability = Math.max(0, this.durability - amount);
    return this.durability <= 0; // Returns true if broken
  }

  /**
   * Repair the item
   */
  repair(amount) {
    if (this.durability === null) return;
    this.durability = Math.min(this.maxDurability, this.durability + amount);
  }

  /**
   * Serialize for saving
   */
  toJSON() {
    return {
      id: this.id,
      durability: this.durability,
      // Other dynamic properties only
    };
  }

  /**
   * Get display name with quantity/durability
   */
  getDisplayName(quantity = 1) {
    let name = this.name;
    
    if (quantity > 1) {
      name += ` (${quantity})`;
    }
    
    if (this.durability !== null) {
      const percent = this.getDurabilityPercent();
      if (percent < 25) name += ' [!]'; // Broken warning
      else if (percent < 50) name += ' [*]'; // Damaged warning
    }
    
    return name;
  }
}
