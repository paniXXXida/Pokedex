# Explanation - Pokédex

**Route:** Pokédex. **Tools:** Claude Code (implementation), Codex (mentoring and review).

## 1. Your technical choices

All four choices are unchanged since the first version of `specs/product.md`.

**Favorites in SQLite.** Only favorites are stored: `id`, `name`, `created_at`
(`src/services/database.ts:29`). The primary key with `INSERT OR IGNORE` prevents duplicates
(`src/services/favorites.ts:20`), and the stored name lets Favorites work even when the catalogue
fails to load. Caching API data in SQLite was not needed and would need refresh rules.

**Native feature: system Share.** "⋮" → Share on a card opens the system share sheet with name,
number, types and a pokemon.com link (`src/hooks/use-share-pokemon.ts:58`). It works in Expo Go
on iOS and Android without file handling; haptics had less visible value.

**One complete catalogue index for search.** The app reads `count` and loads every entry
(`src/services/pokeapi.ts:120`). List displays the full index, and Search filters it on the phone. Pages
of 20 plus a separate search index would mean more loading and error states, so I do not claim
the Pagination bonus.

**Card images from the id.** The sprite URL is built from the id (`src/services/pokeapi.ts:270`),
with a "?" when the image fails (`src/components/pokemon-card.tsx:35`). This avoids one
`/pokemon/{id}` request per card just to get an image URL.

## 2. Pick one feature and explain how it works, from API call to screen.

**Search.** To search, the app only needs the names of all Pokémon. `fetchCatalogueIndex`
usually makes two requests: first it asks for `count`, then it asks for the full index, and it
follows `next` if there are pages left (`src/services/pokeapi.ts:120`). The API gives a name and
a URL for each Pokémon, and the app takes the id from the URL (`src/services/pokeapi.ts:109`).
The loaded list is kept in memory, in the TanStack Query cache under `['catalogue']`
(`src/hooks/use-catalogue.ts:10`). When I type "pech", the search checks the names in the whole
list on the phone, not only the cards I have scrolled to (`src/hooks/use-catalogue-search.ts:20`,
`src/utils/pokemon-search.ts:16`). That is why Pecharunt #1025 is found before any scrolling.
For the card, the app builds the image URL from the id (`src/services/pokeapi.ts:270`); the
detailed data is loaded separately, only when it is needed, for example on Detail
(`src/hooks/use-pokemon.ts:14`). While the list loads, the screen shows the logo with a spinner
(`src/app/(tabs)/index.tsx:60`); on an error it shows Try again, which loads the list again
(`src/app/(tabs)/index.tsx:56`); a search without matches shows "No Pokémon found", which is not
an error (`src/app/(tabs)/index.tsx:46`).

## 3. Name a suggestion from the agent that you rejected or changed.

**The iOS Detail header.** In the #5 plan the agent proposed an opaque Daylight header instead of
the semi-transparent one in the spec, and wanted to rewrite the spec line, because "Above the
Daylight band an opaque header looks the same" (`chat-history/issue-5-detail.md:1218`, summary at
`chat-history/issue-5-detail.md:1760`). I did not accept it: I wanted the iOS header to match the Figma design as closely as possible.
The corrected plan
keeps Daylight at 50% with `headerTransparent`, so the artwork shows through while scrolling
(`chat-history/issue-5-detail.md:2068`); in the code: `src/app/pokemon/[id].tsx:111`.
