import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

import { Fonts } from '@/constants/theme';

const rubik = {
  [Fonts.regular]: require('@/assets/fonts/Rubik-Regular.ttf'),
  [Fonts.medium]: require('@/assets/fonts/Rubik-Medium.ttf'),
  [Fonts.semiBold]: require('@/assets/fonts/Rubik-SemiBold.ttf'),
  [Fonts.bold]: require('@/assets/fonts/Rubik-Bold.ttf'),
};

/** 'retrying' means a new attempt is running after an error. */
export type AppFontsStatus = 'loading' | 'ready' | 'error' | 'retrying';

/**
 * Loads Rubik with Expo Font. Unlike `useFonts`, it can try again after a failure,
 * so the app can show an error with a retry instead of staying on the splash.
 */
export function useAppFonts() {
  const [status, setStatus] = useState<AppFontsStatus>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    Font.loadAsync(rubik)
      .then(() => {
        if (active) setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  function retry() {
    setStatus('retrying');
    setAttempt((n) => n + 1);
  }

  return { status, retry };
}
