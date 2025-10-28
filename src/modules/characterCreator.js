/**
 * Character Creator Module
 * Handles player character creation with presets and detailed customization
 */

export class CharacterCreator {
  constructor() {
    this.currentCharacter = this.getDefaultCharacter();
    this.presets = this.loadPresets();
    this.backgroundBonuses = {};
    this.manualSkillPoints = {
      survival: 0,
      combat: 0,
      charisma: 0,
      crafting: 0,
      medical: 0,
      leadership: 0
    };
  }

  getDefaultCharacter() {
    return {
      // Basic Info
      name: '',
      age: 25,
      gender: 'female', // female, male, futanari, Cuntboy, other
      
      // Physical Appearance
      body: {
        height: 'average', // petite, short, average, tall, very-tall, custom
        heightCustom: '',
        build: 'average', // skinny, slim, average, athletic, curvy, muscular, heavyset, custom
        buildCustom: '',
        skinTone: 'tan', // pale, fair, tan, olive, brown, dark, custom
        skinToneCustom: '',
        
        // Face
        faceShape: 'oval', // oval, round, square, heart, diamond, custom
        faceShapeCustom: '',
        eyeColor: 'brown', // brown, blue, green, hazel, gray, amber, heterochromia, custom
        eyeColorCustom: '',
        eyeShape: 'almond', // almond, round, hooded, upturned, downturned, custom
        eyeShapeCustom: '',
        hairColor: 'brown', // black, brown, blonde, red, auburn, gray, white, unusual, custom
        hairColorCustom: '',
        hairLength: 'shoulder', // buzzed, short, shoulder, long, very-long, custom
        hairLengthCustom: '',
        hairStyle: 'straight', // straight, wavy, curly, kinky, braided, tied-up, custom
        hairStyleCustom: '',
        
        // Body Features
        breastSize: 'medium', // flat, small, medium, large, very-large, huge, custom
        breastSizeCustom: '',
        buttSize: 'medium', // small, medium, large, very-large, custom
        buttSizeCustom: '',
        muscleTone: 'average', // soft, toned, average, muscular, very-muscular, custom
        muscleToneCustom: '',
        
        // Distinctive Features
        scars: 'none', // none, few, many, prominent, custom
        scarsCustom: '',
        scarLocation: null, // face, chest, back, arms, legs, custom
        scarLocationCustom: '',
        birthmarks: false,
        birthmarksCustom: '', // Custom description if birthmarks = true
        freckles: 'none', // none, light, moderate, heavy, custom
        frecklesCustom: '',
        beautyMark: false,
        beautyMarkCustom: '', // Custom description if beautyMark = true
        distinctiveFeaturesCustom: '', // General custom distinctive features
        
        // Genitals (explicit customization)
        primaryGenitals: 'vagina', // penis, vagina, both
        secondaryGenitals: null, // null, penis, vagina (for futanari/andromorph)
        
        // Penis details (if applicable)
        penisSize: 'average', // small, average, large, very-large, huge, custom
        penisSizeCustom: '',
        penisGirth: 'average', // thin, average, thick, very-thick, custom
        penisGirthCustom: '',
        circumcised: false,
        
        // Vagina details (if applicable)
        vaginaTightness: 'average', // tight, average, loose, custom
        vaginaTightnessCustom: '',
        vaginaDepth: 'average', // shallow, average, deep, custom
        vaginaDepthCustom: '',
        
        // Other
        pubicHair: 'trimmed', // none, trimmed, natural, styled, custom
        pubicHairCustom: '',
        bodyHair: 'minimal', // none, minimal, average, hairy, custom
        bodyHairCustom: '',
        tattoos: 'none', // none, few, many, custom
        tattoosCustom: '',
        piercings: 'none', // none, ears, face, body, nipples, genital, multiple, custom
        piercingsCustom: ''
      },
      
      // Personality Traits (developed through gameplay, start neutral)
      personality: {
        dominance: 50, // 0-100 (submissive to dominant)
        openness: 50, // 0-100 (reserved to promiscuous)
        morality: 50, // 0-100 (cruel to kind)
        confidence: 50, // 0-100 (shy to confident)
        intelligence: 50, // 0-100 (simple to clever)
        aggression: 50 // 0-100 (passive to aggressive)
      },
      
      // Background & Skills
      background: 'tourist', // tourist, sailor, scientist, criminal, drifter, pilot
      traits: [], // Special traits from background and achievements
      skills: {
        survival: 0,
        combat: 0,
        charisma: 0,
        crafting: 0,
        medical: 0,
        leadership: 0
      },
      
      // Sexual Preferences & Experience
      sexualProfile: {
        experience: 'experienced', // virgin, inexperienced, experienced, veteran
        preferredRole: 'versatile', // dominant, submissive, versatile, switch
        virginityStatus: {
          vaginal: false, // Only applies if has vagina
          anal: false,
          oral: false
        },
        kinks: [], // Will be populated from settings
        turnOns: [], // Specific preferences
        limits: [] // Hard no's
      },
      
      // Generated Portrait
      portraitUrl: null,
      portraitPrompt: ''
    };
  }

  loadPresets() {
    return {
      female: [
        {
          name: 'Beach Babe',
          description: 'Curvy, confident surfer girl with sun-kissed skin',
          character: {
            age: 23,
            gender: 'female',
            body: {
              height: 'average',
              build: 'curvy',
              skinTone: 'tan',
              faceShape: 'heart',
              eyeColor: 'blue',
              eyeShape: 'almond',
              hairColor: 'blonde',
              hairLength: 'long',
              hairStyle: 'wavy',
              breastSize: 'large',
              buttSize: 'large',
              muscleTone: 'toned',
              primaryGenitals: 'vagina',
              secondaryGenitals: null,
              vaginaTightness: 'average',
              vaginaDepth: 'average',
              pubicHair: 'trimmed',
              bodyHair: 'none',
              tattoos: 'few',
              piercings: 'ears'
            },
            personality: {
              dominance: 60,
              openness: 70,
              morality: 50,
              confidence: 75,
              intelligence: 50,
              aggression: 40
            },
            background: 'tourist',
            skills: { survival: 1, charisma: 3, crafting: 1 }
          }
        },
        {
          name: 'Jungle Explorer',
          description: 'Athletic researcher with a curious mind',
          character: {
            age: 28,
            gender: 'female',
            body: {
              height: 'tall',
              build: 'athletic',
              skinTone: 'olive',
              faceShape: 'oval',
              eyeColor: 'green',
              eyeShape: 'upturned',
              hairColor: 'brown',
              hairLength: 'shoulder',
              hairStyle: 'tied-up',
              breastSize: 'medium',
              buttSize: 'medium',
              muscleTone: 'muscular',
              primaryGenitals: 'vagina',
              secondaryGenitals: null,
              vaginaTightness: 'tight',
              vaginaDepth: 'average',
              pubicHair: 'natural',
              bodyHair: 'minimal',
              tattoos: 'none',
              piercings: 'none'
            },
            personality: {
              dominance: 55,
              openness: 50,
              morality: 65,
              confidence: 70,
              intelligence: 80,
              aggression: 45
            },
            background: 'scientist',
            skills: { survival: 3, medical: 2, crafting: 2 }
          }
        },
        {
          name: 'Island Siren',
          description: 'Seductive beauty with dangerous charm',
          character: {
            age: 26,
            gender: 'female',
            body: {
              height: 'average',
              build: 'slim',
              skinTone: 'fair',
              faceShape: 'diamond',
              eyeColor: 'hazel',
              eyeShape: 'hooded',
              hairColor: 'red',
              hairLength: 'very-long',
              hairStyle: 'straight',
              breastSize: 'medium',
              buttSize: 'medium',
              muscleTone: 'soft',
              primaryGenitals: 'vagina',
              secondaryGenitals: null,
              vaginaTightness: 'average',
              vaginaDepth: 'deep',
              pubicHair: 'none',
              bodyHair: 'none',
              tattoos: 'many',
              piercings: 'multiple'
            },
            personality: {
              dominance: 70,
              openness: 85,
              morality: 30,
              confidence: 85,
              intelligence: 65,
              aggression: 55
            },
            background: 'criminal',
            skills: { charisma: 4, combat: 2, survival: 1 }
          }
        }
      ],
      male: [
        {
          name: 'Rugged Survivor',
          description: 'Strong, capable man built for the wilderness',
          character: {
            age: 32,
            gender: 'male',
            body: {
              height: 'tall',
              build: 'muscular',
              skinTone: 'tan',
              faceShape: 'square',
              eyeColor: 'brown',
              eyeShape: 'almond',
              hairColor: 'brown',
              hairLength: 'short',
              hairStyle: 'straight',
              breastSize: 'flat',
              buttSize: 'medium',
              muscleTone: 'very-muscular',
              primaryGenitals: 'penis',
              secondaryGenitals: null,
              penisSize: 'large',
              penisGirth: 'thick',
              circumcised: true,
              pubicHair: 'trimmed',
              bodyHair: 'average',
              tattoos: 'few',
              piercings: 'none'
            },
            personality: {
              dominance: 70,
              openness: 50,
              morality: 60,
              confidence: 75,
              intelligence: 55,
              aggression: 65
            },
            background: 'sailor',
            skills: { survival: 3, combat: 3, crafting: 2 }
          }
        },
        {
          name: 'Smooth Talker',
          description: 'Charismatic and charming ladies man',
          character: {
            age: 27,
            gender: 'male',
            body: {
              height: 'average',
              build: 'athletic',
              skinTone: 'olive',
              faceShape: 'oval',
              eyeColor: 'blue',
              eyeShape: 'upturned',
              hairColor: 'black',
              hairLength: 'short',
              hairStyle: 'styled',
              breastSize: 'flat',
              buttSize: 'small',
              muscleTone: 'toned',
              primaryGenitals: 'penis',
              secondaryGenitals: null,
              penisSize: 'average',
              penisGirth: 'average',
              circumcised: false,
              pubicHair: 'trimmed',
              bodyHair: 'minimal',
              tattoos: 'none',
              piercings: 'ears'
            },
            personality: {
              dominance: 50,
              openness: 75,
              morality: 50,
              confidence: 80,
              intelligence: 70,
              aggression: 35
            },
            background: 'tourist',
            skills: { charisma: 4, survival: 1, medical: 1 }
          }
        },
        {
          name: 'Brutal Fighter',
          description: 'Aggressive warrior with no mercy',
          character: {
            age: 35,
            gender: 'male',
            body: {
              height: 'very-tall',
              build: 'muscular',
              skinTone: 'brown',
              faceShape: 'square',
              eyeColor: 'gray',
              eyeShape: 'downturned',
              hairColor: 'black',
              hairLength: 'buzzed',
              hairStyle: 'straight',
              breastSize: 'flat',
              buttSize: 'medium',
              muscleTone: 'very-muscular',
              primaryGenitals: 'penis',
              secondaryGenitals: null,
              penisSize: 'very-large',
              penisGirth: 'very-thick',
              circumcised: true,
              pubicHair: 'natural',
              bodyHair: 'hairy',
              tattoos: 'many',
              piercings: 'body'
            },
            personality: {
              dominance: 90,
              openness: 60,
              morality: 20,
              confidence: 85,
              intelligence: 40,
              aggression: 90
            },
            background: 'criminal',
            skills: { combat: 4, survival: 2, leadership: 1 }
          }
        }
      ],
      futanari: [
        {
          name: 'Exotic Beauty',
          description: 'Stunning futanari with feminine grace and masculine power',
          character: {
            age: 24,
            gender: 'futanari',
            body: {
              height: 'tall',
              build: 'curvy',
              skinTone: 'tan',
              faceShape: 'heart',
              eyeColor: 'amber',
              eyeShape: 'almond',
              hairColor: 'unusual',
              hairLength: 'long',
              hairStyle: 'straight',
              breastSize: 'large',
              buttSize: 'large',
              muscleTone: 'toned',
              primaryGenitals: 'both',
              secondaryGenitals: null,
              penisSize: 'large',
              penisGirth: 'thick',
              circumcised: false,
              vaginaTightness: 'tight',
              vaginaDepth: 'average',
              pubicHair: 'trimmed',
              bodyHair: 'none',
              tattoos: 'few',
              piercings: 'multiple'
            },
            personality: {
              dominance: 75,
              openness: 80,
              morality: 50,
              confidence: 80,
              intelligence: 60,
              aggression: 50
            },
            background: 'tourist',
            skills: { charisma: 3, survival: 1, combat: 2 }
          }
        }
      ],
      Cuntboy: [
        {
          name: 'Tough Guy',
          description: 'Masculine build with unexpected anatomy',
          character: {
            age: 29,
            gender: 'Cuntboy',
            body: {
              height: 'tall',
              build: 'muscular',
              skinTone: 'fair',
              faceShape: 'square',
              eyeColor: 'blue',
              eyeShape: 'almond',
              hairColor: 'blonde',
              hairLength: 'short',
              hairStyle: 'straight',
              breastSize: 'flat',
              buttSize: 'medium',
              muscleTone: 'very-muscular',
              primaryGenitals: 'vagina',
              secondaryGenitals: null,
              vaginaTightness: 'tight',
              vaginaDepth: 'shallow',
              pubicHair: 'trimmed',
              bodyHair: 'average',
              tattoos: 'few',
              piercings: 'none'
            },
            personality: {
              dominance: 65,
              openness: 55,
              morality: 55,
              confidence: 70,
              intelligence: 50,
              aggression: 70
            },
            background: 'sailor',
            skills: { combat: 3, survival: 2, crafting: 2 }
          }
        }
      ],
      other: [
        {
          name: 'Mysterious Stranger',
          description: 'Androgynous beauty defying categorization',
          character: {
            age: 25,
            gender: 'other',
            body: {
              height: 'average',
              build: 'slim',
              skinTone: 'pale',
              faceShape: 'oval',
              eyeColor: 'heterochromia',
              eyeShape: 'round',
              hairColor: 'unusual',
              hairLength: 'shoulder',
              hairStyle: 'wavy',
              breastSize: 'small',
              buttSize: 'small',
              muscleTone: 'soft',
              primaryGenitals: 'vagina',
              secondaryGenitals: null,
              vaginaTightness: 'average',
              vaginaDepth: 'average',
              pubicHair: 'styled',
              bodyHair: 'none',
              tattoos: 'many',
              piercings: 'multiple'
            },
            personality: {
              dominance: 50,
              openness: 70,
              morality: 60,
              confidence: 60,
              intelligence: 75,
              aggression: 40
            },
            background: 'scientist',
            skills: { medical: 2, crafting: 2, charisma: 2 }
          }
        }
      ]
    };
  }

  getPresetsForGender(gender) {
    return this.presets[gender] || [];
  }

  applyPreset(gender, presetIndex) {
    const presets = this.getPresetsForGender(gender);
    if (presets[presetIndex]) {
      const preset = JSON.parse(JSON.stringify(presets[presetIndex].character));
      const defaultChar = this.getDefaultCharacter();
      
      // Apply preset but keep personality at neutral (50)
      // Properly merge skills to keep all 6 skills
      this.currentCharacter = {
        ...defaultChar,
        ...preset,
        skills: {
          ...defaultChar.skills,  // Start with all 6 skills at 0
          ...preset.skills        // Override with preset values
        },
        personality: {
          dominance: 50,
          openness: 50,
          morality: 50,
          confidence: 50,
          intelligence: 50,
          aggression: 50
        }
      };
      return true;
    }
    return false;
  }

  setGender(gender) {
    this.currentCharacter.gender = gender;
    
    // Set default name if empty
    if (!this.currentCharacter.name) {
      this.currentCharacter.name = this.getDefaultName(gender);
    }
    
    // Adjust body defaults based on gender
    if (gender === 'male' || gender === 'Cuntboy') {
      this.currentCharacter.body.breastSize = 'flat';
      this.currentCharacter.body.build = 'athletic';
    }
    
    if (gender === 'male') {
      this.currentCharacter.body.primaryGenitals = 'penis';
    } else if (gender === 'female') {
      this.currentCharacter.body.primaryGenitals = 'vagina';
    } else if (gender === 'futanari') {
      this.currentCharacter.body.primaryGenitals = 'both';
    } else if (gender === 'Cuntboy') {
      this.currentCharacter.body.primaryGenitals = 'vagina';
    }
  }
  
  getDefaultName(gender) {
    const defaultNames = {
      female: 'Isla',
      male: 'Kai',
      futanari: 'Sage',
      Cuntboy: 'River',
      other: 'Quinn'
    };
    return defaultNames[gender] || 'Survivor';
  }

  updateAttribute(path, value) {
    const keys = path.split('.');
    let obj = this.currentCharacter;
    
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    
    obj[keys[keys.length - 1]] = value;
    
    // Apply background bonuses when background changes
    if (path === 'background') {
      this.applyBackgroundBonuses(value);
    }
  }
  
  applyBackgroundBonuses(background) {
    // Reset background bonuses
    this.backgroundBonuses = {
      survival: 0,
      combat: 0,
      charisma: 0,
      crafting: 0,
      medical: 0,
      leadership: 0
    };
    
    // Reset traits
    this.currentCharacter.traits = [];
    
    // Define bonuses for each background
    const bonuses = {
      tourist: {
        skills: { charisma: 2, crafting: 1 },
        trait: 'Quick Learner'
      },
      sailor: {
        skills: { survival: 2, combat: 2 },
        trait: 'Sea Legs'
      },
      scientist: {
        skills: { medical: 2, crafting: 2 },
        trait: 'Analytical Mind'
      },
      criminal: {
        skills: { combat: 2, charisma: 1, survival: 1 },
        trait: 'Streetwise'
      },
      drifter: {
        skills: { survival: 2, crafting: 1, leadership: 1 },
        trait: 'Self-Reliant'
      },
      pilot: {
        skills: { crafting: 2, leadership: 1, charisma: 1 },
        trait: 'Cool Under Pressure'
      },
      custom: {
        skills: {},  // No background bonuses
        trait: null  // No trait
      }
    };
    
    const bonus = bonuses[background];
    if (bonus) {
      // Store background bonuses
      Object.keys(bonus.skills).forEach(skill => {
        this.backgroundBonuses[skill] = bonus.skills[skill];
      });
      
      // Apply trait if it exists
      if (bonus.trait) {
        this.currentCharacter.traits.push(bonus.trait);
      }
    }
    
    // Recalculate total skills (background + manual)
    this.updateTotalSkills();
  }
  
  updateTotalSkills() {
    Object.keys(this.currentCharacter.skills).forEach(skill => {
      const backgroundBonus = this.backgroundBonuses[skill] || 0;
      const manualPoints = this.manualSkillPoints[skill] || 0;
      this.currentCharacter.skills[skill] = backgroundBonus + manualPoints;
    });
  }
  
  getBackgroundBonuses() {
    return { ...this.backgroundBonuses };
  }
  
  addManualSkillPoint(skill) {
    // Calculate current total manual points
    const totalManual = Object.values(this.manualSkillPoints).reduce((a, b) => a + b, 0);
    
    // Custom background gets 11 total points (7 base + 4 bonus), others get 7
    const maxPoints = this.currentCharacter.background === 'custom' ? 11 : 7;
    
    if (totalManual < maxPoints) {
      this.manualSkillPoints[skill]++;
      this.updateTotalSkills();
      return true;
    }
    return false;
  }
  
  removeManualSkillPoint(skill) {
    if (this.manualSkillPoints[skill] > 0) {
      this.manualSkillPoints[skill]--;
      this.updateTotalSkills();
      return true;
    }
    return false;
  }

  getAttribute(path) {
    const keys = path.split('.');
    let value = this.currentCharacter;
    
    for (const key of keys) {
      value = value[key];
      if (value === undefined) return null;
    }
    
    return value;
  }

  // Helper to get display value (use custom text if value is 'custom')
  getDisplayValue(value, customPath) {
    if (value === 'custom') {
      const customValue = this.getAttribute(customPath);
      return customValue || 'custom';
    }
    return value;
  }

  // Unified method that generates comprehensive character description
  // Used for both preview display AND portrait generation
  generateCharacterDescription() {
    const c = this.currentCharacter;
    const body = c.body;
    
    // Get all values, using custom text when applicable
    const height = this.getDisplayValue(body.height, 'body.heightCustom');
    const build = this.getDisplayValue(body.build, 'body.buildCustom');
    const skinTone = this.getDisplayValue(body.skinTone, 'body.skinToneCustom');
    const faceShape = this.getDisplayValue(body.faceShape, 'body.faceShapeCustom');
    const eyeColor = this.getDisplayValue(body.eyeColor, 'body.eyeColorCustom');
    const eyeShape = this.getDisplayValue(body.eyeShape, 'body.eyeShapeCustom');
    const hairColor = this.getDisplayValue(body.hairColor, 'body.hairColorCustom');
    const hairLength = this.getDisplayValue(body.hairLength, 'body.hairLengthCustom');
    const hairStyle = this.getDisplayValue(body.hairStyle, 'body.hairStyleCustom');
    const breastSize = this.getDisplayValue(body.breastSize, 'body.breastSizeCustom');
    const buttSize = this.getDisplayValue(body.buttSize, 'body.buttSizeCustom');
    const muscleTone = this.getDisplayValue(body.muscleTone, 'body.muscleToneCustom');
    
    // Distinctive features
    const scars = this.getDisplayValue(body.scars, 'body.scarsCustom');
    const scarLocation = this.getDisplayValue(body.scarLocation, 'body.scarLocationCustom');
    const freckles = this.getDisplayValue(body.freckles, 'body.frecklesCustom');
    const birthmarks = body.birthmarks ? (body.birthmarksCustom || 'birthmarks') : null;
    const beautyMark = body.beautyMark ? (body.beautyMarkCustom || 'beauty mark') : null;
    const tattoos = this.getDisplayValue(body.tattoos, 'body.tattoosCustom');
    const piercings = this.getDisplayValue(body.piercings, 'body.piercingsCustom');
    const pubicHair = this.getDisplayValue(body.pubicHair, 'body.pubicHairCustom');
    const bodyHair = this.getDisplayValue(body.bodyHair, 'body.bodyHairCustom');
    
    // Additional custom features
    const distinctiveFeaturesCustom = body.distinctiveFeaturesCustom || '';
    
    return {
      // Basic info
      age: c.age,
      gender: c.gender,
      name: c.name || 'Unnamed',
      
      // Body
      height,
      build,
      skinTone,
      faceShape,
      eyeColor,
      eyeShape,
      hairColor,
      hairLength,
      hairStyle,
      breastSize,
      buttSize,
      muscleTone,
      
      // Body hair
      pubicHair,
      bodyHair,
      
      // Distinctive features
      scars,
      scarLocation,
      freckles,
      birthmarks,
      beautyMark,
      tattoos,
      piercings,
      distinctiveFeaturesCustom,
      
      // Background
      background: c.background,
      backgroundCustom: body.backgroundCustom || '',
      
      // Skills and traits
      skills: { ...c.skills },
      traits: [...c.traits]
    };
  }

  // Generate AI portrait prompt from character description
  generatePortraitPrompt() {
    const desc = this.generateCharacterDescription();
    
    let prompt = `Full body portrait of a ${desc.age} year old ${desc.gender === 'other' ? 'androgynous person' : desc.gender}, `;
    
    // Build and physical appearance
    prompt += `${desc.height} height, ${desc.build} build, ${desc.muscleTone} muscle tone, `;
    prompt += `${desc.skinTone} skin, ${desc.faceShape} face shape, `;
    
    // Eyes and hair
    prompt += `${desc.eyeColor} ${desc.eyeShape} eyes, `;
    prompt += `${desc.hairLength} ${desc.hairStyle} ${desc.hairColor} hair, `;
    
    // Body features - gender specific
    if (desc.gender === 'female' || desc.gender === 'futanari') {
      prompt += `${desc.breastSize} breasts, `;
    }
    prompt += `${desc.buttSize} butt, `;
    
    // Body hair (if not default)
    if (desc.bodyHair && desc.bodyHair !== 'minimal' && desc.bodyHair !== 'average') {
      prompt += `${desc.bodyHair} body hair, `;
    }
    
    // Distinctive features - facial/visible
    if (desc.freckles && desc.freckles !== 'none') {
      prompt += `${desc.freckles} freckles, `;
    }
    if (desc.beautyMark) {
      prompt += `${desc.beautyMark}, `;
    }
    if (desc.birthmarks) {
      prompt += `${desc.birthmarks}, `;
    }
    
    // Scars with location if specified
    if (desc.scars && desc.scars !== 'none') {
      if (desc.scarLocation && desc.scarLocation !== 'none') {
        prompt += `${desc.scars} scars on ${desc.scarLocation}, `;
      } else {
        prompt += `${desc.scars} scars, `;
      }
    }
    
    // Tattoos and piercings
    if (desc.tattoos && desc.tattoos !== 'none') {
      prompt += `${desc.tattoos} tattoos, `;
    }
    if (desc.piercings && desc.piercings !== 'none') {
      prompt += `${desc.piercings} piercings, `;
    }
    
    // Custom distinctive features
    if (desc.distinctiveFeaturesCustom) {
      prompt += `${desc.distinctiveFeaturesCustom}, `;
    }
    
    // Setting and style
    prompt += `standing pose, attractive appearance, `;
    prompt += `photorealistic, detailed, high quality, full body shot, natural lighting, `;
    prompt += `isolated on transparent background, no background elements`;
    
    return prompt;
  }

  async generatePortrait(aiModule, styleOverride = null) {
    const style = styleOverride || 'realistic';
    
    try {
      // Generate the prompt and store it
      const prompt = this.generatePortraitPrompt();
      this.currentCharacter.portraitPrompt = prompt;
      
      // Use AI module's image generation with our custom prompt
      const imageUrl = await aiModule.generateImageFromPrompt(prompt, style);
      this.currentCharacter.portraitUrl = imageUrl;
      
      // Store the style used for reference
      this.currentCharacter.portraitStyle = style;
      
      return imageUrl;
    } catch (error) {
      console.error('Failed to generate portrait:', error);
      throw error;
    }
  }

  getCharacter() {
    return JSON.parse(JSON.stringify(this.currentCharacter));
  }

  setCharacter(character) {
    this.currentCharacter = character;
  }

  validateCharacter() {
    const errors = [];
    
    if (!this.currentCharacter.name || this.currentCharacter.name.trim() === '') {
      errors.push('Character name is required');
    }
    
    if (this.currentCharacter.age < 18) {
      errors.push('Character must be 18 or older');
    }
    
    if (!this.currentCharacter.portraitUrl) {
      errors.push('Portrait image is required (click Generate Portrait)');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  randomizeStep(step) {
    const body = this.currentCharacter.body;
    
    switch(step) {
      case 1: // Gender - cycle through options
        const genders = ['female', 'male', 'futanari', 'Cuntboy', 'other'];
        const currentIndex = genders.indexOf(this.currentCharacter.gender);
        const nextIndex = (currentIndex + 1) % genders.length;
        this.setGender(genders[nextIndex]);
        break;
        
      case 3: // Appearance - randomize all body options
        const heights = ['petite', 'short', 'average', 'tall', 'very-tall'];
        const builds = ['skinny', 'slim', 'average', 'athletic', 'curvy', 'muscular', 'heavyset'];
        const skins = ['pale', 'fair', 'tan', 'olive', 'brown', 'dark'];
        const faces = ['oval', 'round', 'square', 'heart', 'diamond'];
        const eyeColors = ['brown', 'blue', 'green', 'hazel', 'gray', 'amber', 'heterochromia'];
        const eyeShapes = ['almond', 'round', 'hooded', 'upturned', 'downturned'];
        const hairColors = ['black', 'brown', 'blonde', 'red', 'auburn', 'gray', 'white', 'unusual'];
        const hairLengths = ['buzzed', 'short', 'shoulder', 'long', 'very-long'];
        const hairStyles = ['straight', 'wavy', 'curly', 'kinky', 'braided', 'tied-up'];
        const breastSizes = ['flat', 'small', 'medium', 'large', 'very-large', 'huge'];
        const buttSizes = ['small', 'medium', 'large', 'very-large'];
        const muscleTones = ['soft', 'toned', 'average', 'muscular', 'very-muscular'];
        const scarsOptions = ['none', 'few', 'many', 'prominent'];
        const frecklesOptions = ['none', 'light', 'moderate', 'heavy'];
        const pubicHairOptions = ['none', 'trimmed', 'natural', 'styled'];
        const bodyHairOptions = ['none', 'minimal', 'average', 'hairy'];
        const tattooOptions = ['none', 'few', 'many', 'custom'];
        const piercingOptions = ['none', 'ears', 'face', 'body', 'nipples', 'genital', 'multiple'];
        
        body.height = heights[Math.floor(Math.random() * heights.length)];
        body.build = builds[Math.floor(Math.random() * builds.length)];
        body.skinTone = skins[Math.floor(Math.random() * skins.length)];
        body.faceShape = faces[Math.floor(Math.random() * faces.length)];
        body.eyeColor = eyeColors[Math.floor(Math.random() * eyeColors.length)];
        body.eyeShape = eyeShapes[Math.floor(Math.random() * eyeShapes.length)];
        body.hairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
        body.hairLength = hairLengths[Math.floor(Math.random() * hairLengths.length)];
        body.hairStyle = hairStyles[Math.floor(Math.random() * hairStyles.length)];
        body.buttSize = buttSizes[Math.floor(Math.random() * buttSizes.length)];
        body.muscleTone = muscleTones[Math.floor(Math.random() * muscleTones.length)];
        body.scars = scarsOptions[Math.floor(Math.random() * scarsOptions.length)];
        body.freckles = frecklesOptions[Math.floor(Math.random() * frecklesOptions.length)];
        body.birthmarks = Math.random() > 0.7;
        body.beautyMark = Math.random() > 0.8;
        body.pubicHair = pubicHairOptions[Math.floor(Math.random() * pubicHairOptions.length)];
        body.bodyHair = bodyHairOptions[Math.floor(Math.random() * bodyHairOptions.length)];
        body.tattoos = tattooOptions[Math.floor(Math.random() * tattooOptions.length)];
        body.piercings = piercingOptions[Math.floor(Math.random() * piercingOptions.length)];
        
        if (this.currentCharacter.gender === 'female' || this.currentCharacter.gender === 'futanari') {
          body.breastSize = breastSizes[Math.floor(Math.random() * breastSizes.length)];
        }
        
        if (body.scars !== 'none') {
          const locations = ['face', 'chest', 'back', 'arms', 'legs'];
          body.scarLocation = locations[Math.floor(Math.random() * locations.length)];
        } else {
          body.scarLocation = null;
        }
        break;
        
      case 4: // Background - cycle through options
        const backgrounds = ['tourist', 'sailor', 'scientist', 'criminal', 'drifter', 'pilot'];
        const currentBg = backgrounds.indexOf(this.currentCharacter.background);
        const nextBg = (currentBg + 1) % backgrounds.length;
        this.setBackground(backgrounds[nextBg]);
        break;
    }
  }
  
  getPreviewSummary() {
    const desc = this.generateCharacterDescription();
    
    // Build human-readable description for preview
    let descParts = [];
    descParts.push(`${desc.height} ${desc.build} build`);
    descParts.push(`${desc.muscleTone} muscle tone`);
    descParts.push(`${desc.skinTone} skin`);
    descParts.push(`${desc.faceShape} face`);
    descParts.push(`${desc.hairLength} ${desc.hairStyle} ${desc.hairColor} hair`);
    descParts.push(`${desc.eyeColor} ${desc.eyeShape} eyes`);
    
    // Body features
    if (desc.gender === 'female' || desc.gender === 'futanari') {
      descParts.push(`${desc.breastSize} breasts`);
    }
    descParts.push(`${desc.buttSize} butt`);
    
    // Distinctive features
    if (desc.freckles && desc.freckles !== 'none') {
      descParts.push(`${desc.freckles} freckles`);
    }
    if (desc.beautyMark) {
      descParts.push(desc.beautyMark);
    }
    if (desc.birthmarks) {
      descParts.push(desc.birthmarks);
    }
    if (desc.scars && desc.scars !== 'none') {
      if (desc.scarLocation) {
        descParts.push(`${desc.scars} scars (${desc.scarLocation})`);
      } else {
        descParts.push(`${desc.scars} scars`);
      }
    }
    if (desc.tattoos && desc.tattoos !== 'none') {
      descParts.push(`${desc.tattoos} tattoos`);
    }
    if (desc.piercings && desc.piercings !== 'none') {
      descParts.push(`${desc.piercings} piercings`);
    }
    if (desc.bodyHair && desc.bodyHair !== 'minimal') {
      descParts.push(`${desc.bodyHair} body hair`);
    }
    if (desc.distinctiveFeaturesCustom) {
      descParts.push(desc.distinctiveFeaturesCustom);
    }
    
    return {
      name: desc.name,
      age: desc.age,
      gender: desc.gender,
      description: descParts.join(', '),
      background: desc.background,
      skills: desc.skills,
      traits: desc.traits
    };
  }
}
