/**
 * PokéBattle Type Effectiveness Matrix and Color Palettes
 * Full standard 18-type matrix with dual-typing support
 */

export const POKEMON_TYPES = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
  'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
];

export const TYPE_COLORS = {
  Normal: { bg: '#A8A77A', text: '#FFFFFF', border: '#79754E' },
  Fire: { bg: '#EE8130', text: '#FFFFFF', border: '#9C531F' },
  Water: { bg: '#6390F0', text: '#FFFFFF', border: '#445E9C' },
  Electric: { bg: '#F7D02C', text: '#1E1E1E', border: '#A1871F' },
  Grass: { bg: '#7AC74C', text: '#FFFFFF', border: '#4E8234' },
  Ice: { bg: '#96D9D6', text: '#1E1E1E', border: '#638D8D' },
  Fighting: { bg: '#C22E28', text: '#FFFFFF', border: '#7D1F1A' },
  Poison: { bg: '#A33EA1', text: '#FFFFFF', border: '#682A68' },
  Ground: { bg: '#E2BF65', text: '#1E1E1E', border: '#927D44' },
  Flying: { bg: '#A98FF3', text: '#FFFFFF', border: '#6D5E9C' },
  Psychic: { bg: '#F95587', text: '#FFFFFF', border: '#A13959' },
  Bug: { bg: '#A6B91A', text: '#FFFFFF', border: '#6D7815' },
  Rock: { bg: '#B6A136', text: '#FFFFFF', border: '#786B24' },
  Ghost: { bg: '#735797', text: '#FFFFFF', border: '#493963' },
  Dragon: { bg: '#6F35FC', text: '#FFFFFF', border: '#4924A1' },
  Dark: { bg: '#705746', text: '#FFFFFF', border: '#49392F' },
  Steel: { bg: '#B7B7CE', text: '#1E1E1E', border: '#787887' },
  Fairy: { bg: '#D685AD', text: '#FFFFFF', border: '#9E607F' }
};

// Attacking Type -> Defending Type -> Multiplier (0, 0.5, 2.0; unlisted is 1.0)
const TYPE_CHART = {
  Normal: { Rock: 0.5, Ghost: 0.0, Steel: 0.5 },
  Fire: { Fire: 0.5, Water: 0.5, Grass: 2.0, Ice: 2.0, Bug: 2.0, Rock: 0.5, Dragon: 0.5, Steel: 2.0 },
  Water: { Fire: 2.0, Water: 0.5, Grass: 0.5, Ground: 2.0, Rock: 2.0, Dragon: 0.5 },
  Electric: { Water: 2.0, Electric: 0.5, Grass: 0.5, Ground: 0.0, Flying: 2.0, Dragon: 0.5 },
  Grass: { Fire: 0.5, Water: 2.0, Grass: 0.5, Poison: 0.5, Ground: 2.0, Flying: 0.5, Bug: 0.5, Rock: 2.0, Dragon: 0.5, Steel: 0.5 },
  Ice: { Fire: 0.5, Water: 0.5, Grass: 2.0, Ice: 0.5, Ground: 2.0, Flying: 2.0, Dragon: 2.0, Steel: 0.5 },
  Fighting: { Normal: 2.0, Ice: 2.0, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2.0, Ghost: 0.0, Dark: 2.0, Steel: 2.0, Fairy: 0.5 },
  Poison: { Grass: 2.0, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0.0, Fairy: 2.0 },
  Ground: { Fire: 2.0, Electric: 2.0, Grass: 0.5, Poison: 2.0, Flying: 0.0, Bug: 0.5, Rock: 2.0, Steel: 2.0 },
  Flying: { Electric: 0.5, Grass: 2.0, Fighting: 2.0, Bug: 2.0, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2.0, Poison: 2.0, Psychic: 0.5, Dark: 0.0, Steel: 0.5 },
  Bug: { Fire: 0.5, Grass: 2.0, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2.0, Ghost: 0.5, Dark: 2.0, Steel: 0.5, Fairy: 0.5 },
  Rock: { Fire: 2.0, Ice: 2.0, Fighting: 0.5, Ground: 0.5, Flying: 2.0, Bug: 2.0, Steel: 0.5 },
  Ghost: { Normal: 0.0, Psychic: 2.0, Ghost: 2.0, Dark: 0.5 },
  Dragon: { Dragon: 2.0, Steel: 0.5, Fairy: 0.0 },
  Dark: { Fighting: 0.5, Psychic: 2.0, Ghost: 2.0, Dark: 0.5, Fairy: 0.5 },
  Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2.0, Rock: 2.0, Steel: 0.5, Fairy: 2.0 },
  Fairy: { Fire: 0.5, Fighting: 2.0, Poison: 0.5, Dragon: 2.0, Dark: 2.0, Steel: 0.5 }
};

/**
 * Calculates the damage multiplier of an attack type against defender types (supports single or dual typing)
 * @param {string} attackType - e.g. "Fire"
 * @param {string[]} defenderTypes - e.g. ["Grass", "Poison"]
 * @returns {number} multiplier: 0, 0.25, 0.5, 1, 2, or 4
 */
export function getTypeEffectiveness(attackType, defenderTypes) {
  if (!attackType || !defenderTypes || defenderTypes.length === 0) return 1.0;
  let multiplier = 1.0;
  const attackRelations = TYPE_CHART[attackType] || {};

  for (const defType of defenderTypes) {
    if (attackRelations[defType] !== undefined) {
      multiplier *= attackRelations[defType];
    }
  }

  return multiplier;
}
