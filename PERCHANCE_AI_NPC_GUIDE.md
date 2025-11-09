# Perchance AI-Powered NPC Guide

**Last Updated:** November 8, 2025  
**Game:** Free Use Office Clicker  
**AI System:** Perchance `ai-text-plugin` (generateText)

---

## Table of Contents

1. [Overview](#overview)
2. [Core Concept](#core-concept)
3. [The generateText Function](#the-generatetext-function)
4. [Prompt Engineering Principles](#prompt-engineering-principles)
5. [NPC Conversation System](#npc-conversation-system)
6. [Response Sanitization](#response-sanitization)
7. [Common Use Cases](#common-use-cases)
8. [Best Practices](#best-practices)
9. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
10. [Advanced Techniques](#advanced-techniques)

---

## Overview

This game uses Perchance's `ai-text-plugin` to create dynamic, personality-driven AI NPCs that respond contextually to player actions. The system generates:

- **1-on-1 Chat Conversations** - Deep, stateful conversations with relationship progression
- **Group Meeting Dynamics** - Multi-NPC conversations with intelligent speaker selection
- **Social Media Posts** - Context-aware posts about work, life, and relationships
- **Social Media Comments** - Personality-driven reactions to posts
- **Proactive Messages** - NPCs reaching out based on events and relationship state
- **Money Requests** - Context-aware financial requests with AI-generated reasoning
- **Image Descriptions** - Custom prompts for image generation based on context

---

## Core Concept

### The AI-Driven NPC Philosophy

**Traditional Approach (Template-Based):**
```javascript
// ❌ Old way - rigid, limited, predictable
if (affection > 70) {
  return "I love working with you! 💕";
} else {
  return "Thanks boss! 👍";
}
```

**AI-Driven Approach (Dynamic):**
```javascript
// ✅ New way - contextual, personality-driven, emergent behavior
const prompt = `You are ${npc.name}, a ${npc.personality} person.
The player just gave you a gift. Your affection is ${affection}/100.
Recent memories: ${memories}
Respond naturally (2-3 sentences).`;

const response = await generateText(prompt);
```

**Key Advantages:**
- NPCs remember past conversations and reference them naturally
- Personalities emerge from stats (affection, trust, desire, obedience)
- Context-aware responses (time of day, recent events, relationship history)
- Unpredictable but consistent behavior
- Emergent storytelling without scripted paths

---

## The generateText Function

### Basic Usage

```javascript
const response = await generateText(prompt);
```

### With Parameters

```javascript
const response = await generateText(prompt, {
  temperature: 0.85,      // 0.0-1.0: creativity (higher = more random)
  top_p: 0.92,           // Nucleus sampling (0.9-0.95 typical)
  max_tokens: 150,       // Maximum response length
  frequency_penalty: 0.3, // Reduce word repetition (0.0-2.0)
  stopSequences: ['\n\n', 'Player:', 'Boss:'] // Stop at these strings
});
```

### Response Extraction

The game uses a helper function to handle various response formats:

```javascript
function extractText(response) {
  if (!response) return '';
  
  // If it's already a primitive string, return it
  if (typeof response === 'string') {
    return response.trim();
  }
  
  // If it's an object (including String object), extract the text
  if (typeof response === 'object') {
    const text = response.text || response.generatedText || response.prompt || String(response);
    return String(text).trim();
  }
  
  // Fallback: convert to string
  return String(response).trim();
}
```

**Always use this pattern:**
```javascript
const raw = await generateText(prompt);
const cleaned = extractText(raw);
const sanitized = sanitizeNpcResponse(cleaned, maxSentences);
```

---

## Prompt Engineering Principles

### 1. Structure: Context → Instructions → Constraints

**Good Prompt Structure:**
```
=== CONTEXT (Who, Where, When) ===
You are [Name], [personality]. You work as [job].
Current stats: Affection ${affection}, Trust ${trust}
Time: ${timeOfDay}, Location: ${location}

=== RECENT EVENTS ===
${recentMemories}

=== CURRENT SITUATION ===
The player just ${action}.

=== INSTRUCTIONS ===
Respond naturally (3-5 sentences). Show your personality through:
- Your ${trait1} and ${trait2} nature
- Your current mood: ${mood}
- Your relationship with the player

=== CONSTRAINTS ===
- NO meta-commentary
- NO third-person narration
- NO bullet points or analysis
- JUST respond as the character

${characterName}'s response:
```

### 2. Always Provide Character Identity

```javascript
// ❌ Bad - AI doesn't know who it is
const prompt = `Respond to this message: "${playerMessage}"`;

// ✅ Good - Clear identity
const prompt = `You are ${emp.name}, a ${emp.age}-year-old ${emp.gender}.
Personality: ${emp.keyTrait} - ${emp.personalityTraits.join(', ')}
Your response to: "${playerMessage}"`;
```

### 3. Include Relationship Context

```javascript
const relationshipContext = `
Your relationship with the player:
- Affection: ${affection}% (${affection > 70 ? 'deeply care about them' : 'neutral'})
- Trust: ${trust}% (${trust > 70 ? 'trust them completely' : 'still building trust'})
- Desire: ${desire}% (${desire > 60 ? 'attracted to them' : 'platonic'})
- Recent interactions: ${recentEvents}
`;
```

### 4. Memory Integration

```javascript
// Retrieve relevant memories (using semantic search or recency)
const memories = retrieveMemories(emp, playerMessage, 40);

const memoryContext = memories.length > 0 
  ? `\n=== RELEVANT MEMORIES ===\n${memories.map(m => `- ${m.content}`).join('\n')}\n===`
  : '';
```

### 5. Conversation History

```javascript
// Include last 10 messages for context
const conversationHistory = gameState.chatHistory[emp.id]
  .slice(-10)
  .map(msg => `${msg.sender}: ${msg.content}`)
  .join('\n');

const historySection = `
=== RECENT CONVERSATION (for context only - do NOT repeat or echo these messages) ===
${conversationHistory}
===

CRITICAL: Respond ONLY as ${emp.name} with a NEW single message.
DO NOT repeat or include previous conversation messages in your response.
`;
```

---

## NPC Conversation System

### buildChatPrompt Function

The core function that builds comprehensive prompts for NPC conversations:

```javascript
function buildChatPrompt(emp, conversationHistory, lastMessage) {
  // 1. Calculate relationship state
  const affection = emp.stats.affection ?? 0;
  const desire = emp.stats.desire ?? 0;
  const trust = emp.stats.trust ?? 0;
  const relationshipScore = (affection + comfort + desire) / 3;
  
  // 2. Update conversation phase
  if (relationshipScore > 70) emp.memory.conversationPhase = 'intimate';
  else if (relationshipScore > 40) emp.memory.conversationPhase = 'familiar';
  else emp.memory.conversationPhase = 'early';
  
  // 3. Build personality modifiers from stats
  const affectionTone = affection < 25 ? 'polite but neutral' :
    affection < 50 ? 'friendly and cordial' :
    affection < 75 ? 'warm and caring' :
    'deeply affectionate';
  
  // 4. Get intelligent context (recent memories, events, flags)
  const intelligentContext = getIntelligentContext(emp, 'chat.casual', {
    message: lastMessage,
    recentMessages: conversationHistory.split('\n').slice(-5)
  });
  
  // 5. Build style directives
  const styleDirectives = [
    'Natural conversation: 3-5 sentences',
    'Use *asterisks* for physical actions',
    '🚫 NEVER describe eye/hair color repeatedly',
    '🚫 AVOID "honestly", "actually" overuse',
    'CRITICAL: Stay in character, NO meta-commentary'
  ];
  
  // 6. Assemble final prompt
  const prompt = `
=== WHO YOU ARE ===
${intelligentContext}

=== PLAYER ===
${playerDescription}

=== CONVERSATION HISTORY ===
${conversationHistory}

=== CURRENT MESSAGE ===
Player: ${lastMessage}

=== STYLE GUIDELINES ===
${styleDirectives.join('\n')}

=== RESPOND ===
${emp.name}:`;
  
  return { prompt, mood: `Affection: ${affection}%, Trust: ${trust}%` };
}
```

### Example Chat Response Flow

```javascript
async function handlePlayerMessage(emp, message) {
  // 1. Add player message to history
  gameState.chatHistory[emp.id].push({
    sender: 'You',
    content: message,
    isPlayer: true,
    timestamp: Date.now()
  });
  
  // 2. Build conversation history
  const conversationHistory = gameState.chatHistory[emp.id]
    .slice(-10)
    .map(msg => `${msg.sender}: ${msg.content}`)
    .join('\n');
  
  // 3. Build AI prompt
  const { prompt } = buildChatPrompt(emp, conversationHistory, message);
  
  // 4. Generate response
  const raw = await generateText(prompt, {
    temperature: 0.8,
    max_tokens: 150,
    stopSequences: ['\n\n', 'Player:', 'Boss:']
  });
  
  // 5. Sanitize response
  const response = sanitizeNpcResponse(raw, 5);
  
  // 6. Save to history
  gameState.chatHistory[emp.id].push({
    sender: emp.name,
    content: response,
    isPlayer: false,
    timestamp: Date.now()
  });
  
  // 7. Update UI
  renderChatMessages();
  
  // 8. Update stats based on conversation
  updateEmployeeStatsFromChat(emp, message, response);
}
```

---

## Response Sanitization

### The sanitizeNpcResponse Function

Critical for cleaning AI responses and preventing common issues:

```javascript
function sanitizeNpcResponse(text, maxSentences = 5) {
  let cleaned = String(text).trim();
  
  // 1. Remove Perchance plugin tokens
  cleaned = cleaned.replace(/\{[A-Z_]+:[^}]*\}/g, '');
  
  // 2. Remove quotes
  cleaned = cleaned.replace(/^["']|["']$/g, '');
  
  // 3. Remove meta-commentary prefixes
  cleaned = cleaned.replace(/^(Here's |Based on |My response is:? |I would say:? )/i, '');
  
  // 4. Remove name prefixes (with possessive or colon)
  cleaned = cleaned.replace(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:'s\s+(?:comment|reply)?|:\s*["']?)/i, '');
  
  // 5. Remove third-person narration
  cleaned = cleaned.replace(/^\*.*?\*\s*/g, '');
  cleaned = cleaned.replace(/^[A-Z][a-z]+\s+(raised|smiled|grinned|chuckled).*?\.\s*/i, '');
  
  // 6. Limit to maxSentences
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];
  if (sentences.length > maxSentences) {
    cleaned = sentences.slice(0, maxSentences).join(' ');
  }
  
  // 7. Ensure complete sentence (no trailing ellipsis unless intentional)
  if (cleaned.endsWith('...') && !cleaned.match(/\.\.\.$/) && maxSentences > 0) {
    cleaned = cleaned.slice(0, -3) + '.';
  }
  
  return cleaned.trim();
}
```

### Common Sanitization Patterns

**Remove Meta-Commentary:**
```javascript
// Input: "Here's my response based on my personality: I love working here!"
// Output: "I love working here!"

cleaned = cleaned.replace(/^(Here's |Based on |My comment is:? )/i, '');
```

**Remove Name Prefixes:**
```javascript
// Input: "Sarah: I think that's a great idea!"
// Output: "I think that's a great idea!"

cleaned = cleaned.replace(/^[A-Z][a-z]+:\s*/i, '');
```

**Remove Narration:**
```javascript
// Input: "*Sarah smiles warmly* I really appreciate that!"
// Output: "I really appreciate that!"

cleaned = cleaned.replace(/^\*.*?\*\s*/g, '');
```

---

## Common Use Cases

### 1. Chat Conversations

**Simple Response:**
```javascript
const prompt = `You are ${emp.name} (${emp.personality}).
Affection: ${affection}%, Trust: ${trust}%

Player: "${message}"

Respond naturally (2-4 sentences):`;

const response = await generateText(prompt);
```

**Context-Aware Response:**
```javascript
const prompt = buildChatPrompt(emp, conversationHistory, message).prompt;
const raw = await generateText(prompt, {
  temperature: 0.8,
  max_tokens: 150
});
const response = sanitizeNpcResponse(raw, 5);
```

### 2. Social Media Posts

**Generate Post Content:**
```javascript
const prompt = `You are ${emp.name}, posting on social media.

Personality: ${emp.keyTrait} - ${emp.personalityTraits.join(', ')}
Recent events: ${recentMemories}
Mood: ${mood}

Generate a social media post (1-3 sentences) about:
${topic}

Style: ${style} (casual/professional/flirty/humorous)
Tone: Authentic to your personality

Post:`;

const content = await generateText(prompt, {
  temperature: 0.9, // Higher for creativity
  max_tokens: 80
});
```

### 3. Social Media Comments

**Generate Comment on Post:**
```javascript
const prompt = `You are ${emp.name} commenting on a social media post.

POST: "${postContent}"
${hasImage ? `[Post has image: ${imageContext}]` : ''}

Your personality: ${personalityDesc}
Relationship with poster: ${relationshipLevel}

CRITICAL RULES:
- Write ONLY the comment text itself (5-20 words)
- NO third-person narration
- NO meta-text
- Be natural like a real social media comment

Your comment:`;

const response = await generateText(prompt, {
  temperature: 0.85,
  max_tokens: 35,
  stopSequences: ['\n\n', 'Boss:', 'Comment:']
});
```

### 4. Proactive Messages

**NPC Initiating Conversation:**
```javascript
const prompt = `You are ${emp.name}, messaging your boss unprompted.

Current time: ${timeOfDay}
Your stats: Affection ${affection}%, Trust ${trust}%
Recent memories: ${memories}
Last conversation: ${lastConversationSummary}

Send a message based on:
- Your relationship (${relationshipPhase})
- Recent events you remember
- Your personality (${traits})

Types of messages you might send:
- Work updates (if professional relationship)
- Casual chat (if friendly)
- Flirting (if desire > 60)
- Sharing something personal (if trust > 70)

Message (2-4 sentences):`;

const message = await generateText(prompt);
```

### 5. Money Requests

**Generate Request Reasoning:**
```javascript
const prompt = `You are ${emp.name}. You need $${amount} from your boss.

Your financial state:
- Bank balance: $${bankBalance}
- Spending rate: $${spendingRate}/day
- Time until broke: ${timeUntilBroke} days

Your personality: ${personality}
Relationship: Affection ${affection}%, Trust ${trust}%

Generate a 1-2 sentence reason for needing this money.
Be specific and authentic to your personality.
Consider: bills, hobbies, emergencies, goals, lifestyle

Reason:`;

const reason = await generateText(prompt, {
  temperature: 0.85,
  max_tokens: 50
});
```

### 6. Image Generation Prompts

**Build Custom Image Prompt:**
```javascript
const prompt = `Generate a detailed image prompt for an AI image generator.

Character: ${emp.name}
Physical description: ${physicalDesc}
Request: "${customRequest}"
Context: ${conversationContext}

Create a single comprehensive prompt (1-2 sentences) that:
- Describes the scene/pose requested
- Includes character's appearance
- Matches the tone of the request
- Is suitable for an image generator

Image prompt:`;

const imagePrompt = await generateText(prompt, {
  temperature: 0.7,
  max_tokens: 100
});
```

---

## Best Practices

### 1. Always Provide Context Layers

**Minimum Context:**
- Character identity (name, personality)
- Current relationship state (affection, trust, desire)
- Immediate situation (what just happened)

**Enhanced Context:**
- Recent memories (last 3-5 significant events)
- Conversation history (last 5-10 messages)
- Time context (time of day, day of week)
- Social context (other NPCs, recent posts)

### 2. Use Appropriate Temperature

```javascript
// Low temperature (0.5-0.7) - More focused, consistent
// Use for: Professional responses, factual information
const response = await generateText(prompt, { temperature: 0.6 });

// Medium temperature (0.7-0.9) - Balanced creativity
// Use for: Casual chat, normal conversations
const response = await generateText(prompt, { temperature: 0.8 });

// High temperature (0.9-1.2) - Very creative, unpredictable
// Use for: Social posts, creative content, group dynamics
const response = await generateText(prompt, { temperature: 1.0 });
```

### 3. Set Stop Sequences

Prevent AI from continuing beyond the character's response:

```javascript
const stopSequences = [
  '\n\n',           // Double newline
  '\n---',          // Section break
  'Player:',        // Player's turn
  'Boss:',          // Player's turn
  `${emp.name}:`,   // Prevent repeating own name
  'Personality:',   // Meta-commentary
  'Analysis:',      // Meta-commentary
  '{SEEDS',         // Perchance tokens
  '{BAN'            // Perchance tokens
];

const response = await generateText(prompt, { stopSequences });
```

### 4. Implement Regeneration with Variation

When player clicks "regenerate", add variation strategies:

```javascript
const variationStrategies = [
  'Use a completely new tone. Include details you didn\'t mention before.',
  'If you were formal before, be casual now. Show another side.',
  'Focus on aspects you haven\'t explored yet. Use new examples.',
  'Shift your emotional tone. Reveal a new facet of your personality.'
];

const strategy = variationStrategies[Math.floor(Math.random() * variationStrategies.length)];
const enhancedPrompt = basePrompt + '\n\n' + strategy;

// Increase temperature on each regeneration
const temperature = Math.min(1.2, 0.7 + (regenerationCount * 0.1));
```

### 5. Track and Prevent Repetition

Analyze recent responses for overused phrases:

```javascript
function analyzeResponseForRepetition(empId, response) {
  const recentResponses = gameState.chatHistory[empId]
    .filter(msg => !msg.isPlayer)
    .slice(-5)
    .map(msg => msg.content.toLowerCase());
  
  const warnings = [];
  
  // Check for physical description repetition
  const physicalDescPattern = /(eyes?|hair|lips|skin|face)/i;
  const physicalCount = recentResponses.filter(r => physicalDescPattern.test(r)).length;
  if (physicalCount >= 3) {
    warnings.push('🚫 Stop describing physical features (mentioned in last 3 messages)');
  }
  
  // Check for filler word overuse
  const fillers = ['honestly', 'actually', 'basically', 'literally'];
  fillers.forEach(filler => {
    const count = recentResponses.filter(r => r.includes(filler)).length;
    if (count >= 2) {
      warnings.push(`🚫 Overusing "${filler}" (${count} times in last 5 messages)`);
    }
  });
  
  return warnings;
}
```

### 6. Memory Integration

Store and retrieve important events:

```javascript
// Store memory
function remember(emp, content, type = 'event', importance = 1.0) {
  if (!emp.memory) emp.memory = { events: [] };
  
  emp.memory.events.push({
    content,
    type, // 'event', 'conversation', 'gift', 'intimate'
    importance,
    timestamp: Date.now(),
    emotionalImpact: calculateEmotionalImpact(emp, content)
  });
  
  // Keep only last 100 memories (or most important)
  if (emp.memory.events.length > 100) {
    emp.memory.events.sort((a, b) => b.importance - a.importance);
    emp.memory.events = emp.memory.events.slice(0, 100);
  }
}

// Retrieve memories
function retrieveMemories(emp, query, maxResults = 40) {
  if (!emp.memory?.events) return [];
  
  // Simple relevance: recent + important + keyword match
  const keywords = query.toLowerCase().split(' ');
  
  return emp.memory.events
    .map(mem => ({
      ...mem,
      relevance: calculateRelevance(mem, keywords)
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, maxResults);
}
```

---

## Anti-Patterns to Avoid

### ❌ DON'T: Dump All Context

```javascript
// Bad - overwhelming, unfocused
const prompt = `
You are ${emp.name}.
Age: ${emp.age}
Gender: ${emp.gender}
Job: ${emp.job}
Hobbies: ${emp.hobbies.join(', ')}
Personality: ${emp.personality}
Stats: ${JSON.stringify(emp.stats)}
Skills: ${JSON.stringify(emp.skills)}
All memories: ${emp.memory.events.map(e => e.content).join('\n')}
All relationships: ${JSON.stringify(emp.relationships)}

Respond to: "${message}"
`;
```

**✅ DO: Provide Intelligent, Focused Context**

```javascript
// Good - relevant, prioritized
const relevantMemories = retrieveMemories(emp, message, 5);
const recentConversation = getLastNMessages(emp.id, 5);
const currentMood = calculateMood(emp);

const prompt = `
You are ${emp.name}, a ${emp.personality} ${emp.job}.
Current mood: ${currentMood} (Affection: ${emp.stats.affection})

Recent relevant memories:
${relevantMemories.map(m => `- ${m.content}`).join('\n')}

Recent conversation:
${recentConversation}

Respond to: "${message}"
`;
```

### ❌ DON'T: Ignore Response Sanitization

```javascript
// Bad - raw AI output can have meta-text, formatting issues
const response = await generateText(prompt);
gameState.chatHistory[emp.id].push({ content: response });
```

**✅ DO: Always Sanitize**

```javascript
// Good - cleaned, validated response
const raw = await generateText(prompt);
const response = sanitizeNpcResponse(raw, 5);

// Validate response quality
if (!response || response.length < 10) {
  response = generateFallbackResponse(emp);
}

gameState.chatHistory[emp.id].push({ content: response });
```

### ❌ DON'T: Use Vague Instructions

```javascript
// Bad - AI doesn't know what you want
const prompt = `You are ${emp.name}. Respond to the player.`;
```

**✅ DO: Be Specific and Clear**

```javascript
// Good - explicit expectations
const prompt = `You are ${emp.name}.

Player: "${message}"

Respond with:
- 2-4 complete sentences
- Authentic to your ${emp.personality} personality
- Reflecting your current mood (${mood})
- NO meta-commentary, just stay in character

${emp.name}:`;
```

### ❌ DON'T: Forget Error Handling

```javascript
// Bad - no fallback for API failures
const response = await generateText(prompt);
```

**✅ DO: Implement Graceful Fallbacks**

```javascript
// Good - handles failures elegantly
let response;
try {
  const raw = await generateText(prompt, {
    temperature: 0.8,
    max_tokens: 150
  });
  response = sanitizeNpcResponse(raw, 5);
  
  // Validate response
  if (!response || response.length < 10) {
    throw new Error('Response too short');
  }
} catch (error) {
  console.error('AI generation failed:', error);
  response = generateTemplateResponse(emp, context);
}
```

### ❌ DON'T: Ignore Token Limits

```javascript
// Bad - can exceed context window
const prompt = `
${entire_conversation_history} // Could be 10,000+ tokens!
${all_memories} // Another 5,000 tokens!
${complete_game_state} // Even more!
`;
```

**✅ DO: Manage Context Window**

```javascript
// Good - curated, focused context
const recentMessages = gameState.chatHistory[emp.id].slice(-10); // Last 10 only
const relevantMemories = retrieveMemories(emp, message, 5); // Top 5 relevant
const essentialContext = buildEssentialContext(emp); // Only what's needed

// Estimated tokens: ~500-1000 (well within limits)
const prompt = buildCompactPrompt(essentialContext, recentMessages, relevantMemories);
```

---

## Advanced Techniques

### 1. Multi-NPC Group Dynamics

**Speaker Selection AI:**
```javascript
async function selectNextSpeaker(meeting, playerMessage) {
  const participants = meeting.participants.map(p => {
    const emp = gameState.employees.find(e => e.id === p.id);
    return {
      name: emp.name,
      personality: emp.keyTrait,
      recentlySpokeCount: p.recentSpeaks || 0,
      affection: emp.stats.affection,
      relevantSkills: getRelevantSkills(emp, playerMessage)
    };
  });
  
  const prompt = `You are facilitating a group meeting.

Participants:
${participants.map(p => `- ${p.name} (${p.personality}), spoke ${p.recentlySpokeCount} times recently`).join('\n')}

Player just said: "${playerMessage}"

Who should respond next? Consider:
- Topic relevance (who has expertise?)
- Speaking balance (who hasn't spoken much?)
- Personality (who would naturally jump in?)
- Direct mentions or questions

Output ONLY the name of who should speak next:`;

  const response = await generateText(prompt, {
    temperature: 0.7,
    max_tokens: 20
  });
  
  return findParticipantByName(participants, response.trim());
}
```

### 2. Relationship-Aware Responses

**Dynamic Personality Modifiers:**
```javascript
function buildPersonalityModifiers(emp, player) {
  const affection = emp.stats.affection || 0;
  const trust = emp.stats.trust || 0;
  const desire = emp.stats.desire || 0;
  
  const modifiers = [];
  
  // Affection influences warmth
  if (affection > 70) {
    modifiers.push('You care deeply about the player. Let warmth color your words.');
  } else if (affection < 30) {
    modifiers.push('You\'re polite but neutral. Don\'t be overly warm.');
  }
  
  // Trust influences openness
  if (trust > 70) {
    modifiers.push('You trust them completely. Share vulnerably.');
  } else if (trust < 30) {
    modifiers.push('You\'re cautious. Don\'t reveal too much.');
  }
  
  // Desire influences flirtation
  if (desire > 70 && affection > 50) {
    modifiers.push('You\'re attracted to them. Subtle flirting is natural.');
  }
  
  return modifiers.join('\n');
}
```

### 3. Context-Aware Image Requests

**Analyze Request Intent:**
```javascript
async function analyzeImageRequest(emp, request, conversationContext) {
  const prompt = `Analyze this image request in context.

REQUEST: "${request}"
CONTEXT: ${conversationContext}
RELATIONSHIP: Affection ${emp.stats.affection}%, Desire ${emp.stats.desire}%

Determine:
1. Type (selfie/work/explicit/costume/activity)
2. Intimacy level needed (0-100)
3. Setting/location
4. Clothing/outfit
5. Pose/mood

Output as JSON:
{
  "type": "...",
  "intimacyLevel": 0-100,
  "setting": "...",
  "clothing": "...",
  "pose": "..."
}`;

  const analysis = await generateText(prompt, {
    temperature: 0.5, // Lower for more consistent structure
    max_tokens: 100
  });
  
  return JSON.parse(analysis);
}
```

### 4. Proactive Message Timing

**Smart Timing AI:**
```javascript
async function shouldSendProactiveMessage(emp) {
  const timeSinceLastMessage = Date.now() - (emp.lastMessageTime || 0);
  const hoursSince = timeSinceLastMessage / (1000 * 60 * 60);
  
  const prompt = `You are ${emp.name}. Should you message your boss right now?

Time since last conversation: ${hoursSince.toFixed(1)} hours
Your relationship: Affection ${emp.stats.affection}%, Trust ${emp.stats.trust}%
Recent events: ${emp.recentMemories.slice(-3).join(', ')}
Time of day: ${getCurrentTimeOfDay()}
Your personality: ${emp.keyTrait}

Consider:
- Too soon? (wait at least 4-6 hours for casual messages)
- Too late at night? (after 10pm might be intrusive)
- Do you have something to say? (not just "hey")
- Would your personality reach out unprompted?

Respond with ONLY "yes" or "no":`;

  const response = await generateText(prompt, {
    temperature: 0.6,
    max_tokens: 5
  });
  
  return response.toLowerCase().includes('yes');
}
```

### 5. Emotional State Tracking

**Derive Mood from Stats:**
```javascript
function calculateCurrentMood(emp) {
  const { affection, trust, desire, productivity, stress } = emp.stats;
  
  // Combine stats into mood descriptors
  if (stress > 70) return 'stressed and overwhelmed';
  if (productivity > 80 && affection > 60) return 'accomplished and happy';
  if (desire > 70 && affection > 60) return 'flirty and playful';
  if (affection > 80 && trust > 80) return 'deeply content and close';
  if (affection < 30 && trust < 30) return 'distant and formal';
  
  return 'calm and professional';
}

// Use in prompts
const prompt = `You are ${emp.name}.
Current mood: ${calculateCurrentMood(emp)}
...`;
```

### 6. Response Variety Enforcement

**Detect and Prevent Formula:**
```javascript
function enforceResponseVariety(emp, newResponse) {
  const recentResponses = gameState.chatHistory[emp.id]
    .filter(msg => !msg.isPlayer)
    .slice(-5);
  
  // Check for structural repetition
  const patterns = [
    /^(Honestly|Actually|Basically),/i,
    /But honestly\?$/i,
    /\*.*?(eyes|hair|lips).*?\*/i,
    /I (really |totally |absolutely )?appreciate/i
  ];
  
  for (const pattern of patterns) {
    const recentCount = recentResponses.filter(r => pattern.test(r.content)).length;
    if (recentCount >= 2 && pattern.test(newResponse)) {
      // Flag for regeneration with variety instruction
      return {
        shouldRegenerate: true,
        reason: `Pattern "${pattern}" used ${recentCount} times recently`
      };
    }
  }
  
  return { shouldRegenerate: false };
}
```

---

## Summary

### The Golden Rules

1. **Always provide character identity** - Name, personality, stats
2. **Include relationship context** - Affection, trust, desire levels
3. **Use conversation history** - Last 5-10 messages for continuity
4. **Add relevant memories** - Recent events the NPC would remember
5. **Set appropriate temperature** - 0.6-0.8 for chat, 0.9+ for posts
6. **Sanitize all responses** - Remove meta-text, narration, formatting
7. **Implement fallbacks** - Handle API failures gracefully
8. **Prevent repetition** - Track patterns, add variation strategies
9. **Manage token limits** - Curate context, don't dump everything
10. **Test and iterate** - Monitor output quality, refine prompts

### The AI NPC Formula

```
CONTEXT (who, where, when, stats)
  +
MEMORIES (relevant past events)
  +
CONVERSATION (recent history)
  +
INSTRUCTIONS (what to do)
  +
CONSTRAINTS (what NOT to do)
  =
DYNAMIC, PERSONALITY-DRIVEN NPC RESPONSE
```

This approach creates NPCs that feel alive, remember interactions, grow relationships, and provide emergent storytelling without rigid scripting.

---

**End of Guide**
