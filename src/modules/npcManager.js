/**
 * NPC Manager
 * Handles NPC lifecycle, spawning, AI enrichment, dialogue, and persistence
 */

import { NPC } from './npc.js';
import { PerchanceAI } from './perchanceAI.js';
import { NameDatabase } from '../data/nameDatabase.js';
import { AppearanceDatabase } from '../data/appearanceDatabase.js';
import { PersonalityDatabase } from '../data/personalityDatabase.js';
import { BackgroundDatabase } from '../data/backgroundDatabase.js';
import { SeededRandom } from '../utils/seededRandom.js';
import {
  buildNPCGenerationPrompt,
  buildDialoguePrompt,
  buildMoodPrompt,
  buildPhysicalDescriptionPrompt,
  buildRumorPrompt
} from './npcPrompts.js';

export class NPCManager {
  constructor(gameState, perchanceAI) {
    this.gameState = gameState;
    this.ai = perchanceAI || new PerchanceAI();
    this.nameDB = new NameDatabase();
    this.appearanceDB = new AppearanceDatabase();
    this.personalityDB = new PersonalityDatabase();
    this.backgroundDB = new BackgroundDatabase();
    this.seededRandom = new SeededRandom(Date.now()); // Will be replaced by game seed
    
    // NPC storage
    this.npcs = new Map(); // id -> NPC
    this.npcsByTile = new Map(); // "q,r" -> Set of NPC ids
    this.npcsByFaction = new Map(); // faction -> Set of NPC ids
    
    // Generation settings
    this.maxNPCs = 50; // Total NPC cap
    this.spawnChance = 0.1; // 10% chance per territory per day
    
    // Dialogue state
    this.activeConversation = null; // { npcId, history: [] }
    
    console.log('✅ NPCManager initialized');
  }
  
  /**
   * Set the seeded random generator (called by gameState with world seed)
   */
  setSeed(seed) {
    this.seededRandom = new SeededRandom(seed);
  }

  /**
   * Generate a new NPC with complete deterministic foundation
   * @param {object} template - Basic template { faction, gender?, age?, role?, tile? }
   * @returns {NPC} Fully generated NPC instance (ready to play without AI)
   */
  generateNPC(template) {
    const { faction, gender, age, role, tile } = template;
    
    // Faction and gender
    const factionType = faction || 'castaway';
    const npcGender = gender || (this.seededRandom.random() > 0.5 ? 'female' : 'male');
    
    // Generate deterministic name
    const nameData = this.nameDB.generateName(factionType, npcGender, this.seededRandom);
    
    // Generate deterministic appearance
    const appearance = this.appearanceDB.generateAppearance(factionType, npcGender, this.seededRandom);
    
    // Generate deterministic personality
    const personality = this.personalityDB.generatePersonality(factionType, this.seededRandom);
    
    // Generate deterministic background foundation
    const npcRole = role || this.getDefaultRole(factionType);
    const background = this.backgroundDB.generateBackground(factionType, npcRole, this.seededRandom);
    
    // Create NPC with complete foundation
    const npc = new NPC({
      id: nameData.fullName.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now(),
      identity: {
        name: nameData.fullName,
        title: this.generateTitle(factionType, npcRole),
        faction: factionType,
        role: npcRole
      },
      appearance: appearance,
      personality: {
        traits: personality.traits,
        quirks: personality.quirks,
        sexuality: personality.sexuality
      },
      background: background,
      desires: personality.desires,
      fears: personality.fears,
      location: {
        currentTile: tile || { q: 0, r: 0 },
        homeLocation: tile || { q: 0, r: 0 }
      }
    });
    
    // Mark as NOT AI-generated yet (AI enrichment is optional)
    npc.meta.generatedByAI = false;
    
    console.log(`✨ Generated ${npc.identity.name} (${npc.identity.faction} ${npc.identity.role})`);
    
    return npc;
  }
  
  /**
   * Generate a title based on faction and role
   */
  generateTitle(faction, role) {
    const titles = {
      castaway: ['Survivor', 'Castaway', 'Shipwreck Victim', 'Stranded Sailor', 'Lost Traveler'],
      native: ['Islander', 'Local', 'Native', 'Village Elder', 'Tribe Member'],
      mercenary: ['Blacksteel Operator', 'Blacksteel Soldier', 'PMC Contractor', 'Blacksteel Enforcer', 'Security Specialist']
    };
    
    const factionTitles = titles[faction] || titles.castaway;
    return this.seededRandom.choice(factionTitles);
  }

  /**
   * Get default role for faction
   * @param {string} faction - Faction name
   * @returns {string} Role
   */
  getDefaultRole(faction) {
    const roles = {
      castaway: ['survivor', 'scavenger', 'wanderer', 'refugee'],
      islander: ['hunter', 'gatherer', 'elder', 'warrior', 'shaman'],
      mercenary: ['soldier', 'scout', 'captain', 'enforcer'],
      tourist: ['vacationer', 'backpacker', 'photographer', 'writer']
    };
    
    const options = roles[faction] || ['wanderer'];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Enrich NPC with AI-generated creative content (OPTIONAL)
   * Only generates: backstory, additional quirks, secrets
   * Appearance and personality are already deterministically generated
   * @param {NPC} npc - NPC to enrich
   * @returns {Promise<NPC>} Enriched NPC
   */
  async enrichWithAI(npc) {
    try {
      console.log(`🤖 Enriching ${npc.identity.name} with AI backstory...`);
      
      // Build faction-specific backstory prompt
      const backstoryContext = this.backgroundDB.getBackstoryContext(npc);
      
      const prompt = `${backstoryContext}

Additionally generate:
1. ADDITIONAL QUIRKS (1-2 unique behavioral traits)
2. SECRETS (1-2 hidden elements that create drama/story potential)

Return ONLY valid JSON:
{
  "backstory": "2-3 sentence backstory",
  "additionalQuirks": ["quirk1", "quirk2"],
  "secrets": ["secret1", "secret2"]
}`;
      
      // Generate AI content
      const response = await this.ai.generateText(prompt, {
        temperature: 0.8,
        max_tokens: 500 // Much smaller - only 3 fields
      });
      
      // Extract and parse JSON
      const text = this.ai.extractText(response);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.warn('⚠️ Failed to parse AI response for NPC enrichment');
        npc.meta.generatedByAI = false;
        return npc;
      }
      
      const aiData = JSON.parse(jsonMatch[0]);
      
      // Apply backstory
      if (aiData.backstory) {
        npc.background.backstory = aiData.backstory;
      }
      
      // Add AI-generated quirks to existing deterministic quirks
      if (aiData.additionalQuirks && Array.isArray(aiData.additionalQuirks)) {
        npc.personality.quirks = [...npc.personality.quirks, ...aiData.additionalQuirks];
      }
      
      // Add secrets
      if (aiData.secrets && Array.isArray(aiData.secrets)) {
        npc.background.secrets = aiData.secrets;
      }
      
      // Mark as AI-enriched
      npc.meta.generatedByAI = true;
      
      console.log(`✅ ${npc.identity.name} enriched with AI backstory`);
      return npc;
      
    } catch (error) {
      console.error(`❌ Failed to enrich ${npc.identity.name}:`, error);
      npc.meta.generatedByAI = false;
      return npc;
    }
  }

  /**
   * Spawn NPC and add to world
   * @param {object} template - NPC template
   * @param {boolean} enrichWithAI - Whether to enrich with AI
   * @returns {Promise<NPC>} Spawned NPC
   */
  async spawnNPC(template, enrichWithAI = true) {
    // Check NPC cap
    if (this.npcs.size >= this.maxNPCs) {
      console.warn('⚠️ Max NPCs reached, cannot spawn more');
      return null;
    }
    
    // Generate base NPC
    const npc = this.generateNPC(template);
    
    // Enrich with AI if requested
    if (enrichWithAI) {
      await this.enrichWithAI(npc);
    }
    
    // Add to storage
    this.npcs.set(npc.identity.id, npc);
    
    // Add to tile index
    const tileKey = `${npc.location.currentTile.q},${npc.location.currentTile.r}`;
    if (!this.npcsByTile.has(tileKey)) {
      this.npcsByTile.set(tileKey, new Set());
    }
    this.npcsByTile.get(tileKey).add(npc.identity.id);
    
    // Add to faction index
    if (!this.npcsByFaction.has(npc.identity.faction)) {
      this.npcsByFaction.set(npc.identity.faction, new Set());
    }
    this.npcsByFaction.get(npc.identity.faction).add(npc.identity.id);
    
    console.log(`✅ Spawned ${npc.identity.name} (${npc.identity.faction}) at ${tileKey}`);
    
    return npc;
  }

  /**
   * Remove NPC from world
   * @param {string} npcId - NPC ID
   */
  despawnNPC(npcId) {
    const npc = this.npcs.get(npcId);
    if (!npc) return;
    
    // Remove from tile index
    const tileKey = `${npc.location.currentTile.q},${npc.location.currentTile.r}`;
    this.npcsByTile.get(tileKey)?.delete(npcId);
    
    // Remove from faction index
    this.npcsByFaction.get(npc.identity.faction)?.delete(npcId);
    
    // Remove from main storage
    this.npcs.delete(npcId);
    
    console.log(`🗑️ Despawned ${npc.identity.name}`);
  }

  /**
   * Get NPCs at specific tile
   * @param {object} tile - {q, r}
   * @returns {Array<NPC>} NPCs at tile
   */
  getNPCsAtTile(tile) {
    const tileKey = `${tile.q},${tile.r}`;
    const npcIds = this.npcsByTile.get(tileKey);
    if (!npcIds) return [];
    
    return Array.from(npcIds).map(id => this.npcs.get(id)).filter(npc => npc);
  }

  /**
   * Get NPCs by faction
   * @param {string} faction - Faction name
   * @returns {Array<NPC>} NPCs in faction
   */
  getNPCsByFaction(faction) {
    const npcIds = this.npcsByFaction.get(faction);
    if (!npcIds) return [];
    
    return Array.from(npcIds).map(id => this.npcs.get(id)).filter(npc => npc);
  }

  /**
   * Initiate dialogue with NPC
   * @param {string} npcId - NPC ID
   * @param {string} playerMessage - What player said
   * @param {string} context - Situational context
   * @returns {Promise<string>} NPC response
   */
  async initiateDialogue(npcId, playerMessage, context = '') {
    const npc = this.npcs.get(npcId);
    if (!npc) {
      console.error('NPC not found:', npcId);
      return 'The person has left.';
    }
    
    // Initialize conversation if new
    if (!this.activeConversation || this.activeConversation.npcId !== npcId) {
      this.activeConversation = {
        npcId,
        history: []
      };
    }
    
    // Build dialogue prompt
    const prompt = buildDialoguePrompt(
      npc,
      playerMessage,
      context,
      this.activeConversation.history.slice(-5) // Last 5 messages
    );
    
    // Generate response with retries for repetition
    let response = '';
    let attempts = 0;
    const maxAttempts = 3;
    const recentResponses = this.activeConversation.history
      .filter(h => h.speaker === 'npc')
      .slice(-3)
      .map(h => h.message);
    
    while (attempts < maxAttempts) {
      const temperature = this.ai.getRegenerationTemperature(attempts);
      
      const rawResponse = await this.ai.generateText(prompt, {
        temperature,
        max_tokens: 150
      });
      
      response = this.ai.sanitizeNpcResponse(rawResponse, npc);
      
      // Check for repetition
      const isRepetitive = this.ai.analyzeResponseForRepetition(response, recentResponses);
      
      if (!isRepetitive || attempts === maxAttempts - 1) {
        break;
      }
      
      // Add variation instruction for retry
      const variation = this.ai.getVariationStrategy(npc, context);
      prompt += `\n\nNOTE: Your previous response was too similar to recent messages. ${variation}.`;
      attempts++;
    }
    
    // Store in conversation history
    this.activeConversation.history.push(
      { speaker: 'player', message: playerMessage, timestamp: Date.now() },
      { speaker: 'npc', message: response, npcName: npc.identity.name, timestamp: Date.now() }
    );
    
    // Update NPC memory
    npc.remember(`Talked with player: Player said "${playerMessage}"`, 5);
    npc.relationships.player.lastInteraction = Date.now();
    npc.relationships.player.interactionCount++;
    
    // Update conversation phase
    npc.updateConversationPhase();
    
    // Store in NPC's conversation history
    npc.memory.conversationHistory.push(
      { speaker: 'player', message: playerMessage, timestamp: Date.now() }
    );
    npc.memory.conversationHistory.push(
      { speaker: 'npc', message: response, timestamp: Date.now() }
    );
    
    // Limit history size
    if (npc.memory.conversationHistory.length > 50) {
      npc.memory.conversationHistory = npc.memory.conversationHistory.slice(-50);
    }
    
    return response;
  }

  /**
   * End current conversation
   */
  endConversation() {
    this.activeConversation = null;
  }

  /**
   * Update NPC schedules and positions based on time
   * @param {number} gameTime - Current game time in minutes
   */
  updateNPCSchedules(gameTime) {
    // TODO: Implement schedule-based movement
    // NPCs can move between tiles based on their schedules
    // For now, NPCs stay put
  }

  /**
   * Spread rumor among NPCs
   * @param {string} event - Event description
   * @param {string} witnessId - NPC who witnessed
   * @param {number} spreadRange - Tiles from witness
   */
  async spreadRumor(event, witnessId, spreadRange = 3) {
    const witness = this.npcs.get(witnessId);
    if (!witness) return;
    
    // Generate rumor text
    const rumor = await this.ai.generateText(buildRumorPrompt(event, witness), {
      temperature: 0.7,
      max_tokens: 50
    });
    
    const rumorText = this.ai.extractText(rumor);
    
    // Find nearby NPCs
    const witnessTile = witness.location.currentTile;
    const nearbyNPCs = Array.from(this.npcs.values()).filter(npc => {
      if (npc.identity.id === witnessId) return false;
      const distance = Math.abs(npc.location.currentTile.q - witnessTile.q) +
                      Math.abs(npc.location.currentTile.r - witnessTile.r);
      return distance <= spreadRange;
    });
    
    // Add rumor to their memories
    nearbyNPCs.forEach(npc => {
      npc.remember(`Heard rumor: ${rumorText}`, 3);
      
      // Adjust opinion based on rumor content (simple sentiment)
      if (event.includes('kill') || event.includes('attack')) {
        npc.adjustRelationship('opinion', -10);
        npc.adjustRelationship('fear', 5);
      }
    });
    
    console.log(`📢 Rumor spread: "${rumorText}" (${nearbyNPCs.length} NPCs heard)`);
  }

  /**
   * Save all NPCs to JSON
   * @returns {object} Serialized NPCs and name database
   */
  saveNPCs() {
    return {
      npcs: Array.from(this.npcs.values()).map(npc => npc.toJSON()),
      usedNames: this.nameDB.getUsedNames()
    };
  }

  /**
   * Load NPCs from JSON
   * @param {object} data - Serialized NPCs and name database
   */
  loadNPCs(data) {
    // Clear existing
    this.npcs.clear();
    this.npcsByTile.clear();
    this.npcsByFaction.clear();
    
    // Restore used names
    if (data.usedNames) {
      this.nameDB.loadUsedNames(data.usedNames);
    }
    
    // Restore NPCs
    const npcArray = data.npcs || data; // Support old format
    npcArray.forEach(npcData => {
      const npc = NPC.fromJSON(npcData);
      
      this.npcs.set(npc.identity.id, npc);
      
      // Mark name as used (if not already from usedNames)
      if (npc.identity.name && npc.identity.faction) {
        this.nameDB.markNameAsUsed(npc.identity.faction, npc.identity.name);
      }
      
      // Rebuild tile index
      const tileKey = `${npc.location.currentTile.q},${npc.location.currentTile.r}`;
      if (!this.npcsByTile.has(tileKey)) {
        this.npcsByTile.set(tileKey, new Set());
      }
      this.npcsByTile.get(tileKey).add(npc.identity.id);
      
      // Rebuild faction index
      if (!this.npcsByFaction.has(npc.identity.faction)) {
        this.npcsByFaction.set(npc.identity.faction, new Set());
      }
      this.npcsByFaction.get(npc.identity.faction).add(npc.identity.id);
    });
    
    console.log(`✅ Loaded ${this.npcs.size} NPCs`);
  }

  /**
   * Get NPC by ID
   * @param {string} id - NPC ID
   * @returns {NPC|null} NPC or null
   */
  getNPC(id) {
    return this.npcs.get(id) || null;
  }

  /**
   * Get all NPCs
   * @returns {Array<NPC>} All NPCs
   */
  getAllNPCs() {
    return Array.from(this.npcs.values());
  }
}
