# List

## Goal

Browse the whole live Pokémon catalogue in the design's two-column grid and open any Pokémon,
or share it from the card's options menu.

## Constraints

- Lives on the Pokémons tab (Home), below the search field from [Search](./search.md).
- Data: the complete catalogue index from `specs/product.md` (one query key; `count` and the
  loaded entries kept consistent; no hardcoded count). No per-card API requests for the grid.
- Virtualized two-column grid with the Pokémon id as stable key. The bottom tab bar never covers
  the last row.
- Layout reference at 390 pt (Figma): screen padding 24, gap 16, card 163 × 211 with a square
  163 image area and a 12 pt footer padding. On other widths the card width is
  `(available width − 2 × 24 − 16) / 2` and the image area stays square. No horizontal overflow.
- Card: Purple number badge at top-left (8, 8), sprite centred on `#F6F6FF` (placeholder if it
  fails), name in Rubik Medium 16 on one line with ellipsis, and a 24 pt "⋮" button.
- "⋮" opens the options sheet, one shared component also used by Search and Favorites:
  Open Pokémon / Add to favorites (or Remove from favorites) / Share. iOS: grouped list plus
  Cancel. Android: full-width sheet without Cancel. Tapping outside closes it.
- Share needs types and the species name, which the index does not have. It uses the same
  cached `/pokemon/{id}` query as Detail: cached → share at once; not cached → the Share row
  shows a waiting state and the sheet stays open; failure → a message in the sheet with Try again.
- Share text: display name, number and types, plus the link
  `https://www.pokemon.com/us/pokedex/<species-name>`, all in the message text so it works on both
  platforms. A form keeps its own name in the text ("Venusaur Mega #10033 — Grass, Poison"); its
  link goes to the base species ("…/pokedex/venusaur").
- Colours, spacing, radii and shadow from `src/constants/theme.ts`. No new dependencies.

## Acceptance Criteria

- [ ] The title "All Pokémon" and a two-column grid with every entry the API reports, including
      forms. The last entry (id above 10000) can be reached by scrolling.
- [ ] Each card shows the badge ("001", "1025", "10033"), the sprite or a placeholder, the name
      and "⋮". Scrolling through the whole list is smooth.
- [ ] No horizontal overflow on a narrow phone (about 360 pt wide) and on a wide one.
- [ ] Tapping a card, or Open Pokémon in the options sheet, opens Detail for that id.
- [ ] Share opens the system share sheet with the agreed text and link. It shows a waiting state
      while details load, and an error with Try again when they fail.
- [ ] While the index loads, a loading state is shown. When it fails, an error with Try again is
      shown, and Try again loads the list.

## Out of Scope

- Filtering by name (see [Search](./search.md)).
- Making "Add / Remove from favorites" work: the sheet item is wired in [Favorites](./favorites.md).
- Types or stats on the cards.
- Sorting or filtering by type or generation, pull to refresh, the Pagination bonus.
