# Search

## Goal

Find any Pokémon by typing part of its name, including Pokémon I have not scrolled to yet.

## Constraints

- Lives on the Pokémons tab (Home): the search field from the design sits above the grid. No new screen.
- Filters the same complete catalogue index as [List](./list.md), on the phone. No extra API
  requests and no per-Pokémon detail requests.
- Matching: trim the query, ignore case, treat hyphen and space as equal, match a substring of the
  name. Results update on every keystroke.
- Results reuse the List grid, card and options sheet unchanged.
- Field per design: white, radius 8, inset 16, search icon, placeholder "Search for Pokémon..".
  On Android the icon turns into a back arrow while typing; tapping it clears the query and closes
  the keyboard.
- The keyboard does not hide results: the grid stays scrollable and scrolling closes the keyboard.
- While the index is loading or has failed, Search shows the List's loading or error state.

## Acceptance Criteria

- [ ] Typing "pika" or "PIKA" shows Pikachu (and other names containing "pika").
- [ ] Right after launch, without scrolling, "pecharunt" finds Pecharunt (#1025).
- [ ] "mr mime" and "mr-mime" both find Mr Mime.
- [ ] While the query is not empty, the "All Pokémon" title is hidden and the results use the same
      cards with a working "⋮" menu.
- [ ] A query without matches shows the empty state "No Pokémon found" (not an error).
- [ ] Clearing the query shows the full list again.

## Out of Scope

- Searching by number, type or ability.
- Fuzzy matching or typo tolerance.
- Search history or suggestions.
- Server-side search (PokeAPI has no search endpoint).
