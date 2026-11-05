import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

const DATABASE_NAME = 'pokedex.db';

let ready: Promise<SQLiteDatabase> | null = null;

/**
 * The app's only database initialisation path: opens the file and creates the tables once,
 * then every caller shares the same connection. `SQLiteProvider` is not used, because it renders
 * nothing until the database is open and rethrows errors, which would block the whole app.
 *
 * If any stage fails (opening or creating a table), the shared promise is cleared, so the next
 * call (Try again) runs every stage again instead of returning the cached failure.
 */
export function getDatabase(): Promise<SQLiteDatabase> {
  if (ready === null) {
    ready = openAndCreateTables().catch((error: unknown) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}

async function openAndCreateTables(): Promise<SQLiteDatabase> {
  const database = await openDatabaseAsync(DATABASE_NAME);
  // Fixed SQL without values: `execAsync` takes no parameters, so it is used only here.
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
  return database;
}
