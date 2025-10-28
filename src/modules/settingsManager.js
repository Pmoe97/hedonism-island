/**
 * SettingsManager - Manages game settings and preferences
 * Handles gender distribution, kink toggles, AI styles, difficulty, etc.
 */

export class SettingsManager {
  constructor() {
    // Default settings
    this.settings = {
      // Gender distribution per faction (percentages, must sum to 100)
      genderDistribution: {
        castaways: {
          female: 50,
          male: 30,
          futanari: 10,
          transWoman: 5,
          transMale: 5
        },
        islanders: {
          female: 50,
          male: 30,
          futanari: 10,
          transWoman: 5,
          transMale: 5
        },
        mercenaries: {
          female: 20,
          male: 60,
          futanari: 10,
          transWoman: 5,
          transMale: 5
        },
        tourists: {
          female: 50,
          male: 30,
          futanari: 10,
          transWoman: 5,
          transMale: 5
        }
      },

      // NPC disposition sliders (0-100)
      npcDisposition: {
        friendliness: 50,      // 0=hostile, 100=friendly
        romanceInterest: 70,   // 0=not interested, 100=very interested
        sexualOpenness: 80,    // 0=prude, 100=complete horndog
        hostility: 20,         // 0=peaceful, 100=aggressive
        submissiveness: 50     // 0=dominant, 100=submissive
      },

      // AI Image generation style
      aiImageStyle: {
        preset: 'photo-realistic', // or 'anime', 'painterly', etc.
        custom: '' // Custom style keywords if preset is 'custom'
      },

      // Available presets
      aiImageStylePresets: [
        'photo-realistic',
        'anime',
        'manga',
        'painterly',
        'watercolor',
        'cartoon',
        'comic-book',
        'cinematic',
        'professional-studio',
        'fantasy-art',
        'pixel-art',
        '3d-render',
        'custom'
      ],

      // Difficulty settings
      difficulty: {
        survival: 'normal',    // easy, normal, hard, hardcore
        combat: 'normal',      // easy, normal, hard, permadeath
        economy: 'normal'      // generous, normal, challenging
      },

      // Gameplay toggles
      gameplay: {
        permadeath: false,
        autosaveFrequency: 5,  // minutes
        tutorialEnabled: true,
        explicitContent: 'full', // full, fade-to-black, off
        bloodViolence: 'full',   // full, reduced, off
        eventPacing: 'normal'    // slow, normal, fast
      },

      // Cheat panel
      cheats: {
        godMode: false,
        infiniteHealth: false,
        infiniteEnergy: false,
        infiniteResources: false,
        noHungerThirst: false,
        relationshipMultiplier: 1.0,  // 0.1 - 10.0
        resourceMultiplier: 1.0       // 0.5 - 10.0
      },

      // Content preferences (kinks)
      contentPreferences: {
        vanillaRomance: true,
        bdsm: false,
        submission: false,
        groupScenes: false,
        publicExhibition: false,
        voyeurism: false,
        breedingPregnancy: false,
        nonConDubCon: false,
        furryMonster: false,
        feet: false,
        lactation: false,
        ageGap: false,
        interracial: true,
        surpriseMe: false  // Random kink inclusion
      },

      // Accessibility
      accessibility: {
        textSize: 'medium',        // small, medium, large, extra-large
        colorblindMode: 'none',    // none, protanopia, deuteranopia, tritanopia
        screenReader: false,
        animations: 'full',        // full, reduced, off
        autoAdvanceText: false,
        autoAdvanceSpeed: 3        // 1-5 seconds
      }
    };

    this.load();
  }

  /**
   * Save settings to localStorage
   */
  save() {
    try {
      localStorage.setItem('hedonism_settings', JSON.stringify(this.settings));
      return true;
    } catch (e) {
      console.error('Failed to save settings:', e);
      return false;
    }
  }

  /**
   * Load settings from localStorage
   */
  load() {
    try {
      const saved = localStorage.getItem('hedonism_settings');
      if (saved) {
        const loadedSettings = JSON.parse(saved);
        // Merge with defaults to handle new settings
        this.settings = this.deepMerge(this.settings, loadedSettings);
      }
      return true;
    } catch (e) {
      console.error('Failed to load settings:', e);
      return false;
    }
  }

  /**
   * Deep merge two objects
   */
  deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  /**
   * Get specific setting
   */
  get(path) {
    const keys = path.split('.');
    let value = this.settings;
    for (const key of keys) {
      value = value[key];
      if (value === undefined) return null;
    }
    return value;
  }

  /**
   * Set specific setting
   */
  set(path, value) {
    const keys = path.split('.');
    let obj = this.settings;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    this.save();
  }

  /**
   * Get gender for random NPC generation
   */
  getRandomGender(faction = 'castaways') {
    const distribution = this.settings.genderDistribution[faction];
    const rand = Math.random() * 100;
    
    let cumulative = 0;
    for (const [gender, percentage] of Object.entries(distribution)) {
      cumulative += percentage;
      if (rand <= cumulative) {
        return gender;
      }
    }
    
    return 'female'; // Fallback
  }

  /**
   * Get AI image style string for prompt
   */
  getAIImageStyle() {
    const style = this.settings.aiImageStyle;
    if (style.preset === 'custom') {
      return style.custom;
    }
    
    // Convert preset to prompt-friendly string
    const styleMap = {
      'photo-realistic': 'photorealistic, professional photography, high quality',
      'anime': 'anime style, manga art, japanese animation',
      'manga': 'manga style, black and white, detailed lineart',
      'painterly': 'oil painting, painterly style, artistic',
      'watercolor': 'watercolor painting, soft colors, artistic',
      'cartoon': 'cartoon style, animated, colorful',
      'comic-book': 'comic book style, bold lines, pop art',
      'cinematic': 'cinematic, film still, dramatic lighting',
      'professional-studio': 'professional studio photography, high end, glamorous',
      'fantasy-art': 'fantasy art, epic, detailed illustration',
      'pixel-art': 'pixel art, retro, 8-bit style',
      '3d-render': '3d render, cgi, digital art'
    };
    
    return styleMap[style.preset] || styleMap['photo-realistic'];
  }

  /**
   * Check if specific kink is enabled
   */
  isKinkEnabled(kinkName) {
    return this.settings.contentPreferences[kinkName] || false;
  }

  /**
   * Get active kinks list
   */
  getActiveKinks() {
    return Object.entries(this.settings.contentPreferences)
      .filter(([key, value]) => value && key !== 'surpriseMe')
      .map(([key]) => key);
  }

  /**
   * Apply difficulty modifiers
   */
  getDifficultyMultipliers() {
    const survival = this.settings.difficulty.survival;
    const combat = this.settings.difficulty.combat;
    
    const multipliers = {
      hungerDrain: 1.0,
      thirstDrain: 1.0,
      energyDrain: 1.0,
      resourceYield: 1.0,
      enemyStrength: 1.0,
      deathRisk: 0.01 // 1% base death chance in combat
    };
    
    // Survival difficulty
    switch (survival) {
      case 'easy':
        multipliers.hungerDrain = 0.5;
        multipliers.thirstDrain = 0.5;
        multipliers.energyDrain = 0.5;
        multipliers.resourceYield = 1.5;
        break;
      case 'hard':
        multipliers.hungerDrain = 1.5;
        multipliers.thirstDrain = 1.5;
        multipliers.energyDrain = 1.5;
        multipliers.resourceYield = 0.7;
        break;
      case 'hardcore':
        multipliers.hungerDrain = 2.0;
        multipliers.thirstDrain = 2.0;
        multipliers.energyDrain = 2.0;
        multipliers.resourceYield = 0.5;
        break;
    }
    
    // Combat difficulty
    switch (combat) {
      case 'easy':
        multipliers.enemyStrength = 0.7;
        multipliers.deathRisk = 0.001; // 0.1%
        break;
      case 'hard':
        multipliers.enemyStrength = 1.3;
        multipliers.deathRisk = 0.05; // 5%
        break;
      case 'permadeath':
        multipliers.enemyStrength = 1.5;
        multipliers.deathRisk = 0.1; // 10%
        break;
    }
    
    // Apply cheat multipliers
    if (this.settings.cheats.resourceMultiplier !== 1.0) {
      multipliers.resourceYield *= this.settings.cheats.resourceMultiplier;
    }
    
    return multipliers;
  }

  /**
   * Reset settings to defaults
   */
  reset() {
    localStorage.removeItem('hedonism_settings');
    this.settings = this.constructor.prototype.settings;
    return true;
  }

  /**
   * Export settings to JSON
   */
  export() {
    const dataStr = JSON.stringify(this.settings, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hedonism_settings.json';
    a.click();
    
    URL.revokeObjectURL(url);
  }

  /**
   * Import settings from JSON
   */
  import(fileContent) {
    try {
      const imported = JSON.parse(fileContent);
      this.settings = this.deepMerge(this.settings, imported);
      this.save();
      return true;
    } catch (e) {
      console.error('Failed to import settings:', e);
      return false;
    }
  }
}
