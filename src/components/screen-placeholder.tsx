import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Colors, Spacing } from '@/constants/theme';

type ScreenPlaceholderProps = {
  title: string;
  note: string;
  children?: ReactNode;
};

/** Temporary screen content until each feature issue builds the real screen. */
export function ScreenPlaceholder({ title, note, children }: ScreenPlaceholderProps) {
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AppText variant="title">{title}</AppText>
      <AppText>{note}</AppText>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: Spacing.gap,
    padding: Spacing.screen,
    backgroundColor: Colors.daylight,
  },
});
