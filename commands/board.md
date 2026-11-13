---
description: Open the Chalk whiteboard and lay out the current task on it
argument-hint: "[what to plan, optional]"
---

Let's work on this on the Chalk board.

1. Call the `board_open` tool now (it starts Chalk and raises the panel beside the terminal; I asked for it, so no `auto`), then `board_read`. If the board has unread marks from me, deal with those first.
2. Lay out the task with `layout_plan`: a short title and 3 to 8 steps of under ~8 words each, with a `reason` where the why isn't obvious. The task: $ARGUMENTS
   (If that's empty, use what we're currently working on in this conversation. If there's nothing yet, ask me in one line what to plan.)
3. Say in one or two sentences what you drew. If you have a real question, `hand_over` with it and `about:` the cards it concerns (it's written on the board next to them). Then start `chalk wait --live` as a background Bash command (run_in_background: true) and end your turn; you keep watching and are woken when I mark the board up. Reply on the board right where I marked (`add_note` with `as: "note"` near my mark), and never ask me to press anything.
