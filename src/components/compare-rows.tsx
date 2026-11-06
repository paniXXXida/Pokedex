import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import type { CompareRow } from '@/utils/compare-stats';

/** Room for the "=" between both sides; also keeps the bars apart when there is none. */
const MIDDLE_WIDTH = 24;
/** Wide enough for a four-digit Total in Rubik 14, so the bars of every row line up. */
const VALUE_WIDTH = 36;

/**
 * The six stats and Total side by side (compare.md). Per row the higher value and its bar are
 * Purple and the value is bold; the lower side is plain with a Silver bar; equal values are both
 * plain with Silver bars and "=" between them. Bars grow from the centre outwards, on the same
 * 4 pt Grey track as Detail.
 */
export function CompareRows({ rows }: { rows: CompareRow[] }) {
  return (
    <View style={styles.list}>
      {rows.map((row) => (
        <View key={row.key} style={[styles.row, row.key === 'total' && styles.totalRow]}>
          <AppText style={styles.label}>{row.label}</AppText>
          <View style={styles.sides}>
            <Side value={row.left} fraction={row.leftFraction} higher={row.higher === 'left'} />
            <AppText style={[styles.text, styles.middle]}>{row.higher === null ? '=' : ''}</AppText>
            <Side
              value={row.right}
              fraction={row.rightFraction}
              higher={row.higher === 'right'}
              mirrored
            />
          </View>
        </View>
      ))}
    </View>
  );
}

type SideProps = {
  value: number;
  fraction: number;
  higher: boolean;
  /** The right side: bar first, value at the outer edge. */
  mirrored?: boolean;
};

function Side({ value, fraction, higher, mirrored = false }: SideProps) {
  return (
    <View style={[styles.side, mirrored && styles.sideMirrored]}>
      <AppText
        style={[
          styles.text,
          styles.value,
          mirrored ? styles.valueRight : styles.valueLeft,
          higher && styles.valueHigher,
        ]}>
        {value}
      </AppText>
      {/* The bar starts at the centre: right-aligned on the left side, left-aligned on the right. */}
      <View style={[styles.track, !mirrored && styles.trackFromRight]}>
        <View
          style={[
            styles.bar,
            { width: `${fraction * 100}%` },
            { backgroundColor: higher ? Colors.purple : Colors.silver },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Assumption (no design): 16 between rows, 7 between label and bars as in Detail.
  list: {
    gap: Spacing.gap,
  },
  row: {
    gap: 7,
  },
  totalRow: {
    paddingTop: Spacing.gap,
    borderTopWidth: 1,
    borderTopColor: Colors.silver,
  },
  // Detail's label style: Rubik SemiBold 14 / 125%, here centred above both sides.
  label: {
    textAlign: 'center',
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    lineHeight: 17.5,
  },
  sides: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    lineHeight: 17.5,
  },
  middle: {
    width: MIDDLE_WIDTH,
    textAlign: 'center',
  },
  side: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sideMirrored: {
    flexDirection: 'row-reverse',
  },
  value: {
    width: VALUE_WIDTH,
  },
  valueLeft: {
    textAlign: 'left',
  },
  valueRight: {
    textAlign: 'right',
  },
  valueHigher: {
    color: Colors.purple,
    fontFamily: Fonts.bold,
  },
  track: {
    flex: 1,
    height: 4,
    overflow: 'hidden',
    borderRadius: Radius.chip,
    backgroundColor: Colors.grey,
  },
  trackFromRight: {
    alignItems: 'flex-end',
  },
  bar: {
    height: 4,
    borderRadius: Radius.chip,
  },
});
