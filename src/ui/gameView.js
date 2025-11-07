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
    
    container.innerHTML = `
      <div class="game-container">
        <!-- Top HUD -->
        <div class="game-hud">
          <div class="hud-left">
            <div class="player-info">
              <div class="player-portrait">
                ${character.portraitUrl ? 
                  `<img src="${character.portraitUrl}" alt="${character.name}">` :
                  '<div class="portrait-placeholder">👤</div>'
                }
              </div>
              <div class="player-details">
                <h3>${character.name}</h3>
                <p class="player-stats">
                  Day ${this.gameState.state.time?.day || 1} • ${character.gender}
                </p>
              </div>
            </div>
          </div>
          
          <div class="hud-center">
            <div class="stat-bar">
              <span class="stat-label">❤️ Health</span>
              <div class="stat-bar-fill">
                <div class="stat-bar-inner" style="width: ${this.player.health}%" id="health-bar"></div>
              </div>
              <span class="stat-value" id="health-value">${Math.round(this.player.health)}/100</span>
            </div>
            <div class="stat-bar">
              <span class="stat-label">🍖 Hunger</span>
              <div class="stat-bar-fill">
                <div class="stat-bar-inner hunger" style="width: ${this.player.hunger}%" id="hunger-bar"></div>
              </div>
              <span class="stat-value" id="hunger-value">${Math.round(this.player.hunger)}/100</span>
            </div>
            <div class="stat-bar">
              <span class="stat-label">💧 Thirst</span>
              <div class="stat-bar-fill">
                <div class="stat-bar-inner thirst" style="width: ${this.player.thirst}%" id="thirst-bar"></div>
              </div>
              <span class="stat-value" id="thirst-value">${Math.round(this.player.thirst)}/100</span>
            </div>
            <div class="stat-bar">
              <span class="stat-label">⚡ Energy</span>
              <div class="stat-bar-fill">
                <div class="stat-bar-inner energy" style="width: ${this.player.energy}%" id="energy-bar"></div>
              </div>
              <span class="stat-value" id="energy-value">${Math.round(this.player.energy)}/100</span>
            </div>
          </div>
          
          <div class="hud-right">
            <button class="hud-btn" id="inventory-btn" title="Inventory">
              🎒 <span>Inventory</span>
            </button>
            <button class="hud-btn" id="crafting-btn" title="Crafting">
              🔨 <span>Craft</span>
            </button>
            <button class="hud-btn" id="skills-btn" title="Skills">
              ⭐ <span>Skills</span>
            </button>
            <button class="hud-btn primary" id="end-turn-btn" title="End Turn">
              ⏭️ <span>End Turn</span>
            </button>
            <button class="hud-btn" id="game-menu-btn" title="Menu">
              ⚙️ <span>Menu</span>
            </button>
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

        <!-- Action Log -->
        <div class="action-log">
          <h4>📜 Action Log</h4>
          <div class="log-content" id="action-log">
            <p class="log-entry">You wake up on an unfamiliar beach...</p>
            <p class="log-entry">The plane crash knocked you unconscious.</p>
            <p class="log-entry">You need to find water and shelter soon.</p>
          </div>
        </div>
      </div>
    `;

    // Initialize map renderer
    this.initializeMap();
    this.attachEventListeners();
  }

  initializeMap() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas || !this.mapData) return;

    this.renderer = new MapRenderer(canvas, this.mapData.hexGrid);
    this.renderer.render(this.mapData.tiles);

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
    this.renderer.render(this.mapData.tiles);

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
      
      // Only render discovered nodes
      const territory = this.territoryManager?.getTerritory(node.position.q, node.position.r);
      if (!territory || !territory.discovered) return;

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
      const btn = document.getElementById('toggle-fog-btn');
      if (btn) {
        btn.title = this.renderer.fogOfWarEnabled ? 
          'Fog of War: ON (Click to disable)' : 
          'Fog of War: OFF (Click to enable)';
        btn.style.opacity = this.renderer.fogOfWarEnabled ? '1.0' : '0.5';
      }
      this.renderPlayerMarker();
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
    
    document.getElementById('end-turn-btn')?.addEventListener('click', () => {
      window.game.endTurnMenu?.show();
    });
    
    document.getElementById('game-menu-btn')?.addEventListener('click', () => {
      this.showGameMenu();
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
  
  showGameMenu() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'game-menu-modal';
    
    const saves = this.gameState.listSaves();
    const currentSave = saves.find(s => s.slotName === 'autosave');
    
    modal.innerHTML = `
      <div class="modal-content game-menu-modal">
        <div class="modal-header">
          <h2>⚙️ Game Menu</h2>
          <button class="close-btn" id="close-game-menu">✕</button>
        </div>
        <div class="modal-body">
          <div class="game-menu-buttons">
            <button class="menu-action-btn" id="quick-save-btn">
              💾 Quick Save
            </button>
            <button class="menu-action-btn" id="save-as-btn">
              💾 Save As...
            </button>
            <button class="menu-action-btn" id="load-game-btn">
              📂 Load Game
            </button>
            <button class="menu-action-btn" id="export-save-btn">
              📤 Export Save
            </button>
            <button class="menu-action-btn" id="import-save-btn">
              📥 Import Save
            </button>
            <button class="menu-action-btn" id="settings-btn-game">
              ⚙️ Settings
            </button>
            <button class="menu-action-btn danger" id="main-menu-btn">
              🏠 Main Menu
            </button>
          </div>
          ${currentSave ? `
            <div class="save-info">
              <h4>Current Progress</h4>
              <p>Day ${this.gameState.state.time.day} • ${this.gameState.state.characters.length} characters</p>
              <p>Last saved: ${new Date(currentSave.saveDate).toLocaleString()}</p>
            </div>
          ` : ''}
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" id="resume-game-btn">Resume Game</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Attach listeners
    document.getElementById('close-game-menu').onclick = () => modal.remove();
    document.getElementById('resume-game-btn').onclick = () => modal.remove();
    
    document.getElementById('quick-save-btn').onclick = () => {
      this.gameState.save('autosave');
      this.addLogEntry('💾 Game saved!');
      modal.remove();
    };
    
    document.getElementById('save-as-btn').onclick = () => {
      const name = prompt('Enter save name:', `Save ${Date.now()}`);
      if (name) {
        this.gameState.save(name);
        this.addLogEntry(`💾 Game saved as "${name}"!`);
        modal.remove();
      }
    };
    
    document.getElementById('load-game-btn').onclick = () => {
      modal.remove();
      this.showLoadGameMenu();
    };
    
    document.getElementById('export-save-btn').onclick = () => {
      this.gameState.exportSave();
      this.addLogEntry('📤 Save exported!');
    };
    
    document.getElementById('import-save-btn').onclick = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              this.gameState.importSave(event.target.result);
              this.addLogEntry('📥 Save imported!');
              modal.remove();
            } catch (err) {
              alert('Failed to import save: ' + err.message);
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    };
    
    document.getElementById('main-menu-btn').onclick = () => {
      if (confirm('Return to main menu? Unsaved progress will be lost.')) {
        this.gameState.save('autosave'); // Auto-save before quitting
        modal.remove();
        this.hide();
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) mainMenu.classList.remove('hidden');
      }
    };
  }
  
  showLoadGameMenu() {
    const saves = this.gameState.listSaves();
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'load-game-modal';
    
    let savesHTML = '';
    if (saves.length === 0) {
      savesHTML = '<div class="no-saves">No saved games found.</div>';
    } else {
      savesHTML = '<div class="save-list">';
      saves.forEach(save => {
        const date = new Date(save.saveDate).toLocaleString();
        savesHTML += `
          <div class="save-item" data-slot="${save.slotName}">
            <div class="save-info">
              <h4>${save.slotName}</h4>
              <p>Day ${save.day} • ${save.characterCount} characters</p>
              <p class="save-date">${date}</p>
            </div>
            <div class="save-actions">
              <button class="btn-load-game" data-slot="${save.slotName}">Load</button>
            </div>
          </div>
        `;
      });
      savesHTML += '</div>';
    }
    
    modal.innerHTML = `
      <div class="modal-content load-game-modal">
        <div class="modal-header">
          <h2>📂 Load Game</h2>
          <button class="close-btn" id="close-load-game">✕</button>
        </div>
        <div class="modal-body">
          ${savesHTML}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="cancel-load-game">Cancel</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('close-load-game').onclick = () => modal.remove();
    document.getElementById('cancel-load-game').onclick = () => modal.remove();
    
    modal.querySelectorAll('.btn-load-game').forEach(btn => {
      btn.onclick = (e) => {
        const slot = e.target.dataset.slot;
        const savedData = localStorage.getItem(`hedonism_save_${slot}`);
        
        if (savedData && confirm('Load this save? Current progress will be lost.')) {
          this.gameState.save('autosave'); // Save current before loading
          modal.remove();
          
          try {
            const saveState = JSON.parse(savedData);
            this.gameState.emit('loadGame', saveState);
            this.hide(); // Hide current game view, it will be recreated
          } catch (err) {
            alert('Failed to load save: ' + err.message);
          }
        }
      };
    });
  }

  showTileInfo(event) {
    const hex = this.renderer.screenToHex(event.clientX, event.clientY);
    const tile = this.mapData.tiles.get(`${hex.q},${hex.r}`);
    
    const infoPanel = document.getElementById('tile-info');
    if (!tile || !infoPanel) return;

    const distance = this.renderer.hexGrid.distance(
      this.player.position.q, this.player.position.r,
      tile.q, tile.r
    );

    // Check for strategic location
    let locationInfo = '';
    if (tile.isStrategic && tile.strategicLocation) {
      const loc = tile.strategicLocation;
      locationInfo = `
        <div style="background: rgba(139, 92, 246, 0.2); padding: 8px; border-radius: 4px; margin: 8px 0;">
          <h5 style="margin: 0 0 4px 0; color: #a78bfa;">📍 ${loc.name}</h5>
          <p style="margin: 0; font-size: 12px; font-style: italic;">${loc.description}</p>
        </div>
      `;
    }

    // Check for resource node
    const nodes = this.resourceNodeManager?.getNodesAt(hex.q, hex.r);
    const node = nodes && nodes.length > 0 ? nodes[0] : null;
    let nodeInfo = '';
    if (node) {
      nodeInfo = `<p><strong>Resource:</strong> ${node.type} (${node.state})</p>`;
    }

    infoPanel.innerHTML = `
      <div class="tile-info-content">
        <h4>${this.getTerrainName(tile.terrain)}</h4>
        <p><strong>Location:</strong> (${tile.q}, ${tile.r})</p>
        <p><strong>Distance:</strong> ${distance} tiles</p>
        <p><strong>Elevation:</strong> ${Math.round(tile.elevation * 100)}m</p>
        ${tile.isLand ? `<p><strong>Moisture:</strong> ${Math.round(tile.moisture * 100)}%</p>` : ''}
        ${tile.faction ? `<p><strong>Controlled by:</strong> ${tile.faction}</p>` : ''}
        ${nodeInfo}
        ${locationInfo}
      </div>
    `;
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
    const hasPOIs = nodes.length > 0 || territory?.hasNPC || territory?.hasEvent;
    
    console.log('🔍 Checking for POIs:', { nodes: nodes.length, hasNPC: territory?.hasNPC, hasEvent: territory?.hasEvent, hasPOIs });
    
    if (distance === 1 && hasPOIs) {
      // Adjacent tile with POIs - show interaction modal
      console.log('📍 Adjacent tile with POIs - showing interaction modal');
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
      console.log('❌ Tile not passable');
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

    if (healthValue) healthValue.textContent = `${Math.round(this.player.health)}/100`;
    if (hungerValue) hungerValue.textContent = `${Math.round(this.player.hunger)}/100`;
    if (thirstValue) thirstValue.textContent = `${Math.round(this.player.thirst)}/100`;
    if (energyValue) energyValue.textContent = `${Math.round(this.player.energy)}/100`;
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
    log.appendChild(entry);

    // Auto-scroll to bottom
    log.scrollTop = log.scrollHeight;

    // Limit log entries
    while (log.children.length > 50) {
      log.removeChild(log.firstChild);
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
}
