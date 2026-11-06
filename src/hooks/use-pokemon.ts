import { queryOptions, useQuery } from '@tanstack/react-query';

import { ApiError, fetchPokemon } from '@/services/pokeapi';

/** Default number of retries of TanStack Query for a failed request. */
const MAX_RETRIES = 3;

/**
 * The `/pokemon/{id}` query, one cache entry per id, shared by Share, Detail and Compare (#6),
 * so data loaded by one is reused by the others.
 * A 404 is not retried: the id does not exist, so Detail shows "Pokémon not found" at once.
 */
export function pokemonQueryOptions(id: number) {
  return queryOptions({
    queryKey: ['pokemon', id],
    queryFn: ({ signal }) => fetchPokemon(id, signal),
    retry: (failureCount, error) => !isNotFound(error) && failureCount < MAX_RETRIES,
  });
}

export function usePokemon(id: number) {
  return useQuery(pokemonQueryOptions(id));
}

/** PokeAPI answered that the resource does not exist. */
export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}
