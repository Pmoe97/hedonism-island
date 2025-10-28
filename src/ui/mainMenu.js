/**
 * Main Menu UI Component
 * Handles menu interactions, new game, load, settings, etc.
 */

export class MainMenu {
  constructor(gameState, settingsManager, settingsMenu, characterCreation) {
    this.gameState = gameState;
    this.settings = settingsManager;
    this.settingsMenu = settingsMenu;
    this.characterCreation = characterCreation;
    
    console.log('🎯 MainMenu initialized with:', {
      gameState: !!gameState,
      settingsManager: !!settingsManager,
      settingsMenu: !!settingsMenu,
      characterCreation: !!characterCreation
    });
  }

  /**
   * Initialize main menu
   */
  init() {
    console.log('📋 MainMenu.init() called');
    this.attachEventListeners();
    this.checkContinueButton();
    console.log('✅ MainMenu.init() complete');
  }

  /**
   * Attach event listeners to menu buttons
   */
  attachEventListeners() {
    const continueBtn = document.getElementById('btn-continue');
    const newGameBtn = document.getElementById('btn-new-game');
    const loadBtn = document.getElementById('btn-load');
    const settingsBtn = document.getElementById('btn-settings');
    const creditsBtn = document.getElementById('btn-credits');
    
    console.log('🔗 Attaching event listeners:', {
      continueBtn: !!continueBtn,
      newGameBtn: !!newGameBtn,
      loadBtn: !!loadBtn,
      settingsBtn: !!settingsBtn,
      creditsBtn: !!creditsBtn
    });

    if (continueBtn) {
      continueBtn.onclick = () => this.continueGame();
    }

    if (newGameBtn) {
      newGameBtn.onclick = () => {
        console.log('🎮 New Game button clicked!');
        this.newGame();
      };
    }

    if (loadBtn) {
      loadBtn.onclick = () => this.showLoadMenu();
    }

    if (settingsBtn) {
      settingsBtn.onclick = () => this.settingsMenu.open();
    }

    if (creditsBtn) {
      creditsBtn.onclick = () => this.showCredits();
    }
  }

  /**
   * Check if there's a save to continue from
   */
  checkContinueButton() {
    const continueBtn = document.getElementById('btn-continue');
    if (!continueBtn) return;

    const hasSave = localStorage.getItem('hedonism_save_autosave');
    if (hasSave) {
      continueBtn.disabled = false;
    } else {
      continueBtn.disabled = true;
    }
  }

  /**
   * Continue from last save
   */
  continueGame() {
    const savedData = localStorage.getItem('hedonism_save_autosave');
    if (savedData) {
      try {
        const saveState = JSON.parse(savedData);
        
        // Emit load event with save data
        this.gameState.emit('loadGame', saveState);
        
        // Hide main menu only if load was successful
        const menu = document.getElementById('main-menu');
        if (menu) menu.classList.add('hidden');
      } catch (e) {
        console.error('Failed to continue game:', e);
        
        // Ensure menu is visible
        const menu = document.getElementById('main-menu');
        if (menu) menu.classList.remove('hidden');
        
        // Show error and offer to start new game
        const startNew = confirm('Failed to load save game. Would you like to start a new game instead?');
        if (startNew) {
          this.newGame();
        }
      }
    } else {
      // No save found, offer to start new game
      const startNew = confirm('No save game found. Would you like to start a new game?');
      if (startNew) {
        this.newGame();
      }
    }
  }

  /**
   * Start new game
   */
  newGame() {
    console.log('🎮 New Game clicked');
    
    // Confirm if there's an existing save
    const hasSave = localStorage.getItem('hedonism_save_autosave');
    if (hasSave) {
      const confirmed = confirm('Starting a new game will overwrite your current progress. Continue?');
      if (!confirmed) return;
    }

    // Initialize game state
    console.log('📝 Initializing game state...');
    this.gameState.init();
    
    // Show character creation
    console.log('🎨 Showing character creation...');
    this.characterCreation.show();
    
    // Listen for character creation completion
    this.gameState.once('characterCreated', () => {
      console.log('✅ Character created, starting game...');
      this.startGame();
    });
  }

  /**
   * Show load game menu
   */
  showLoadMenu() {
    // Use the new SaveManager if available
    if (window.game && window.game.saveManager) {
      window.game.saveManager.show();
      return;
    }
    
    // Fallback to old system if SaveManager not available
    const saves = this.gameState.listSaves();

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'load-menu';

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
              <p>Day ${save.day} • ${save.characterCount} characters • ${this.formatPlayTime(save.playTime)}</p>
              <p class="save-date">${date}</p>
            </div>
            <div class="save-actions">
              <button class="btn-load" data-slot="${save.slotName}">Load</button>
              <button class="btn-delete" data-slot="${save.slotName}">Delete</button>
            </div>
          </div>
        `;
      });
      savesHTML += '</div>';
    }

    modal.innerHTML = `
      <div class="modal-content load-game-modal">
        <div class="modal-header">
          <h2>Load Game</h2>
          <button class="close-btn" id="close-load-menu">✕</button>
        </div>
        <div class="modal-body">
          ${savesHTML}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="cancel-load">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Attach listeners
    document.getElementById('close-load-menu').onclick = () => modal.remove();
    document.getElementById('cancel-load').onclick = () => modal.remove();

    // Load buttons
    modal.querySelectorAll('.btn-load').forEach(btn => {
      btn.onclick = (e) => {
        const slot = e.target.dataset.slot;
        const savedData = localStorage.getItem(`hedonism_save_${slot}`);
        
        if (savedData) {
          try {
            const saveState = JSON.parse(savedData);
            modal.remove();
            
            // Hide main menu
            const menu = document.getElementById('main-menu');
            if (menu) menu.classList.add('hidden');
            
            // Emit load event with save data
            this.gameState.emit('loadGame', saveState);
          } catch (e) {
            console.error('Failed to load game:', e);
            alert('Failed to load save game.');
          }
        } else {
          alert('Save file not found.');
        }
      };
    });

    // Delete buttons
    modal.querySelectorAll('.btn-delete').forEach(btn => {
      btn.onclick = (e) => {
        const slot = e.target.dataset.slot;
        if (confirm(`Delete save "${slot}"?`)) {
          this.gameState.deleteSave(slot);
          modal.remove();
          this.showLoadMenu(); // Refresh list
        }
      };
    });
  }

  /**
   * Show credits
   */
  showCredits() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'credits-menu';

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Credits</h2>
          <button class="close-btn" id="close-credits">✕</button>
        </div>
        <div class="modal-body credits-content">
          <h3>Hedonism Island</h3>
          <p>A survival/management/dating sim where morality is optional</p>
          
          <div class="credit-section">
            <h4>Development</h4>
            <p>Built with Vite, vanilla JavaScript, and pure degeneracy</p>
          </div>
          
          <div class="credit-section">
            <h4>AI Generation</h4>
            <p>Powered by Perchance AI</p>
            <p>Text-to-Image Plugin • AI Text Plugin</p>
          </div>
          
          <div class="credit-section">
            <h4>Special Thanks</h4>
            <p>To everyone who said "you can't make that"</p>
            <p>We fucking did it anyway</p>
          </div>
          
          <div class="credit-section">
            <h4>Content Warning</h4>
            <p>This game contains explicit sexual content,</p>
            <p>player-choice morality including slavery and violence,</p>
            <p>and themes that would give your grandmother a heart attack.</p>
            <p><strong>18+ ONLY</strong></p>
          </div>
          
          <p style="margin-top: 30px; font-style: italic; color: #999;">
            "Survival is optional. Pleasure is mandatory."
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" id="close-credits-btn">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('close-credits').onclick = () => modal.remove();
    document.getElementById('close-credits-btn').onclick = () => modal.remove();
  }

  /**
   * Start the game (deprecated - now handled by story intro → game view flow)
   */
  startGame() {
    console.warn('MainMenu.startGame() is deprecated. Game flow is now: Character Creation → Story Intro → Game View');
    // Don't emit gameStarted here - it causes the old scene engine to run
    // The new flow emits gameStarted after the story intro completes
  }

  /**
   * Show main menu (hide game view)
   */
  showMenu() {
    const menu = document.getElementById('main-menu');
    const gameView = document.getElementById('game-view');

    if (menu) menu.classList.remove('hidden');
    if (gameView) gameView.classList.add('hidden');

    this.checkContinueButton();
  }

  /**
   * Format play time in human-readable format
   */
  formatPlayTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
}
