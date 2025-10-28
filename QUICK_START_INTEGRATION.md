# 🎮 Quick Start - Integrating the New Story System

## What I've Created for You

### 1. **STORY_WRITING_GUIDE.md** 📖
A complete walkthrough of the story system with:
- How VN scenes work (hardcoded in JS)
- How choice scenes work (JSON-based)
- Examples and best practices
- File locations and structure

### 2. **New Opening VN** ✈️
Updated `src/ui/storyIntro.js` with a more dramatic 12-scene opening:
- Pre-crash tension
- Turbulence and disaster
- The crash sequence
- Underwater struggle
- Swimming to shore
- Beach arrival and waking up
- Title reveal

### 3. **Tutorial System** 🎓
Created `src/data/tutorial.json` with comprehensive tutorial covering:
- Resource gathering (food, water, shelter)
- Terrain types (beach, jungle, plains, rocky, freshwater)
- Exploration mechanics
- Character stats (health, energy, hunger, thirst)
- Inventory management
- Crafting and building
- Skip option for experienced players
- Review menu to revisit topics

---

## Next Steps: Integrating the Tutorial

### Current Game Flow
```
Main Menu → Character Creation → Story Intro → [Currently goes straight to map]
```

### New Flow You Want
```
Main Menu → Character Creation → Story Intro → Tutorial → Game Hub → Map (via menu)
```

---

## Implementation Checklist

### ✅ Step 1: Create Tutorial Manager (RECOMMENDED)

Create `src/modules/tutorialManager.js`:

```javascript
/**
 * Tutorial Manager
 * Handles the choice-based tutorial system
 */
export class TutorialManager {
  constructor(gameState, sceneEngine) {
    this.gameState = gameState;
    this.sceneEngine = sceneEngine;
    this.tutorialScenes = null;
  }

  async loadTutorial() {
    const response = await fetch('/src/data/tutorial.json');
    this.tutorialScenes = await response.json();
  }

  start() {
    if (!this.tutorialScenes) {
      console.error('Tutorial not loaded!');
      return;
    }

    // Use the scene engine to render tutorial
    this.sceneEngine.loadScenes(this.tutorialScenes);
    this.sceneEngine.renderScene('tutorial_start');
  }

  skip() {
    // Go straight to game hub
    this.sceneEngine.renderScene('game_hub');
  }
}
```

### ✅ Step 2: Update SceneEngine to Handle Actions

Modify `src/modules/sceneEngine.js` to support custom actions like `openMap`, `openInventory`, etc.

Find the `makeChoice()` method and add:

```javascript
makeChoice(choice) {
  // Handle custom actions
  if (choice.action) {
    this.handleAction(choice.action);
    return;
  }

  // Normal scene navigation
  if (choice.next) {
    this.renderScene(choice.next);
  }
}

handleAction(action) {
  switch(action) {
    case 'openMap':
      // Hide scene container
      document.getElementById('scene-container')?.classList.add('hidden');
      // Show map
      window.game.initializeGameWorld();
      window.game.gameView.show();
      break;
      
    case 'openInventory':
      // Show inventory UI
      window.game.inventoryUI?.show();
      break;
      
    case 'openStatus':
      // Show character status
      window.game.characterStatus?.show();
      break;
      
    default:
      console.warn('Unknown action:', action);
  }
}
```

### ✅ Step 3: Update Main.js Game Flow

In `src/main.js`, update the `introComplete` event handler:

**Find this:**
```javascript
gameState.on('introComplete', () => {
  initializeGameWorld();
  gameView.show();
});
```

**Replace with:**
```javascript
gameState.on('introComplete', () => {
  // Start tutorial instead of going straight to map
  if (window.game.tutorialManager) {
    window.game.tutorialManager.start();
  } else {
    // Fallback: go straight to map
    initializeGameWorld();
    gameView.show();
  }
});
```

**Also add at the top of main.js:**
```javascript
import { TutorialManager } from './modules/tutorialManager.js';
```

**And in the initialization section:**
```javascript
// Initialize tutorial
const tutorialManager = new TutorialManager(gameState, sceneEngine);
await tutorialManager.loadTutorial();

// Add to window.game
window.game = {
  // ...existing properties...
  tutorialManager,
  sceneEngine,
  // ...
};
```

### ✅ Step 4: Make Map Optional (Not Auto-Shown)

The map will now only open when the player clicks "🗺️ Open the island map" from the game hub scene.

The `game_hub` scene in `tutorial.json` already has this set up with the `openMap` action.

---

## Testing the New Flow

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Test the complete flow:**
   - Main Menu → New Game
   - Character Creation
   - Watch the new 12-scene opening (or press Escape to skip)
   - Tutorial starts automatically
   - Choose whether to skip or learn
   - Navigate through tutorial topics
   - Reach game hub
   - Click "Open the island map" to access the map

3. **Test skip functionality:**
   - Go through intro
   - Choose "Skip tutorial" in tutorial
   - Confirm skip
   - Should go straight to game hub

---

## Customization Tips

### Adding New Tutorial Topics

Edit `src/data/tutorial.json` and add new scenes:

```json
{
  "tutorial_new_topic": {
    "text": "<div>Your new tutorial content here</div>",
    "choices": [
      {
        "text": "Next topic",
        "next": "another_scene"
      }
    ]
  }
}
```

Then add a menu option in `tutorial_review_menu` to access it.

### Changing the Opening VN

Edit `src/ui/storyIntro.js` → `getIntroScenes()`:

```javascript
{
  background: 'linear-gradient(135deg, #ff0000 0%, #00ff00 100%)',
  lines: [
    'Your custom line 1',
    'Your custom line 2',
    'And so on...'
  ]
}
```

### Adding Custom Actions

In `SceneEngine.js` → `handleAction()`, add new cases:

```javascript
case 'customAction':
  // Your custom code here
  break;
```

Then use in scenes:
```json
{
  "text": "Scene text",
  "choices": [
    {
      "text": "Do custom thing",
      "action": "customAction"
    }
  ]
}
```

---

## File Structure Summary

```
src/
├── ui/
│   ├── storyIntro.js          ← VN opening (updated with new scenes)
│   └── mainMenu.js
├── modules/
│   ├── sceneEngine.js         ← Choice system (needs action handling)
│   └── tutorialManager.js     ← NEW: Tutorial controller
├── data/
│   ├── scenes.json            ← Original scenes
│   └── tutorial.json          ← NEW: Tutorial scenes
└── main.js                    ← Update flow here

docs/
├── STORY_WRITING_GUIDE.md     ← NEW: Complete writing guide
└── QUICK_START_INTEGRATION.md ← THIS FILE
```

---

## Common Issues & Solutions

### "Tutorial doesn't start after intro"
- Check that `tutorialManager.loadTutorial()` was called in `main.js`
- Check browser console for errors loading `tutorial.json`

### "Map still opens automatically"
- Make sure you removed the `initializeGameWorld()` call from `introComplete` event
- Check that the tutorial is actually starting

### "Actions don't work (openMap, etc.)"
- Add the `handleAction()` method to `SceneEngine.js`
- Make sure actions are being called in `makeChoice()`

### "Can't style tutorial text"
- The tutorial uses inline HTML styles for maximum control
- Edit the `text` property in `tutorial.json` to change styling

---

## What You Have Now

✅ **Dramatic 12-scene opening** - Plane crash to beach arrival  
✅ **Comprehensive tutorial system** - All survival basics covered  
✅ **Skip option** - For experienced players  
✅ **Review menu** - Revisit any tutorial topic  
✅ **Game hub** - Central location to access map, inventory, status  
✅ **Complete documentation** - Writing guide with examples  

---

## Ready to Code?

1. Create `tutorialManager.js`
2. Update `sceneEngine.js` with action handling
3. Update `main.js` game flow
4. Test the complete flow
5. Start writing your own scenes!

**Need help?** Check `STORY_WRITING_GUIDE.md` for detailed examples and best practices.

Good luck! 🏝️✨
