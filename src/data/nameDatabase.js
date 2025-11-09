/**
 * Name Database - Deterministic NPC name generation
 * Each faction has culturally-appropriate name pools
 */
export class NameDatabase {
  constructor() {
    this.names = this.getNameDefinitions();
    this.usedCombinations = new Set(); // Track used name combinations
  }

  /**
   * Get name pools for all factions
   */
  getNameDefinitions() {
    return {
      // Shipwrecked survivors - European/Colonial era names
      castaway: {
        male: [
          'William', 'James', 'Thomas', 'Robert', 'John', 'Samuel', 'Edward', 'Henry',
          'Charles', 'George', 'Richard', 'Benjamin', 'Daniel', 'Joseph', 'Michael',
          'Peter', 'Jonathan', 'Christopher', 'Matthew', 'Andrew', 'Francis', 'Anthony',
          'Nicholas', 'Timothy', 'Stephen', 'Philip', 'Simon', 'Alexander', 'David',
          'Frederick', 'Albert', 'Arthur', 'Walter', 'Harry', 'Louis', 'Frank', 'Ernest',
          'Clarence', 'Theodore', 'Eugene', 'Raymond', 'Harold', 'Leonard', 'Vincent',
          'Leroy', 'Alfred', 'Clyde', 'Edwin', 'Gordon', 'Marion',
          'Jasper', 'Caleb', 'Ethan', 'Gideon', 'Isaac', 'Levi', 'Silas',
          'Tobias', 'Zachary', 'Abraham', 'Bartholomew', 'Clement', 'Darius', 'Elias',
          'Felix', 'Hiram', 'Jethro', 'Luther', 'Malachi', 'Nehemiah', 'Phineas',
          'Quentin', 'Reuben', 'Simeon', 'Thaddeus', 'Ulysses', 'Victor', 'Wesley', 'Xavier',
          'Oliver', 'Patrick', 'Quincy', 'Randolph', 'Stanley', 'Trevor', 'Upton', 'Vaughn',
          'Warren', 'Wilbur', 'Amos', 'Barnabas', 'Chester', 'Douglas', 'Ellis', 'Floyd',
          'Gilbert', 'Homer', 'Irving', 'Jerome', 'Kenneth', 'Lester', 'Milton', 'Norman',
          'Oscar', 'Percy', 'Ralph', 'Sidney', 'Terrence', 'Virgil', 'Willis', 'Ambrose',
          'Bernard', 'Calvin', 'Cyrus', 'Dexter', 'Emery', 'Francis', 'Gerard', 'Harvey',
          'Edmund', 'Frederick', 'Arthur', 'Albert', 'Ernest', 'Walter', 'Alfred', 'Herbert',
          'Harold', 'Leopold', 'Augustus', 'Reginald', 'Percival', 'Rupert', 'Cecil', 'Clive',
          'Basil', 'Horace', 'Cyril', 'Lionel', 'Mortimer', 'Humphrey', 'Godfrey', 'Benedict',
          'Cornelius', 'Maximilian', 'Sebastian', 'Thaddeus', 'Bartholomew', 'Ignatius',
          'Archibald', 'Clarence', 'Desmond', 'Egbert', 'Ferdinand', 'Giles', 'Hugo', 'Jasper',
          'Alistair', 'Barnaby', 'Cedric', 'Dunstan', 'Eustace', 'Fitzwilliam', 'Godwin', 'Hector',
          'Inigo', 'Jerome', 'Kendrick', 'Lancelot', 'Montgomery', 'Nigel', 'Oswald', 'Peregrine',
          'Quinton', 'Roderick', 'Septimus', 'Tobias', 'Ulric', 'Vivian', 'Wilfred', 'Xerxes',
          'Yardley', 'Ambrose', 'Bromley', 'Caspar', 'Digby', 'Everard', 'Fulton', 'Griffith',
          'Hamish', 'Irving', 'Jocelyn', 'Kenelm', 'Ludovic', 'Merlin', 'Norbert', 'Octavius'
        ],
        female: [
          'Mary', 'Elizabeth', 'Anne', 'Margaret', 'Sarah', 'Catherine', 'Jane', 'Emma',
          'Charlotte', 'Sophia', 'Isabella', 'Amelia', 'Grace', 'Eleanor', 'Rebecca',
          'Rachel', 'Hannah', 'Abigail', 'Emily', 'Caroline', 'Victoria', 'Alice',
          'Clara', 'Lillian', 'Rose', 'Helen', 'Ruth', 'Martha', 'Beatrice', 'Agnes',
          'Florence', 'Harriet', 'Lucy', 'Mabel', 'Nora', 'Olive', 'Pearl', 'Ruby',
          'Stella', 'Vera', 'Willa', 'Zoe', 'Adeline', 'Cecilia', 'Daphne', 'Evelyn',
          'Felicity', 'Genevieve', 'Helena', 'Irene', 'Josephine', 'Katherine', 'Lydia',
          'Matilda', 'Nadine', 'Ophelia', 'Priscilla', 'Quinn', 'Rosalind', 'Sylvia',
          'Theresa', 'Ursula', 'Vivian', 'Adelaide', 'Bernadette', 'Constance', 'Diana',
          'Edith', 'Frances', 'Gwendolyn', 'Hazel', 'Iris', 'Juliet', 'Kathryn', 'Laura',
          'Miriam', 'Naomi', 'Octavia', 'Penelope', 'Rosemary', 'Susannah', 'Tabitha',
          'Violet', 'Winifred', 'Yvonne', 'Alma', 'Blanche', 'Cora', 'Della', 'Elsie',
          'Flora', 'Gladys', 'Hattie', 'Ida', 'June', 'Kitty', 'Lena', 'May',
          'Adelaide', 'Beatrice', 'Constance', 'Dorothy', 'Edith', 'Florence', 'Gertrude',
          'Harriet', 'Imogen', 'Josephine', 'Katherine', 'Lavinia', 'Millicent', 'Octavia',
          'Penelope', 'Prudence', 'Rosalind', 'Tabitha', 'Ursula', 'Violet', 'Winifred',
          'Arabella', 'Cordelia', 'Gwendolyn', 'Henrietta', 'Meredith', 'Philippa', 'Theodora',
          'Agatha', 'Blanche', 'Cecilia', 'Daphne', 'Estelle', 'Felicity', 'Georgiana', 'Hyacinth',
          'Isolde', 'Jocasta', 'Keturah', 'Lucinda', 'Marigold', 'Nerissa', 'Ondine', 'Petronilla',
          'Quintessa', 'Rowena', 'Seraphina', 'Thomasina', 'Venetia', 'Wilhelmina', 'Xanthe', 'Yseult',
          'Zinnia', 'Annabella', 'Belinda', 'Clementine', 'Delphine', 'Eugenia', 'Fidelia', 'Griselda',
          'Honoria', 'Ismena', 'Jessamine', 'Lettice', 'Marcelline', 'Nerissa', 'Olympia', 'Perpetua'
        ],
        lastNames: [
          'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson',
          'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin',
          'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis',
          'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Scott', 'Green',
          'Baker', 'Adams', 'Nelson', 'Carter', 'Mitchell', 'Roberts', 'Turner', 'Phillips',
          'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Morris', 'Cook',
          'Rogers', 'Morgan', 'Bell', 'Murphy', 'Bailey', 'Cooper', 'Reed', 'Ward', 'Cox',
          'Howard', 'Richardson', 'Wood', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price',
          'Bennett', 'Gray', 'James', 'Rivera', 'Watkins', 'Foster', 'Gonzalez', 'Bryant',
          'Alexander', 'Russell', 'Griffin', 'Diaz', 'Hayes',
          'Myers', 'Ford', 'Hamilton', 'Graham', 'Sullivan', 'Wallace', 'Woods', 'Cole',
          'West', 'Jordan', 'Owens', 'Reynolds', 'Fisher', 'Ellis', 'Harrison', 'Gibson',
          'McDonald', 'Cruz', 'Marshall', 'Ortiz', 'Gomez', 'Murray', 'Freeman', 'Wells',
          'Webb', 'Simpson', 'Stevens', 'Tucker', 'Porter', 'Hunter', 'Hicks', 'Crawford',
          'Henry', 'Boyd', 'Mason', 'Morales', 'Kennedy', 'Warren', 'Dixon', 'Ramos',
          'Reyes', 'Burns', 'Gordon', 'Shaw', 'Holmes', 'Rice', 'Robertson', 'Hunt',
          'Black', 'Daniels', 'Palmer', 'Mills', 'Nichols', 'Grant', 'Knight', 'Ferguson',
          'Rose', 'Stone', 'Hawkins', 'Dunn', 'Perkins', 'Hudson', 'Spencer', 'Gardner',
          'Ashworth', 'Blackwood', 'Carrington', 'Drummond', 'Fairfax', 'Gladstone', 'Harrington',
          'Kensington', 'Lancaster', 'Montague', 'Pembroke', 'Radcliffe', 'Sutherland', 'Waverly',
          'Beaumont', 'Chatsworth', 'Dunbar', 'Ellington', 'Fitzgerald', 'Grosvenor', 'Huntington',
          'Kingston', 'Livingstone', 'Montgomery', 'Ponsonby', 'Ravenswood', 'Stratford', 'Wellington',
          'Ashford', 'Beckett', 'Caldwell', 'Davenport', 'Ellsworth', 'Finch', 'Goodwin', 'Hastings',
          'Irving', 'Jameson', 'Kendall', 'Lawson', 'Merrick', 'Norton', 'Preston', 'Quincy',
          'Radley', 'Sinclair', 'Thornton', 'Winthrop', 'Ashby', 'Barlow', 'Clifton', 'Dresden',
          'Emerson', 'Fletcher', 'Grantham', 'Holbrook', 'Kingsley', 'Maxwell', 'Pritchard', 'Sheffield',
          'Worthington', 'Aldridge', 'Blackburn', 'Cheltenham', 'Devonshire', 'Edgeworth', 'Fenwick', 'Gloucester',
          'Harrowgate', 'Islington', 'Jarvis', 'Kensington', 'Langford', 'Maidstone', 'Norwood', 'Oakley',
          'Paddington', 'Queensbury', 'Rothwell', 'Salisbury', 'Twickenham', 'Uppingham', 'Vauxhall', 'Whitehall',
          'Yarmouth', 'Ashcroft', 'Bridgewater', 'Chadwick', 'Danvers', 'Eastwood', 'Fairchild', 'Greenwood',
          'Hawthorne', 'Ironwood', 'Jarrett', 'Kimberly', 'Lockwood', 'Marlowe', 'Nightingale', 'Overbrook'
        ]
      },

      // Indigenous islanders - Polynesian/Pacific names (both tribes share pool)
      native: {
        male: [
          'Koa', 'Kai', 'Nalu', 'Keanu', 'Makoa', 'Keahi', 'Ikaika', 'Tane',
          'Kane', 'Keoni', 'Liko', 'Manoa', 'Akoni', 'Kaimana', 'Kaleo', 'Pika',
          'Alika', 'Lopaka', 'Maka', 'Alapai', 'Ekewaka', 'Haukea', 'Kapena', 'Kawika',
          'Keola', 'Kiele', 'Konane', 'Mahiai', 'Makani', 'Palani', 'Pono', 'Uluwehi',
          'Kahoku', 'Kale', 'Kamea', 'Kapono', 'Kaui', 'Keaka', 'Kelii',
          'Keonimana', 'Kuulei', 'Lono', 'Makaio', 'Mana', 'Nainoa', 'Noelani',
          'Olakino', 'Palakiko', 'Puana', 'Wahinekoa', 'Ailani', 'Anuhea', 'Haunani', 'Hiapo',
          'Hoaloha', 'Iolana', 'Kahale', 'Kaimi', 'Kaiwi', 'Kamaka', 'Kanoa', 'Kekoa',
          'Keoki', 'Lanakila', 'Makai', 'Maleko', 'Ohana', 'Pulama'
        ],
        female: [
          'Lani', 'Malia', 'Leilani', 'Nalani', 'Mahina', 'Ailani', 'Hoku', 'Kalani',
          'Moana', 'Nani', 'Pele', 'Hina', 'Kailani', 'Noelani', 'Palila', 'Waimea',
          'Halia', 'Iolana', 'Liona', 'Mele', 'Nohea', 'Ulani', 'Emi', 'Haunani',
          'Kawai', 'Nalei', 'Oliana', 'Pualani', 'Tahiti', 'Wailani', 'Anela', 'Ipo',
          'Kaila', 'Kona', 'Maiha', 'Naia', 'Okalani', 'Pohai', 'Ualani', 'Wikolia',
          'Alana', 'Aukai', 'Halona', 'Ilima', 'Kahiau', 'Kaimana', 'Kalena', 'Keala',
          'Keanu', 'Kiele', 'Lana', 'Lehua', 'Lilinoe', 'Makana', 'Malana', 'Mililani',
          'Nohealani', 'Olina', 'Paloma', 'Pilikai', 'Pilialoha', 'Pua', 'Puanani', 'Uluwena',
          'Waialani', 'Wainani', 'Alohi', 'Eleu', 'Iwalani'
        ],
        lastNames: [
          'Kahale', 'Kealoha', 'Akana', 'Kamaka', 'Mahoe', 'Nui', 'Palakiko', 'Wahine',
          'Alani', 'Hoapili', 'Kaeo', 'Lilinoe', 'Manu', 'Noho', 'Paki', 'Uluwehi',
          'Aea', 'Hoku', 'Kahalewai', 'Lono', 'Mahelona', 'Nahale', 'Palani', 'Waiwaiole',
          'Aikane', 'Hanohano', 'Kanaloa', 'Loe', 'Makani', 'Ohana', 'Pukui', 'Wikoli',
          'Ahina', 'Hauoli', 'Kanoa', 'Lua', 'Malama', 'Olelo', 'Pueo', 'Wili',
          'Alohi', 'Hele', 'Kapule', 'Lutu', 'Mana', 'Olina', 'Puna', 'Waipuna',
          'Aniani', 'Hoomana', 'Kauwila', 'Mahalo', 'Mele', 'Palauni', 'Ulupono', 'Waena',
          'Apikalia', 'Ikaika', 'Kekoa', 'Makua', 'Nohili', 'Palea', 'Uluaki', 'Walina',
          'Aiona', 'Hale', 'Kama', 'Lana', 'Moana', 'Nalu', 'Pele', 'Wai',
          'Akau', 'Hina', 'Kani', 'Lani', 'Moku', 'Ola', 'Pono', 'Wiki',
          'Ao', 'Hikina', 'Kau', 'Lei', 'Momi', 'Onaona', 'Pua', 'Wela',
          'Aloha', 'Honu', 'Kekai', 'Loa', 'Mauka', 'Pali', 'Uhane', 'Wana',
          'Aukai', 'Hokulani', 'Kekela', 'Lua', 'Mele', 'Pohaku', 'Waipio', 'Aina',
          'Hele', 'Kiele', 'Lokahi', 'Malie', 'Piko', 'Wailuku', 'Alaka', 'Holo'
        ]
      },

      // Mercenaries - Multinational PMC soldiers with various backgrounds
      mercenary: {
        male: [
          'Jack', 'Mike', 'Ryan', 'Alex', 'Chris', 'Sean', 'Kyle', 'Brandon',
          'Derek', 'Travis', 'Tyler', 'Jason', 'Kevin', 'Marcus', 'Jake', 'Nick',
          'Cole', 'Blake', 'Shane', 'Brett', 'Chase', 'Hunter', 'Austin', 'Logan',
          'Connor', 'Wyatt', 'Mason', 'Carter', 'Evan', 'Owen', 'Luke', 'Nathan',
          'Ivan', 'Dmitri', 'Alexei', 'Viktor', 'Sergei', 'Nikolai', 'Boris', 'Yuri',
          'Andre', 'Marcel', 'Pierre', 'Jean', 'Luc', 'Henri', 'Remy', 'Olivier',
          'Hans', 'Klaus', 'Otto', 'Franz', 'Werner', 'Gunter', 'Dieter', 'Helmut',
          'Carlos', 'Diego', 'Miguel', 'Pablo', 'Rafael', 'Antonio', 'Jose', 'Luis',
          'Hassan', 'Omar', 'Khalid', 'Tariq', 'Malik', 'Rashid', 'Jamal', 'Faisal',
          'Chen', 'Wei', 'Li', 'Zhang', 'Wang', 'Liu', 'Yang', 'Huang',
          'Raj', 'Vikram', 'Arjun', 'Rohan', 'Karan', 'Aditya', 'Dev', 'Kabir',
          'Takeshi', 'Kenji', 'Hiroshi', 'Ryu', 'Satoshi', 'Koji', 'Hideo', 'Makoto',
          'Jack', 'Billy', 'Tom', 'Jim', 'Sam', 'Will', 'Ned', 'Ben', 'Jake', 'Pete',
          'Calico', 'Black', 'Red', 'Long', 'Dead', 'Dutch', 'One-Eye', 'Peg-Leg', 'Hook',
          'Jolly', 'Mad', 'Wild', 'Bloody', 'Iron', 'Silver', 'Gold', 'Brass', 'Cutlass',
          'Storm', 'Thunder', 'Shark', 'Raven', 'Crow', 'Hawk', 'Morgan', 'Teach', 'Kidd',
          'Cutthroat', 'Scurvy', 'Salty', 'Barnacle', 'Deadshot', 'Quickdraw', 'Hooks', 'Bones',
          'Flint', 'Drake', 'Hawkeye', 'Ironside', 'Jaws', 'Knuckles', 'Lefty', 'Moody',
          'Nick', 'Old', 'Powder', 'Rusty', 'Scarface', 'Tattered', 'Ugly', 'Vicious',
          'Wicked', 'Young', 'Blackjack', 'Crimson', 'Dagger', 'Eagle-Eye', 'Firebrand', 'Grizzled',
          'Hammerhead', 'Ironjaw', 'Jackal', 'Knifey', 'Longshot', 'Mangy', 'Notch', 'Orcus'
        ],
        female: [
          'Sarah', 'Jessica', 'Ashley', 'Emily', 'Rachel', 'Nicole', 'Jennifer', 'Amanda',
          'Michelle', 'Melissa', 'Stephanie', 'Rebecca', 'Laura', 'Kimberly', 'Danielle', 'Amy',
          'Samantha', 'Kelly', 'Andrea', 'Angela', 'Lisa', 'Megan', 'Heather', 'Shannon',
          'Taylor', 'Jordan', 'Morgan', 'Riley', 'Casey', 'Avery', 'Quinn', 'Blake',
          'Natasha', 'Svetlana', 'Olga', 'Irina', 'Elena', 'Katya', 'Anya', 'Nadia',
          'Marie', 'Sophie', 'Claire', 'Elise', 'Camille', 'Gabrielle', 'Isabelle', 'Monique',
          'Greta', 'Heidi', 'Petra', 'Ursula', 'Ingrid', 'Astrid', 'Marlene', 'Britta',
          'Carmen', 'Isabella', 'Rosa', 'Lucia', 'Sofia', 'Elena', 'Maria', 'Ana',
          'Fatima', 'Amira', 'Layla', 'Zahra', 'Noor', 'Aisha', 'Yasmin', 'Leila',
          'Mei', 'Ling', 'Yan', 'Xiu', 'Li', 'Fang', 'Jing', 'Hui',
          'Priya', 'Anjali', 'Kavita', 'Neha', 'Pooja', 'Riya', 'Sana', 'Tara',
          'Yuki', 'Sakura', 'Hana', 'Akira', 'Emi', 'Kaori', 'Mika', 'Rei',
          'Anne', 'Mary', 'Grace', 'Bonny', 'Scarlet', 'Ruby', 'Pearl', 'Jade', 'Amber',
          'Black', 'Red', 'Storm', 'Tempest', 'Raven', 'Coral', 'Lightning', 'Eagle',
          'Mad', 'Wild', 'Bloody', 'Iron', 'Silver', 'Gold', 'Siren', 'Vixen', 'Cutlass',
          'Rose', 'Jolly', 'Lucky', 'Sharp', 'Swift', 'Fierce', 'Blade', 'Fury', 'Hawk',
          'Bella', 'Crimson', 'Dusk', 'Emerald', 'Fang', 'Gale', 'Hex', 'Ivory',
          'Jasmine', 'Kestrel', 'Luna', 'Mist', 'Onyx', 'Phoenix', 'Rogue', 'Sapphire',
          'Thorn', 'Venom', 'Whisper', 'Azure', 'Blaze', 'Cinder', 'Dawn', 'Echo',
          'Frost', 'Grim', 'Haze', 'Iris', 'Jinx', 'Karma', 'Lotus', 'Midnight'
        ],
        lastNames: [
          'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson',
          'Moore', 'Taylor', 'Anderson', 'Jackson', 'White', 'Harris', 'Martin', 'Garcia',
          'Thompson', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Walker', 'Hall',
          'Petrov', 'Ivanov', 'Volkov', 'Sokolov', 'Kozlov', 'Novikov', 'Morozov', 'Popov',
          'Dubois', 'Lefebvre', 'Martin', 'Bernard', 'Moreau', 'Laurent', 'Simon', 'Michel',
          'Mueller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker',
          'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres', 'Rivera',
          'Hassan', 'Ali', 'Ahmed', 'Khan', 'Mahmoud', 'Hussein', 'Rashid', 'Sharif',
          'Chen', 'Wang', 'Li', 'Zhang', 'Liu', 'Yang', 'Huang', 'Zhao',
          'Patel', 'Singh', 'Kumar', 'Sharma', 'Reddy', 'Gupta', 'Verma', 'Shah',
          'Tanaka', 'Suzuki', 'Takahashi', 'Watanabe', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Sato',
          'Black', 'Stone', 'Steel', 'Cross', 'Fox', 'Wolf', 'Hawk', 'Hunter',
          'Graves', 'Kane', 'Storm', 'Knight', 'Frost', 'Rivers', 'Burns', 'West',
          'Bonney', 'Rackham', 'Teach', 'Blackbeard', 'Redbeard', 'Morgan', 'Kidd', 'Flint',
          'Silver', 'Hawkins', 'Smollett', 'Trelawney', 'Roberts', 'Bartholomew', 'Calico', 'Vane',
          'The Red', 'The Black', 'The Bold', 'The Bloody', 'The Mad', 'The Wild', 'No-Mercy',
          'Ironhand', 'Steelgaze', 'Sharktooth', 'Seadevil', 'Stormrider', 'Wavecutter', 'Reefbreaker',
          'Bloodsail', 'Blackflag', 'Skullcrusher', 'Bonecruncher', 'Throatslitter', 'Backstabber',
          'Cutlass', 'Sabre', 'Dagger', 'Dirk', 'Rapier', 'Scimitar', 'Cleaver', 'Hatchet',
          'Grog', 'Rum', 'Whiskey', 'Gin', 'Brandy', 'Ale', 'Tankard', 'Swill',
          'Barnacle', 'Scurvy', 'Pox', 'Plague', 'Scab', 'Scar', 'Stump', 'Gimp',
          'The Cruel', 'The Fierce', 'The Merciless', 'The Ruthless', 'The Savage', 'The Terrible', 'The Vile',
          'Blackheart', 'Coldsteel', 'Darksail', 'Evileye', 'Firebrand', 'Grimskull', 'Hardtack',
          'Ironhook', 'Jollyroger', 'Keelhauler', 'Longshanks', 'Murdock', 'Nightshade', 'Oakum',
          'Plunderer', 'Quickblade', 'Raider', 'Scallywag', 'Tidecaller', 'Undertow', 'Vengeance',
          'Weatherby', 'Crossbones', 'Deadwater', 'Executioner', 'Freebooter', 'Gallows', 'Harpooner'
        ]
      }
    };
  }

  /**
   * Generate a unique name for an NPC
   * @param {string} faction - The NPC's faction
   * @param {string} gender - 'male' or 'female'
   * @param {object} seededRandom - Seeded random generator instance
   * @returns {object} {firstName, lastName, fullName}
   */
  generateName(faction, gender, seededRandom) {
    const factionNames = this.names[faction];
    if (!factionNames) {
      console.warn(`Unknown faction: ${faction}, using castaway names`);
      return this.generateName('castaway', gender, seededRandom);
    }

    // Default to male if gender not specified or invalid
    const genderPool = factionNames[gender] || factionNames.male;
    if (!genderPool) {
      console.warn(`No ${gender} names for faction ${faction}, using male names`);
      return this.generateName(faction, 'male', seededRandom);
    }

    const maxAttempts = 1000; // Prevent infinite loop
    let attempts = 0;

    while (attempts < maxAttempts) {
      const firstName = seededRandom.choice(genderPool);
      const lastName = seededRandom.choice(factionNames.lastNames);
      const fullName = `${firstName} ${lastName}`;
      const key = `${faction}:${fullName}`;

      // Check if this combination is unused
      if (!this.usedCombinations.has(key)) {
        this.usedCombinations.add(key);
        return { firstName, lastName, fullName };
      }

      attempts++;
    }

    // Fallback: if we've somehow used all combinations, allow duplicates with warning
    console.warn(`All name combinations exhausted for faction: ${faction}`);
    const firstName = seededRandom.choice(genderPool);
    const lastName = seededRandom.choice(factionNames.lastNames);
    const fullName = `${firstName} ${lastName}`;
    return { firstName, lastName, fullName };
  }

  /**
   * Mark a name as used (for loading saved NPCs)
   */
  markNameAsUsed(faction, fullName) {
    const key = `${faction}:${fullName}`;
    this.usedCombinations.add(key);
  }

  /**
   * Get all used name combinations (for saving)
   */
  getUsedNames() {
    return Array.from(this.usedCombinations);
  }

  /**
   * Load used names (for loading saves)
   */
  loadUsedNames(usedNames) {
    this.usedCombinations = new Set(usedNames || []);
  }

  /**
   * Clear all used names (for new game)
   */
  clearUsedNames() {
    this.usedCombinations.clear();
  }

  /**
   * Get statistics about available names
   */
  getStats(faction = null) {
    if (faction) {
      const factionNames = this.names[faction];
      if (!factionNames) return null;
      
      const maleCombos = factionNames.male.length * factionNames.lastNames.length;
      const femaleCombos = factionNames.female.length * factionNames.lastNames.length;
      const totalCombinations = maleCombos + femaleCombos;
      
      const usedCount = Array.from(this.usedCombinations)
        .filter(key => key.startsWith(`${faction}:`))
        .length;
      
      return {
        faction,
        maleCombinations: maleCombos,
        femaleCombinations: femaleCombos,
        totalCombinations,
        used: usedCount,
        available: totalCombinations - usedCount,
        percentUsed: ((usedCount / totalCombinations) * 100).toFixed(2)
      };
    }

    // Overall stats
    const stats = {};
    for (const faction in this.names) {
      stats[faction] = this.getStats(faction);
    }
    return stats;
  }
}
