/**
 * Recipe System for Crafting
 * Defines recipes with ingredients, outputs, requirements, and bonuses
 */

export class Recipe {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description || '';
    this.category = data.category; // 'tools', 'weapons', 'equipment', 'consumables', 'materials', 'shelter'
    
    // What's needed to craft
    this.ingredients = data.ingredients || []; // [{ itemId: 'wood', quantity: 5 }]
    this.requiredTool = data.requiredTool || null; // 'knife', 'axe', etc.
    this.requiredSkill = data.requiredSkill || null; // 'crafting', 'woodcutting', etc.
    this.minimumSkillLevel = data.minimumSkillLevel || 0;
    this.requiredStation = data.requiredStation || null; // 'workbench', 'forge', etc.
    
    // What you get
    this.output = data.output || []; // [{ itemId: 'stone_axe', quantity: 1 }]
    
    // Crafting properties
    this.craftTime = data.craftTime || 5000; // milliseconds
    this.energyCost = data.energyCost || 10;
    this.difficulty = data.difficulty || 'easy'; // 'easy', 'medium', 'hard', 'expert'
    
    // Unlocking
    this.unlocked = data.unlocked !== false; // Default unlocked
    this.unlockConditions = data.unlockConditions || null; // { skill: 'crafting', level: 10 }
    
    // Experience and quality
    this.baseXP = data.baseXP || 10;
    this.qualityEnabled = data.qualityEnabled !== false;
    
    // Visual
    this.icon = data.icon || 'recipes/default.png';
  }

  /**
   * Check if player can craft this recipe
   */
  canCraft(player) {
    // Check if unlocked
    if (!this.unlocked) {
      return { success: false, reason: 'Recipe not unlocked' };
    }

    // Check unlock conditions
    if (this.unlockConditions) {
      if (this.unlockConditions.skill) {
        const skillLevel = player.getEffectiveSkill(this.unlockConditions.skill);
        if (skillLevel < this.unlockConditions.level) {
          return { 
            success: false, 
            reason: `Requires ${this.unlockConditions.skill} level ${this.unlockConditions.level}`
          };
        }
      }
    }

    // Check energy
    if (player.stats.energy < this.energyCost) {
      return { success: false, reason: 'Not enough energy' };
    }

    // Check skill requirement
    if (this.requiredSkill && this.minimumSkillLevel > 0) {
      const skillLevel = player.getEffectiveSkill(this.requiredSkill);
      if (skillLevel < this.minimumSkillLevel) {
        return { 
          success: false, 
          reason: `Requires ${this.requiredSkill} level ${this.minimumSkillLevel}`
        };
      }
    }

    // Check ingredients
    for (const ingredient of this.ingredients) {
      const count = player.inventory.getItemCount(ingredient.itemId);
      if (count < ingredient.quantity) {
        return { 
          success: false, 
          reason: `Need ${ingredient.quantity}x ${ingredient.itemId} (have ${count})`
        };
      }
    }

    // Check required tool
    if (this.requiredTool) {
      const hasTool = this.checkPlayerHasTool(player, this.requiredTool);
      if (!hasTool) {
        return { success: false, reason: `Requires ${this.requiredTool}` };
      }
    }

    // Check crafting station (TODO: implement stations)
    if (this.requiredStation) {
      // For now, just pass - stations not implemented yet
      // return { success: false, reason: `Requires ${this.requiredStation}` };
    }

    return { success: true };
  }

  /**
   * Check if player has required tool equipped
   */
  checkPlayerHasTool(player, toolType) {
    const equipped = player.inventory.equipment;
    const weapon = equipped.weapon;
    const tool = equipped.tool;

    if (toolType === 'axe') {
      return weapon?.category === 'axe' || tool?.category === 'axe';
    }
    if (toolType === 'pickaxe') {
      return weapon?.category === 'pickaxe' || tool?.category === 'pickaxe';
    }
    if (toolType === 'knife') {
      return weapon?.category === 'knife' || tool?.category === 'knife';
    }
    if (toolType === 'hammer') {
      return weapon?.category === 'hammer' || tool?.category === 'hammer';
    }

    return false;
  }

  /**
   * Get the equipped tool being used
   */
  getEquippedTool(player) {
    const equipped = player.inventory.equipment;
    
    if (this.requiredTool === 'axe') {
      return equipped.weapon?.category === 'axe' ? equipped.weapon : equipped.tool;
    }
    if (this.requiredTool === 'pickaxe') {
      return equipped.weapon?.category === 'pickaxe' ? equipped.weapon : equipped.tool;
    }
    if (this.requiredTool === 'knife') {
      return equipped.weapon?.category === 'knife' ? equipped.weapon : equipped.tool;
    }
    if (this.requiredTool === 'hammer') {
      return equipped.weapon?.category === 'hammer' ? equipped.weapon : equipped.tool;
    }

    return null;
  }

  /**
   * Craft the item
   */
  craft(player) {
    const canCraft = this.canCraft(player);
    if (!canCraft.success) {
      return {
        success: false,
        reason: canCraft.reason
      };
    }

    // Remove ingredients
    for (const ingredient of this.ingredients) {
      player.inventory.removeItem(ingredient.itemId, ingredient.quantity);
    }

    // Consume energy
    player.stats.energy -= this.energyCost;

    // Damage tool if required
    if (this.requiredTool) {
      const tool = this.getEquippedTool(player);
      if (tool && tool.durability !== null) {
        tool.damage(2); // Crafting uses more durability
        if (tool.durability <= 0) {
          console.log(`${tool.name} broke while crafting!`);
        }
      }
    }

    // Calculate quality (if enabled)
    const quality = this.qualityEnabled ? this.calculateQuality(player) : 'normal';

    // Create output items
    const createdItems = [];
    for (const output of this.output) {
      const item = window.itemDB.get(output.itemId);
      if (item) {
        // Apply quality bonuses
        if (quality === 'excellent') {
          if (item.durability) item.maxDurability = Math.floor(item.maxDurability * 1.5);
          if (item.effects) {
            Object.keys(item.effects).forEach(key => {
              item.effects[key] = Math.floor(item.effects[key] * 1.2);
            });
          }
        } else if (quality === 'good') {
          if (item.durability) item.maxDurability = Math.floor(item.maxDurability * 1.25);
          if (item.effects) {
            Object.keys(item.effects).forEach(key => {
              item.effects[key] = Math.floor(item.effects[key] * 1.1);
            });
          }
        } else if (quality === 'poor') {
          if (item.durability) item.maxDurability = Math.floor(item.maxDurability * 0.75);
        }

        // Reset current durability to max
        if (item.durability !== null) {
          item.durability = item.maxDurability;
        }

        const added = player.inventory.addItem(item, output.quantity);
        if (added) {
          createdItems.push({ item, quantity: output.quantity, quality });
        }
      }
    }

    // Grant XP
    if (this.requiredSkill) {
      const xpBonus = quality === 'excellent' ? 1.5 : quality === 'good' ? 1.2 : 1.0;
      const xpGained = Math.floor(this.baseXP * xpBonus);
      player.gainSkillXP(this.requiredSkill, xpGained);
    }

    return {
      success: true,
      items: createdItems,
      quality,
      xpGained: this.requiredSkill ? this.baseXP : 0
    };
  }

  /**
   * Calculate crafting quality based on skill
   */
  calculateQuality(player) {
    if (!this.requiredSkill) return 'normal';

    const skillLevel = player.getEffectiveSkill(this.requiredSkill);
    const roll = Math.random() * 100;

    // Higher skill = better chance of quality
    const excellentThreshold = Math.max(0, skillLevel - 50); // 50+ skill for excellent
    const goodThreshold = Math.max(0, skillLevel - 20); // 20+ skill for good
    const poorThreshold = Math.max(0, 100 - skillLevel); // Low skill = risk of poor

    if (roll < excellentThreshold) return 'excellent';
    if (roll < goodThreshold) return 'good';
    if (roll > 100 - poorThreshold && skillLevel < 30) return 'poor';
    
    return 'normal';
  }

  /**
   * Get difficulty color
   */
  getDifficultyColor() {
    const colors = {
      easy: '#4ade80',
      medium: '#fbbf24',
      hard: '#f97316',
      expert: '#dc2626'
    };
    return colors[this.difficulty] || colors.easy;
  }

  /**
   * Serialize for saving
   */
  toJSON() {
    return {
      id: this.id,
      unlocked: this.unlocked
    };
  }
}

/**
 * Recipe Database
 * Central registry of all crafting recipes
 */
export class RecipeDatabase {
  constructor() {
    this.recipes = new Map();
    this.loadRecipes();
  }

  /**
   * Load all recipe definitions
   */
  loadRecipes() {
    const recipeDefinitions = this.getRecipeDefinitions();
    recipeDefinitions.forEach(def => {
      this.recipes.set(def.id, new Recipe(def));
    });
    console.log(`📋 Loaded ${this.recipes.size} recipes`);
  }

  /**
   * Get recipe by ID
   */
  get(recipeId) {
    return this.recipes.get(recipeId) || null;
  }

  /**
   * Get all recipes
   */
  getAll() {
    return Array.from(this.recipes.values());
  }

  /**
   * Get recipes by category
   */
  getByCategory(category) {
    return Array.from(this.recipes.values())
      .filter(recipe => recipe.category === category);
  }

  /**
   * Get craftable recipes (player can make)
   */
  getCraftable(player) {
    return Array.from(this.recipes.values())
      .filter(recipe => recipe.canCraft(player).success);
  }

  /**
   * Get unlocked recipes
   */
  getUnlocked() {
    return Array.from(this.recipes.values())
      .filter(recipe => recipe.unlocked);
  }

  /**
   * Recipe definitions
   */
  getRecipeDefinitions() {
    return [
      // ===== BASIC TOOLS =====
      {
        id: 'stone_axe',
        name: 'Stone Axe',
        description: 'A crude but effective axe for chopping wood.',
        category: 'tools',
        ingredients: [
          { itemId: 'wood', quantity: 3 },
          { itemId: 'stone', quantity: 2 },
          { itemId: 'fiber', quantity: 2 }
        ],
        output: [{ itemId: 'stone_axe', quantity: 1 }],
        requiredSkill: 'crafting',
        minimumSkillLevel: 0,
        craftTime: 8000,
        energyCost: 10,
        difficulty: 'easy',
        baseXP: 15
      },

      {
        id: 'stone_pickaxe',
        name: 'Stone Pickaxe',
        description: 'Break rocks and mine stone.',
        category: 'tools',
        ingredients: [
          { itemId: 'wood', quantity: 3 },
          { itemId: 'stone', quantity: 3 },
          { itemId: 'fiber', quantity: 2 }
        ],
        output: [{ itemId: 'stone_pickaxe', quantity: 1 }],
        requiredSkill: 'crafting',
        minimumSkillLevel: 0,
        craftTime: 8000,
        energyCost: 10,
        difficulty: 'easy',
        baseXP: 15
      },

      {
        id: 'crude_knife',
        name: 'Crude Knife',
        description: 'A sharp knife for cutting and crafting.',
        category: 'tools',
        ingredients: [
          { itemId: 'stone', quantity: 2 },
          { itemId: 'wood', quantity: 1 },
          { itemId: 'fiber', quantity: 1 }
        ],
        output: [{ itemId: 'knife', quantity: 1 }],
        requiredSkill: 'crafting',
        minimumSkillLevel: 0,
        craftTime: 5000,
        energyCost: 8,
        difficulty: 'easy',
        baseXP: 12
      },

      {
        id: 'fishing_rod',
        name: 'Fishing Rod',
        description: 'Catch fish more easily.',
        category: 'tools',
        ingredients: [
          { itemId: 'wood', quantity: 2 },
          { itemId: 'fiber', quantity: 5 }
        ],
        output: [{ itemId: 'fishing_rod', quantity: 1 }],
        requiredSkill: 'crafting',
        minimumSkillLevel: 5,
        craftTime: 6000,
        energyCost: 8,
        difficulty: 'easy',
        baseXP: 18
      },

      // ===== WEAPONS =====
      {
        id: 'stone_spear',
        name: 'Stone Spear',
        description: 'A sharp spear for hunting and combat.',
        category: 'weapons',
        ingredients: [
          { itemId: 'wood', quantity: 2 },
          { itemId: 'stone', quantity: 1 },
          { itemId: 'fiber', quantity: 2 }
        ],
        output: [{ itemId: 'stone_spear', quantity: 1 }],
        requiredSkill: 'crafting',
        minimumSkillLevel: 0,
        craftTime: 7000,
        energyCost: 10,
        difficulty: 'easy',
        baseXP: 15
      },

      {
        id: 'wooden_club',
        name: 'Wooden Club',
        description: 'A heavy club for bashing.',
        category: 'weapons',
        ingredients: [
          { itemId: 'wood', quantity: 4 },
          { itemId: 'fiber', quantity: 1 }
        ],
        output: [{ itemId: 'wooden_club', quantity: 1 }],
        requiredSkill: 'crafting',
        minimumSkillLevel: 0,
        craftTime: 5000,
        energyCost: 8,
        difficulty: 'easy',
        baseXP: 12
      },

      {
        id: 'bow',
        name: 'Hunting Bow',
        description: 'A ranged weapon for hunting.',
        category: 'weapons',
        ingredients: [
          { itemId: 'wood', quantity: 3 },
          { itemId: 'fiber', quantity: 8 }
        ],
        output: [{ itemId: 'bow', quantity: 1 }],
        requiredSkill: 'crafting',
        minimumSkillLevel: 15,
        craftTime: 12000,
        energyCost: 15,
        difficulty: 'medium',
        baseXP: 25
      },

      // ===== CONSUMABLES =====
      {
        id: 'cook_fish',
        name: 'Cook Fish',
        description: 'Cook raw fish over a fire.',
        category: 'consumables',
        ingredients: [
          { itemId: 'raw_fish', quantity: 1 },
          { itemId: 'wood', quantity: 1 }
        ],
        output: [{ itemId: 'cooked_fish', quantity: 1 }],
        requiredSkill: 'survival',
        minimumSkillLevel: 0,
        craftTime: 3000,
        energyCost: 3,
        difficulty: 'easy',
        baseXP: 5,
        qualityEnabled: false
      },

      {
        id: 'cook_meat',
        name: 'Cook Meat',
        description: 'Cook raw meat over a fire.',
        category: 'consumables',
        ingredients: [
          { itemId: 'raw_meat', quantity: 1 },
          { itemId: 'wood', quantity: 1 }
        ],
        output: [{ itemId: 'cooked_meat', quantity: 1 }],
        requiredSkill: 'survival',
        minimumSkillLevel: 0,
        craftTime: 4000,
        energyCost: 3,
        difficulty: 'easy',
        baseXP: 6,
        qualityEnabled: false
      },

      {
        id: 'herbal_remedy',
        name: 'Herbal Remedy',
        description: 'Craft medicine from island plants.',
        category: 'consumables',
        ingredients: [
          { itemId: 'fiber', quantity: 5 },
          { itemId: 'berries', quantity: 3 }
        ],
        output: [{ itemId: 'herbal_remedy', quantity: 1 }],
        requiredSkill: 'survival',
        minimumSkillLevel: 10,
        craftTime: 8000,
        energyCost: 8,
        difficulty: 'medium',
        baseXP: 20
      },

      {
        id: 'bandage',
        name: 'Bandage',
        description: 'Create bandages from cloth.',
        category: 'consumables',
        ingredients: [
          { itemId: 'fiber', quantity: 3 }
        ],
        output: [{ itemId: 'bandage', quantity: 2 }],
        requiredSkill: 'survival',
        minimumSkillLevel: 0,
        craftTime: 2000,
        energyCost: 2,
        difficulty: 'easy',
        baseXP: 3,
        qualityEnabled: false
      },

      // ===== MATERIALS =====
      {
        id: 'rope',
        name: 'Rope',
        description: 'Twist plant fibers into rope.',
        category: 'materials',
        ingredients: [
          { itemId: 'fiber', quantity: 10 }
        ],
        output: [{ itemId: 'rope', quantity: 1 }],
        requiredSkill: 'crafting',
        minimumSkillLevel: 0,
        craftTime: 5000,
        energyCost: 5,
        difficulty: 'easy',
        baseXP: 8,
        qualityEnabled: false
      },

      {
        id: 'cloth',
        name: 'Cloth',
        description: 'Weave plant fibers into cloth.',
        category: 'materials',
        ingredients: [
          { itemId: 'fiber', quantity: 15 }
        ],
        output: [{ itemId: 'cloth', quantity: 1 }],
        requiredSkill: 'crafting',
        minimumSkillLevel: 5,
        craftTime: 8000,
        energyCost: 8,
        difficulty: 'easy',
        baseXP: 12,
        qualityEnabled: false
      },

      // ===== EQUIPMENT =====
      {
        id: 'cloth_shirt',
        name: 'Cloth Shirt',
        description: 'Basic clothing for protection.',
        category: 'equipment',
        ingredients: [
          { itemId: 'cloth', quantity: 2 },
          { itemId: 'fiber', quantity: 3 }
        ],
        output: [{ itemId: 'cloth_shirt', quantity: 1 }],
        requiredSkill: 'crafting',
        minimumSkillLevel: 5,
        craftTime: 10000,
        energyCost: 10,
        difficulty: 'medium',
        baseXP: 18
      },

      {
        id: 'leather_vest',
        name: 'Leather Vest',
        description: 'Sturdy leather protection.',
        category: 'equipment',
        ingredients: [
          { itemId: 'leather', quantity: 3 },
          { itemId: 'fiber', quantity: 5 }
        ],
        output: [{ itemId: 'leather_vest', quantity: 1 }],
        requiredSkill: 'crafting',
        minimumSkillLevel: 15,
        craftTime: 15000,
        energyCost: 15,
        difficulty: 'medium',
        baseXP: 30
      },

      {
        id: 'leather_backpack',
        name: 'Leather Backpack',
        description: 'Increases carrying capacity.',
        category: 'equipment',
        ingredients: [
          { itemId: 'leather', quantity: 4 },
          { itemId: 'fiber', quantity: 8 },
          { itemId: 'rope', quantity: 2 }
        ],
        output: [{ itemId: 'leather_backpack', quantity: 1 }],
        requiredSkill: 'crafting',
        minimumSkillLevel: 20,
        craftTime: 20000,
        energyCost: 20,
        difficulty: 'hard',
        baseXP: 50
      },

      {
        id: 'waterskin',
        name: 'Waterskin',
        description: 'Carry water with you.',
        category: 'equipment',
        ingredients: [
          { itemId: 'leather', quantity: 2 },
          { itemId: 'fiber', quantity: 3 }
        ],
        output: [{ itemId: 'waterskin', quantity: 1 }],
        requiredSkill: 'crafting',
        minimumSkillLevel: 10,
        craftTime: 8000,
        energyCost: 8,
        difficulty: 'medium',
        baseXP: 20
      },

      // ===== TOOL REPAIR =====
      {
        id: 'repair_tool',
        name: 'Repair Tool',
        description: 'Restore durability to damaged tools.',
        category: 'tools',
        ingredients: [
          { itemId: 'wood', quantity: 2 },
          { itemId: 'stone', quantity: 1 },
          { itemId: 'fiber', quantity: 1 }
        ],
        output: [], // Special: repairs equipped tool instead
        requiredSkill: 'crafting',
        minimumSkillLevel: 5,
        craftTime: 5000,
        energyCost: 8,
        difficulty: 'easy',
        baseXP: 10,
        qualityEnabled: false
      }
    ];
  }
}

// Create singleton instance
export const recipeDB = new RecipeDatabase();
