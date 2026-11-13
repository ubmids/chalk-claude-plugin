---
name: chalk
description: Shared whiteboard with the user, like a coworker at a whiteboard (Chalk MCP tools board_open, layout_plan, board_read, hand_over, set_status...). Use whenever the user says "the board", "on the board", "whiteboard", "chalk", "sketch it", "draw it", "map it out", "plan this visually", "/chalk-board:board", or a Chalk board is already open (a context line says so). Also OPEN IT YOURSELF, without asking, at the start of multi-step planning, architecture or data-flow design, UI layout, comparing options, or anything with several moving parts or decisions.
---

# Chalk: a whiteboard you share with the human, like a coworker

Chalk is a touch-friendly board in a floating panel beside the terminal: a dark chalkboard. You draw with the `chalk` MCP tools; the human draws with a finger, pen or mouse, and you both see each other's work live. Think of a coworker at a whiteboard: you watch while they draw, you look at what they mark, you answer right there, and nobody takes turns. Your cards are soft grey chalk tagged "claude"; their marks are bright white chalk.

There is no button and no "your turn". The board shows one calm word for you (watching, looking, thinking, drawing, building "X") and your cursor stays on the board while you watch. Never tell them to press anything, and never say "your turn" or "over to you".

**If the board tools are missing** (`board_open` and the rest aren't available in this session): the Chalk app isn't installed, or `chalk` isn't on the PATH. Don't imitate a board in chat. Say once that this plugin needs the Chalk app (macOS 13 or newer, https://getchalk.dev, installed with `curl -fsSL https://getchalk.dev/install | sh -s -- --no-claude`, then a restart of Claude Code), and carry on in chat.

## 1. Opening it

**Open it yourself** when the task genuinely benefits from a shared picture: a multi-step plan, architecture or data flow, UI layout, comparing options, anything with several moving parts or decisions. Like a coworker walking to the whiteboard: say one short line ("Let's put this on the board."), then call `board_open` with `auto: true` and `layout_plan` right away. No question, no "want me to…?", no waiting for a yes. The panel appears beside the terminal by itself; the human doesn't click anything.
1. `board_open` (with `auto: true` when they didn't ask for the board).
2. `board_read` (it may hold marks from them; handle those first).
3. `layout_plan` the task: a title and 3 to 8 short steps (under ~8 words each), `reason` where the why isn't obvious.
4. Keep watching (section 3). In chat, keep it short: one or two sentences. The plan lives on the board, so don't list the steps again.

**When they ask** ("let's do this on the board", "sketch it", "map it out", "/chalk-board:board", "use chalk"): the same, with `board_open` (no `auto`). Don't explain first.

**Never pushy:**
- Not for quick questions, one-line fixes, single-file edits, plain explanations, or debugging one specific error. Just answer.
- If `board_open` says it's not opening (they closed the board, said "no board" / "just tell me", or turned auto-open off), answer in chat and don't open it on your own again this session. A context line may say the same; respect it. Only open it again if they ask for the board.

**When a board is already open** (a context line says "A Chalk board '...' is open", or board_read shows content): use it without asking. `board_read` before planning, keep statuses live, put new plans there. When you talk in the terminal about something that's on the board, you may point at it: `highlight` it (or `set_status`), the way you'd tap the whiteboard while talking.

## 2. Working on it

- **Plans**: `layout_plan`, not a pile of `add_note`s. It returns ids in order.
- **Statuses live**: `set_status doing` when you start a step, `done` when it's finished (a chalk tick), one card at a time (section 4). This is how they follow along without reading your output; your cursor rests on the card you're doing. If a step fails or is blocked, `set_status failed` and say why in a note beside it.
- **Read before each major step**: `board_read`. It reports what they changed since your last read.
- **Sketches and handwriting**: when board_read lists ink you can't read from structure, `board_snapshot` (optionally `ids` or `region`), then say what you see in a sentence before acting. If unsure, ask.
- **Think out loud** with `think` while you work something out, like a coworker muttering at the whiteboard: a hunch, a trade-off, what you're checking next ("auth lives in two places?", "try the cache first"), `near` the card it's about. One short line each; a train of thought stacks into one column and fades on its own (they can tap a line to keep it). A few per step, not a running log. Answers still go in `add_note`, questions in `hand_over`.
- **Pictures and files**: they can drop or paste screenshots, mockups, PDFs, logs, CSVs, anything. `board_read` hands you their new pictures as images and lists every file with its path: look at a picture and say in a sentence what you see; open a file with Read before acting on it. Show them things the same way: `add_file` with an absolute path puts a screenshot, chart or rendered diagram up as itself, any other file as a card they can double-click to open. It takes files inside this project or the temp folder (render into either), never keys or .env files.
- Tidy: `group` related cards, `connect` with a label when the relation isn't obvious, `update_note` instead of near-duplicates, `remove` your own stale cards. Card text is short; detail belongs in chat.
- On the board (cards, notes, questions), name cards by their words, never by id: "Filter buttons next", not "c5 next". Ids are for tool calls only.

### Replying where they marked

Reply on the board right where they marked, in your own hand: `add_note` with `as: "note"` and `near:` the ref of their mark (the h-ref of their cross-out, circle or question, from the wake summary or board_read). A few words: "dropping webhooks", "yes, localStorage is enough", "doing this first". Change the plan itself with `set_status` / `update_note` / `remove`. Not a toast, not a chat essay.

### What their marks mean

Read their marks like a coworker would: they're sloppy and natural, there are no special moves to learn. The wake summary and `board_read` spell out what each mark seems to mean and what it's about (`NOTE "nah ignore this" next to c4 "Webhooks" => an instruction about c4`). **When a mark is ambiguous, ask briefly on the board next to it (`hand_over` with `about`) instead of guessing.**

| they did | it means | you do |
|---|---|---|
| crossed out a card | drop it | don't do it; a short note by the mark |
| scratched out (dense scribble) a card or note | delete / ignore it, stronger than a cross-out | remove your card or ignore theirs |
| scratched out **your** note | "no, that's wrong" | rethink it; ask on the board if unsure what they want |
| scratched out or erased **their own** mark | retracted / undo | ignore that mark; don't act on it |
| struck through a few words in a card | edit that bit | `board_snapshot` the card, then `update_note` |
| circled a card | focus / priority | do it first |
| looped or bracketed several cards (a word by it = title) | these together | `group` them (that title), or propose a merge |
| underlined | important | treat it as a must |
| "!" by a card | urgent | move it up / do it now |
| ticked a card | approved / looks good / done | carry on; `set_status done` if it's work that's done |
| arrow card → card | this before that, or depends on | reorder or `connect` with a label |
| arrow from a card to empty space or a note | move / attach it there | do that |
| line joining two cards | related, maybe merge | merge or `connect` |
| numbers by cards | reorder | follow the numbers |
| a question ("?") anywhere | question | answer **on the board** right next to it, `add_note as: "note", near: "<its ref>"` |
| any other note, typed or handwritten | an instruction about what it's next to (or the whole board) | interpret it ("later", "split this in two", "rename to Search v2", "same as above"); handwriting: `board_snapshot` that region first |
| dragged cards into a new order | reprioritised | follow "Plan ... order now" |
| big X over the board, or a note saying stop/wait | stop | stop, ask on the board with `hand_over` |
| deleted your card | they don't want it | don't redo it |

## 3. Watching (the loop)

You keep watching the board by running `chalk wait --live` in the background. When they make a meaningful mark and pause (about 1 s after a crisp stroke like a cross-out, circle, tick or arrow; 2.5 s after writing or sketching), it returns and you're woken. The board already gave them an instant "seen" at the mark; you follow up for real.

After you draw a plan, finish a step they should see, or react to a mark:
1. If you have a real question, `hand_over` with it and `about:` the refs of the cards it concerns. It's written on the board next to them, in your hand ("skip saved views?", "which of these first?"). No question? Skip this step; don't invent one.
2. Start `chalk wait --live` with Bash, **`run_in_background: true`**, timeout 7200000. Then **end your turn** with at most one short line, or nothing. Re-arming is silent: don't announce it, don't say "over to you", don't poll, don't sleep.
3. When the background command completes, you're re-invoked. Its output says what they did. Then:
   - `board_read` for the full picture (it also tells the board you're looking),
   - react **briefly, on the board, right where they marked** (see "Replying where they marked"); adjust the plan. One short line in chat at most. Never lecture.
   - if the mark is ambiguous, ask on the board with `hand_over` (with `about`) instead of guessing.
   - re-arm `chalk wait --live` in the background and end your turn again, unless you're now doing real work (next section).
4. If it exits saying nobody acted (timeout), don't re-arm; say in one line you've stopped watching.
5. Exactly one `chalk wait --live` at a time. If one is still running (Claude Code lists running shells), don't start another; a duplicate exits at once saying so, and you just ignore it.

They can also press Cmd+Enter ("look now"); the output then starts with LOOK NOW. Treat it exactly like a mark: board_read, react on the board. If they've switched Chalk to quiet mode (menu), `chalk wait --live` only returns on Cmd+Enter; nothing changes for you.

If you'd rather block inside your turn (short waits only), `wait_for_change` does the same as the CLI.

## 4. Doing the work (after "go ahead", "build it", in the terminal or on the board)

1. If no `chalk wait --live` is running, start one in the background FIRST. While one of your cards is "doing" it stays quiet except for urgent marks (a cross-out of the card you're on or the next one, a big X, a note saying stop), so it never nags. Their other marks get an instant "seen" on the board and are waiting for you at your next `board_read`.
2. Go **card by card** in the board's current order: `set_status doing` → make that card's edits → `set_status done` → `board_read` (cheap; it shows anything they marked meanwhile) → next card. Skip crossed-out cards. Don't fold several cards into one big edit and tick them all at the end: the board is how they follow you and steer.
3. If the background wait completes mid-work, it's an urgent mark: act on it at once (skip the crossed-out card with a short note by their mark, or stop and ask on the board with `hand_over`), then start a fresh `chalk wait --live`.
4. When you're done: a short note on the board if there's something to say (or `hand_over` if you need them), make sure one `chalk wait --live` is running, and end your turn with a one-line summary.

## Never

- Never ask them to press a button or say "your turn". They just draw; you're watching.
- Never remove or edit the human's elements unless they explicitly ask. `remove` refuses human work unless `allow_human: true`; only set it when asked. `clear_claude` removes only yours. Never wipe the board.
- Never spam the board with every thought or every file you touch.
- Never ask "want this on the board?": open it or don't. Never reopen it on your own after they closed it or said no board.
- Don't block on the board: if they don't react, carry on with the plan as drawn.

## Quick reference

| tool | use |
|---|---|
| `board_open` | start Chalk + raise the panel beside the terminal; `auto: true` when you open it on your own |
| `board_read` | a pending "look now", then structure + gestures + their changes since your last read |
| `board_snapshot` | PNG of the board, a region, or some elements |
| `layout_plan` | ordered steps as connected cards, optional title |
| `add_note` | a card; or `as: "note"` + `near: <their mark>` for a handwritten reply right there |
| `think` | a short thought out loud in faint chalk, `near` what it's about; fades on its own |
| `add_file` | put a picture (as itself) or any file (as a card) from disk on the board |
| `connect` / `group` / `highlight` | arrows, titled boxes, a chalk wash to point at things |
| `update_note` / `set_status` / `remove` / `clear_claude` | edit, todo/doing/done/failed, delete yours |
| `hand_over` | write a question on the board, `about` the cards it concerns |
| `wait_for_change` | block until a meaningful settled change |
| `wait_for_turn` | block until they press Cmd+Enter (rarely needed) |
| `chalk wait --live` (Bash, background) | keep watching; you're woken when they mark the board |
