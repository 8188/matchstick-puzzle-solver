## Handwritten-Style Matchstick Rules

| Character | Matchsticks | Move (one match) | Add (one match) | Remove (one match) |
|-----------|-------------:|---------------------|--------------------|------------------------|
| (space)   | 0            |                     | -, (1)H            |                        |
| (1)H      | 1            | -                   | (7)H, (11)H, +     | (space)                |
| -         | 1            | (1)H                | (7)H, +, =         | (space)                |
| x         | 2            | /                   |                    |                        |
| =         | 2            | +, (7)H             |                    | -                      |
| +         | 2            | (7)H, (11)H, =      | (4)H               | (1)H, -                |
| /         | 2            | x                   |                    |                        |
| (7)H      | 2            | (11)H, +, =         |                    | (1)H, -                |
| (11)H     | 2            | (7)H, +             |                    | (1)H                  |
| (4)H      | 3            |                     |                    | +                      |
| (0)H      | 4            |                     | (6)H, (9)H         |                        |
| 5         | 5            | 3, (6)H, (9)H       |                    |                        |
| (9)H      | 5            | 3, 5, (6)H          |                    | (0)H                  |
| (6)H      | 5            | 5, (9)H             |                    | (0)H                  |
| 3         | 5            | 2, 5, (9)H          |                    |                        |
| 2         | 5            | 3                   |                    |                        |
| 8         | 7            |                     |                    |                        |

Notes:
- Parenthesized tokens like `(6)H` denote handwritten-style characters used in the UI and rule set.
