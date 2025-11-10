# Background NPC Generation System

## Overview
Implemented a background NPC generation system that creates NPCs in batches during idle gameplay, intelligently pausing during player conversations.

## Features

### 1. **Batch Generation**
- Generates NPCs in batches of 3
- Delays 5-10 seconds between batches to spread load
- Respects NPC cap (50 NPCs maximum)
- Weighted faction selection based on territory distribution

### 2. **Conversation-Aware Pausing**
- **Automatically pauses** when player enters conversation
- **Automatically resumes** when conversation ends
- Prevents AI rate limiting and performance issues during dialogue

### 3. **Two-Phase Generation**

**Phase 1: Instant Deterministic Generation**
- Name, appearance, personality, background
- Uses seeded random for consistency
- No AI required - plays immediately
- Fast and reliable

**Phase 2: Asynchronous AI Enrichment**
- Backstory, quirks, secrets, mood
- Happens in background queue
- Non-blocking gameplay
- Gracefully handles failures

## Architecture

### NPCManager Methods

```javascript
// Start background generation
npcManager.startBackgroundGeneration()

// Stop background generation
npcManager.stopBackgroundGeneration()

// Pause during conversation (automatic)
npcManager.pauseBackgroundGeneration()

// Resume after conversation (automatic)
npcManager.resumeBackgroundGeneration()
```

### Generation State Tracking

```javascript
backgroundGeneration: {
  enabled: false,      // Master switch
  paused: false,       // Conversation pause state
  batchSize: 3,        // NPCs per batch
  currentBatch: 0,     // Batch counter
  totalGenerated: 0,   // Total NPCs created
  queue: [],           // NPCs waiting for AI enrichment
  processing: false    // Batch in progress flag
}
```

## Workflow

### Initial Spawn
1. Game starts → spawn 2-3 castaways near player
2. Start background generation system
3. System begins generating batches

### Batch Generation
```
[Batch 1] Generate 3 NPCs
  ↓
Queue for AI enrichment
  ↓
Wait 5-10 seconds
  ↓
[Batch 2] Generate 3 NPCs
  ↓
Continue until NPC cap reached
```

### Conversation Handling
```
Player talks to NPC
  ↓
System pauses (mid-batch if needed)
  ↓
AI enrichment queue pauses
  ↓
Player ends conversation
  ↓
System resumes automatically
  ↓
Continues where it left off
```

## Faction Distribution

Weighted selection based on territory presence:
- **Castaways**: 1x weight (rare, player faction)
- **Natives Clan 1**: 3x weight (major faction)
- **Natives Clan 2**: 3x weight (major faction)
- **Mercenaries**: 2x weight (minor faction)

## Performance Considerations

### Load Spreading
- **5-10 second delays** between batches
- **1 second delays** between AI enrichments
- Non-blocking async operations
- Graceful error handling

### Memory Management
- NPCs stored in Map structures
- Indexed by tile and faction
- Automatic cap at 50 NPCs
- System auto-stops when cap reached

## Console Logging

### Batch Generation
```
🔄 [Batch 1] Generating 3 NPCs in background...
🔄 [Batch 1] Generated 1/3: John Smith (castaway)
🔄 [Batch 1] Generated 2/3: Maria Garcia (natives_clan1)
🔄 [Batch 1] Generated 3/3: Chen Wei (natives_clan2)
✅ [Batch 1] Generated 3 NPCs (Total: 3)
```

### Conversation Pausing
```
⏸️ Pausing background NPC generation (conversation started)
▶️ Resuming background NPC generation (conversation ended)
```

### AI Enrichment
```
🤖 Enriching John Smith with AI backstory...
✨ John Smith enriched successfully
🤖 Enriching Maria Garcia with AI backstory...
✨ Maria Garcia enriched successfully
✅ All queued NPCs enriched
```

### Completion
```
🛑 NPC cap reached, stopping background generation
```

## Integration Points

### Main.js
- `spawnInitialNPCs()` - Starts background generation after initial spawn
- Automatic startup on game initialization

### NPCManager
- `initiateDialogue()` - Pauses on conversation start
- `endConversation()` - Resumes on conversation end
- All pause/resume handled automatically

### GameState
- Background generation runs independently
- No manual intervention needed
- Works seamlessly with existing systems

## Future Enhancements

### Possible Additions
1. **UI Status Indicator**
   - Show generation progress
   - Display NPC count
   - Toggle generation on/off

2. **Dynamic Batch Sizing**
   - Smaller batches late game
   - Larger batches early game
   - Based on player activity

3. **Smart Spawning**
   - Spawn NPCs near player path
   - Populate important locations first
   - Avoid clustering in one area

4. **Territory-Based Generation**
   - Spawn in faction territories
   - Respect faction boundaries
   - Match territory ownership

5. **Activity-Based Pausing**
   - Pause during combat
   - Pause during crafting
   - Resume during travel/exploration

## Testing

### Verify Background Generation
1. Start new game
2. Check console for batch generation logs
3. Verify 3 NPCs generated per batch
4. Verify 5-10 second delays

### Verify Conversation Pausing
1. Talk to an NPC
2. Check for pause log message
3. End conversation
4. Check for resume log message
5. Verify generation continues

### Verify NPC Cap
1. Wait for multiple batches
2. Verify stops at 50 NPCs
3. Check for stop log message

## Files Modified

### src/modules/npcManager.js
- Added background generation state
- Added batch generation methods
- Added pause/resume methods
- Integrated with conversation system

### src/main.js
- Start background generation after initial spawn
- Automatic integration with game initialization

## Status
✅ **Implemented and Working**
- Batch generation (3 per batch)
- Conversation-aware pausing
- Automatic resume on conversation end
- NPC cap enforcement
- Weighted faction selection
- Non-blocking AI enrichment
