import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { PokemonImage } from '@/components/pokemon-image';
import { Colors, Radius, Shadow } from '@/constants/theme';
import type { EvolutionCard } from '@/hooks/use-evolution';
import { spriteUrl } from '@/services/pokeapi';
import { formatPokemonName, formatPokemonNumber } from '@/utils/pokemon-format';

/** Figma "Pokecard" List variant: 80 high, with an 80 × 80 sprite zone on the left. */
const CARD_HEIGHT = 80;
/** Figma: 12 between a card and the connector. */
const LIST_GAP = 12;
/** Figma: the connector is 14 high on iOS and 20 on Android. */
const CONNECTOR_HEIGHT = Platform.OS === 'ios' ? 14 : 20;
/** Space above every card after the first: gap, connector, gap (38 on iOS, 44 on Android). */
const ZONE_HEIGHT = LIST_GAP + CONNECTOR_HEIGHT + LIST_GAP;
/** Figma: the line runs at x 40 of the card, the centre of the sprite zone. */
const LINE_X = 40;
/** Figma: the line is 2 wide, dash 4, gap 4. */
const LINE_WIDTH = 2;
const DASH = 4;
const DASH_GAP = 4;
/**
 * Project decision (the design has no branches): children of a parent with more than one
 * child are indented by 56, so a 16 long horizontal dash leads from the parent's line to them.
 */
const INDENT_STEP = 56;

type EvolutionTreeProps = {
  cards: EvolutionCard[];
  onOpen: (card: EvolutionCard) => void;
};

/**
 * The Evolution tab: one card per species, in the order of `evolutionRows`, with dashed lines
 * that keep every parent → child link visible (straight for an only child, a vertical line with
 * a horizontal dash per child for branches).
 */
export function EvolutionTree({ cards, onOpen }: EvolutionTreeProps) {
  return (
    <View>
      {cards.map((card, index) => (
        <EvolutionRow key={card.speciesId} card={card} first={index === 0} onOpen={onOpen} />
      ))}
    </View>
  );
}

type EvolutionRowProps = {
  card: EvolutionCard;
  first: boolean;
  onOpen: (card: EvolutionCard) => void;
};

function EvolutionRow({ card, first, onOpen }: EvolutionRowProps) {
  const zone = first ? 0 : ZONE_HEIGHT;
  const rowHeight = zone + CARD_HEIGHT;
  const cardMiddle = zone + CARD_HEIGHT / 2;
  const { connector } = card;
  const name = formatPokemonName(card.pokemon.name);

  return (
    <View style={{ paddingTop: zone }}>
      {/* Lines of ancestors that still have a later child below this row. */}
      {card.guides.map((depth) => (
        <DashedLine key={depth} vertical left={lineX(depth)} top={0} length={rowHeight} />
      ))}
      {connector.kind === 'straight' && (
        <DashedLine vertical left={lineX(card.depth)} top={LIST_GAP} length={CONNECTOR_HEIGHT} />
      )}
      {connector.kind === 'branch' && (
        <>
          {/* The parent's line: from below the parent (first child) down to this card's
              middle, or through the whole row when more children follow. */}
          <DashedLine
            vertical
            left={lineX(card.depth - 1)}
            top={connector.first ? LIST_GAP : 0}
            length={(connector.last ? cardMiddle : rowHeight) - (connector.first ? LIST_GAP : 0)}
          />
          <DashedLine
            vertical={false}
            left={lineX(card.depth - 1) + LINE_WIDTH}
            top={cardMiddle - LINE_WIDTH / 2}
            length={INDENT_STEP - LINE_X - LINE_WIDTH}
          />
        </>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={name}
        accessibilityState={{ selected: card.current }}
        onPress={() => onOpen(card)}
        style={({ pressed }) => [
          styles.card,
          { marginLeft: card.depth * INDENT_STEP },
          card.current && styles.current,
          pressed && styles.pressed,
        ]}>
        <View style={styles.spriteZone}>
          <PokemonImage uri={spriteUrl(card.pokemon.id)} size={CARD_HEIGHT} />
        </View>
        <View style={styles.info}>
          <View style={styles.badge}>
            <AppText variant="medium" style={styles.badgeText}>
              {formatPokemonNumber(card.pokemon.id)}
            </AppText>
          </View>
          <AppText variant="medium" numberOfLines={1}>
            {name}
          </AppText>
        </View>
      </Pressable>
    </View>
  );
}

/** The x of the vertical line for a card at `depth` indent steps (centred on the 2 pt stroke). */
function lineX(depth: number): number {
  return depth * INDENT_STEP + LINE_X - LINE_WIDTH / 2;
}

type DashedLineProps = {
  vertical: boolean;
  left: number;
  top: number;
  length: number;
};

/**
 * A dashed line of separate 2 × 4 dashes, clipped to `length`. Dashed borders on one side only
 * are unreliable on Android, so the dashes are drawn as views.
 */
function DashedLine({ vertical, left, top, length }: DashedLineProps) {
  if (length <= 0) return null;
  const count = Math.ceil(length / (DASH + DASH_GAP));
  const size = vertical
    ? { width: LINE_WIDTH, height: length }
    : { width: length, height: LINE_WIDTH };

  return (
    <View
      pointerEvents="none"
      style={[styles.line, { left, top }, size, !vertical && styles.lineHorizontal]}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={vertical ? styles.dashVertical : styles.dashHorizontal} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Figma: Midnight at 30%.
  line: {
    position: 'absolute',
    overflow: 'hidden',
    gap: DASH_GAP,
    opacity: 0.3,
  },
  lineHorizontal: {
    flexDirection: 'row',
  },
  dashVertical: {
    width: LINE_WIDTH,
    height: DASH,
    backgroundColor: Colors.midnight,
  },
  dashHorizontal: {
    width: DASH,
    height: LINE_WIDTH,
    backgroundColor: Colors.midnight,
  },
  // Figma: white, radius 8, the card shadow (the design's "Soft shadow" values are not readable).
  card: {
    height: CARD_HEIGHT,
    flexDirection: 'row',
    borderRadius: Radius.card,
    backgroundColor: Colors.white,
    boxShadow: Shadow.card,
  },
  // Project decision: the design has no selected card; the open Pokémon's species gets a
  // Purple 2 pt outline, which does not change the card's size.
  current: {
    outlineColor: Colors.purple,
    outlineStyle: 'solid',
    outlineWidth: 2,
  },
  pressed: {
    opacity: 0.6,
  },
  spriteZone: {
    width: CARD_HEIGHT,
    overflow: 'hidden',
    borderTopLeftRadius: Radius.card,
    borderBottomLeftRadius: Radius.card,
    backgroundColor: Colors.cardImageBackground,
  },
  // Figma: padding 12, gap 8, vertically centred.
  info: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
  },
  // Same badge as the list card: padding 6 left/right, 4 top, 2 bottom.
  badge: {
    paddingHorizontal: 6,
    paddingTop: 4,
    paddingBottom: 2,
    borderRadius: Radius.badge,
    backgroundColor: Colors.purple,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    lineHeight: 12,
  },
});
