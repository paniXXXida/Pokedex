import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

type FontLoadErrorProps = {
  retrying: boolean;
  onRetry: () => void;
};

/** Shown when Rubik fails to load. Uses the system font, because Rubik is not available. */
export function FontLoadError({ retrying, onRetry }: FontLoadErrorProps) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>The app could not load its font.</Text>
      <Pressable
        accessibilityRole="button"
        disabled={retrying}
        onPress={onRetry}
        style={({ pressed }) => [styles.button, (pressed || retrying) && styles.buttonDimmed]}>
        <Text style={styles.buttonLabel}>{retrying ? 'Loading…' : 'Try again'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.gap,
    padding: Spacing.screen,
    backgroundColor: Colors.daylight,
  },
  title: {
    color: Colors.midnight,
    fontSize: 20,
    fontWeight: '700',
  },
  message: {
    color: Colors.midnight,
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: Spacing.screen,
    paddingVertical: 12,
    borderRadius: Radius.card,
    backgroundColor: Colors.purple,
  },
  buttonDimmed: {
    opacity: 0.6,
  },
  buttonLabel: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
