/**
 * PokéBattle Minimax AI Engine with Alpha-Beta Pruning
 * Implements depth-4 search with performance profiling and diagnostic telemetry
 */

import { getTypeEffectiveness } from './typeChart.js';

export class PokeAI {
  constructor(depth = 4) {
    this.maxDepth = depth;
    this.lastProfile = null;
  }

  evaluateState(battle, aiPlayerIdx) {
    const oppPlayerIdx = 1 - aiPlayerIdx;

    if (battle.checkGameOver()) {
      if (battle.winner === `Player ${aiPlayerIdx + 1}`) return 10000;
      if (battle.winner === `Player ${oppPlayerIdx + 1}`) return -10000;
      return 0;
    }

    const aiTeam = battle.teams[aiPlayerIdx];
    const oppTeam = battle.teams[oppPlayerIdx];

    const aiAlive = aiTeam.filter(p => p.currentHp > 0).length;
    const oppAlive = oppTeam.filter(p => p.currentHp > 0).length;

    const aiHpRatio = aiTeam.reduce((acc, p) => acc + (p.currentHp > 0 ? p.currentHp / p.maxHp : 0), 0);
    const oppHpRatio = oppTeam.reduce((acc, p) => acc + (p.currentHp > 0 ? p.currentHp / p.maxHp : 0), 0);

    // Heuristic base score
    let score = (aiAlive - oppAlive) * 2.0;
    score += (aiHpRatio - oppHpRatio) * 1.0;

    // Status effect modifiers
    const aiActive = battle.getActive(aiPlayerIdx);
    const oppActive = battle.getActive(oppPlayerIdx);

    if (aiActive && aiActive.statusCondition) {
      score -= (aiActive.statusCondition === 'Sleep' ? 0.35 : 0.2);
    }
    if (oppActive && oppActive.statusCondition) {
      score += (oppActive.statusCondition === 'Sleep' ? 0.35 : 0.2);
    }

    // Matchup type advantage bonus
    if (aiActive && oppActive && aiActive.currentHp > 0 && oppActive.currentHp > 0) {
      let bestAiEff = 0;
      for (const m of aiActive.moves) {
        if (m.power > 0) {
          const eff = getTypeEffectiveness(m.type, oppActive.types);
          if (eff > bestAiEff) bestAiEff = eff;
        }
      }
      if (bestAiEff > 1.0) score += 0.3;
      if (bestAiEff < 1.0 && bestAiEff > 0) score -= 0.15;
    }

    return score;
  }

  getPossibleActions(battle, playerIdx) {
    const active = battle.getActive(playerIdx);
    if (!active || active.currentHp <= 0) return [];

    const actions = [];

    // Move actions
    active.moves.forEach((move, idx) => {
      if (move.currentPp > 0) {
        actions.push({ type: 'move', moveIdx: idx, name: move.name, move });
      }
    });

    // If active has low HP or bad matchup, consider switching if team members are healthy
    const switches = battle.getAvailableSwitches(playerIdx);
    if (switches.length > 0 && active.currentHp / active.maxHp < 0.25) {
      switches.forEach(switchIdx => {
        const switchPoke = battle.teams[playerIdx][switchIdx];
        if (switchPoke.currentHp / switchPoke.maxHp > 0.5) {
          actions.push({ type: 'switch', targetIdx: switchIdx, name: `Switch to ${switchPoke.name}` });
        }
      });
    }

    return actions;
  }

  minimax(battle, depth, isMaximizing, aiPlayerIdx, currentTurnIdx, alpha, beta, stats) {
    stats.nodesVisited += 1;
    const oppPlayerIdx = 1 - currentTurnIdx;

    if (depth === 0 || battle.checkGameOver()) {
      return { score: this.evaluateState(battle, aiPlayerIdx), action: null };
    }

    const possibleActions = this.getPossibleActions(battle, currentTurnIdx);
    if (possibleActions.length === 0) {
      return { score: this.evaluateState(battle, aiPlayerIdx), action: null };
    }

    let bestAction = possibleActions[0];

    if (isMaximizing) {
      let maxScore = -Infinity;

      for (const action of possibleActions) {
        const sim = battle.clone();
        sim.executeAction(currentTurnIdx, action, true);
        sim.applyEndOfTurnStatus(true);

        const result = this.minimax(sim, depth - 1, false, aiPlayerIdx, oppPlayerIdx, alpha, beta, stats);

        if (result.score > maxScore) {
          maxScore = result.score;
          bestAction = action;
        }

        alpha = Math.max(alpha, result.score);
        if (beta <= alpha) {
          stats.prunedBranches += 1;
          break; // Beta cutoff
        }
      }

      return { score: maxScore, action: bestAction };
    } else {
      let minScore = Infinity;

      for (const action of possibleActions) {
        const sim = battle.clone();
        sim.executeAction(currentTurnIdx, action, true);
        sim.applyEndOfTurnStatus(true);

        const result = this.minimax(sim, depth - 1, true, aiPlayerIdx, oppPlayerIdx, alpha, beta, stats);

        if (result.score < minScore) {
          minScore = result.score;
          bestAction = action;
        }

        beta = Math.min(beta, result.score);
        if (beta <= alpha) {
          stats.prunedBranches += 1;
          break; // Alpha cutoff
        }
      }

      return { score: minScore, action: bestAction };
    }
  }

  /**
   * Evaluates the best action for AI and captures full diagnostic telemetry
   */
  chooseAction(battle, aiPlayerIdx) {
    const startTime = performance.now();
    const stats = {
      nodesVisited: 0,
      prunedBranches: 0,
      depth: this.maxDepth,
      candidateScores: []
    };

    const actions = this.getPossibleActions(battle, aiPlayerIdx);
    if (actions.length === 0) {
      return { action: null, telemetry: null };
    }

    let bestScore = -Infinity;
    let chosenAction = actions[0];

    // Evaluate root actions individually to gather candidate scores for the inspector
    for (const action of actions) {
      const sim = battle.clone();
      sim.executeAction(aiPlayerIdx, action, true);
      sim.applyEndOfTurnStatus(true);

      const oppIdx = 1 - aiPlayerIdx;
      const res = this.minimax(
        sim,
        this.maxDepth - 1,
        false,
        aiPlayerIdx,
        oppIdx,
        -Infinity,
        Infinity,
        stats
      );

      stats.candidateScores.push({
        actionName: action.name || (action.type === 'move' ? action.move.name : `Switch`),
        score: parseFloat(res.score.toFixed(2)),
        isChosen: false
      });

      if (res.score > bestScore) {
        bestScore = res.score;
        chosenAction = action;
      }
    }

    const elapsedMs = performance.now() - startTime;

    // Mark the chosen action in telemetry
    stats.candidateScores.forEach(c => {
      if (c.actionName === (chosenAction.name || chosenAction.move.name)) {
        c.isChosen = true;
      }
    });

    const activePoke = battle.getActive(aiPlayerIdx);
    this.lastProfile = {
      aiPlayerIdx,
      pokemon: activePoke ? activePoke.name : 'Unknown',
      chosenAction: chosenAction.name || (chosenAction.move ? chosenAction.move.name : 'Switch'),
      bestScore: parseFloat(bestScore.toFixed(2)),
      nodesVisited: stats.nodesVisited,
      prunedBranches: stats.prunedBranches,
      timeMs: parseFloat(elapsedMs.toFixed(2)),
      depth: this.maxDepth,
      candidates: stats.candidateScores
    };

    return {
      action: chosenAction,
      telemetry: this.lastProfile
    };
  }

  // Switch choice when forced to switch after fainting
  chooseForcedSwitch(battle, aiPlayerIdx) {
    const available = battle.getAvailableSwitches(aiPlayerIdx);
    if (available.length === 0) return -1;

    let bestIdx = available[0];
    let maxHp = -1;

    for (const idx of available) {
      const p = battle.teams[aiPlayerIdx][idx];
      if (p.currentHp > maxHp) {
        maxHp = p.currentHp;
        bestIdx = idx;
      }
    }

    return bestIdx;
  }
}
