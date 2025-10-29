/**
 * Tile Interaction UI
 * Modal for interacting with POIs (Points of Interest) on map tiles
 * - Resource Nodes (gathering)
 * - NPCs (dialogue/trading)
 * - Events (special encounters)
 * - Tile actions (rest, build, etc.)
 */

export class TileInteractionUI {
  constructor(player, territoryManager, resourceNodeManager) {
    this.player = player;
    this.territoryManager = territoryManager;
    this.resourceNodeManager = resourceNodeManager;
    this.modal = null;
    this.currentTile = null;
    this.currentPosition = null;
  }

  /**
   * Show interaction modal for a tile
   */
  show(position, territory) {
    this.currentPosition = position;
    this.currentTile = territory;
    
    // Close any existing modal
    this.hide();
    
    // Get all POIs on this tile
    const nodes = this.resourceNodeManager?.getNodesAt(position.q, position.r) || [];
    const hasNPC = territory?.hasNPC;
    const hasEvent = territory?.hasEvent;
    const isPlayerTerritory = territory?.owner === 'player';
    
    // Create modal
    this.modal = document.createElement('div');
    this.modal.className = 'modal-overlay tile-interaction-modal';
    this.modal.id = 'tile-interaction-modal';
    
    // Build content
    const terrainName = this.getTerrainDisplayName(territory?.terrain || 'unknown');
    const locationInfo = this.getLocationInfo(territory);
    
    this.modal.innerHTML = `
      <div class="modal-content tile-interaction-content">
        <div class="modal-header">
          <h2>📍 ${terrainName}</h2>
          <button class="close-btn" id="close-tile-interaction">✕</button>
        </div>
        
        <div class="modal-body">
          ${locationInfo}
          
          <div class="poi-container">
            <h3>Available Interactions</h3>
            <div class="poi-list" id="poi-list">
              ${this.buildPOIList(nodes, hasNPC, hasEvent, isPlayerTerritory, territory)}
            </div>
          </div>
          
          ${this.buildQuickActions(territory)}
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" id="tile-interaction-close">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.modal);
    this.setupEventListeners();
  }

  /**
   * Get terrain display name
   */
  getTerrainDisplayName(terrain) {
    const names = {
      beach: '🏖️ Beach',
      forest: '🌲 Forest',
      rainforest: '🌴 Rainforest',
      jungle: '🌿 Jungle',
      swamp: '🌾 Swamp',
      mangrove: '🦀 Mangrove',
      grassland: '🌾 Grassland',
      rocky: '🪨 Rocky Area',
      mountain: '⛰️ Mountain',
      cliff: '🧗 Cliff',
      shallow_water: '🌊 Shallow Water',
      deep_water: '🌊 Deep Water',
      bamboo_forest: '🎋 Bamboo Forest',
      volcanic: '🌋 Volcanic Area'
    };
    return names[terrain] || `📍 ${terrain}`;
  }

  /**
   * Get location info card
   */
  getLocationInfo(territory) {
    if (!territory) return '<p class="no-data">No territory data</p>';
    
    const elevation = Math.round((territory.elevation || 0) * 100);
    const controlInfo = territory.owner 
      ? `<div class="location-control">
          <span class="control-owner" style="color: ${territory.getFactionColor()}">
            Controlled by ${territory.owner}
          </span>
          <span class="control-strength">${territory.controlStrength}% control</span>
        </div>`
      : '<div class="location-control">Unclaimed Territory</div>';
    
    return `
      <div class="location-info-card">
        <div class="location-stats">
          <span>📏 Elevation: ${elevation}m</span>
          <span>🗺️ Position: (${territory.position.q}, ${territory.position.r})</span>
        </div>
        ${controlInfo}
        ${territory.visited ? '<span class="visited-badge">✓ Visited</span>' : ''}
      </div>
    `;
  }

  /**
   * Build POI list
   */
  buildPOIList(nodes, hasNPC, hasEvent, isPlayerTerritory, territory) {
    let html = '';
    
    // Resource Nodes
    if (nodes && nodes.length > 0) {
      nodes.forEach(node => {
        const canGather = node.canGather(this.player);
        const stateIcon = node.state === 'full' ? '✅' : node.state === 'depleted' ? '❌' : '🔄';
        
        html += `
          <div class="poi-card resource-node-card ${!canGather.success ? 'disabled' : ''}" 
               data-poi-type="resource" 
               data-node-id="${node.id}">
            <div class="poi-icon">${node.sprite}</div>
            <div class="poi-details">
              <h4>${node.type} ${stateIcon}</h4>
              <p class="poi-description">${this.getResourceDescription(node)}</p>
              ${canGather.success 
                ? `<div class="poi-stats">
                    <span>⚡ ${node.energyCost} energy</span>
                    <span>⏱️ ${(node.gatherTime / 1000).toFixed(1)}s</span>
                    ${node.requiredTool ? `<span>🔧 ${node.requiredTool}</span>` : ''}
                  </div>`
                : `<p class="poi-error">❌ ${canGather.reason}</p>`
              }
            </div>
            ${canGather.success 
              ? '<button class="btn btn-primary poi-action-btn">Gather</button>'
              : '<button class="btn btn-disabled" disabled>Cannot Gather</button>'
            }
          </div>
        `;
      });
    }
    
    // NPCs
    if (hasNPC) {
      html += `
        <div class="poi-card npc-card" data-poi-type="npc">
          <div class="poi-icon">👤</div>
          <div class="poi-details">
            <h4>Stranger</h4>
            <p class="poi-description">Someone is here. Perhaps they want to talk?</p>
          </div>
          <button class="btn btn-primary poi-action-btn">Talk</button>
        </div>
      `;
    }
    
    // Events
    if (hasEvent) {
      html += `
        <div class="poi-card event-card" data-poi-type="event">
          <div class="poi-icon">❗</div>
          <div class="poi-details">
            <h4>Something Interesting</h4>
            <p class="poi-description">You notice something unusual here...</p>
          </div>
          <button class="btn btn-primary poi-action-btn">Investigate</button>
        </div>
      `;
    }
    
    // No POIs
    if (!nodes?.length && !hasNPC && !hasEvent) {
      html = `
        <div class="no-pois">
          <p>🔍 Nothing of interest here.</p>
          <p class="hint">Explore more to find resources, people, and events!</p>
        </div>
      `;
    }
    
    return html;
  }

  /**
   * Get resource node description
   */
  getResourceDescription(node) {
    const descriptions = {
      tree: 'A sturdy tree. Can be chopped for wood.',
      rock: 'A large rock formation. Can be mined for stone.',
      berry_bush: 'A bush with ripe berries. Can be harvested.',
      fishing_spot: 'A good spot for fishing.',
      herb_patch: 'Wild herbs grow here.',
      palm_tree: 'A tropical palm tree with coconuts.',
      bamboo: 'Tall bamboo stalks, perfect for crafting.'
    };
    
    const desc = descriptions[node.type] || `A ${node.type} resource.`;
    const uses = node.currentUses > 0 ? ` (${node.currentUses}/${node.maxUses} uses left)` : ' (depleted)';
    
    return desc + uses;
  }

  /**
   * Build quick actions section
   */
  buildQuickActions(territory) {
    const actions = [];
    
    // Rest action (costs no energy, recovers some)
    actions.push({
      id: 'rest',
      icon: '💤',
      label: 'Rest Here',
      description: 'Recover some energy',
      enabled: this.player.energy < this.player.maxEnergy
    });
    
    // Claim territory (if unclaimed)
    if (!territory?.owner) {
      actions.push({
        id: 'claim',
        icon: '🏴',
        label: 'Claim Territory',
        description: 'Establish control over this area',
        enabled: true
      });
    }
    
    // Build (if player territory)
    if (territory?.owner === 'player') {
      actions.push({
        id: 'build',
        icon: '🔨',
        label: 'Build Structure',
        description: 'Construct a shelter or facility',
        enabled: true
      });
    }
    
    if (actions.length === 0) return '';
    
    let html = '<div class="quick-actions"><h3>Quick Actions</h3><div class="quick-actions-grid">';
    
    actions.forEach(action => {
      html += `
        <button class="quick-action-btn ${!action.enabled ? 'disabled' : ''}" 
                data-action="${action.id}"
                ${!action.enabled ? 'disabled' : ''}>
          <span class="action-icon">${action.icon}</span>
          <span class="action-label">${action.label}</span>
          <span class="action-description">${action.description}</span>
        </button>
      `;
    });
    
    html += '</div></div>';
    return html;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Close button
    const closeBtn = this.modal.querySelector('#close-tile-interaction');
    const closeFooterBtn = this.modal.querySelector('#tile-interaction-close');
    
    closeBtn?.addEventListener('click', () => this.hide());
    closeFooterBtn?.addEventListener('click', () => this.hide());
    
    // Close on background click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });
    
    // POI action buttons
    const actionButtons = this.modal.querySelectorAll('.poi-action-btn');
    actionButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.poi-card');
        this.handlePOIAction(card);
      });
    });
    
    // Quick action buttons
    const quickActions = this.modal.querySelectorAll('.quick-action-btn');
    quickActions.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.closest('.quick-action-btn').dataset.action;
        this.handleQuickAction(action);
      });
    });
  }

  /**
   * Handle POI action
   */
  handlePOIAction(card) {
    const type = card.dataset.poiType;
    
    if (type === 'resource') {
      const nodeId = card.dataset.nodeId;
      const node = this.resourceNodeManager.getNodeById(nodeId);
      if (node) {
        this.hide();
        window.game.gatheringUI?.startGathering(node, this.player, (result) => {
          if (result.success) {
            console.log('✅ Gathering complete:', result);
          }
        });
      }
    } else if (type === 'npc') {
      this.hide();
      console.log('🗣️ NPC interaction - to be implemented');
      this.addGameLog('🗣️ NPC dialogue system coming soon!');
    } else if (type === 'event') {
      this.hide();
      console.log('❗ Event interaction - to be implemented');
      this.addGameLog('❗ Random events coming soon!');
    }
  }

  /**
   * Handle quick action
   */
  handleQuickAction(action) {
    if (action === 'rest') {
      const recovery = Math.min(20, this.player.maxEnergy - this.player.energy);
      this.player.restoreEnergy(recovery);
      this.addGameLog(`💤 You rest for a moment and recover ${recovery} energy.`);
      this.hide();
    } else if (action === 'claim') {
      const territory = this.territoryManager.getTerritory(this.currentPosition.q, this.currentPosition.r);
      if (territory) {
        territory.setOwner('player', 50);
        this.addGameLog(`🏴 You've claimed this territory!`);
        this.hide();
      }
    } else if (action === 'build') {
      this.hide();
      this.addGameLog('🔨 Building system coming soon!');
    }
  }

  /**
   * Add log entry to game view
   */
  addGameLog(message) {
    if (window.game?.gameView?.addLogEntry) {
      window.game.gameView.addLogEntry(message);
    }
  }

  /**
   * Hide modal
   */
  hide() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }
}
