/**
 * PokéBattle Web Game Application Controller
 * Orchestrates Game Loop, Animations, Audio, AI Telemetry, and Obsidian Integration
 */

import { BattleEngine } from './engine.js';
import { PokeAI } from './ai.js';
import { TYPE_COLORS, getTypeEffectiveness } from './typeChart.js';
import { POKEMON_DATA, MOVES_DATA } from './data.js';
import { sound } from './audio.js';
import { ObsidianExporter } from './obsidian.js';

class PokeBattleApp {
  constructor() {
    this.engine = null;
    this.ai = new PokeAI(4);
    this.gameMode = 'human-vs-ai'; // 'human-vs-ai', 'ai-vs-ai', 'human-vs-human'
    this.isProcessing = false;
    this.aiSpectateTimer = null;

    // DOM Elements
    this.oppNameEl = document.getElementById('opp-name');
    this.oppTypesEl = document.getElementById('opp-types');
    this.oppHpBarEl = document.getElementById('opp-hp-bar');
    this.oppHpTextEl = document.getElementById('opp-hp-text');
    this.oppTeamBallsEl = document.getElementById('opp-team-balls');
    this.oppSpriteEl = document.getElementById('opp-sprite');
    this.oppSpriteBoxEl = document.getElementById('opp-sprite-box');

    this.playerNameEl = document.getElementById('player-name');
    this.playerTypesEl = document.getElementById('player-types');
    this.playerHpBarEl = document.getElementById('player-hp-bar');
    this.playerHpTextEl = document.getElementById('player-hp-text');
    this.playerTeamBallsEl = document.getElementById('player-team-balls');
    this.playerSpriteEl = document.getElementById('player-sprite');
    this.playerSpriteBoxEl = document.getElementById('player-sprite-box');

    this.dialogueTextEl = document.getElementById('dialogue-text');
    this.turnIndicatorEl = document.getElementById('turn-indicator');
    this.movesContainerEl = document.getElementById('moves-container');
    this.btnSwitchTeam = document.getElementById('btn-switch-team');
    this.btnQuickLog = document.getElementById('btn-quick-log');

    // Modals
    this.modalSwitch = document.getElementById('modal-switch');
    this.switchTeamList = document.getElementById('switch-team-list');
    this.btnCloseSwitch = document.getElementById('btn-close-switch');

    this.modalInspector = document.getElementById('modal-inspector');
    this.btnOpenInspector = document.getElementById('btn-open-inspector');
    this.btnCloseInspector = document.getElementById('btn-close-inspector');

    this.modalObsidian = document.getElementById('modal-obsidian');
    this.btnOpenObsidian = document.getElementById('btn-open-obsidian');
    this.btnCloseObsidian = document.getElementById('btn-close-obsidian');
    this.obsidianPreviewEl = document.getElementById('obsidian-markdown-preview');
    this.btnCopyObsidian = document.getElementById('btn-copy-obsidian');
    this.btnDownloadObsidian = document.getElementById('btn-download-obsidian');

    this.btnSound = document.getElementById('btn-sound');
    this.btnRestart = document.getElementById('btn-restart');
    this.modeSelect = document.getElementById('mode-select');

    this.initEvents();
    this.startNewMatch();
  }

  initEvents() {
    this.modeSelect.addEventListener('change', (e) => {
      this.gameMode = e.target.value;
      this.startNewMatch();
    });

    this.btnRestart.addEventListener('click', () => {
      sound.playClick();
      this.startNewMatch();
    });

    this.btnSound.addEventListener('click', () => {
      const isSoundOn = sound.toggleSound();
      this.btnSound.textContent = isSoundOn ? '🔊' : '🔇';
      this.btnSound.title = isSoundOn ? 'Sound On' : 'Sound Muted';
    });

    // Modals toggle
    this.btnSwitchTeam.addEventListener('click', () => {
      sound.playClick();
      this.openSwitchModal();
    });
    this.btnCloseSwitch.addEventListener('click', () => this.modalSwitch.close());

    this.btnOpenInspector.addEventListener('click', () => {
      sound.playClick();
      this.updateInspectorView();
      this.modalInspector.showModal();
    });
    this.btnCloseInspector.addEventListener('click', () => this.modalInspector.close());

    this.btnOpenObsidian.addEventListener('click', () => {
      sound.playClick();
      this.openObsidianModal();
    });
    this.btnCloseObsidian.addEventListener('click', () => this.modalObsidian.close());

    this.btnQuickLog.addEventListener('click', () => {
      sound.playClick();
      this.openObsidianModal();
    });

    this.btnCopyObsidian.addEventListener('click', () => {
      sound.playClick();
      const content = this.obsidianPreviewEl.textContent;
      navigator.clipboard.writeText(content).then(() => {
        this.btnCopyObsidian.textContent = '✅ Copied!';
        setTimeout(() => this.btnCopyObsidian.textContent = '📋 Copy Markdown', 2000);
      });
    });

    this.btnDownloadObsidian.addEventListener('click', () => {
      sound.playClick();
      const content = this.obsidianPreviewEl.textContent;
      const filename = `PokeBattle_Match_Turn${this.engine.turn}.md`;
      ObsidianExporter.downloadMarkdown(filename, content);
    });
  }

  startNewMatch() {
    if (this.aiSpectateTimer) {
      clearTimeout(this.aiSpectateTimer);
      this.aiSpectateTimer = null;
    }

    const allNames = Object.keys(POKEMON_DATA);
    // Shuffle and pick 3 for each player
    const shuffled = [...allNames].sort(() => Math.random() - 0.5);
    const team1Names = shuffled.slice(0, 3);
    const team2Names = shuffled.slice(3, 6);

    const p1IsAi = this.gameMode === 'ai-vs-ai';
    const p2IsAi = this.gameMode !== 'human-vs-human';

    this.engine = new BattleEngine(team1Names, team2Names, p1IsAi, p2IsAi);
    this.isProcessing = false;

    this.updateUI();
    this.setDialogue(`Battle started! 3v3 between Player 1 (${team1Names.join(', ')}) and Player 2 (${team2Names.join(', ')}).`);

    if (this.gameMode === 'ai-vs-ai') {
      this.scheduleAiTurn();
    }
  }

  updateUI() {
    const p1Active = this.engine.getActive(0);
    const p2Active = this.engine.getActive(1);

    if (!p1Active || !p2Active) return;

    this.turnIndicatorEl.textContent = `Turn ${this.engine.turn}`;

    // Render Player Active
    this.playerNameEl.textContent = p1Active.name;
    this.renderTypes(this.playerTypesEl, p1Active.types, p1Active.statusCondition);
    this.updateHpBar(this.playerHpBarEl, this.playerHpTextEl, p1Active.currentHp, p1Active.maxHp);
    this.renderTeamBalls(this.playerTeamBallsEl, this.engine.teams[0]);
    this.playerSpriteEl.src = p1Active.sprites.back;
    this.playerSpriteEl.classList.remove('fainted-sprite');

    // Render Opponent Active
    this.oppNameEl.textContent = p2Active.name;
    this.renderTypes(this.oppTypesEl, p2Active.types, p2Active.statusCondition);
    this.updateHpBar(this.oppHpBarEl, this.oppHpTextEl, p2Active.currentHp, p2Active.maxHp);
    this.renderTeamBalls(this.oppTeamBallsEl, this.engine.teams[1]);
    this.oppSpriteEl.src = p2Active.sprites.front;
    this.oppSpriteEl.classList.remove('fainted-sprite');

    // Render Player Move Buttons
    this.renderMoves(p1Active);

    // Disable buttons if processing or AI vs AI
    const disableControls = this.isProcessing || this.engine.isOver || this.gameMode === 'ai-vs-ai';
    this.setControlsDisabled(disableControls);
  }

  renderTypes(container, types, statusCondition) {
    container.innerHTML = '';
    types.forEach(t => {
      const pill = document.createElement('span');
      pill.className = 'type-pill';
      const c = TYPE_COLORS[t] || { bg: '#888' };
      pill.style.backgroundColor = c.bg;
      pill.textContent = t;
      container.appendChild(pill);
    });

    if (statusCondition) {
      const statusPill = document.createElement('span');
      statusPill.className = `status-badge ${statusCondition.toLowerCase()}`;
      statusPill.textContent = statusCondition.substring(0, 3).toUpperCase();
      container.appendChild(statusPill);
    }
  }

  updateHpBar(barEl, textEl, currentHp, maxHp) {
    const pct = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
    barEl.style.width = `${pct}%`;
    textEl.textContent = `${currentHp}/${maxHp}`;

    barEl.classList.remove('mid', 'low');
    if (pct <= 20) {
      barEl.classList.add('low');
    } else if (pct <= 50) {
      barEl.classList.add('mid');
    }
  }

  renderTeamBalls(container, team) {
    container.innerHTML = '';
    team.forEach(p => {
      const dot = document.createElement('span');
      dot.className = `pokeball-dot ${p.currentHp <= 0 ? 'fainted' : ''}`;
      dot.title = `${p.name} (${p.currentHp}/${p.maxHp} HP)`;
      container.appendChild(dot);
    });
  }

  renderMoves(pokemon) {
    this.movesContainerEl.innerHTML = '';
    pokemon.moves.forEach((move, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn-move';
      btn.id = `move-btn-${idx}`;
      btn.disabled = move.currentPp <= 0 || this.isProcessing || this.engine.isOver;

      const typeCol = TYPE_COLORS[move.type] || { bg: '#3B82F6' };
      btn.style.setProperty('--move-accent', typeCol.bg);
      btn.title = `${move.description} (Power: ${move.power || '--'}, Accuracy: ${Math.round(move.accuracy * 100)}%)`;

      const catIcon = move.category === 'Physical' ? '⚔️' : move.category === 'Special' ? '🔮' : '🛡️';

      btn.innerHTML = `
        <div class="move-header">
          <span class="move-name">${move.name}</span>
          <span class="move-type-badge" style="background: ${typeCol.bg}">${move.type}</span>
        </div>
        <div class="move-footer">
          <span class="move-category-icon">${catIcon} ${move.category}</span>
          <span class="move-pp">${move.currentPp}/${move.maxPp} PP</span>
        </div>
      `;

      btn.addEventListener('click', () => {
        sound.playClick();
        this.handlePlayerAction({ type: 'move', moveIdx: idx });
      });

      this.movesContainerEl.appendChild(btn);
    });
  }

  setControlsDisabled(disabled) {
    const moveBtns = this.movesContainerEl.querySelectorAll('.btn-move');
    moveBtns.forEach(b => b.disabled = disabled);
    this.btnSwitchTeam.disabled = disabled;
  }

  setDialogue(text, isThinking = false) {
    this.dialogueTextEl.textContent = text;
    if (isThinking) {
      this.dialogueTextEl.classList.add('thinking');
    } else {
      this.dialogueTextEl.classList.remove('thinking');
    }
  }

  async handlePlayerAction(p1Action) {
    if (this.isProcessing || this.engine.isOver) return;
    this.isProcessing = true;
    this.setControlsDisabled(true);

    // AI determines action for Player 2
    this.setDialogue(`${this.engine.getActive(1).name} (AI) is thinking...`, true);
    await this.delay(350);

    const { action: p2Action } = this.ai.chooseAction(this.engine, 1);
    this.updateInspectorView();

    await this.resolveTurn(p1Action, p2Action);
  }

  async resolveTurn(action1, action2) {
    const p1Active = this.engine.getActive(0);
    const p2Active = this.engine.getActive(1);

    if (action1.type === 'move' && !action1.move && p1Active) {
      action1.move = p1Active.moves[action1.moveIdx];
    }
    if (action2.type === 'move' && !action2.move && p2Active) {
      action2.move = p2Active.moves[action2.moveIdx];
    }

    // Speed & Priority Ordering
    const p1Priority = action1.type === 'switch' ? 99 : (action1.move ? action1.move.priority : 0);
    const p2Priority = action2.type === 'switch' ? 99 : (action2.move ? action2.move.priority : 0);

    let firstPlayer = 0;
    if (p1Priority > p2Priority) {
      firstPlayer = 0;
    } else if (p2Priority > p1Priority) {
      firstPlayer = 1;
    } else {
      // Priority tie: compare Speed stats
      const p1Speed = this.engine.getEffectiveStat(p1Active, 'speed');
      const p2Speed = this.engine.getEffectiveStat(p2Active, 'speed');
      if (p1Speed > p2Speed) firstPlayer = 0;
      else if (p2Speed > p1Speed) firstPlayer = 1;
      else firstPlayer = Math.random() < 0.5 ? 0 : 1;
    }

    const order = [firstPlayer, 1 - firstPlayer];
    const actions = { 0: action1, 1: action2 };

    for (const pIdx of order) {
      if (this.engine.checkGameOver()) break;

      const act = actions[pIdx];
      const actor = this.engine.getActive(pIdx);
      if (!actor || actor.currentHp <= 0) continue;

      if (act.type === 'move' && !act.move && actor.moves) {
        act.move = actor.moves[act.moveIdx];
      }

      // Pre-turn condition check (paralyze / sleep)
      if (act.type === 'move') {
        const canActCheck = this.engine.canPokemonAct(pIdx);
        if (!canActCheck.canAct) {
          const lastLog = this.engine.battleLog[this.engine.battleLog.length - 1];
          this.setDialogue(lastLog ? lastLog.message : `${actor.name} couldn't move!`);
          await this.delay(1000);
          continue;
        }
      }

      // Execute action
      const result = this.engine.executeAction(pIdx, act);
      this.updateUI();

      if (act.type === 'move') {
        const moveType = act.move ? act.move.type : 'Normal';
        const moveName = act.move ? act.move.name : 'a move';
        sound.playAttack(moveType);
        this.setDialogue(`${actor.name} used ${moveName}!`);
        await this.delay(700);

        if (result.missed) {
          this.setDialogue('The attack missed!');
          await this.delay(800);
        } else if (result.damage > 0) {
          // Play hit animation & sound on defender
          const targetBox = pIdx === 0 ? this.oppSpriteBoxEl : this.playerSpriteBoxEl;
          const targetSprite = pIdx === 0 ? this.oppSpriteEl : this.playerSpriteEl;

          targetBox.classList.add('shake');
          targetSprite.classList.add('damage-flash');
          sound.playDamage(result.effectiveness, result.isCrit);

          await this.delay(400);
          targetBox.classList.remove('shake');
          targetSprite.classList.remove('damage-flash');

          let msg = '';
          if (result.isCrit) msg += 'A critical hit! ';
          if (result.effectiveness > 1.0) msg += `It's super effective! `;
          if (result.effectiveness < 1.0) msg += `It's not very effective... `;
          msg += `(${result.damage} damage)`;
          this.setDialogue(msg);
          await this.delay(900);
        } else if (result.statusApplied) {
          this.setDialogue(`Status effect applied!`);
          await this.delay(800);
        }

        // Faint check
        if (result.fainted) {
          sound.playFaint();
          const targetSprite = pIdx === 0 ? this.oppSpriteEl : this.playerSpriteEl;
          targetSprite.classList.add('fainted-sprite');
          const defender = this.engine.getActive(1 - pIdx);
          this.setDialogue(`${defender.name} fainted!`);
          await this.delay(1100);

          if (this.engine.checkGameOver()) break;
          await this.handleFaintReplacement(1 - pIdx);
        }
      } else if (act.type === 'switch') {
        this.setDialogue(`Switched to ${act.newPokemon.name}!`);
        await this.delay(900);
      }
    }

    // End of turn status damage (Burn, Poison)
    if (!this.engine.checkGameOver()) {
      const statusTicks = this.engine.applyEndOfTurnStatus();
      for (const tick of statusTicks) {
        this.updateUI();
        this.setDialogue(`${tick.pokemon.name} is hurt by its ${tick.pokemon.statusCondition}! (${tick.damage} dmg)`);
        sound.playDamage(1.0);
        await this.delay(800);

        if (tick.fainted) {
          sound.playFaint();
          const sprite = tick.playerIdx === 0 ? this.playerSpriteEl : this.oppSpriteEl;
          sprite.classList.add('fainted-sprite');
          await this.delay(900);

          if (this.engine.checkGameOver()) break;
          await this.handleFaintReplacement(tick.playerIdx);
        }
      }
    }

    // Check game over
    if (this.engine.checkGameOver()) {
      this.handleGameOver();
      return;
    }

    this.engine.turn += 1;
    this.isProcessing = false;
    this.updateUI();

    if (this.gameMode === 'ai-vs-ai') {
      this.scheduleAiTurn();
    } else {
      this.setDialogue(`What will ${this.engine.getActive(0).name} do?`);
    }
  }

  async handleFaintReplacement(faintedPlayerIdx) {
    const isAi = this.engine.isAi[faintedPlayerIdx];
    if (isAi) {
      const bestSwitch = this.ai.chooseForcedSwitch(this.engine, faintedPlayerIdx);
      if (bestSwitch !== -1) {
        this.engine.forceSwitch(faintedPlayerIdx, bestSwitch);
        const newPoke = this.engine.getActive(faintedPlayerIdx);
        this.setDialogue(`Player ${faintedPlayerIdx + 1} sent out ${newPoke.name}!`);
        this.updateUI();
        await this.delay(1000);
      }
    } else {
      // Human forced switch: prompt modal
      this.setDialogue(`Choose your next Pokémon!`);
      this.openSwitchModal(true);
      await this.waitForModalClose();
    }
  }

  waitForModalClose() {
    return new Promise((resolve) => {
      const handler = () => {
        this.modalSwitch.removeEventListener('close', handler);
        resolve();
      };
      this.modalSwitch.addEventListener('close', handler);
    });
  }

  scheduleAiTurn() {
    if (this.engine.isOver) return;
    this.aiSpectateTimer = setTimeout(async () => {
      this.isProcessing = true;
      const { action: a1 } = this.ai.chooseAction(this.engine, 0);
      const { action: a2 } = this.ai.chooseAction(this.engine, 1);
      this.updateInspectorView();
      await this.resolveTurn(a1, a2);
    }, 1500);
  }

  handleGameOver() {
    this.isProcessing = false;
    sound.playVictory();
    this.updateUI();

    const winner = this.engine.winner;
    this.setDialogue(`🏆 Game Over! ${winner} wins the battle! Click "Export to Obsidian" to save report.`);

    // Automatically prepare Obsidian report
    this.obsidianPreviewEl.textContent = ObsidianExporter.generateMatchReport(this.engine, this.modeSelect.options[this.modeSelect.selectedIndex].text);
  }

  openSwitchModal(isForced = false) {
    this.switchTeamList.innerHTML = '';
    const team = this.engine.teams[0];
    const currentIdx = this.engine.activeIndices[0];

    team.forEach((poke, idx) => {
      const card = document.createElement('div');
      card.className = `switch-poke-card ${idx === currentIdx ? 'active' : ''} ${poke.currentHp <= 0 ? 'fainted' : ''}`;

      card.innerHTML = `
        <div class="switch-left">
          <img src="${poke.sprites.icon}" alt="${poke.name}" class="switch-icon">
          <div>
            <div class="switch-name">${poke.name} ${idx === currentIdx ? '(Active)' : ''}</div>
            <div class="switch-hp">${poke.currentHp}/${poke.maxHp} HP ${poke.statusCondition ? `[${poke.statusCondition}]` : ''}</div>
          </div>
        </div>
        <div class="switch-right">
          ${poke.currentHp > 0 && idx !== currentIdx ? `<button class="btn-primary" style="padding: 4px 10px; font-size: 0.8rem;">Switch</button>` : ''}
        </div>
      `;

      if (poke.currentHp > 0 && idx !== currentIdx) {
        card.addEventListener('click', () => {
          this.modalSwitch.close();
          if (isForced) {
            this.engine.forceSwitch(0, idx);
            this.updateUI();
          } else {
            this.handlePlayerAction({ type: 'switch', targetIdx: idx });
          }
        });
      }

      this.switchTeamList.appendChild(card);
    });

    this.modalSwitch.showModal();
  }

  updateInspectorView() {
    const p = this.ai.lastProfile;
    if (!p) return;

    document.getElementById('stat-time').textContent = `${p.timeMs} ms`;
    document.getElementById('stat-depth').textContent = p.depth;
    document.getElementById('stat-nodes').textContent = p.nodesVisited;
    document.getElementById('stat-pruned').textContent = p.prunedBranches;

    const candContainer = document.getElementById('candidates-container');
    candContainer.innerHTML = '';

    p.candidates.forEach(c => {
      const row = document.createElement('div');
      row.className = `candidate-row ${c.isChosen ? 'chosen' : ''}`;
      row.innerHTML = `
        <span class="candidate-name">${c.isChosen ? '⭐ ' : ''}${c.actionName}</span>
        <span class="candidate-score">Score: ${c.score > 0 ? '+' : ''}${c.score}</span>
      `;
      candContainer.appendChild(row);
    });
  }

  openObsidianModal() {
    const report = ObsidianExporter.generateMatchReport(
      this.engine,
      this.modeSelect.options[this.modeSelect.selectedIndex].text
    );
    this.obsidianPreviewEl.textContent = report;
    this.modalObsidian.showModal();
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Start application once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.pokeApp = new PokeBattleApp();
});
