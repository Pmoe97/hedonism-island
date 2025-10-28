/**
 * Character Creation UI
 * Multi-step character creation interface with presets and detailed customization
 */

import { CharacterCreator } from '../modules/characterCreator.js';

export class CharacterCreationUI {
  constructor(gameState, settingsManager, perchanceAI) {
    this.gameState = gameState;
    this.settingsManager = settingsManager;
    this.ai = perchanceAI;
    this.creator = new CharacterCreator();
    this.currentStep = 1;
    this.totalSteps = 5; // Reduced from 6 (removed personality step)
    this.usePreset = false;
  }

  show() {
    this.currentStep = 1;
    this.render();
    
    // Hide main menu
    const mainMenu = document.getElementById('main-menu');
    if (mainMenu) {
      mainMenu.classList.add('hidden');
    }
    
    // Show character creation with smooth transition
    const container = document.getElementById('character-creation');
    container.style.display = 'flex';
    
    // Force reflow
    container.offsetHeight;
    
    // Trigger fade in
    container.classList.add('active');
    
    console.log('✅ Character creation UI shown');
  }

  hide() {
    const container = document.getElementById('character-creation');
    
    // Trigger fade out
    container.classList.remove('active');
    
    // Wait for transition before hiding
    setTimeout(() => {
      container.style.display = 'none';
    }, 400);
    
    console.log('✅ Character creation UI hidden');
  }

  render() {
    const container = document.getElementById('character-creation');
    const preview = this.creator.getPreviewSummary();
    
    container.innerHTML = `
      <div class="char-creation-wrapper">
        <div class="char-creation-container">
          <div class="char-creation-header">
            <h1>Create Your Character</h1>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${(this.currentStep / this.totalSteps) * 100}%"></div>
            </div>
            <p class="step-indicator">Step ${this.currentStep} of ${this.totalSteps}</p>
            ${[1,3,4].includes(this.currentStep) ? '<button id="randomize-btn" class="btn-randomize" title="Randomize this step">🎲 Random</button>' : ''}
          </div>
          
          <div class="char-creation-content">
            ${this.renderStep()}
          </div>
          
          <div class="char-creation-footer">
            ${this.currentStep > 1 ? '<button id="prev-step-btn" class="btn-secondary">← Previous</button>' : ''}
            ${this.currentStep < this.totalSteps ? '<button id="next-step-btn" class="btn-primary">Next →</button>' : ''}
            ${this.currentStep === this.totalSteps ? '<button id="confirm-character-btn" class="btn-primary">Start Game →</button>' : ''}
          </div>
        </div>
        
        <div class="char-preview-panel">
          <h3>Character Preview</h3>
          <div class="preview-content">
            <div class="preview-field">
              <span class="preview-label">Name:</span>
              <span class="preview-value ${!preview.name || preview.name === 'Unnamed' ? 'preview-missing' : ''}">${preview.name}</span>
            </div>
            <div class="preview-field">
              <span class="preview-label">Age:</span>
              <span class="preview-value">${preview.age}</span>
            </div>
            <div class="preview-field">
              <span class="preview-label">Gender:</span>
              <span class="preview-value">${preview.gender.charAt(0).toUpperCase() + preview.gender.slice(1)}</span>
            </div>
            <div class="preview-field">
              <span class="preview-label">Description:</span>
              <span class="preview-value">${preview.description || 'Not yet defined'}</span>
            </div>
            <div class="preview-field">
              <span class="preview-label">Background:</span>
              <span class="preview-value">${preview.background.charAt(0).toUpperCase() + preview.background.slice(1)}</span>
            </div>
            
            <div class="preview-section">
              <h4>Skills</h4>
              ${Object.entries(preview.skills).map(([skill, value]) => `
                <div class="preview-skill">
                  <span>${skill.charAt(0).toUpperCase() + skill.slice(1)}</span>
                  <span class="skill-dots">${'●'.repeat(value)}${'○'.repeat(Math.max(0, 10 - value))}</span>
                </div>
              `).join('')}
            </div>
            
            ${preview.traits.length > 0 ? `
              <div class="preview-section">
                <h4>Traits</h4>
                <div class="preview-traits">
                  ${preview.traits.map(trait => `<span class="trait-badge">${trait}</span>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    
    this.attachEventListeners();
  }

  renderStep() {
    switch (this.currentStep) {
      case 1: return this.renderGenderStep();
      case 2: return this.renderPresetStep();
      case 3: return this.renderAppearanceStep();
      case 4: return this.renderBackgroundStep();
      case 5: return this.renderPortraitStep();
      default: return '';
    }
  }

  renderGenderStep() {
    return `
      <div class="step-content">
        <h2>Choose Your Gender</h2>
        <p class="step-description">Select the gender identity for your character</p>
        
        <div class="gender-options">
          ${this.renderGenderOption('female', 'Female', '♀', 'Feminine body with vagina')}
          ${this.renderGenderOption('male', 'Male', '♂', 'Masculine body with penis')}
          ${this.renderGenderOption('futanari', 'Futanari', '⚥', 'Feminine body with both penis and vagina')}
          ${this.renderGenderOption('Cuntboy', 'Cuntboy', '⚲', 'Masculine body with vagina')}
          ${this.renderGenderOption('other', 'Other/Non-Binary', '⚪', 'Androgynous or custom configuration')}
        </div>
      </div>
    `;
  }

  renderGenderOption(value, label, symbol, description) {
    const selected = this.creator.currentCharacter.gender === value ? 'selected' : '';
    return `
      <div class="gender-card ${selected}" data-gender="${value}">
        <div class="gender-symbol">${symbol}</div>
        <div class="gender-label">${label}</div>
        <div class="gender-description">${description}</div>
      </div>
    `;
  }

  renderPresetStep() {
    const gender = this.creator.currentCharacter.gender;
    const presets = this.creator.getPresetsForGender(gender);
    
    return `
      <div class="step-content">
        <h2>Choose Creation Method</h2>
        <p class="step-description">Use a preset or customize every detail</p>
        
        <div class="creation-method-options">
          <div class="method-card ${!this.usePreset ? 'selected' : ''}" data-method="custom">
            <h3>✨ Full Customization</h3>
            <p>Choose every detail of your character's appearance, personality, and background</p>
          </div>
          
          <div class="method-card ${this.usePreset ? 'selected' : ''}" data-method="preset">
            <h3>⚡ Quick Presets</h3>
            <p>Start with a pre-made character template</p>
          </div>
        </div>
        
        ${this.usePreset ? `
          <div class="preset-selection">
            <h3>Select a Preset</h3>
            <div class="preset-options">
              ${presets.map((preset, index) => `
                <div class="preset-card" data-preset="${index}">
                  <h4>${preset.name}</h4>
                  <p>${preset.description}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderAppearanceStep() {
    const body = this.creator.currentCharacter.body;
    const gender = this.creator.currentCharacter.gender;
    
    return `
      <div class="step-content appearance-step">
        <h2>Customize Appearance</h2>
        <p class="step-description">Design every detail of your character's body</p>
        
        <div class="appearance-sections">
          <!-- Basic Body -->
          <div class="appearance-section">
            <h3>Body Type</h3>
            ${this.renderSelect('body.height', 'Height', ['petite', 'short', 'average', 'tall', 'very-tall'])}
            ${this.renderSelect('body.build', 'Build', ['skinny', 'slim', 'average', 'athletic', 'curvy', 'muscular', 'heavyset'])}
            ${this.renderSelect('body.skinTone', 'Skin Tone', ['pale', 'fair', 'tan', 'olive', 'brown', 'dark'])}
            ${this.renderSelect('body.muscleTone', 'Muscle Tone', ['soft', 'toned', 'average', 'muscular', 'very-muscular'])}
          </div>
          
          <!-- Face -->
          <div class="appearance-section">
            <h3>Face</h3>
            ${this.renderSelect('body.faceShape', 'Face Shape', ['oval', 'round', 'square', 'heart', 'diamond'])}
            ${this.renderSelect('body.eyeColor', 'Eye Color', ['brown', 'blue', 'green', 'hazel', 'gray', 'amber', 'heterochromia'])}
            ${this.renderSelect('body.eyeShape', 'Eye Shape', ['almond', 'round', 'hooded', 'upturned', 'downturned'])}
          </div>
          
          <!-- Hair -->
          <div class="appearance-section">
            <h3>Hair</h3>
            ${this.renderSelect('body.hairColor', 'Hair Color', ['black', 'brown', 'blonde', 'red', 'auburn', 'gray', 'white', 'unusual'])}
            ${this.renderSelect('body.hairLength', 'Hair Length', ['buzzed', 'short', 'shoulder', 'long', 'very-long'])}
            ${this.renderSelect('body.hairStyle', 'Hair Style', ['straight', 'wavy', 'curly', 'kinky', 'braided', 'tied-up'])}
          </div>
          
          <!-- Body Features -->
          <div class="appearance-section">
            <h3>Body Features</h3>
            ${gender === 'female' || gender === 'futanari' ? 
              this.renderSelect('body.breastSize', 'Breast Size', ['flat', 'small', 'medium', 'large', 'very-large', 'huge']) : ''}
            ${this.renderSelect('body.buttSize', 'Butt Size', ['small', 'medium', 'large', 'very-large'])}
            ${this.renderSelect('body.pubicHair', 'Pubic Hair', ['none', 'trimmed', 'natural', 'styled'])}
            ${this.renderSelect('body.bodyHair', 'Body Hair', ['none', 'minimal', 'average', 'hairy'])}
            ${this.renderSelect('body.tattoos', 'Tattoos', ['none', 'few', 'many', 'custom'])}
            ${this.renderSelect('body.piercings', 'Piercings', ['none', 'ears', 'face', 'body', 'nipples', 'genital', 'multiple'])}
          </div>
          
          <!-- Distinctive Features -->
          <div class="appearance-section">
            <h3>Distinctive Features</h3>
            ${this.renderSelect('body.scars', 'Scars', ['none', 'few', 'many', 'prominent'])}
            ${body.scars !== 'none' && body.scars !== 'custom' ? this.renderSelect('body.scarLocation', 'Scar Location', ['face', 'chest', 'back', 'arms', 'legs']) : ''}
            ${this.renderSelect('body.freckles', 'Freckles', ['none', 'light', 'moderate', 'heavy'])}
            ${this.renderCheckbox('body.birthmarks', 'Has Birthmark(s)', true)}
            ${this.renderCheckbox('body.beautyMark', 'Has Beauty Mark', true)}
            
            <div class="form-group">
              <label>Additional Distinctive Features</label>
              <input type="text" 
                     class="custom-text-input" 
                     data-path="body.distinctiveFeaturesCustom" 
                     value="${this.creator.currentCharacter.body.distinctiveFeaturesCustom || ''}" 
                     placeholder="e.g., Unique eyes, distinctive voice, unusual marking...">
              <small style="color: #aaa; font-size: 0.85rem;">Optional: Add any unique features not covered above</small>
            </div>
          </div>
          
          <!-- Sexual Experience -->
          <div class="appearance-section">
            <h3>Sexual Experience</h3>
            ${this.renderSelect('sexualProfile.experience', 'Overall Experience', ['virgin', 'inexperienced', 'experienced', 'veteran'])}
            ${this.renderSelect('sexualProfile.preferredRole', 'Preferred Role', ['dominant', 'submissive', 'versatile', 'switch'])}
          </div>
          
          <!-- Genitals (Explicit) -->
          <div class="appearance-section explicit-section">
            <h3>⚠️ Genital Customization (Explicit)</h3>
            ${this.renderGenitalOptions()}
          </div>
        </div>
      </div>
    `;
  }

  renderGenitalOptions() {
    const gender = this.creator.currentCharacter.gender;
    const body = this.creator.currentCharacter.body;
    let html = '';
    
    // Penis options
    if (gender === 'male' || gender === 'futanari' || body.primaryGenitals === 'penis' || body.primaryGenitals === 'both') {
      html += `
        <div class="genital-subsection">
          <h4>Penis Details</h4>
          ${this.renderSelect('body.penisSize', 'Size', ['small', 'average', 'large', 'very-large', 'huge'])}
          ${this.renderSelect('body.penisGirth', 'Girth', ['thin', 'average', 'thick', 'very-thick'])}
          ${this.renderCheckbox('body.circumcised', 'Circumcised')}
        </div>
      `;
    }
    
    // Vagina options
    if (gender === 'female' || gender === 'Cuntboy' || gender === 'futanari' || body.primaryGenitals === 'vagina' || body.primaryGenitals === 'both') {
      html += `
        <div class="genital-subsection">
          <h4>Vagina Details</h4>
          ${this.renderSelect('body.vaginaTightness', 'Tightness', ['tight', 'average', 'loose'])}
          ${this.renderSelect('body.vaginaDepth', 'Depth', ['shallow', 'average', 'deep'])}
        </div>
      `;
    }
    
    return html;
  }

  renderPersonalityStep() {
    return `
      <div class="step-content personality-step">
        <h2>Define Personality</h2>
        <p class="step-description">Shape your character's behavior and attitudes</p>
        
        <div class="personality-sliders">
          ${this.renderSlider('personality.dominance', 'Dominance', 'Submissive', 'Dominant')}
          ${this.renderSlider('personality.openness', 'Sexual Openness', 'Reserved', 'Promiscuous')}
          ${this.renderSlider('personality.morality', 'Morality', 'Cruel', 'Kind')}
          ${this.renderSlider('personality.confidence', 'Confidence', 'Shy', 'Confident')}
          ${this.renderSlider('personality.intelligence', 'Intelligence', 'Simple', 'Clever')}
          ${this.renderSlider('personality.aggression', 'Aggression', 'Passive', 'Aggressive')}
        </div>
        
        <div class="sexual-preferences">
          <h3>Sexual Experience</h3>
          ${this.renderSelect('preferences.experience', 'Experience Level', ['virgin', 'inexperienced', 'experienced', 'expert', 'veteran'])}
        </div>
      </div>
    `;
  }

  renderBackgroundStep() {
    return `
      <div class="step-content background-step">
        <h2>Character Background</h2>
        <p class="step-description">Define your character's name, age, and past life before becoming a castaway</p>
        
        <div class="background-form">
          <div class="form-group">
            <label for="char-name">Name</label>
            <input type="text" id="char-name" class="text-input" value="${this.creator.currentCharacter.name}" placeholder="Enter character name">
          </div>
          
          <div class="form-group">
            <label for="char-age">Age (18+)</label>
            <input type="number" id="char-age" class="text-input" min="18" max="99" value="${this.creator.currentCharacter.age}">
          </div>
          
          <div class="form-group">
            <label for="char-background">Previous Life</label>
            ${this.renderSelect('background', 'Who were you before you ended up here?', [
              'tourist', 'sailor', 'scientist', 'criminal', 'drifter', 'pilot'
            ])}
            <p class="background-description">${this.getBackgroundDescription()}</p>
          </div>
          
          <div class="skills-allocation">
            <h3>Starting Skills</h3>
            <p class="skills-info">Your background determines your starting skill bonuses</p>
            ${this.renderSkillPoints()}
          </div>
        </div>
      </div>
    `;
  }

  renderPortraitStep() {
    const character = this.creator.currentCharacter;
    const preview = this.creator.getPreviewSummary();
    
    return `
      <div class="step-content portrait-step">
        <h2>Generate Portrait</h2>
        <p class="step-description">Create an AI-generated image of your character based on your choices</p>
        
        <div class="portrait-container">
          <div class="portrait-preview">
            ${character.portraitUrl ? 
              `<img src="${character.portraitUrl}" alt="Character Portrait" class="portrait-image">` :
              `<div class="portrait-placeholder">
                <div class="placeholder-icon">👤</div>
                <p>No portrait generated yet</p>
              </div>`
            }
          </div>
          
          <div class="portrait-controls">
            <button id="generate-portrait-btn" class="btn-primary">
              ${character.portraitUrl ? '🔄 Regenerate Portrait' : '✨ Generate Portrait'}
            </button>
            
            <div class="portrait-info">
              <h4>Character Description</h4>
              <p class="character-description">${preview.description}</p>
              ${character.portraitPrompt ? `
                <details class="prompt-details">
                  <summary>View Full AI Prompt</summary>
                  <p class="prompt-preview">${character.portraitPrompt}</p>
                </details>
              ` : ''}
              ${character.portraitUrl ? '<p class="success-msg">✓ Portrait generated successfully!</p>' : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Helper render methods
  renderSelect(path, label, options, allowCustom = true) {
    const value = this.creator.getAttribute(path);
    const customPath = path + 'Custom';
    const customValue = this.creator.getAttribute(customPath) || '';
    
    // Add 'custom' to options if not already there and allowCustom is true
    if (allowCustom && !options.includes('custom')) {
      options = [...options, 'custom'];
    }
    
    return `
      <div class="form-group">
        <label>${label}</label>
        <select class="char-select" data-path="${path}">
          ${options.map(opt => `
            <option value="${opt}" ${value === opt ? 'selected' : ''}>
              ${opt.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          `).join('')}
        </select>
        ${value === 'custom' ? `
          <input type="text" 
                 class="custom-text-input" 
                 data-path="${customPath}" 
                 value="${customValue}" 
                 placeholder="Enter custom ${label.toLowerCase()}...">
        ` : ''}
      </div>
    `;
  }

  renderSlider(path, label, minLabel, maxLabel) {
    const value = this.creator.getAttribute(path);
    return `
      <div class="slider-group">
        <label>${label}</label>
        <div class="slider-labels">
          <span>${minLabel}</span>
          <span>${maxLabel}</span>
        </div>
        <input type="range" min="0" max="100" value="${value}" class="char-slider" data-path="${path}">
        <div class="slider-value">${value}</div>
      </div>
    `;
  }

  renderCheckbox(path, label, allowCustom = false) {
    const value = this.creator.getAttribute(path);
    const customPath = path + 'Custom';
    const customValue = this.creator.getAttribute(customPath) || '';
    
    return `
      <div class="checkbox-group">
        <label>
          <input type="checkbox" 
                 class="char-checkbox" 
                 data-path="${path}" 
                 data-allow-custom="${allowCustom}"
                 ${value ? 'checked' : ''}>
          ${label}
        </label>
        ${allowCustom && value ? `
          <input type="text" 
                 class="custom-text-input" 
                 data-path="${customPath}" 
                 value="${customValue}" 
                 placeholder="Describe ${label.toLowerCase()}...">
        ` : ''}
      </div>
    `;
  }

  renderSkillPoints() {
    const skills = this.creator.currentCharacter.skills;
    const backgroundBonuses = this.creator.getBackgroundBonuses();
    const manualPoints = {};
    
    // Calculate manual points (total - background bonus)
    Object.keys(skills).forEach(skill => {
      const bonus = backgroundBonuses[skill] || 0;
      manualPoints[skill] = skills[skill] - bonus;
    });
    
    const totalManual = Object.values(manualPoints).reduce((a, b) => a + b, 0);
    // Custom background gets 11 points, others get 7
    const maxPoints = this.creator.currentCharacter.background === 'custom' ? 11 : 7;
    const remaining = maxPoints - totalManual;
    
    return `
      <div class="skills-remaining">Manual Points Remaining: <strong>${remaining}</strong> / ${maxPoints}</div>
      <div class="skills-grid">
        ${Object.keys(skills).map(skill => {
          const bonus = backgroundBonuses[skill] || 0;
          const manual = manualPoints[skill];
          return `
            <div class="skill-item">
              <label>${skill.replace(/\b\w/g, l => l.toUpperCase())}</label>
              <div class="skill-breakdown">
                ${bonus > 0 ? `<span class="skill-bonus">+${bonus} (background)</span>` : ''}
              </div>
              <div class="skill-controls">
                <button type="button" class="skill-btn" data-skill="${skill}" data-action="decrease">−</button>
                <span class="skill-value">${skills[skill]}</span>
                <button type="button" class="skill-btn" data-skill="${skill}" data-action="increase">+</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  getBackgroundDescription() {
    const backgrounds = {
      tourist: 'You were on vacation when disaster struck. Resourceful but unprepared. +2 Charisma, +1 Crafting. Trait: Quick Learner',
      sailor: 'Experienced seafarer who knows the ocean well. Strong and capable. +2 Survival, +2 Combat. Trait: Sea Legs',
      scientist: 'Here on a research expedition. Intelligent and analytical. +2 Medical, +2 Crafting. Trait: Analytical Mind',
      criminal: 'Fleeing the law when you crashed. Street-smart and dangerous. +2 Combat, +1 Charisma, +1 Survival. Trait: Streetwise',
      drifter: 'Wanderer with no roots, used to hardship and solitude. +2 Survival, +1 Crafting, +1 Leadership. Trait: Self-Reliant',
      pilot: 'Your plane went down. Technical skills and leadership. +2 Crafting, +1 Leadership, +1 Charisma. Trait: Cool Under Pressure',
      custom: 'Create your own unique background story. No preset bonuses or trait, but you get 11 skill points to allocate freely (instead of 7)!'
    };
    return backgrounds[this.creator.currentCharacter.background] || '';
  }

  attachEventListeners() {
    // Navigation
    const nextBtn = document.getElementById('next-step-btn');
    const prevBtn = document.getElementById('prev-step-btn');
    const confirmBtn = document.getElementById('confirm-character-btn');
    const randomizeBtn = document.getElementById('randomize-btn');
    
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextStep());
    if (prevBtn) prevBtn.addEventListener('click', () => this.prevStep());
    if (confirmBtn) confirmBtn.addEventListener('click', () => this.confirmCharacter());
    if (randomizeBtn) {
      randomizeBtn.addEventListener('click', () => {
        this.creator.randomizeStep(this.currentStep);
        this.render();
      });
    }
    
    // Step 1: Gender selection
    document.querySelectorAll('.gender-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const gender = e.currentTarget.dataset.gender;
        this.creator.setGender(gender);
        this.render();
      });
    });
    
    // Step 2: Preset/Custom selection
    document.querySelectorAll('.method-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const method = e.currentTarget.dataset.method;
        this.usePreset = (method === 'preset');
        this.render();
      });
    });
    
    document.querySelectorAll('.preset-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const presetIndex = parseInt(e.currentTarget.dataset.preset);
        const gender = this.creator.currentCharacter.gender;
        this.creator.applyPreset(gender, presetIndex);
        this.render();
      });
    });
    
    // Step 3: Appearance customization
    document.querySelectorAll('.char-select').forEach(select => {
      select.addEventListener('change', (e) => {
        this.creator.updateAttribute(e.target.dataset.path, e.target.value);
        
        // Dynamically show/hide custom input without re-rendering
        const formGroup = e.target.closest('.form-group');
        const existingCustomInput = formGroup.querySelector('.custom-text-input');
        
        if (e.target.value === 'custom' && !existingCustomInput) {
          // Create and insert custom input
          const customPath = e.target.dataset.path + 'Custom';
          const customValue = this.creator.getAttribute(customPath) || '';
          const label = formGroup.querySelector('label').textContent;
          
          const customInput = document.createElement('input');
          customInput.type = 'text';
          customInput.className = 'custom-text-input';
          customInput.dataset.path = customPath;
          customInput.value = customValue;
          customInput.placeholder = `Enter custom ${label.toLowerCase()}...`;
          
          // Add input listener
          customInput.addEventListener('input', (e) => {
            this.creator.updateAttribute(e.target.dataset.path, e.target.value);
            this.updatePreview();
          });
          
          e.target.parentNode.appendChild(customInput);
          customInput.focus();
        } else if (e.target.value !== 'custom' && existingCustomInput) {
          // Remove custom input
          existingCustomInput.remove();
        }
        
        this.updatePreview();
        e.target.dataset.lastValue = e.target.value;
      });
    });
    
    document.querySelectorAll('.char-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        this.creator.updateAttribute(e.target.dataset.path, e.target.checked);
        
        // Dynamically show/hide custom input for checkboxes that support it
        const checkboxGroup = e.target.closest('.checkbox-group');
        const existingCustomInput = checkboxGroup.querySelector('.custom-text-input');
        
        // Check if this checkbox should have custom support by looking at the renderCheckbox call
        // For now, we'll check if the checkbox has a data-allow-custom attribute
        const allowCustom = e.target.dataset.allowCustom === 'true';
        
        if (e.target.checked && allowCustom && !existingCustomInput) {
          // Create and insert custom input
          const customPath = e.target.dataset.path + 'Custom';
          const customValue = this.creator.getAttribute(customPath) || '';
          const label = checkboxGroup.querySelector('label').textContent.trim();
          
          const customInput = document.createElement('input');
          customInput.type = 'text';
          customInput.className = 'custom-text-input';
          customInput.dataset.path = customPath;
          customInput.value = customValue;
          customInput.placeholder = `Describe ${label.toLowerCase()}...`;
          
          // Add input listener
          customInput.addEventListener('input', (e) => {
            this.creator.updateAttribute(e.target.dataset.path, e.target.value);
            this.updatePreview();
          });
          
          checkboxGroup.appendChild(customInput);
          customInput.focus();
        } else if (!e.target.checked && existingCustomInput) {
          // Remove custom input when unchecked
          existingCustomInput.remove();
        }
        
        this.updatePreview();
      });
    });
    
    // Custom text inputs
    document.querySelectorAll('.custom-text-input').forEach(input => {
      input.addEventListener('input', (e) => {
        this.creator.updateAttribute(e.target.dataset.path, e.target.value);
        this.updatePreview();
      });
    });
    
    // Step 4: Personality sliders
    document.querySelectorAll('.char-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        this.creator.updateAttribute(e.target.dataset.path, value);
        e.target.nextElementSibling.textContent = value;
      });
    });
    
    // Step 4: Background
    const nameInput = document.getElementById('char-name');
    const ageInput = document.getElementById('char-age');
    
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        this.creator.updateAttribute('name', e.target.value);
        this.updatePreview();
      });
    }
    
    if (ageInput) {
      ageInput.addEventListener('change', (e) => {
        const age = Math.max(18, parseInt(e.target.value));
        this.creator.updateAttribute('age', age);
        e.target.value = age;
        this.updatePreview();
      });
    }
    
    // Skill allocation buttons
    document.querySelectorAll('.skill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const skill = e.target.dataset.skill;
        const action = e.target.dataset.action;
        
        let changed = false;
        if (action === 'increase') {
          changed = this.creator.addManualSkillPoint(skill);
        } else if (action === 'decrease') {
          changed = this.creator.removeManualSkillPoint(skill);
        }
        
        // Only update the skills section instead of full re-render
        if (changed) {
          this.updateSkillsDisplay();
        }
      });
    });
    
    // Step 5: Portrait generation
    const generateBtn = document.getElementById('generate-portrait-btn');
    if (generateBtn) {
      generateBtn.addEventListener('click', async () => {
        generateBtn.disabled = true;
        generateBtn.textContent = '⏳ Generating...';
        
        try {
          await this.creator.generatePortrait(this.ai);
          this.render();
        } catch (error) {
          alert('Failed to generate portrait. Please try again.');
          console.error(error);
        }
      });
    }
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.render();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.render();
    }
  }

  async confirmCharacter() {
    const validation = this.creator.validateCharacter();
    
    if (!validation.valid) {
      alert('Please complete all required fields:\n' + validation.errors.join('\n'));
      return;
    }
    
    // Save character to game state
    const character = this.creator.getCharacter();
    this.gameState.state.player = {
      ...this.gameState.state.player,
      ...character
    };
    
    // Hide character creation
    this.hide();
    
    // Start the game
    this.gameState.emit('characterCreated', character);
  }

  updateSkillsDisplay() {
    // Update just the skills section without full re-render
    const skillsContainer = document.querySelector('.skills-allocation');
    if (skillsContainer) {
      const newSkillsHTML = `
        <h3>Starting Skills</h3>
        <p class="skills-info">Your background determines your starting skill bonuses</p>
        ${this.renderSkillPoints()}
      `;
      skillsContainer.innerHTML = newSkillsHTML;
      
      // Re-attach event listeners to the new buttons
      skillsContainer.querySelectorAll('.skill-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const skill = e.target.dataset.skill;
          const action = e.target.dataset.action;
          
          let changed = false;
          if (action === 'increase') {
            changed = this.creator.addManualSkillPoint(skill);
          } else if (action === 'decrease') {
            changed = this.creator.removeManualSkillPoint(skill);
          }
          
          if (changed) {
            this.updateSkillsDisplay();
            this.updatePreview();
          }
        });
      });
    }
  }
  
  updatePreview() {
    // Update just the preview panel without full re-render
    const previewPanel = document.querySelector('.char-preview-panel');
    if (!previewPanel) return;
    
    const preview = this.creator.getPreviewSummary();
    const previewContent = previewPanel.querySelector('.preview-content');
    
    if (previewContent) {
      previewContent.innerHTML = `
        <div class="preview-field">
          <span class="preview-label">Name:</span>
          <span class="preview-value ${!preview.name || preview.name === 'Unnamed' ? 'preview-missing' : ''}">${preview.name}</span>
        </div>
        <div class="preview-field">
          <span class="preview-label">Age:</span>
          <span class="preview-value">${preview.age}</span>
        </div>
        <div class="preview-field">
          <span class="preview-label">Gender:</span>
          <span class="preview-value">${preview.gender.charAt(0).toUpperCase() + preview.gender.slice(1)}</span>
        </div>
        <div class="preview-field">
          <span class="preview-label">Description:</span>
          <span class="preview-value">${preview.description || 'Not yet defined'}</span>
        </div>
        <div class="preview-field">
          <span class="preview-label">Background:</span>
          <span class="preview-value">${preview.background.charAt(0).toUpperCase() + preview.background.slice(1)}</span>
        </div>
        
        <div class="preview-section">
          <h4>Skills</h4>
          ${Object.entries(preview.skills).map(([skill, value]) => `
            <div class="preview-skill">
              <span>${skill.charAt(0).toUpperCase() + skill.slice(1)}</span>
              <span class="skill-dots">${'●'.repeat(value)}${'○'.repeat(Math.max(0, 10 - value))}</span>
            </div>
          `).join('')}
        </div>
        
        ${preview.traits.length > 0 ? `
          <div class="preview-section">
            <h4>Traits</h4>
            <div class="preview-traits">
              ${preview.traits.map(trait => `<span class="trait-badge">${trait}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      `;
    }
  }
}
