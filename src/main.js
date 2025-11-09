import './styles/main.css';
import './styles/menu.css';
import './styles/settings.css';
import './styles/characterCreation.css';
import './styles/storyIntro.css';
import './styles/gameView.css';
import './styles/saveManager.css';
import './styles/optionsMenu.css';
import './styles/inventoryUI.css';
import './styles/gatheringUI.css';
import './styles/craftingUI.css';
import './styles/mapTravelUI.css';
import './styles/playerHUD.css';
import './styles/endTurnMenu.css';
import './styles/tileInteractionUI.css';
import './styles/dialogueUI.css';
import { PerchanceAI } from './modules/perchanceAI.js';
import { SceneEngine } from './modules/sceneEngine.js';
import { GameState } from './modules/gameState.js';
import { SettingsManager } from './modules/settingsManager.js';
import { SettingsMenu } from './ui/settingsMenu.js';
import { MainMenu } from './ui/mainMenu.js';
import { CharacterCreationUI } from './ui/characterCreation.js';
import { StoryIntro } from './ui/storyIntro.js';
import { GameView } from './ui/gameView.js';
import { SaveManager } from './ui/saveManager.js';
import { OptionsMenu } from './ui/optionsMenu.js';
import { MapEngine } from './modules/mapEngine.js';
import { HexGrid } from './utils/hexGrid.js';
import { SimplexNoise } from './utils/noise.js';
import { SeededRandom } from './utils/seededRandom.js';
import { Player } from './modules/player.js';
import { Inventory } from './modules/inventory.js';
import { ResourceNodeManager } from './modules/resourceNode.js';
import { TerritoryManager } from './modules/territory.js';
import { TravelSystem } from './modules/travel.js';
import { InventoryUI } from './ui/inventoryUI.js';
import { GatheringUI } from './ui/gatheringUI.js';
import { CraftingUI } from './ui/craftingUI.js';
import { MapTravelUI } from './ui/mapTravelUI.js';
import { PlayerHUD } from './ui/playerHUD.js';
import { EndTurnMenu } from './ui/endTurnMenu.js';
import { TileInteractionUI } from './ui/tileInteractionUI.js';
import { DialogueUI } from './ui/dialogueUI.js';
import scenes from './data/scenes.json';

// Game Version - increment when making breaking changes
const GAME_VERSION = '4.0.0'; // Real-time system with time controls, removed energy
const COMPATIBLE_VERSIONS = ['4.0.0']; // List of save-compatible versions

// Initialize core systems
const settingsManager = new SettingsManager();
const gameState = new GameState();
const ai = new PerchanceAI();
const engine = new SceneEngine(scenes, ai);
const settingsMenu = new SettingsMenu(settingsManager);
const characterCreation = new CharacterCreationUI(gameState, settingsManager, ai);
const mainMenu = new MainMenu(gameState, settingsManager, settingsMenu, characterCreation);
const storyIntro = new StoryIntro(gameState);
const saveManager = new SaveManager(gameState);
const optionsMenu = new OptionsMenu(gameState, settingsMenu, saveManager);

// Map will be initialized after character creation
let mapEngine = null;
let gameView = null;

// Gameplay systems (initialized with game world)
let player = null;
let inventory = null;
let resourceNodeManager = null;
let territoryManager = null;
let travelSystem = null;
let inventoryUI = null;
let gatheringUI = null;
let craftingUI = null;
let mapTravelUI = null;
let playerHUD = null;
let endTurnMenu = null;
let tileInteractionUI = null;
let dialogueUI = null;

// Global options menu function (accessible from gear icon)
function showGlobalOptionsMenu() {
  console.log('⚙️ Opening options menu...');
  optionsMenu.show();
}

// Make accessible globally for debugging
window.GAME_VERSION = GAME_VERSION;
window.COMPATIBLE_VERSIONS = COMPATIBLE_VERSIONS;

window.game = {
  state: gameState,
  settings: settingsManager,
  ai: ai,
  scenes: engine,
  settingsMenu: settingsMenu,
  mainMenu: mainMenu,
  characterCreation: characterCreation,
  storyIntro: storyIntro,
  saveManager: saveManager,
  optionsMenu: optionsMenu,
  mapEngine: null,
  gameView: null,
  player: null,
  inventory: null,
  resourceNodeManager: null,
  territoryManager: null,
  travelSystem: null,
  inventoryUI: null,
  gatheringUI: null,
  craftingUI: null,
  mapTravelUI: null,
  tileInteractionUI: null,
  showGlobalOptionsMenu: showGlobalOptionsMenu
};

// Initialize map and game view
function initializeGameWorld(existingSeed = null) {
  console.log('🗺️ Generating island...');
  
  // Get or generate seed - ensure it's a valid string or number
  let seed = existingSeed || gameState.state.island.seed || Date.now();
  
  // If seed is an object or invalid, generate a new one
  if (typeof seed === 'object' || seed === null || seed === undefined) {
    console.warn('⚠️ Invalid seed detected:', seed, 'generating new seed');
    seed = Date.now();
  }
  
  gameState.state.island.seed = seed;
  console.log(`🌱 Island seed: ${seed}`);
  
  // Initialize hex grid
  const hexGrid = new HexGrid(30); // 30px hex size
  const noise = new SimplexNoise(seed);
  const rng = new SeededRandom(seed);
  
  // Generate island (always generates the same map for same seed)
  mapEngine = new MapEngine(hexGrid, noise, rng);
  const mapData = mapEngine.generate();
  
  console.log(`🏝️ Island generated: ${mapData.tiles.size} tiles`);
  
  // Initialize Player system
  const characterData = gameState.state.player || {};
  player = new Player({
    name: characterData.name || 'Survivor',
    gender: characterData.gender || 'male',
    position: { q: 0, r: 0 } // Will be set to beach tile
  });
  console.log(`👤 Player initialized: ${player.name}`);
  
  // Initialize Inventory
  inventory = new Inventory(20); // 20 slots
  console.log(`🎒 Inventory initialized (${inventory.maxSlots} slots)`);
  
  // Initialize ResourceNodeManager
  resourceNodeManager = new ResourceNodeManager();
  console.log(`🌳 ResourceNodeManager initialized`);
  
  // Initialize TerritoryManager
  territoryManager = new TerritoryManager();
  territoryManager.initFromMap(mapData);
  console.log(`🗺️ TerritoryManager initialized (${territoryManager.territories.size} territories)`);
  
  // Initialize TravelSystem
  travelSystem = new TravelSystem(player, territoryManager);
  console.log(`🚶 TravelSystem initialized`);
  
  // Find suitable starting position - use the castaway beach strategic location
  let startTile = null;
  
  // Use the designated castaway beach from strategic locations
  if (mapData.strategicLocations?.castawayBeach?.tile) {
    startTile = mapData.strategicLocations.castawayBeach.tile;
    console.log(`🏖️ Using Castaway Beach at (${startTile.q}, ${startTile.r})`);
  } else {
    console.warn('⚠️ No castaway beach in strategic locations, using fallback');
    // Fallback: find a beach tile if strategic location failed
    const beachTiles = Array.from(mapData.tiles.values())
      .filter(t => t.terrain === 'beach' && t.isLand);
    
    console.log(`🔍 Fallback: Found ${beachTiles.length} beach tiles`);
    
    if (beachTiles.length > 0) {
      // Pick a beach tile closest to center
      startTile = beachTiles.reduce((closest, tile) => {
        const distFromCenter = Math.sqrt(tile.q * tile.q + tile.r * tile.r);
        const closestDist = Math.sqrt(closest.q * closest.q + closest.r * closest.r);
        return distFromCenter < closestDist ? tile : closest;
      });
      console.log(`🏖️ Fallback beach at (${startTile.q}, ${startTile.r})`);
    } else {
      // Last resort: find any land tile near center
      const landTiles = Array.from(mapData.tiles.values())
        .filter(t => t.isLand && t.isPassable);
      
      console.log(`🔍 Last resort: Found ${landTiles.length} land tiles`);
      
      if (landTiles.length > 0) {
        startTile = landTiles.reduce((closest, tile) => {
          const distFromCenter = Math.sqrt(tile.q * tile.q + tile.r * tile.r);
          const closestDist = Math.sqrt(closest.q * closest.q + closest.r * closest.r);
          return distFromCenter < closestDist ? tile : closest;
        });
        console.log(`🌴 Last resort land at (${startTile.q}, ${startTile.r})`);
      }
    }
  }
  
  if (startTile) {
    player.position = { q: startTile.q, r: startTile.r };
    travelSystem.setPosition(startTile.q, startTile.r);
    
    // Generate starting territories (player starts with 1 tile)
    territoryManager.generateStartingTerritories({ q: startTile.q, r: startTile.r });
    console.log(`🏖️ Player starts at ${startTile.terrain} (${startTile.q}, ${startTile.r})`);
  } else {
    console.error('❌ No suitable starting position found!');
  }
  
  // Spawn initial resource nodes near starting position
  spawnInitialResources(player.position, mapData);
  
  // Spawn initial NPCs near starting position (async, non-blocking)
  spawnInitialNPCs(player.position).catch(err => {
    console.error('Failed to spawn initial NPCs:', err);
  });
  
  // Create game view
  gameView = new GameView(gameState, mapData, player, inventory, resourceNodeManager, territoryManager, travelSystem);
  
  // Initialize End Turn Menu (will be deprecated)
  endTurnMenu = new EndTurnMenu(gameState);
  
  // Initialize UI systems
  inventoryUI = new InventoryUI(inventory, player);
  gatheringUI = new GatheringUI(player, inventory, resourceNodeManager);
  craftingUI = new CraftingUI(player, gameState);
  mapTravelUI = new MapTravelUI(mapEngine, travelSystem, territoryManager);
  // playerHUD = new PlayerHUD(player, () => endTurnMenu.show()); // REMOVED - duplicate of top bar
  tileInteractionUI = new TileInteractionUI(player, territoryManager, resourceNodeManager, gameState.npcManager);
  dialogueUI = new DialogueUI(gameState.npcManager, gameState.perchanceAI);
  
  // Register UI managers with gameState
  gameState.registerUI('dialogueUI', dialogueUI);
  
  console.log(`✨ All UI systems initialized`);
  
  // Setup travel event listeners
  setupTravelEvents();
  
  // Setup gathering event listeners
  setupGatheringEvents();
  
  // Start game loop
  startGameLoop();
  
  // Update global access
  window.game.mapEngine = mapEngine;
  window.game.gameView = gameView;
  window.game.player = player;
  window.game.inventory = inventory;
  window.game.resourceNodeManager = resourceNodeManager;
  window.game.territoryManager = territoryManager;
  window.game.travelSystem = travelSystem;
  window.game.inventoryUI = inventoryUI;
  window.game.gatheringUI = gatheringUI;
  window.game.craftingUI = craftingUI;
  window.game.mapTravelUI = mapTravelUI;
  window.game.tileInteractionUI = tileInteractionUI;
  window.game.playerHUD = playerHUD;
  window.game.endTurnMenu = endTurnMenu;
  window.game.uiManagers = {
    dialogueUI: dialogueUI,
    inventoryUI: inventoryUI,
    gatheringUI: gatheringUI,
    craftingUI: craftingUI
  };
  
  console.log(`🎮 Game world fully initialized!`);
  
  return { mapEngine, gameView };
}

// Spawn initial resource nodes near starting position
function spawnInitialResources(startPos, mapData) {
  // Use the ResourceNodeManager's built-in method to generate starter nodes
  const nodes = resourceNodeManager.generateStarterNodes(startPos, 5);
  
  console.log(`🌱 Spawned ${nodes.length} resource nodes near starting position`);
}

// Spawn initial NPCs near starting position
async function spawnInitialNPCs(startPos) {
  if (!gameState.npcManager) {
    console.warn('⚠️ NPCManager not initialized, skipping NPC spawn');
    return;
  }
  
  console.log('👥 Spawning initial NPCs...');
  
  // Spawn 2-3 friendly castaways nearby
  const castawayCount = 2 + Math.floor(Math.random() * 2); // 2-3 NPCs
  
  for (let i = 0; i < castawayCount; i++) {
    // Spawn within 2-4 tiles from start
    const distance = 2 + Math.floor(Math.random() * 3);
    const angle = (Math.PI * 2 * i) / castawayCount; // Spread them out
    
    const q = startPos.q + Math.round(Math.cos(angle) * distance);
    const r = startPos.r + Math.round(Math.sin(angle) * distance);
    
    try {
      const npc = await gameState.npcManager.spawnNPC({
        faction: 'castaway',
        tile: { q, r },
        gender: Math.random() > 0.5 ? 'female' : 'male'
      }, true); // enrichWithAI = true
      
      if (npc) {
        console.log(`  ✅ Spawned ${npc.identity.name} at (${q}, ${r})`);
      }
    } catch (error) {
      console.error(`  ❌ Failed to spawn NPC ${i + 1}:`, error);
    }
  }
  
  console.log(`👥 Spawned ${castawayCount} initial NPCs`);
}

// Setup travel event listeners
function setupTravelEvents() {
  travelSystem.on('travelStart', (data) => {
    gameView.addLogEntry(`🚶 Traveling to new location... (${data.duration} minutes)`);
    // Don't advance time here - wait for travelComplete
  });
  
  travelSystem.on('travelComplete', (data) => {
    player.position = travelSystem.currentPosition;
    
    // Advance game time by travel duration when travel completes
    if (gameState && gameState.advanceTime && data.duration) {
      gameState.advanceTime(data.duration);
    }
    
    gameView.addLogEntry(`✅ Arrived at ${gameView.getTerrainName(data.territory.terrain)}`);
    gameView.renderPlayerMarker();
    mapTravelUI.render();
    
    // Update current tile info in tile interaction UI
    if (tileInteractionUI) {
      tileInteractionUI.updateCurrentTile(player.position, data.territory);
    }
  });
  
  travelSystem.on('discoveries', (data) => {
    data.discoveries.forEach(discovery => {
      if (discovery.type === 'resource') {
        // Create proper config for the discovered resource
        const nodeConfigs = {
          'tree': {
            type: 'tree',
            resourceType: 'wood',
            baseYield: { min: 2, max: 4 },
            maxUses: 5,
            requiredTool: 'axe',
            requiredSkill: 'woodcutting',
            sprite: '🌳',
            depletedSprite: '🪵',
            gatherDuration: 30, // 30 minutes
            gatherTimeMs: 2000  // 2 seconds animation
          },
          'rock': {
            type: 'rock',
            resourceType: 'stone',
            baseYield: { min: 2, max: 3 },
            maxUses: 5,
            requiredTool: 'pickaxe',
            requiredSkill: 'mining',
            sprite: '🪨',
            depletedSprite: '⚫',
            gatherDuration: 40, // 40 minutes
            gatherTimeMs: 2500  // 2.5 seconds animation
          },
          'berry_bush': {
            type: 'berry_bush',
            resourceType: 'berries',
            baseYield: { min: 3, max: 6 },
            maxUses: 8,
            requiredTool: null,
            sprite: '🫐',
            depletedSprite: '🍂',
            gatherDuration: 15, // 15 minutes
            gatherTimeMs: 1500  // 1.5 seconds animation
          }
        };
        
        const config = nodeConfigs[discovery.nodeType];
        if (config && data.territory && data.territory.position) {
          const node = resourceNodeManager.createNode({
            ...config,
            position: { q: data.territory.position.q, r: data.territory.position.r }
          });
          if (node) {
            gameView.addLogEntry(`🌳 Discovered ${discovery.nodeType} node!`);
          }
        }
      } else if (discovery.type === 'npc') {
        gameView.addLogEntry(`👤 Found someone! (NPC system not yet implemented)`);
      } else if (discovery.type === 'event') {
        gameView.addLogEntry(`❗ Something interesting... (Event: ${discovery.eventId})`);
      }
    });
  });
  
  travelSystem.on('factionEncounter', (data) => {
    gameView.addLogEntry(`⚔️ Encounter: ${data.encounterType} with ${data.faction}!`);
  });
}

// Setup gathering event listeners
function setupGatheringEvents() {
  // Note: ResourceNodeManager doesn't emit events directly
  // Gathering feedback is handled through GatheringUI
  // Future: Could add event emitter to ResourceNodeManager if needed
  console.log('📦 Gathering system ready (events handled by GatheringUI)');
}

// Game loop
let lastTime = Date.now();
let gameLoopRunning = false;

function startGameLoop() {
  if (gameLoopRunning) return;
  gameLoopRunning = true;
  
  function loop() {
    if (!gameLoopRunning) return;
    
    const now = Date.now();
    const deltaTime = now - lastTime;
    lastTime = now;
    
    // Update player stats
    if (player) {
      player.update(deltaTime);
    }
    
    // Update travel system
    if (travelSystem) {
      travelSystem.update(deltaTime);
    }
    
    // Update resource nodes
    if (resourceNodeManager) {
      resourceNodeManager.update(deltaTime);
    }
    
    // Update UI
    if (gameView) {
      gameView.updateHUD();
    }
    
    if (mapTravelUI) {
      mapTravelUI.update(deltaTime);
    }
    
    requestAnimationFrame(loop);
  }
  
  loop();
  console.log('🔄 Game loop started');
}

function stopGameLoop() {
  gameLoopRunning = false;
  console.log('⏸️ Game loop stopped');
}

// Load game from save and restore world
function loadGameWorld(savedState) {
  console.log('💾 Loading saved game...');
  
  try {
    // Validate save data
    if (!savedState) {
      throw new Error('No save data provided');
    }
    
    // Restore game state
    gameState.loadState(savedState);
    
    // Get seed from the correct location in save structure
    const seed = savedState.state?.island?.seed || savedState.island?.seed;
    
    if (!seed) {
      throw new Error('No island seed found in save data');
    }
    
    // Regenerate map from saved seed
    const { mapEngine: map, gameView: view } = initializeGameWorld(seed);
    
    // Restore player position if saved
    const playerPos = savedState.player?.position || savedState.state?.player?.position;
    if (playerPos) {
      player.position = playerPos;
      travelSystem.setPosition(playerPos.q, playerPos.r);
      view.renderPlayerMarker();
    }
    
    // Show game view
    view.show();
    
    const playerName = savedState.player?.name || savedState.state?.player?.name || 'Survivor';
    const day = savedState.state?.time?.day || savedState.time?.day || 1;
    console.log(`✅ Game loaded: Day ${day}, ${playerName}`);
    
    return { mapEngine: map, gameView: view };
  } catch (error) {
    console.error('❌ Failed to load game:', error);
    alert(`Failed to load game: ${error.message}\n\nThe save file may be corrupted or from an incompatible version. Starting a new game instead.`);
    
    // Fall back to new game
    const { mapEngine: map, gameView: view } = initializeGameWorld();
    view.show();
    return { mapEngine: map, gameView: view };
  }
}

// Start game
function initGame() {
  console.log('🏝️ Hedonism Island - Initializing...');
  
  try {
    // Initialize main menu
    console.log('🎯 Initializing main menu...');
    mainMenu.init();
    
    // Listen for character creation complete
    gameState.on('characterCreated', (character) => {
      console.log('✅ Character created:', character.name);
      
      // Store character in game state
      gameState.state.player = {
        ...gameState.state.player,
        ...character
      };
      
      // Hide character creation
      characterCreation.hide();
      
      // Show story intro
      console.log('📖 Starting story intro...');
      storyIntro.show();
    });
    
    // Listen for story intro complete
    gameState.on('introComplete', () => {
      console.log('✅ Story intro complete');
      
      // Get map seed from character if provided
      const mapSeed = gameState.state.player?.mapSeed || undefined;
      
      // Generate island and start game
      const { mapEngine: map, gameView: view } = initializeGameWorld(mapSeed);
      
      // Show game view
      console.log('🎮 Starting gameplay...');
      view.show();
      
      // Emit game started event
      gameState.emit('gameStarted');
    });
    
    // Listen for load game
    gameState.on('loadGame', (saveState) => {
      console.log('💾 Loading game from save...');
      
      // Load and restore world
      const { mapEngine: map, gameView: view } = loadGameWorld(saveState);
      
      // Emit game started
      gameState.emit('gameStarted');
    });
    
    // Listen for game start (old scene engine)
    gameState.on('gameStarted', () => {
      console.log('🎮 Game started!');
      // Scene engine is now replaced by GameView
      // engine.start();
    });
    
    console.log('✅ Game initialized!');
    console.log('💡 Open dev console and type "game" to access game systems');
  } catch (error) {
    console.error('❌ Error during initialization:', error);
  }
}

// Initialize when DOM is ready (handle both cases)
if (document.readyState === 'loading') {
  console.log('⏳ Waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  console.log('✅ DOM already loaded, initializing immediately');
  initGame();
}
