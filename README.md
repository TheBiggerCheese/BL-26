# 2026 Brownlow Predictor

Interactive **2026 AFL Brownlow Medal prediction model** built from a completed human 3–2–1–0.5 tracker plus a calibrated expected-votes layer.

## Live site

After enabling GitHub Pages, your site will be available at:

`https://YOUR-USERNAME.github.io/2026-brownlow-predictor/`

## Features

- Full leaderboard with **every player**, including zero-vote players.
- Toggle between **Human Tracker** and **Model EV**.
- Toggle the custom **0.5 near-poll signal** on/off.
- View the leaderboard **after every round**, including Opening Round.
- Filter to any club or switch to a **By Club** view with every player ranked within their team.
- Club-colour coding throughout the leaderboard and player profiles.
- Click any player for a profile showing final model range, 3/2/1/0.5 distribution, round-by-round progression and every round/game where they received a vote signal.
- CSV exports for analysis outside the website.
- Original Excel model and completed tracker retained under `data/` for auditability.

## Publish it on GitHub Pages

1. Create a new GitHub repository named `2026-brownlow-predictor`.
2. Upload **the contents of this folder** to the root of the repository.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Choose branch **main** and folder **/(root)**, then Save.
6. GitHub will provide the public Pages URL once deployed.

No build system, npm or server is required. The site is plain HTML/CSS/JavaScript and runs directly on GitHub Pages.

## Model philosophy

The official Brownlow awards 3–2–1 votes. The human tracker adds a **0.5 near-poll signal** to retain uncertainty around players who were realistically in the third-to-fifth-best-player range. The Model EV layer calibrates those signals using prior Brownlow lessons, role and impact adjustments, public benchmark residuals and the 2026 rule change allowing umpires to review official statistics before voting.

**Important:** the underlying tracker is frozen before bookmaker-market review. Market prices should never be used to retroactively alter the human vote allocations.

See [Methodology](methodology.md) and [Sources](sources.md).

### Fixture-aware player profiles

All 207 home-and-away fixtures have been mapped from the 2026 FootyWire fixture. Player profiles now show the actual opponent for every 3 / 2 / 1 / 0.5 signal (for example, `Round 15 vs Geelong — 3`) rather than generic game numbers. The fixture reconciliation matched all 828 stored vote signals with zero unresolved records.
