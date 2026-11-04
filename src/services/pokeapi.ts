import { idFromResourceUrl } from '@/utils/pokemon-id';

const BASE_URL = 'https://pokeapi.co/api/v2';

/** One entry of the catalogue index: enough for a card, without a request per Pokémon. */
export type CatalogueEntry = {
  id: number;
  name: string;
};

/** The fields of `/pokemon/{id}` the app uses so far. Detail (#5) extends this type. */
export type Pokemon = {
  id: number;
  name: string;
  types: string[];
  speciesName: string;
};

/**
 * PokeAPI was reached but did not give usable data: an HTTP error status (`status` is set), or a
 * response with an unexpected shape. A network failure is not an ApiError: then `fetch` itself
 * rejects, before PokeAPI is reached.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Error text for a failed load: separates "PokeAPI answered wrongly" from "PokeAPI not reached". */
export function describeLoadError(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'Could not reach PokeAPI. Check your internet connection.';
}

async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new ApiError(`PokeAPI responded with an error (${response.status}).`, response.status);
  }
  try {
    return await response.json();
  } catch {
    throw new ApiError('PokeAPI sent a response that could not be read.');
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function unexpected(): never {
  throw new ApiError('PokeAPI sent data in an unexpected format.');
}

type IndexPage = {
  count: number;
  next: string | null;
  entries: CatalogueEntry[];
};

function parseIndexPage(json: unknown): IndexPage {
  if (
    !isRecord(json) ||
    typeof json.count !== 'number' ||
    !(json.next === null || typeof json.next === 'string') ||
    !Array.isArray(json.results)
  ) {
    return unexpected();
  }
  return { count: json.count, next: json.next, entries: json.results.map(parseIndexEntry) };
}

function parseIndexEntry(item: unknown): CatalogueEntry {
  if (!isRecord(item) || typeof item.name !== 'string' || typeof item.url !== 'string') {
    return unexpected();
  }
  const id = idFromResourceUrl(item.url);
  if (id === null) return unexpected();
  return { id, name: item.name };
}

/**
 * The complete catalogue index (specs/product.md → Catalogue index): read `count`, request that
 * many entries, and follow `next` until it is null. The result must match the last reported
 * `count` without duplicate ids; otherwise the whole load fails, so a partial index is never
 * shown as the full catalogue.
 */
export async function fetchCatalogueIndex(signal?: AbortSignal): Promise<CatalogueEntry[]> {
  const { count } = parseIndexPage(await fetchJson(`${BASE_URL}/pokemon?limit=1`, signal));
  let page = parseIndexPage(
    await fetchJson(`${BASE_URL}/pokemon?limit=${count}&offset=0`, signal),
  );
  const entries = [...page.entries];
  while (page.next !== null) {
    page = parseIndexPage(await fetchJson(page.next, signal));
    entries.push(...page.entries);
  }

  const uniqueIds = new Set(entries.map((entry) => entry.id));
  if (entries.length !== page.count || uniqueIds.size !== entries.length) {
    throw new ApiError('PokeAPI sent an incomplete catalogue.');
  }
  return entries;
}

export async function fetchPokemon(id: number, signal?: AbortSignal): Promise<Pokemon> {
  const json = await fetchJson(`${BASE_URL}/pokemon/${id}`, signal);
  if (
    !isRecord(json) ||
    typeof json.id !== 'number' ||
    typeof json.name !== 'string' ||
    !Array.isArray(json.types) ||
    !isRecord(json.species) ||
    typeof json.species.name !== 'string'
  ) {
    return unexpected();
  }
  return {
    id: json.id,
    name: json.name,
    types: json.types.map(parseTypeName),
    speciesName: json.species.name,
  };
}

function parseTypeName(slot: unknown): string {
  if (!isRecord(slot) || !isRecord(slot.type) || typeof slot.type.name !== 'string') {
    return unexpected();
  }
  return slot.type.name;
}

/** Card sprite, built from the id with the same pattern the API returns in `sprites.front_default`. */
export function spriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}
