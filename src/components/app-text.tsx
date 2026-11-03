import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

export type AppTextProps = TextProps & {
  variant?: 'title' | 'body' | 'medium';
};

/** Text in Rubik and Midnight. Use this instead of `Text` so every screen gets the app font. */
export function AppText({ variant = 'body', style, ...rest }: AppTextProps) {
  return <Text style={[styles.base, styles[variant], style]} {...rest} />;
}

const styles = StyleSheet.create({
  base: {
    color: Colors.midnight,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 24,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 16,
  },
  medium: {
    fontFamily: Fonts.medium,
    fontSize: 16,
  },
});
