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
- Title and grid (Figma Home): one container at X=24, width 342, padding 0, vertical gap 16.
  Title "All Pokémon": Rubik Bold 24, line height 120% (28.8), Midnight. Its height is 29, so the
  first row starts at Y=45 inside the container. Rows are 342 × 211 with a horizontal gap of 16.
  The container's Y=140 in the mockup includes the search field from [Search](./search.md), so it
  is not the app's top padding.
- Card: Purple number badge at top-left (8, 8), sprite on `#F6F6FF` (placeholder if it fails),
  name in Rubik Medium 16 on one line with ellipsis, and a 24 pt "⋮" button. Figma details:
  - Image: a 163 × 163 layer at (0, 0), image fill in Fill mode; the transparent margin is part
    of the sprite. How PokeAPI sprites scale is checked on the phone.
  - Badge: padding 6 left/right, 4 top, 2 bottom, radius 4, Rubik Medium 10. Its width follows
    the number ("001" gives 30 × 18).
  - Footer: 48 high, padding 12 on every side, gap 0, content centred vertically. The name
    (Rubik Medium 16, line height 120% = 19.2, Midnight) takes the remaining width.
  - "⋮": a 24 × 24 frame at X=127, Y=12 in the 163-wide footer. The top dot is 3 × 3 at
    (17, 4.5), Midnight.
- Missing sprite (agreed, not in Figma): a neutral "?" centred in the image area.
- "⋮" opens the options sheet, one shared component also used by Search and Favorites:
  Open Pokémon / Add to favorites (or Remove from favorites) / Share. iOS: grouped list plus
  Cancel. Android: full-width sheet without Cancel. Tapping outside closes it. The sheet sits at
  the bottom, above the safe area; mockup Y coordinates (390 × 844) are not fixed in the app.
  - Backdrop (agreed, not in Figma): `rgba(0, 0, 0, 0.3)`.
  - Each row: a 24 × 24 icon frame, then the label at X=64 inside the row.
  - iOS (Figma): actions block 366 wide at 390 (12 per side), radius 16, clipped. Three 60-high
    rows with 1 pt gaps that show the `#DADADA` block background as separators (block height
    182). Rows `#F0F0F0`, padding 20 horizontal / 18 vertical, gap 20 between icon and label.
    Labels in the system font (SF Pro Text Regular in Figma) 18, line height 130% (23.4), `#000000`.
    Icons `#006DF8`, inside the 24 × 24 frame: Open 18 × 18 at (3, 3), Favorite 20 × 18.35 at
    (2, 2.65), Share 16 × 22 at (4, 1). The Open icon (a diagonal two-way arrow) is exported from
    Figma as `assets/images/open.png` (1x/2x/3x): the whole 24 × 24 frame with its transparent
    margin, single-colour, recoloured with `tintColor`. Cancel: 366 × 58, radius 16, `#FEFEFE`, padding 24 / 16,
    centred label in the system font, Bold 20, line height 26, `#006DF8`. 12 between the
    actions block and Cancel.
  - Android (Figma): full width, white `#FFFFFF`, radius 0, no Cancel. The whole bottom block
    is 390 × 196 including the system navigation area. Labels in Rubik Medium 16, line height
    120% (19.2), Midnight. Open icon 18 × 18 at (3, 3), Midnight. Share uses the Android share
    icon (three connected dots). The row height and padding were not measured.
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
