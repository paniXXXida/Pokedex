import type { EvolutionNode } from '@/services/pokeapi';

/**
 * How a row is connected to its parent:
 * - 'none': the first row (the chain's root);
 * - 'straight': an only child, at its parent's indent, with a line between the two cards;
 * - 'branch': one of several children, indented one step, connected to the parent's vertical
 *   line. `first` starts that line below the parent's card, `last` ends it at this card.
 */
export type EvolutionConnector =
  | { kind: 'none' }
  | { kind: 'straight' }
  | { kind: 'branch'; first: boolean; last: boolean };

export type EvolutionRow = {
  speciesId: number;
  /** Indent steps from the left. */
  depth: number;
  connector: EvolutionConnector;
  /**
   * Indent steps of ancestors' vertical lines that pass through this whole row, because that
   * ancestor still has a later child below it (Wurmple's line passes Beautifly to reach Cascoon).
   */
  guides: number[];
};

/**
 * Flattens an evolution tree into rows, keeping every parent → child link. The order is
 * pre-order: a node's descendants come before its next sibling, so a branch (Silcoon →
 * Beautifly) stays together and is never merged with another one per stage.
 */
export function evolutionRows(root: EvolutionNode): EvolutionRow[] {
  const rows: EvolutionRow[] = [];

  /** `guides` are the lines through this row; `childGuides` the lines through its descendants. */
  function visit(
    node: EvolutionNode,
    depth: number,
    connector: EvolutionConnector,
    guides: number[],
    childGuides: number[],
  ) {
    rows.push({ speciesId: node.speciesId, depth, connector, guides });
    const { children } = node;

    if (children.length === 1) {
      visit(children[0], depth, { kind: 'straight' }, childGuides, childGuides);
      return;
    }
    children.forEach((child, index) => {
      const last = index === children.length - 1;
      // Until the last child, this node's line (at its own depth) runs past the child's subtree.
      const belowChild = last ? childGuides : [...childGuides, depth];
      visit(child, depth + 1, { kind: 'branch', first: index === 0, last }, childGuides, belowChild);
    });
  }

  visit(root, 0, { kind: 'none' }, [], []);
  return rows;
}
