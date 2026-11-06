/** The `/pokemon` id zero-padded to at least 3 digits: 1 → "001", 1025 → "1025", 10033 → "10033". */
export function formatPokemonNumber(id: number): string {
  return String(id).padStart(3, '0');
}

/** API name for display: hyphens become spaces, each word capitalised ("mr-mime" → "Mr Mime"). */
export function formatPokemonName(apiName: string): string {
  return apiName
    .split('-')
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** API weight in hectograms → kilograms with a decimal point: 69 → "6.9 kg". */
export function formatWeight(hectograms: number): string {
  return `${hectograms / 10} kg`;
}

/** API height in decimetres → metres with a decimal point: 7 → "0.7 m". */
export function formatHeight(decimetres: number): string {
  return `${decimetres / 10} m`;
}

type ShareablePokemon = {
  id: number;
  name: string;
  types: string[];
  speciesName: string;
};

/**
 * Share text from specs/features/list.md. A form keeps its own name, but the link goes to its
 * species, because pokemon.com has no pages for forms:
 * "Venusaur Mega #10033 — Grass, Poison\nhttps://www.pokemon.com/us/pokedex/venusaur"
 */
export function buildShareMessage(pokemon: ShareablePokemon): string {
  const types = pokemon.types.map(formatPokemonName).join(', ');
  return (
    `${formatPokemonName(pokemon.name)} #${formatPokemonNumber(pokemon.id)} — ${types}\n` +
    `https://www.pokemon.com/us/pokedex/${pokemon.speciesName}`
  );
}
