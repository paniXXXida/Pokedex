import { useMemo, useRef, useState } from 'react';
import type { FlatList } from 'react-native';

import { useCatalogue } from '@/hooks/use-catalogue';
import type { CatalogueEntry } from '@/services/pokeapi';
import { filterByName, normalizeSearchText } from '@/utils/pokemon-search';

/**
 * Search over the complete catalogue index, shared by the List screen and the Compare picker.
 * `results` is undefined until the index is loaded; `catalogue` gives its loading and error state.
 */
export function useCatalogueSearch() {
  const catalogue = useCatalogue();
  const gridRef = useRef<FlatList<CatalogueEntry>>(null);
  // The query exactly as typed; only its normalised form is used for searching.
  const [rawQuery, setRawQuery] = useState('');
  const searchText = normalizeSearchText(rawQuery);

  // Filtered on the phone from the complete index: no API request per keystroke.
  const results = useMemo(
    () => (catalogue.data === undefined ? undefined : filterByName(catalogue.data, searchText)),
    [catalogue.data, searchText],
  );

  function changeQuery(text: string) {
    // New results start at the top, also after scrolling deep into the full list.
    if (normalizeSearchText(text) !== searchText) {
      gridRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
    setRawQuery(text);
  }

  return { catalogue, gridRef, rawQuery, changeQuery, isSearching: searchText !== '', results };
}
