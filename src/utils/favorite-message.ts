import type { FavoriteActionError, FavoritesReadError } from '@/hooks/use-favorites';

type FavoriteStatus = {
  readError: FavoritesReadError | null;
  error: FavoriteActionError | null;
};

/**
 * The message for the favorites state, shared by the options sheet and the Detail heart.
 * A failed write and a failed re-read after a successful write are different: in the second
 * case the change is saved, only the list is not refreshed.
 */
export function favoriteMessage({ readError, error }: FavoriteStatus): string | null {
  if (readError !== null) {
    if (error?.kind === 'refresh') {
      return error.action === 'add'
        ? 'Added to favorites, but the list could not be refreshed.'
        : 'Removed from favorites, but the list could not be refreshed.';
    }
    return readError === 'failed' ? 'Could not load favorites.' : 'Favorites could not be refreshed.';
  }
  if (error?.kind === 'write') {
    return error.action === 'add' ? 'Could not add to favorites.' : 'Could not remove from favorites.';
  }
  return null;
}
