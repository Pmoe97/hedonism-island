/**
 * Settings Menu UI Component
 * Professional settings interface with tabs and controls
 */

export class SettingsMenu {
  constructor(settingsManager) {
    this.settings = settingsManager;
    this.currentTab = 'gender';
    this.isOpen = false;
  }

  /**
   * Open settings menu
   */
  open() {
    this.isOpen = true;
    this.render();
  }

  /**
   * Close settings menu
   */
  close() {
    this.isOpen = false;
    const menu = document.getElementById('settings-menu');
    if (menu) {
      menu.remove();
    }
  }

  /**
   * Render settings menu
   */
  render() {
    // Remove existing menu
    const existing = document.getElementById('settings-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.id = 'settings-menu';
    menu.className = 'modal-overlay';
    
    menu.innerHTML = `
      <div class="modal-content settings-modal">
        <div class="modal-header">
          <h2>⚙️ Settings</h2>
          <button class="close-btn" id="close-settings">✕</button>
        </div>
        
        <div class="settings-body">
          <div class="settings-tabs">
            <button class="tab-btn ${this.currentTab === 'gender' ? 'active' : ''}" data-tab="gender">
              Gender Distribution
            </button>
            <button class="tab-btn ${this.currentTab === 'disposition' ? 'active' : ''}" data-tab="disposition">
              NPC Disposition
            </button>
            <button class="tab-btn ${this.currentTab === 'ai-style' ? 'active' : ''}" data-tab="ai-style">
              AI Style
            </button>
            <button class="tab-btn ${this.currentTab === 'difficulty' ? 'active' : ''}" data-tab="difficulty">
              Difficulty
            </button>
            <button class="tab-btn ${this.currentTab === 'gameplay' ? 'active' : ''}" data-tab="gameplay">
              Gameplay
            </button>
            <button class="tab-btn ${this.currentTab === 'cheats' ? 'active' : ''}" data-tab="cheats">
              Cheats
            </button>
            <button class="tab-btn ${this.currentTab === 'content' ? 'active' : ''}" data-tab="content">
              Content/Kinks
            </button>
            <button class="tab-btn ${this.currentTab === 'accessibility' ? 'active' : ''}" data-tab="accessibility">
              Accessibility
            </button>
          </div>
          
          <div class="settings-content">
            ${this.renderCurrentTab()}
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" id="reset-settings">Reset to Defaults</button>
          <button class="btn btn-secondary" id="export-settings">Export Settings</button>
          <div class="spacer"></div>
          <button class="btn btn-secondary" id="cancel-settings">Cancel</button>
          <button class="btn btn-primary" id="save-settings">Save & Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(menu);
    this.attachEventListeners();
  }

  /**
   * Render current tab content
   */
  renderCurrentTab() {
    switch (this.currentTab) {
      case 'gender':
        return this.renderGenderTab();
      case 'disposition':
        return this.renderDispositionTab();
      case 'ai-style':
        return this.renderAIStyleTab();
      case 'difficulty':
        return this.renderDifficultyTab();
      case 'gameplay':
        return this.renderGameplayTab();
      case 'cheats':
        return this.renderCheatsTab();
      case 'content':
        return this.renderContentTab();
      case 'accessibility':
        return this.renderAccessibilityTab();
      default:
        return '<p>Select a tab</p>';
    }
  }

  /**
   * Render Gender Distribution tab
   */
  renderGenderTab() {
    const factions = ['castaways', 'islanders', 'mercenaries', 'tourists'];
    const genders = ['female', 'male', 'futanari', 'transWoman', 'transMale'];
    const genderLabels = {
      female: 'Female',
      male: 'Male',
      futanari: 'Futanari',
      transWoman: 'Trans Woman',
      transMale: 'Trans Man'
    };

    let html = '<div class="tab-content"><h3>Gender Distribution by Faction</h3>';
    html += '<p class="help-text">Adjust the likelihood of each gender appearing in procedurally generated characters. Percentages must total 100% per faction.</p>';

    for (const faction of factions) {
      html += `<div class="faction-section">
        <h4>${faction.charAt(0).toUpperCase() + faction.slice(1)}</h4>`;
      
      for (const gender of genders) {
        const value = this.settings.get(`genderDistribution.${faction}.${gender}`);
        html += `
          <div class="slider-control">
            <label>${genderLabels[gender]}</label>
            <input type="range" min="0" max="100" value="${value}" 
                   data-setting="genderDistribution.${faction}.${gender}"
                   class="slider">
            <span class="slider-value">${value}%</span>
          </div>
        `;
      }
      
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  /**
   * Render NPC Disposition tab
   */
  renderDispositionTab() {
    const dispositions = {
      friendliness: { label: 'Friendliness', min: 'Hostile', max: 'Friendly' },
      romanceInterest: { label: 'Romance Interest', min: 'Not Interested', max: 'Very Interested' },
      sexualOpenness: { label: 'Sexual Openness', min: 'Prude', max: 'Complete Horndog' },
      hostility: { label: 'Hostility', min: 'Peaceful', max: 'Aggressive' },
      submissiveness: { label: 'Submissiveness', min: 'Dominant', max: 'Submissive' }
    };

    let html = '<div class="tab-content"><h3>NPC Disposition</h3>';
    html += '<p class="help-text">These sliders affect the baseline personality traits of generated NPCs.</p>';

    for (const [key, config] of Object.entries(dispositions)) {
      const value = this.settings.get(`npcDisposition.${key}`);
      html += `
        <div class="slider-control wide">
          <label>${config.label}</label>
          <div class="slider-labels">
            <span>${config.min}</span>
            <span>${config.max}</span>
          </div>
          <input type="range" min="0" max="100" value="${value}"
                 data-setting="npcDisposition.${key}"
                 class="slider">
          <span class="slider-value">${value}</span>
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  /**
   * Render AI Style tab
   */
  renderAIStyleTab() {
    const currentPreset = this.settings.get('aiImageStyle.preset');
    const customValue = this.settings.get('aiImageStyle.custom');
    const presets = this.settings.settings.aiImageStylePresets;

    let html = '<div class="tab-content"><h3>AI Image Generation Style</h3>';
    html += '<p class="help-text">Choose how AI-generated character portraits and scenes should look.</p>';
    
    html += '<div class="style-selector">';
    for (const preset of presets) {
      const label = preset.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      html += `
        <label class="radio-card">
          <input type="radio" name="ai-style" value="${preset}" 
                 ${currentPreset === preset ? 'checked' : ''}>
          <span>${label}</span>
        </label>
      `;
    }
    html += '</div>';

    html += `
      <div class="custom-style ${currentPreset === 'custom' ? '' : 'hidden'}" id="custom-style-input">
        <label>Custom Style Keywords</label>
        <input type="text" value="${customValue}" 
               data-setting="aiImageStyle.custom"
               placeholder="e.g., vintage photograph, sepia tone, 1920s">
        <p class="help-text">Enter Perchance-compatible style keywords.</p>
      </div>
    `;

    html += '</div>';
    return html;
  }

  /**
   * Render Difficulty tab
   */
  renderDifficultyTab() {
    const survival = this.settings.get('difficulty.survival');
    const combat = this.settings.get('difficulty.combat');
    const economy = this.settings.get('difficulty.economy');

    return `
      <div class="tab-content">
        <h3>Difficulty Settings</h3>
        
        <div class="difficulty-section">
          <h4>Survival Difficulty</h4>
          <select data-setting="difficulty.survival">
            <option value="easy" ${survival === 'easy' ? 'selected' : ''}>Easy - Slow hunger/thirst drain, abundant resources</option>
            <option value="normal" ${survival === 'normal' ? 'selected' : ''}>Normal - Balanced survival challenge</option>
            <option value="hard" ${survival === 'hard' ? 'selected' : ''}>Hard - Fast stat drain, scarce resources</option>
            <option value="hardcore" ${survival === 'hardcore' ? 'selected' : ''}>Hardcore - Extreme challenge, for masochists</option>
          </select>
        </div>
        
        <div class="difficulty-section">
          <h4>Combat Difficulty</h4>
          <select data-setting="difficulty.combat">
            <option value="easy" ${combat === 'easy' ? 'selected' : ''}>Easy - Weak enemies, very rare deaths</option>
            <option value="normal" ${combat === 'normal' ? 'selected' : ''}>Normal - Balanced combat, injury common</option>
            <option value="hard" ${combat === 'hard' ? 'selected' : ''}>Hard - Strong enemies, death possible</option>
            <option value="permadeath" ${combat === 'permadeath' ? 'selected' : ''}>Permadeath - Death is permanent. Good luck.</option>
          </select>
        </div>
        
        <div class="difficulty-section">
          <h4>Economy Difficulty (Phase 4)</h4>
          <select data-setting="difficulty.economy">
            <option value="generous" ${economy === 'generous' ? 'selected' : ''}>Generous - Money flows freely</option>
            <option value="normal" ${economy === 'normal' ? 'selected' : ''}>Normal - Balanced economy</option>
            <option value="challenging" ${economy === 'challenging' ? 'selected' : ''}>Challenging - Every coin counts</option>
          </select>
        </div>
      </div>
    `;
  }

  /**
   * Render Gameplay tab
   */
  renderGameplayTab() {
    const gameplay = this.settings.settings.gameplay;

    return `
      <div class="tab-content">
        <h3>Gameplay Options</h3>
        
        <div class="toggle-control">
          <label>
            <input type="checkbox" data-setting="gameplay.permadeath" ${gameplay.permadeath ? 'checked' : ''}>
            <span>Permadeath - Characters can die permanently</span>
          </label>
        </div>
        
        <div class="slider-control">
          <label>Autosave Frequency (minutes)</label>
          <input type="range" min="1" max="30" value="${gameplay.autosaveFrequency}"
                 data-setting="gameplay.autosaveFrequency" class="slider">
          <span class="slider-value">${gameplay.autosaveFrequency}</span>
        </div>
        
        <div class="toggle-control">
          <label>
            <input type="checkbox" data-setting="gameplay.tutorialEnabled" ${gameplay.tutorialEnabled ? 'checked' : ''}>
            <span>Tutorial Hints Enabled</span>
          </label>
        </div>
        
        <div class="select-control">
          <label>Explicit Content Display</label>
          <select data-setting="gameplay.explicitContent">
            <option value="full" ${gameplay.explicitContent === 'full' ? 'selected' : ''}>Full - Show everything (recommended)</option>
            <option value="fade-to-black" ${gameplay.explicitContent === 'fade-to-black' ? 'selected' : ''}>Fade to Black - Implied only (for cowards)</option>
            <option value="off" ${gameplay.explicitContent === 'off' ? 'selected' : ''}>Off - No sexual content (why are you here?)</option>
          </select>
        </div>
        
        <div class="select-control">
          <label>Blood & Violence</label>
          <select data-setting="gameplay.bloodViolence">
            <option value="full" ${gameplay.bloodViolence === 'full' ? 'selected' : ''}>Full - Realistic violence</option>
            <option value="reduced" ${gameplay.bloodViolence === 'reduced' ? 'selected' : ''}>Reduced - Minimal gore</option>
            <option value="off" ${gameplay.bloodViolence === 'off' ? 'selected' : ''}>Off - Cartoon violence</option>
          </select>
        </div>
        
        <div class="select-control">
          <label>Event Pacing</label>
          <select data-setting="gameplay.eventPacing">
            <option value="slow" ${gameplay.eventPacing === 'slow' ? 'selected' : ''}>Slow - Take your time</option>
            <option value="normal" ${gameplay.eventPacing === 'normal' ? 'selected' : ''}>Normal - Balanced</option>
            <option value="fast" ${gameplay.eventPacing === 'fast' ? 'selected' : ''}>Fast - Quick progression</option>
          </select>
        </div>
      </div>
    `;
  }

  /**
   * Render Cheats tab
   */
  renderCheatsTab() {
    const cheats = this.settings.settings.cheats;

    return `
      <div class="tab-content">
        <h3>Cheat Panel</h3>
        <p class="help-text warning">⚠️ Using cheats may affect achievements (if we add them later)</p>
        
        <div class="toggle-control">
          <label>
            <input type="checkbox" data-setting="cheats.godMode" ${cheats.godMode ? 'checked' : ''}>
            <span>God Mode - All cheats enabled</span>
          </label>
        </div>
        
        <div class="toggle-control">
          <label>
            <input type="checkbox" data-setting="cheats.infiniteHealth" ${cheats.infiniteHealth ? 'checked' : ''}>
            <span>Infinite Health</span>
          </label>
        </div>
        
        <div class="toggle-control">
          <label>
            <input type="checkbox" data-setting="cheats.infiniteEnergy" ${cheats.infiniteEnergy ? 'checked' : ''}>
            <span>Infinite Energy</span>
          </label>
        </div>
        
        <div class="toggle-control">
          <label>
            <input type="checkbox" data-setting="cheats.infiniteResources" ${cheats.infiniteResources ? 'checked' : ''}>
            <span>Infinite Resources</span>
          </label>
        </div>
        
        <div class="toggle-control">
          <label>
            <input type="checkbox" data-setting="cheats.noHungerThirst" ${cheats.noHungerThirst ? 'checked' : ''}>
            <span>No Hunger/Thirst</span>
          </label>
        </div>
        
        <div class="slider-control">
          <label>Relationship Gain Multiplier</label>
          <input type="range" min="0.1" max="10" step="0.1" value="${cheats.relationshipMultiplier}"
                 data-setting="cheats.relationshipMultiplier" class="slider">
          <span class="slider-value">${cheats.relationshipMultiplier}x</span>
        </div>
        
        <div class="slider-control">
          <label>Resource Gather Multiplier</label>
          <input type="range" min="0.5" max="10" step="0.1" value="${cheats.resourceMultiplier}"
                 data-setting="cheats.resourceMultiplier" class="slider">
          <span class="slider-value">${cheats.resourceMultiplier}x</span>
        </div>
      </div>
    `;
  }

  /**
   * Render Content/Kinks tab
   */
  renderContentTab() {
    const prefs = this.settings.settings.contentPreferences;
    const kinks = [
      { key: 'vanillaRomance', label: 'Vanilla Romance', desc: 'Standard romantic content' },
      { key: 'bdsm', label: 'BDSM/Dominance', desc: 'Bondage, discipline, dominance scenes' },
      { key: 'submission', label: 'Submission/Slavery', desc: 'Submissive dynamics, slavery content' },
      { key: 'groupScenes', label: 'Group Scenes', desc: 'Threesomes, orgies, multiple partners' },
      { key: 'publicExhibition', label: 'Public/Exhibition', desc: 'Public sex, being watched' },
      { key: 'voyeurism', label: 'Voyeurism', desc: 'Watching others' },
      { key: 'breedingPregnancy', label: 'Breeding/Pregnancy', desc: 'Impregnation, pregnancy content' },
      { key: 'nonConDubCon', label: 'Non-Con/Dubious Consent', desc: 'Forced or questionable consent scenarios' },
      { key: 'furryMonster', label: 'Furry/Monster', desc: 'Non-human characters' },
      { key: 'feet', label: 'Feet', desc: 'Foot fetish content' },
      { key: 'lactation', label: 'Lactation', desc: 'Breastfeeding, milk' },
      { key: 'ageGap', label: 'Age Gap (18+)', desc: 'Significant age differences, all 18+' },
      { key: 'interracial', label: 'Interracial', desc: 'Diverse ethnic pairings' },
      { key: 'surpriseMe', label: 'Surprise Me!', desc: 'Random kink inclusion' }
    ];

    let html = '<div class="tab-content"><h3>Content Preferences / Kinks</h3>';
    html += '<p class="help-text">Enable the types of sexual content you want to encounter. Disabled content will be filtered out.</p>';
    html += '<div class="kink-grid">';

    for (const kink of kinks) {
      html += `
        <div class="kink-card">
          <label>
            <input type="checkbox" data-setting="contentPreferences.${kink.key}" ${prefs[kink.key] ? 'checked' : ''}>
            <div class="kink-label">
              <strong>${kink.label}</strong>
              <span class="kink-desc">${kink.desc}</span>
            </div>
          </label>
        </div>
      `;
    }

    html += '</div></div>';
    return html;
  }

  /**
   * Render Accessibility tab
   */
  renderAccessibilityTab() {
    const acc = this.settings.settings.accessibility;

    return `
      <div class="tab-content">
        <h3>Accessibility Options</h3>
        
        <div class="select-control">
          <label>Text Size</label>
          <select data-setting="accessibility.textSize">
            <option value="small" ${acc.textSize === 'small' ? 'selected' : ''}>Small</option>
            <option value="medium" ${acc.textSize === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="large" ${acc.textSize === 'large' ? 'selected' : ''}>Large</option>
            <option value="extra-large" ${acc.textSize === 'extra-large' ? 'selected' : ''}>Extra Large</option>
          </select>
        </div>
        
        <div class="select-control">
          <label>Colorblind Mode</label>
          <select data-setting="accessibility.colorblindMode">
            <option value="none" ${acc.colorblindMode === 'none' ? 'selected' : ''}>None</option>
            <option value="protanopia" ${acc.colorblindMode === 'protanopia' ? 'selected' : ''}>Protanopia (Red-Green)</option>
            <option value="deuteranopia" ${acc.colorblindMode === 'deuteranopia' ? 'selected' : ''}>Deuteranopia (Red-Green)</option>
            <option value="tritanopia" ${acc.colorblindMode === 'tritanopia' ? 'selected' : ''}>Tritanopia (Blue-Yellow)</option>
          </select>
        </div>
        
        <div class="toggle-control">
          <label>
            <input type="checkbox" data-setting="accessibility.screenReader" ${acc.screenReader ? 'checked' : ''}>
            <span>Screen Reader Support</span>
          </label>
        </div>
        
        <div class="select-control">
          <label>Animations</label>
          <select data-setting="accessibility.animations">
            <option value="full" ${acc.animations === 'full' ? 'selected' : ''}>Full</option>
            <option value="reduced" ${acc.animations === 'reduced' ? 'selected' : ''}>Reduced</option>
            <option value="off" ${acc.animations === 'off' ? 'selected' : ''}>Off</option>
          </select>
        </div>
        
        <div class="toggle-control">
          <label>
            <input type="checkbox" data-setting="accessibility.autoAdvanceText" ${acc.autoAdvanceText ? 'checked' : ''}>
            <span>Auto-Advance Text</span>
          </label>
        </div>
        
        <div class="slider-control ${acc.autoAdvanceText ? '' : 'disabled'}">
          <label>Auto-Advance Speed (seconds)</label>
          <input type="range" min="1" max="10" value="${acc.autoAdvanceSpeed}"
                 data-setting="accessibility.autoAdvanceSpeed" class="slider"
                 ${acc.autoAdvanceText ? '' : 'disabled'}>
          <span class="slider-value">${acc.autoAdvanceSpeed}s</span>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Close button
    document.getElementById('close-settings').onclick = () => this.close();
    document.getElementById('cancel-settings').onclick = () => this.close();

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = () => {
        this.currentTab = btn.dataset.tab;
        this.render();
      };
    });

    // Sliders
    document.querySelectorAll('input[type="range"]').forEach(slider => {
      slider.oninput = (e) => {
        const valueDisplay = e.target.nextElementSibling;
        if (valueDisplay && valueDisplay.classList.contains('slider-value')) {
          const setting = e.target.dataset.setting;
          if (setting && setting.includes('genderDistribution')) {
            valueDisplay.textContent = `${e.target.value}%`;
          } else if (setting && (setting.includes('Multiplier'))) {
            valueDisplay.textContent = `${e.target.value}x`;
          } else if (setting === 'accessibility.autoAdvanceSpeed') {
            valueDisplay.textContent = `${e.target.value}s`;
          } else {
            valueDisplay.textContent = e.target.value;
          }
        }
      };
    });

    // AI Style radio buttons
    document.querySelectorAll('input[name="ai-style"]').forEach(radio => {
      radio.onchange = (e) => {
        this.settings.set('aiImageStyle.preset', e.target.value);
        const customInput = document.getElementById('custom-style-input');
        if (customInput) {
          if (e.target.value === 'custom') {
            customInput.classList.remove('hidden');
          } else {
            customInput.classList.add('hidden');
          }
        }
      };
    });

    // Save button
    document.getElementById('save-settings').onclick = () => this.saveSettings();

    // Reset button
    document.getElementById('reset-settings').onclick = () => {
      if (confirm('Reset all settings to defaults? This cannot be undone.')) {
        this.settings.reset();
        this.render();
      }
    };

    // Export button
    document.getElementById('export-settings').onclick = () => this.settings.export();
  }

  /**
   * Save all settings
   */
  saveSettings() {
    // Collect all inputs
    document.querySelectorAll('[data-setting]').forEach(input => {
      const setting = input.dataset.setting;
      let value;

      if (input.type === 'checkbox') {
        value = input.checked;
      } else if (input.type === 'range') {
        value = parseFloat(input.value);
      } else {
        value = input.value;
      }

      this.settings.set(setting, value);
    });

    this.settings.save();
    this.close();
    
    // Notify user
    this.showNotification('Settings saved successfully!');
  }

  /**
   * Show notification toast
   */
  showNotification(message) {
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}
