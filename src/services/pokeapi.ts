import { idFromResourceUrl } from '@/utils/pokemon-id';
import type { PokemonStats, StatKey } from '@/utils/pokemon-stats';

const BASE_URL = 'https://pokeapi.co/api/v2';

/** One entry of the catalogue index: enough for a card, without a request per Pokémon. */
export type CatalogueEntry = {
  id: number;
  name: string;
};

/** The fields of `/pokemon/{id}` used by Share, Detail and Compare. */
export type Pokemon = {
  id: number;
  name: string;
  types: string[];
  speciesName: string;
  /** From the `species` link; not the same as `id` for forms (Mega Venusaur 10033 → species 3). */
  speciesId: number;
  /** Decimetres, as sent by the API. */
  height: number;
  /** Hectograms, as sent by the API. */
  weight: number;
  baseExperience: number | null;
  /** API names of all abilities, hidden ones included, in the API's order. */
  abilities: string[];
  stats: PokemonStats;
  artworkUrl: string | null;
};

/** The fields of `/pokemon-species/{id}` used for the evolution chain. */
export type PokemonSpecies = {
  id: number;
  /** From the `evolution_chain` link; null when the API has no chain for this species. */
  evolutionChainId: number | null;
  /** The variety marked `is_default`: its id is opened from an evolution node. */
  defaultPokemon: CatalogueEntry;
};

/** One species in an evolution chain, with the species it evolves into. */
export type EvolutionNode = {
  speciesId: number;
  children: EvolutionNode[];
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
    typeof json.species.name !== 'string' ||
    typeof json.species.url !== 'string' ||
    typeof json.height !== 'number' ||
    typeof json.weight !== 'number' ||
    !(json.base_experience === null || typeof json.base_experience === 'number') ||
    !Array.isArray(json.abilities)
  ) {
    return unexpected();
  }
  return {
    id: json.id,
    name: json.name,
    types: json.types.map(parseTypeName),
    speciesName: json.species.name,
    speciesId: idFromResourceUrl(json.species.url) ?? unexpected(),
    height: json.height,
    weight: json.weight,
    baseExperience: json.base_experience,
    abilities: json.abilities.map(parseAbilityName),
    stats: parseStats(json.stats),
    artworkUrl: parseArtworkUrl(json.sprites),
  };
}

function parseTypeName(slot: unknown): string {
  if (!isRecord(slot) || !isRecord(slot.type) || typeof slot.type.name !== 'string') {
    return unexpected();
  }
  return slot.type.name;
}

function parseAbilityName(slot: unknown): string {
  if (!isRecord(slot) || !isRecord(slot.ability) || typeof slot.ability.name !== 'string') {
    return unexpected();
  }
  return slot.ability.name;
}

/** All six base stats must be present; a missing one makes the whole response unusable. */
function parseStats(value: unknown): PokemonStats {
  if (!Array.isArray(value)) return unexpected();
  const found = new Map<string, number>();
  for (const item of value) {
    if (
      !isRecord(item) ||
      typeof item.base_stat !== 'number' ||
      !isRecord(item.stat) ||
      typeof item.stat.name !== 'string'
    ) {
      return unexpected();
    }
    found.set(item.stat.name, item.base_stat);
  }
  const stat = (key: StatKey) => found.get(key) ?? unexpected();
  return {
    hp: stat('hp'),
    attack: stat('attack'),
    defense: stat('defense'),
    'special-attack': stat('special-attack'),
    'special-defense': stat('special-defense'),
    speed: stat('speed'),
  };
}

/** `sprites.other["official-artwork"].front_default`; null when missing, so Detail shows a placeholder. */
function parseArtworkUrl(sprites: unknown): string | null {
  if (!isRecord(sprites) || !isRecord(sprites.other)) return null;
  const artwork = sprites.other['official-artwork'];
  if (!isRecord(artwork) || typeof artwork.front_default !== 'string') return null;
  return artwork.front_default;
}

export async function fetchSpecies(id: number, signal?: AbortSignal): Promise<PokemonSpecies> {
  const json = await fetchJson(`${BASE_URL}/pokemon-species/${id}`, signal);
  if (
    !isRecord(json) ||
    typeof json.id !== 'number' ||
    !(json.evolution_chain === null || isRecord(json.evolution_chain)) ||
    !Array.isArray(json.varieties)
  ) {
    return unexpected();
  }
  let evolutionChainId: number | null = null;
  if (json.evolution_chain !== null) {
    const url = json.evolution_chain.url;
    evolutionChainId = (typeof url === 'string' ? idFromResourceUrl(url) : null) ?? unexpected();
  }
  const defaultVariety = json.varieties.find(
    (variety) => isRecord(variety) && variety.is_default === true,
  );
  if (!isRecord(defaultVariety) || !isRecord(defaultVariety.pokemon)) return unexpected();
  return {
    id: json.id,
    evolutionChainId,
    defaultPokemon: parseIndexEntry(defaultVariety.pokemon),
  };
}

export async function fetchEvolutionChain(
  id: number,
  signal?: AbortSignal,
): Promise<EvolutionNode> {
  const json = await fetchJson(`${BASE_URL}/evolution-chain/${id}`, signal);
  if (!isRecord(json)) return unexpected();
  return parseEvolutionNode(json.chain);
}

/** One chain link: its species (id from the link) and, recursively, what it evolves into. */
function parseEvolutionNode(link: unknown): EvolutionNode {
  if (
    !isRecord(link) ||
    !isRecord(link.species) ||
    typeof link.species.url !== 'string' ||
    !Array.isArray(link.evolves_to)
  ) {
    return unexpected();
  }
  return {
    speciesId: idFromResourceUrl(link.species.url) ?? unexpected(),
    children: link.evolves_to.map(parseEvolutionNode),
  };
}

/** Card sprite, built from the id with the same pattern the API returns in `sprites.front_default`. */
export function spriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}
