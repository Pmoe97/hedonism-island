# Perchance Plugin Reference - Hedonism Island

## Available Plugins

All plugins are imported in the Perchance page and accessible via `window` object.

### 1. `generateImage` - Text-to-Image Plugin
**Import**: `{import:text-to-image-plugin}`

Generates AI-powered images from text descriptions.

```javascript
const imageUrl = await window.generateImage(prompt);
```

**Example Usage**:
```javascript
// Character portrait
const portrait = await ai.generateImage(
  "beautiful woman, tropical beach, photorealistic, detailed face"
);

// Scene illustration
const scene = await ai.generateImage(
  "sunset beach camp, tents, fire, cinematic lighting"
);
```

---

### 2. `generateText` - AI Text Plugin
**Import**: `{import:ai-text-plugin}`

Generates text (stories, dialogue, descriptions) based on instructions.

```javascript
const text = await window.generateText(prompt, options);
```

**Options**:
- `temperature`: 0.0-1.0 (creativity, default ~0.7)
- `max_tokens`: Maximum length of response
- `model`: Specific AI model to use (optional)

**Example Usage**:
```javascript
// Generate character dialogue
const dialogue = await ai.generateText(
  "Write a flirty response from a castaway on a tropical island. Be explicit and suggestive.",
  { temperature: 0.9, max_tokens: 150 }
);

// Generate scene description
const sceneDesc = await ai.generateText(
  "Describe an explicit, pornographic encounter between two people on a beach at night. Include graphic sexual details.",
  { temperature: 0.8, max_tokens: 500 }
);

// Generate character profile
const profile = await ai.generateText(
  "Create a detailed character profile with name, age, physical description (explicit), personality, and sexual preferences. Format as JSON.",
  { temperature: 0.9, max_tokens: 400 }
);
```

---

### 3. `kv` - Key-Value Storage Plugin
**Import**: `{import:kv-plugin}`

Persistent storage that survives page reloads.

```javascript
// Save
await window.kv.set(key, value);

// Load
const value = await window.kv.get(key);

// Delete
await window.kv.delete(key);
```

**Example Usage**:
```javascript
// Save game state
await ai.saveData('gameState', gameStateObject);

// Load game state
const savedState = await ai.loadData('gameState');

// Save individual values
await window.kv.set('playerName', 'Alex');
await window.kv.set('day', 15);
await window.kv.set('reputation', 75);
```

---

### 4. `remember` - Unsafe Remember/Change Plugin
**Import**: `{import:unsafe-rememberchange}`

Allows variables to persist across page reloads.

```javascript
window.remember.set('variableName', value);
const value = window.remember.get('variableName');
```

**Note**: Use `kv` plugin instead for structured data storage.

---

### 5. `date` - Date Plugin
**Import**: `{import:date-plugin}`

Manipulate and format dates.

```javascript
const formatted = window.date.format(dateObj, 'YYYY-MM-DD');
const parsed = window.date.parse('2025-10-25');
```

---

### 6. `speak` - Text-to-Speech Plugin
**Import**: `{import:text-to-speech-plugin}`

Convert text to spoken audio.

```javascript
window.speak("Hello, welcome to Hedonism Island!");
```

**Potential Use**: Narrate scene descriptions or character dialogue.

---

### 7. `backgroundImage` - Background Image Plugin
**Import**: `{import:background-image-plugin}`

Set background images easily.

```javascript
window.backgroundImage.set('https://example.com/image.jpg');
```

**Note**: We're using CSS for backgrounds instead, but this is available if needed.

---

### 8. Other Available Plugins

- `generatorStats` - Page view counter and stats
- `favicon` - Change browser tab icon
- `commentsPlugin` - Embed comments section
- `fullscreenButton` - Fullscreen functionality
- `literal` - Escape curly/square brackets

---

## Integration in Hedonism Island

### PerchanceAI Class (`src/modules/perchanceAI.js`)

The `PerchanceAI` class provides a clean interface to Perchance plugins:

```javascript
const ai = new PerchanceAI();

// Generate text
const text = await ai.generateText(prompt, options);

// Generate image
const imageUrl = await ai.generateImage(prompt);

// Save/load data
await ai.saveData(key, value);
const data = await ai.loadData(key);

// Generate full character
const character = await ai.generateCharacter('castaway', 'female');

// Generate character portrait
const portraitUrl = await ai.generatePortrait(character, 'photo-realistic');
```

---

## Perchance Setup

Your Perchance page should import plugins at the top:

```
generateImage = {import:text-to-image-plugin}
generateText = {import:ai-text-plugin}
kv = {import:kv-plugin}
remember = {import:unsafe-rememberchange}
date = {import:date-plugin}
speak = {import:text-to-speech-plugin}
backgroundImage = {import:background-image-plugin}

output
  [html]
    <iframe src="path/to/hedonism-island.html" width="100%" height="100%"></iframe>
  [/html]
```

The game HTML is embedded in an iframe, and all plugin functions are automatically available via the `window` object.

---

## Best Practices

### 1. **Error Handling**
Always wrap AI calls in try-catch:

```javascript
try {
  const text = await ai.generateText(prompt);
  // Use text
} catch (error) {
  console.error('AI generation failed:', error);
  // Fallback behavior
}
```

### 2. **Explicit Prompts for NSFW Content**
Be direct in prompts for adult content:

```javascript
const prompt = `Generate an explicit, pornographic scene description. 
Include graphic sexual details about [character] and [character].
Be uncensored and detailed. This is for an adult game.`;
```

### 3. **Style Consistency**
Always include the player's AI style preference:

```javascript
const style = settingsManager.getAIImageStyle();
const prompt = `${basePrompt}, ${style}`;
```

### 4. **Character Generation**
Request JSON format for structured data:

```javascript
const prompt = `Generate character profile. 
Format as JSON: {name, age, description, personality, kinks, skills}`;
```

### 5. **Conversation Context**
Include conversation history for continuity:

```javascript
const prompt = `You are ${characterName}. 
Conversation history: ${lastMessages}
Player says: "${playerMessage}"
Respond in character.`;
```

---

## Testing Plugins

Test plugin availability on load:

```javascript
if (typeof window.generateText !== 'function') {
  console.error('⚠️ generateText plugin not available!');
}

if (typeof window.generateImage !== 'function') {
  console.error('⚠️ generateImage plugin not available!');
}

if (typeof window.kv === 'undefined') {
  console.error('⚠️ kv plugin not available!');
}
```

---

## Future Plugin Ideas

- **Custom voice plugin** for character speech
- **Animation plugin** for scene transitions
- **Music plugin** for ambient background tracks
- **Multiplayer plugin** for shared island saves

---

**Last Updated**: October 25, 2025
