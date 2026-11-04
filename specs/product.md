# Pokédex

A mobile Pokédex for Pokémon fans. It shows the full live Pokémon catalogue from PokeAPI,
finds any Pokémon by part of its name, shows its details and evolution chain, keeps a list of
favorites on the phone, and compares two Pokémon stat by stat. Built with Expo for the InHolland
final assignment (Appendix A: Pokédex).

## Core action

Find a Pokémon and look at its details.

## Features

1. [List](./features/list.md): the full live catalogue in a two-column grid, with a card options menu and Share.
2. [Search](./features/search.md): filter the whole catalogue by part of the name while typing.
3. [Detail](./features/detail.md): name, number, types, artwork, About / Stats / Evolution, favorite toggle.
4. [Favorites](./features/favorites.md): own screen, stored in SQLite, still there after a restart.
5. [Compare](./features/compare.md): two Pokémon side by side, who is stronger per stat.

## Data

- **API**: [PokeAPI](https://pokeapi.co/docs/v2). Public, no login, no key. No `.env` needed.
- **Endpoints**:
  - `GET /pokemon?limit=1`, then `GET /pokemon?limit={count}&offset=0`: the catalogue index
    (name + url per entry; the Pokémon id is parsed from the url). See "Catalogue index" below.
  - `GET /pokemon/{id}`: types, stats, height, weight, base experience, abilities, artwork,
    and the `species` link.
  - `GET {species.url}`: the `evolution_chain` link and `varieties` (to find a species' default Pokémon).
  - `GET {evolution_chain.url}`: the evolution tree.
  - Card sprites: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png`,
    the same pattern the API returns in `sprites.front_default`. Detail artwork comes from
    `sprites.other["official-artwork"].front_default` in the `/pokemon/{id}` response.
- **Catalogue index**: one logical, complete dataset under one query key, not a promise of one
  HTTP request. Loading it: read `count`, then request `count` entries from offset 0. If the
  response reports a different `count` or a non-null `next`, keep following `next` until it is
  null, so the index contains every entry the API reports at load time. The count is never
  hardcoded. If any request fails, the whole index is in the error state with Try again; a
  partial index is never shown as the full catalogue. (Checked 2026-11-03: `count` = 1351,
  of which 326 are forms with ids from 10001; `/pokemon-species` has 1025 entries.)
- **Stored on the phone**: SQLite table `favorites`: `id INTEGER PRIMARY KEY` (the `/pokemon` id),
  `name TEXT NOT NULL` (API name), `created_at INTEGER NOT NULL` (ms since epoch).

## Technical choices

- **Stored in SQLite**: favorites only (`id`, `name`, `created_at`).
  - Alternative: also caching the catalogue index or full Pokémon data in SQLite. That would
    duplicate API data and need refresh rules, and it is not needed for the required features.
    Storing only `id` was also considered, but then Favorites could not show names when the
    catalogue fails to load.
  - Why: covers "favorites survive a restart"; the Favorites screen works from the database
    alone; the primary key prevents duplicates; `created_at` gives a newest-first order.
- **Native feature**: the system Share sheet, from the card options menu ("⋮" → Share) in the
  catalogue, search results and favorites. It sends text: name, number, types and a link to
  `https://www.pokemon.com/us/pokedex/<species-name>`. No image.
  - Alternative: haptics on favoriting (less visible value), or sharing the artwork image
    (needs downloading a file first).
  - Why: real value for the user, works in Expo Go on iOS and Android, no file handling.
    The link points to the official Pokédex page; for a form (for example Mega Venusaur) the
    text keeps the form's name and the link goes to its base species, because forms have no page.
- **Catalogue and search data**: one complete catalogue index (see Data), filtered on the phone.
  - Alternative: infinite pages of 20 for the list plus a separate index for search.
  - Why: one source for List and Search, finds Pokémon that have not been scrolled to, fewer
    loading/error states. The Pagination bonus is therefore not claimed.
- **Card images**: sprite URL built from the id (pattern above), placeholder when the image fails.
  - Alternative: one `/pokemon/{id}` request per visible card.
  - Why: no extra API requests for Pokémon details just to get an image URL, smooth scrolling.
    The image files themselves are still downloaded per visible card.

## Shared constraints

- Follow the [Figma design](https://www.figma.com/design/dsgGXcu5WELIvRW90m5308/Pok%C3%A9mon-Code-Challenge?node-id=1-2)
  (the teacher's original stays the reference). For Figma MCP access use the student's
  [working copy](https://www.figma.com/design/N2Kici8MxbWeuIZH3lCFrX/Pokemon-Code-Challenge--Copy-?node-id=15-2863);
  the phone screens are on its "Mobile" page (node `0:1`), icons on "Icons" (`1:13808`).
  Figma sizes are the reference at 390 pt
  screen width; layouts adapt to the available width without horizontal overflow and respect
  safe areas. Where the mockup's data is wrong (Charmander #003, Pikachu 024, "7,0 kg"), API data wins.
- **Platforms**: shared screens, cards, colours and Detail tabs. Only these follow the platform's
  own mockup: back button (iOS "‹ Vorige", Android arrow), Detail number (iOS "#001", Android
  "001"), options sheet (iOS grouped list + Cancel, Android full-width sheet), share icon, active
  tab style (iOS purple icon + label, Android pill), and the Android search field showing a back
  arrow while typing.
- **Navigation**: bottom tabs Pokémons / Favorites / Compare. Compare is added because the
  feature is mandatory and has no design; it uses the same tab style. Detail is a stack screen on
  top of the tabs.
  - The tab bar uses Expo Router's JavaScript `Tabs`, not native tabs. Changed during Setup (#1):
    native tabs on iOS 26 use the system "Liquid Glass" bar, which ignores the background and
    cannot reproduce the Figma bar; JS tabs draw the design's bar on both platforms.
  - Icons: the Pokéball and heart exported from Figma (PNG 1x/2x/3x), recoloured per state.
    iOS: active Purple, inactive Midnight. Android: active icon white on a Purple 64 × 32 pill
    with a Midnight label, inactive `#67678C` (sampled from the Figma bar).
  - Compare has no icon in the design: two opposite arrows, SF Symbol `arrow.left.arrow.right`
    on iOS and Material Symbol `compare_arrows` on Android (`expo-symbols`).
- **Numbers**: the `/pokemon` id everywhere, zero-padded to at least 3 digits ("001", "1025", "10033").
- **Names**: API name for display, hyphens shown as spaces, each word capitalised ("mr-mime" → "Mr Mime").
- **States**: every API and database load has a loading state and an error state with
  Try again. Empty data is not an error. Data already on screen stays visible when a background
  refresh fails. An invalid or unknown route id shows "Pokémon not found" with a way back.
- **Fonts**: Rubik from the course's `fonts.zip`, loaded with Expo Font (only the weights used:
  Regular, Medium, SemiBold, Bold; no `__MACOSX` files). Rubik Bold replaces the design's
  Cabinet Grotesk titles and Rubik Regular replaces the Inter search placeholder, because the
  assignment supplies only Rubik. Tab labels, the back label and the iOS options sheet use the
  system font, as in the design. The Android options sheet uses Rubik Medium 16, as in its
  Figma mockup (clarified during List, #2).
- **Theme tokens** (`src/constants/theme.ts`), from Figma: Midnight `#0E0940` (text),
  Purple `#5631E8` (accent, badges, active tab, stat bars), Daylight `#EDF6FF` (screen background),
  Silver `#DBDAE6` (inactive tab line, bar track), card image background `#F6F6FF`, white cards
  with radius 8 and soft shadow `#303773` at 15% (offset 0/2, blur 15). Screen padding 24,
  search field inset 16, grid gap 16. Badge: Purple, radius 4, Rubik Medium 10, white.
  Type chip: Midnight at 8%, radius 99, 12 pt colour dot, Rubik SemiBold 16.
- **Type colours** (Figma "Types" page): Normal `#9099A2`, Fighting `#CE3F6A`, Flying `#93A9E2`,
  Poison `#AB6AC8`, Ground `#D87645`, Rock `#C4BA85`, Bug `#8FBF2B`, Ghost `#546AA6`,
  Steel `#5A8FA1`, Fire `#FF4F68`, Water `#4D90D6`, Grass `#64BC55`, Electric `#FFCF00`,
  Psychic `#830CB9`, Ice `#7DE0D0`, Dragon `#0670BE`, Dark `#5C5262`, Fairy `#EB90E6`,
  Unknown `#B6B6B6`, Shadow `#5B5265`.
- **Splash**: Daylight background with the Pokémon logo from the design, centred (216 pt wide).
  Limitation: Expo Go shows the app icon instead of the configured splash (Expo SDK 58
  splash-screen docs), so this splash is only visible in a development or production build.
  In Expo Go we only check that the app starts without a font flash.

## Technical core

- [ ] Runs in Expo Go
- [ ] Live data through TanStack Query
- [ ] At least 2 screens with Expo Router
- [ ] Something in SQLite that survives a restart
- [ ] Loading and error state on every load
- [ ] One native feature: Share, in the card options menu ("⋮")
- [ ] TypeScript and ESLint without errors
- [ ] UI, data and logic in separate files

## Optional

None selected yet. A bonus is added only by a deliberate decision, with its exact criteria from the assignment.

- [ ] Three different Reanimated animations, each with a purpose
- [ ] Dark mode: every screen looks right, all colours from the theme
- [ ] Pagination: page by page while you scroll, not all at once
- [ ] Clean TypeScript: no `any`, no `as` casts, no `@ts-ignore`
- [ ] Localization: two languages
- [ ] No warnings: no `console.log`, none in the terminal or on screen
- [ ] Offline: works in airplane mode with the last data
- [ ] Tests: one per feature on the logic, `npm test` passes
- [ ] CI: lint and tsc on every push
- [ ] Accessibility: button labels, largest text size
- [ ] Optimistic update

## Out of scope

- Accounts, sync between phones, a backend.
- The Web and SmartTV pages of the Figma file; a web version.
- Other APIs than PokeAPI and the pokemon.com share link.
- Offline use beyond what TanStack Query keeps in memory while the app runs.
- Moves, locations, items, battles, team building.
- Filtering or sorting by type, generation or stats.
- Dark mode and other languages.
