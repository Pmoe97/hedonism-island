/**
 * Options Menu Component
 * Quick access menu for save/load, settings, and other options
 */

export class OptionsMenu {
  constructor(gameState, settingsMenu, saveManager) {
    this.gameState = gameState;
    this.settingsMenu = settingsMenu;
    this.saveManager = saveManager;
    this.modal = null;
  }

  /**
   * Show options menu modal
   */
  show() {
    if (this.modal) return; // Already showing

    this.modal = document.createElement('div');
    this.modal.className = 'options-menu-modal';
    this.modal.innerHTML = this.buildHTML();
    document.body.appendChild(this.modal);

    this.attachEventListeners();
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
      <div class="options-menu-overlay">
        <div class="options-menu-container">
          <div class="options-menu-header">
            <h2>⚙️ Options</h2>
            <button class="options-close-btn" id="opt-close">✕</button>
          </div>
          
          <div class="options-menu-grid">
            <button class="option-card" id="opt-save-load">
              <div class="option-icon">💾</div>
              <div class="option-title">Save / Load</div>
              <div class="option-desc">Manage your saved games</div>
            </button>

            <button class="option-card" id="opt-settings">
              <div class="option-icon">⚙️</div>
              <div class="option-title">Settings</div>
              <div class="option-desc">Game preferences and options</div>
            </button>

            <button class="option-card" id="opt-main-menu">
              <div class="option-icon">🏠</div>
              <div class="option-title">Main Menu</div>
              <div class="option-desc">Return to main menu</div>
            </button>

            <button class="option-card" id="opt-continue">
              <div class="option-icon">▶️</div>
              <div class="option-title">Resume</div>
              <div class="option-desc">Continue playing</div>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Close button
    const closeBtn = this.modal.querySelector('#opt-close');
    closeBtn?.addEventListener('click', () => this.hide());

    // Click outside to close
    const overlay = this.modal.querySelector('.options-menu-overlay');
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) this.hide();
    });

    // Save/Load option
    const saveLoadBtn = this.modal.querySelector('#opt-save-load');
    saveLoadBtn?.addEventListener('click', () => {
      this.hide();
      this.saveManager.show();
    });

    // Settings option
    const settingsBtn = this.modal.querySelector('#opt-settings');
    settingsBtn?.addEventListener('click', () => {
      this.hide();
      this.settingsMenu.open();
    });

    // Main Menu option
    const mainMenuBtn = this.modal.querySelector('#opt-main-menu');
    mainMenuBtn?.addEventListener('click', () => {
      this.handleMainMenu();
    });

    // Continue/Resume option
    const continueBtn = this.modal.querySelector('#opt-continue');
    continueBtn?.addEventListener('click', () => {
      this.hide();
    });

    // Escape key to close
    this.keyHandler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.hide();
      }
    };
    document.addEventListener('keydown', this.keyHandler);
  }

  /**
   * Handle return to main menu
   */
  handleMainMenu() {
    // Autosave before quitting
    this.gameState.save('autosave');
    
    this.hide();
    
    // Hide all game screens
    const storyIntro = document.getElementById('story-intro');
    const gameView = document.getElementById('game-view');
    const characterCreation = document.getElementById('character-creation');
    
    if (storyIntro) storyIntro.classList.add('hidden');
    if (gameView) gameView.classList.add('hidden');
    if (characterCreation) characterCreation.classList.add('hidden');
    
    // Show main menu
    const mainMenuEl = document.getElementById('main-menu');
    if (mainMenuEl) mainMenuEl.classList.remove('hidden');
    
    // Update continue button if MainMenu exists
    if (window.game && window.game.mainMenu && typeof window.game.mainMenu.checkContinueButton === 'function') {
      window.game.mainMenu.checkContinueButton();
    }
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
