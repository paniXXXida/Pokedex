import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { FontLoadError } from '@/components/font-load-error';
import { Colors } from '@/constants/theme';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { CompareSelectionProvider } from '@/hooks/use-compare-selection';
import { queryClient } from '@/services/query-client';

// Keep the splash visible until the fonts are loaded, so text never flashes in another font.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { status, retry } = useAppFonts();

  useEffect(() => {
    if (status !== 'loading') SplashScreen.hide();
  }, [status]);

  if (status === 'loading') return null;
  if (status === 'error' || status === 'retrying') {
    return <FontLoadError retrying={status === 'retrying'} onRetry={retry} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <CompareSelectionProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: Colors.daylight },
            headerStyle: { backgroundColor: Colors.daylight },
            headerShadowVisible: false,
            headerTintColor: Colors.midnight,
            // iOS back label from the design; Android shows only the arrow.
            headerBackTitle: 'Vorige',
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="pokemon/[id]" options={{ title: '' }} />
          <Stack.Screen name="compare-picker/[slot]" options={{ title: '' }} />
        </Stack>
      </CompareSelectionProvider>
    </QueryClientProvider>
  );
}
