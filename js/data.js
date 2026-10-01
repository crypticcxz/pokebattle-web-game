/**
 * PokéBattle Pokemon & Move Definitions
 * Matches and enhances the original Python definitions with sprites, priority, and sound tags
 */

export const MOVES_DATA = {
  Flamethrower: {
    name: 'Flamethrower',
    type: 'Fire',
    category: 'Special',
    power: 90,
    accuracy: 1.0,
    maxPp: 15,
    priority: 0,
    effect: { status: 'Burn', chance: 0.1 },
    description: 'The target is scorched with an intense blast of fire. May cause a burn (10%).'
  },
  'Dragon Claw': {
    name: 'Dragon Claw',
    type: 'Dragon',
    category: 'Physical',
    power: 80,
    accuracy: 1.0,
    maxPp: 15,
    priority: 0,
    effect: null,
    description: 'The user slashes the target with huge, sharp claws.'
  },
  'Air Slash': {
    name: 'Air Slash',
    type: 'Flying',
    category: 'Special',
    power: 75,
    accuracy: 0.95,
    maxPp: 15,
    priority: 0,
    effect: null,
    description: 'The user attacks with a blade of air that slices even the sky.'
  },
  'Thunder Wave': {
    name: 'Thunder Wave',
    type: 'Electric',
    category: 'Status',
    power: 0,
    accuracy: 0.9,
    maxPp: 20,
    priority: 0,
    effect: { status: 'Paralyze', chance: 1.0 },
    description: 'A weak electric shock that paralyzes the target.'
  },
  'Hydro Pump': {
    name: 'Hydro Pump',
    type: 'Water',
    category: 'Special',
    power: 110,
    accuracy: 0.8,
    maxPp: 5,
    priority: 0,
    effect: null,
    description: 'The target is blasted by a huge volume of water launched under great pressure.'
  },
  'Ice Beam': {
    name: 'Ice Beam',
    type: 'Ice',
    category: 'Special',
    power: 90,
    accuracy: 1.0,
    maxPp: 10,
    priority: 0,
    effect: null,
    description: 'The target is struck with an icy-cold beam of energy.'
  },
  'Skull Bash': {
    name: 'Skull Bash',
    type: 'Normal',
    category: 'Physical',
    power: 130,
    accuracy: 1.0,
    maxPp: 10,
    priority: 0,
    effect: null,
    description: 'The user tucks in its head and slams into the target with crushing force.'
  },
  Bite: {
    name: 'Bite',
    type: 'Dark',
    category: 'Physical',
    power: 60,
    accuracy: 1.0,
    maxPp: 25,
    priority: 0,
    effect: null,
    description: 'The target is bitten with viciously sharp fangs.'
  },
  'Vine Whip': {
    name: 'Vine Whip',
    type: 'Grass',
    category: 'Physical',
    power: 45,
    accuracy: 1.0,
    maxPp: 25,
    priority: 0,
    effect: null,
    description: 'The target is struck with slender, whiplike vines.'
  },
  'Sludge Bomb': {
    name: 'Sludge Bomb',
    type: 'Poison',
    category: 'Special',
    power: 90,
    accuracy: 1.0,
    maxPp: 10,
    priority: 0,
    effect: { status: 'Poison', chance: 0.3 },
    description: 'Unsanitary sludge is hurled at the target. May also poison the target (30%).'
  },
  'Sleep Powder': {
    name: 'Sleep Powder',
    type: 'Grass',
    category: 'Status',
    power: 0,
    accuracy: 0.75,
    maxPp: 15,
    priority: 0,
    effect: { status: 'Sleep', chance: 1.0 },
    description: 'The user scatters a big cloud of sleep-inducing powder.'
  },
  Tackle: {
    name: 'Tackle',
    type: 'Normal',
    category: 'Physical',
    power: 40,
    accuracy: 1.0,
    maxPp: 35,
    priority: 0,
    effect: null,
    description: 'A physical attack in which the user charges and slams into the target.'
  },
  Thunderbolt: {
    name: 'Thunderbolt',
    type: 'Electric',
    category: 'Special',
    power: 90,
    accuracy: 1.0,
    maxPp: 15,
    priority: 0,
    effect: { status: 'Paralyze', chance: 0.1 },
    description: 'A strong electric blast crashes down on the target. May paralyze (10%).'
  },
  'Quick Attack': {
    name: 'Quick Attack',
    type: 'Normal',
    category: 'Physical',
    power: 40,
    accuracy: 1.0,
    maxPp: 30,
    priority: 1, // +1 Priority
    effect: null,
    description: 'The user lunges at the target at a speed that makes it almost invisible. Strikes first!'
  },
  'Shadow Ball': {
    name: 'Shadow Ball',
    type: 'Ghost',
    category: 'Special',
    power: 80,
    accuracy: 1.0,
    maxPp: 15,
    priority: 0,
    effect: null,
    description: 'The user hurls a shadowy blob at the target.'
  },
  Hypnosis: {
    name: 'Hypnosis',
    type: 'Psychic',
    category: 'Status',
    power: 0,
    accuracy: 0.6,
    maxPp: 20,
    priority: 0,
    effect: { status: 'Sleep', chance: 1.0 },
    description: 'The user employs hypnotic suggestion to make the target fall asleep.'
  },
  'Flare Blitz': {
    name: 'Flare Blitz',
    type: 'Fire',
    category: 'Physical',
    power: 120,
    accuracy: 1.0,
    maxPp: 15,
    priority: 0,
    effect: { status: 'Burn', chance: 0.1 },
    description: 'The user cloaks itself in fire and charges at the target. May cause a burn (10%).'
  },
  'Extreme Speed': {
    name: 'Extreme Speed',
    type: 'Normal',
    category: 'Physical',
    power: 80,
    accuracy: 1.0,
    maxPp: 5,
    priority: 2, // +2 Priority
    effect: null,
    description: 'The user charges the target at blinding speed. This move always goes first!'
  }
};

export const POKEMON_DATA = {
  Charizard: {
    name: 'Charizard',
    id: 6,
    types: ['Fire', 'Flying'],
    stats: { hp: 78, attack: 84, defense: 78, special_attack: 109, special_defense: 85, speed: 100 },
    moves: ['Flamethrower', 'Dragon Claw', 'Air Slash', 'Thunder Wave'],
    sprites: {
      front: 'https://play.pokemonshowdown.com/sprites/ani/charizard.gif',
      back: 'https://play.pokemonshowdown.com/sprites/ani-back/charizard.gif',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png'
    },
    color: '#EE8130'
  },
  Blastoise: {
    name: 'Blastoise',
    id: 9,
    types: ['Water'],
    stats: { hp: 79, attack: 83, defense: 100, special_attack: 85, special_defense: 105, speed: 78 },
    moves: ['Hydro Pump', 'Ice Beam', 'Skull Bash', 'Bite'],
    sprites: {
      front: 'https://play.pokemonshowdown.com/sprites/ani/blastoise.gif',
      back: 'https://play.pokemonshowdown.com/sprites/ani-back/blastoise.gif',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png'
    },
    color: '#6390F0'
  },
  Venusaur: {
    name: 'Venusaur',
    id: 3,
    types: ['Grass', 'Poison'],
    stats: { hp: 80, attack: 82, defense: 83, special_attack: 100, special_defense: 100, speed: 80 },
    moves: ['Vine Whip', 'Sludge Bomb', 'Sleep Powder', 'Tackle'],
    sprites: {
      front: 'https://play.pokemonshowdown.com/sprites/ani/venusaur.gif',
      back: 'https://play.pokemonshowdown.com/sprites/ani-back/venusaur.gif',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png'
    },
    color: '#7AC74C'
  },
  Pikachu: {
    name: 'Pikachu',
    id: 25,
    types: ['Electric'],
    stats: { hp: 35, attack: 40, defense: 40, special_attack: 60, special_defense: 50, speed: 120 },
    moves: ['Thunderbolt', 'Quick Attack', 'Thunder Wave', 'Tackle'],
    sprites: {
      front: 'https://play.pokemonshowdown.com/sprites/ani/pikachu.gif',
      back: 'https://play.pokemonshowdown.com/sprites/ani-back/pikachu.gif',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
    },
    color: '#F7D02C'
  },
  Gengar: {
    name: 'Gengar',
    id: 94,
    types: ['Ghost', 'Poison'],
    stats: { hp: 60, attack: 65, defense: 60, special_attack: 130, special_defense: 75, speed: 110 },
    moves: ['Shadow Ball', 'Sludge Bomb', 'Thunderbolt', 'Hypnosis'],
    sprites: {
      front: 'https://play.pokemonshowdown.com/sprites/ani/gengar.gif',
      back: 'https://play.pokemonshowdown.com/sprites/ani-back/gengar.gif',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png'
    },
    color: '#735797'
  },
  Arcanine: {
    name: 'Arcanine',
    id: 59,
    types: ['Fire'],
    stats: { hp: 90, attack: 110, defense: 80, special_attack: 100, special_defense: 80, speed: 95 },
    moves: ['Flare Blitz', 'Extreme Speed', 'Flamethrower', 'Bite'],
    sprites: {
      front: 'https://play.pokemonshowdown.com/sprites/ani/arcanine.gif',
      back: 'https://play.pokemonshowdown.com/sprites/ani-back/arcanine.gif',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/59.png'
    },
    color: '#EE8130'
  }
};

/**
 * Creates a fresh clone of a Pokemon with its moves and HP
 */
export function createPokemonInstance(pokemonName) {
  const base = POKEMON_DATA[pokemonName];
  if (!base) throw new Error(`Unknown Pokemon: ${pokemonName}`);

  const moves = base.moves.map(mName => {
    const mData = MOVES_DATA[mName];
    return {
      ...mData,
      currentPp: mData.maxPp
    };
  });

  return {
    name: base.name,
    id: base.id,
    types: [...base.types],
    stats: { ...base.stats },
    currentHp: base.stats.hp,
    maxHp: base.stats.hp,
    moves: moves,
    statusCondition: null, // "Burn", "Poison", "Paralyze", "Sleep"
    sleepTurns: 0,
    sprites: { ...base.sprites },
    color: base.color,
    damageDealt: 0,
    kos: 0
  };
}
