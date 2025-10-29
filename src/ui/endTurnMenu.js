/**
 * End Turn Menu
 * Shows energy recovery preview and night effects before ending the turn
 */

export class EndTurnMenu {
  constructor(gameState) {
    this.gameState = gameState;
    this.container = null;
    this.isVisible = false;
    
    this.createUI();
  }

  /**
   * Create the menu UI
   */
  createUI() {
    this.container = document.createElement('div');
    this.container.className = 'end-turn-menu hidden';
    
    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'end-turn-backdrop';
    backdrop.addEventListener('click', () => this.hide());
    this.container.appendChild(backdrop);
    
    // Menu panel
    const panel = document.createElement('div');
    panel.className = 'end-turn-panel';
    
    // Title
    const title = document.createElement('h2');
    title.className = 'end-turn-title';
    title.textContent = 'End Day';
    panel.appendChild(title);
    
    // Current day display
    const currentDay = document.createElement('div');
    currentDay.className = 'end-turn-current-day';
    panel.appendChild(currentDay);
    
    // Summary section
    const summary = document.createElement('div');
    summary.className = 'end-turn-summary';
    panel.appendChild(summary);
    
    // Energy recovery section
    const energySection = document.createElement('div');
    energySection.className = 'end-turn-section';
    
    const energyTitle = document.createElement('h3');
    energyTitle.textContent = '⚡ Energy Recovery';
    energySection.appendChild(energyTitle);
    
    const energyInfo = document.createElement('div');
    energyInfo.className = 'end-turn-energy-info';
    energySection.appendChild(energyInfo);
    
    panel.appendChild(energySection);
    
    // Night effects section
    const nightSection = document.createElement('div');
    nightSection.className = 'end-turn-section';
    
    const nightTitle = document.createElement('h3');
    nightTitle.textContent = '🌙 Night Effects';
    nightSection.appendChild(nightTitle);
    
    const nightInfo = document.createElement('div');
    nightInfo.className = 'end-turn-night-info';
    nightSection.appendChild(nightInfo);
    
    panel.appendChild(nightSection);
    
    // Location bonus section
    const locationSection = document.createElement('div');
    locationSection.className = 'end-turn-section';
    
    const locationTitle = document.createElement('h3');
    locationTitle.textContent = '🏕️ Location';
    locationSection.appendChild(locationTitle);
    
    const locationInfo = document.createElement('div');
    locationInfo.className = 'end-turn-location-info';
    locationSection.appendChild(locationInfo);
    
    panel.appendChild(locationSection);
    
    // Buttons
    const buttons = document.createElement('div');
    buttons.className = 'end-turn-buttons';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => this.hide());
    buttons.appendChild(cancelBtn);
    
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn-primary';
    confirmBtn.textContent = 'End Turn';
    confirmBtn.addEventListener('click', () => this.confirmEndTurn());
    buttons.appendChild(confirmBtn);
    
    panel.appendChild(buttons);
    
    this.container.appendChild(panel);
    document.body.appendChild(this.container);
  }

  /**
   * Show the menu
   */
  show() {
    this.isVisible = true;
    this.container.classList.remove('hidden');
    this.updatePreview();
  }

  /**
   * Hide the menu
   */
  hide() {
    this.isVisible = false;
    this.container.classList.add('hidden');
  }

  /**
   * Update the preview with current data
   */
  updatePreview() {
    const player = this.gameState.player;
    const territory = this.gameState.travelSystem.getCurrentTerritory();
    
    // Current day
    const currentDay = this.container.querySelector('.end-turn-current-day');
    currentDay.textContent = `Day ${player.daysAlive} → Day ${player.daysAlive + 1}`;
    
    // Calculate recovery modifier based on location
    const recoveryModifier = this.calculateRecoveryModifier(territory);
    
    // Energy recovery info
    const energyInfo = this.container.querySelector('.end-turn-energy-info');
    const currentEnergy = player.energy;
    const maxEnergy = player.maxEnergy;
    const recoveryAmount = Math.floor(maxEnergy * recoveryModifier);
    const newEnergy = Math.min(currentEnergy + recoveryAmount, maxEnergy);
    
    energyInfo.innerHTML = `
      <div class="end-turn-stat-row">
        <span class="stat-label">Current Energy:</span>
        <span class="stat-value">${currentEnergy}/${maxEnergy}</span>
      </div>
      <div class="end-turn-stat-row">
        <span class="stat-label">Recovery Rate:</span>
        <span class="stat-value ${recoveryModifier >= 1.0 ? 'positive' : recoveryModifier >= 0.8 ? 'neutral' : 'negative'}">
          ${Math.round(recoveryModifier * 100)}%
        </span>
      </div>
      <div class="end-turn-stat-row">
        <span class="stat-label">Energy Restored:</span>
        <span class="stat-value positive">+${recoveryAmount}</span>
      </div>
      <div class="end-turn-stat-row end-turn-result">
        <span class="stat-label">New Energy:</span>
        <span class="stat-value">${newEnergy}/${maxEnergy}</span>
      </div>
    `;
    
    // Night effects (hunger/thirst loss)
    const nightInfo = this.container.querySelector('.end-turn-night-info');
    const hungerLoss = 15; // Base hunger loss per night
    const thirstLoss = 20; // Base thirst loss per night
    
    nightInfo.innerHTML = `
      <div class="end-turn-stat-row">
        <span class="stat-label">Hunger:</span>
        <span class="stat-value negative">-${hungerLoss}%</span>
      </div>
      <div class="end-turn-stat-row">
        <span class="stat-label">Thirst:</span>
        <span class="stat-value negative">-${thirstLoss}%</span>
      </div>
      <div class="end-turn-hint">
        💡 Make sure to eat and drink before resting!
      </div>
    `;
    
    // Location info
    const locationInfo = this.container.querySelector('.end-turn-location-info');
    const locationName = this.getLocationName(territory);
    const locationDesc = this.getLocationDescription(territory, recoveryModifier);
    
    locationInfo.innerHTML = `
      <div class="end-turn-location-name">${locationName}</div>
      <div class="end-turn-location-desc">${locationDesc}</div>
    `;
  }

  /**
   * Calculate recovery modifier based on location
   * Wilderness: 60% | Camp: 80% | Shelter: 100% | Village: 110%
   */
  calculateRecoveryModifier(territory) {
    if (!territory) return 0.6;
    
    // Check for shelter (POI)
    if (territory.hasStructure) {
      // Check structure type
      if (territory.structureType === 'village' || territory.structureType === 'settlement') {
        return 1.1; // 110% in village
      }
      if (territory.structureType === 'shelter' || territory.structureType === 'cabin') {
        return 1.0; // 100% in shelter
      }
      if (territory.structureType === 'camp') {
        return 0.8; // 80% in camp
      }
    }
    
    // Player-owned territory (has built camp)
    if (territory.owner === 'player') {
      return 0.8; // 80% in claimed territory
    }
    
    // Friendly faction territory
    if (territory.owner && this.gameState.player.reputation[territory.owner] > 50) {
      return 0.7; // 70% in friendly territory
    }
    
    // Wilderness (no shelter)
    return 0.6; // 60% in wilderness
  }

  /**
   * Get location name for display
   */
  getLocationName(territory) {
    if (!territory) return 'Unknown Location';
    
    if (territory.hasStructure) {
      const structureNames = {
        village: '🏘️ Village',
        settlement: '🏘️ Settlement',
        shelter: '🏠 Shelter',
        cabin: '🏚️ Cabin',
        camp: '⛺ Camp'
      };
      return structureNames[territory.structureType] || '🏕️ Camp';
    }
    
    if (territory.owner === 'player') {
      return '⛺ Your Camp';
    }
    
    if (territory.owner) {
      return `🏕️ ${territory.owner} Territory`;
    }
    
    return '🌲 Wilderness';
  }

  /**
   * Get location description
   */
  getLocationDescription(territory, recoveryModifier) {
    if (recoveryModifier >= 1.1) {
      return 'A safe, comfortable place. You will recover all your energy and more.';
    }
    if (recoveryModifier >= 1.0) {
      return 'A well-protected shelter. You will fully recover your energy.';
    }
    if (recoveryModifier >= 0.8) {
      return 'A basic camp with some protection. Good energy recovery.';
    }
    if (recoveryModifier >= 0.7) {
      return 'Friendly territory. Decent rest is possible.';
    }
    if (recoveryModifier >= 0.6) {
      return 'Exposed wilderness. Limited energy recovery.';
    }
    return 'Dangerous area. Poor rest conditions.';
  }

  /**
   * Confirm and end the turn
   */
  confirmEndTurn() {
    const territory = this.gameState.travelSystem.getCurrentTerritory();
    const recoveryModifier = this.calculateRecoveryModifier(territory);
    
    // End the turn
    this.gameState.endTurn(recoveryModifier);
    
    // Hide menu
    this.hide();
    
    // Show notification
    this.showNotification(`Day ${this.gameState.player.daysAlive} begins!`);
  }

  /**
   * Show a notification (simple version for now)
   */
  showNotification(message) {
    console.log(`📢 ${message}`);
    // TODO: Implement proper notification system
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
