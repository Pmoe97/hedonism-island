import { Item } from '../modules/item.js';

/**
 * Item Database - Central registry for all items
 */
export class ItemDatabase {
  constructor() {
    this.items = new Map();
    this.loadItems();
  }

  /**
   * Load all item definitions
   */
  loadItems() {
    const itemDefinitions = this.getItemDefinitions();
    
    itemDefinitions.forEach(def => {
      this.items.set(def.id, def);
    });
    
    console.log(`Loaded ${this.items.size} items`);
  }

  /**
   * Get item by ID (returns a new instance)
   */
  get(itemId) {
    const def = this.items.get(itemId);
    if (!def) {
      console.error(`Item not found: ${itemId}`);
      return null;
    }
    return new Item(def);
  }

  /**
   * Check if item exists
   */
  has(itemId) {
    return this.items.has(itemId);
  }

  /**
   * Get all items of a type
   */
  getByType(type) {
    return Array.from(this.items.values())
      .filter(item => item.type === type)
      .map(def => new Item(def));
  }

  /**
   * Get all items of a category
   */
  getByCategory(category) {
    return Array.from(this.items.values())
      .filter(item => item.category === category)
      .map(def => new Item(def));
  }

  /**
   * Item definitions (will move to JSON file later)
   */
  getItemDefinitions() {
    return [
      // ===== CONSUMABLES - FOOD =====
      {
        id: 'coconut',
        name: 'Coconut',
        description: 'A fresh coconut. Sweet meat and refreshing water.',
        type: 'consumable',
        category: 'food',
        icon: 'items/coconut.png',
        stackable: true,
        maxStack: 10,
        weight: 2,
        consumable: true,
        effects: { hunger: 15, thirst: 10 },
        value: 2,
        rarity: 'common'
      },
      {
        id: 'berries',
        name: 'Berries',
        description: 'Sweet wild berries. A quick snack.',
        type: 'consumable',
        category: 'food',
        icon: 'items/berries.png',
        stackable: true,
        maxStack: 20,
        weight: 0.1,
        consumable: true,
        effects: { hunger: 5 },
        value: 1,
        rarity: 'common'
      },
      {
        id: 'cooked_fish',
        name: 'Cooked Fish',
        description: 'Freshly cooked fish. Delicious and nutritious.',
        type: 'consumable',
        category: 'food',
        icon: 'items/cooked_fish.png',
        stackable: true,
        maxStack: 10,
        weight: 1,
        consumable: true,
        effects: { hunger: 35, health: 5 },
        value: 5,
        rarity: 'common'
      },
      {
        id: 'raw_fish',
        name: 'Raw Fish',
        description: 'Uncooked fish. Should be cooked before eating.',
        type: 'consumable',
        category: 'food',
        icon: 'items/raw_fish.png',
        stackable: true,
        maxStack: 10,
        weight: 1,
        consumable: true,
        effects: { hunger: 10, health: -5 },
        value: 2,
        rarity: 'common'
      },
      {
        id: 'cooked_meat',
        name: 'Cooked Meat',
        description: 'Properly cooked meat. Very filling.',
        type: 'consumable',
        category: 'food',
        icon: 'items/cooked_meat.png',
        stackable: true,
        maxStack: 10,
        weight: 1.5,
        consumable: true,
        effects: { hunger: 45, health: 10 },
        value: 8,
        rarity: 'common'
      },

      // ===== CONSUMABLES - WATER =====
      {
        id: 'water_bottle',
        name: 'Water Bottle',
        description: 'Clean drinking water.',
        type: 'consumable',
        category: 'water',
        icon: 'items/water.png',
        stackable: true,
        maxStack: 5,
        weight: 1,
        consumable: true,
        effects: { thirst: 30 },
        value: 3,
        rarity: 'common'
      },
      {
        id: 'dirty_water',
        name: 'Dirty Water',
        description: 'Unfiltered water. Might make you sick.',
        type: 'consumable',
        category: 'water',
        icon: 'items/dirty_water.png',
        stackable: true,
        maxStack: 5,
        weight: 1,
        consumable: true,
        effects: { thirst: 15, health: -10 },
        value: 1,
        rarity: 'common'
      },

      // ===== CONSUMABLES - MEDICINE =====
      {
        id: 'bandage',
        name: 'Bandage',
        description: 'Stops bleeding and speeds healing.',
        type: 'consumable',
        category: 'medicine',
        icon: 'items/bandage.png',
        stackable: true,
        maxStack: 10,
        weight: 0.1,
        consumable: true,
        effects: { health: 20 },
        value: 10,
        rarity: 'common'
      },
      {
        id: 'herbal_remedy',
        name: 'Herbal Remedy',
        description: 'Native medicine made from island plants.',
        type: 'consumable',
        category: 'medicine',
        icon: 'items/herbs.png',
        stackable: true,
        maxStack: 5,
        weight: 0.2,
        consumable: true,
        effects: { health: 40, energy: 10 },
        value: 20,
        rarity: 'uncommon'
      },

      // ===== MATERIALS =====
      {
        id: 'wood',
        name: 'Wood',
        description: 'Sturdy wood for building and crafting.',
        type: 'material',
        category: 'wood',
        icon: 'items/wood.png',
        stackable: true,
        maxStack: 50,
        weight: 0.5,
        value: 1,
        rarity: 'common'
      },
      {
        id: 'stone',
        name: 'Stone',
        description: 'Hard stone for tools and construction.',
        type: 'material',
        category: 'stone',
        icon: 'items/stone.png',
        stackable: true,
        maxStack: 50,
        weight: 1,
        value: 1,
        rarity: 'common'
      },
      {
        id: 'fiber',
        name: 'Plant Fiber',
        description: 'Strong plant fibers for rope and cloth.',
        type: 'material',
        category: 'fiber',
        icon: 'items/fiber.png',
        stackable: true,
        maxStack: 50,
        weight: 0.2,
        value: 1,
        rarity: 'common'
      },
      {
        id: 'leather',
        name: 'Leather',
        description: 'Tanned animal hide. Useful for crafting.',
        type: 'material',
        category: 'leather',
        icon: 'items/leather.png',
        stackable: true,
        maxStack: 20,
        weight: 0.8,
        value: 5,
        rarity: 'uncommon'
      },
      {
        id: 'metal_scrap',
        name: 'Metal Scrap',
        description: 'Salvaged metal. Can be worked into tools.',
        type: 'material',
        category: 'metal',
        icon: 'items/metal.png',
        stackable: true,
        maxStack: 20,
        weight: 2,
        value: 10,
        rarity: 'uncommon'
      },
      {
        id: 'rope',
        name: 'Rope',
        description: 'Strong rope made from plant fibers.',
        type: 'material',
        category: 'rope',
        icon: 'items/rope.png',
        stackable: true,
        maxStack: 20,
        weight: 0.5,
        value: 3,
        rarity: 'common'
      },
      {
        id: 'cloth',
        name: 'Cloth',
        description: 'Woven plant fiber cloth.',
        type: 'material',
        category: 'cloth',
        icon: 'items/cloth.png',
        stackable: true,
        maxStack: 20,
        weight: 0.3,
        value: 4,
        rarity: 'common'
      },
      {
        id: 'raw_meat',
        name: 'Raw Meat',
        description: 'Uncooked meat. Should be cooked before eating.',
        type: 'consumable',
        category: 'food',
        icon: 'items/raw_meat.png',
        stackable: true,
        maxStack: 10,
        weight: 1.5,
        consumable: true,
        effects: { hunger: 15, health: -8 },
        value: 3,
        rarity: 'common'
      },

      // ===== TOOLS =====
      {
        id: 'stone_axe',
        name: 'Stone Axe',
        description: 'A crude but effective axe for chopping wood.',
        type: 'tool',
        category: 'axe',
        icon: 'items/stone_axe.png',
        stackable: false,
        weight: 3,
        equippable: true,
        durability: 100,
        maxDurability: 100,
        effects: { woodcutting: 2, damage: 5 },
        value: 10,
        rarity: 'common'
      },
      {
        id: 'stone_pickaxe',
        name: 'Stone Pickaxe',
        description: 'Break rocks and mine stone.',
        type: 'tool',
        category: 'pickaxe',
        icon: 'items/stone_pickaxe.png',
        stackable: false,
        weight: 4,
        equippable: true,
        durability: 80,
        maxDurability: 80,
        effects: { mining: 2, damage: 4 },
        value: 12,
        rarity: 'common'
      },
      {
        id: 'knife',
        name: 'Knife',
        description: 'A sharp knife for cutting and crafting.',
        type: 'tool',
        category: 'knife',
        icon: 'items/knife.png',
        stackable: false,
        weight: 0.5,
        equippable: true,
        durability: 150,
        maxDurability: 150,
        effects: { crafting: 1, damage: 6 },
        value: 15,
        rarity: 'common'
      },
      {
        id: 'fishing_rod',
        name: 'Fishing Rod',
        description: 'Catch fish more easily.',
        type: 'tool',
        category: 'fishing',
        icon: 'items/fishing_rod.png',
        stackable: false,
        weight: 1,
        equippable: true,
        durability: 50,
        maxDurability: 50,
        effects: { fishing: 3 },
        value: 20,
        rarity: 'common'
      },

      // ===== WEAPONS =====
      {
        id: 'stone_spear',
        name: 'Stone Spear',
        description: 'A sharp spear for hunting and combat.',
        type: 'weapon',
        category: 'spear',
        icon: 'items/stone_spear.png',
        stackable: false,
        weight: 2,
        equippable: true,
        durability: 50,
        maxDurability: 50,
        effects: { damage: 10 },
        value: 15,
        rarity: 'common'
      },
      {
        id: 'wooden_club',
        name: 'Wooden Club',
        description: 'A heavy club for bashing.',
        type: 'weapon',
        category: 'club',
        icon: 'items/club.png',
        stackable: false,
        weight: 3,
        equippable: true,
        durability: 60,
        maxDurability: 60,
        effects: { damage: 8 },
        value: 8,
        rarity: 'common'
      },
      {
        id: 'bow',
        name: 'Hunting Bow',
        description: 'A ranged weapon for hunting.',
        type: 'weapon',
        category: 'bow',
        icon: 'items/bow.png',
        stackable: false,
        weight: 1.5,
        equippable: true,
        durability: 100,
        maxDurability: 100,
        effects: { damage: 12, range: 10 },
        value: 30,
        rarity: 'uncommon'
      },

      // ===== EQUIPMENT =====
      {
        id: 'cloth_shirt',
        name: 'Cloth Shirt',
        description: 'Basic clothing. Provides minimal protection.',
        type: 'equipment',
        category: 'clothing',
        icon: 'items/cloth_shirt.png',
        stackable: false,
        weight: 0.5,
        equippable: true,
        effects: { defense: 1 },
        value: 5,
        rarity: 'common'
      },
      {
        id: 'leather_vest',
        name: 'Leather Vest',
        description: 'Sturdy leather protection.',
        type: 'equipment',
        category: 'clothing',
        icon: 'items/leather_vest.png',
        stackable: false,
        weight: 2,
        equippable: true,
        effects: { defense: 5 },
        value: 25,
        rarity: 'uncommon'
      },
      {
        id: 'leather_backpack',
        name: 'Leather Backpack',
        description: 'Increases carrying capacity by 10 slots.',
        type: 'equipment',
        category: 'backpack',
        icon: 'items/backpack.png',
        stackable: false,
        weight: 2,
        equippable: true,
        effects: { capacity: 10 },
        value: 50,
        rarity: 'uncommon'
      },
      {
        id: 'waterskin',
        name: 'Waterskin',
        description: 'Carry water with you.',
        type: 'equipment',
        category: 'container',
        icon: 'items/waterskin.png',
        stackable: false,
        weight: 0.5,
        equippable: false,
        usable: true,
        value: 15,
        rarity: 'common'
      }
    ];
  }
}

// Create singleton instance
export const itemDB = new ItemDatabase();
