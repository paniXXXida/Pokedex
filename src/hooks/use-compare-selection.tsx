import { createContext, type ReactNode, useContext, useState } from 'react';

import { usePokemon } from '@/hooks/use-pokemon';
import { type CatalogueEntry, describeLoadError, type Pokemon } from '@/services/pokeapi';
import type { CompareSlot } from '@/utils/compare-stats';

type CompareSelection = Record<CompareSlot, CatalogueEntry | null>;

type CompareSelectionValue = CompareSelection & {
  /** Puts a Pokémon in one slot; the other slot stays as it is. */
  select: (slot: CompareSlot, entry: CatalogueEntry) => void;
};

const CompareSelectionContext = createContext<CompareSelectionValue | null>(null);

/**
 * The two Compare slots, kept in memory above the root Stack, so the Compare tab and the picker
 * screen share them. They stay while switching tabs and are empty after a full restart
 * (compare.md: comparisons are not saved). Each slot keeps `{ id, name }` from the catalogue,
 * so its card shows at once; the stats come from the shared `/pokemon/{id}` query.
 */
export function CompareSelectionProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<CompareSelection>({ left: null, right: null });

  function select(slot: CompareSlot, entry: CatalogueEntry) {
    setSelection((current) => ({ ...current, [slot]: entry }));
  }

  return (
    <CompareSelectionContext.Provider value={{ ...selection, select }}>
      {children}
    </CompareSelectionContext.Provider>
  );
}

export function useCompareSelection(): CompareSelectionValue {
  const value = useContext(CompareSelectionContext);
  if (value === null) {
    throw new Error('useCompareSelection is used outside CompareSelectionProvider.');
  }
  return value;
}

export type CompareSide =
  | { status: 'empty' }
  | { status: 'loading' }
  | { status: 'error'; message: string; retrying: boolean; retry: () => void }
  | { status: 'ready'; pokemon: Pokemon };

/**
 * The stats of one slot through the shared `['pokemon', id]` query (also used by Detail and
 * Share), so the same Pokémon in both slots is one cache entry. Each side has its own query:
 * Try again refetches only this side, and a failure here never touches the other one.
 * A new Pokémon in the slot is a new query key without placeholder data, so the slot is
 * 'loading' until its own stats arrive; the previous Pokémon's stats are never shown for it.
 */
export function useCompareSide(entry: CatalogueEntry | null): CompareSide {
  const query = usePokemon(entry?.id);

  if (entry === null) return { status: 'empty' };
  // Data already loaded stays visible when a background refresh fails, as in Detail.
  if (query.data !== undefined) return { status: 'ready', pokemon: query.data };
  if (query.isError) {
    return {
      status: 'error',
      message: describeLoadError(query.error),
      retrying: query.isFetching,
      retry: () => {
        query.refetch();
      },
    };
  }
  return { status: 'loading' };
}
