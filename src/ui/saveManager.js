/**
 * Save Manager UI Component
 * Comprehensive save/load interface with inline editing, sorting, filtering
 * No dialog popups - all interactions happen in the UI
 */

export class SaveManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.view = {
      tab: 'manual', // 'manual' or 'auto'
      sortKey: 'savedAt',
      sortDir: 'desc', // 'asc' or 'desc'
      query: '',
      selectedId: null
    };
    
    this.modal = null;
    this.editingNameId = null;
  }

  /**
   * Show save manager modal
   */
  show() {
    if (this.modal) return; // Already showing

    this.modal = document.createElement('div');
    this.modal.className = 'save-manager-modal';
    this.modal.innerHTML = this.buildHTML();
    document.body.appendChild(this.modal);

    this.attachEventListeners();
    this.updateButtonStates();
    this.render();
  }

  /**
   * Check if there's an active game (not on main menu)
   */
  hasActiveGame() {
    const mainMenu = document.getElementById('main-menu');
    const isOnMainMenu = mainMenu && !mainMenu.classList.contains('hidden');
    
    // If we're on main menu, no active game
    if (isOnMainMenu) return false;
    
    // Check if we have player data (character created)
    const hasPlayer = this.gameState.state.player && this.gameState.state.player.name;
    
    return hasPlayer;
  }

  /**
   * Update button states based on game state
   */
  updateButtonStates() {
    if (!this.modal) return;
    
    const hasGame = this.hasActiveGame();
    
    // Disable save buttons if no active game
    const quickSaveBtn = this.modal.querySelector('#sm-quick-save');
    const exportBtn = this.modal.querySelector('#sm-export');
    
    if (quickSaveBtn) {
      quickSaveBtn.disabled = !hasGame;
      if (!hasGame) {
        quickSaveBtn.title = 'Start a game first to save';
      }
    }
    
    if (exportBtn) {
      // Export can work if there are any saves, regardless of active game
      const { manual, auto } = this.getSaves();
      const hasSaves = manual.length > 0 || auto.length > 0;
      exportBtn.disabled = !hasSaves;
      if (!hasSaves) {
        exportBtn.title = 'No saves to export';
      }
    }
  }

  /**
   * Hide and cleanup
   */
  hide() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }

  /**
   * Build main HTML structure
   */
  buildHTML() {
    return `
      <div class="save-manager-container">
        <!-- Header -->
        <div class="save-manager-header">
          <div class="save-manager-title">
            <div class="save-manager-logo">💾</div>
            <div>
              <h2>Save Manager</h2>
              <div class="save-manager-subtitle">Continue • Save/Load • Import/Export</div>
            </div>
          </div>
          <button class="save-manager-close" id="sm-close">✕</button>
        </div>

        <!-- Actions -->
        <div class="save-manager-actions">
          <button class="sm-btn accent" id="sm-continue">▶ Continue</button>
          <button class="sm-btn success" id="sm-quick-save">⏺ Quick Save</button>
          <button class="sm-btn primary" id="sm-quick-load">⏮ Quick Load</button>
          <button class="sm-btn" id="sm-export">⬇ Export</button>
          <button class="sm-btn" id="sm-import">⬆ Import</button>
          <input type="file" id="sm-import-file" accept=".json" style="display: none;">
        </div>

        <!-- Toolbar -->
        <div class="save-manager-toolbar">
          <div class="save-tab-group">
            <button class="save-tab active" id="sm-tab-manual">Manual Saves</button>
            <button class="save-tab" id="sm-tab-auto">Autosaves</button>
          </div>
          <div class="save-search-box">
            <span class="save-search-icon">🔍</span>
            <input type="text" id="sm-search" placeholder="Search by name, location, character..." />
          </div>
        </div>

        <!-- Save List -->
        <div class="save-list-container">
          <table class="save-table">
            <thead>
              <tr>
                <th class="sortable" data-sort="name">Name <span class="sort-arrow">▾</span></th>
                <th class="sortable" data-sort="day">Day/Time</th>
                <th class="sortable" data-sort="savedAt">Saved At</th>
                <th>Character</th>
                <th>Location</th>
                <th class="sortable" data-sort="playTime">Playtime</th>
                <th style="width: 200px;">Actions</th>
              </tr>
            </thead>
            <tbody id="sm-tbody">
              <!-- Rows generated dynamically -->
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div class="save-manager-footer">
          <div class="save-footer-hint">
            <span>Tip:</span>
            <span><span class="kbd">F5</span> Quick Save</span>
            <span><span class="kbd">F9</span> Quick Load</span>
            <span><span class="kbd">Esc</span> Close</span>
          </div>
          <div class="save-count" id="sm-count"></div>
        </div>
      </div>
    `;
  }

  /**
   * Attach all event listeners
   */
  attachEventListeners() {
    // Close button
    const closeBtn = this.modal.querySelector('#sm-close');
    closeBtn?.addEventListener('click', () => this.hide());

    // Click outside to close
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.hide();
    });

    // Tab switching
    const manualTab = this.modal.querySelector('#sm-tab-manual');
    const autoTab = this.modal.querySelector('#sm-tab-auto');
    manualTab?.addEventListener('click', () => this.switchTab('manual'));
    autoTab?.addEventListener('click', () => this.switchTab('auto'));

    // Search
    const searchInput = this.modal.querySelector('#sm-search');
    searchInput?.addEventListener('input', (e) => {
      this.view.query = e.target.value.toLowerCase();
      this.render();
    });

    // Sorting
    this.modal.querySelectorAll('th.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.dataset.sort;
        if (this.view.sortKey === key) {
          this.view.sortDir = this.view.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          this.view.sortKey = key;
          this.view.sortDir = 'desc';
        }
        this.render();
      });
    });

    // Top action buttons
    const continueBtn = this.modal.querySelector('#sm-continue');
    const quickSaveBtn = this.modal.querySelector('#sm-quick-save');
    const quickLoadBtn = this.modal.querySelector('#sm-quick-load');
    const exportBtn = this.modal.querySelector('#sm-export');
    const importBtn = this.modal.querySelector('#sm-import');
    const importFile = this.modal.querySelector('#sm-import-file');

    continueBtn?.addEventListener('click', () => this.handleContinue());
    quickSaveBtn?.addEventListener('click', () => this.handleQuickSave());
    quickLoadBtn?.addEventListener('click', () => this.handleQuickLoad());
    exportBtn?.addEventListener('click', () => this.handleExport());
    importBtn?.addEventListener('click', () => importFile?.click());
    importFile?.addEventListener('change', (e) => this.handleImport(e));

    // Keyboard shortcuts
    this.keyHandler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.hide();
      }
      if (e.key === 'F5') {
        e.preventDefault();
        this.handleQuickSave();
      }
      if (e.key === 'F9') {
        e.preventDefault();
        this.handleQuickLoad();
      }
    };
    document.addEventListener('keydown', this.keyHandler);
  }

  /**
   * Switch between manual/auto tabs
   */
  switchTab(tab) {
    this.view.tab = tab;
    const manualTab = this.modal.querySelector('#sm-tab-manual');
    const autoTab = this.modal.querySelector('#sm-tab-auto');
    
    if (tab === 'manual') {
      manualTab?.classList.add('active');
      autoTab?.classList.remove('active');
    } else {
      autoTab?.classList.add('active');
      manualTab?.classList.remove('active');
    }
    
    this.render();
  }

  /**
   * Get all saves from GameState
   */
  getSaves() {
    const saves = this.gameState.listSaves();
    
    // Separate manual and auto saves
    const manual = saves.filter(s => s.slotName !== 'autosave' && !s.slotName.startsWith('auto_'));
    const auto = saves.filter(s => s.slotName === 'autosave' || s.slotName.startsWith('auto_'));
    
    return { manual, auto, all: saves };
  }

  /**
   * Format time duration
   */
  formatDuration(seconds) {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  /**
   * Format date
   */
  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString();
  }

  /**
   * Get save type tag
   */
  getSaveTag(slotName) {
    if (slotName === 'autosave') return '<span class="save-tag auto">autosave</span>';
    if (slotName.startsWith('auto_')) return '<span class="save-tag auto">auto</span>';
    if (slotName.startsWith('quick_')) return '<span class="save-tag quick">quick</span>';
    return '<span class="save-tag">manual</span>';
  }

  /**
   * Build table row HTML
   */
  buildRowHTML(save) {
    const isSelected = this.view.selectedId === save.slotName;
    const selectedClass = isSelected ? 'selected' : '';
    
    return `
      <tr class="${selectedClass}" data-slot="${save.slotName}">
        <td>
          <div class="save-name-cell">
            <input 
              type="text" 
              class="save-name-input" 
              value="${save.slotName}" 
              data-slot="${save.slotName}"
              data-original="${save.slotName}"
            />
            ${this.getSaveTag(save.slotName)}
          </div>
        </td>
        <td class="meta">Day ${save.day || 1}</td>
        <td class="meta">${this.formatDate(save.saveDate)}</td>
        <td>${this.gameState.state.player?.name || 'Unknown'}</td>
        <td>${this.gameState.state.player?.position ? 'Exploring' : 'Unknown'}</td>
        <td class="meta">${this.formatDuration(save.playTime)}</td>
        <td>
          <div class="save-row-actions">
            <button class="save-action-btn load" data-action="load" data-slot="${save.slotName}">Load</button>
            <button class="save-action-btn export" data-action="export" data-slot="${save.slotName}">Export</button>
            <button class="save-action-btn delete" data-action="delete" data-slot="${save.slotName}">✕</button>
          </div>
        </td>
      </tr>
    `;
  }

  /**
   * Build create new save row
   */
  buildCreateRow() {
    return `
      <tr class="create-row" id="sm-create-row">
        <td colspan="7">
          <span class="create-save-link">
            <span>+</span>
            <span>Create New Save</span>
          </span>
        </td>
      </tr>
    `;
  }

  /**
   * Build empty state
   */
  buildEmptyState() {
    return `
      <tr>
        <td colspan="7">
          <div class="save-list-empty">
            <div class="save-list-empty-icon">💾</div>
            <div class="save-list-empty-text">No saves found</div>
            <div class="save-list-empty-hint">Click "Quick Save" or "Create New Save" to get started</div>
          </div>
        </td>
      </tr>
    `;
  }

  /**
   * Render save list
   */
  render() {
    const tbody = this.modal.querySelector('#sm-tbody');
    if (!tbody) return;

    const { manual, auto } = this.getSaves();
    const list = this.view.tab === 'manual' ? manual : auto;

    // Filter
    let filtered = [...list];
    if (this.view.query) {
      filtered = filtered.filter(s => {
        const searchStr = `${s.slotName} ${this.gameState.state.player?.name || ''}`.toLowerCase();
        return searchStr.includes(this.view.query);
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (this.view.sortKey) {
        case 'name':
          aVal = a.slotName.toLowerCase();
          bVal = b.slotName.toLowerCase();
          break;
        case 'day':
          aVal = a.day || 0;
          bVal = b.day || 0;
          break;
        case 'savedAt':
          aVal = new Date(a.saveDate).getTime();
          bVal = new Date(b.saveDate).getTime();
          break;
        case 'playTime':
          aVal = a.playTime || 0;
          bVal = b.playTime || 0;
          break;
        default:
          aVal = new Date(a.saveDate).getTime();
          bVal = new Date(b.saveDate).getTime();
      }

      const dir = this.view.sortDir === 'asc' ? 1 : -1;
      return aVal > bVal ? dir : aVal < bVal ? -dir : 0;
    });

    // Build HTML
    let html = '';
    
    // Add create row for manual saves (only if there's an active game)
    if (this.view.tab === 'manual' && this.hasActiveGame()) {
      html += this.buildCreateRow();
    }

    // Add rows or empty state
    if (filtered.length === 0 && this.view.tab !== 'manual') {
      html += this.buildEmptyState();
    } else {
      html += filtered.map(s => this.buildRowHTML(s)).join('');
    }

    tbody.innerHTML = html;

    // Update count
    const countEl = this.modal.querySelector('#sm-count');
    if (countEl) {
      countEl.textContent = `${manual.length} manual • ${auto.length} autosaves • showing ${filtered.length}`;
    }

    // Update sort indicators
    this.modal.querySelectorAll('th.sortable').forEach(th => {
      const arrow = th.querySelector('.sort-arrow');
      if (th.dataset.sort === this.view.sortKey) {
        th.classList.add('sorted');
        if (arrow) arrow.textContent = this.view.sortDir === 'asc' ? '▴' : '▾';
      } else {
        th.classList.remove('sorted');
        if (arrow) arrow.textContent = '▾';
      }
    });

    // Attach row event listeners
    this.attachRowListeners();
  }

  /**
   * Attach event listeners to dynamically created rows
   */
  attachRowListeners() {
    // Create new save
    const createRow = this.modal.querySelector('#sm-create-row');
    createRow?.addEventListener('click', () => this.handleCreateSave());

    // Row selection
    this.modal.querySelectorAll('tr[data-slot]').forEach(row => {
      row.addEventListener('click', (e) => {
        // Don't select if clicking button or input
        if (e.target.closest('button') || e.target.closest('input')) return;
        
        this.view.selectedId = row.dataset.slot;
        this.render();
      });
    });

    // Name inputs
    this.modal.querySelectorAll('.save-name-input').forEach(input => {
      input.addEventListener('blur', (e) => this.handleRename(e));
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.target.blur();
        }
      });
    });

    // Action buttons
    this.modal.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const slot = btn.dataset.slot;
        
        switch (action) {
          case 'load':
            this.handleLoad(slot);
            break;
          case 'export':
            this.handleExportSingle(slot);
            break;
          case 'delete':
            this.handleDelete(slot);
            break;
        }
      });
    });
  }

  /**
   * Handle continue (load most recent save)
   */
  handleContinue() {
    const { manual, auto } = this.getSaves();
    const allSaves = [...manual, ...auto];
    
    if (allSaves.length === 0) {
      this.showNotification('No saves available', 'error');
      return;
    }

    // Get most recent save
    const latest = allSaves.sort((a, b) => 
      new Date(b.saveDate).getTime() - new Date(a.saveDate).getTime()
    )[0];

    this.handleLoad(latest.slotName);
  }

  /**
   * Handle quick save
   */
  handleQuickSave() {
    if (!this.hasActiveGame()) {
      this.showNotification('Start a game first to save', 'error');
      return;
    }
    
    const timestamp = Date.now();
    const slotName = `quick_${timestamp}`;
    
    const success = this.gameState.save(slotName);
    
    if (success) {
      this.showNotification('Quick saved!', 'success');
      this.render();
    } else {
      this.showNotification('Failed to save', 'error');
    }
  }

  /**
   * Handle quick load (load most recent quick save)
   */
  handleQuickLoad() {
    const saves = this.gameState.listSaves();
    const quickSaves = saves.filter(s => s.slotName.startsWith('quick_'));
    
    if (quickSaves.length === 0) {
      this.showNotification('No quick saves found', 'error');
      return;
    }

    // Get most recent quick save
    const latest = quickSaves.sort((a, b) => 
      new Date(b.saveDate).getTime() - new Date(a.saveDate).getTime()
    )[0];

    this.handleLoad(latest.slotName);
  }

  /**
   * Handle create new save
   */
  handleCreateSave() {
    if (!this.hasActiveGame()) {
      this.showNotification('Start a game first to save', 'error');
      return;
    }
    
    const timestamp = Date.now();
    const slotName = `save_${timestamp}`;
    
    const success = this.gameState.save(slotName);
    
    if (success) {
      this.showNotification('Save created!', 'success');
      this.view.selectedId = slotName;
      this.render();
    } else {
      this.showNotification('Failed to create save', 'error');
    }
  }

  /**
   * Handle rename save
   */
  handleRename(event) {
    const input = event.target;
    const oldSlot = input.dataset.original;
    const newName = input.value.trim();
    
    if (!newName || newName === oldSlot) {
      input.value = oldSlot; // Reset
      return;
    }

    // Check if name already exists
    const saves = this.gameState.listSaves();
    if (saves.some(s => s.slotName === newName)) {
      this.showNotification('Save name already exists', 'error');
      input.value = oldSlot;
      return;
    }

    // Load old save and save with new name
    const success = this.gameState.load(oldSlot);
    if (success) {
      this.gameState.save(newName);
      this.gameState.deleteSave(oldSlot);
      
      if (this.view.selectedId === oldSlot) {
        this.view.selectedId = newName;
      }
      
      this.showNotification('Save renamed', 'success');
      this.render();
    } else {
      input.value = oldSlot;
      this.showNotification('Failed to rename', 'error');
    }
  }

  /**
   * Handle load save
   */
  handleLoad(slotName) {
    const success = this.gameState.load(slotName);
    
    if (success) {
      this.showNotification('Loading game...', 'success');
      
      // Hide save manager
      this.hide();
      
      // Hide all screens
      const storyIntro = document.getElementById('story-intro');
      const characterCreation = document.getElementById('character-creation');
      const mainMenu = document.getElementById('main-menu');
      
      if (storyIntro) storyIntro.classList.add('hidden');
      if (characterCreation) characterCreation.classList.add('hidden');
      if (mainMenu) mainMenu.classList.add('hidden');
      
      // Emit loadGame event
      this.gameState.emit('loadGame', this.gameState.state);
    } else {
      this.showNotification('Failed to load save', 'error');
    }
  }

  /**
   * Handle delete save
   */
  handleDelete(slotName) {
    this.gameState.deleteSave(slotName);
    
    if (this.view.selectedId === slotName) {
      this.view.selectedId = null;
    }
    
    this.showNotification('Save deleted', 'success');
    this.render();
  }

  /**
   * Handle export selected or most recent
   */
  handleExport() {
    const { manual, auto } = this.getSaves();
    const allSaves = [...manual, ...auto];
    
    let saveToExport;
    
    if (this.view.selectedId) {
      saveToExport = allSaves.find(s => s.slotName === this.view.selectedId);
    } else {
      // Export most recent
      saveToExport = allSaves.sort((a, b) => 
        new Date(b.saveDate).getTime() - new Date(a.saveDate).getTime()
      )[0];
    }
    
    if (!saveToExport) {
      this.showNotification('No save to export', 'error');
      return;
    }

    this.handleExportSingle(saveToExport.slotName);
  }

  /**
   * Handle export single save
   */
  handleExportSingle(slotName) {
    // Load the save to get full data
    const savedData = localStorage.getItem(`hedonism_save_${slotName}`);
    if (!savedData) {
      this.showNotification('Save not found', 'error');
      return;
    }

    const blob = new Blob([savedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hedonism_island_${slotName}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showNotification('Save exported', 'success');
  }

  /**
   * Handle import save
   */
  handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const success = this.gameState.importSave(content);
        
        if (success) {
          this.showNotification('Save imported successfully', 'success');
          this.render();
        } else {
          this.showNotification('Failed to import save', 'error');
        }
      } catch (err) {
        console.error('Import error:', err);
        this.showNotification('Invalid save file', 'error');
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  }

  /**
   * Show notification (simple toast)
   */
  showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#10b37f' : type === 'error' ? '#ff5d7a' : '#0bbbd1'};
      color: ${type === 'error' ? '#fff' : '#000'};
      border-radius: 8px;
      font-weight: 600;
      z-index: 100000;
      animation: slideIn 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  /**
   * Cleanup when destroyed
   */
  destroy() {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
    }
    this.hide();
  }
}
