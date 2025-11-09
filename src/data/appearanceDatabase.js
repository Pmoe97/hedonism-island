/**
 * Appearance Database - Deterministic NPC appearance generation
 * Faction-appropriate physical characteristics and clothing
 */
export class AppearanceDatabase {
  constructor() {
    this.data = this.getAppearanceData();
  }

  getAppearanceData() {
    return {
      // Age ranges by faction (min, max)
      ageRanges: {
        castaway: { min: 20, max: 60 }, // Survivors, various ages
        native: { min: 18, max: 70 },   // Multi-generational islanders
        mercenary: { min: 25, max: 45 } // Professional soldiers, peak age
      },

      // Height ranges in cm by gender
      heightRanges: {
        male: { min: 165, max: 195 },
        female: { min: 155, max: 180 },
        other: { min: 160, max: 185 }
      },

      // Skin tones by faction (weighted for diversity)
      skinTones: {
        castaway: [
          // European/Colonial mix
          { tone: 'pale', weight: 2 },
          { tone: 'fair', weight: 3 },
          { tone: 'light tan', weight: 2 },
          { tone: 'olive', weight: 2 },
          { tone: 'tan', weight: 1 },
          { tone: 'brown', weight: 1 },
          { tone: 'dark brown', weight: 1 }
        ],
        native: [
          // Pacific Islander tones
          { tone: 'golden tan', weight: 3 },
          { tone: 'deep tan', weight: 3 },
          { tone: 'bronze', weight: 3 },
          { tone: 'warm brown', weight: 2 },
          { tone: 'rich brown', weight: 2 },
          { tone: 'dark brown', weight: 1 }
        ],
        mercenary: [
          // Multinational mix
          { tone: 'pale', weight: 2 },
          { tone: 'fair', weight: 2 },
          { tone: 'olive', weight: 2 },
          { tone: 'tan', weight: 2 },
          { tone: 'brown', weight: 2 },
          { tone: 'dark brown', weight: 2 },
          { tone: 'ebony', weight: 1 }
        ]
      },

      // Hair colors by faction
      hairColors: {
        castaway: [
          { color: 'blonde', weight: 2 },
          { color: 'light brown', weight: 3 },
          { color: 'brown', weight: 3 },
          { color: 'dark brown', weight: 2 },
          { color: 'black', weight: 2 },
          { color: 'auburn', weight: 1 },
          { color: 'red', weight: 1 },
          { color: 'gray', weight: 1 },
          { color: 'white', weight: 1 }
        ],
        native: [
          { color: 'black', weight: 5 },
          { color: 'very dark brown', weight: 3 },
          { color: 'dark brown', weight: 2 }
        ],
        mercenary: [
          { color: 'black', weight: 3 },
          { color: 'dark brown', weight: 3 },
          { color: 'brown', weight: 2 },
          { color: 'blonde', weight: 2 },
          { color: 'red', weight: 1 },
          { color: 'gray', weight: 1 },
          { color: 'shaved', weight: 2 },
          { color: 'dyed black', weight: 1 }
        ]
      },

      // Hair styles by gender and faction
      hairStyles: {
        male: {
          castaway: ['wild and unkempt', 'shoulder-length and tangled', 'pulled back in rough ponytail', 'matted and sun-bleached', 'scraggly beard and messy hair', 'tied back with vine'],
          native: ['traditional topknot', 'long and flowing', 'adorned with shells and flowers', 'braided with ceremonial beads', 'pulled back with bone clasp', 'shaved sides with long top'],
          mercenary: ['military buzz cut', 'high and tight fade', 'cropped short', 'tactical crew cut', 'shaved head', 'slicked back', 'military regulation']
        },
        female: {
          castaway: ['wild and windswept', 'long and tangled', 'roughly braided', 'sun-bleached and wavy', 'tied back with torn cloth', 'matted and messy'],
          native: ['adorned with flowers and shells', 'long flowing with traditional ornaments', 'braided with colorful threads', 'decorated with feathers', 'woven with natural elements', 'ceremonial style with beads'],
          mercenary: ['tight military bun', 'practical ponytail', 'short tactical cut', 'braided and secured', 'regulation bob', 'tight braids']
        }
      },

      // Hair lengths
      hairLengths: {
        male: ['very short', 'short', 'medium', 'shoulder-length', 'long'],
        female: ['short', 'shoulder-length', 'long', 'very long']
      },

      // Eye colors (mostly natural, some exotic)
      eyeColors: [
        { color: 'brown', weight: 4 },
        { color: 'dark brown', weight: 4 },
        { color: 'hazel', weight: 3 },
        { color: 'green', weight: 2 },
        { color: 'blue', weight: 2 },
        { color: 'gray', weight: 1 },
        { color: 'amber', weight: 1 },
        { color: 'emerald green', weight: 0.5 },
        { color: 'ice blue', weight: 0.5 },
        { color: 'violet', weight: 0.3 }
      ],

      // Body builds by gender and faction (weighted)
      bodyBuilds: {
        male: {
          castaway: [
            { build: 'lean', weight: 3 },
            { build: 'average', weight: 2 },
            { build: 'athletic', weight: 2 },
            { build: 'muscular', weight: 1 },
            { build: 'wiry', weight: 2 }
          ],
          native: [
            { build: 'athletic', weight: 4 },
            { build: 'muscular', weight: 3 },
            { build: 'lean', weight: 2 },
            { build: 'stocky', weight: 1 }
          ],
          mercenary: [
            { build: 'muscular', weight: 4 },
            { build: 'athletic', weight: 3 },
            { build: 'stocky', weight: 2 },
            { build: 'hulking', weight: 1 }
          ]
        },
        female: {
          castaway: [
            { build: 'slim', weight: 3 },
            { build: 'average', weight: 2 },
            { build: 'athletic', weight: 2 },
            { build: 'curvy', weight: 2 },
            { build: 'petite', weight: 1 }
          ],
          native: [
            { build: 'athletic', weight: 4 },
            { build: 'curvy', weight: 3 },
            { build: 'average', weight: 2 },
            { build: 'voluptuous', weight: 1 }
          ],
          mercenary: [
            { build: 'athletic', weight: 4 },
            { build: 'muscular', weight: 3 },
            { build: 'toned', weight: 2 },
            { build: 'average', weight: 1 }
          ]
        }
      },

      // Clothing templates by faction and gender
      clothing: {
        castaway: {
          male: [
            'tattered shirt and torn pants, barefoot',
            'ripped trousers and no shirt, sun-damaged',
            'makeshift loincloth from ship sail',
            'torn dress shirt and ragged slacks',
            'salvaged vest over bare chest, worn pants',
            'threadbare clothing held together with rope'
          ],
          female: [
            'torn dress repurposed as wrap',
            'tattered blouse and makeshift skirt',
            'salvaged fabric tied as halter top and shorts',
            'ripped clothing fashioned into two-piece',
            'sun-bleached dress with many tears',
            'improvised clothing from ship materials'
          ]
        },
        native: {
          male: [
            'traditional loincloth with ceremonial tattoos visible',
            'woven grass skirt and shell necklaces',
            'minimal tribal garments with body paint',
            'decorated loincloth and arm bands',
            'ceremonial wraps with natural dyes',
            'traditional island attire with feather ornaments'
          ],
          female: [
            'woven grass skirt and shell top',
            'traditional sarong with flower lei',
            'ceremonial two-piece with natural decorations',
            'wrapped fabric skirt and decorative top',
            'island dress with traditional patterns',
            'minimal tribal garments with body paint and flowers'
          ]
        },
        mercenary: {
          male: [
            'black tactical vest over combat shirt, cargo pants, boots',
            'urban camouflage fatigues with tactical gear',
            'combat uniform with Blacksteel insignia, armed',
            'tactical clothing, plate carrier, military boots',
            'dark military outfit with equipment harness',
            'PMC tactical gear, subdued patches, combat ready'
          ],
          female: [
            'black tactical vest over fitted combat shirt, cargo pants',
            'tactical outfit with equipment harness, military boots',
            'combat uniform with Blacksteel patch, armed',
            'fitted tactical clothing with gear vest',
            'dark military outfit, plate carrier, boots',
            'PMC tactical gear, professional appearance'
          ]
        }
      },

      // Distinctive features by faction (scars, tattoos, physical traits)
      distinctiveFeatures: {
        castaway: [
          'sun-damaged skin with freckles',
          'long scar across arm from shipwreck',
          'calloused hands from survival work',
          'haunted, tired eyes',
          'badly healed broken nose',
          'rope burn scars on wrists',
          'gaunt, weathered face',
          'missing tooth from accident',
          'deep scar on forehead',
          'perpetually sunburned shoulders',
          'wild, desperate eyes',
          'visible ribs from rationing',
          'salt-crusted hair',
          'permanent squint from sun glare'
        ],
        native: [
          'traditional tribal tattoos on arms',
          'ceremonial scarification patterns',
          'shell or bone piercings',
          'intricate facial tattoos',
          'flower tattoo on shoulder',
          'ritual scars on chest',
          'carved bone necklace',
          'traditional earlobe stretching',
          'sacred tribal markings',
          'decorative face paint',
          'ancestral tattoo sleeves',
          'ceremonial scars on back',
          'ritual piercings',
          'symbolic tattoos on hands'
        ],
        mercenary: [
          'combat scar across cheek',
          'military dog tags',
          'tactical gear tan lines',
          'shrapnel scars on arms',
          'unit tattoo on shoulder',
          'broken nose from combat',
          'knife scar on jaw',
          'Blacksteel insignia tattoo',
          'missing finger from operation',
          'burn scar on neck',
          'cold, calculating eyes',
          'professional posture and bearing',
          'visible gunshot scar',
          'military regulation appearance',
          'tactical calluses on hands'
        ]
      }
    };
  }

  /**
   * Generate complete appearance for NPC
   * @param {string} faction - NPC faction
   * @param {string} gender - NPC gender
   * @param {object} seededRandom - Seeded random generator
   * @returns {object} Complete appearance data
   */
  generateAppearance(faction, gender, seededRandom) {
    const data = this.data;
    const genderKey = gender === 'male' || gender === 'female' ? gender : 'other';

    // Age
    const ageRange = data.ageRanges[faction];
    const age = seededRandom.nextInt(ageRange.min, ageRange.max);

    // Height
    const heightRange = data.heightRanges[genderKey];
    const height = seededRandom.nextInt(heightRange.min, heightRange.max);

    // Skin tone
    const skinTone = this.weightedChoice(data.skinTones[faction], seededRandom);

    // Hair
    const hairColor = this.weightedChoice(data.hairColors[faction], seededRandom);
    const hairStyles = data.hairStyles[genderKey][faction];
    const hairStyle = seededRandom.choice(hairStyles);
    const hairLength = seededRandom.choice(data.hairLengths[genderKey]);

    // Eyes
    const eyeColor = this.weightedChoice(data.eyeColors, seededRandom);

    // Build
    const build = this.weightedChoice(data.bodyBuilds[genderKey][faction], seededRandom);

    // Clothing
    const clothingOptions = data.clothing[faction][genderKey];
    const clothing = seededRandom.choice(clothingOptions);

    // Distinctive features (pick 2-3)
    const featurePool = data.distinctiveFeatures[faction];
    const featureCount = seededRandom.nextInt(2, 4); // 2-3 features
    const distinctiveFeatures = [];
    const usedIndices = new Set();
    
    while (distinctiveFeatures.length < featureCount && usedIndices.size < featurePool.length) {
      const index = seededRandom.nextInt(0, featurePool.length);
      if (!usedIndices.has(index)) {
        usedIndices.add(index);
        distinctiveFeatures.push(featurePool[index]);
      }
    }

    return {
      gender,
      age,
      height,
      skinTone,
      hairColor,
      hairStyle,
      hairLength,
      eyeColor,
      build,
      clothing,
      distinctiveFeatures
    };
  }

  /**
   * Weighted random selection
   * @param {Array} options - Array of {value, weight} or {color, weight} etc
   * @param {object} seededRandom - Seeded random generator
   * @returns {string} Selected value
   */
  weightedChoice(options, seededRandom) {
    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    let random = seededRandom.next() * totalWeight;
    
    for (const option of options) {
      random -= option.weight;
      if (random <= 0) {
        // Return the actual value (tone, color, build, etc)
        return option.tone || option.color || option.build || option;
      }
    }
    
    // Fallback
    return options[0].tone || options[0].color || options[0].build || options[0];
  }
}
