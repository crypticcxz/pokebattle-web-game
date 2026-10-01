/**
 * PokéBattle Core Game Engine
 * Handles full battle state machine, turn resolution, damage formulas, and status conditions
 */

import { getTypeEffectiveness } from './typeChart.js';
import { createPokemonInstance } from './data.js';

export class BattleEngine {
  constructor(team1Names, team2Names, player1IsAi = false, player2IsAi = true) {
    this.teams = [
      team1Names.map(name => createPokemonInstance(name)),
      team2Names.map(name => createPokemonInstance(name))
    ];
    this.activeIndices = [0, 0];
    this.turn = 1;
    this.isAi = [player1IsAi, player2IsAi];
    this.battleLog = [];
    this.isOver = false;
    this.winner = null;
  }

  // Clones the battle state efficiently for Minimax search
  clone() {
    const copy = new BattleEngine([], [], this.isAi[0], this.isAi[1]);
    copy.teams = [
      this.teams[0].map(p => this.clonePokemon(p)),
      this.teams[1].map(p => this.clonePokemon(p))
    ];
    copy.activeIndices = [...this.activeIndices];
    copy.turn = this.turn;
    copy.isOver = this.isOver;
    copy.winner = this.winner;
    copy.battleLog = []; // Omit logs during AI simulation for maximum speed
    return copy;
  }

  clonePokemon(p) {
    return {
      name: p.name,
      id: p.id,
      types: [...p.types],
      stats: { ...p.stats },
      currentHp: p.currentHp,
      maxHp: p.maxHp,
      moves: p.moves.map(m => ({ ...m })),
      statusCondition: p.statusCondition,
      sleepTurns: p.sleepTurns,
      sprites: p.sprites,
      color: p.color,
      damageDealt: p.damageDealt,
      kos: p.kos
    };
  }

  getActive(playerIdx) {
    const team = this.teams[playerIdx];
    const idx = this.activeIndices[playerIdx];
    return team[idx] || null;
  }

  getOpponent(playerIdx) {
    return this.getActive(1 - playerIdx);
  }

  getAvailableSwitches(playerIdx) {
    const team = this.teams[playerIdx];
    const currentIdx = this.activeIndices[playerIdx];
    const available = [];
    team.forEach((p, i) => {
      if (p.currentHp > 0 && i !== currentIdx) {
        available.push(i);
      }
    });
    return available;
  }

  getEffectiveStat(pokemon, statName) {
    let val = pokemon.stats[statName] || 0;
    if (statName === 'attack' && pokemon.statusCondition === 'Burn') {
      val = Math.floor(val * 0.5);
    }
    if (statName === 'speed' && pokemon.statusCondition === 'Paralyze') {
      val = Math.floor(val * 0.25);
    }
    return Math.max(1, val);
  }

  calculateDamage(attacker, defender, move, isSim = false) {
    if (!attacker || !defender || defender.currentHp <= 0 || move.category === 'Status' || move.power <= 0) {
      return { damage: 0, effectiveness: 1.0, isCrit: false, stab: 1.0 };
    }

    const LEVEL = 50;
    let atkStat = move.category === 'Physical'
      ? this.getEffectiveStat(attacker, 'attack')
      : this.getEffectiveStat(attacker, 'special_attack');

    let defStat = move.category === 'Physical'
      ? this.getEffectiveStat(defender, 'defense')
      : this.getEffectiveStat(defender, 'special_defense');

    // Base damage
    let baseDamage = (((2 * LEVEL / 5 + 2) * move.power * (atkStat / defStat)) / 50) + 2;

    // STAB (Same Type Attack Bonus)
    const hasStab = attacker.types.includes(move.type);
    const stabMultiplier = hasStab ? 1.5 : 1.0;
    baseDamage *= stabMultiplier;

    // Type effectiveness
    const typeMultiplier = getTypeEffectiveness(move.type, defender.types);
    baseDamage *= typeMultiplier;

    if (typeMultiplier === 0) {
      return { damage: 0, effectiveness: 0, isCrit: false, stab: stabMultiplier };
    }

    // Critical Hit (6.25% chance in real play, ignored in simulation for deterministic evaluation)
    const isCrit = !isSim && Math.random() < 0.0625;
    if (isCrit) {
      baseDamage *= 1.5;
    }

    // Random variance (0.85 to 1.00)
    const variance = isSim ? 0.925 : (0.85 + Math.random() * 0.15);
    let finalDamage = Math.max(1, Math.floor(baseDamage * variance));

    return {
      damage: finalDamage,
      effectiveness: typeMultiplier,
      isCrit: isCrit,
      stab: stabMultiplier
    };
  }

  // Pre-turn checks: Sleep / Paralysis
  canPokemonAct(playerIdx, isSim = false) {
    const pokemon = this.getActive(playerIdx);
    if (!pokemon || pokemon.currentHp <= 0) return { canAct: false, reason: 'fainted' };

    if (pokemon.statusCondition === 'Paralyze') {
      if (Math.random() < 0.25) {
        if (!isSim) this.log(`${pokemon.name} is fully paralyzed! It can't move!`);
        return { canAct: false, reason: 'paralyzed' };
      }
    }

    if (pokemon.statusCondition === 'Sleep') {
      if (pokemon.sleepTurns > 0) {
        pokemon.sleepTurns -= 1;
        if (!isSim) this.log(`${pokemon.name} is fast asleep! (${pokemon.sleepTurns + 1} turns left)`);
        return { canAct: false, reason: 'sleeping' };
      } else {
        // Chance to wake up
        if (Math.random() < 0.5 || pokemon.sleepTurns <= 0) {
          pokemon.statusCondition = null;
          if (!isSim) this.log(`${pokemon.name} woke up!`);
        } else {
          if (!isSim) this.log(`${pokemon.name} is fast asleep!`);
          return { canAct: false, reason: 'sleeping' };
        }
      }
    }

    return { canAct: true };
  }

  executeAction(playerIdx, action, isSim = false) {
    // Action format: { type: 'move', moveIdx: 0 } OR { type: 'switch', targetIdx: 1 }
    const attacker = this.getActive(playerIdx);
    const opponentIdx = 1 - playerIdx;
    const defender = this.getActive(opponentIdx);

    if (action.type === 'switch') {
      const oldActive = this.teams[playerIdx][this.activeIndices[playerIdx]];
      this.activeIndices[playerIdx] = action.targetIdx;
      const newActive = this.getActive(playerIdx);
      if (!isSim) {
        this.log(`Player ${playerIdx + 1} withdrew ${oldActive.name} and sent out ${newActive.name}!`);
      }
      return { success: true, switched: true, newPokemon: newActive };
    }

    if (action.type === 'move') {
      const move = attacker && attacker.moves ? attacker.moves[action.moveIdx] : null;
      if (!attacker || attacker.currentHp <= 0 || !defender || defender.currentHp <= 0) {
        return { success: false, move };
      }

      if (!move || move.currentPp <= 0) {
        if (!isSim) this.log(`${attacker.name} tried to use ${move ? move.name : 'a move'}, but has no PP left!`);
        return { success: false, move };
      }

      move.currentPp -= 1;
      if (!isSim) this.log(`${attacker.name} used ${move.name}!`);

      // Accuracy check
      if (Math.random() > move.accuracy) {
        if (!isSim) this.log(`The attack missed!`);
        return { success: true, missed: true, move };
      }

      // Status moves
      if (move.category === 'Status') {
        let applied = false;
        if (move.name === 'Thunder Wave') {
          if (!defender.types.includes('Electric') && !defender.statusCondition) {
            defender.statusCondition = 'Paralyze';
            applied = true;
            if (!isSim) this.log(`${defender.name} was paralyzed! It may be unable to move!`);
          } else if (!isSim) {
            this.log(`It doesn't affect ${defender.name}...`);
          }
        } else if (move.name === 'Hypnosis' || move.name === 'Sleep Powder') {
          if (!defender.statusCondition) {
            defender.statusCondition = 'Sleep';
            defender.sleepTurns = isSim ? 2 : Math.floor(Math.random() * 3) + 1;
            applied = true;
            if (!isSim) this.log(`${defender.name} fell fast asleep!`);
          } else if (!isSim) {
            this.log(`It doesn't affect ${defender.name}...`);
          }
        }
        return { success: true, statusApplied: applied, move };
      }

      // Damage calculation
      const { damage, effectiveness, isCrit } = this.calculateDamage(attacker, defender, move, isSim);
      defender.currentHp = Math.max(0, defender.currentHp - damage);
      attacker.damageDealt += damage;

      if (!isSim) {
        if (effectiveness === 0) {
          this.log(`It had no effect on ${defender.name}!`);
        } else {
          if (isCrit) this.log(`A critical hit!`);
          if (effectiveness > 1.0) this.log(`It's super effective!`);
          if (effectiveness < 1.0) this.log(`It's not very effective...`);
          this.log(`${defender.name} took ${damage} damage! (${defender.currentHp}/${defender.maxHp} HP remaining)`);
        }
      }

      // Secondary effects on damage moves (e.g. Flamethrower / Flare Blitz burn)
      if (move.effect && defender.currentHp > 0 && !defender.statusCondition) {
        if (Math.random() < move.effect.chance) {
          if (move.effect.status === 'Burn' && !defender.types.includes('Fire')) {
            defender.statusCondition = 'Burn';
            if (!isSim) this.log(`${defender.name} was burned!`);
          } else if (move.effect.status === 'Poison' && !defender.types.includes('Poison') && !defender.types.includes('Steel')) {
            defender.statusCondition = 'Poison';
            if (!isSim) this.log(`${defender.name} was poisoned!`);
          } else if (move.effect.status === 'Paralyze' && !defender.types.includes('Electric')) {
            defender.statusCondition = 'Paralyze';
            if (!isSim) this.log(`${defender.name} was paralyzed!`);
          }
        }
      }

      // KO check
      let fainted = false;
      if (defender.currentHp <= 0) {
        fainted = true;
        attacker.kos += 1;
        if (!isSim) this.log(`${defender.name} fainted!`);
      }

      return {
        success: true,
        damage,
        effectiveness,
        isCrit,
        fainted,
        move
      };
    }

    return { success: false };
  }

  // End of turn status damage (Burn, Poison)
  applyEndOfTurnStatus(isSim = false) {
    const results = [];
    for (let pIdx = 0; pIdx < 2; pIdx++) {
      const pokemon = this.getActive(pIdx);
      if (pokemon && pokemon.currentHp > 0 && (pokemon.statusCondition === 'Burn' || pokemon.statusCondition === 'Poison')) {
        const damage = Math.max(1, Math.floor(pokemon.maxHp / 16));
        pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
        if (!isSim) {
          this.log(`${pokemon.name} is hurt by its ${pokemon.statusCondition}! (${damage} dmg)`);
          if (pokemon.currentHp <= 0) {
            this.log(`${pokemon.name} fainted from its status condition!`);
          }
        }
        results.push({ playerIdx: pIdx, pokemon, damage, fainted: pokemon.currentHp <= 0 });
      }
    }
    return results;
  }

  forceSwitch(playerIdx, targetIdx) {
    const team = this.teams[playerIdx];
    if (targetIdx >= 0 && targetIdx < team.length && team[targetIdx].currentHp > 0) {
      this.activeIndices[playerIdx] = targetIdx;
      this.log(`Player ${playerIdx + 1} sent out ${team[targetIdx].name}!`);
      return true;
    }
    return false;
  }

  checkGameOver() {
    const p1Dead = this.teams[0].every(p => p.currentHp <= 0);
    const p2Dead = this.teams[1].every(p => p.currentHp <= 0);

    if (p1Dead && p2Dead) {
      this.isOver = true;
      this.winner = 'Draw';
      return true;
    }
    if (p1Dead) {
      this.isOver = true;
      this.winner = 'Player 2';
      return true;
    }
    if (p2Dead) {
      this.isOver = true;
      this.winner = 'Player 1';
      return true;
    }
    return false;
  }

  log(message) {
    this.battleLog.push({ turn: this.turn, message });
  }
}
