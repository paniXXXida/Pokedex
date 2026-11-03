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
- Layout per Figma at 390 pt, adapting to width: header with back (iOS "‹ Vorige", Android arrow)
  and heart; name Rubik Bold 32; number Rubik Regular 24 at 30% (iOS "#001", Android "001");
  type chips with type-colour dot; 200 × 200 official artwork on the Daylight band (placeholder
  when missing); white content area; tabs About / Stats / Evolution (Rubik SemiBold 14, active
  with a 2 pt Purple line, inactive at 50% on a Silver line).
- The header stays in place while content scrolls. On Android the name appears centred in the
  header after scrolling past it. The design's blur is replaced by a semi-opaque Daylight
  background (blur would need a new dependency).
- About: Name; ID (padded); Base "{base_experience} XP" ("—" when the API has none);
  Weight `weight / 10` in kg ("6.9 kg"); Height `height / 10` in m ("0.7 m"); Types
  (comma-separated); Abilities (all, display names, comma-separated). Labels Rubik SemiBold 14,
  values Rubik Regular 14 at 65%, row gap 16.
- Stats: HP, Attack, Defense, Special Attack, Special Defense, Speed, each with its value on
  the right and a 4 pt Purple bar on a Silver track. Bar length = value / 255 (the highest
  possible base stat).
- Evolution keeps the real parent → child links of the chain, including branches. A node is the
  list-variant card (80 pt image, badge, name) at the full content width. Each child is drawn
  below its own parent with a dotted connector to it. When a parent has more than one child, its
  children are indented one step and each connects to that parent. A node's descendants come
  before its next sibling. Linear chains look exactly like the design. Branches are never
  merged by grouping per stage.
- An evolution node is a species. Its number, sprite and tap target come from that species'
  default Pokémon (`varieties` with `is_default`), loaded through the species link and cached.
- The current Pokémon's node is highlighted. For a form, that is its species' node.
- The favorite heart (outline / filled red) uses the same favorites service and hooks as
  [Favorites](./favorites.md): one database initialisation path.
- Share is not on Detail. The design has it only in the card options sheet.

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
