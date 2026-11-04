import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Fonts, Radius } from '@/constants/theme';
import { useSharePokemon } from '@/hooks/use-share-pokemon';
import type { CatalogueEntry } from '@/services/pokeapi';

const isIos = Platform.OS === 'ios';

/** Figma: 24 × 24 icon frame, 20 padding before it and 20 gap after it, so labels start at X=64. */
const ICON_SIZE = 24;
const ROW_PADDING_HORIZONTAL = 20;
/** iOS (Figma): 12 side and group spacing; 8 below Cancel above the home indicator (844 − 802 − 34). */
const IOS_SHEET_INSET = 12;
const IOS_BOTTOM_SPACING = 8;

const iconColor = isIos ? Colors.iosAction : Colors.midnight;

type PokemonOptionsSheetProps = {
  /** The Pokémon of the last opened menu; kept while the sheet fades out. */
  pokemon: CatalogueEntry | null;
  visible: boolean;
  onClose: () => void;
  onOpenPokemon: (pokemon: CatalogueEntry) => void;
};

/**
 * The card options menu ("⋮"), shared by List, Search and Favorites.
 * iOS: grouped list plus Cancel, in the system font. Android: full-width white sheet without
 * Cancel, in Rubik Medium; the back button closes it. Tapping outside closes it on both.
 */
export function PokemonOptionsSheet({
  pokemon,
  visible,
  onClose,
  onOpenPokemon,
}: PokemonOptionsSheetProps) {
  const insets = useSafeAreaInsets();
  const { state: shareState, share, cancel } = useSharePokemon();

  function close() {
    cancel();
    onClose();
  }

  function openPokemon() {
    if (pokemon === null) return;
    close();
    onOpenPokemon(pokemon);
  }

  function sharePokemon() {
    if (pokemon !== null) share(pokemon.id, onClose);
  }

  const rows = (
    <>
      <SheetRow
        icon={
          <Image
            source={require('@/assets/images/open.png')}
            style={[styles.iconImage, { tintColor: iconColor }]}
          />
        }
        label="Open Pokémon"
        onPress={openPokemon}
      />
      {/* The favorites action is wired in issue #4. */}
      <SheetRow
        icon={
          <Image
            source={require('@/assets/images/tab-favorite.png')}
            style={{ tintColor: iconColor }}
          />
        }
        label="Add to favorites"
      />
      {shareState.status === 'error' && <SheetRow icon={null} label={shareState.message} />}
      <SheetRow
        icon={
          shareState.status === 'loading' ? (
            <ActivityIndicator color={iconColor} />
          ) : (
            <SymbolView
              name={{ ios: 'square.and.arrow.up', android: 'share' }}
              size={ICON_SIZE}
              tintColor={iconColor}
            />
          )
        }
        label={shareState.status === 'error' ? 'Try again' : 'Share'}
        busy={shareState.status === 'loading'}
        onPress={sharePokemon}
      />
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent
      navigationBarTranslucent>
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          onPress={close}
          style={[StyleSheet.absoluteFill, styles.backdrop]}
        />
        {isIos ? (
          <View style={[styles.iosSheet, { paddingBottom: insets.bottom + IOS_BOTTOM_SPACING }]}>
            <View style={styles.iosGroup}>{rows}</View>
            <Pressable
              accessibilityRole="button"
              onPress={close}
              style={({ pressed }) => [styles.iosCancel, pressed && styles.pressed]}>
              <Text style={styles.iosCancelLabel}>Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <View style={[styles.androidSheet, { paddingBottom: insets.bottom }]}>{rows}</View>
        )}
      </View>
    </Modal>
  );
}

type SheetRowProps = {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
  busy?: boolean;
};

function SheetRow({ icon, label, onPress, busy = false }: SheetRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy, disabled: busy }}
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.icon}>{icon}</View>
      <Text style={styles.rowLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    backgroundColor: Colors.backdrop,
  },
  // iOS (Figma): full width minus 12 per side; actions block, 12 gap, Cancel.
  iosSheet: {
    gap: IOS_SHEET_INSET,
    paddingHorizontal: IOS_SHEET_INSET,
  },
  // The 1 pt gaps between rows show the group background as separator lines.
  iosGroup: {
    gap: 1,
    overflow: 'hidden',
    borderRadius: Radius.sheet,
    backgroundColor: Colors.iosSheetSeparator,
  },
  iosCancel: {
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderRadius: Radius.sheet,
    backgroundColor: Colors.iosSheetCancel,
  },
  iosCancelLabel: {
    color: Colors.iosAction,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  androidSheet: {
    backgroundColor: Colors.white,
  },
  // iOS (Figma): 60 high, padding 20 × 18. Android uses the same row layout; its row height
  // and padding were not measured in Figma.
  row: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: ROW_PADDING_HORIZONTAL,
    paddingVertical: 18,
    backgroundColor: isIos ? Colors.iosSheetRow : Colors.white,
  },
  pressed: {
    opacity: 0.6,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Exported from Figma as the whole 24 × 24 frame, transparent margin included.
  iconImage: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  rowLabel: isIos
    ? { flex: 1, color: Colors.iosSheetLabel, fontSize: 18, lineHeight: 23.4 }
    : { flex: 1, color: Colors.midnight, fontFamily: Fonts.medium, fontSize: 16, lineHeight: 19.2 },
});
