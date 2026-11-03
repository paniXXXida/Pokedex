/** Returns the Pokémon id from a route param, or null if it is not a positive whole number. */
export function parsePokemonId(param: string | string[] | undefined): number | null {
  if (typeof param !== 'string' || !/^[1-9]\d*$/.test(param)) return null;
  const id = Number(param);
  return Number.isSafeInteger(id) ? id : null;
}
