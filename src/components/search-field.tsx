import { useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  type TextInputInstance,
} from 'react-native';

import { Colors, Fonts, Radius, Shadow, Spacing } from '@/constants/theme';

const isAndroid = Platform.OS === 'android';

/** Figma: 24 × 24 icon frame, 12 padding above and below (field height 48), 12 before the text. */
const ICON_SIZE = 24;
const PADDING_VERTICAL = 12;
const ICON_GAP = 12;

type SearchFieldProps = {
  /** The query exactly as typed; the field never rewrites it. */
  value: string;
  onChangeText: (text: string) => void;
};

/**
 * The design's search field. iOS: always the magnifier.
 * Android: a back arrow replaces the magnifier while the field is focused or holds text;
 * tapping it clears the query, removes focus and closes the keyboard (search.md).
 */
export function SearchField({ value, onChangeText }: SearchFieldProps) {
  const inputRef = useRef<TextInputInstance>(null);
  const [isFocused, setIsFocused] = useState(false);
  const showBackArrow = isAndroid && (isFocused || value.length > 0);

  function exitSearch() {
    onChangeText('');
    // Blurring the input also closes the keyboard.
    inputRef.current?.blur();
  }

  return (
    // A tap on the magnifier or the free area focuses the input; focusing an already focused
    // input changes nothing. The Android arrow is its own Pressable, so it keeps its action.
    // `accessible={false}` keeps the input and the arrow reachable for screen readers.
    <Pressable accessible={false} onPress={() => inputRef.current?.focus()} style={styles.field}>
      {showBackArrow ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={PADDING_VERTICAL}
          onPress={exitSearch}>
          <Image
            source={require('@/assets/images/arrow-back.png')}
            style={[styles.icon, { tintColor: Colors.midnight }]}
          />
        </Pressable>
      ) : (
        <Image
          source={require('@/assets/images/search.png')}
          style={[styles.icon, { tintColor: isAndroid ? Colors.midnight : Colors.searchText }]}
        />
      )}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search for Pokémon.."
        placeholderTextColor={Colors.searchPlaceholder}
        accessibilityLabel="Search for Pokémon"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        style={styles.input}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Figma: white, radius 8, padding 16 / 12, 12 gap, card shadow (0/2, blur 15, #303773 15%).
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ICON_GAP,
    paddingHorizontal: Spacing.searchInset,
    paddingVertical: PADDING_VERTICAL,
    borderRadius: Radius.card,
    backgroundColor: Colors.white,
    boxShadow: Shadow.card,
  },
  // Exported from Figma as the whole 24 × 24 frame, transparent margin included.
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  // Rubik Regular 16 replaces Figma's Inter (product.md → Fonts); Figma line height is "Auto",
  // so no fixed line height. Android's default TextInput padding is removed.
  input: {
    flex: 1,
    padding: 0,
    color: Colors.searchText,
    fontFamily: Fonts.regular,
    fontSize: 16,
  },
});
