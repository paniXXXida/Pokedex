import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { type CatalogueEntry, spriteUrl } from '@/services/pokeapi';
import { formatPokemonName, formatPokemonNumber } from '@/utils/pokemon-format';

/** Figma card footer: 48 high with 12 padding on every side, so every card has the same height. */
export const CARD_FOOTER_HEIGHT = 48;
const FOOTER_PADDING = 12;
const MENU_ICON_SIZE = 24;

type PokemonCardProps = {
  pokemon: CatalogueEntry;
  /** The image area is square, so the card is `width` + footer high. */
  width: number;
  onPress: (pokemon: CatalogueEntry) => void;
  /** Without it the card has no "⋮" (Compare picker and slots); the footer keeps its height. */
  onOptionsPress?: (pokemon: CatalogueEntry) => void;
};

export function PokemonCard({ pokemon, width, onPress, onOptionsPress }: PokemonCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const name = formatPokemonName(pokemon.name);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={() => onPress(pokemon)}
      style={[styles.card, { width }]}>
      <View style={[styles.imageArea, { height: width }]}>
        {imageFailed ? (
          // Agreed placeholder for a missing sprite: a neutral "?" (not in Figma).
          <View style={styles.placeholder}>
            <AppText variant="title" style={styles.placeholderText}>
              ?
            </AppText>
          </View>
        ) : (
          // Figma: the image fills the 163 × 163 layer; the sprite has its own transparent margin.
          <Image
            source={spriteUrl(pokemon.id)}
            style={styles.image}
            contentFit="cover"
            onError={() => setImageFailed(true)}
          />
        )}
        <View style={styles.badge}>
          <AppText variant="medium" style={styles.badgeText}>
            {formatPokemonNumber(pokemon.id)}
          </AppText>
        </View>
      </View>
      <View style={styles.footer}>
        <AppText variant="medium" numberOfLines={1} style={styles.name}>
          {name}
        </AppText>
        {onOptionsPress !== undefined && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Options for ${name}`}
            hitSlop={FOOTER_PADDING}
            onPress={() => onOptionsPress(pokemon)}
            style={styles.menuIcon}>
            <View style={[styles.menuDot, styles.menuDotTop]} />
            <View style={[styles.menuDot, styles.menuDotMiddle]} />
            <View style={[styles.menuDot, styles.menuDotBottom]} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card,
    backgroundColor: Colors.white,
    boxShadow: Shadow.card,
  },
  imageArea: {
    overflow: 'hidden',
    borderTopLeftRadius: Radius.card,
    borderTopRightRadius: Radius.card,
    backgroundColor: Colors.cardImageBackground,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Size and colour to be checked on the phone.
  placeholderText: {
    color: Colors.silver,
    fontSize: 48,
    lineHeight: 57.6,
  },
  // Figma: at (8, 8), padding 6 left/right, 4 top, 2 bottom; width follows the number.
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
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
  footer: {
    height: CARD_FOOTER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    padding: FOOTER_PADDING,
  },
  name: {
    flex: 1,
  },
  // Figma "⋮": a 24 × 24 frame; the top dot is 3 × 3 at (17, 4.5). The middle and bottom dots
  // are placed symmetrically below it.
  menuIcon: {
    width: MENU_ICON_SIZE,
    height: MENU_ICON_SIZE,
  },
  menuDot: {
    position: 'absolute',
    left: 17,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.midnight,
  },
  menuDotTop: {
    top: 4.5,
  },
  menuDotMiddle: {
    top: 10.5,
  },
  menuDotBottom: {
    top: 16.5,
  },
});
