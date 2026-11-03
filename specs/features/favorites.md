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
