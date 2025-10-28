# 🎒 Inventory & Resource System Design

## Overview

Complete inventory management system for Hedonism Island, including resources, items, equipment, consumables, and storage.

---

## Core Systems

### 1. Item Types

#### Consumables
- **Food** - Restores hunger, some restore health
- **Water** - Restores thirst
- **Medicine** - Restores health, cures status effects
- **Drugs** - Temporary buffs/debuffs (alcohol, native substances)

#### Materials
- **Wood** - Building, crafting, fuel
- **Stone** - Building, tools, weapons
- **Fiber** - Rope, cloth, binding
- **Metal** - Advanced tools, weapons
- **Herbs** - Medicine crafting

#### Tools
- **Axe** - Chop wood faster, bonus damage
- **Pickaxe** - Mine stone faster
- **Knife** - Harvest resources, craft, combat
- **Fishing Rod** - Catch fish easier
- **Torch** - Light, ward off predators

#### Weapons
- **Spear** - Melee weapon
- **Bow** - Ranged weapon
- **Club** - Melee weapon
- **Gun** - Rare, powerful, limited ammo

#### Equipment
- **Clothing** - Protection, environmental resistance
- **Backpack** - Increases carry capacity
- **Waterskin** - Store water portably

#### Special Items
- **Quest Items** - Story-related
- **Artifacts** - Native cultural items
- **Treasure** - Gold, gems, valuables

---

## Data Structure

```javascript
class Item {
  constructor(data) {
    // Basic Properties
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.type = data.type; // 'consumable', 'material', 'tool', 'weapon', 'equipment'
    this.category = data.category; // 'food', 'wood', 'axe', etc.
    
    // Visual
    this.icon = data.icon; // Image path
    this.sprite = data.sprite; // World sprite
    
    // Inventory Properties
    this.stackable = data.stackable || false;
    this.maxStack = data.maxStack || 1;
    this.weight = data.weight || 1;
    
    // Usage Properties
    this.consumable = data.consumable || false;
    this.equippable = data.equippable || false;
    this.usable = data.usable || false;
    
    // Effects
    this.effects = data.effects || {}; // { hunger: 20, health: 10 }
    this.durability = data.durability || null; // Tools degrade
    this.maxDurability = data.maxDurability || null;
    
    // Value
    this.value = data.value || 0; // For trading
    this.rarity = data.rarity || 'common'; // common, uncommon, rare, legendary
    
    // Requirements
    this.requirements = data.requirements || {}; // { skill: 'crafting', level: 2 }
  }
  
  use(player) {
    if (!this.usable && !this.consumable) return false;
    
    if (this.consumable) {
      // Apply effects to player
      Object.entries(this.effects).forEach(([stat, value]) => {
        player.modifyStat(stat, value);
      });
      
      return true; // Item consumed
    }
    
    if (this.usable) {
      // Special use behavior (tools, quest items, etc.)
      return this.onUse(player);
    }
  }
  
  canStack(otherItem) {
    return this.stackable && 
           this.id === otherItem.id && 
           this.durability === otherItem.durability;
  }
}

class InventorySlot {
  constructor() {
    this.item = null;
    this.quantity = 0;
  }
  
  add(item, quantity = 1) {
    if (!this.item) {
      this.item = item;
      this.quantity = quantity;
      return 0; // All added
    }
    
    if (this.item.canStack(item)) {
      const space = this.item.maxStack - this.quantity;
      const toAdd = Math.min(space, quantity);
      this.quantity += toAdd;
      return quantity - toAdd; // Remainder
    }
    
    return quantity; // Can't add
  }
  
  remove(quantity = 1) {
    const removed = Math.min(this.quantity, quantity);
    this.quantity -= removed;
    
    if (this.quantity <= 0) {
      this.item = null;
      this.quantity = 0;
    }
    
    return removed;
  }
  
  isEmpty() {
    return this.item === null || this.quantity <= 0;
  }
}

class Inventory {
  constructor(capacity = 20) {
    this.slots = [];
    this.capacity = capacity;
    this.maxWeight = 100;
    
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
  
  addItem(item, quantity = 1) {
    let remaining = quantity;
    
    // Try to stack with existing items first
    if (item.stackable) {
      for (let slot of this.slots) {
        if (slot.item && slot.item.canStack(item)) {
          remaining = slot.add(item, remaining);
          if (remaining === 0) return true;
        }
      }
    }
    
    // Add to empty slots
    while (remaining > 0) {
      const emptySlot = this.slots.find(s => s.isEmpty());
      if (!emptySlot) {
        console.warn('Inventory full!');
        return false;
      }
      
      const toAdd = item.stackable ? Math.min(remaining, item.maxStack) : 1;
      emptySlot.add(item, toAdd);
      remaining -= toAdd;
    }
    
    return true;
  }
  
  removeItem(itemId, quantity = 1) {
    let remaining = quantity;
    
    for (let slot of this.slots) {
      if (slot.item && slot.item.id === itemId) {
        const removed = slot.remove(remaining);
        remaining -= removed;
        if (remaining === 0) return true;
      }
    }
    
    return remaining < quantity; // Partial success
  }
  
  hasItem(itemId, quantity = 1) {
    return this.getItemCount(itemId) >= quantity;
  }
  
  getItemCount(itemId) {
    return this.slots
      .filter(s => s.item && s.item.id === itemId)
      .reduce((sum, s) => sum + s.quantity, 0);
  }
  
  getTotalWeight() {
    return this.slots
      .filter(s => !s.isEmpty())
      .reduce((sum, s) => sum + (s.item.weight * s.quantity), 0);
  }
  
  isFull() {
    return this.slots.every(s => !s.isEmpty());
  }
  
  equip(item, slot) {
    if (!item.equippable) return false;
    
    // Unequip current item
    if (this.equipment[slot]) {
      this.addItem(this.equipment[slot]);
    }
    
    // Equip new item
    this.equipment[slot] = item;
    this.removeItem(item.id, 1);
    
    return true;
  }
  
  unequip(slot) {
    if (!this.equipment[slot]) return false;
    
    const item = this.equipment[slot];
    this.equipment[slot] = null;
    return this.addItem(item);
  }
}
```

---

## Item Definitions (JSON)

```json
{
  "coconut": {
    "id": "coconut",
    "name": "Coconut",
    "description": "A fresh coconut. Eat the meat or drink the water.",
    "type": "consumable",
    "category": "food",
    "icon": "items/coconut.png",
    "stackable": true,
    "maxStack": 10,
    "weight": 2,
    "consumable": true,
    "effects": {
      "hunger": 15,
      "thirst": 10
    },
    "value": 2,
    "rarity": "common"
  },
  
  "water_bottle": {
    "id": "water_bottle",
    "name": "Water Bottle",
    "description": "Clean drinking water.",
    "type": "consumable",
    "category": "water",
    "icon": "items/water.png",
    "stackable": true,
    "maxStack": 5,
    "weight": 1,
    "consumable": true,
    "effects": {
      "thirst": 30
    },
    "value": 3,
    "rarity": "common"
  },
  
  "cooked_fish": {
    "id": "cooked_fish",
    "name": "Cooked Fish",
    "description": "Freshly cooked fish. Delicious and nutritious.",
    "type": "consumable",
    "category": "food",
    "icon": "items/cooked_fish.png",
    "stackable": true,
    "maxStack": 10,
    "weight": 1,
    "consumable": true,
    "effects": {
      "hunger": 35,
      "health": 5
    },
    "value": 5,
    "rarity": "common"
  },
  
  "wood": {
    "id": "wood",
    "name": "Wood",
    "description": "Sturdy wood for building and crafting.",
    "type": "material",
    "category": "wood",
    "icon": "items/wood.png",
    "stackable": true,
    "maxStack": 50,
    "weight": 0.5,
    "value": 1,
    "rarity": "common"
  },
  
  "stone": {
    "id": "stone",
    "name": "Stone",
    "description": "Hard stone for tools and construction.",
    "type": "material",
    "category": "stone",
    "icon": "items/stone.png",
    "stackable": true,
    "maxStack": 50,
    "weight": 1,
    "value": 1,
    "rarity": "common"
  },
  
  "fiber": {
    "id": "fiber",
    "name": "Plant Fiber",
    "description": "Strong plant fibers for rope and cloth.",
    "type": "material",
    "category": "fiber",
    "icon": "items/fiber.png",
    "stackable": true,
    "maxStack": 50,
    "weight": 0.2,
    "value": 1,
    "rarity": "common"
  },
  
  "stone_axe": {
    "id": "stone_axe",
    "name": "Stone Axe",
    "description": "A crude but effective axe for chopping wood.",
    "type": "tool",
    "category": "axe",
    "icon": "items/stone_axe.png",
    "stackable": false,
    "weight": 3,
    "equippable": true,
    "durability": 100,
    "maxDurability": 100,
    "effects": {
      "woodcutting": 2
    },
    "value": 10,
    "rarity": "common"
  },
  
  "stone_spear": {
    "id": "stone_spear",
    "name": "Stone Spear",
    "description": "A sharp spear for hunting and combat.",
    "type": "weapon",
    "category": "spear",
    "icon": "items/stone_spear.png",
    "stackable": false,
    "weight": 2,
    "equippable": true,
    "durability": 50,
    "maxDurability": 50,
    "effects": {
      "damage": 10
    },
    "value": 15,
    "rarity": "common"
  },
  
  "leather_backpack": {
    "id": "leather_backpack",
    "name": "Leather Backpack",
    "description": "Increases carrying capacity by 10 slots.",
    "type": "equipment",
    "category": "backpack",
    "icon": "items/backpack.png",
    "stackable": false,
    "weight": 2,
    "equippable": true,
    "effects": {
      "capacity": 10
    },
    "value": 50,
    "rarity": "uncommon"
  }
}
```

---

## UI Design

### Inventory Screen

```
╔════════════════════════════════════════════════╗
║             INVENTORY                          ║
╠════════════════════════════════════════════════╣
║                                                ║
║  [Equipment]                    [Backpack]     ║
║  ┌──────┐                      ┌─┬─┬─┬─┬─┐    ║
║  │Weapon│                      │▓│▓│ │ │▓│    ║
║  └──────┘                      ├─┼─┼─┼─┼─┤    ║
║  ┌──────┐                      │▓│ │▓│ │ │    ║
║  │ Tool │                      ├─┼─┼─┼─┼─┤    ║
║  └──────┘                      │ │ │ │▓│ │    ║
║  ┌──────┐                      ├─┼─┼─┼─┼─┤    ║
║  │Cloth │                      │▓│ │ │ │▓│    ║
║  └──────┘                      └─┴─┴─┴─┴─┘    ║
║  ┌──────┐                                     ║
║  │ Bag  │                      [20/30 slots]  ║
║  └──────┘                      [45/100 lbs]   ║
║                                                ║
╠════════════════════════════════════════════════╣
║ Selected: Coconut                              ║
║ A fresh coconut. Eat the meat or drink.       ║
║                                                ║
║ [Use] [Drop] [Split Stack] [Close]            ║
╚════════════════════════════════════════════════╝
```

### Item Tooltip

```
┌────────────────────────┐
│ Cooked Fish            │
│ ★★☆☆☆ Common          │
├────────────────────────┤
│ A delicious meal.      │
│                        │
│ Effects:               │
│ + Hunger: +35          │
│ + Health: +5           │
│                        │
│ Weight: 1 lb           │
│ Value: 5 coins         │
│ Stack: 3/10            │
└────────────────────────┘
```

---

## Resource Gathering

### Gathering Points

```javascript
class ResourceNode {
  constructor(data) {
    this.id = data.id;
    this.type = data.type; // 'tree', 'rock', 'bush', 'water'
    this.position = data.position;
    this.resource = data.resource; // Item ID
    this.quantity = data.quantity || 3;
    this.maxQuantity = data.maxQuantity || 3;
    this.regenTime = data.regenTime || 86400; // Seconds (24 hours)
    this.lastHarvest = null;
    this.depleted = false;
    
    // Tool requirements
    this.requiredTool = data.requiredTool || null; // 'axe', 'pickaxe', null
    this.baseTime = data.baseTime || 3; // Seconds to gather
  }
  
  canHarvest(player) {
    if (this.depleted) return false;
    if (this.requiredTool && !player.hasTool(this.requiredTool)) return false;
    return true;
  }
  
  harvest(player) {
    if (!this.canHarvest(player)) return null;
    
    // Calculate harvest time based on tool
    const tool = player.getEquippedTool(this.requiredTool);
    const timeMultiplier = tool ? tool.effects.speed || 1 : 1;
    const harvestTime = this.baseTime / timeMultiplier;
    
    // Yield varies based on tool quality
    const yieldMultiplier = tool ? tool.effects.yield || 1 : 0.5;
    const amount = Math.ceil(1 * yieldMultiplier);
    
    // Deplete resource
    this.quantity -= 1;
    if (this.quantity <= 0) {
      this.depleted = true;
      this.lastHarvest = Date.now();
    }
    
    // Damage tool
    if (tool) {
      tool.durability -= 1;
      if (tool.durability <= 0) {
        player.breakTool(tool);
      }
    }
    
    return {
      item: this.resource,
      quantity: amount,
      time: harvestTime
    };
  }
  
  update(deltaTime) {
    if (this.depleted && this.lastHarvest) {
      const elapsed = Date.now() - this.lastHarvest;
      if (elapsed >= this.regenTime * 1000) {
        this.quantity = this.maxQuantity;
        this.depleted = false;
        this.lastHarvest = null;
      }
    }
  }
}
```

### Resource Types

```json
{
  "palm_tree": {
    "id": "palm_tree",
    "type": "tree",
    "resource": "wood",
    "quantity": 5,
    "maxQuantity": 5,
    "regenTime": 172800,
    "requiredTool": "axe",
    "baseTime": 5,
    "sprite": "trees/palm.png"
  },
  
  "coconut_tree": {
    "id": "coconut_tree",
    "type": "tree",
    "resource": "coconut",
    "quantity": 3,
    "maxQuantity": 3,
    "regenTime": 86400,
    "requiredTool": null,
    "baseTime": 2,
    "sprite": "trees/coconut.png"
  },
  
  "rock_node": {
    "id": "rock_node",
    "type": "rock",
    "resource": "stone",
    "quantity": 10,
    "maxQuantity": 10,
    "regenTime": 259200,
    "requiredTool": "pickaxe",
    "baseTime": 4,
    "sprite": "rocks/stone.png"
  },
  
  "berry_bush": {
    "id": "berry_bush",
    "type": "bush",
    "resource": "berries",
    "quantity": 5,
    "maxQuantity": 5,
    "regenTime": 43200,
    "requiredTool": null,
    "baseTime": 1,
    "sprite": "plants/berry_bush.png"
  },
  
  "freshwater_spring": {
    "id": "freshwater_spring",
    "type": "water",
    "resource": "water_bottle",
    "quantity": 999,
    "maxQuantity": 999,
    "regenTime": 0,
    "requiredTool": null,
    "baseTime": 2,
    "sprite": "terrain/spring.png"
  }
}
```

---

## Storage System

### Storage Container

```javascript
class StorageContainer {
  constructor(capacity = 40, maxWeight = 200) {
    this.inventory = new Inventory(capacity);
    this.inventory.maxWeight = maxWeight;
    this.isOpen = false;
    this.name = "Storage";
  }
  
  open(player) {
    this.isOpen = true;
    // Show UI with both player inventory and storage
  }
  
  close() {
    this.isOpen = false;
  }
  
  transfer(fromInventory, toInventory, slotIndex, quantity) {
    const slot = fromInventory.slots[slotIndex];
    if (slot.isEmpty()) return false;
    
    const item = slot.item;
    const amount = Math.min(slot.quantity, quantity);
    
    if (toInventory.addItem(item, amount)) {
      fromInventory.slots[slotIndex].remove(amount);
      return true;
    }
    
    return false;
  }
}
```

### Storage Types

- **Wooden Chest** - 40 slots, 200 lbs, craftable
- **Barrel** - 20 slots, 100 lbs, craftable
- **Campfire** - Special storage for cooking materials
- **Weapon Rack** - 10 slots, weapons only
- **Wardrobe** - 15 slots, clothing only

---

## Crafting Integration

### Recipe System

```javascript
class Recipe {
  constructor(data) {
    this.id = data.id;
    this.result = data.result; // { itemId: 'stone_axe', quantity: 1 }
    this.ingredients = data.ingredients; // [{ itemId: 'stone', quantity: 3 }, ...]
    this.station = data.station || null; // 'campfire', 'workbench', null
    this.skill = data.skill || null; // Required skill
    this.skillLevel = data.skillLevel || 0;
    this.time = data.time || 5; // Seconds to craft
  }
  
  canCraft(player) {
    // Check ingredients
    for (let ingredient of this.ingredients) {
      if (!player.inventory.hasItem(ingredient.itemId, ingredient.quantity)) {
        return false;
      }
    }
    
    // Check skill
    if (this.skill && player.getSkillLevel(this.skill) < this.skillLevel) {
      return false;
    }
    
    // Check station
    if (this.station && !player.nearStation(this.station)) {
      return false;
    }
    
    return true;
  }
  
  craft(player) {
    if (!this.canCraft(player)) return false;
    
    // Remove ingredients
    for (let ingredient of this.ingredients) {
      player.inventory.removeItem(ingredient.itemId, ingredient.quantity);
    }
    
    // Add result
    player.inventory.addItem(
      ItemDatabase.get(this.result.itemId),
      this.result.quantity
    );
    
    // Grant experience
    if (this.skill) {
      player.addSkillXP(this.skill, 10);
    }
    
    return true;
  }
}
```

---

## Implementation Priority

### Phase 1: Basic Inventory (Week 1)
- [ ] Item class
- [ ] Inventory class with slots
- [ ] Add/remove/stack items
- [ ] Simple UI (list view)
- [ ] Use consumables

### Phase 2: Resources (Week 2)
- [ ] Resource nodes
- [ ] Gathering mechanic
- [ ] Tool system
- [ ] Durability
- [ ] Resource regeneration

### Phase 3: Equipment (Week 3)
- [ ] Equipment slots
- [ ] Equip/unequip
- [ ] Tool bonuses
- [ ] Weapon stats
- [ ] Visual equipment changes

### Phase 4: Storage (Week 4)
- [ ] Storage containers
- [ ] Transfer UI
- [ ] Persistent storage
- [ ] Container types

### Phase 5: Polish
- [ ] Drag and drop
- [ ] Item tooltips
- [ ] Sorting/filtering
- [ ] Quick slots
- [ ] Auto-pickup toggle

---

## Next Steps

1. Implement Item and Inventory classes
2. Create item database (JSON)
3. Build basic inventory UI
4. Add gathering mechanics
5. Test with placeholder graphics

Ready to start coding?
