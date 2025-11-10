/**
 * Personality Database - Deterministic NPC personality generation
 * Big Five traits, sexual preferences, and behavioral patterns by faction
 */
export class PersonalityDatabase {
  constructor() {
    this.data = this.getPersonalityData();
  }

  getPersonalityData() {
    return {
      // Big Five personality trait ranges by faction (0-100 scale)
      // Each faction has different baseline tendencies
      traitRanges: {
        castaway: {
          // Survivors - traumatized but resilient
          openness: { min: 30, max: 80 },        // Variable - depends on pre-island life
          conscientiousness: { min: 40, max: 90 }, // High - survival requires discipline
          extraversion: { min: 20, max: 70 },    // Lower - isolation impacts social behavior
          agreeableness: { min: 30, max: 80 },   // Variable - survival can make selfish or cooperative
          neuroticism: { min: 40, max: 90 }      // Higher - trauma and stress
        },
        native: {
          // Islanders - traditional, community-oriented
          openness: { min: 30, max: 70 },        // Moderate - traditional but nature-connected
          conscientiousness: { min: 50, max: 90 }, // High - community responsibilities
          extraversion: { min: 40, max: 80 },    // Moderate-high - social culture
          agreeableness: { min: 50, max: 90 },   // High - cooperative community values
          neuroticism: { min: 20, max: 60 }      // Lower - stable traditional life
        },
        mercenary: {
          // Blacksteel operators - professional, aggressive
          openness: { min: 30, max: 70 },        // Moderate - tactical thinking
          conscientiousness: { min: 60, max: 95 }, // Very high - military discipline
          extraversion: { min: 30, max: 70 },    // Variable - some leaders, some loners
          agreeableness: { min: 10, max: 50 },   // Low - trained to be ruthless
          neuroticism: { min: 20, max: 60 }      // Low-moderate - combat conditioning
        }
      },

      // Sexual orientation distribution (weighted)
      sexualOrientations: [
        { orientation: 'heterosexual', weight: 7 },
        { orientation: 'bisexual', weight: 2 },
        { orientation: 'homosexual', weight: 1 },
        { orientation: 'pansexual', weight: 1 }
      ],

      // Sexual preferences (kinks, interests) - adult content
      sexualPreferences: {
        dominance: ['dominant', 'submissive', 'switch', 'neutral'],
        intensity: ['vanilla', 'adventurous', 'kinky', 'extreme'],
        interests: [
          'bondage', 'roleplay', 'outdoor', 'voyeurism', 'exhibitionism',
          'rough', 'gentle', 'sensual', 'passionate', 'experimental',
          'traditional', 'romantic', 'casual', 'intense', 'playful'
        ]
      },

      // Behavioral quirks by faction
      quirks: {
        castaway: [
          'constantly checks the horizon for ships',
          'hoards small items compulsively',
          'talks to themselves when alone',
          'can\'t sleep without sound of waves',
          'flinches at loud noises',
          'counts everything obsessively',
          'avoids deep water despite being on island',
          'keeps a journal with unreadable scrawl',
          'makes daily marks on a tree to track time',
          'refuses to eat certain foods that remind them of something',
          'mumbles in a language they don\'t remember',
          'obsessively maintains their appearance despite conditions',
          'saves every scrap of cloth or rope',
          'builds small cairns or markers everywhere'
        ],
        native: [
          'performs small rituals before eating',
          'speaks to ancestors when making decisions',
          'refuses to enter certain areas due to taboos',
          'reads omens in natural phenomena',
          'hums traditional songs while working',
          'touches specific trees for luck',
          'avoids stepping on certain plants',
          'makes offerings to spirits regularly',
          'tells stories using elaborate hand gestures',
          'interprets dreams as prophecies',
          'consults elders before any major decision',
          'wears traditional jewelry at all times',
          'performs cleansing rituals after conflict',
          'shares food with everyone before eating'
        ],
        mercenary: [
          'constantly scans surroundings for threats',
          'sleeps with weapon within reach',
          'uses military time exclusively',
          'maintains gear obsessively',
          'speaks in tactical jargon',
          'never sits with back to door',
          'takes measured bites and chews exactly same number',
          'checks magazine and clears weapon repeatedly',
          'maintains perfect posture at all times',
          'uses compass directions instead of left/right',
          'performs equipment check ritual before sleep',
          'refers to civilians with slight disdain',
          'keeps detailed operational notes',
          'practices tactical drills during downtime',
          'never discusses family or personal life'
        ]
      },

      // Fears by faction
      fears: {
        castaway: [
          'dying alone on the island',
          'never being rescued',
          'losing their remaining memories',
          'going completely insane',
          'being forgotten by the outside world',
          'the ocean and drowning',
          'starvation',
          'tropical storms',
          'isolation',
          'their past catching up to them'
        ],
        native: [
          'angering the island spirits',
          'breaking ancient taboos',
          'outsiders destroying sacred sites',
          'losing traditional ways',
          'being cursed by elders',
          'natural disasters as divine punishment',
          'failing their ancestors',
          'pollution or desecration of the island',
          'their children forgetting traditions',
          'prophecies of doom'
        ],
        mercenary: [
          'mission failure',
          'losing combat effectiveness',
          'betrayal by command',
          'being left behind',
          'losing control in combat',
          'not completing the contract',
          'appearing weak',
          'ambush or surprise attack',
          'their past operations being exposed',
          'dying for a corrupt cause'
        ]
      },

      // Desires/motivations by faction
      desires: {
        castaway: [
          'rescue and return to civilization',
          'recovering their lost memories',
          'finding meaning in their new life',
          'building something permanent',
          'connecting with other survivors',
          'proving they can survive anything',
          'understanding why they were spared',
          'finding love despite circumstances',
          'escaping the island',
          'accepting this as their new home'
        ],
        native: [
          'protecting sacred sites',
          'preserving traditional knowledge',
          'maintaining harmony with nature',
          'raising strong children',
          'earning elder status',
          'defending the island from outsiders',
          'finding a worthy partner',
          'mastering ancestral skills',
          'receiving visions from spirits',
          'keeping their family line strong'
        ],
        mercenary: [
          'completing the mission',
          'getting paid and getting out',
          'advancing in Blacksteel ranks',
          'proving combat superiority',
          'surviving until contract ends',
          'finding worthy opponents',
          'maintaining professional reputation',
          'uncovering what Blacksteel is really doing here',
          'earning enough to retire',
          'power and control'
        ]
      }
    };
  }

  /**
   * Normalize faction name to match database keys
   */
  normalizeFaction(faction) {
    const factionMap = {
      'castaway': 'castaway',
      'natives_clan1': 'native',
      'natives_clan2': 'native',
      'mercenaries': 'mercenary',
      'native': 'native',
      'mercenary': 'mercenary'
    };
    return factionMap[faction] || 'castaway';
  }

  /**
   * Generate complete personality for NPC
   * @param {string} faction - NPC faction
   * @param {object} seededRandom - Seeded random generator
   * @returns {object} Complete personality data
   */
  generatePersonality(faction, seededRandom) {
    const data = this.data;
    const normalizedFaction = this.normalizeFaction(faction);
    const ranges = data.traitRanges[normalizedFaction];

    // Generate Big Five traits within faction ranges
    const traits = {
      openness: seededRandom.int(ranges.openness.min, ranges.openness.max),
      conscientiousness: seededRandom.int(ranges.conscientiousness.min, ranges.conscientiousness.max),
      extraversion: seededRandom.int(ranges.extraversion.min, ranges.extraversion.max),
      agreeableness: seededRandom.int(ranges.agreeableness.min, ranges.agreeableness.max),
      neuroticism: seededRandom.int(ranges.neuroticism.min, ranges.neuroticism.max)
    };

    // Sexual orientation
    const orientation = this.weightedChoice(data.sexualOrientations, seededRandom);

    // Sexual preferences
    const dominance = seededRandom.choice(data.sexualPreferences.dominance);
    const intensity = seededRandom.choice(data.sexualPreferences.intensity);
    const interestCount = seededRandom.int(2, 5); // 2-4 interests
    const interests = [];
    const availableInterests = [...data.sexualPreferences.interests];
    
    for (let i = 0; i < interestCount && availableInterests.length > 0; i++) {
      const index = seededRandom.int(0, availableInterests.length - 1);
      interests.push(availableInterests[index]);
      availableInterests.splice(index, 1);
    }

    // Quirks (pick 2-3 from faction pool)
    const quirkCount = seededRandom.int(2, 4);
    const quirks = [];
    const availableQuirks = [...data.quirks[normalizedFaction]];
    
    for (let i = 0; i < quirkCount && availableQuirks.length > 0; i++) {
      const index = seededRandom.int(0, availableQuirks.length - 1);
      quirks.push(availableQuirks[index]);
      availableQuirks.splice(index, 1);
    }

    // Fears (pick 2-3)
    const fearCount = seededRandom.int(2, 4);
    const fears = [];
    const availableFears = [...data.fears[normalizedFaction]];
    
    for (let i = 0; i < fearCount && availableFears.length > 0; i++) {
      const index = seededRandom.int(0, availableFears.length - 1);
      fears.push(availableFears[index]);
      availableFears.splice(index, 1);
    }

    // Desires (pick 2-3)
    const desireCount = seededRandom.int(2, 4);
    const desires = [];
    const availableDesires = [...data.desires[normalizedFaction]];
    
    for (let i = 0; i < desireCount && availableDesires.length > 0; i++) {
      const index = seededRandom.int(0, availableDesires.length - 1);
      desires.push(availableDesires[index]);
      availableDesires.splice(index, 1);
    }

    return {
      traits,
      sexuality: {
        orientation,
        dominance,
        intensity,
        interests
      },
      quirks,
      fears,
      desires
    };
  }

  /**
   * Weighted random selection
   * @param {Array} options - Array of {value, weight}
   * @param {object} seededRandom - Seeded random generator
   * @returns {string} Selected value
   */
  weightedChoice(options, seededRandom) {
    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    let random = seededRandom.next() * totalWeight;
    
    for (const option of options) {
      random -= option.weight;
      if (random <= 0) {
        return option.orientation || option.value || option;
      }
    }
    
    return options[0].orientation || options[0].value || options[0];
  }
}
