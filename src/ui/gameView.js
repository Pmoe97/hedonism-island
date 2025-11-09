/**
 * Game View - Main Gameplay Interface
 * Map display, player stats, inventory, etc.
 */

import { MapRenderer } from '../modules/mapRenderer.js';

export class GameView {
  constructor(gameState, mapData, player, inventory, resourceNodeManager, territoryManager, travelSystem) {
    this.gameState = gameState;
    this.mapData = mapData;
    this.player = player;
    this.inventory = inventory;
    this.resourceNodeManager = resourceNodeManager;
    this.territoryManager = territoryManager;
    this.travelSystem = travelSystem;
    this.renderer = null;
    this.moveCount = 0;
  }

  show() {
    const container = document.getElementById('game-view');
    if (!container) {
      console.error('Game view container not found');
      return;
    }

    // Hide main menu if visible
    const mainMenu = document.querySelector('.main-menu');
    if (mainMenu) {
      mainMenu.classList.add('hidden');
    }

    container.classList.remove('hidden');
    this.render();
    
    console.log('✅ Game view shown');
  }

  hide() {
    const container = document.getElementById('game-view');
    if (container) {
      container.classList.add('hidden');
    }
  }

  render() {
    const container = document.getElementById('game-view');
    const character = this.gameState.state.player;
    const timeString = this.gameState.getTimeString ? this.gameState.getTimeString() : `Day ${this.gameState.state.time?.day || 1}`;
    const timeOfDay = this.gameState.getTimeOfDay ? this.gameState.getTimeOfDay() : 'morning';
    const isPaused = this.gameState.isPaused || false;
    const timeSpeed = this.gameState.timeSpeed || 1;
    
    container.innerHTML = `
      <div class="game-container">
        <!-- Optimized HUD -->
        <div class="game-hud">
          <!-- Left: Player Profile & Stats -->
          <div class="hud-left">
            <div class="player-profile">
              <div class="player-portrait">
                ${character.portraitUrl ? 
                  `<img src="${character.portraitUrl}" alt="${character.name}">` :
                  '<div class="portrait-placeholder">👤</div>'
                }
              </div>
              <div class="player-name">${character.name}</div>
            </div>
            
            <div class="stats-grid">
              <div class="stat-cell" id="health-cell">
                <div class="stat-icon">❤️</div>
                <div class="stat-bar-mini">
                  <div class="stat-bar-fill health" style="width: ${this.player.health}%" id="health-bar"></div>
                </div>
                <div class="stat-num" id="health-value">${Math.round(this.player.health)}</div>
              </div>
              <div class="stat-cell" id="hunger-cell">
                <div class="stat-icon">🍖</div>
                <div class="stat-bar-mini">
                  <div class="stat-bar-fill hunger" style="width: ${this.player.hunger}%" id="hunger-bar"></div>
                </div>
                <div class="stat-num" id="hunger-value">${Math.round(this.player.hunger)}</div>
              </div>
              <div class="stat-cell" id="thirst-cell">
                <div class="stat-icon">💧</div>
                <div class="stat-bar-mini">
                  <div class="stat-bar-fill thirst" style="width: ${this.player.thirst}%" id="thirst-bar"></div>
                </div>
                <div class="stat-num" id="thirst-value">${Math.round(this.player.thirst)}</div>
              </div>
              <div class="stat-cell" id="happiness-cell">
                <div class="stat-icon">😊</div>
                <div class="stat-bar-mini">
                  <div class="stat-bar-fill happiness" style="width: ${this.player.happiness || 75}%" id="happiness-bar"></div>
                </div>
                <div class="stat-num" id="happiness-value">${Math.round(this.player.happiness || 75)}</div>
              </div>
            </div>
          </div>
          
          <!-- Center: Action Buttons -->
          <div class="hud-center">
            <div class="action-grid">
              <button class="action-btn" id="inventory-btn" title="Inventory (I)">🎒</button>
              <button class="action-btn" id="crafting-btn" title="Crafting (C)">🔨</button>
              <button class="action-btn" id="skills-btn" title="Skills (K)">⭐</button>
              <button class="action-btn" id="journal-btn" title="Journal (Coming Soon)">📖</button>
              <button class="action-btn" id="map-btn" title="Map (Coming Soon)">🗺️</button>
              <button class="action-btn" id="game-menu-btn" title="Menu">⚙️</button>
            </div>
          </div>
          
          <!-- Right: Time Controls -->
          <div class="hud-right">
            <div class="time-display">
              <div class="time-icon">${this.getTimeOfDayIcon(timeOfDay)}</div>
              <div class="time-info">
                <div class="time-string">${timeString}</div>
              </div>
            </div>
            
            <div class="time-controls">
              <button class="time-btn ${isPaused ? 'active' : ''}" id="pause-btn" title="Pause (Space)">
                ${isPaused ? '▶️' : '⏸️'}
              </button>
              <button class="time-btn ${!isPaused && timeSpeed === 1 ? 'active' : ''}" id="speed-1x" title="1x Speed">1x</button>
              <button class="time-btn ${!isPaused && timeSpeed === 5 ? 'active' : ''}" id="speed-5x" title="5x Speed">5x</button>
              <button class="time-btn ${!isPaused && timeSpeed === 10 ? 'active' : ''}" id="speed-10x" title="10x Speed">10x</button>
              <button class="time-btn ${!isPaused && timeSpeed === 20 ? 'active' : ''}" id="speed-20x" title="20x Speed">20x</button>
            </div>
          </div>
        </div>

        <!-- Map Display -->
        <div class="map-display">
          <canvas id="game-canvas"></canvas>
          
          <!-- Map Controls -->
          <div class="map-controls">
            <button class="map-control-btn" id="zoom-in-btn" title="Zoom In">🔍+</button>
            <button class="map-control-btn" id="zoom-out-btn" title="Zoom Out">🔍-</button>
            <button class="map-control-btn" id="center-player-btn" title="Center on Player">🎯</button>
            <button class="map-control-btn" id="toggle-legend-btn" title="Toggle Legend">🗺️</button>
            <button class="map-control-btn" id="toggle-fog-btn" title="Toggle Fog of War (Debug)">👁️</button>
          </div>
          
          <!-- Action Log Button/Panel (positioned below map controls) -->
          <div class="action-log-container collapsed" id="action-log-container">
            <div class="action-log-button" id="toggle-log-btn" title="Action Log">
              📜
            </div>
            <div class="action-log-expanded">
              <div class="action-log-header" id="action-log-header">
                <h4>📜 Action Log</h4>
                <span class="collapse-hint">Click to collapse</span>
              </div>
              <div class="log-content" id="action-log">
                <p class="log-entry">You wake up on an unfamiliar beach...</p>
                <p class="log-entry">The plane crash knocked you unconscious.</p>
                <p class="log-entry">You need to find water and shelter soon.</p>
              </div>
            </div>
          </div>
          
          <!-- Tile Info -->
          <div class="tile-info" id="tile-info">
            <div class="tile-info-content">
              <h4>Tile Info</h4>
              <p>Hover over tiles to see details</p>
            </div>
          </div>

          <!-- Tutorial Hint -->
          <div class="tutorial-hint">
            <p>🖱️ <strong>Click</strong> adjacent tiles to travel</p>
            <p>� <strong>Click</strong> resource nodes to gather</p>
            <p>⌨️ <strong>I</strong>=Inventory • <strong>C</strong>=Craft • <strong>K</strong>=Skills</p>
          </div>
        </div>
      </div>
    `;

    // Initialize map renderer
    this.initializeMap();
    this.attachEventListeners();
    
    // Initialize tile interaction UI
    if (window.game?.tileInteractionUI) {
      window.game.tileInteractionUI.initialize('#tile-info');
      
      // Update current tile info for starting position
      const startTerritory = this.territoryManager.getTerritory(this.player.position.q, this.player.position.r);
      window.game.tileInteractionUI.updateCurrentTile(this.player.position, startTerritory);
    }
  }

  initializeMap() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas || !this.mapData) return;

    this.renderer = new MapRenderer(canvas, this.mapData.hexGrid);
    this.renderer.render(this.mapData.tiles, this.territoryManager);

    // Initialize fog of war button state
    this.updateFogButton();

    // Player already positioned by TravelSystem
    console.log(`🏖️ Player at (${this.player.position.q}, ${this.player.position.r})`);

    // Render everything
    this.renderPlayerMarker();
    this.renderResourceNodes();
    
    // Center on player
    setTimeout(() => this.centerOnPlayer(), 100);
  }

  renderPlayerMarker() {
    if (!this.renderer) return;

    // Re-render map
    this.renderer.render(this.mapData.tiles, this.territoryManager);

    // Let MapTravelUI handle territory and fog rendering
    if (window.game.mapTravelUI) {
      window.game.mapTravelUI.render();
    }

    // Render resource nodes
    this.renderResourceNodes();

    // Draw player marker
    const ctx = this.renderer.ctx;
    ctx.save();
    ctx.translate(this.renderer.offsetX, this.renderer.offsetY);
    ctx.scale(this.renderer.scale, this.renderer.scale);

    const center = this.renderer.hexGrid.axialToPixel(
      this.player.position.q,
      this.player.position.r
    );

    // Player marker (circle with outline)
    ctx.beginPath();
    ctx.arc(center.x, center.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#4dd0e1';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Player icon
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📍', center.x, center.y);

    ctx.restore();
  }

  renderResourceNodes() {
    if (!this.renderer || !this.resourceNodeManager) return;

    const ctx = this.renderer.ctx;
    ctx.save();
    ctx.translate(this.renderer.offsetX, this.renderer.offsetY);
    ctx.scale(this.renderer.scale, this.renderer.scale);

    // Render each resource node
    this.resourceNodeManager.nodes.forEach(node => {
      // Safety check for node position
      if (!node || !node.position) return;
      
      // Only render discovered nodes in discovered territories
      const territory = this.territoryManager?.getTerritory(node.position.q, node.position.r);
      if (!territory || !territory.discovered) return;
      if (!node.discovered) return; // Resource must be discovered through exploration

      const center = this.renderer.hexGrid.axialToPixel(
        node.position.q,
        node.position.r
      );

      // Node icon based on type
      const icons = {
        tree: '🌳',
        rock: '🪨',
        bush: '🌿',
        fish: '�'
      };

      const icon = icons[node.type] || '❓';

      // Background circle
      ctx.beginPath();
      ctx.arc(center.x, center.y - 15, 12, 0, Math.PI * 2);
      
      // Color based on state
      if (node.state === 'full') {
        ctx.fillStyle = 'rgba(74, 222, 128, 0.8)';
      } else if (node.state === 'depleted') {
        ctx.fillStyle = 'rgba(156, 163, 175, 0.6)';
      } else {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
      }
      
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Icon
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, center.x, center.y - 15);
    });

    ctx.restore();
  }

  attachEventListeners() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;

    // Map interaction
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });

    canvas.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        
        this.renderer.pan(dx, dy);
        this.renderPlayerMarker();
        
        lastX = e.clientX;
        lastY = e.clientY;
      } else {
        // Show tile info on hover (handled by MapTravelUI)
        this.showTileInfo(e);
      }
    });

    canvas.addEventListener('mouseup', (e) => {
      if (!isDragging) {
        // Click to interact (travel or gather)
        this.handleTileClick(e);
      }
      isDragging = false;
    });

    canvas.addEventListener('mouseleave', () => {
      isDragging = false;
    });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = -Math.sign(e.deltaY) * 0.1;
      this.renderer.zoom(delta, e.clientX, e.clientY);
      this.renderPlayerMarker();
    });

    // Map controls
    document.getElementById('zoom-in-btn')?.addEventListener('click', () => {
      this.renderer.zoom(0.2, canvas.width / 2, canvas.height / 2);
      this.renderPlayerMarker();
    });

    document.getElementById('zoom-out-btn')?.addEventListener('click', () => {
      this.renderer.zoom(-0.2, canvas.width / 2, canvas.height / 2);
      this.renderPlayerMarker();
    });

    document.getElementById('center-player-btn')?.addEventListener('click', () => {
      this.centerOnPlayer();
    });

    document.getElementById('toggle-legend-btn')?.addEventListener('click', () => {
      const legend = document.getElementById('territory-legend');
      if (legend) {
        legend.style.display = legend.style.display === 'none' ? 'block' : 'none';
      }
    });

    document.getElementById('toggle-fog-btn')?.addEventListener('click', () => {
      this.renderer.fogOfWarEnabled = !this.renderer.fogOfWarEnabled;
      this.updateFogButton();
      this.renderPlayerMarker();
    });

    // Action log toggle
    document.getElementById('toggle-log-btn')?.addEventListener('click', () => {
      this.toggleActionLog();
    });

    document.getElementById('action-log-header')?.addEventListener('click', () => {
      this.toggleActionLog();
    });

    // Window resize
    window.addEventListener('resize', () => {
      this.renderer.setupCanvas();
      this.renderPlayerMarker();
    });
    
    // HUD buttons
    document.getElementById('inventory-btn')?.addEventListener('click', () => {
      window.game.inventoryUI?.toggle();
    });

    document.getElementById('crafting-btn')?.addEventListener('click', () => {
      window.game.craftingUI?.toggle();
    });

    document.getElementById('skills-btn')?.addEventListener('click', () => {
      this.showSkillsMenu();
    });
    
    document.getElementById('journal-btn')?.addEventListener('click', () => {
      // TODO: Implement journal
      console.log('Journal coming soon!');
    });
    
    document.getElementById('map-btn')?.addEventListener('click', () => {
      // TODO: Implement map overview
      console.log('Map overview coming soon!');
    });
    
    document.getElementById('game-menu-btn')?.addEventListener('click', () => {
      window.game.optionsMenu?.show();
    });

    // Time control buttons
    document.getElementById('pause-btn')?.addEventListener('click', () => {
      this.gameState.togglePause();
      this.updateTimeDisplay();
    });

    document.getElementById('speed-1x')?.addEventListener('click', () => {
      if (this.gameState.isPaused) this.gameState.resume();
      this.gameState.setTimeSpeed(1);
      this.updateTimeDisplay();
    });

    document.getElementById('speed-5x')?.addEventListener('click', () => {
      if (this.gameState.isPaused) this.gameState.resume();
      this.gameState.setTimeSpeed(5);
      this.updateTimeDisplay();
    });

    document.getElementById('speed-10x')?.addEventListener('click', () => {
      if (this.gameState.isPaused) this.gameState.resume();
      this.gameState.setTimeSpeed(10);
      this.updateTimeDisplay();
    });

    document.getElementById('speed-20x')?.addEventListener('click', () => {
      if (this.gameState.isPaused) this.gameState.resume();
      this.gameState.setTimeSpeed(20);
      this.updateTimeDisplay();
    });

    // Only ESC key for closing modals (standard UX pattern)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Close any open UIs
        window.game.inventoryUI?.hide();
        window.game.craftingUI?.hide();
      }
    });
  }

  showTileInfo(event) {
    const hex = this.renderer.screenToHex(event.clientX, event.clientY);
    const tile = this.mapData.tiles.get(`${hex.q},${hex.r}`);
    
    if (!tile) {
      // Clear hover info if no tile
      if (window.game?.tileInteractionUI) {
        window.game.tileInteractionUI.clearHoverInfo();
      }
      return;
    }
    
    // Update hover info in tile interaction UI
    const territory = this.territoryManager.getTerritory(hex.q, hex.r);
    if (window.game?.tileInteractionUI && territory) {
      window.game.tileInteractionUI.updateHoverInfo(hex, territory);
    }
  }

  handleTileClick(event) {
    const hex = this.renderer.screenToHex(event.clientX, event.clientY);
    const tile = this.mapData.tiles.get(`${hex.q},${hex.r}`);
    
    if (!tile) {
      console.log('❌ No tile found at', hex);
      return;
    }

    // Calculate distance using proper hex distance formula
    const dq = Math.abs(hex.q - this.player.position.q);
    const dr = Math.abs(hex.r - this.player.position.r);
    const ds = Math.abs((-hex.q - hex.r) - (-this.player.position.q - this.player.position.r));
    const distance = Math.max(dq, dr, ds);

    console.log('🖱️ Tile clicked:', {
      position: hex,
      playerPosition: this.player.position,
      distance,
      terrain: tile.terrain,
      isPassable: tile.isPassable
    });

    // Check if clicking current tile - show tile interaction modal
    if (distance === 0) {
      console.log('📍 Clicking current tile - showing tile actions');
      this.showTileActions(tile, hex);
      return;
    }

    // Check if clicking adjacent tile with POIs - show interaction modal
    const territory = this.territoryManager.getTerritory(hex.q, hex.r);
    const nodes = this.resourceNodeManager?.getNodesAt(hex.q, hex.r) || [];
    
    // Check for real NPCs instead of old hasNPC flag
    let hasNPCs = false;
    if (window.game?.state?.npcManager) {
      const npcs = window.game.state.npcManager.getNPCsAtTile(hex);
      hasNPCs = npcs.length > 0;
    }
    
    const hasPOIs = nodes.length > 0 || hasNPCs || territory?.hasEvent;
    
    if (distance === 1 && hasPOIs) {
      // Adjacent tile with POIs - show interaction modal
      if (window.game?.tileInteractionUI) {
        window.game.tileInteractionUI.show(hex, territory);
      } else {
        console.error('❌ tileInteractionUI not found on window.game!');
        this.addLogEntry('🔍 Something interesting here. Move closer to interact.');
      }
      return;
    }

    // Otherwise, try to travel
    if (!tile.isPassable) {
      this.addLogEntry("❌ You can't travel there.");
      return;
    }

    // Must be adjacent to travel
    if (distance > 1) {
      console.log('❌ Too far to travel');
      this.addLogEntry("❌ Too far to travel in one move.");
      return;
    }

    // Use TravelSystem to move
    console.log('🚶 Attempting travel to', hex);
    const result = this.travelSystem.startTravel(hex.q, hex.r);
    if (!result.success) {
      this.addLogEntry(`❌ ${result.reason}`);
    }
  }

  /**
   * Show available actions for current tile
   */
  showTileActions(tile, hex) {
    const territory = this.territoryManager.getTerritory(hex.q, hex.r);
    
    // Open the tile interaction UI modal
    if (window.game?.tileInteractionUI) {
      window.game.tileInteractionUI.show(hex, territory);
    } else {
      // Fallback to simple log message
      const nodes = this.resourceNodeManager.getNodesAt(hex.q, hex.r);
      
      let message = `📍 Current Location: ${tile.terrain}`;
      
      // Show available actions
      if (nodes && nodes.length > 0) {
        message += ` | 🌲 Resources available`;
      }
      if (territory && territory.owner) {
        message += ` | 🏴 Controlled by ${territory.owner}`;
      }
      
      this.addLogEntry(message);
    }
  }

  triggerTerrainEvent(tile) {
    const events = {
      'beach': [
        '🐚 You find some seashells.',
        '🌊 The waves lap gently at your feet.',
        '☀️ The sun warms your skin.'
      ],
      'forest': [
        '🍎 You spot some edible berries.',
        '🌿 The forest is thick here.',
        '🦎 A lizard scurries away.'
      ],
      'rainforest': [
        '🌧️ Moisture drips from the canopy.',
        '🦜 You hear exotic bird calls.',
        '🍄 Strange mushrooms grow nearby.'
      ]
    };

    const terrainEvents = events[tile.terrain];
    if (terrainEvents && Math.random() < 0.3) {
      const event = terrainEvents[Math.floor(Math.random() * terrainEvents.length)];
      this.addLogEntry(event);
    }
  }

  // Update HUD with real-time player stats
  updateHUD() {
    if (!this.player) return;

    // Update stat bars
    const healthBar = document.getElementById('health-bar');
    const hungerBar = document.getElementById('hunger-bar');
    const thirstBar = document.getElementById('thirst-bar');
    const energyBar = document.getElementById('energy-bar');

    const healthValue = document.getElementById('health-value');
    const hungerValue = document.getElementById('hunger-value');
    const thirstValue = document.getElementById('thirst-value');
    const energyValue = document.getElementById('energy-value');

    if (healthBar) healthBar.style.width = `${this.player.health}%`;
    if (hungerBar) hungerBar.style.width = `${this.player.hunger}%`;
    if (thirstBar) thirstBar.style.width = `${this.player.thirst}%`;
    if (energyBar) energyBar.style.width = `${this.player.energy}%`;

    if (healthValue) healthValue.textContent = `${Math.round(this.player.health)}`;
    if (hungerValue) hungerValue.textContent = `${Math.round(this.player.hunger)}`;
    if (thirstValue) thirstValue.textContent = `${Math.round(this.player.thirst)}`;
    if (energyValue) energyValue.textContent = `${Math.round(this.player.energy)}`;
    
    // Update time display
    this.updateTimeDisplay();
  }
  
  updateTimeDisplay() {
    // Update time string
    const timeString = this.gameState.getTimeString ? this.gameState.getTimeString() : `Day ${this.gameState.state.time?.day || 1}`;
    const timeOfDay = this.gameState.getTimeOfDay ? this.gameState.getTimeOfDay() : 'morning';
    const timeStringEl = document.querySelector('.time-string');
    const timeIconEl = document.querySelector('.time-icon');
    
    if (timeStringEl) {
      timeStringEl.textContent = timeString;
    }
    
    if (timeIconEl) {
      timeIconEl.textContent = this.getTimeOfDayIcon(timeOfDay);
    }
    
    // Update time control button states
    const isPaused = this.gameState.isPaused || false;
    const timeSpeed = this.gameState.timeSpeed || 1;
    
    const pauseBtn = document.getElementById('pause-btn');
    const speed1x = document.getElementById('speed-1x');
    const speed5x = document.getElementById('speed-5x');
    const speed10x = document.getElementById('speed-10x');
    const speed20x = document.getElementById('speed-20x');
    
    if (pauseBtn) {
      pauseBtn.classList.toggle('active', isPaused);
      pauseBtn.textContent = isPaused ? '▶️' : '⏸️';
    }
    
    if (speed1x) speed1x.classList.toggle('active', !isPaused && timeSpeed === 1);
    if (speed5x) speed5x.classList.toggle('active', !isPaused && timeSpeed === 5);
    if (speed10x) speed10x.classList.toggle('active', !isPaused && timeSpeed === 10);
    if (speed20x) speed20x.classList.toggle('active', !isPaused && timeSpeed === 20);
  }

  // Show skills menu
  showSkillsMenu() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'skills-modal';
    
    let skillsHTML = '<div class="skills-grid">';
    
    Object.entries(this.player.skills).forEach(([skill, data]) => {
      const progress = ((data.experience % 100) / 100) * 100;
      skillsHTML += `
        <div class="skill-card">
          <h4>${skill}</h4>
          <div class="skill-level">Level ${data.level}</div>
          <div class="skill-progress-bar">
            <div class="skill-progress-fill" style="width: ${progress}%"></div>
          </div>
          <div class="skill-xp">${data.experience} XP</div>
        </div>
      `;
    });
    
    skillsHTML += '</div>';
    
    modal.innerHTML = `
      <div class="modal-content skills-modal">
        <div class="modal-header">
          <h2>⭐ Skills</h2>
          <button class="close-btn" id="close-skills">✕</button>
        </div>
        <div class="modal-body">
          ${skillsHTML}
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" id="close-skills-btn">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('close-skills').onclick = () => modal.remove();
    document.getElementById('close-skills-btn').onclick = () => modal.remove();
    
    // Close on ESC
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  centerOnPlayer() {
    if (!this.renderer) return;

    const canvas = document.getElementById('game-canvas');
    const center = this.renderer.hexGrid.axialToPixel(
      this.player.position.q,
      this.player.position.r
    );

    this.renderer.offsetX = canvas.width / 2 - center.x * this.renderer.scale;
    this.renderer.offsetY = canvas.height / 2 - center.y * this.renderer.scale;
    this.renderPlayerMarker();
  }

  addLogEntry(text) {
    const log = document.getElementById('action-log');
    if (!log) return;

    const entry = document.createElement('p');
    entry.className = 'log-entry';
    entry.textContent = text;
    
    // Insert at the top instead of bottom
    log.insertBefore(entry, log.firstChild);

    // Limit log entries (remove from bottom when too many)
    while (log.children.length > 50) {
      log.removeChild(log.lastChild);
    }
  }

  getTerrainName(terrain) {
    const names = {
      'sea': 'Ocean',
      'beach': 'Beach',
      'river': 'River',
      'savanna': 'Savanna',
      'forest': 'Forest',
      'rainforest': 'Rainforest',
      'dry-hill': 'Dry Hill',
      'jungle-hill': 'Jungle Hill',
      'cloud-forest': 'Cloud Forest',
      'rocky-peak': 'Rocky Peak',
      'misty-peak': 'Misty Peak'
    };
    return names[terrain] || 'Unknown';
  }

  getTimeOfDayIcon(timeOfDay) {
    const icons = {
      'dawn': '🌅',
      'morning': '☀️',
      'afternoon': '🌤️',
      'evening': '🌇',
      'night': '🌙'
    };
    return icons[timeOfDay] || '🌞';
  }

  updateFogButton() {
    const btn = document.getElementById('toggle-fog-btn');
    if (!btn || !this.renderer) return;
    
    btn.title = this.renderer.fogOfWarEnabled ? 
      'Fog of War: ON (Click to disable)' : 
      'Fog of War: OFF (Click to enable)';
    btn.style.opacity = this.renderer.fogOfWarEnabled ? '1.0' : '0.5';
  }

  toggleActionLog() {
    const container = document.getElementById('action-log-container');
    if (!container) return;
    
    container.classList.toggle('collapsed');
  }
}
