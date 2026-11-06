# Search

## Goal

Find any Pokémon by typing part of its name, including Pokémon I have not scrolled to yet.

## Constraints

- Lives on the Pokémons tab (Home): the search field from the design is fixed above the grid;
  the title "All Pokémon" and the cards scroll under it. No new screen.
- Filters the same complete catalogue index as [List](./list.md), on the phone. No extra API
  requests and no per-Pokémon detail requests.
- Query: the field always shows the text exactly as typed (raw query); it is never rewritten.
  A normalised form is used only for filtering and to decide whether a search is active (which
  hides the title and allows the empty state).
- Matching: lower case, hyphen and space treated as equal, runs of whitespace collapsed, trimmed;
  the same for the query and each API name. A result is a name that contains the normalised
  query. Results update on every keystroke, without debounce.
- A query that is empty after normalisation (only spaces, or a lone "-") is no search: the full
  list with its title, no empty state.
- Results reuse the List grid, card and options sheet unchanged.
- When the normalised query changes, the grid scrolls back to the top, so new results are visible
  at once even after scrolling deep into the list. Typing keeps the focus and the keyboard.
- Field (Figma, at 390 wide): iOS Home X=16, Y=60; Android Home X=16, Y=68; 358 × 48.
  - Width follows the screen: `window width − 2 × 16`.
  - Padding 16 horizontal / 12 vertical, 12 between the 24 × 24 icon frame and the text,
    radius 8, `#FFFFFF`, the card shadow (0/2, blur 15, `#303773` at 15%).
  - Text: Rubik Regular 16 (replaces Figma's Inter Regular 16; line height "Auto", so none is
    set). Typed text `#000000` on both platforms.
  - Placeholder "Search for Pokémon..", `#000000` at 30% (Figma iOS). Decision: Android uses the
    same placeholder style; its own values were not measured.
  - Icons exported from Figma (24 × 24 frame, `assets/images/search.png`, `arrow-back.png`):
    magnifier `#000000` on iOS and Midnight on Android; Android back arrow Midnight.
- Position:
  - Assumption: the field sits 16 below the real safe area on both platforms. Figma's Y values
    include the mockups' status bars, whose heights were not measured; to be checked against
    the mockups on the phone.
  - 32 between the field and the list content. Measured on iOS Home (field bottom 108, title
    block Y=140). Decision: the same 32 on Android Home, and above search results, whose
    mockups have no title and no measured gap.
- A tap anywhere on the field (magnifier or free area) focuses the input and opens the keyboard;
  a tap on an already focused field changes nothing (no blur, no clearing). Added after the
  iPhone check, where a tap on the magnifier did nothing.
- iOS: the magnifier is always shown. Android (our clarification of "while typing"): a back arrow
  replaces the magnifier while the field is focused or the raw query is not empty. Tapping it
  clears the query, removes focus and closes the keyboard. It exits search on the same tab;
  there is no navigation.
- The keyboard does not hide results: the grid stays scrollable, dragging it closes the keyboard,
  and a tap on a card or "⋮" works while the keyboard is open (it closes first). Android does
  not resize the window for the keyboard (edge-to-edge); if that hides results,
  `KeyboardAvoidingView` from React Native is used (no new dependency).
- While the index is loading or has failed, the field stays visible and Search shows the List's
  loading or error state below it.

## Acceptance Criteria

- [x] Typing "pika" or "PIKA" shows Pikachu (and other names containing "pika").
- [x] Right after launch, without scrolling, "pecharunt" finds Pecharunt (#1025).
- [x] "mr mime" and "mr-mime" both find Mr Mime.
- [x] While the query is not empty, the "All Pokémon" title is hidden and the results use the same
      cards with a working "⋮" menu.
- [x] A query without matches shows the empty state "No Pokémon found" (not an error).
- [x] Clearing the query shows the full list again.
- [x] The keyboard does not hide results; on Android the field shows a back arrow while typing.
- [x] No extra API requests: filtering uses the catalogue index from [List](./list.md).

## Out of Scope

- Searching by number, type or ability.
- Fuzzy matching or typo tolerance.
- Search history or suggestions.
- Server-side search (PokeAPI has no search endpoint).
