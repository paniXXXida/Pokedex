# Detail

## Goal

See everything important about one Pokémon (name, number, types, artwork, about, stats and its
evolution chain), move through the chain, and favorite or unfavorite it.

## Constraints

- A stack screen with the Pokémon id as route parameter. Opened from cards in List, Search and
  Favorites, from Open Pokémon in the options sheet, and from Evolution cards. Back returns to
  where it came from.
- The id must be a positive integer. An invalid id or a 404 shows "Pokémon not found" with a way back.
- Data through resource links: `/pokemon/{id}` (query key per id, shared with Share and Compare)
  → `species.url` → `evolution_chain.url`. Pokémon, species and chain ids are not interchangeable.
  Species and chain start loading when Detail opens, so switching tabs is instant.
- Layout per the Figma Detail measurements (frame 390 × 844, iOS and Android), adapting to the
  screen width and safe areas. Side padding 24.
  - Top: iOS 24 below the navigation bar, Android 16 below the header. A 38 high row with the
    name (Rubik Bold 32 / 120%, replacing Cabinet Grotesk) and, right-aligned next to it, the
    number (Rubik Regular 24 / 38 at 30%; iOS "#001", Android "001"). 12 below it the type
    chips (8 apart): padding L 12, T 4, R 14, B 4, gap 8, radius 99, Midnight at 8%, a 12 pt
    dot in the type colour, Rubik SemiBold 16 / 24. 24 below them the 200 × 200 official
    artwork, centred (placeholder when missing), overlapping the white sheet by 50.
  - Tabs 24 below the artwork: three equal tabs, padding T 5 / B 10, Rubik SemiBold 14 / 120%;
    active 100% with a 2 pt Purple bottom line, inactive 50% with a 2 pt Silver line. The tab
    content starts 24 below the tabs; the scroll content ends above the home indicator.
- Header (Figma scroll state):
  - iOS: back "‹ Vorige", heart on the right. It stays in place with Daylight at 50% and the
    content (artwork) shows through it while scrolling. The design's blur is left out: it
    would need a new dependency. The name does not appear in the header.
  - Android: back arrow, heart on the right, opaque Daylight. After the name row has scrolled
    out of view, the name appears centred in the header (Figma Cabinet Grotesk ExtraBold
    20 / 24; the app uses Rubik Bold) with the header shadow.
- About: Name; ID (padded, "001"); Base "{base_experience} XP" ("—" when the API has none);
  Weight `weight / 10` in kg ("6.9 kg"); Height `height / 10` in m ("0.7 m"); Types
  (comma-separated); Abilities (all, display names, comma-separated). Rows with a gap of 16:
  label column 100 wide (Rubik SemiBold 14 / 125%), 16 to the value (Rubik Regular 14 / 125%
  at 65%). Built per row, not as two columns, so a value that wraps cannot shift other rows.
- Stats: HP, Attack, Defense, Special Attack, Special Defense, Speed. Rows 24 apart: label
  (Rubik SemiBold 14 / 125%) and value (Rubik Regular 14 / 125% at 65%, right-aligned), each
  half the width; 7 below them a 4 pt track (radius 99, Shades/Grey `#F3F3F7`) with a Purple
  bar. Bar length = value / 255 (the highest possible base stat). The bars in the mockup are
  not proportional to its values, so the formula decides.
- Evolution keeps the real parent → child links of the chain, including branches. A node is the
  list-variant card at the full content width: 80 high, white, radius 8, card shadow, an 80 × 80
  sprite zone on `#F6F6FF`, then padding 12, gap 8, number badge and name (Rubik Medium 16).
  Each child is drawn below its own parent. A node's descendants come before its next sibling.
  Linear chains look exactly like the design: cards 12 from a connector of 14 (iOS) or 20
  (Android), a vertical dashed line at x 40 (Midnight, 2 wide, dash 4 / gap 4, opacity 30%).
  Branches are never merged by grouping per stage.
- An evolution node is a species. Its number, sprite and the Pokémon it opens come from that
  species' default Pokémon (`varieties` with `is_default`), loaded through the species link and
  cached. The highlight is decided by species id, navigation by Pokémon id: on Mega Venusaur,
  the Venusaur node is highlighted and opens the regular Venusaur (#003). A tap is skipped only
  when its Pokémon is the one already open.
- The current Pokémon's node is highlighted. For a form, that is its species' node.
- The favorite heart uses the same favorites service and hooks as
  [Favorites](./favorites.md): one database initialisation path. Icons exported from Figma:
  outline Midnight and filled Primary/Red `#FF4F68`, in a 24 × 24 frame; iOS tap area 40 × 40.
- Share is not on Detail. The design has it only in the card options sheet.

### Decisions (agreed in #5)

- **Data through resource links**, ids parsed from the urls: `['pokemon', id]` (shared with
  Share and Compare, extended with species id, height, weight, base experience, abilities,
  stats, artwork) → `['pokemon-species', speciesId]` → `['evolution-chain', chainId]` → one
  `['pokemon-species', id]` per node (the same cache entries). Species and chain use
  `staleTime: Infinity`: static data, reused while moving through a chain. A 404 for
  `/pokemon/{id}` is not retried, so "Pokémon not found" appears at once.
- **The Evolution tab has one state of its own**: loading until the chain and every node's
  species are loaded; an error with Try again when one of them has no data. Try again
  refetches only the failed queries. About and Stats do not wait for it.
- **Branches (project decision; the design shows only a linear chain)**: a pure function
  (`evolutionRows`) flattens the tree. An only child stays at its parent's indent with the
  design's connector. The children of a parent with more than one child are indented by 56 and
  joined to the parent's vertical dashed line by a horizontal dash; the line continues past
  nested rows until the parent's last child (Wurmple). Dashes are drawn as small views, because
  one-sided dashed borders are unreliable on Android.
- **Highlighted node (project decision; the design has no selected state)**: a 2 pt Purple
  outline, which does not change the card's size.
- **Heart messages (project decision; not in the design)**: a white strip below the header, so
  they are visible on every tab. A write error ("Could not add to favorites.") leaves the heart
  unchanged; tapping it again retries the write. A read or refresh error shows the message with
  Try again, which only re-reads. The texts are shared with the options sheet.

## Acceptance Criteria

- [ ] Bulbasaur (#001) shows its name, number, Grass and Poison chips in their type colours, its
      artwork and About values from the API. Weight and height use a decimal point.
- [ ] About / Stats / Evolution switch instantly, without a new loading state for About or Stats.
- [ ] Stats shows six rows with values and bars.
- [ ] Evolution, Pichu → Pikachu → Raichu: three linked cards, as in the design.
- [ ] Evolution, Eevee: all eight evolutions shown as children of Eevee.
- [ ] Evolution, Wurmple: Silcoon → Beautifly and Cascoon → Dustox stay separate branches.
- [ ] Evolution, Oddish → Gloom: Vileplume and Bellossom both shown as children of Gloom.
- [ ] Tapping a node opens that Pokémon's Detail, and back returns.
- [ ] A Pokémon whose chain has only one species (for example Tauros) shows
      "This Pokémon does not evolve". A form such as Mega Venusaur shows the Bulbasaur chain with
      Venusaur highlighted.
- [ ] The heart adds and removes the favorite. After the SQLite write succeeds, Favorites and the
      options sheet reflect it at once.
      Repeated taps never create duplicates. A failed write shows a message and leaves the heart unchanged.
- [ ] States:
  - loading and error with Try again for the Pokémon itself;
  - the Evolution tab shows its own loading and error with Try again, while About and Stats keep working;
  - "Pokémon not found" for `/pokemon/abc` or an unknown id.

## Out of Scope

- Moves, locations, egg groups, gender, flavour text, shiny sprites, cries.
- Evolution conditions (level, item, trade).
- Switching between forms inside Detail.
- Share from Detail, previous/next Pokémon buttons, swiping between Pokémon.
