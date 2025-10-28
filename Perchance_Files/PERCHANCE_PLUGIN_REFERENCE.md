# 🎯 Perchance Plugin Reference Guide
**For Building Complex Interactive Generators**

This reference extracts battle-tested patterns from a production idle game with 39k+ lines of code. Use these patterns to build your next ambitious Perchance project.

---

## 📦 Table of Contents
1. [Plugin Setup & Imports](#plugin-setup--imports)
2. [generateText Plugin - AI Text Generation](#generatetext-plugin---ai-text-generation)
3. [generateImage Plugin - AI Image Generation](#generateimage-plugin---ai-image-generation)
4. [KV Plugin - Persistent Data Storage](#kv-plugin---persistent-data-storage)
5. [Helper Functions & Best Practices](#helper-functions--best-practices)
6. [Performance Optimization Patterns](#performance-optimization-patterns)
7. [Error Handling & Fallbacks](#error-handling--fallbacks)
8. [Advanced Patterns](#advanced-patterns)

---

## 🔌 Plugin Setup & Imports

### perchance.logic File Structure
```plaintext
generateImage = {import:text-to-image-plugin}
generateText = {import:ai-text-plugin}
kv = {import:kv-plugin}
date = {import:date-plugin}
favicon = {import:favicon-plugin}
commentsPlugin = {import:comments-plugin}
fullscreenButton = {import:fullscreen-button-plugin}
speak = {import:text-to-speech-plugin}
literal = {import:literal-plugin}
remember = {import:unsafe-rememberchange}
backgroundImage = {import:background-image-plugin}
generatorStats = {import:generator-stats-plugin}

$meta
  title = 💼✨ Your Generator Title
  description = Your generator description for SEO
  image = https://your-preview-image.png
  tags = idle game, clicker, ai, interactive
```

### Checking Plugin Availability
```javascript
// Always check if plugins are available before using them
const hasAI = typeof generateText === 'function';
const hasImages = typeof generateImage === 'function';

if (!hasAI) {
  console.warn('AI text plugin not available - using fallback');
  // Provide fallback behavior
}
```

---

## 📝 generateText Plugin - AI Text Generation

### Basic Usage Pattern
```javascript
// Simple text generation
const response = await generateText("Generate a creative business name");

// With options
const response = await generateText(prompt, {
  temperature: 0.8,      // 0.0-2.0 (higher = more creative)
  max_tokens: 300,       // Response length limit
  stopSequences: ['---', 'Note:']  // Stop generation at these strings
});
```

### Advanced Pattern: Structured JSON Generation
```javascript
/**
 * Generate structured data with retry logic and validation
 * This pattern ensures you get valid JSON even when AI is unpredictable
 */
async function generateStructuredGift(concept, budget) {
  const prompt = `Generate a gift item as JSON:

REQUIRED FORMAT:
{
  "name": "Gift Name",
  "price": 1234,
  "category": "LUXURY|EXPERIENCE|TECH|VEHICLE|FOOD",
  "description": "One sentence",
  "imagePrompt": "Image description"
}

STRICT RULES:
- Price must match real-world market value
- Use USD without $ symbol (e.g., 50000 not $50000)
- Category must be exactly one of the 5 options above
- Keep descriptions under 100 characters

Generate gift for: "${concept}" (budget: $${budget})
Return ONLY the JSON object, no other text:`;

  try {
    const response = await generateText(prompt, {
      temperature: 0.8,
      max_tokens: 300
    });
    
    // Extract JSON from response (AI sometimes adds extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : response.trim();
    
    const gift = JSON.parse(jsonStr);
    
    // Validate required fields
    if (!gift.name || !gift.price || !gift.category) {
      throw new Error('Missing required fields');
    }
    
    // Validate category
    const validCategories = ['LUXURY', 'EXPERIENCE', 'TECH', 'VEHICLE', 'FOOD'];
    if (!validCategories.includes(gift.category)) {
      console.warn(`Invalid category "${gift.category}", defaulting to LUXURY`);
      gift.category = 'LUXURY';
    }
    
    return gift;
    
  } catch (e) {
    console.error('Failed to generate gift:', e);
    // Return fallback object
    return {
      name: concept,
      price: budget,
      category: 'LUXURY',
      description: 'A thoughtful gift',
      imagePrompt: `${concept}, product photography, high quality`
    };
  }
}
```

### Pattern: Character Profile Generation
```javascript
/**
 * Generate detailed character profiles with consistent structure
 */
async function generateCharacterProfile(basicInfo) {
  const prompt = `Generate a detailed character profile as JSON:

INPUT:
- Name: ${basicInfo.name}
- Age: ${basicInfo.age}
- Role: ${basicInfo.role}
- Traits: ${basicInfo.traits.join(', ')}

REQUIRED JSON FORMAT:
{
  "name": {"first": "...", "last": "..."},
  "age": 25,
  "bio": "2-3 sentence biography",
  "appearance": {
    "heightBuild": "tall and athletic",
    "hair": {"color": "brown", "style": "wavy", "length": "shoulder"},
    "eyes": {"color": "blue", "shape": "round"},
    "skinTone": "light olive",
    "bodyShape": "athletic",
    "fashion": "business casual"
  },
  "personalityTraits": ["confident", "analytical", "friendly"],
  "backgroundStory": "Brief background 1-2 sentences"
}

Generate realistic, detailed profile. Return ONLY valid JSON:`;

  const response = await generateText(prompt, {
    temperature: 0.9,  // Higher creativity for characters
    max_tokens: 500
  });
  
  try {
    const parsed = JSON.parse(response);
    return parsed;
  } catch (e) {
    // Fallback with basic info
    return {
      name: basicInfo.name,
      age: basicInfo.age,
      bio: "A capable professional with a friendly demeanor.",
      appearance: generateDefaultAppearance(),
      personalityTraits: basicInfo.traits
    };
  }
}
```

### Pattern: Context-Aware Conversation
```javascript
/**
 * Generate contextual chat responses using conversation history
 */
async function generateChatResponse(character, recentMessages, playerAction) {
  // Build context from recent messages
  const conversationContext = recentMessages
    .slice(-5)  // Last 5 messages
    .map(msg => `${msg.sender}: ${msg.text}`)
    .join('\n');
  
  const prompt = `You are ${character.name}, a ${character.role}.

PERSONALITY: ${character.personality}
CURRENT MOOD: ${character.currentMood}
RELATIONSHIP LEVEL: ${character.affection}/100

RECENT CONVERSATION:
${conversationContext}

PLAYER ACTION: ${playerAction}

Respond as ${character.name} would, staying in character. 
- Keep response 1-3 sentences
- Match the conversation's tone
- Reference earlier context if relevant
- Show personality through word choice

Response:`;

  const response = await generateText(prompt, {
    temperature: 1.0,  // Natural conversation variability
    max_tokens: 150,
    stopSequences: ['\n\n', 'Player:', 'Note:']
  });
  
  return response.trim();
}
```

### Pattern: Dynamic Content with Examples
```javascript
/**
 * Use examples to guide AI output format and quality
 */
async function generateSocialMediaPost(context) {
  const prompt = `Generate a social media post based on the context.

CONTEXT:
- Event: ${context.event}
- Character: ${context.characterName}
- Location: ${context.location}
- Mood: ${context.mood}

EXAMPLES OF GOOD POSTS:
✅ "Just closed a huge deal! 🎉 Celebrating with the team at Sunset Rooftop. #BusinessLife #Success"
✅ "New project launch went flawlessly. Big thanks to @Sarah for the killer presentation! 💼✨"
✅ "Sometimes you just need a coffee break and good conversation. ☕️ Best office perk = amazing colleagues!"

EXAMPLES OF BAD POSTS (DO NOT COPY):
❌ "I am posting about my day at work" (too generic)
❌ "Having a good time with colleagues at location" (too vague)
❌ Super long rambling posts with no personality

Generate a post (1-2 sentences, include 1-2 relevant emojis, optional hashtags):`;

  const post = await generateText(prompt, {
    temperature: 1.0,
    max_tokens: 100
  });
  
  return post.trim();
}
```

---

## 🎨 generateImage Plugin - AI Image Generation

### Basic Usage
```javascript
// Simple image generation
const imageUrl = await generateImage("sunset over mountains, vibrant colors");

// Using prompt object (recommended)
const imageUrl = await generateImage({
  prompt: "professional headshot, business attire, office setting"
});
```

### Pattern: Global Style System
```javascript
/**
 * Apply consistent art style across ALL image generation
 * This ensures visual coherence throughout your generator
 */
function applyImageStyle(promptInput) {
  // Extract base prompt if already an object
  let basePrompt = typeof promptInput === 'string' 
    ? promptInput 
    : promptInput.prompt || promptInput;
  
  // Get user's style preference
  const selectedStyle = gameState.settings.imageStyle || 'photorealistic';
  
  // Define style directives
  const styleDirectives = {
    photorealistic: "photorealistic, highly detailed, 8k quality, professional photography, natural lighting, sharp focus, realistic textures",
    anime: "anime style, manga aesthetic, cel shaded, vibrant colors, clean lines, Japanese animation style, expressive features",
    artistic: "artistic style, painterly aesthetic, impressionist, brush strokes, artistic interpretation, creative composition, gallery quality",
    cartoon: "cartoon style, comic book aesthetic, bold outlines, simplified shapes, bright colors, animated style, character illustration",
    cinematic: "cinematic lighting, movie scene, dramatic composition, film quality, depth of field, atmospheric, professional cinematography",
    professional: "professional studio lighting, commercial photography, high-end production, polished aesthetic, marketing quality"
  };
  
  // Check if style already applied (prevent duplicates)
  const directive = styleDirectives[selectedStyle] || styleDirectives.photorealistic;
  const hasStyle = basePrompt.toLowerCase().includes(selectedStyle.toLowerCase());
  
  // Append style if not already present
  const styledPrompt = hasStyle 
    ? basePrompt 
    : `${basePrompt}, ${directive}`;
  
  // Debug logging
  console.log(`[Image Style] Selected style: ${selectedStyle}`);
  console.log(`[Image Style] Final prompt ending: ...${styledPrompt.slice(-150)}`);
  
  return { prompt: styledPrompt };
}

// Usage across your entire app
const profileImage = await generateImage(applyImageStyle(
  "professional portrait, business attire, friendly smile"
));

const sceneImage = await generateImage(applyImageStyle(
  "office interior, modern furniture, natural lighting"
));

const productImage = await generateImage(applyImageStyle(
  "luxury watch on wooden desk, product photography"
));
```

### Pattern: Character Portrait Generation
```javascript
/**
 * Generate consistent character portraits using detailed descriptions
 */
async function generateCharacterPortrait(character) {
  // Build detailed physical description
  const physicalDesc = `${character.physical.heightBuild} build, 
    ${character.physical.hair.length} ${character.physical.hair.color} 
    ${character.physical.hair.style} hair, 
    ${character.physical.eyes.color} ${character.physical.eyes.shape} eyes, 
    ${character.physical.skin.tone} skin tone, 
    ${character.physical.body.shape} body shape`;
  
  const prompt = `Professional portrait photo: ${physicalDesc}. 
    Age ${character.age}. 
    ${character.physical.fashion} style outfit. 
    Office setting, soft professional lighting, friendly expression, 
    high quality, 8k resolution`;
  
  try {
    const imageUrl = await generateImage(applyImageStyle(prompt));
    return imageUrl;
  } catch (e) {
    console.error('Failed to generate portrait:', e);
    return null; // Handle gracefully
  }
}
```

### Pattern: Dynamic Scene Visualization
```javascript
/**
 * Generate images based on conversation context
 * First use AI to analyze context, then generate appropriate image
 */
async function visualizeCurrentScene(character, recentMessages, playerBio) {
  // Step 1: AI analyzes conversation to create image prompt
  const analysisPrompt = `You are generating an image prompt for the CURRENT MOMENT in this conversation.

Recent conversation:
${recentMessages.map(m => `${m.sender}: ${m.text}`).join('\n')}

Character: ${character.name} - ${character.appearance.description}
Player: ${playerBio}

Based on the conversation context, create a DETAILED image prompt showing:
1. What are they doing RIGHT NOW?
2. Both characters' poses and expressions
3. Location/setting details
4. Current mood/atmosphere
5. Relevant clothing, props, or environment

CRITICAL: Write ONLY the image description itself. 
NO markdown, NO labels, NO notes. Just the raw visual description.

Image prompt (50-150 words):`;

  let imagePrompt = await generateText(analysisPrompt, {
    temperature: 0.8,
    max_tokens: 200,
    stopSequences: ['---', 'Note:', 'Remember:']
  });
  
  // Clean up AI response (remove any markdown or labels)
  imagePrompt = imagePrompt
    .replace(/<[^>]+>/g, '') // Remove XML tags
    .replace(/^\*\*.*?\*\*\s*/g, '') // Remove bold headers
    .replace(/\*\(Word count:.*?\)\*/g, '') // Remove word count
    .trim();
  
  console.log('[Scene] Generated prompt:', imagePrompt);
  
  // Step 2: Generate the actual image
  try {
    const imageUrl = await generateImage(applyImageStyle(imagePrompt));
    return { success: true, imageUrl, prompt: imagePrompt };
  } catch (e) {
    console.error('[Scene] Image generation failed:', e);
    return { success: false, error: e.message };
  }
}
```

### Pattern: Image Regeneration with User Control
```javascript
/**
 * Allow users to regenerate images if they're not satisfied
 */
async function regenerateImage(messageIndex, originalPrompt) {
  const chatMessages = document.getElementById('chatMessages');
  const msgDiv = chatMessages.children[messageIndex];
  const imgEl = msgDiv.querySelector('img');
  
  if (!imgEl) return;
  
  // Show loading state
  const originalSrc = imgEl.src;
  imgEl.style.opacity = '0.5';
  imgEl.style.filter = 'blur(4px)';
  
  try {
    // Generate new image with same prompt
    const newImageUrl = await generateImage(applyImageStyle(originalPrompt));
    
    // Update image
    imgEl.src = newImageUrl;
    imgEl.style.opacity = '1';
    imgEl.style.filter = 'none';
    
    showNotification('✅ Image regenerated!');
    
  } catch (e) {
    // Restore original on failure
    imgEl.style.opacity = '1';
    imgEl.style.filter = 'none';
    showNotification('❌ Failed to regenerate image. Try again.', 'error');
  }
}
```

### Pattern: Preloading Critical Images
```javascript
/**
 * Preload important images to improve UX
 * Useful for boss fights, key characters, or important scenes
 */
async function preloadBossImage(boss) {
  const modifier = boss.defeated 
    ? ", defeated pose, exhausted" 
    : ", powerful stance, confident";
    
  try {
    const imageUrl = await generateImage(
      applyImageStyle(boss.appearance.prompt + modifier)
    );
    boss.imageUrl = imageUrl;
    console.log(`[Preload] Boss "${boss.name}" image loaded`);
  } catch (e) {
    console.warn(`[Preload] Failed to load boss image:`, e);
    // Set fallback async
    setTimeout(() => {
      generateImage(applyImageStyle(boss.appearance.prompt)).then(url => {
        boss.imageUrl = url;
      });
    }, 2000);
  }
}
```

---

## 💾 KV Plugin - Persistent Data Storage

### Important Note
**The current codebase does NOT use the KV plugin** - it uses `localStorage` instead. However, here's how to properly use KV for cross-session, cross-device data storage in Perchance:

### Basic KV Usage Pattern
```javascript
/**
 * KV plugin provides serverside key-value storage
 * Data persists across devices, browsers, and sessions
 * Perfect for: leaderboards, user profiles, shared world state
 */

// Set data
await kv.set('user-high-score', { score: 10000, timestamp: Date.now() });

// Get data
const highScore = await kv.get('user-high-score');
console.log(highScore); // { score: 10000, timestamp: ... }

// Delete data
await kv.delete('user-high-score');

// Check if key exists
const exists = await kv.get('user-high-score') !== null;
```

### Pattern: Global Leaderboard
```javascript
/**
 * Create a shared leaderboard across all users
 */
async function submitScore(playerName, score) {
  try {
    // Get current leaderboard
    let leaderboard = await kv.get('global-leaderboard') || [];
    
    // Add new score
    leaderboard.push({
      name: playerName,
      score: score,
      timestamp: Date.now()
    });
    
    // Sort and keep top 100
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 100);
    
    // Save back
    await kv.set('global-leaderboard', leaderboard);
    
    // Return player's rank
    const rank = leaderboard.findIndex(entry => 
      entry.name === playerName && entry.score === score
    ) + 1;
    
    return { success: true, rank };
  } catch (e) {
    console.error('Failed to submit score:', e);
    return { success: false, error: e.message };
  }
}

async function getLeaderboard() {
  const leaderboard = await kv.get('global-leaderboard') || [];
  return leaderboard;
}
```

### Pattern: User Preferences Sync
```javascript
/**
 * Sync user settings across devices
 */
async function saveUserPreferences(userId, preferences) {
  const key = `user-prefs-${userId}`;
  await kv.set(key, {
    ...preferences,
    lastUpdated: Date.now()
  });
}

async function loadUserPreferences(userId) {
  const key = `user-prefs-${userId}`;
  const prefs = await kv.get(key);
  return prefs || getDefaultPreferences();
}
```

### Pattern: Shared World Events
```javascript
/**
 * Create events that affect all players
 */
async function triggerGlobalEvent(eventData) {
  const key = 'current-global-event';
  await kv.set(key, {
    ...eventData,
    startTime: Date.now(),
    expiresAt: Date.now() + (eventData.durationHours * 3600000)
  });
}

async function getCurrentGlobalEvent() {
  const event = await kv.get('current-global-event');
  
  if (!event) return null;
  
  // Check if expired
  if (Date.now() > event.expiresAt) {
    await kv.delete('current-global-event');
    return null;
  }
  
  return event;
}
```

---

## 🛠️ Helper Functions & Best Practices

### Pattern: Safe Text Extraction
```javascript
/**
 * Safely extract text from AI responses (handles various return types)
 */
function extractText(response) {
  if (typeof response === 'string') {
    return response.trim();
  }
  if (response && typeof response === 'object') {
    return response.text || response.content || String(response);
  }
  return String(response || '').trim();
}
```

### Pattern: Retry Logic for API Calls
```javascript
/**
 * Retry failed API calls with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage
const result = await retryWithBackoff(async () => {
  return await generateText(complexPrompt);
});
```

### Pattern: Cancellable Operations
```javascript
/**
 * Allow users to cancel long-running AI operations
 */
class CancellationController {
  constructor() {
    this.cancelled = false;
  }
  
  cancel() {
    this.cancelled = true;
  }
  
  check() {
    if (this.cancelled) {
      throw new Error('Operation cancelled by user');
    }
  }
}

async function generateWithCancellation(prompt, controller) {
  // Check before starting
  controller.check();
  
  const response = await generateText(prompt);
  
  // Check after completion
  controller.check();
  
  return response;
}

// Usage
let currentOperation = new CancellationController();

async function startGeneration() {
  currentOperation = new CancellationController();
  
  try {
    const result = await generateWithCancellation(prompt, currentOperation);
    displayResult(result);
  } catch (e) {
    if (e.message === 'Operation cancelled by user') {
      console.log('User cancelled the operation');
    } else {
      throw e;
    }
  }
}

function cancelGeneration() {
  currentOperation.cancel();
}
```

---

## ⚡ Performance Optimization Patterns

### Pattern: Debounced Save Function
```javascript
/**
 * Prevent excessive localStorage writes
 */
let saveTimeout = null;

function saveGame() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    localStorage.setItem('gameState', JSON.stringify(gameState));
    console.log('[Save] Game saved');
  }, 1000); // Wait 1s after last change
}
```

### Pattern: Lazy Loading Images
```javascript
/**
 * Generate images only when needed/visible
 */
const imageCache = new Map();

async function getImageLazy(prompt, cacheKey) {
  // Check cache first
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }
  
  // Generate if not cached
  const imageUrl = await generateImage(applyImageStyle(prompt));
  imageCache.set(cacheKey, imageUrl);
  
  return imageUrl;
}

// Clear old cache entries periodically
function pruneImageCache(maxSize = 50) {
  if (imageCache.size > maxSize) {
    const entries = Array.from(imageCache.entries());
    const toDelete = entries.slice(0, entries.length - maxSize);
    toDelete.forEach(([key]) => imageCache.delete(key));
  }
}
```

### Pattern: Batch Operations
```javascript
/**
 * Batch multiple AI requests efficiently
 */
async function generateMultipleCharacters(count) {
  const characters = [];
  
  // Generate in batches of 3 to avoid rate limits
  for (let i = 0; i < count; i += 3) {
    const batch = [];
    const remaining = Math.min(3, count - i);
    
    for (let j = 0; j < remaining; j++) {
      batch.push(generateCharacterProfile({
        name: `Character ${i + j + 1}`,
        age: 20 + Math.floor(Math.random() * 30),
        role: 'Employee'
      }));
    }
    
    // Wait for batch to complete
    const results = await Promise.all(batch);
    characters.push(...results);
    
    // Small delay between batches
    if (i + 3 < count) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return characters;
}
```

---

## 🚨 Error Handling & Fallbacks

### Pattern: Graceful Degradation
```javascript
/**
 * Always provide fallbacks when AI fails
 */
async function generateWithFallback(prompt, fallbackValue) {
  try {
    const response = await generateText(prompt, {
      temperature: 0.8,
      max_tokens: 200
    });
    return response;
  } catch (e) {
    console.warn('AI generation failed, using fallback:', e);
    return fallbackValue;
  }
}

// Usage
const characterName = await generateWithFallback(
  'Generate a creative business person name',
  'Alex Johnson' // Fallback if AI fails
);
```

### Pattern: Validation with Error Recovery
```javascript
/**
 * Validate AI output and attempt recovery
 */
async function generateValidatedJSON(prompt, validator, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await generateText(prompt);
      const data = JSON.parse(response);
      
      // Custom validation
      const validation = validator(data);
      if (validation.valid) {
        return { success: true, data };
      }
      
      // Add validation errors to prompt for next attempt
      if (attempt < maxAttempts) {
        prompt += `\n\nPREVIOUS ATTEMPT ERRORS: ${validation.errors.join(', ')}`;
        console.log(`Validation failed (attempt ${attempt}), retrying...`);
      }
      
    } catch (e) {
      console.error(`Attempt ${attempt} failed:`, e);
      if (attempt === maxAttempts) {
        return { success: false, error: e.message };
      }
    }
  }
  
  return { success: false, error: 'Max attempts exceeded' };
}

// Usage
const result = await generateValidatedJSON(
  'Generate a product as JSON with name, price, and description',
  (data) => {
    const errors = [];
    if (!data.name) errors.push('Missing name');
    if (typeof data.price !== 'number') errors.push('Price must be number');
    if (!data.description) errors.push('Missing description');
    return { valid: errors.length === 0, errors };
  }
);
```

---

## 🎓 Advanced Patterns

### Pattern: State Machine for Complex Flows
```javascript
/**
 * Manage complex multi-step AI interactions
 */
class ConversationStateMachine {
  constructor(character) {
    this.character = character;
    this.state = 'idle';
    this.context = {};
  }
  
  async transition(input) {
    switch (this.state) {
      case 'idle':
        return await this.handleIdle(input);
      case 'asking_question':
        return await this.handleQuestion(input);
      case 'waiting_response':
        return await this.handleResponse(input);
      default:
        this.state = 'idle';
        return this.transition(input);
    }
  }
  
  async handleIdle(input) {
    // Determine next state based on input
    if (input.includes('?')) {
      this.state = 'asking_question';
      this.context.question = input;
    }
    
    const response = await generateText(`
      ${this.character.name} receives: "${input}"
      React naturally as ${this.character.personality}
    `);
    
    return response;
  }
  
  async handleQuestion(input) {
    const response = await generateText(`
      ${this.character.name} is being asked: "${this.context.question}"
      Provide a thoughtful answer based on: ${input}
    `);
    
    this.state = 'idle';
    this.context = {};
    
    return response;
  }
}
```

### Pattern: Context Window Management
```javascript
/**
 * Manage conversation history to stay within token limits
 */
class ConversationHistory {
  constructor(maxMessages = 10, maxTokens = 2000) {
    this.messages = [];
    this.maxMessages = maxMessages;
    this.maxTokens = maxTokens;
  }
  
  add(sender, text) {
    this.messages.push({ sender, text, timestamp: Date.now() });
    this.prune();
  }
  
  prune() {
    // Keep only recent messages
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }
    
    // Estimate tokens (rough: 4 chars per token)
    let totalChars = this.messages.reduce((sum, msg) => 
      sum + msg.text.length, 0
    );
    
    // Remove oldest messages if too long
    while (totalChars > this.maxTokens * 4 && this.messages.length > 3) {
      const removed = this.messages.shift();
      totalChars -= removed.text.length;
    }
  }
  
  getContext(includeSystem = true) {
    const context = this.messages
      .map(msg => `${msg.sender}: ${msg.text}`)
      .join('\n');
    
    return context;
  }
  
  summarize() {
    // Keep first and last messages, summarize middle
    if (this.messages.length <= 5) {
      return this.messages;
    }
    
    return [
      this.messages[0],
      {
        sender: 'System',
        text: `[${this.messages.length - 2} messages summarized]`,
        summary: true
      },
      this.messages[this.messages.length - 1]
    ];
  }
}
```

### Pattern: Progressive Enhancement
```javascript
/**
 * Start with basic features, enhance with AI when available
 */
class ProgressiveGenerator {
  constructor() {
    this.features = {
      basic: true,
      aiText: typeof generateText === 'function',
      aiImage: typeof generateImage === 'function',
      storage: typeof kv !== 'undefined'
    };
  }
  
  async createCharacter(basicData) {
    // Level 1: Basic character (always works)
    const character = {
      name: basicData.name,
      age: basicData.age,
      bio: 'A professional employee'
    };
    
    // Level 2: Enhanced with AI text
    if (this.features.aiText) {
      try {
        const enhancedBio = await generateText(
          `Create a 2-sentence bio for ${basicData.name}, age ${basicData.age}`
        );
        character.bio = enhancedBio;
        character.enhanced = true;
      } catch (e) {
        console.warn('AI enhancement failed, using basic version');
      }
    }
    
    // Level 3: Add portrait with AI image
    if (this.features.aiImage) {
      try {
        character.portrait = await generateImage({
          prompt: `portrait of ${basicData.name}, professional photo`
        });
        character.hasPortrait = true;
      } catch (e) {
        console.warn('Portrait generation failed');
        character.hasPortrait = false;
      }
    }
    
    return character;
  }
}
```

---

## 🎯 Production-Ready Checklist

### Before Launching Your Generator:

#### ✅ Error Handling
- [ ] All `generateText()` calls wrapped in try-catch
- [ ] All `generateImage()` calls wrapped in try-catch
- [ ] Fallback values for all AI-generated content
- [ ] User-friendly error messages (not technical jargon)

#### ✅ Performance
- [ ] Debounced save functions
- [ ] Image generation only when needed
- [ ] Caching for repeated AI requests
- [ ] Loading indicators for async operations

#### ✅ User Experience
- [ ] Loading states for all AI operations
- [ ] Cancel buttons for long operations
- [ ] Progress indicators for multi-step processes
- [ ] Autosave functionality

#### ✅ Data Management
- [ ] Clear data structure in localStorage
- [ ] Version number in saved data
- [ ] Migration logic for updates
- [ ] Export/import functionality

#### ✅ AI Prompt Quality
- [ ] Clear instructions in all prompts
- [ ] Examples of good/bad outputs
- [ ] Specific formatting requirements
- [ ] Stop sequences to prevent over-generation
- [ ] Temperature values tuned for each use case

---

## 🚀 Quick Start Template

```javascript
// ============================================
// PERCHANCE GENERATOR BOILERPLATE
// ============================================

// Check plugin availability
const hasAI = typeof generateText === 'function';
const hasImages = typeof generateImage === 'function';

// Game state structure
const gameState = {
  version: '1.0.0',
  settings: {
    imageStyle: 'photorealistic',
    autosave: true
  },
  data: {}
};

// Load saved data
function loadGame() {
  try {
    const saved = localStorage.getItem('myGenerator');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(gameState, parsed);
    }
  } catch (e) {
    console.error('Failed to load saved data:', e);
  }
}

// Save with debounce
let saveTimeout = null;
function saveGame() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    localStorage.setItem('myGenerator', JSON.stringify(gameState));
  }, 1000);
}

// Image style helper
function applyImageStyle(prompt) {
  const styles = {
    photorealistic: "photorealistic, 8k, professional photography",
    anime: "anime style, manga, cel shaded",
    artistic: "artistic, painterly, gallery quality"
  };
  
  const style = styles[gameState.settings.imageStyle] || styles.photorealistic;
  return {
    prompt: `${prompt}, ${style}`
  };
}

// Safe text generation
async function generateTextSafe(prompt, fallback = '') {
  if (!hasAI) return fallback;
  
  try {
    return await generateText(prompt, {
      temperature: 0.8,
      max_tokens: 200
    });
  } catch (e) {
    console.error('Text generation failed:', e);
    return fallback;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadGame();
  // Your initialization code here
});
```

---

## 📚 Additional Resources

### Perchance Documentation
- Official Docs: https://perchance.org/welcome
- Plugin Library: https://perchance.org/plugins
- Community Forum: https://perchance.org/forum

### Tips for Success
1. **Start Simple**: Get basic functionality working before adding AI
2. **Test Extensively**: AI is unpredictable - test edge cases
3. **Cache Aggressively**: AI calls are slow - cache everything you can
4. **Provide Fallbacks**: Always have non-AI fallbacks
5. **Optimize Prompts**: Spend time crafting clear, effective prompts
6. **Monitor Costs**: Be mindful of API usage in production

---

**Built with ❤️ from a 39,000+ line production Perchance generator**

*This guide represents real-world patterns from a complex idle game with AI NPCs, dynamic content generation, and persistent state management.*
