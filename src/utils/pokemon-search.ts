import type { CatalogueEntry } from '@/services/pokeapi';

/**
 * Search form of a query or an API name (specs/features/search.md): lower case, hyphen and space
 * treated as equal, runs of whitespace collapsed, trimmed. "  Mr-Mime " → "mr mime".
 * Whitespace only or a lone "-" gives "", which means no search.
 */
export function normalizeSearchText(text: string): string {
  return text.toLowerCase().replace(/[\s-]+/g, ' ').trim();
}

/**
 * Entries whose name contains the already normalised query. An empty query returns the
 * catalogue itself, so clearing the search shows the full list again.
 */
export function filterByName(entries: CatalogueEntry[], normalizedQuery: string): CatalogueEntry[] {
  if (normalizedQuery === '') return entries;
  return entries.filter((entry) => normalizeSearchText(entry.name).includes(normalizedQuery));
}
