import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { AppText } from '@/components/app-text';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type LoadingStateProps = {
  /** Shown above the indicator, for example the logo on Home's first catalogue load. */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Shown while data loads for the first time. */
export function LoadingState({ children, style }: LoadingStateProps) {
  return (
    <View style={[styles.container, style]}>
      {children}
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
  /** Button text when the way out is not a retry, for example "Back" for "Pokémon not found". */
  actionLabel?: string;
  /** For example to size it by its content instead of filling the space (a Compare slot). */
  style?: StyleProp<ViewStyle>;
};

/** A failed load with Try again. Same layout as the font error screen, in Rubik. */
export function ErrorState({
  title,
  message,
  retrying,
  onRetry,
  actionLabel = 'Try again',
  style,
}: ErrorStateProps) {
  return (
    <View style={[styles.container, style]}>
      <AppText variant="medium">{title}</AppText>
      <AppText style={styles.message}>{message}</AppText>
      <Pressable
        accessibilityRole="button"
        disabled={retrying}
        onPress={onRetry}
        style={({ pressed }) => [styles.button, (pressed || retrying) && styles.buttonDimmed]}>
        <AppText style={styles.buttonLabel}>{retrying ? 'Loading…' : actionLabel}</AppText>
      </Pressable>
    </View>
  );
}

type RefreshErrorProps = {
  message: string;
  retrying: boolean;
  onRetry: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * A failed refresh while the old data stays on screen: a compact message with Try again above
 * that data, instead of replacing it with the full `ErrorState`.
 */
export function RefreshError({ message, retrying, onRetry, style }: RefreshErrorProps) {
  return (
    <View style={[styles.refreshError, style]}>
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

type EmptyStateProps = {
  title: string;
  /** Optional hint below the title, for example how to add the first favorite. */
  message?: string;
};

/**
 * Loaded data without entries, for example a search without matches. Not an error, so no
 * Try again. It sits at the top of the list area, so an open keyboard does not cover it.
 */
export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View style={styles.empty}>
      <AppText variant="medium">{title}</AppText>
      {message !== undefined && <AppText style={styles.message}>{message}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  // Assumption (favorites.md): the empty hint and the refresh error are not measured in Figma;
  // 8 and 12 are agreed spacings until they are compared with the mockups.
  empty: {
    alignItems: 'center',
    gap: 8,
  },
  refreshError: {
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.gap,
  },
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
