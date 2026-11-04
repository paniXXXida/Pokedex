import { queryOptions } from '@tanstack/react-query';

import { fetchPokemon } from '@/services/pokeapi';

/**
 * The `/pokemon/{id}` query, one cache entry per id. Share uses it now; Detail (#5) and
 * Compare (#6) use the same options, so data loaded by one is reused by the others.
 */
export function pokemonQueryOptions(id: number) {
  return queryOptions({
    queryKey: ['pokemon', id],
    queryFn: ({ signal }) => fetchPokemon(id, signal),
  });
}
