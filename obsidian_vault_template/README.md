# 📖 PokéBattle AI: Obsidian Vault Integration Guide

Welcome! This folder contains templates and setup instructions for using **[Obsidian](https://obsidian.md/)** as your Game Design Document (GDD), Strategy Analytics Hub, and Match Logger.

---

## 🛠️ Recommended Obsidian Setup

1. **Install Obsidian**: Download and install from [obsidian.md](https://obsidian.md/).
2. **Open Vault**: In Obsidian, select **"Open folder as vault"** and point to this `obsidian_vault_template/` directory (or copy these files into your personal vault).
3. **Recommended Community Plugins**:
   - **Dataview**: Enables SQL-like markdown queries over your Pokémon stats, BST (Base Stat Total), and match history.
   - **Canvas**: Built natively into Obsidian; use it to map Minimax decision trees and type matchups.

---

## 📁 Vault Structure

```
obsidian_vault_template/
├── README.md                  # This guide
├── Pokedex_Dashboard.md       # Interactive Dataview stats dashboard
├── Pokemon/                   # Detailed Pokémon sheets with frontmatter
│   ├── Charizard.md
│   └── Blastoise.md
├── Moves/                     # Move cards with power, accuracy, and effects
│   └── Flamethrower.md
└── Matches/                   # Target folder for your exported game reports
```

---

## ⚡ How to Import Matches from the Web Game

1. Play a match in the web browser.
2. Click the **📝 Obsidian Export** button on the top-right bar (or at Game Over).
3. Click **"💾 Download .md"** or **"📋 Copy Markdown"**.
4. Save the file into your `Matches/` folder.
5. Open Obsidian:
   - Notice how all Pokémon (`[[Charizard]]`) and moves (`[[Flamethrower]]`) automatically link together!
   - Open Obsidian **Graph View** (`Ctrl+G`) to see your Pokémon matchup clusters and battle networks!
