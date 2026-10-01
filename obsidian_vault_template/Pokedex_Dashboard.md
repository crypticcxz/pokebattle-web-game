---
type: dashboard
tags:
  - pokebattle
  - pokedex
---

# 📊 Pokédex & Battle Analytics Dashboard

This dashboard automatically compiles your Pokémon roster and match history using the **Obsidian Dataview** plugin.

---

## 🐲 Roster Overview (Sorted by Base Speed)

```dataview
TABLE types, hp, attack, defense, sp_attack, sp_defense, speed, (hp + attack + defense + sp_attack + sp_defense + speed) AS BST
FROM #pokemon
SORT speed DESC
```

---

## ⚔️ Recent Match History

```dataview
TABLE date, winner, total_turns, mvp, game_mode
FROM #match-report
SORT date DESC
LIMIT 10
```

---

## 🏆 MVP Win Counts

```dataview
TABLE count(file.link) AS "MVP Matches"
FROM #match-report
GROUP BY mvp
SORT count(file.link) DESC
```
