# Methodology

## Two independent layers

### Human tracker
The human layer is the completed 3–2–1–0.5 match-by-match tracker. It combines watching games, statistics, coaches' votes and observed influence. It is frozen before market review.

### Model EV
The expected-votes layer converts the human signal toward a six-vote Brownlow pool and applies the lessons learned from the 2025 post-mortem. It deliberately distinguishes robust best-on-ground performances from repeated marginal third-best calls.

## The 0.5 signal

A 0.5 means: **this player was a credible Brownlow fringe performance but is not confidently inside the top three**. It is not intended to predict a literal half-vote. Turning the switch off on the website removes those near-poll performances from the displayed leaderboard.

## 2025 lessons carried into 2026

The earlier model materially overcalled high-floor accumulation and generic ruck volume, while undercalling some match-breaking, contested and non-traditional roles. The 2026 model therefore uses diminishing returns for disposal accumulation; discounts repeated fragile 1-vote calls; avoids giving raw hitouts excessive value; rewards contested possessions, clearances and tackles together; rewards midfield/ruck performances with damaging goals and score creation; preserves strong match-winning influence; and gives intercept/transition players better representation.

## 2026 voting environment

In 2026 the umpires can review an approved Champion Data statistical sheet before lodging Brownlow votes. This makes statistics such as score involvements, clearances, contested possessions, intercepts and contested marks more directly relevant to the voting process than they were previously.

## Round-by-round Model EV on the website

Season-level Model EV is calibrated to the locked expected-votes number. For display, that season expectation is distributed across the player's candidate games in proportion to the strength of their human vote signal, so the round-by-round progression reconciles exactly to the final model expectation. This preserves the human match map while allowing a consistent expected-votes progression view.

## Reading confidence

- **Very High:** strong total with limited dependence on marginal 1/0.5 calls.
- **High:** strong vote profile with manageable uncertainty.
- **Medium:** meaningful conversion/role/team-vote uncertainty.
- **Low:** sparse evidence or low expected total.

The confidence interval is intentionally wider for players whose totals depend heavily on 1/0.5 calls or whose archetype remains difficult to convert into umpire votes.
