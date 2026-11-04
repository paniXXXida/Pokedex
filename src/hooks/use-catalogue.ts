import { useQuery } from '@tanstack/react-query';

import { fetchCatalogueIndex } from '@/services/pokeapi';

/**
 * The complete catalogue index under one query key, shared by List and Search (#3).
 * It is loaded once per app run (`staleTime: Infinity`): the catalogue barely changes, and a
 * second screen using it must not download it again. Try again calls `refetch()`.
 */
export function useCatalogue() {
  return useQuery({
    queryKey: ['catalogue'],
    queryFn: ({ signal }) => fetchCatalogueIndex(signal),
    staleTime: Infinity,
  });
}
