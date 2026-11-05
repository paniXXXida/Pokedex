import {
  type QueryClient,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { addFavorite, getFavorites, removeFavorite } from '@/services/favorites';
import type { CatalogueEntry } from '@/services/pokeapi';

/**
 * The favorites list from SQLite, newest first: one cache entry shared by the Favorites screen,
 * the options sheet and the Detail heart (#5).
 * - `staleTime: Infinity`: the list changes only through our own writes, which re-read it.
 * - `retry: false`: a failed local read would fail the same way again; Try again is shown at once.
 * - `networkMode: 'always'`: a local database read must never wait for the network.
 */
export const favoritesQueryOptions = queryOptions({
  queryKey: ['favorites'],
  queryFn: getFavorites,
  staleTime: Infinity,
  retry: false,
  networkMode: 'always',
});

export function useFavorites() {
  return useQuery(favoritesQueryOptions);
}

export type FavoriteAction = 'add' | 'remove';

/** The list could not be read: 'failed' without data, 'outdated' when the old data is kept. */
export type FavoritesReadError = 'failed' | 'outdated';

/**
 * Error of the last toggle. 'write': SQLite did not change. 'refresh': the write succeeded, but
 * reading the list again failed, so the list on screen may be out of date.
 */
export type FavoriteActionError = { kind: 'write' | 'refresh'; action: FavoriteAction };

/**
 * Adds or removes one Pokémon from favorites, for the options sheet and the Detail heart (#5).
 *
 * A toggle is two steps, with no optimistic change:
 * 1. the SQLite write; if it fails, nothing changed;
 * 2. a real re-read of the list into the shared cache, awaited. If it fails, the old list stays
 *    and the query is in error on every screen; Try again re-reads, it never repeats the write.
 *
 * `canToggle` is true only while the list is loaded, up to date and nothing is running, so
 * Add/Remove is never decided from an unknown or outdated list. Taps while a toggle runs are ignored.
 * `reset()` (the sheet was closed) clears the error and drops the running toggle's `onDone`.
 */
export function useFavoriteToggle(pokemon: CatalogueEntry | null) {
  const queryClient = useQueryClient();
  const query = useQuery({
    ...favoritesQueryOptions,
    select: (favorites) => favorites.some((favorite) => favorite.id === pokemon?.id),
  });
  const write = useMutation({
    mutationFn: ({ entry, action }: { entry: CatalogueEntry; action: FavoriteAction }) =>
      action === 'add' ? addFavorite(entry) : removeFavorite(entry.id),
    networkMode: 'always',
  });
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<FavoriteActionError | null>(null);
  const runningRef = useRef(false);
  const currentRequest = useRef(0);

  useEffect(() => {
    const requests = currentRequest;
    return () => {
      requests.current += 1;
    };
  }, []);

  const isFavorite = pokemon === null ? undefined : query.data;
  const readError: FavoritesReadError | null = query.isError
    ? query.data === undefined
      ? 'failed'
      : 'outdated'
    : null;
  const canToggle = isFavorite !== undefined && readError === null && !query.isFetching && !running;

  async function toggle(onDone?: () => void) {
    if (pokemon === null || isFavorite === undefined || !canToggle || runningRef.current) return;
    runningRef.current = true;
    currentRequest.current += 1;
    const request = currentRequest.current;
    const isCurrent = () => request === currentRequest.current;
    const action: FavoriteAction = isFavorite ? 'remove' : 'add';
    setRunning(true);
    setError(null);

    let failed: FavoriteActionError | null = null;
    try {
      await write.mutateAsync({ entry: pokemon, action });
      try {
        await refreshFavorites(queryClient);
      } catch {
        failed = { kind: 'refresh', action };
      }
    } catch {
      failed = { kind: 'write', action };
    }

    runningRef.current = false;
    setRunning(false);
    if (!isCurrent()) return;
    setError(failed);
    if (failed === null) onDone?.();
  }

  /** Try again after a failed read or refresh: reads the list again, never repeats a write. */
  async function retryRead() {
    const result = await query.refetch();
    if (result.isSuccess) setError(null);
  }

  function reset() {
    currentRequest.current += 1;
    setError(null);
  }

  return {
    isFavorite,
    /** The first read, a re-read or a toggle is running. */
    busy: query.isPending || query.isFetching || running,
    readError,
    error,
    canToggle,
    toggle,
    retryRead,
    reset,
  };
}

/**
 * Reads the list from SQLite again after a write and waits for the result. A read that started
 * before the write is cancelled first, so it cannot count as the refresh. `staleTime: 0` makes
 * `query()` (the installed TanStack's replacement for the deprecated `fetchQuery`) always run
 * the query; it rejects when the read fails, and that error is also stored in the shared query,
 * so every screen sees the list as outdated.
 */
async function refreshFavorites(queryClient: QueryClient) {
  await queryClient.cancelQueries({ queryKey: favoritesQueryOptions.queryKey });
  await queryClient.query({ ...favoritesQueryOptions, staleTime: 0 });
}
