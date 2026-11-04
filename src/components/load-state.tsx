import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

/** Shown while data loads for the first time. */
export function LoadingState() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.purple} accessibilityLabel="Loading" />
    </View>
  );
}

type ErrorStateProps = {
  title: string;
  message: string;
  /** True while Try again is loading: the button is disabled to avoid repeated requests. */
  retrying: boolean;
  onRetry: () => void;
};

/** A failed load with Try again. Same layout as the font error screen, in Rubik. */
export function ErrorState({ title, message, retrying, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <AppText variant="medium">{title}</AppText>
      <AppText style={styles.message}>{message}</AppText>
      <Pressable
        accessibilityRole="button"
        disabled={retrying}
        onPress={onRetry}
        style={({ pressed }) => [styles.button, (pressed || retrying) && styles.buttonDimmed]}>
        <AppText style={styles.buttonLabel}>{retrying ? 'Loading…' : 'Try again'}</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.gap,
  },
  message: {
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
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
});
