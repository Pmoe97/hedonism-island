/**
 * Background Database - Faction-specific background templates
 * Castaway: Island identity (no memory)
 * Native: Full tribal history
 * Mercenary: Blacksteel military background
 */
export class BackgroundDatabase {
  constructor() {
    this.data = this.getBackgroundData();
  }

  getBackgroundData() {
    return {
      // CASTAWAY - No memory of past, only island identity
      castaway: {
        // Mysterious skills they possess but can't explain
        mysteriousSkills: [
          'knows advanced first aid but doesn\'t remember training',
          'can tie complex knots without thinking',
          'speaks fragments of multiple languages',
          'instinctively knows hand-to-hand combat',
          'has deep knowledge of sailing',
          'understands engineering principles',
          'recognizes classical music',
          'knows gourmet cooking techniques',
          'can perform emergency surgery',
          'understands military tactics',
          'knows advanced mathematics',
          'can identify expensive wines',
          'has ballroom dancing muscle memory',
          'recognizes art and literature references'
        ],

        // Dream fragments and vague impressions
        dreamMotifs: [
          'recurring dream of a burning ship',
          'visions of a woman\'s face they can\'t place',
          'nightmares of being chased',
          'dreams of a grand estate',
          'memories of cold northern weather',
          'flashes of a wedding ceremony',
          'visions of violence and blood',
          'dreams of a crying child',
          'recurring image of a specific city skyline',
          'nightmare of drowning repeatedly',
          'vague memory of uniform and medals',
          'dream of running from authorities',
          'vision of a courtroom',
          'memory of a luxurious lifestyle'
        ],

        // Who they've become on the island
        islandIdentities: [
          'a resourceful scavenger who knows every inch of the beach',
          'a paranoid loner who trusts no one',
          'a natural leader trying to organize other survivors',
          'a broken shell of a person barely hanging on',
          'a philosophical thinker who found peace in isolation',
          'a desperate survivor willing to do anything',
          'a helpful person who finds purpose in aiding others',
          'an obsessive builder constructing elaborate shelters',
          'a wanderer who can\'t stay in one place',
          'a mystic who believes the island chose them',
          'a pragmatic survivor focused on basics',
          'a social butterfly desperate for human connection'
        ]
      },

      // NATIVE - Full tribal history and cultural background
      native: {
        // Tribal affiliations
        tribes: [
          'the Kaimana tribe of the eastern shores',
          'the Moana people of the volcanic highlands',
          'the Alani clan of the northern reefs',
          'the Kahale tribe of the sacred valleys',
          'the Nalu people of the western beaches',
          'the Lani clan of the mountain villages',
          'the Kai tribe of the fishing grounds',
          'the Hoku people of the stargazer peaks'
        ],

        // Family lineages and status
        lineages: [
          'descended from a long line of chiefs',
          'child of renowned warriors',
          'from a family of spiritual healers',
          'offspring of master craftsmen',
          'heir to a fishing dynasty',
          'from a farming family of modest means',
          'child of a disgraced former leader',
          'orphan raised by the tribe collectively',
          'from a family of navigators and explorers',
          'descended from the island\'s first inhabitants'
        ],

        // Cultural roles in society
        culturalRoles: [
          'apprentice shaman learning sacred rites',
          'warrior sworn to protect the tribe',
          'master fisherman providing for community',
          'storyteller preserving oral history',
          'craftsperson creating traditional items',
          'farmer tending ancestral lands',
          'navigator reading stars and currents',
          'healer using ancient medicine',
          'scout monitoring the island\'s borders',
          'elder advisor to the chief',
          'dancer performing ceremonial rituals',
          'hunter tracking in the jungle'
        ],

        // Sacred knowledge they possess
        sacredKnowledge: [
          'knows the location of hidden sacred sites',
          'can interpret the will of ancestors',
          'understands the island\'s spiritual geography',
          'keeper of forbidden prophecies',
          'knows ancient taboos and their consequences',
          'can communicate with island spirits',
          'understands the sacred calendar',
          'knows ritual phrases in the old tongue',
          'can read omens in natural phenomena',
          'keeper of tribal genealogies'
        ]
      },

      // MERCENARY - Blacksteel Solutions military background
      mercenary: {
        // Ranks within Blacksteel
        ranks: [
          'Operator (entry level)',
          'Senior Operator',
          'Team Leader',
          'Squad Commander',
          'Tactical Specialist',
          'Field Supervisor',
          'Operations Officer',
          'Security Consultant (veteran)'
        ],

        // Military specializations
        specializations: [
          'Close Quarters Combat specialist',
          'Sniper and designated marksman',
          'Explosives and demolitions expert',
          'Communications and signals intelligence',
          'Medic and field trauma specialist',
          'Heavy weapons operator',
          'Reconnaissance and surveillance',
          'Vehicle and maritime operations',
          'Intelligence gathering and analysis',
          'Executive protection detail',
          'Unconventional warfare specialist',
          'Cyber warfare and electronic countermeasures'
        ],

        // Previous military/PMC experience
        previousExperience: [
          'former special forces operator',
          'ex-military police investigator',
          'former infantry soldier',
          'ex-navy SEAL',
          'former marine raider',
          'ex-army ranger',
          'former intelligence operative',
          'ex-military pilot',
          'former combat medic',
          'ex-military contractor from another PMC',
          'former guerrilla fighter',
          'ex-law enforcement SWAT'
        ],

        // Blacksteel mission types
        missionTypes: [
          'security detail for unknown VIP',
          'resource extraction protection',
          'area denial and territorial control',
          'search and acquisition of unknown asset',
          'intelligence gathering on island inhabitants',
          'establishing forward operating base',
          'neutralizing potential threats',
          'securing strategic locations',
          'monitoring and reporting island activities',
          'special operations with classified objectives'
        ],

        // Employers/contractors (who hired Blacksteel)
        employers: [
          'classified government contract',
          'multinational mining corporation',
          'pharmaceutical research company',
          'private billionaire collector',
          'biotech conglomerate',
          'archaeological expedition financier',
          'real estate development firm',
          'intelligence agency front company',
          'military weapons contractor',
          'unknown benefactor (need-to-know basis)'
        ]
      }
    };
  }

  /**
   * Generate background foundation for NPC
   * (AI will flesh out full backstory using these elements)
   * @param {string} faction - NPC faction
   * @param {string} role - NPC role
   * @param {object} seededRandom - Seeded random generator
   * @returns {object} Background foundation data
   */
  generateBackground(faction, role, seededRandom) {
    const data = this.data[faction];
    
    if (faction === 'castaway') {
      return {
        faction: 'castaway',
        mysteriousSkill: seededRandom.choice(data.mysteriousSkills),
        dreamMotif: seededRandom.choice(data.dreamMotifs),
        islandIdentity: seededRandom.choice(data.islandIdentities),
        // No birthplace, occupation, or education - they don't remember
        birthplace: 'unknown (amnesia)',
        occupation: 'unknown (amnesia)',
        education: 'unknown (amnesia)',
        familyStatus: 'unknown (amnesia)'
      };
    }
    
    if (faction === 'native') {
      return {
        faction: 'native',
        tribe: seededRandom.choice(data.tribes),
        lineage: seededRandom.choice(data.lineages),
        culturalRole: seededRandom.choice(data.culturalRoles),
        sacredKnowledge: seededRandom.choice(data.sacredKnowledge),
        birthplace: seededRandom.choice(data.tribes), // Born in their tribe's territory
        occupation: seededRandom.choice(data.culturalRoles),
        education: 'traditional tribal knowledge',
        familyStatus: seededRandom.choice(data.lineages)
      };
    }
    
    if (faction === 'mercenary') {
      return {
        faction: 'mercenary',
        employer: 'Blacksteel Solutions',
        rank: seededRandom.choice(data.ranks),
        specialization: seededRandom.choice(data.specializations),
        previousExperience: seededRandom.choice(data.previousExperience),
        missionType: seededRandom.choice(data.missionTypes),
        contractor: seededRandom.choice(data.employers),
        birthplace: 'various (multinational)',
        occupation: seededRandom.choice(data.ranks),
        education: 'military training and combat experience',
        familyStatus: 'typically estranged or secretive'
      };
    }
    
    return {};
  }

  /**
   * Get backstory prompt context for AI generation
   * @param {object} npc - NPC with generated foundation
   * @returns {string} Context string for AI prompt
   */
  getBackstoryContext(npc) {
    const bg = npc.background;
    
    if (bg.faction === 'castaway') {
      return `CASTAWAY BACKSTORY CONTEXT:
- Has complete amnesia, no memory of life before the island
- Mysterious skill: ${bg.mysteriousSkill}
- Recurring dream: ${bg.dreamMotif}
- Island identity: ${bg.islandIdentity}
- Current role: ${npc.identity.role}

Generate a 2-3 sentence backstory about their NEW IDENTITY formed on the island.
DO NOT explain their past - they don't remember it.
Focus on: who they've become, how they cope, what drives them now.`;
    }
    
    if (bg.faction === 'native') {
      return `NATIVE BACKSTORY CONTEXT:
- Tribe: ${bg.tribe}
- Family lineage: ${bg.lineage}
- Cultural role: ${bg.culturalRole}
- Sacred knowledge: ${bg.sacredKnowledge}
- Current role: ${npc.identity.role}

Generate a 2-3 sentence backstory about their tribal history and place in island society.
Include: family connections, cultural significance, why they're at their current location.`;
    }
    
    if (bg.faction === 'mercenary') {
      return `MERCENARY BACKSTORY CONTEXT:
- Employer: Blacksteel Solutions (PMC)
- Rank: ${bg.rank}
- Specialization: ${bg.specialization}
- Previous experience: ${bg.previousExperience}
- Current mission: ${bg.missionType}
- Contracted by: ${bg.contractor}
- Current role: ${npc.identity.role}

Generate a 2-3 sentence backstory about their military background and current mission.
Include: why they joined Blacksteel, notable past operations, what they're doing on the island.`;
    }
    
    return '';
  }
}
