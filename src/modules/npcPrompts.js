/**
 * NPC Prompt Templates
 * Builds context-aware prompts for NPC generation and dialogue
 */

/**
 * Build NPC generation prompt (appearance, backstory, personality details)
 * @param {object} foundation - Basic NPC properties (faction, gender, age, role)
 * @returns {string} Generation prompt
 */
export function buildNPCGenerationPrompt(foundation) {
  const { faction, gender, age, role, name } = foundation;
  
  const genderLabel = {
    female: 'woman',
    male: 'man',
    futanari: 'futanari',
    cuntboy: 'cuntboy',
    other: 'person'
  }[gender?.toLowerCase()] || 'person';
  
  const factionContext = {
    castaway: 'a fellow castaway who washed ashore after a shipwreck. They are resourceful but traumatized by their experience.',
    islander: 'a native islander who has lived here for generations. They are protective of their land and suspicious of outsiders.',
    mercenary: 'a dangerous mercenary employed by Blacksteel Solutions PMC. They are hostile, skilled in combat, and ruthless.',
    tourist: 'a tourist who came to the island resort for vacation. They are unprepared for survival but optimistic.'
  }[faction] || 'a mysterious person';
  
  // Context section
  const context = `You are creating a detailed character for an adult survival/romance game set on a tropical island.

CHARACTER BASICS:
- Name: ${name}
- Gender: ${genderLabel}
- Age: ${age}
- Role: ${role}
- Faction: ${faction} (${factionContext})`;

  // Instructions section
  const instructions = `
GENERATE THE FOLLOWING (as valid JSON):

1. APPEARANCE (object):
   - skinTone: (string) e.g., "fair", "tan", "olive", "dark brown", "ebony"
   - height: (number) height in cm, 150-200
   - build: (string) "petite", "slim", "average", "athletic", "curvy", "muscular", "heavyset"
   - hairColor: (string) natural or exotic colors
   - hairStyle: (string) detailed style description
   - hairLength: (string) "short", "shoulder-length", "long", "very long"
   - eyeColor: (string) any color including exotic
   - distinctiveFeatures: (array of strings) 2-3 unique physical traits, scars, tattoos, etc.
   - clothing: (string) detailed outfit description appropriate for tropical island

2. BACKGROUND (object):
   - birthplace: (string) where they were born
   - backstory: (string) 3-4 sentences explaining their past and how they came to the island
   - formativeEvent: (string) 1-2 sentences about a key event that shaped them
   - occupation: (string) their job/role before coming to the island
   - education: (string) level and type of education
   - familyStatus: (string) family situation
   - secrets: (array of strings) 1-2 dark or interesting secrets

3. PERSONALITY DETAILS (object):
   - quirks: (array of strings) 2-3 unique behavioral quirks or habits
   - fears: (array of strings) 2-3 things they fear
   - desires: (array of strings) 2-3 things they want (include at least one sexual/romantic desire)
   - motivations: (array of strings) 2-3 core motivations driving their actions

4. DIALOGUE SAMPLES (object):
   - greeting: (string) what they say when first meeting the player
   - topics: (array of objects) 3-4 conversation topics, each with {topic: string, response: string}
   - barks: (array of strings) 3-5 short phrases they might say during activities`;

  // Constraints section
  const constraints = `
CONSTRAINTS:
- Keep all text explicit and adult-themed where appropriate
- Match personality traits to faction expectations (mercenaries are aggressive, tourists are naive, etc.)
- Make backstory believable and emotionally resonant
- Distinctive features should be visually interesting and memorable
- Secrets should create potential for drama or story development
- Desires should include both romantic/sexual and practical goals
- Greeting should reflect their relationship status (strangers at first)
- Return ONLY valid JSON with no additional commentary

JSON FORMAT:
{
  "appearance": { ... },
  "background": { ... },
  "personalityDetails": { ... },
  "dialogueSamples": { ... }
}`;

  return `${context}\n${instructions}\n${constraints}`;
}

/**
 * Build dialogue prompt for NPC conversation
 * @param {object} npc - NPC object
 * @param {string} playerMessage - What player said
 * @param {string} context - Current situation context
 * @param {Array} conversationHistory - Recent message history
 * @returns {string} Dialogue prompt
 */
export function buildDialoguePrompt(npc, playerMessage, context = '', conversationHistory = []) {
  // Extract NPC properties
  const personality = npc.getPersonalitySummary();
  const mood = npc.getMood();
  const relationship = npc.relationships.player;
  const phase = npc.memory.conversationPhase;
  const relevantMemories = npc.getRelevantMemories(playerMessage, 3);
  
  // Determine relationship tone
  let relationshipTone = 'neutral';
  if (relationship.opinion > 50) relationshipTone = 'friendly';
  if (relationship.opinion > 75) relationshipTone = 'warm';
  if (relationship.opinion < -50) relationshipTone = 'hostile';
  if (relationship.romantic > 60) relationshipTone = 'flirtatious';
  if (relationship.fear > 70) relationshipTone = 'fearful';
  
  // Context section
  const contextSection = `You are roleplaying as ${npc.identity.name}, ${npc.identity.title}.

CHARACTER PROFILE:
- Age: ${npc.appearance.age}, Gender: ${npc.appearance.gender}
- Faction: ${npc.identity.faction}
- Role: ${npc.identity.role}
- Personality: ${personality}
- Current Mood: ${mood}
- Physical Description: ${npc.appearance.distinctiveFeatures?.join(', ') || 'unremarkable'}

RELATIONSHIP WITH PLAYER:
- Opinion: ${relationship.opinion}/100 (${relationshipTone})
- Trust: ${relationship.trust}/100
- Respect: ${relationship.respect}/100
- Fear: ${relationship.fear}/100
- Romantic Interest: ${relationship.romantic}/100
- Interaction Count: ${relationship.interactionCount}
- Conversation Phase: ${phase}`;

  // Build memory context
  let memorySection = '';
  if (relevantMemories.length > 0) {
    memorySection = '\n\nRECENT RELEVANT MEMORIES:';
    relevantMemories.forEach((mem, i) => {
      memorySection += `\n${i + 1}. ${mem.description} (importance: ${mem.importance})`;
    });
  }
  
  // Build conversation history
  let historySection = '';
  if (conversationHistory.length > 0) {
    historySection = '\n\nRECENT CONVERSATION:';
    conversationHistory.forEach(entry => {
      const speaker = entry.speaker === 'player' ? 'Player' : npc.identity.name;
      historySection += `\n${speaker}: "${entry.message}"`;
    });
  }
  
  // Current situation
  const situationSection = `\n\nCURRENT SITUATION:
${context || 'You are talking with the player.'}

PLAYER JUST SAID:
"${playerMessage}"`;

  // Instructions section
  const instructions = `
RESPOND AS ${npc.identity.name.toUpperCase()}:
- Talk like a NORMAL PERSON, not a fortune cookie
- Use simple, direct language - NO poetic metaphors or dramatic flourishes
- NO clichés, NO cryptic wisdom, NO theatrical descriptions
- If they're practical, they give practical answers
- If they're friendly, they sound like a friend, not a philosopher
- Match your tone to the relationship status (${relationshipTone})
- Keep response natural and conversational (1-3 sentences)
- DO NOT use narration, actions in asterisks, or meta-commentary
- DO NOT refer to yourself in third person
- DO NOT repeat things you said in recent conversation
- Speak directly as the character`;

  // Constraints section
  const constraints = `
CRITICAL SPEECH RULES:
- Talk like you're having a real conversation, not writing a novel
- BANNED PHRASES: "heh", mystical nonsense, overly dramatic narration
- NO excessive punctuation (more than 3 dots in a row)
- NO references to tattoos, scars, or appearance unless directly asked
- NO unsolicited life lessons or philosophical musings
- Just answer the question like a human being would
- Response must be direct dialogue only (no "She said:" or *actions*)
- Length: 1-3 sentences maximum
- If hostile (opinion < -50), be curt and unfriendly
- If fearful (fear > 70), be nervous and defensive
- If romantic (romantic > 60), include subtle flirtation
- Return ONLY the spoken dialogue, nothing else

EXAMPLES OF GOOD vs BAD:
❌ BAD: "Heh. Navigation's the least of your worries here. That anchor tattoo's not decoration—I earned it..."
✅ GOOD: "I know the area. What do you need?"

❌ BAD: "This island eats the polite ones faster..."
✅ GOOD: "You're welcome. Be careful out there."

❌ BAD: "Lost? Sun's directly overhead—how'd you manage that?"
✅ GOOD: "You're lost? How'd that happen?"`;

  return `${contextSection}${memorySection}${historySection}${situationSection}\n${instructions}\n${constraints}`;
}

/**
 * Build mood description prompt
 * @param {object} npc - NPC object
 * @returns {string} Mood description
 */
export function buildMoodPrompt(npc) {
  const stats = npc.stats;
  const personality = npc.personality.traits;
  const relationship = npc.relationships.player;
  
  const context = `Describe the current emotional state of ${npc.identity.name} in 1-2 sentences.

CONTEXT:
- Health: ${stats.health}/${stats.maxHealth}
- Stamina: ${stats.stamina}/${stats.maxStamina}
- Personality: Openness ${personality.openness}, Conscientiousness ${personality.conscientiousness}, Extraversion ${personality.extraversion}, Agreeableness ${personality.agreeableness}, Neuroticism ${personality.neuroticism}
- Opinion of Player: ${relationship.opinion}/100
- Trust in Player: ${relationship.trust}/100
- Fear of Player: ${relationship.fear}/100

Generate a brief mood description that reflects these stats and traits. Return only the description, no formatting.`;

  return context;
}

/**
 * Build physical description prompt (for AI portrait generation)
 * @param {object} npc - NPC object
 * @returns {string} Detailed physical description for image generation
 */
export function buildPhysicalDescriptionPrompt(npc) {
  const appearance = npc.appearance;
  
  const genderDesc = {
    female: 'woman',
    male: 'man',
    futanari: 'futanari',
    cuntboy: 'cuntboy',
    other: 'person'
  }[appearance.gender?.toLowerCase()] || 'person';
  
  const buildDesc = {
    petite: 'petite, delicate build',
    slim: 'slim, lean build',
    average: 'average, balanced build',
    athletic: 'athletic, toned build',
    curvy: 'curvy, voluptuous build',
    muscular: 'muscular, powerful build',
    heavyset: 'heavyset, robust build'
  }[appearance.build] || 'average build';
  
  // Build detailed prompt
  const prompt = `Portrait of ${genderDesc}, ${appearance.age} years old, ${buildDesc}, ${appearance.skinTone} skin, ${appearance.hairLength} ${appearance.hairColor} hair, ${appearance.hairStyle}, ${appearance.eyeColor} eyes, ${appearance.height}cm tall, ${appearance.distinctiveFeatures?.join(', ')}, wearing ${appearance.clothing}, attractive face, confident expression, tropical island setting, isolated on transparent background, profile portrait, studio lighting`;
  
  return prompt;
}

/**
 * Build action description prompt (what NPC is doing)
 * @param {object} npc - NPC object
 * @param {string} action - Action being performed
 * @param {string} context - Situational context
 * @returns {string} Action description prompt
 */
export function buildActionDescriptionPrompt(npc, action, context = '') {
  const personality = npc.getPersonalitySummary();
  const mood = npc.getMood();
  
  const prompt = `Describe how ${npc.identity.name} performs this action: "${action}"

CHARACTER CONTEXT:
- Personality: ${personality}
- Current Mood: ${mood}
- Physical Build: ${npc.appearance.build}
- Situation: ${context || 'on the tropical island'}

Write 1-2 sentences describing how they perform this action, reflecting their personality and mood. Keep it brief and vivid. Return only the description.`;

  return prompt;
}

/**
 * Build rumor generation prompt (NPCs gossip about player actions)
 * @param {string} event - Event description
 * @param {object} witness - NPC who witnessed it
 * @returns {string} Rumor text
 */
export function buildRumorPrompt(event, witness) {
  const personality = witness.getPersonalitySummary();
  
  const prompt = `${witness.identity.name} witnessed this event: "${event}"

Based on their personality (${personality}), how would they describe this event when gossiping to other NPCs?

Generate a short rumor (1 sentence) they might spread. Make it reflect their personality:
- High agreeableness: sympathetic, downplay negatives
- Low agreeableness: harsh, exaggerate negatives
- High neuroticism: anxious, catastrophize
- High extraversion: dramatic, embellished

Return only the rumor text, no formatting.`;

  return prompt;
}
