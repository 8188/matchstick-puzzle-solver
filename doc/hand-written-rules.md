## Handwritten-Style Matchstick Rules

| Character | Matchsticks | Move 1 | Add 1 | Remove 1 | Move 2 | Add 2 | Remove 2 |
|:-----:|:------:|:------------:|:------------:|:--------:|:----------------:|:------------------:|:---------------:|
| SPACE | 0      |              | -,(1)H       |          |                  | x,=,+,/,(7)H,(11)H |                 |
| (1)H  | 1      | -            | (7)H,(11)H,+ | SPACE    |                  | (4)H               |                 |
| -     | 1      | (1)H         | (7)H,+,=     | SPACE    |                  | (4)H               |                 |
| x     | 2      | /            |              |          | =,+,/,(7)H,(11)H |                    | SPACE           |
| =     | 2      | +,(7)H       |              | -        | x,+,/,(7)H,(11)H | (0)H               | SPACE           |
| +     | 2      | (7)H,(11)H,= | (4)H         | (1)H,-   | x,=,/,(7)H,(11)H |                    | SPACE           |
| /     | 2      | x            |              |          | x,=,+,(7)H,(11)H |                    | SPACE           |
| (7)H  | 2      | (11)H,+,=    |              | (1)H,-   | x,=,+,/,(11)H    | (0)H               | SPACE           |
| (11)H | 2      | (7)H,+       |              | (1)H     | x,=,+,/,(7)H     | (0)H               | SPACE           |
| (4)H  | 3      |              |              | +        |                  |                    | (1)H,-          |
| (0)H  | 4      |              | (6)H,(9)H    |          |                  |                    | =,(7)H,(11)H    |
| 5     | 5      | 3,(6)H,(9)H  |              |          | 2                | 8                  |                 |
| (9)H  | 5      | 3,5,(6)H     |              | (0)H     | 2                | 8                  |                 |
| (6)H  | 5      | 5,(9)H       |              | (0)H     | 2                | 8                  |                 |
| 3     | 5      | 2,5,(9)H     |              |          |                  | 8                  |                 |
| 2     | 5      | 3            |              |          | 5,(6)H,(9)H      | 8                  |                 |
| 8     | 7      |              |              |          |                  |                    | 2,3,5,(6)H,(9)H |

Notes:
- Parenthesized tokens like `(6)H` denote handwritten-style characters used in the UI and rule set.
