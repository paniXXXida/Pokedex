import { router } from 'expo-router';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { CompareRows } from '@/components/compare-rows';
import { CompareSlot } from '@/components/compare-slot';
import { EmptyState } from '@/components/load-state';
import { gridCardWidth } from '@/components/pokemon-grid';
import { Colors, Spacing } from '@/constants/theme';
import { useCompareSelection, useCompareSide } from '@/hooks/use-compare-selection';
import { type CompareSlot as Slot, compareRows } from '@/utils/compare-stats';

export default function CompareScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const { left, right } = useCompareSelection();
  const leftSide = useCompareSide(left);
  const rightSide = useCompareSide(right);
  // Same width as a list card: two slots fill the content width like a grid row.
  const slotWidth = gridCardWidth(windowWidth);

  function openPicker(slot: Slot) {
    router.push({ pathname: '/compare-picker/[slot]', params: { slot } });
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title" style={styles.title}>
          Compare
        </AppText>
        <View style={styles.slots}>
          <CompareSlot
            entry={left}
            side={leftSide}
            width={slotWidth}
            position="left"
            onPress={() => openPicker('left')}
          />
          <CompareSlot
            entry={right}
            side={rightSide}
            width={slotWidth}
            position="right"
            onPress={() => openPicker('right')}
          />
        </View>
        {/* Rows only when both sides have their own stats; a loading or failed side shows its
            state below its slot instead. */}
        {leftSide.status === 'ready' && rightSide.status === 'ready' && (
          <CompareRows rows={compareRows(leftSide.pokemon.stats, rightSide.pokemon.stats)} />
        )}
        {(left === null || right === null) && <EmptyState title="Select two Pokémon to compare" />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.daylight,
  },
  // Assumption (compare.md, no design): the Favorites layout, 24 below the safe area.
  content: {
    padding: Spacing.screen,
  },
  // 16 between the title and the slots, as above the Home grid.
  title: {
    marginBottom: Spacing.gap,
  },
  // 24 between the slots and the rows or the hint.
  slots: {
    flexDirection: 'row',
    gap: Spacing.gap,
    marginBottom: Spacing.screen,
  },
});
