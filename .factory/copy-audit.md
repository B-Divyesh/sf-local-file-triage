# Copy audit

Reviewed 2026-08-28 after polish round 1. Counts treat hyphenated compounds as one word.

## Landing first screen

| Copy | Words | Result |
| --- | ---: | --- |
| Organize files locally · No uploads | 5 | Plain job language; `real-file-locality` |
| Survey the folder. Approve every move. | 6 | Headline; plain job language |
| For people cleaning a messy folder, Triagebox shows where each file will go before it moves. | 17 | Audience and result; under 22 |
| Try it with sample data | 5 | Primary action |
| See five routes. Nothing is saved. | 6 | Demo action result; `demo-sandbox` |
| File details: Stay in this browser | 6 | `real-file-locality` |
| Method: Copy · verify · remove | 5 | `reversible-move` |
| Receipt: JSON + CSV | 4 | `receipt-csv` |
| See every proposed destination before moving a file. | 8 | Concrete figure caption |

## Landing and product controls

| Copy | Words | Result |
| --- | ---: | --- |
| Choose and review a folder | 5 | Concrete section label |
| Open one folder. Nothing moves yet. | 6 | Plain empty state |
| After you choose a folder, Triagebox suggests a destination from each file’s type and year. | 15 | Under 22; `permission-on-action`, `deterministic-routes` |
| Try the five-file sample | 4 | Same term as demo action |
| How review-before-move works | 4 | Names the mechanism |
| Optional Pro license | 3 | Plain label |
| Remove the 100-file move limit | 6 | Concrete upgrade heading |
| Checkout opens on Sociobot/Dodo. | 4 | `checkout-origin` |

## README wording checks

The opening sentences are 10, 13, and 12 words. The audience sentences are 9 and 13 words.
Every user-facing occurrence uses **folder**, **destination**, **approval**, **receipt**, and **demo** consistently.
Schema names such as `triagebox-manifest-v1` appear only in code and test fixtures, not user copy.

## Terminology

| Concept | Product word |
| --- | --- |
| Local directory | folder |
| Suggested file location | proposed destination |
| User decision | approval |
| Portable JSON/CSV record | receipt |
| Isolated sample mode | demo |
