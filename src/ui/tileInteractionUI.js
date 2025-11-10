/**
 * Tile Interaction UI
 * Two-part panel for tile information and actions
 * TOP: Info about hovered tile
 * BOTTOM: Info + context-aware actions for tile player is standing on
 */

export class TileInteractionUI {
  constructor(player, territoryManager, resourceNodeManager, npcManager = null) {
    this.player = player;
    this.territoryManager = territoryManager;
    this.resourceNodeManager = resourceNodeManager;
    this.npcManager = npcManager;
    this.panel = null;
    this.hoverTile = null;
    this.currentTile = null;
    this.currentPosition = null;
  }

  initialize(containerSelector = '#tile-info') {
    this.panel = document.querySelector(containerSelector);
    if (!this.panel) {
      console.error('❌ Tile info panel not found:', containerSelector);
      return;
    }
    
    this.renderPanel();
    console.log('✅ TileInteractionUI initialized');
  }

  renderPanel() {
    if (!this.panel) return;
    
    this.panel.innerHTML = `
      <div class="tile-panel-section hover-info">
        <div class="section-header">
          <h4>🖱️ Hover Info</h4>
        </div>
        <div class="section-content" id="hover-info-content">
          <p class="hint">Hover over a tile to see details</p>
        </div>
      </div>
      
      <div class="tile-panel-section current-tile">
        <div class="section-header">
          <h4>📍 Current Location</h4>
        </div>
        <div class="section-content" id="current-tile-content">
          <p class="hint">Move to a tile to see available actions</p>
        </div>
        <div class="tile-actions" id="tile-actions">
        </div>
      </div>
    `;
  }

  updateHoverInfo(position, territory) {
    const content = document.getElementById('hover-info-content');
    if (!content) return;
    
    if (!territory) {
      content.innerHTML = '<p class="hint">Hover over a tile to see details</p>';
      return;
    }
    
    this.hoverTile = territory;
    
    const terrainName = this.getTerrainDisplayName(territory.terrain);
    const elevation = Math.round((territory.elevation || 0) * 100);
    const ownerInfo = territory.owner 
      ? `<span class="owner-tag" style="color: ${this.getFactionColor(territory.owner)}">${territory.owner} (${territory.controlStrength}%)</span>`
      : '<span class="owner-tag neutral">Unclaimed</span>';
    
    const nodes = this.resourceNodeManager?.getNodesAt(position.q, position.r) || [];
    const discoveredNodes = nodes.filter(n => n.discovered); // Only show discovered resources
    const poiIcons = this.getPOIIcons(discoveredNodes, territory, position);
    
    content.innerHTML = `
      <div class="hover-tile-info">
        <div class="tile-header">
          <span class="terrain-name">${terrainName}</span>
          <span class="coordinates">(${position.q}, ${position.r})</span>
        </div>
        <div class="tile-details">
          <span class="elevation">📏 ${elevation}m</span>
          ${ownerInfo}
        </div>
        ${poiIcons ? `<div class="poi-icons">${poiIcons}</div>` : ''}
        ${territory.visited ? '<span class="visited-badge">✓ Visited</span>' : '<span class="unvisited-badge">? Unexplored</span>'}
      </div>
    `;
  }

  clearHoverInfo() {
    const content = document.getElementById('hover-info-content');
    if (content) {
      content.innerHTML = '<p class="hint">Hover over a tile to see details</p>';
    }
    this.hoverTile = null;
  }

  /**
   * Show interaction modal for adjacent tile with POIs
   */
  show(position, territory) {
    // For now, just update hover info to show what's there
    // Could be expanded into a modal later
    this.updateHoverInfo(position, territory);
    
    // Log available interactions
    const nodes = this.resourceNodeManager?.getNodesAt(position.q, position.r) || [];
    const npcs = this.npcManager?.getNPCsAtTile(position) || [];
    
    let message = `🔍 Adjacent tile (${position.q}, ${position.r}): `;
    if (nodes.length > 0) message += `${nodes.length} resource(s) `;
    if (npcs.length > 0) message += `${npcs.length} NPC(s) `;
    if (territory?.hasEvent) message += `event available `;
    message += '— Move there to interact.';
    
    this.addGameLog(message);
  }

  updateCurrentTile(position, territory) {
    this.currentPosition = position;
    this.currentTile = territory;
    
    const content = document.getElementById('current-tile-content');
    const actionsDiv = document.getElementById('tile-actions');
    
    if (!content || !actionsDiv) return;
    
    if (!territory) {
      content.innerHTML = '<p class="hint">Move to a tile to see available actions</p>';
      actionsDiv.innerHTML = '';
      return;
    }
    
    const terrainName = this.getTerrainDisplayName(territory.terrain);
    const elevation = Math.round((territory.elevation || 0) * 100);
    const ownerInfo = territory.owner 
      ? `<span class="owner-tag" style="color: ${this.getFactionColor(territory.owner)}">${territory.owner} (${territory.controlStrength}%)</span>`
      : '<span class="owner-tag neutral">Unclaimed</span>';
    
    const nodes = this.resourceNodeManager?.getNodesAt(position.q, position.r) || [];
    const discoveredNodes = nodes.filter(n => n.discovered); // Only show discovered resources
    const npcs = this.getNPCsAt(territory);
    const hasSettlement = territory.hasSettlement;
    
    content.innerHTML = `
      <div class="current-tile-info">
        <div class="tile-header">
          <span class="terrain-name">${terrainName}</span>
          <span class="coordinates">(${position.q}, ${position.r})</span>
        </div>
        <div class="tile-details">
          <span class="elevation">📏 ${elevation}m</span>
          ${ownerInfo}
        </div>
        ${this.getPOISummary(discoveredNodes, npcs, hasSettlement)}
      </div>
    `;
    
    this.renderActionButtons(territory, discoveredNodes, npcs);
  }

  renderActionButtons(territory, nodes, npcs) {
    const actionsDiv = document.getElementById('tile-actions');
    if (!actionsDiv) return;
    
    const actions = [];
    
    if (nodes && nodes.length > 0) {
      const gatherableNodes = nodes.filter(n => n.canGather(this.player).success);
      if (gatherableNodes.length > 0) {
        actions.push({
          id: 'gather',
          icon: '⛏️',
          label: 'Gather',
          type: 'primary',
          submenu: this.buildGatherSubmenu(gatherableNodes)
        });
      }
    }
    
    if (npcs && npcs.length > 0) {
      actions.push({
        id: 'talk',
        icon: '💬',
        label: 'Talk',
        type: 'social',
        submenu: npcs.length > 1 ? this.buildNPCSubmenu(npcs) : null,
        data: npcs.length === 1 ? { npcId: npcs[0].identity.id } : null
      });
    }
    
    if (territory?.hasSettlement) {
      actions.push({
        id: 'settlement',
        icon: '🏘️',
        label: 'Enter Settlement',
        type: 'primary'
      });
    }
    
    if (territory?.owner === 'player') {
      actions.push({
        id: 'build',
        icon: '🔨',
        label: 'Build',
        type: 'construction'
      });
    }
    
    if (!territory?.fullyExplored) {
      const explorationProgress = territory?.explorationProgress || 0;
      actions.push({
        id: 'explore',
        icon: '🔍',
        label: explorationProgress > 0 ? `Explore (${explorationProgress}%)` : 'Explore',
        type: 'discovery'
      });
    }
    
    if (territory?.fullyExplored && (!territory?.owner || territory?.owner !== 'player' || territory?.controlStrength < 100)) {
      const claimProgress = territory?.claimProgress || 0;
      const isContested = territory?.owner && territory?.owner !== 'player';
      
      actions.push({
        id: 'claim',
        icon: '🏴',
        label: claimProgress > 0 
          ? `Claim Territory (${claimProgress}%)` 
          : isContested 
            ? 'Claim (Hostile!)'
            : 'Claim Territory',
        type: isContested ? 'combat' : 'strategic',
        contested: isContested
      });
    }
    
    if (this.player.energy < this.player.maxEnergy) {
      actions.push({
        id: 'rest',
        icon: '💤',
        label: 'Rest',
        type: 'recovery'
      });
    }
    
    const adjacentHostiles = this.getAdjacentHostiles();
    if (adjacentHostiles.length > 0) {
      actions.push({
        id: 'attack',
        icon: '⚔️',
        label: 'Attack',
        type: 'combat',
        submenu: adjacentHostiles.length > 1 ? this.buildAttackSubmenu(adjacentHostiles) : null,
        data: adjacentHostiles.length === 1 ? adjacentHostiles[0] : null
      });
    }
    
    if (actions.length === 0) {
      actionsDiv.innerHTML = '<p class="no-actions">No actions available at this location</p>';
      return;
    }
    
    actionsDiv.innerHTML = `
      <div class="actions-grid">
        ${actions.map(action => this.renderActionButton(action)).join('')}
      </div>
    `;
    
    this.attachActionListeners();
  }

  renderActionButton(action) {
    const hasSubmenu = action.submenu && action.submenu.length > 0;
    
    return `
      <button class="tile-action-btn ${action.type}" 
              data-action="${action.id}"
              ${action.data ? `data-action-data='${JSON.stringify(action.data)}'` : ''}>
        <span class="action-icon">${action.icon}</span>
        <span class="action-label">${action.label}</span>
        ${hasSubmenu ? '<span class="submenu-indicator">▼</span>' : ''}
      </button>
      ${hasSubmenu ? `
        <div class="action-submenu hidden" data-submenu="${action.id}">
          ${action.submenu.map(item => `
            <button class="submenu-item" 
                    data-parent-action="${action.id}"
                    data-item-id="${item.id}"
                    ${item.data ? `data-item-data='${JSON.stringify(item.data)}'` : ''}>
              <span class="item-icon">${item.icon}</span>
              <span class="item-label">${item.label}</span>
              ${item.detail ? `<span class="item-detail">${item.detail}</span>` : ''}
            </button>
          `).join('')}
        </div>
      ` : ''}
    `;
  }

  buildGatherSubmenu(nodes) {
    return nodes.map(node => ({
      id: node.id,
      icon: node.sprite || '📦',
      label: node.type,
      detail: `${node.currentUses}/${node.maxUses} uses`,
      data: { nodeId: node.id, type: node.type }
    }));
  }

  buildNPCSubmenu(npcs) {
    return npcs.map((npc, index) => ({
      id: `npc-${npc.identity.id}`,
      icon: '👤',
      label: npc.identity.name || 'Stranger',
      detail: `${npc.identity.title} (${npc.identity.faction})`,
      data: { npcId: npc.identity.id }
    }));
  }

  buildAttackSubmenu(hostiles) {
    return hostiles.map((hostile, index) => ({
      id: `hostile-${index}`,
      icon: '⚔️',
      label: hostile.name || 'Enemy',
      detail: `${hostile.position.q}, ${hostile.position.r}`,
      data: hostile
    }));
  }

  attachActionListeners() {
    const buttons = document.querySelectorAll('.tile-action-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        const actionData = btn.dataset.actionData ? JSON.parse(btn.dataset.actionData) : null;
        
        const submenu = document.querySelector(`[data-submenu="${action}"]`);
        if (submenu) {
          submenu.classList.toggle('hidden');
        } else {
          this.executeAction(action, actionData);
        }
      });
    });
    
    const submenuItems = document.querySelectorAll('.submenu-item');
    submenuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const parentAction = item.dataset.parentAction;
        const itemData = item.dataset.itemData ? JSON.parse(item.dataset.itemData) : null;
        
        this.executeAction(parentAction, itemData);
        
        const submenu = item.closest('.action-submenu');
        if (submenu) submenu.classList.add('hidden');
      });
    });
  }

  executeAction(action, data) {
    // Optional: console.log('🎬 Executing action:', action, data);
    
    switch (action) {
      case 'gather':
        this.handleGather(data);
        break;
      case 'talk':
        this.handleTalk(data);
        break;
      case 'settlement':
        this.handleSettlement();
        break;
      case 'build':
        this.handleBuild();
        break;
      case 'explore':
        this.handleExplore();
        break;
      case 'claim':
        this.handleClaim();
        break;
      case 'rest':
        this.handleRest();
        break;
      case 'attack':
        this.handleAttack(data);
        break;
      default:
        console.warn('Unknown action:', action);
    }
  }

  handleGather(data) {
    if (!data || !data.nodeId) return;
    
    const node = this.resourceNodeManager.getNode(data.nodeId);
    if (node) {
      window.game.gatheringUI?.startGathering(node, this.player, (result) => {
        if (result.success) {
          this.addGameLog(`✅ Gathered ${result.items.map(i => i.name).join(', ')}`);
          this.updateCurrentTile(this.currentPosition, this.currentTile);
        }
      });
    }
  }

  handleTalk(data) {
    if (!data || !data.npcId) {
      console.warn('No NPC data provided for talk action');
      return;
    }
    
    // Open dialogue UI with NPC
    const dialogueUI = window.game?.uiManagers?.dialogueUI;
    if (dialogueUI) {
      dialogueUI.open(data.npcId);
    } else {
      console.warn('DialogueUI not available');
      this.addGameLog('� Dialogue system not initialized');
    }
  }

  handleSettlement() {
    this.addGameLog('🏘️ Settlement view coming soon!');
    console.log('🏘️ Enter settlement');
  }

  handleBuild() {
    this.addGameLog('🔨 Building system coming soon!');
    console.log('🔨 Open build menu');
  }

  handleExplore() {
    const territory = this.territoryManager.getTerritory(this.currentPosition.q, this.currentPosition.r);
    if (!territory) return;
    
    const result = territory.explore(this.player);
    
    if (result.alreadyComplete) {
      this.addGameLog('✅ This area has already been fully explored.');
    } else if (result.success) {
      this.addGameLog(`🔍 ${result.message} (+${result.xpGained} XP)`);
      
      // Show discoveries
      if (result.discoveries && result.discoveries.length > 0) {
        result.discoveries.forEach(discovery => {
          switch (discovery.type) {
            case 'resource':
              this.addGameLog(`✨ Discovered: ${discovery.name} (${discovery.resourceType})!`);
              break;
            case 'npc':
              this.addGameLog(`👤 Discovered: ${discovery.name}!`);
              break;
            case 'event':
              this.addGameLog(`❗ Discovered: ${discovery.name}!`);
              break;
            case 'settlement':
              this.addGameLog(`🏘️ Discovered: ${discovery.name}!`);
              break;
          }
        });
      }
      
      if (result.complete) {
        this.addGameLog('🎉 Exploration complete! You can now claim this territory.');
      }
    } else {
      this.addGameLog(`🔍 ${result.message} (+${result.xpGained} XP)`);
    }
    
    // Refresh UI to show updated progress and newly discovered resources
    this.updateCurrentTile(this.currentPosition, territory);
    
    // Trigger map re-render to show discovered resources
    if (window.game?.gameView) {
      window.game.gameView.renderPlayerMarker();
    }
  }

  handleClaim() {
    const territory = this.territoryManager.getTerritory(this.currentPosition.q, this.currentPosition.r);
    if (!territory) return;
    
    // Need gameState for time advancement
    const gameState = window.game?.gameState;
    if (!gameState) {
      this.addGameLog('❌ Game state not available');
      return;
    }
    
    const result = territory.attemptClaim(this.player, gameState);
    
    if (result.requiresExploration) {
      this.addGameLog('❌ You must fully explore this area before claiming it.');
    } else if (result.alreadyOwned) {
      this.addGameLog('✅ You already control this territory.');
    } else if (result.success) {
      this.addGameLog(`🏴 ${result.message} (+${result.xpGained} XP) [⏱️ +${result.timeAdvanced} min]`);
      
      if (result.complete) {
        this.addGameLog('🎉 Territory claimed! You now control this area.');
        // Update perimeters when territory is claimed
        this.territoryManager.updatePerimeters();
      } else if (result.contested) {
        this.addGameLog(`⚠️ Warning: The ${territory.owner} have been alerted to your claim attempt!`);
      }
    } else {
      this.addGameLog(`🏴 ${result.message} (+${result.xpGained} XP) [⏱️ +${result.timeAdvanced} min]`);
    }
    
    // Refresh UI to show updated progress
    this.updateCurrentTile(this.currentPosition, territory);
  }

  handleRest() {
    const recovery = Math.min(20, this.player.maxEnergy - this.player.energy);
    this.player.restoreEnergy(recovery);
    this.addGameLog(`💤 Rested and recovered ${recovery} energy`);
    this.updateCurrentTile(this.currentPosition, this.currentTile);
  }

  handleAttack(data) {
    this.addGameLog('⚔️ Combat system coming soon!');
    console.log('⚔️ Attack:', data);
  }

  getPOIIcons(nodes, territory, position = null) {
    const icons = [];
    
    if (nodes && nodes.length > 0) {
      const nodeTypes = [...new Set(nodes.map(n => n.sprite || '📦'))];
      icons.push(...nodeTypes.slice(0, 3));
    }
    
    // Check for actual NPCs via NPCManager instead of old hasNPC flag
    if (this.npcManager) {
      const checkPos = position || this.currentPosition;
      if (checkPos) {
        const npcs = this.npcManager.getNPCsAtTile(checkPos);
        if (npcs.length > 0) icons.push('👤');
      }
    }
    
    if (territory?.hasEvent) icons.push('❗');
    if (territory?.hasSettlement) icons.push('🏘️');
    
    return icons.length > 0 ? icons.join(' ') : null;
  }

  getPOISummary(nodes, npcs, hasSettlement) {
    const items = [];
    
    if (nodes && nodes.length > 0) {
      items.push(`${nodes.length} resource${nodes.length > 1 ? 's' : ''}`);
    }
    if (npcs && npcs.length > 0) {
      items.push(`${npcs.length} NPC${npcs.length > 1 ? 's' : ''}`);
    }
    if (hasSettlement) {
      items.push('Settlement');
    }
    
    if (items.length === 0) return '';
    
    return `<div class="poi-summary">📍 ${items.join(' • ')}</div>`;
  }

  getNPCsAt(territory) {
    if (!this.npcManager || !this.currentPosition) {
      return [];
    }
    
    return this.npcManager.getNPCsAtTile(this.currentPosition);
  }

  getAdjacentHostiles() {
    return [];
  }

  getFactionColor(faction) {
    const colors = {
      player: '#00ffff',
      castaway: '#ffaa44',
      native: '#44ff44',
      mercenary: '#ff4444',
      neutral: '#888888'
    };
    return colors[faction] || '#ffffff';
  }

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
      volcanic: '🌋 Volcanic Area',
      water: '🌊 Water',
      lowland: '🌾 Lowland',
      highland: '⛰️ Highland'
    };
    return names[terrain] || `📍 ${terrain}`;
  }

  addGameLog(message) {
    if (window.game?.gameView?.addLogEntry) {
      window.game.gameView.addLogEntry(message);
    }
  }
}
