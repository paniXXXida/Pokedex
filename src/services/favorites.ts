import { getDatabase } from '@/services/database';
import type { CatalogueEntry } from '@/services/pokeapi';

/** Favorites, newest first. The id only breaks ties within the same millisecond. */
export async function getFavorites(): Promise<CatalogueEntry[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<unknown>(
    'SELECT id, name FROM favorites ORDER BY created_at DESC, id DESC',
  );
  return rows.map(parseFavoriteRow);
}

/**
 * Stores a favorite. The primary key decides: adding one that is already stored keeps the single
 * existing row and its original `created_at`, so its position does not change.
 */
export async function addFavorite(pokemon: CatalogueEntry): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT OR IGNORE INTO favorites (id, name, created_at) VALUES (?, ?, ?)',
    pokemon.id,
    pokemon.name,
    Date.now(),
  );
}

export async function removeFavorite(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM favorites WHERE id = ?', id);
}

/** Rows are checked like API data, instead of trusting the generic type of `getAllAsync`. */
function parseFavoriteRow(row: unknown): CatalogueEntry {
  if (
    typeof row !== 'object' ||
    row === null ||
    !('id' in row) ||
    !('name' in row) ||
    typeof row.id !== 'number' ||
    typeof row.name !== 'string'
  ) {
    throw new Error('A saved favorite could not be read.');
  }
  return { id: row.id, name: row.name };
}
