/**
 * Inventory Slot - Represents a single inventory slot
 */
export class InventorySlot {
  constructor() {
    this.item = null;
    this.quantity = 0;
  }

  /**
   * Add items to this slot
   * @returns {number} Number of items that couldn't be added
   */
  add(item, quantity = 1) {
    if (!this.item) {
      // Empty slot - add the item
      this.item = item;
      this.quantity = quantity;
      return 0;
    }
    
    if (this.item.canStack(item)) {
      const space = this.item.maxStack - this.quantity;
      const toAdd = Math.min(space, quantity);
      this.quantity += toAdd;
      return quantity - toAdd; // Return remainder
    }
    
    return quantity; // Can't add, return all
  }

  /**
   * Remove items from this slot
   * @returns {number} Number of items actually removed
   */
  remove(quantity = 1) {
    const removed = Math.min(this.quantity, quantity);
    this.quantity -= removed;
    
    if (this.quantity <= 0) {
      this.item = null;
      this.quantity = 0;
    }
    
    return removed;
  }

  /**
   * Check if slot is empty
   */
  isEmpty() {
    return this.item === null || this.quantity <= 0;
  }

  /**
   * Check if slot is full
   */
  isFull() {
    if (!this.item) return false;
    return this.quantity >= this.item.maxStack;
  }

  /**
   * Get available space in slot
   */
  getAvailableSpace() {
    if (!this.item) return Infinity;
    return this.item.maxStack - this.quantity;
  }

  /**
   * Clear the slot
   */
  clear() {
    this.item = null;
    this.quantity = 0;
  }

  /**
   * Serialize for saving
   */
  toJSON() {
    if (this.isEmpty()) return null;
    
    return {
      itemId: this.item.id,
      quantity: this.quantity,
      durability: this.item.durability
    };
  }
}

/**
 * Inventory Class - Main inventory management
 */
export class Inventory {
  constructor(capacity = 20, maxWeight = 100) {
    this.capacity = capacity;
    this.maxWeight = maxWeight;
    this.slots = [];
    
    // Initialize slots
    for (let i = 0; i < capacity; i++) {
      this.slots.push(new InventorySlot());
    }
    
    // Equipment slots
    this.equipment = {
      weapon: null,
      tool: null,
      clothing: null,
      backpack: null
    };
  }

  /**
   * Add item to inventory
   */
  addItem(item, quantity = 1) {
    if (quantity <= 0) return false;
    
    let remaining = quantity;
    
    // Try to stack with existing items first
    if (item.stackable) {
      for (let slot of this.slots) {
        if (slot.item && slot.item.canStack(item) && !slot.isFull()) {
          remaining = slot.add(item, remaining);
          if (remaining === 0) return true;
        }
      }
    }
    
    // Add to empty slots
    while (remaining > 0) {
      const emptySlot = this.slots.find(s => s.isEmpty());
      if (!emptySlot) {
        console.warn('Inventory full! Could not add all items.');
        return false;
      }
      
      const toAdd = item.stackable ? Math.min(remaining, item.maxStack) : 1;
      emptySlot.add(item.clone(), toAdd);
      remaining -= toAdd;
    }
    
    return true;
  }

  /**
   * Remove item from inventory
   */
  removeItem(itemId, quantity = 1) {
    let remaining = quantity;
    
    for (let slot of this.slots) {
      if (slot.item && slot.item.id === itemId) {
        const removed = slot.remove(remaining);
        remaining -= removed;
        if (remaining === 0) return true;
      }
    }
    
    return remaining < quantity; // Partial success if we removed any
  }

  /**
   * Check if inventory has item
   */
  hasItem(itemId, quantity = 1) {
    return this.getItemCount(itemId) >= quantity;
  }

  /**
   * Get total count of an item
   */
  getItemCount(itemId) {
    return this.slots
      .filter(s => s.item && s.item.id === itemId)
      .reduce((sum, s) => sum + s.quantity, 0);
  }

  /**
   * Get first slot containing item
   */
  findItem(itemId) {
    return this.slots.findIndex(s => s.item && s.item.id === itemId);
  }

  /**
   * Get all slots containing item
   */
  findAllItems(itemId) {
    return this.slots
      .map((slot, index) => ({ slot, index }))
      .filter(({ slot }) => slot.item && slot.item.id === itemId);
  }

  /**
   * Calculate total weight
   */
  getTotalWeight() {
    let weight = this.slots
      .filter(s => !s.isEmpty())
      .reduce((sum, s) => sum + (s.item.weight * s.quantity), 0);
    
    // Add equipment weight
    Object.values(this.equipment).forEach(item => {
      if (item) weight += item.weight;
    });
    
    return weight;
  }

  /**
   * Check if inventory is full
   */
  isFull() {
    return this.slots.every(s => !s.isEmpty());
  }

  /**
   * Check if inventory has space for item
   */
  hasSpaceFor(item, quantity = 1) {
    if (this.isFull() && !item.stackable) return false;
    
    // Check if we can stack with existing items
    if (item.stackable) {
      let availableSpace = 0;
      
      for (let slot of this.slots) {
        if (slot.isEmpty()) {
          availableSpace += item.maxStack;
        } else if (slot.item && slot.item.canStack(item)) {
          availableSpace += slot.getAvailableSpace();
        }
      }
      
      return availableSpace >= quantity;
    }
    
    // Non-stackable items need empty slots
    const emptySlots = this.slots.filter(s => s.isEmpty()).length;
    return emptySlots >= quantity;
  }

  /**
   * Equip an item
   */
  equip(item, slotType) {
    if (!item.equippable) {
      console.warn(`${item.name} cannot be equipped`);
      return false;
    }
    
    // Unequip current item in slot
    if (this.equipment[slotType]) {
      const unequipped = this.equipment[slotType];
      if (!this.addItem(unequipped)) {
        console.warn('Inventory full, cannot unequip item');
        return false;
      }
    }
    
    // Equip new item
    this.equipment[slotType] = item;
    this.removeItem(item.id, 1);
    
    console.log(`Equipped ${item.name} in ${slotType} slot`);
    return true;
  }

  /**
   * Unequip an item
   */
  unequip(slotType) {
    const item = this.equipment[slotType];
    if (!item) return false;
    
    if (!this.addItem(item)) {
      console.warn('Inventory full, cannot unequip item');
      return false;
    }
    
    this.equipment[slotType] = null;
    console.log(`Unequipped ${item.name} from ${slotType} slot`);
    return true;
  }

  /**
   * Get equipped item in slot
   */
  getEquipped(slotType) {
    return this.equipment[slotType];
  }

  /**
   * Use item from inventory
   */
  useItem(slotIndex, player) {
    const slot = this.slots[slotIndex];
    if (slot.isEmpty()) return false;
    
    const item = slot.item;
    const wasUsed = item.use(player);
    
    if (wasUsed && item.consumable) {
      slot.remove(1);
    }
    
    return wasUsed;
  }

  /**
   * Drop item from inventory
   */
  dropItem(slotIndex, quantity = 1) {
    const slot = this.slots[slotIndex];
    if (slot.isEmpty()) return null;
    
    const item = slot.item.clone();
    const dropped = slot.remove(quantity);
    
    return { item, quantity: dropped };
  }

  /**
   * Swap two inventory slots
   */
  swapSlots(index1, index2) {
    const temp = this.slots[index1];
    this.slots[index1] = this.slots[index2];
    this.slots[index2] = temp;
  }

  /**
   * Sort inventory by type/name
   */
  sortInventory(sortBy = 'type') {
    const nonEmptySlots = this.slots.filter(s => !s.isEmpty());
    const emptySlots = this.slots.filter(s => s.isEmpty());
    
    if (sortBy === 'type') {
      nonEmptySlots.sort((a, b) => {
        if (a.item.type !== b.item.type) {
          return a.item.type.localeCompare(b.item.type);
        }
        return a.item.name.localeCompare(b.item.name);
      });
    } else if (sortBy === 'name') {
      nonEmptySlots.sort((a, b) => a.item.name.localeCompare(b.item.name));
    } else if (sortBy === 'value') {
      nonEmptySlots.sort((a, b) => b.item.value - a.item.value);
    }
    
    this.slots = [...nonEmptySlots, ...emptySlots];
  }

  /**
   * Stack all stackable items
   */
  stackAll() {
    const itemMap = new Map();
    
    // Group items by ID
    this.slots.forEach(slot => {
      if (slot.isEmpty()) return;
      
      const id = slot.item.id;
      if (!itemMap.has(id)) {
        itemMap.set(id, []);
      }
      itemMap.get(id).push(slot);
    });
    
    // Stack items
    itemMap.forEach(slots => {
      if (slots.length <= 1) return;
      
      const item = slots[0].item;
      if (!item.stackable) return;
      
      // Combine all quantities
      let totalQuantity = slots.reduce((sum, s) => sum + s.quantity, 0);
      
      // Clear all slots
      slots.forEach(s => s.clear());
      
      // Redistribute optimally
      let slotIndex = 0;
      while (totalQuantity > 0 && slotIndex < slots.length) {
        const toAdd = Math.min(totalQuantity, item.maxStack);
        slots[slotIndex].add(item.clone(), toAdd);
        totalQuantity -= toAdd;
        slotIndex++;
      }
    });
  }

  /**
   * Get number of empty slots
   */
  getEmptySlotCount() {
    return this.slots.filter(s => s.isEmpty()).length;
  }

  /**
   * Clear entire inventory
   */
  clear() {
    this.slots.forEach(s => s.clear());
    Object.keys(this.equipment).forEach(key => {
      this.equipment[key] = null;
    });
  }

  /**
   * Serialize for saving
   */
  toJSON() {
    return {
      capacity: this.capacity,
      maxWeight: this.maxWeight,
      slots: this.slots.map(s => s.toJSON()),
      equipment: {
        weapon: this.equipment.weapon?.toJSON() || null,
        tool: this.equipment.tool?.toJSON() || null,
        clothing: this.equipment.clothing?.toJSON() || null,
        backpack: this.equipment.backpack?.toJSON() || null
      }
    };
  }

  /**
   * Load from saved data
   */
  static fromJSON(data, itemDatabase) {
    const inventory = new Inventory(data.capacity, data.maxWeight);
    
    // Load slots
    data.slots.forEach((slotData, index) => {
      if (slotData) {
        const item = itemDatabase.get(slotData.itemId);
        if (item) {
          item.durability = slotData.durability ?? item.durability;
          inventory.slots[index].add(item, slotData.quantity);
        }
      }
    });
    
    // Load equipment
    Object.entries(data.equipment).forEach(([slot, itemData]) => {
      if (itemData) {
        const item = itemDatabase.get(itemData.id);
        if (item) {
          item.durability = itemData.durability ?? item.durability;
          inventory.equipment[slot] = item;
        }
      }
    });
    
    return inventory;
  }
}
