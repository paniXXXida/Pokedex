import { queryOptions, skipToken, useQueries, useQuery } from '@tanstack/react-query';

import {
  type CatalogueEntry,
  describeLoadError,
  type EvolutionNode,
  fetchEvolutionChain,
  fetchSpecies,
  type Pokemon,
} from '@/services/pokeapi';
import { type EvolutionRow, evolutionRows } from '@/utils/evolution-rows';

/**
 * `/pokemon-species/{id}`, one cache entry per species id (not a Pokémon id). Species data does
 * not change while the app runs (`staleTime: Infinity`), so moving through a chain reuses it.
 * Without an id the query waits (`skipToken`).
 */
export function speciesQueryOptions(id: number | undefined) {
  return queryOptions({
    queryKey: ['pokemon-species', id],
    queryFn: id === undefined ? skipToken : ({ signal }) => fetchSpecies(id, signal),
    staleTime: Infinity,
  });
}

/** `/evolution-chain/{id}`, keyed by the chain id from the species' `evolution_chain` link. */
export function evolutionChainQueryOptions(id: number | undefined) {
  return queryOptions({
    queryKey: ['evolution-chain', id],
    queryFn: id === undefined ? skipToken : ({ signal }) => fetchEvolutionChain(id, signal),
    staleTime: Infinity,
  });
}

/** One card of the Evolution tab: a species, shown and opened as its default Pokémon. */
export type EvolutionCard = EvolutionRow & {
  pokemon: CatalogueEntry;
  /** This species is the one of the open Pokémon (for a form: its species). */
  current: boolean;
};

export type EvolutionState =
  | { status: 'loading' }
  | { status: 'error'; message: string; retrying: boolean; retry: () => void }
  | { status: 'success'; cards: EvolutionCard[] };

/**
 * The Evolution tab's data, through the resource links:
 * Pokémon → species (`speciesId`) → evolution chain → the species of every node, whose default
 * variety gives the card's number, sprite and the Pokémon id to open.
 *
 * Detail calls this as soon as the Pokémon is loaded, so the chain is ready before the tab is
 * chosen. The tab has its own loading and error state; About and Stats do not depend on it.
 * Try again refetches only the failed queries. Data already shown stays when a refetch fails.
 */
export function useEvolution(pokemon: Pokemon | undefined): EvolutionState {
  const species = useQuery(speciesQueryOptions(pokemon?.speciesId));
  const chainId = species.data?.evolutionChainId;
  const chain = useQuery(evolutionChainQueryOptions(chainId ?? undefined));

  // A species without a chain link is shown like a chain with only that species.
  let tree: EvolutionNode | undefined;
  if (pokemon !== undefined && chainId === null) {
    tree = { speciesId: pokemon.speciesId, children: [] };
  } else {
    tree = chain.data;
  }
  const rows = tree === undefined ? [] : evolutionRows(tree);
  const nodes = useQueries({ queries: rows.map((row) => speciesQueryOptions(row.speciesId)) });

  const queries = [species, ...(chainId === null ? [] : [chain]), ...nodes];
  const failed = queries.filter((query) => query.isError && query.data === undefined);

  // Cards only for nodes whose species is loaded; the tab is ready when every node has one.
  const cards: EvolutionCard[] = [];
  for (const [index, row] of rows.entries()) {
    const nodeSpecies = nodes[index].data;
    if (pokemon === undefined || nodeSpecies === undefined) break;
    cards.push({
      ...row,
      pokemon: nodeSpecies.defaultPokemon,
      current: row.speciesId === pokemon.speciesId,
    });
  }

  if (rows.length > 0 && cards.length === rows.length) {
    return { status: 'success', cards };
  }
  if (failed.length > 0) {
    return {
      status: 'error',
      message: describeLoadError(failed[0].error),
      retrying: queries.some((query) => query.isFetching),
      retry: () => {
        for (const query of failed) query.refetch();
      },
    };
  }
  return { status: 'loading' };
}
