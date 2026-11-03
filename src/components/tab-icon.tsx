import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import {
  type ColorValue,
  Image,
  type ImageSourcePropType,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import { Colors } from '@/constants/theme';

/** The design's tab icons sit in a 24 pt frame. */
const ICON_SIZE = 24;

type TabIconProps = {
  color: ColorValue;
  focused: boolean;
} & (
  | { image: ImageSourcePropType; symbol?: never }
  | { symbol: SymbolViewProps['name']; image?: never }
);

/**
 * Bottom tab icon: an image exported from Figma, or a system symbol where the design has no icon.
 * Images are single-colour with transparent cut-outs, so `tintColor` recolours them.
 * iOS: the icon in the tab's tint colour.
 * Android (Material 3, as in the design): the active icon is white on a Purple pill.
 */
export function TabIcon(props: TabIconProps) {
  const { color, focused } = props;
  const isAndroid = Platform.OS === 'android';
  const tint = isAndroid && focused ? Colors.white : color;

  const icon =
    props.image !== undefined ? (
      <View style={styles.frame}>
        <Image source={props.image} style={{ tintColor: tint }} />
      </View>
    ) : (
      <SymbolView name={props.symbol} size={ICON_SIZE} tintColor={tint} />
    );

  if (!isAndroid) return icon;

  return <View style={[styles.pill, focused && styles.pillActive]}>{icon}</View>;
}

const styles = StyleSheet.create({
  frame: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    width: 64,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: Colors.purple,
  },
});
