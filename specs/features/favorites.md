# Favorites

## Goal

Keep my favorite Pokémon on a separate screen that is still there after fully restarting the app.

## Constraints

- The Favorites tab with the title "My favorites" and the same grid, cards and options sheet as
  [List](./list.md).
- Storage: SQLite table `favorites(id INTEGER PRIMARY KEY, name TEXT NOT NULL,
  created_at INTEGER NOT NULL)`, as in `specs/product.md`. All SQL lives in a service, with
  parameters, never string-built. There is one database initialisation path for the whole app.
- The screen reads only from the database: it works even when the catalogue index fails.
  Sprites use the same id-based URL as List. Order is newest first (`created_at DESC`).
- Adding never creates a duplicate: the primary key decides. Repeated taps while a write is
  running are ignored.
- The UI changes only after the SQLite write succeeds, with no optimistic change. Right after a
  successful add or remove, the favorites query is updated or invalidated. Favorites, the options
  sheet ("Add to favorites" ↔ "Remove from favorites") and the Detail heart then all show the new
  state without a restart.
- Tab style follows the platform: iOS shows the active icon and label in Purple; Android shows
  a pill.

### Decisions (agreed in #4)

- **Initialisation**: `getDatabase()` in `src/services/database.ts` opens `pokedex.db` and runs
  `CREATE TABLE IF NOT EXISTS` once; every caller shares that connection. If either stage
  fails, the shared promise is cleared, so Try again runs both stages again in the same run.
  - Alternative: `SQLiteProvider`. Rejected: it renders nothing until the database is open and
    rethrows errors by default, so a database problem would block or crash the whole app,
    including the catalogue.
- **Duplicates**: `INSERT OR IGNORE`. Adding a stored Pokémon keeps the one row and its original
  `created_at`, so its position stays; it is not an error. Order ties within one millisecond are
  broken by `id DESC`.
- **One cache entry** `['favorites']` for the list; "is favorite" is derived from it, not a
  second query. Favorites query and writes use `networkMode: 'always'` (local, independent of
  the network); the query uses `retry: false` (a failed local read fails the same way again).
- **Write and refresh are separate steps.** The write changes SQLite. On success, the list is
  re-read for real and awaited: running reads are cancelled, then `queryClient.query` with
  `staleTime: 0`. That call rejects when the read fails.
  - A failed write: "Could not add to favorites." / "Could not remove from favorites.";
    nothing changed.
  - A failed re-read after a successful write: "Added to favorites, but the list could not be
    refreshed." (or "Removed …"). It never says the change was not saved. The old list stays
    visible and the shared query is in error on every screen.
- **No toggle on unknown or outdated data**: Add/Remove is offered only when the list is loaded,
  up to date and nothing is running. Otherwise the row is busy, or it shows a message and
  "Try again", which re-reads the list and never repeats a write. Taps during a toggle are ignored.
- **Options sheet** closes after the write and the re-read have both succeeded, like Open Pokémon
  and Share; opening "⋮" again shows the switched label. After an error it stays open with the
  message, which is cleared when the sheet closes.
- **Favorites screen**: first read → loading; failed read without data → error with Try again;
  failed refresh with data → the old list plus "Could not refresh favorites. The list may be out
  of date." with Try again above it; no rows → "No favorites yet" with the hint "Tap ⋮ on a
  Pokémon and choose Add to favorites."
- **Assumptions (Figma not measured in #4)**: the title starts 24 below the safe area; the empty
  hint (8 below the title) and the refresh error (12 gap) use agreed spacing; Remove uses the same
  outline heart as Add. To be compared with the mockups or screenshots.

## Acceptance Criteria

- [ ] With no favorites, the screen shows the empty state "No favorites yet" and a hint on how to
      add one (not an error).
- [ ] "Add to favorites" in the options sheet (catalogue or search) or the Detail heart puts the
      Pokémon at the top of Favorites as soon as the write succeeds.
- [ ] "Remove from favorites" in the options sheet or on Detail removes it as soon as the write succeeds. Removing the
      last one shows the empty state.
- [ ] Fully closing the app and opening it again shows the same favorites in the same order.
- [ ] Tapping a favorite opens its Detail; back returns to Favorites.
- [ ] Adding the same Pokémon twice keeps one entry.
- [ ] A failed write shows a message and changes nothing.
- [ ] A failed read shows an error with Try again.

## Out of Scope

- Reordering, notes or folders.
- Sync between devices.
- Storing full Pokémon details for offline use.
- The Optimistic update bonus.
