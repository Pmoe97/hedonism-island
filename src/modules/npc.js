/**
 * NPC (Non-Player Character) System
 * 
 * Deterministic character generation with AI-powered dialogue
 * Based on personality stats, relationships, and memory systems
 */

export class NPC {
  constructor(config = {}) {
    // ===== IDENTITY =====
    this.identity = {
      id: config.identity?.id || config.id || this.generateID(),
      name: config.identity?.name || config.name || "Unnamed",
      title: config.identity?.title || config.title || null, // "The Scarred Hunter"
      faction: config.identity?.faction || config.faction || 'neutral',
      role: config.identity?.role || config.role || 'civilian' // 'leader', 'warrior', 'trader', 'healer', etc.
    };
    
    // ===== PHYSICAL APPEARANCE (AI-generated) =====
    this.appearance = {
      age: config.appearance?.age || 30,
      ageCategory: config.appearance?.ageCategory || 'adult',
      gender: config.appearance?.gender || 'male',
      height: config.appearance?.height || 'average',
      build: config.appearance?.build || 'average',
      skinTone: config.appearance?.skinTone || 'bronze',
      hairColor: config.appearance?.hairColor || 'black',
      hairStyle: config.appearance?.hairStyle || 'short',
      eyeColor: config.appearance?.eyeColor || 'brown',
      distinctiveFeatures: config.appearance?.distinctiveFeatures || [],
      clothing: config.appearance?.clothing || 'simple garments'
    };
    
    // ===== PERSONALITY TRAITS (Big Five - drives AI behavior) =====
    this.personality = {
      traits: {
        openness: config.personality?.traits?.openness || 50,
        conscientiousness: config.personality?.traits?.conscientiousness || 50,
        extraversion: config.personality?.traits?.extraversion || 50,
        agreeableness: config.personality?.traits?.agreeableness || 50,
        neuroticism: config.personality?.traits?.neuroticism || 50
      },
      
      values: {
        honor: config.personality?.values?.honor || 50,
        loyalty: config.personality?.values?.loyalty || 50,
        ambition: config.personality?.values?.ambition || 50,
        compassion: config.personality?.values?.compassion || 50,
        pragmatism: config.personality?.values?.pragmatism || 50,
        tradition: config.personality?.values?.tradition || 50
      },
      
      // AI-generated personality details
      quirks: config.personality?.quirks || [],
      fears: config.personality?.fears || [],
      desires: config.personality?.desires || [],
      motivations: config.personality?.motivations || []
    };
    
    // ===== BACKGROUND (AI-generated narrative) =====
    this.background = {
      birthplace: config.background?.birthplace || 'Unknown',
      backstory: config.background?.backstory || '',
      formativeEvent: config.background?.formativeEvent || '',
      occupation: config.background?.occupation || this.identity.role,
      education: config.background?.education || 'informal',
      familyStatus: config.background?.familyStatus || 'unknown',
      secrets: config.background?.secrets || []
    };
    
    // ===== STATS (deterministic) =====
    this.stats = {
      health: config.stats?.health || 100,
      maxHealth: config.stats?.maxHealth || 100,
      stamina: config.stats?.stamina || 100,
      maxStamina: config.stats?.maxStamina || 100,
      
      // Attributes
      strength: config.stats?.strength || 50,
      agility: config.stats?.agility || 50,
      intelligence: config.stats?.intelligence || 50,
      charisma: config.stats?.charisma || 50,
      willpower: config.stats?.willpower || 50,
      
      // Needs
      hunger: config.stats?.hunger || 100,
      thirst: config.stats?.thirst || 100
    };
    
    // ===== SKILLS (role-based) =====
    this.skills = {
      combat: config.skills?.combat || 0,
      hunting: config.skills?.hunting || 0,
      crafting: config.skills?.crafting || 0,
      diplomacy: config.skills?.diplomacy || 0,
      survival: config.skills?.survival || 0,
      medicine: config.skills?.medicine || 0,
      exploration: config.skills?.exploration || 0
    };
    
    // ===== RELATIONSHIPS =====
    this.relationships = {
      // Relationship with player
      player: {
        opinion: config.relationships?.player?.opinion || 50, // -100 to 100
        trust: config.relationships?.player?.trust || 20,     // 0-100
        respect: config.relationships?.player?.respect || 30,  // 0-100
        fear: config.relationships?.player?.fear || 0,         // 0-100
        romantic: config.relationships?.player?.romantic || 0, // 0-100
        firstMet: config.relationships?.player?.firstMet || null,
        lastInteraction: config.relationships?.player?.lastInteraction || null,
        interactionCount: config.relationships?.player?.interactionCount || 0
      },
      
      // Relationships with other NPCs (Map: npcId -> relationship data)
      knownNPCs: new Map(config.relationships?.knownNPCs || [])
    };
    
    // ===== POSITION & STATE =====
    this.location = {
      currentTile: config.location?.currentTile || { q: 0, r: 0 },
      homeLocation: config.location?.homeLocation || { q: 0, r: 0 },
      schedule: config.location?.schedule || []
    };
    
    this.state = {
      isAlive: config.state?.isAlive !== false,
      isConscious: config.state?.isConscious !== false,
      mood: config.state?.mood || 'neutral',
      activity: config.state?.activity || 'idle',
      canBeRecruited: config.state?.canBeRecruited || false,
      isRecruited: config.state?.isRecruited || false,
      isHostile: config.state?.isHostile || false,
      isTrader: config.state?.isTrader || false,
      questGiver: config.state?.questGiver || false
    };
    
    // ===== INVENTORY & EQUIPMENT =====
    this.inventory = {
      items: config.inventory?.items || [],
      equipped: {
        weapon: config.inventory?.equipped?.weapon || null,
        armor: config.inventory?.equipped?.armor || null,
        accessory: config.inventory?.equipped?.accessory || null
      },
      currency: config.inventory?.currency || 0
    };
    
    // ===== MEMORY SYSTEM =====
    this.memory = {
      events: config.memory?.events || [],
      conversationPhase: config.memory?.conversationPhase || 'early', // early/familiar/intimate
      conversationHistory: config.memory?.conversationHistory || [],
      sawPlayerSteal: config.memory?.sawPlayerSteal || false,
      sawPlayerKill: config.memory?.sawPlayerKill || [],
      heardRumors: config.memory?.heardRumors || []
    };
    
    // ===== DIALOGUE (AI-generated content) =====
    this.dialogue = {
      greeting: config.dialogue?.greeting || {},
      topics: config.dialogue?.topics || [],
      barks: config.dialogue?.barks || {}
    };
    
    // ===== AI BEHAVIOR =====
    this.ai = {
      aggression: config.ai?.aggression || this.calculateAggression(),
      courage: config.ai?.courage || this.calculateCourage(),
      loyalty: config.ai?.loyalty || this.personality.values.loyalty,
      alertness: config.ai?.alertness || 50,
      routineType: config.ai?.routineType || 'wanderer'
    };
    
    // ===== META =====
    this.meta = {
      importance: config.meta?.importance || 'minor', // major/minor/background
      canDie: config.meta?.canDie !== false,
      tags: config.meta?.tags || [],
      generatedByAI: config.meta?.generatedByAI || false,
      createdAt: config.meta?.createdAt || Date.now()
    };
  }
  
  // ========================================
  // HELPER METHODS
  // ========================================
  
  generateID() {
    return `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Calculate aggression from personality traits
   */
  calculateAggression() {
    const { agreeableness, neuroticism } = this.personality.traits;
    const { honor } = this.personality.values;
    
    // Low agreeableness + high neuroticism = more aggressive
    // High honor can moderate aggression
    return Math.round(
      ((100 - agreeableness) * 0.4) +
      (neuroticism * 0.3) +
      ((100 - honor) * 0.3)
    );
  }
  
  /**
   * Calculate courage (willingness to stand ground)
   */
  calculateCourage() {
    const { neuroticism } = this.personality.traits;
    const { honor, loyalty } = this.personality.values;
    
    // Low neuroticism + high honor/loyalty = more courageous
    return Math.round(
      ((100 - neuroticism) * 0.5) +
      (honor * 0.25) +
      (loyalty * 0.25)
    );
  }
  
  /**
   * Calculate current mood from stats and relationships
   */
  getMood() {
    const { health, hunger, thirst } = this.stats;
    const { opinion, trust, fear } = this.relationships.player;
    
    // Physical state affects mood
    if (health < 30) return 'suffering';
    if (hunger < 30 || thirst < 30) return 'desperate';
    
    // Fear overrides other emotions
    if (fear > 70) return 'terrified';
    if (fear > 40) return 'afraid';
    
    // Relationship-based moods
    const relationshipScore = (opinion + trust) / 2;
    
    if (relationshipScore > 80) return 'joyful';
    if (relationshipScore > 60) return 'friendly';
    if (relationshipScore > 40) return 'neutral';
    if (relationshipScore > 20) return 'wary';
    return 'hostile';
  }
  
  /**
   * Build personality summary for AI prompts
   */
  getPersonalitySummary() {
    const { traits, values } = this.personality;
    
    // Convert traits to descriptors
    const descriptors = [];
    
    if (traits.openness > 70) descriptors.push('curious and creative');
    else if (traits.openness < 30) descriptors.push('traditional and practical');
    
    if (traits.conscientiousness > 70) descriptors.push('disciplined and organized');
    else if (traits.conscientiousness < 30) descriptors.push('spontaneous and flexible');
    
    if (traits.extraversion > 70) descriptors.push('outgoing and energetic');
    else if (traits.extraversion < 30) descriptors.push('reserved and quiet');
    
    if (traits.agreeableness > 70) descriptors.push('compassionate and cooperative');
    else if (traits.agreeableness < 30) descriptors.push('competitive and assertive');
    
    if (traits.neuroticism > 70) descriptors.push('anxious and sensitive');
    else if (traits.neuroticism < 30) descriptors.push('calm and resilient');
    
    // Key values
    const topValues = Object.entries(values)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, value]) => `${name} (${value})`)
      .join(', ');
    
    return {
      traits: descriptors.join(', '),
      values: topValues,
      quirks: this.personality.quirks.join('; ')
    };
  }
  
  /**
   * Update relationship stats
   */
  adjustRelationship(stat, amount, target = 'player') {
    if (target === 'player') {
      const rel = this.relationships.player;
      
      switch (stat) {
        case 'opinion':
          rel.opinion = Math.max(-100, Math.min(100, rel.opinion + amount));
          break;
        case 'trust':
        case 'respect':
        case 'fear':
        case 'romantic':
          rel[stat] = Math.max(0, Math.min(100, rel[stat] + amount));
          break;
      }
      
      rel.lastInteraction = Date.now();
      
      // Update mood based on new relationship state
      this.state.mood = this.getMood();
    }
  }
  
  /**
   * Remember an event
   */
  remember(event, importance = 1.0) {
    this.memory.events.push({
      content: event,
      timestamp: Date.now(),
      importance,
      emotionalImpact: this.calculateEmotionalImpact(event)
    });
    
    // Keep only last 100 events (or most important)
    if (this.memory.events.length > 100) {
      this.memory.events.sort((a, b) => b.importance - a.importance);
      this.memory.events = this.memory.events.slice(0, 100);
    }
  }
  
  /**
   * Calculate emotional impact of an event
   */
  calculateEmotionalImpact(event) {
    const eventLower = event.toLowerCase();
    
    // Positive events
    if (eventLower.includes('gift') || eventLower.includes('helped')) return 2;
    if (eventLower.includes('saved') || eventLower.includes('rescued')) return 3;
    
    // Negative events
    if (eventLower.includes('attacked') || eventLower.includes('threatened')) return -3;
    if (eventLower.includes('stole') || eventLower.includes('betrayed')) return -2;
    
    return 0;
  }
  
  /**
   * Retrieve relevant memories (for AI context)
   */
  getRelevantMemories(context = '', maxResults = 5) {
    if (this.memory.events.length === 0) return [];
    
    const keywords = context.toLowerCase().split(' ');
    
    // Score memories by relevance
    const scored = this.memory.events.map(mem => {
      let relevance = mem.importance;
      
      // Boost if keywords match
      const memLower = mem.content.toLowerCase();
      keywords.forEach(keyword => {
        if (memLower.includes(keyword)) relevance += 0.5;
      });
      
      // Boost recent memories
      const hoursSince = (Date.now() - mem.timestamp) / (1000 * 60 * 60);
      if (hoursSince < 24) relevance += 1;
      else if (hoursSince < 168) relevance += 0.5; // Last week
      
      return { ...mem, relevance };
    });
    
    // Sort and return top results
    return scored
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxResults)
      .map(m => m.content);
  }
  
  /**
   * Update conversation phase based on relationship
   */
  updateConversationPhase() {
    const { opinion, trust, romantic } = this.relationships.player;
    const relationshipScore = (opinion + trust + romantic) / 3;
    
    if (relationshipScore > 70) {
      this.memory.conversationPhase = 'intimate';
    } else if (relationshipScore > 40) {
      this.memory.conversationPhase = 'familiar';
    } else {
      this.memory.conversationPhase = 'early';
    }
  }
  
  /**
   * Check if NPC would be hostile to player
   */
  wouldBeHostile() {
    const { opinion, fear } = this.relationships.player;
    
    // Hostile if very negative opinion or very afraid
    if (opinion < -50) return true;
    if (fear > 80 && this.ai.courage < 30) return false; // Too afraid to fight
    
    // Check faction relations (if implemented)
    // const factionRelation = getFactionRelation(this.faction, 'player');
    
    return this.state.isHostile;
  }
  
  // ========================================
  // SERIALIZATION
  // ========================================
  
  toJSON() {
    return {
      identity: this.identity,
      appearance: this.appearance,
      personality: {
        traits: this.personality.traits,
        values: this.personality.values,
        quirks: this.personality.quirks,
        fears: this.personality.fears,
        desires: this.personality.desires,
        motivations: this.personality.motivations
      },
      background: this.background,
      stats: this.stats,
      skills: this.skills,
      relationships: {
        player: this.relationships.player,
        knownNPCs: Array.from(this.relationships.knownNPCs.entries())
      },
      location: this.location,
      state: this.state,
      inventory: this.inventory,
      memory: {
        events: this.memory.events,
        conversationPhase: this.memory.conversationPhase,
        conversationHistory: this.memory.conversationHistory,
        sawPlayerSteal: this.memory.sawPlayerSteal,
        sawPlayerKill: this.memory.sawPlayerKill,
        heardRumors: this.memory.heardRumors
      },
      dialogue: this.dialogue,
      ai: this.ai,
      meta: this.meta
    };
  }
  
  static fromJSON(data) {
    // Reconstruct Map for knownNPCs
    if (data.relationships?.knownNPCs) {
      data.relationships.knownNPCs = new Map(data.relationships.knownNPCs);
    }
    
    // Handle old format where identity properties were flat
    if (!data.identity && data.id) {
      data.identity = {
        id: data.id,
        name: data.name,
        title: data.title,
        faction: data.faction,
        role: data.role
      };
    }
    
    return new NPC(data);
  }
}
