/** Returns the Pokémon id from a route param, or null if it is not a positive whole number. */
export function parsePokemonId(param: string | string[] | undefined): number | null {
  if (typeof param !== 'string' || !/^[1-9]\d*$/.test(param)) return null;
  const id = Number(param);
  return Number.isSafeInteger(id) ? id : null;
}

/** Returns the id at the end of a PokeAPI resource url (".../pokemon/25/" → 25), or null. */
export function idFromResourceUrl(url: string): number | null {
  const match = /\/(\d+)\/?$/.exec(url);
  return match === null ? null : parsePokemonId(match[1]);
}
