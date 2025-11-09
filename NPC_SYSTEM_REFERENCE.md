# NPC System - Quick Reference

## Overview
Complete AI-powered NPC system with deterministic stats and AI-generated creative content using Perchance's generateText plugin.

## Architecture

### Core Components
1. **NPC.js** - Base NPC class with all properties and methods
2. **NPCManager.js** - Lifecycle management, spawning, dialogue coordination
3. **npcPrompts.js** - Prompt template builders for AI generation
4. **perchanceAI.js** - AI integration with response sanitization
5. **DialogueUI.js** - Full-screen conversation interface
6. **dialogueUI.css** - Responsive split-panel styling

## How to Use

### Spawning an NPC

```javascript
// From console or code
const npc = await window.game.state.npcManager.spawnNPC({
  faction: 'castaway',  // castaway, islander, mercenary, tourist
  gender: 'female',     // female, male, futanari, cuntboy, other
  age: 25,              // 18-45 (optional, will randomize)
  role: 'survivor',     // Optional, will auto-assign based on faction
  tile: { q: 5, r: 3 }  // Hex coordinates
}, true); // true = enrich with AI (appearance, backstory, dialogue)
```

### Talking to an NPC

**In-game:**
1. Walk to a tile with an NPC
2. Click the "Talk" button in the tile interaction panel
3. If multiple NPCs, select one from the submenu
4. Dialogue UI opens automatically

**From console:**
```javascript
// Find NPC
const npcs = window.game.state.npcManager.getAllNPCs();
const npc = npcs[0];

// Open dialogue
window.game.uiManagers.dialogueUI.open(npc.identity.id);
```

### Adjusting Relationships

```javascript
// Get NPC
const npc = window.game.state.npcManager.getNPC('npc-id-here');

// Adjust relationship stats (0-100 or -100 to 100 for opinion)
npc.adjustRelationship('opinion', 20);  // Increase opinion by 20
npc.adjustRelationship('trust', -10);   // Decrease trust by 10
npc.adjustRelationship('romantic', 15); // Increase romantic interest
npc.adjustRelationship('fear', 5);      // Increase fear
```

### Accessing NPC Data

```javascript
// Get all NPCs
const allNPCs = window.game.state.npcManager.getAllNPCs();

// Get NPCs at specific tile
const npcsHere = window.game.state.npcManager.getNPCsAtTile({ q: 0, r: 0 });

// Get NPCs by faction
const castaways = window.game.state.npcManager.getNPCsByFaction('castaway');

// NPC properties
console.log(npc.identity.name);        // Name
console.log(npc.identity.title);       // Title/role
console.log(npc.appearance.age);       // Age
console.log(npc.personality.traits);   // Big Five traits
console.log(npc.relationships.player); // Relationship with player
console.log(npc.getMood());            // Current mood
```

## NPC Properties

### Identity
- `id`: Unique identifier
- `name`: Full name
- `title`: Role/title (e.g., "Survivor", "Hunter")
- `faction`: castaway, islander, mercenary, tourist
- `role`: Specific role within faction

### Appearance (AI-Generated)
- `age`, `gender`, `height`, `build`
- `skinTone`, `hairColor`, `hairStyle`, `hairLength`
- `eyeColor`, `distinctiveFeatures[]`
- `clothing`: Outfit description
- `portraitUrl`: Generated portrait URL (created on first dialogue)

### Personality (Deterministic)
- **Big Five Traits** (0-100):
  - `openness`: Creativity, curiosity
  - `conscientiousness`: Organization, discipline
  - `extraversion`: Sociability, energy
  - `agreeableness`: Compassion, cooperation
  - `neuroticism`: Anxiety, emotional instability

- **Values** (0-100):
  - `honor`, `loyalty`, `ambition`, `compassion`, `independence`

- **Narrative Details** (AI-Generated):
  - `quirks[]`: Behavioral habits
  - `fears[]`: What they fear
  - `desires[]`: What they want
  - `motivations[]`: Core drivers

### Background (AI-Generated)
- `birthplace`, `backstory`, `formativeEvent`
- `occupation`, `education`, `familyStatus`
- `secrets[]`: Hidden information

### Relationships
**Player Relationship:**
- `opinion`: -100 to 100 (how much they like player)
- `trust`: 0-100 (how much they trust player)
- `respect`: 0-100 (how much they respect player)
- `fear`: 0-100 (how afraid they are of player)
- `romantic`: 0-100 (romantic/sexual interest)
- `interactionCount`, `firstMet`, `lastInteraction`

**Other NPCs:**
- Stored in `knownNPCs` Map with same stats

### Memory System
- `events[]`: Array of remembered events with importance scores
- `conversationHistory[]`: Full conversation log
- `conversationPhase`: early/familiar/intimate (auto-calculated)
- `sawPlayerSteal`, `sawPlayerKill`: Witness flags
- `heardRumors[]`: Gossip they've heard

### Stats & Skills
**Stats:** health, stamina, strength, agility, intelligence, charisma, willpower

**Skills:** combat, hunting, crafting, diplomacy, survival, medicine, exploration

### Dialogue (AI-Generated)
- `greeting`: First-time greeting
- `topics[]`: Conversation topics with responses
- `barks[]`: Short contextual phrases

## Dialogue System

### Conversation Flow
1. Player sends message
2. NPCManager builds context (personality, mood, relationship, memories)
3. AI generates response using buildDialoguePrompt()
4. Response sanitized (remove meta-text, narration, etc.)
5. Check for repetition → regenerate if needed (up to 3 attempts)
6. Update NPC memory and relationship stats
7. Display in DialogueUI

### Conversation Phases
- **Early** (< 5 interactions): Cautious, formal
- **Familiar** (5-20 interactions, trust > 30): Relaxed, friendly
- **Intimate** (> 20 interactions, trust > 60, romantic > 40): Personal, intimate

### Response Regeneration
- Click "🔄 Regenerate" button on latest NPC message
- Automatically increases temperature (0.7 → 0.8 → 0.9) for variety
- Uses variation strategies to avoid repetition

## AI Integration

### Prompt Structure
All prompts follow: **Context → Instructions → Constraints**

**Context:** NPC identity, personality, mood, relationship, memories, situation

**Instructions:** What to generate (dialogue, description, etc.)

**Constraints:** Tone, length, format, content rules

### Temperature Settings
- **0.6-0.7**: Dialogue (consistent personality)
- **0.8**: Character generation (creative but coherent)
- **0.9+**: Highly creative content (descriptions, rumors)

### Response Sanitization
Removes:
- Meta-commentary: `(thinks)`, `(feels)`, `*internally*`
- Narration: `She said`, `He replies`, `**bold**`, `*italic*`
- Self-reference errors: Outer quotes, leaked instructions
- Limits to 3 sentences max

## Dialogue UI Layout

### Desktop/Landscape
- **Left (40%)**: Full-body NPC portrait, name/title/mood overlay, relationship bars
- **Right (60%)**: Conversation history, topic buttons, text input

### Mobile Portrait
- **Top (35%)**: Portrait panel (stacked vertically)
- **Bottom (65%)**: Conversation panel

### Features
- Auto-scroll to latest message
- Message timestamps
- Player messages (right, blue bubbles)
- NPC messages (left, brown bubbles)
- Topic quick-select buttons
- Response regeneration
- Typing indicator
- Real-time relationship bar updates

## Save/Load Integration

NPCs are automatically saved/loaded with game state:

```javascript
// Save
gameState.save('slot1'); // Saves all NPCs via npcManager.saveNPCs()

// Load
gameState.load('slot1'); // Restores all NPCs via npcManager.loadNPCs()
```

## Testing Commands

```javascript
// Spawn test NPC
const testNPC = await window.game.state.npcManager.spawnNPC({
  faction: 'castaway',
  gender: 'female',
  tile: window.game.player.position
}, true);

// Talk to them
window.game.uiManagers.dialogueUI.open(testNPC.identity.id);

// View all NPCs
console.table(window.game.state.npcManager.getAllNPCs().map(n => ({
  name: n.identity.name,
  faction: n.identity.faction,
  opinion: n.relationships.player.opinion,
  location: `${n.location.currentTile.q},${n.location.currentTile.r}`
})));
```

## Automatic Features

### On New Game
- 2-3 friendly castaways spawn within 2-4 tiles of player
- Each gets AI-generated appearance, backstory, personality
- Ready to talk immediately

### During Gameplay
- Relationships change based on player actions
- NPCs remember important events
- Conversation phase evolves with familiarity
- Rumors spread among nearby NPCs
- Portraits generated on first dialogue (cached afterward)

## Future Enhancements (TODO)

- NPC schedules and movement
- Quest system integration
- Combat with NPCs
- NPC recruitment/followers
- Romance/intimacy system expansion
- Faction reputation system
- Dynamic NPC spawning based on story phase
- NPC death/persistence

## File Locations

```
src/modules/
  ├── npc.js                 (450 lines - Core NPC class)
  ├── npcManager.js          (370 lines - Lifecycle management)
  ├── npcPrompts.js          (290 lines - Prompt builders)
  └── perchanceAI.js         (Enhanced with NPC dialogue utils)

src/ui/
  ├── dialogueUI.js          (470 lines - Conversation interface)
  └── dialogueUI.css         (520 lines - Responsive styling)
```

## Performance Notes

- NPCs are lazy-loaded (portraits generated on first dialogue)
- Max 50 NPCs enforced by NPCManager
- Conversation history limited to 50 messages per NPC
- Save file impact: ~2-5KB per NPC (depending on conversation history)
