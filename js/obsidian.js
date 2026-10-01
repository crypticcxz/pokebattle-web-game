/**
 * PokéBattle Obsidian Vault Exporter
 * Formats match logs into rich Obsidian Markdown with YAML frontmatter,
 * Dataview-compatible fields, and bi-directional wikilinks.
 */

export class ObsidianExporter {
  static generateMatchReport(battle, gameModeText) {
    const dateStr = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const p1Team = battle.teams[0];
    const p2Team = battle.teams[1];

    // Find MVP based on damage dealt and KOs
    const allPokes = [...p1Team, ...p2Team];
    let mvp = allPokes[0];
    for (const p of allPokes) {
      if (p.kos > mvp.kos || (p.kos === mvp.kos && p.damageDealt > mvp.damageDealt)) {
        mvp = p;
      }
    }

    let md = `---
type: pokebattle-match
date: "${dateStr}"
game_mode: "${gameModeText}"
winner: "${battle.winner || 'Unknown'}"
total_turns: ${battle.turn}
mvp: "${mvp.name}"
player1_team: [${p1Team.map(p => `"${p.name}"`).join(', ')}]
player2_team: [${p2Team.map(p => `"${p.name}"`).join(', ')}]
tags:
  - pokebattle
  - match-report
  - ai-simulation
---

# ⚔️ PokéBattle Match Report: ${battle.winner} Victory

> **Match Date:** ${formattedDate}  
> **Mode:** ${gameModeText}  
> **Total Turns:** ${battle.turn}  
> **🏆 Match MVP:** [[${mvp.name}]] (${mvp.damageDealt} damage dealt, ${mvp.kos} KOs)

---

## 📊 Team Performance Overview

### 🔵 Player 1 Team
| Pokémon | Types | Final HP | Status | Damage Dealt | KOs |
| :--- | :--- | :--- | :--- | :--- | :--- |
${p1Team.map(p => `| [[${p.name}]] | ${p.types.join('/')} | ${p.currentHp}/${p.maxHp} | ${p.currentHp <= 0 ? '💀 Fainted' : (p.statusCondition || '✅ Healthy')} | ${p.damageDealt} | ${p.kos} |`).join('\n')}

### 🔴 Player 2 Team
| Pokémon | Types | Final HP | Status | Damage Dealt | KOs |
| :--- | :--- | :--- | :--- | :--- | :--- |
${p2Team.map(p => `| [[${p.name}]] | ${p.types.join('/')} | ${p.currentHp}/${p.maxHp} | ${p.currentHp <= 0 ? '💀 Fainted' : (p.statusCondition || '✅ Healthy')} | ${p.damageDealt} | ${p.kos} |`).join('\n')}

---

## 📜 Turn-by-Turn Battle Transcript

`;

    let currentTurn = 0;
    battle.battleLog.forEach(entry => {
      if (entry.turn !== currentTurn) {
        currentTurn = entry.turn;
        md += `\n### Turn ${currentTurn}\n`;
      }
      // Add wikilinks to known pokemon and moves
      let line = entry.message;
      const keywords = [
        'Charizard', 'Blastoise', 'Venusaur', 'Pikachu', 'Gengar', 'Arcanine',
        'Flamethrower', 'Dragon Claw', 'Air Slash', 'Thunder Wave', 'Hydro Pump',
        'Ice Beam', 'Skull Bash', 'Bite', 'Vine Whip', 'Sludge Bomb', 'Sleep Powder',
        'Tackle', 'Thunderbolt', 'Quick Attack', 'Shadow Ball', 'Hypnosis', 'Flare Blitz', 'Extreme Speed'
      ];

      keywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'g');
        line = line.replace(regex, `[[${kw}]]`);
      });

      md += `- ${line}\n`;
    });

    md += `\n---\n*Exported automatically from PokéBattle AI Engine*\n`;
    return md;
  }

  static downloadMarkdown(filename, content) {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
