# 🏝️ Hedonism Island

A survival RPG game set on a mysterious tropical island. Combine elements of Civilization-style territorial control, resource management, crafting, and moral decision-making in this immersive browser-based adventure.

## 🎮 Features

### ✅ Implemented Systems

- **Character Creation** - Customizable characters with AI-generated portraits via Perchance
- **Player System** - Multi-layered stats (health, hunger, thirst, energy, sanity), 7 skills (woodcutting, mining, fishing, crafting, combat, diplomacy, survival), reputation tracking, moral backbone system
- **Inventory System** - 20-slot inventory with drag-and-drop, equipment system, item quality tiers
- **Resource Gathering** - Dynamic resource nodes (trees, rocks, bushes, coconuts) with states, skill-based yields, tool requirements
- **Crafting System** - 20+ recipes across tools, weapons, equipment, consumables. Quality system based on crafting skill
- **Hex-Based Map** - Procedurally generated 40x40 island with multiple biomes, elevation, moisture systems
- **Travel & Territory** - Energy-based travel, 5 factions with territorial control, fog of war with 3 visibility states
- **Discovery System** - 30% chance for resources, 20% for events, 15% for NPCs when exploring
- **Faction System** - Player, Castaways, Native Clan 1, Native Clan 2, Mercenaries with relationship tracking
- **Save/Load System** - LocalStorage-based saves with auto-save every 5 moves

### 🚧 In Development

- **Survival Mechanics** - Weather, shelter, temperature, disease, sleep requirements
- **Early Game Content** - Tutorial, day 1-7 progression, first encounters
- **NPC System** - AI personality generation, dialogue trees, relationships, daily schedules

## 🛠️ Tech Stack

- **Vanilla JavaScript** - No frameworks, pure ES6+
- **Vite** - Build tool and dev server
- **Canvas API** - Hex map rendering
- **Perchance API** - AI image and text generation
- **LocalStorage** - Save game persistence

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🎯 Controls

- **Mouse Click** - Travel to adjacent hexes, gather resources, interact
- **I** - Open Inventory
- **C** - Open Crafting Menu
- **K** - View Skills
- **ESC** - Close menus
- **Scroll** - Zoom map (when implemented)

## 🗺️ Game Systems

### Character Stats
- **Health** - Damage from combat, environmental hazards
- **Hunger** - Depletes over time, affects health
- **Thirst** - Critical survival need
- **Energy** - Required for travel and actions
- **Sanity** - Mental health, affected by isolation and events

### Skills
1. **Woodcutting** - Gather wood more efficiently
2. **Mining** - Extract stone and ores
3. **Fishing** - Catch fish and seafood
4. **Crafting** - Create better quality items
5. **Combat** - Fight effectiveness
6. **Diplomacy** - NPC interactions and trading
7. **Survival** - General island expertise

### Factions
- **Player** - You (cyan)
- **Castaways** - Fellow survivors (green)
- **Native Clan 1** - Indigenous islanders (yellow)
- **Native Clan 2** - Rival native group (orange)
- **Mercenaries** - Hostile forces (red)

## 📁 Project Structure

```
hedonism-island/
├── src/
│   ├── data/           # Item database, recipes
│   ├── modules/        # Core game systems
│   │   ├── gameState.js
│   │   ├── mapEngine.js
│   │   ├── player.js
│   │   ├── inventory.js
│   │   ├── resourceNode.js
│   │   ├── crafting.js
│   │   ├── travel.js
│   │   └── territory.js
│   ├── ui/             # UI components
│   │   ├── mainMenu.js
│   │   ├── characterCreation.js
│   │   ├── gameView.js
│   │   ├── inventoryUI.js
│   │   ├── craftingUI.js
│   │   └── mapTravelUI.js
│   ├── utils/          # Utilities
│   │   ├── hexGrid.js
│   │   ├── noise.js
│   │   └── random.js
│   ├── styles/         # CSS
│   ├── main.js         # Entry point
│   └── index.html      # HTML template
├── build/              # Production build
├── dev/                # Test pages
└── Perchance_Files/    # Perchance integration
```

## 🎨 Design Philosophy

**Civilization meets Survival RPG** - Strategic territorial control combined with personal survival mechanics. Every action has consequences, from resource depletion to faction relationships.

**Moral Backbone System** - Your choices shape your character:
- **Claim** - Take what you want by force
- **Respect** - Honor existing claims and traditions  
- **Exploit** - Use people for your benefit
- **Leave** - Walk away and find another way

## 🔧 Development Notes

### Current Focus
- Fixing player position detection for movement
- Improving hex distance calculations for travel
- Enhancing fog of war visibility

### Known Issues
- Player location detection needs refinement
- Movement to adjacent hexes occasionally reports "too far"
- Beach spawning works but could be more reliable

### Next Milestones
1. Polish movement and position detection
2. Implement survival mechanics (hunger/thirst depletion, weather)
3. Create tutorial and early game content
4. Build NPC system with Perchance AI generation

## 📝 Version History

### v2.0.0 (Current)
- Full system integration
- All core systems playable from character creation to exploration
- 40x40 procedurally generated island
- Complete crafting and gathering systems
- Territory control with 5 factions

### v1.0.0
- Initial prototype
- Basic map generation
- Simple character system

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome!

## 📄 License

MIT License - Feel free to learn from and remix this code.

## 🎮 Play Now

Open `build/index.html` in a modern web browser to start playing!

---

**Note**: This game is actively in development. Expect bugs, missing features, and rapid changes. Save files may not be compatible between major updates.
