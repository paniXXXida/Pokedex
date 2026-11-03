import { QueryClient } from '@tanstack/react-query';

/** The app's only QueryClient. It is provided once in src/app/_layout.tsx. */
export const queryClient = new QueryClient();
