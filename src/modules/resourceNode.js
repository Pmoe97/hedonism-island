import { itemDB } from '../data/itemDatabase.js';

/**
 * Resource Node System
 * 
 * Design Philosophy:
 * - Nodes are interactive objects on the map
 * - Different tools for different resources (axe for trees, pickaxe for rocks)
 * - Skill-based success rates and yields
 * - Regeneration system (nodes respawn over time)
 * - Dynamic depletion (finite uses before exhaustion)
 * - Visual states (full, depleted, regenerating)
 * - Player feedback (animations, sounds, progress bars)
 */

export class ResourceNode {
  constructor(config) {
    this.id = config.id;
    this.type = config.type; // 'tree', 'rock', 'berry_bush', 'fishing_spot', etc.
    this.position = config.position; // { q, r } hex coords
    
    // Resource properties
    this.resourceType = config.resourceType; // What item it drops
    this.baseYield = config.baseYield || { min: 1, max: 3 };
    this.currentUses = config.maxUses || 5;
    this.maxUses = config.maxUses || 5;
    
    // Requirements
    this.requiredTool = config.requiredTool || null; // 'axe', 'pickaxe', null for hands
    this.requiredSkill = config.requiredSkill || null;
    this.minimumSkillLevel = config.minimumSkillLevel || 0;
    
    // Regeneration
    this.regenerationTime = config.regenerationTime || 300000; // 5 minutes default
    this.regenerationProgress = 0;
    this.isRegenerating = false;
    this.lastGatherTime = null;
    
    // State
    this.state = 'full'; // 'full', 'depleted', 'regenerating'
    this.discovered = config.discovered || false;
    
    // Visual properties
    this.sprite = config.sprite || '🌳';
    this.depletedSprite = config.depletedSprite || '🪵';
    this.size = config.size || 'medium'; // 'small', 'medium', 'large'
    
    // Gathering properties
    this.baseGatherDuration = config.gatherDuration || 30; // 30 minutes base (in-game time)
    this.gatherTimeMs = config.gatherTimeMs || 2000; // 2 seconds real-time animation
    
    // Special properties
    this.isRespawnable = config.isRespawnable !== false; // Most nodes respawn
    this.quality = config.quality || 'normal'; // 'poor', 'normal', 'rich', 'abundant'
    
    // Events
    this.onGather = config.onGather || null;
    this.onDeplete = config.onDeplete || null;
    this.onRegenerate = config.onRegenerate || null;
  }

  /**
   * Check if player can gather from this node
   */
  canGather(player) {
    // Node must not be depleted
    if (this.state === 'depleted' && !this.isRegenerating) {
      return { success: false, reason: 'Node is depleted' };
    }

    // Player must be alive and conscious
    if (!player.isAlive || !player.isConscious) {
      return { success: false, reason: 'You are not in condition to gather' };
    }

    // Check tool requirement
    if (this.requiredTool) {
      const hasTool = this.checkPlayerHasTool(player, this.requiredTool);
      if (!hasTool) {
        return { success: false, reason: `Requires ${this.requiredTool}` };
      }
    }

    // Check skill requirement
    if (this.requiredSkill && this.minimumSkillLevel > 0) {
      const skillLevel = player.getEffectiveSkill(this.requiredSkill);
      if (skillLevel < this.minimumSkillLevel) {
        return { success: false, reason: `Requires ${this.requiredSkill} level ${this.minimumSkillLevel}` };
      }
    }

    return { success: true };
  }

  /**
   * Check if player has required tool equipped
   */
  checkPlayerHasTool(player, toolType) {
    const equipped = player.inventory.equipment;
    
    // Check weapon and tool slots
    const weapon = equipped.weapon;
    const tool = equipped.tool;

    if (toolType === 'axe') {
      return (weapon?.category === 'axe') || (tool?.category === 'axe');
    }
    if (toolType === 'pickaxe') {
      return (weapon?.category === 'pickaxe') || (tool?.category === 'pickaxe');
    }
    if (toolType === 'knife') {
      return (weapon?.category === 'knife') || (tool?.category === 'knife');
    }
    if (toolType === 'fishing_rod') {
      return tool?.category === 'fishing';
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
    if (this.requiredTool === 'fishing_rod') {
      return equipped.tool;
    }

    return null;
  }

  /**
   * Get gather duration in game minutes
   * Duration varies by node type, player skill, and tool quality
   * Range: 15-45 minutes
   */
  getGatherDuration(player) {
    let duration = this.baseGatherDuration;

    // Skill reduces gather time
    if (this.requiredSkill) {
      const skillLevel = player.getEffectiveSkill(this.requiredSkill);
      const skillReduction = Math.floor(skillLevel / 10) * 2; // -2 minutes per 10 skill
      duration -= skillReduction;
    }

    // Tool quality reduces gather time
    const tool = this.getEquippedTool(player);
    if (tool && tool.rarity !== 'common') {
      const rarityReduction = {
        uncommon: 2,   // -2 minutes
        rare: 5,       // -5 minutes
        epic: 8,       // -8 minutes
        legendary: 12  // -12 minutes
      };
      duration -= (rarityReduction[tool.rarity] || 0);
    }

    // Node quality affects gather time
    const qualityModifiers = {
      poor: 1.2,      // +20% time (harder to extract)
      normal: 1.0,    // Normal time
      rich: 0.9,      // -10% time (easier to extract)
      abundant: 0.8   // -20% time (very easy)
    };
    duration *= qualityModifiers[this.quality];

    return Math.max(15, Math.ceil(duration)); // Minimum 15 minutes
  }

  /**
   * Attempt to gather resources
   */
  gather(player) {
    const canGather = this.canGather(player);
    if (!canGather.success) {
      return {
        success: false,
        reason: canGather.reason
      };
    }

    // Calculate yield based on skill and tool quality
    const baseYield = this.calculateYield(player);
    const items = this.generateItems(baseYield);

    // Damage tool if applicable
    const tool = this.getEquippedTool(player);
    if (tool && tool.durability !== undefined) {
      tool.damage(1);
      if (tool.durability <= 0) {
        console.log(`${tool.name} broke!`);
        // TODO: Remove broken tool from equipment
      }
    }

    // Grant skill XP
    if (this.requiredSkill) {
      const xpGain = this.calculateSkillXP();
      player.gainSkillXP(this.requiredSkill, xpGain);
    }

    // Deplete node
    this.currentUses--;
    this.lastGatherTime = Date.now();

    if (this.currentUses <= 0) {
      this.depleteNode();
    }

    // Custom gather callback
    if (this.onGather) {
      this.onGather(player, items);
    }

    return {
      success: true,
      items: items,
      xpGained: this.requiredSkill ? this.calculateSkillXP() : 0,
      usesRemaining: this.currentUses
    };
  }

  /**
   * Calculate yield based on player skill and quality
   */
  calculateYield(player) {
    let yield_amount = Math.floor(
      Math.random() * (this.baseYield.max - this.baseYield.min + 1) + this.baseYield.min
    );

    // Skill bonus
    if (this.requiredSkill) {
      const skillLevel = player.getEffectiveSkill(this.requiredSkill);
      const skillBonus = Math.floor(skillLevel / 20); // +1 per 20 skill
      yield_amount += skillBonus;
    }

    // Quality multiplier
    const qualityMultipliers = {
      poor: 0.5,
      normal: 1.0,
      rich: 1.5,
      abundant: 2.0
    };
    yield_amount = Math.floor(yield_amount * qualityMultipliers[this.quality]);

    // Tool quality bonus
    const tool = this.getEquippedTool(player);
    if (tool && tool.rarity !== 'common') {
      const rarityBonus = {
        uncommon: 1.1,
        rare: 1.25,
        epic: 1.5,
        legendary: 2.0
      };
      yield_amount = Math.floor(yield_amount * (rarityBonus[tool.rarity] || 1));
    }

    return Math.max(1, yield_amount); // Minimum 1 item
  }

  /**
   * Generate item instances
   */
  generateItems(quantity) {
    const items = [];
    for (let i = 0; i < quantity; i++) {
      items.push(itemDB.get(this.resourceType));
    }
    return items;
  }

  /**
   * Calculate skill XP gain
   */
  calculateSkillXP() {
    const baseXP = 5;
    
    // Quality multiplier
    const qualityXP = {
      poor: 0.5,
      normal: 1.0,
      rich: 1.5,
      abundant: 2.0
    };

    return Math.floor(baseXP * qualityXP[this.quality]);
  }

  /**
   * Deplete the node
   */
  depleteNode() {
    this.state = 'depleted';
    this.currentUses = 0;

    if (this.isRespawnable) {
      this.startRegeneration();
    }

    if (this.onDeplete) {
      this.onDeplete();
    }
  }

  /**
   * Start regeneration process
   */
  startRegeneration() {
    this.isRegenerating = true;
    this.regenerationProgress = 0;
  }

  /**
   * Update node state (called by game loop)
   */
  update(deltaTime) {
    if (this.isRegenerating) {
      this.regenerationProgress += deltaTime;

      if (this.regenerationProgress >= this.regenerationTime) {
        this.regenerateNode();
      }
    }
  }

  /**
   * Regenerate the node
   */
  regenerateNode() {
    this.state = 'full';
    this.currentUses = this.maxUses;
    this.isRegenerating = false;
    this.regenerationProgress = 0;

    if (this.onRegenerate) {
      this.onRegenerate();
    }
  }

  /**
   * Get regeneration progress percentage
   */
  getRegenerationProgress() {
    if (!this.isRegenerating) return 0;
    return (this.regenerationProgress / this.regenerationTime) * 100;
  }

  /**
   * Get visual representation
   */
  getSprite() {
    if (this.state === 'depleted') {
      return this.depletedSprite;
    }
    return this.sprite;
  }

  /**
   * Get node info for UI
   */
  getInfo() {
    return {
      name: this.getName(),
      type: this.type,
      state: this.state,
      usesRemaining: `${this.currentUses}/${this.maxUses}`,
      requiredTool: this.requiredTool || 'Bare hands',
      requiredSkill: this.requiredSkill 
        ? `${this.requiredSkill} (${this.minimumSkillLevel})` 
        : 'None',
      gatherTime: `${this.gatherTime / 1000}s`,
      energyCost: this.energyCost,
      quality: this.quality,
      regenerationProgress: this.isRegenerating 
        ? `${Math.floor(this.getRegenerationProgress())}%` 
        : 'N/A'
    };
  }

  /**
   * Get display name
   */
  getName() {
    const names = {
      tree: 'Tree',
      rock: 'Rock Formation',
      berry_bush: 'Berry Bush',
      fishing_spot: 'Fishing Spot',
      coconut_tree: 'Coconut Tree',
      iron_deposit: 'Iron Deposit',
      herb_patch: 'Herb Patch',
      stone_outcrop: 'Stone Outcrop'
    };
    return names[this.type] || this.type;
  }

  /**
   * Serialize for saving
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      position: this.position,
      currentUses: this.currentUses,
      state: this.state,
      regenerationProgress: this.regenerationProgress,
      isRegenerating: this.isRegenerating,
      discovered: this.discovered,
      lastGatherTime: this.lastGatherTime
    };
  }

  /**
   * Deserialize from save
   */
  static fromJSON(data, config) {
    const node = new ResourceNode({ ...config, ...data });
    node.state = data.state;
    node.currentUses = data.currentUses;
    node.regenerationProgress = data.regenerationProgress;
    node.isRegenerating = data.isRegenerating;
    node.discovered = data.discovered;
    node.lastGatherTime = data.lastGatherTime;
    return node;
  }
}

/**
 * Resource Node Manager
 * Handles all resource nodes on the map
 */
export class ResourceNodeManager {
  constructor() {
    this.nodes = new Map();
    this.nodesByPosition = new Map();
    this.nextNodeId = 1;
  }

  /**
   * Create a new resource node
   */
  createNode(config) {
    const node = new ResourceNode({
      ...config,
      id: config.id || `node_${this.nextNodeId++}`
    });

    this.nodes.set(node.id, node);
    
    const posKey = `${node.position.q},${node.position.r}`;
    if (!this.nodesByPosition.has(posKey)) {
      this.nodesByPosition.set(posKey, []);
    }
    this.nodesByPosition.get(posKey).push(node);

    return node;
  }

  /**
   * Get node by ID
   */
  getNode(id) {
    return this.nodes.get(id);
  }

  /**
   * Get nodes at position
   */
  getNodesAt(q, r) {
    const posKey = `${q},${r}`;
    return this.nodesByPosition.get(posKey) || [];
  }

  /**
   * Get all nodes of a type
   */
  getNodesByType(type) {
    return Array.from(this.nodes.values()).filter(node => node.type === type);
  }

  /**
   * Get all gatherable nodes (not depleted)
   */
  getGatherableNodes() {
    return Array.from(this.nodes.values()).filter(node => node.state !== 'depleted');
  }

  /**
   * Remove a node
   */
  removeNode(id) {
    const node = this.nodes.get(id);
    if (!node) return;

    const posKey = `${node.position.q},${node.position.r}`;
    const nodesAtPos = this.nodesByPosition.get(posKey);
    if (nodesAtPos) {
      const index = nodesAtPos.indexOf(node);
      if (index !== -1) {
        nodesAtPos.splice(index, 1);
      }
    }

    this.nodes.delete(id);
  }

  /**
   * Update all nodes (called by game loop)
   */
  update(deltaTime) {
    this.nodes.forEach(node => {
      node.update(deltaTime);
    });
  }

  /**
   * Generate starter resource nodes near player spawn
   */
  generateStarterNodes(spawnPosition, radius = 3) {
    const nodes = [];

    // Generate trees for wood
    for (let i = 0; i < 5; i++) {
      const offset = this.getRandomOffset(radius);
      nodes.push(this.createNode({
        type: 'tree',
        position: { q: spawnPosition.q + offset.q, r: spawnPosition.r + offset.r },
        resourceType: 'wood',
        baseYield: { min: 2, max: 4 },
        maxUses: 5,
        requiredTool: 'axe',
        requiredSkill: 'woodcutting',
        sprite: '🌳',
        depletedSprite: '🪵',
        gatherTime: 3000,
        energyCost: 5
      }));
    }

    // Generate rocks for stone
    for (let i = 0; i < 4; i++) {
      const offset = this.getRandomOffset(radius);
      nodes.push(this.createNode({
        type: 'rock',
        position: { q: spawnPosition.q + offset.q, r: spawnPosition.r + offset.r },
        resourceType: 'stone',
        baseYield: { min: 2, max: 3 },
        maxUses: 5,
        requiredTool: 'pickaxe',
        requiredSkill: 'mining',
        sprite: '🪨',
        depletedSprite: '⚫',
        gatherTime: 4000,
        energyCost: 7
      }));
    }

    // Generate berry bushes (no tool required)
    for (let i = 0; i < 3; i++) {
      const offset = this.getRandomOffset(radius);
      nodes.push(this.createNode({
        type: 'berry_bush',
        position: { q: spawnPosition.q + offset.q, r: spawnPosition.r + offset.r },
        resourceType: 'berries',
        baseYield: { min: 3, max: 6 },
        maxUses: 8,
        requiredTool: null,
        sprite: '🫐',
        depletedSprite: '🍂',
        gatherTime: 2000,
        energyCost: 2
      }));
    }

    // Generate coconut trees
    for (let i = 0; i < 2; i++) {
      const offset = this.getRandomOffset(radius);
      nodes.push(this.createNode({
        type: 'coconut_tree',
        position: { q: spawnPosition.q + offset.q, r: spawnPosition.r + offset.r },
        resourceType: 'coconut',
        baseYield: { min: 1, max: 2 },
        maxUses: 3,
        requiredTool: null,
        sprite: '🌴',
        depletedSprite: '🌴',
        gatherTime: 2500,
        energyCost: 3
      }));
    }

    return nodes;
  }

  /**
   * Get random hex offset within radius
   */
  getRandomOffset(radius) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.floor(Math.random() * radius) + 1;
    
    return {
      q: Math.round(Math.cos(angle) * distance),
      r: Math.round(Math.sin(angle) * distance)
    };
  }

  /**
   * Serialize for saving
   */
  toJSON() {
    const nodesArray = Array.from(this.nodes.values()).map(node => node.toJSON());
    return {
      nodes: nodesArray,
      nextNodeId: this.nextNodeId
    };
  }

  /**
   * Deserialize from save
   */
  static fromJSON(data, nodeConfigs) {
    const manager = new ResourceNodeManager();
    manager.nextNodeId = data.nextNodeId;

    data.nodes.forEach(nodeData => {
      const config = nodeConfigs[nodeData.type] || {};
      const node = ResourceNode.fromJSON(nodeData, config);
      manager.nodes.set(node.id, node);

      const posKey = `${node.position.q},${node.position.r}`;
      if (!manager.nodesByPosition.has(posKey)) {
        manager.nodesByPosition.set(posKey, []);
      }
      manager.nodesByPosition.get(posKey).push(node);
    });

    return manager;
  }
}
