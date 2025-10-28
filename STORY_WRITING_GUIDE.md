# 📖 Story Writing Guide - Hedonism Island

## Overview

Hedonism Island uses a **Visual Novel (VN) style** story system with two main components:
1. **StoryIntro.js** - Hardcoded VN scenes (opening, tutorials, major plot points)
2. **SceneEngine.js** - JSON-based dynamic scenes with choices and AI generation

---

## Part 1: Writing VN Scenes (StoryIntro.js)

### Structure

VN scenes are defined in `src/ui/storyIntro.js` in the `getIntroScenes()` method.

```javascript
getIntroScenes() {
  return [
    {
      background: '#000',  // CSS color or gradient
      lines: [
        'First line of dialogue or narration.',
        'Second line - appears on click/key press.',
        'Keep lines short and impactful!'
      ]
    },
    {
      background: '#ff6b6b',
      lines: [
        'New scene with different background.',
        'Lines advance automatically on user input.'
      ]
    }
  ];
}
```

### Scene Properties

**`background`** (string):
- Any valid CSS color: `'#ff6b6b'`, `'rgb(255, 107, 107)'`, `'red'`
- Gradients: `'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'`
- Colors transition smoothly between scenes

**`lines`** (array of strings):
- Each string is one "page" of text
- User clicks or presses Space/Enter to advance
- Empty string `''` creates a dramatic pause
- Keep to 2-3 sentences per line for readability

### Example: Dramatic Opening

```javascript
getIntroScenes() {
  return [
    // Scene 1: Black screen with tension
    {
      background: '#000',
      lines: [
        'The plane shudders violently.',
        'Oxygen masks drop from the ceiling.',
        'The captain\'s voice crackles over the intercom...',
        '"BRACE FOR IMPACT!"'
      ]
    },
    
    // Scene 2: Crash sequence - dark blue
    {
      background: 'linear-gradient(180deg, #000428 0%, #004e92 100%)',
      lines: [
        'CRASH!',
        '',  // Dramatic pause
        'The world spins.',
        'Metal tears. Water rushes in.',
        'Everything goes dark.'
      ]
    },
    
    // Scene 3: Waking up - lighter blue
    {
      background: 'linear-gradient(180deg, #004e92 0%, #0099cc 100%)',
      lines: [
        'You wake to the taste of salt.',
        'Cold ocean water surrounds you.',
        'Debris floats in all directions.',
        'In the distance... an island.'
      ]
    },
    
    // Scene 4: Beach arrival - warm tones
    {
      background: 'linear-gradient(180deg, #f4e4c1 0%, #ffd89b 100%)',
      lines: [
        'Your feet touch sand.',
        'You collapse onto the beach.',
        'The tropical sun beats down.',
        'You\'re alive... but where are you?'
      ]
    },
    
    // Scene 5: Title reveal - island green
    {
      background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
      lines: [
        'Welcome to Paradise.',
        'Or is it?',
        '',
        'Your survival begins now.'
      ]
    }
  ];
}
```

### Controls

**User Input:**
- Click textbox → Advance to next line
- Press `Space` or `Enter` → Advance
- Press `Escape` → Skip to end
- Click "Skip Intro" button → Skip to end

**Automatic:**
- Background color transitions smoothly (CSS transition)
- Text fades in/out between lines
- Continue indicator (▼) pulses at bottom

---

## Part 2: Writing Choice-Based Scenes (scenes.json)

### Basic Scene Structure

```json
{
  "scene_id": {
    "text": "<h2>Scene Title</h2><p>Scene description here.</p>",
    "choices": [
      {
        "text": "Choice text shown to player",
        "next": "next_scene_id",
        "condition": "optional_variable_check"
      }
    ]
  }
}
```

### Scene Properties

**`text`** (string):
- HTML content for the scene
- Supports `<h2>`, `<p>`, `<em>`, `<strong>`, etc.
- Can use `{{variableName}}` for dynamic text

**`choices`** (array):
- Each choice has `text` (what player sees) and `next` (scene ID to go to)
- Optional `condition` for conditional choices
- Optional `action` to modify game state

**`image`** (object, optional):
```json
"image": {
  "url": "path/to/image.jpg",
  "alt": "Description"
}
```

**`aiGenerate`** (object, optional):
```json
"aiGenerate": {
  "text": {
    "prompt": "AI generation prompt",
    "options": {
      "temperature": 0.9,
      "max_tokens": 150
    }
  },
  "image": {
    "prompt": "Image generation prompt"
  }
}
```

### Example: Tutorial Scene Flow

```json
{
  "tutorial_start": {
    "text": "<h2>🏝️ Tutorial: Survival Basics</h2><p>Welcome to Hedonism Island. Let's learn the basics of survival.</p><p>Your primary needs are <strong>Food</strong>, <strong>Water</strong>, and <strong>Shelter</strong>.</p>",
    "choices": [
      {
        "text": "Tell me about gathering resources",
        "next": "tutorial_resources"
      },
      {
        "text": "How do I explore the island?",
        "next": "tutorial_explore"
      },
      {
        "text": "I'm ready to begin!",
        "next": "tutorial_complete"
      }
    ]
  },
  
  "tutorial_resources": {
    "text": "<h2>📦 Gathering Resources</h2><p>Click on tiles in the map to explore them. Different terrain types provide different resources:</p><ul><li><strong>Beach:</strong> Fish, shells, driftwood</li><li><strong>Jungle:</strong> Fruit, vines, wood</li><li><strong>Rocky:</strong> Stone, minerals</li></ul>",
    "choices": [
      {
        "text": "Got it! What else?",
        "next": "tutorial_start"
      },
      {
        "text": "I'm ready to start!",
        "next": "tutorial_complete"
      }
    ]
  },
  
  "tutorial_explore": {
    "text": "<h2>🗺️ Exploring the Island</h2><p>The island is divided into hexagonal tiles. Click any tile to move there or interact with it.</p><p>Watch your <strong>energy</strong> - moving costs energy. Rest to recover.</p>",
    "choices": [
      {
        "text": "Tell me about resources",
        "next": "tutorial_resources"
      },
      {
        "text": "I'm ready!",
        "next": "tutorial_complete"
      }
    ]
  },
  
  "tutorial_complete": {
    "text": "<h2>🎯 Ready to Survive</h2><p>Remember: stay fed, stay hydrated, and explore wisely.</p><p>The island holds many secrets... and dangers.</p><p>Good luck, survivor.</p>",
    "choices": [
      {
        "text": "Begin the adventure!",
        "next": "game_start"
      }
    ]
  },
  
  "game_start": {
    "text": "<h2>🌴 Base Camp</h2><p>You stand at your makeshift camp on the beach. The jungle looms to the north, full of mystery.</p><p>What will you do?</p>",
    "choices": [
      {
        "text": "Open the map",
        "action": "openMap"
      },
      {
        "text": "Check inventory",
        "action": "openInventory"
      },
      {
        "text": "Rest and recover",
        "next": "rest_scene"
      }
    ]
  }
}
```

### Using Variables

**Setting variables:**
```json
{
  "text": "You find a mysterious key.",
  "choices": [
    {
      "text": "Take the key",
      "next": "next_scene",
      "action": {
        "type": "setVariable",
        "variable": "hasKey",
        "value": true
      }
    }
  ]
}
```

**Checking variables:**
```json
{
  "text": "A locked door blocks your path.",
  "choices": [
    {
      "text": "Use the key",
      "next": "door_unlocked",
      "condition": "hasKey === true"
    },
    {
      "text": "Try to force it open",
      "next": "door_stuck"
    }
  ]
}
```

---

## Part 3: Integrating Story with Game Flow

### Current Flow
```
Main Menu → Character Creation → Story Intro (VN) → Map/Gameplay
```

### Proposed New Flow
```
Main Menu → Character Creation → Story Intro (VN) → Tutorial (choices) → Base Camp (hub) → Map (menu option)
```

### Implementation Steps

1. **Update StoryIntro.js** - Add new opening scenes
2. **Create tutorial.json** - Tutorial scene flow
3. **Create GameHub.js** - Central hub UI with menu options
4. **Update main.js** - Change flow to use hub instead of auto-opening map

### Triggering Different Story Sections

**In main.js:**
```javascript
// After story intro completes
gameState.on('introComplete', () => {
  // Show tutorial instead of map
  tutorialSystem.start('tutorial_start');
});

// After tutorial completes
gameState.on('tutorialComplete', () => {
  // Show game hub
  gameHub.show();
});

// When player chooses to open map
gameState.on('openMap', () => {
  // Initialize and show map as a modal/screen
  initializeGameWorld();
  gameView.show();
});
```

---

## Part 4: Best Practices

### Writing Engaging VN Scenes

1. **Start Strong** - Hook the player immediately
2. **Vary Pacing** - Mix short punchy lines with longer descriptive ones
3. **Use Senses** - Describe sights, sounds, smells, feelings
4. **Show Don't Tell** - "Your hands shake" vs "You're nervous"
5. **Build Atmosphere** - Match background colors to mood
6. **End on Tension** - Leave players wanting more

### Writing Choice Scenes

1. **Meaningful Choices** - Each option should feel distinct
2. **Clear Consequences** - Players should understand what they're choosing
3. **Branch and Merge** - Paths can diverge but should eventually merge
4. **Track Progress** - Use variables to remember player choices
5. **Fail Forward** - Even "bad" choices should be interesting

### Technical Tips

1. **Test Frequently** - Play through your scenes often
2. **Use IDs Consistently** - Clear naming: `tutorial_resources`, `beach_encounter_1`
3. **Comment Your JSON** - Use descriptive scene IDs as documentation
4. **Keep Scenes Modular** - Easy to reuse and remix
5. **Balance Text Length** - Too much text is overwhelming; too little is unsatisfying

---

## Part 5: Example Complete Flow

### 1. Opening VN (StoryIntro.js)
Plane crash → Swimming to shore → Beach collapse → Title reveal

### 2. Tutorial (tutorial.json)
Learn about resources → Learn about exploration → Ready check

### 3. Game Hub (new UI)
- Check Inventory
- Open Map
- Rest/Sleep
- Character Status
- Save/Load

### 4. Map (modal/separate screen)
Hex-based exploration triggered from hub

---

## Quick Reference

### File Locations
- VN Scenes: `src/ui/storyIntro.js` → `getIntroScenes()`
- Choice Scenes: `src/data/scenes.json`
- Scene Engine: `src/modules/sceneEngine.js`
- Game Flow: `src/main.js`

### Common Actions
- Advance VN: Click or Space/Enter
- Skip VN: Escape or Skip button
- Make Choice: Click button
- Open Map: Custom action in scene choice
- Save Game: Gear icon (⚙️) → Options → Save/Load

### CSS Classes for Styling
- `.vn-container` - VN wrapper
- `.vn-textbox` - Bottom text box
- `.scene-container` - Choice scene content
- `.choice-button` - Choice buttons

---

## Next Steps

1. Write your new opening VN scenes
2. Create tutorial.json with guided learning
3. Build GameHub UI as central menu
4. Wire up map as a separate screen/modal
5. Test the complete flow

Happy writing! 🎮📖
