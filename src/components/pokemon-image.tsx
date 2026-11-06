import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Colors } from '@/constants/theme';

type PokemonImageProps = {
  /** null when the API has no image, for example a form without official artwork. */
  uri: string | null;
  /** Width and height of the square image. */
  size: number;
};

/**
 * A square Pokémon image (Detail artwork, evolution sprite) with the agreed "?" placeholder when
 * there is no URL or the image fails to load. The list card has the same placeholder of its own.
 */
export function PokemonImage({ uri, size }: PokemonImageProps) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const style = { width: size, height: size };

  if (uri === null || uri === failedUri) {
    return (
      <View style={[style, styles.placeholder]}>
        <AppText variant="title" style={styles.placeholderText}>
          ?
        </AppText>
      </View>
    );
  }
  return (
    <Image
      source={uri}
      style={style}
      contentFit="contain"
      accessibilityIgnoresInvertColors
      onError={() => setFailedUri(uri)}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Same size and colour as the list card's placeholder.
  placeholderText: {
    color: Colors.silver,
    fontSize: 48,
    lineHeight: 57.6,
  },
});
