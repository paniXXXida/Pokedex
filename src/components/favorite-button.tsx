import { ActivityIndicator, Image, Platform, Pressable, StyleSheet } from 'react-native';

import { Colors } from '@/constants/theme';

/** Figma: the heart sits in a 24 × 24 frame. */
const ICON_SIZE = 24;
/** iOS (Figma): a 40 × 40 tap area around the icon. Android has no padding in the design. */
const IOS_PADDING = 8;

type FavoriteButtonProps = {
  /** undefined while the favorites list is not known. */
  isFavorite: boolean | undefined;
  busy: boolean;
  /** Add/Remove is not allowed now (list unknown or outdated); see `canToggle` in #4. */
  disabled: boolean;
  onPress: () => void;
};

/** The Detail header heart: outline or filled, icons exported from Figma (already coloured). */
export function FavoriteButton({ isFavorite, busy, disabled, onPress }: FavoriteButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      accessibilityState={{ busy, disabled: disabled || busy, selected: isFavorite === true }}
      disabled={disabled || busy}
      hitSlop={Platform.OS === 'ios' ? undefined : IOS_PADDING}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        (pressed || (disabled && !busy)) && styles.dimmed,
      ]}>
      {busy ? (
        <ActivityIndicator color={Colors.midnight} style={styles.icon} />
      ) : (
        <Image
          source={
            isFavorite
              ? require('@/assets/images/heart-filled.png')
              : require('@/assets/images/heart-empty.png')
          }
          style={styles.icon}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: Platform.OS === 'ios' ? IOS_PADDING : 0,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  dimmed: {
    opacity: 0.5,
  },
});
