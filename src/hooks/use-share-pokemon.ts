import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Share } from 'react-native';

import { pokemonQueryOptions } from '@/hooks/use-pokemon';
import { describeLoadError } from '@/services/pokeapi';
import { buildShareMessage } from '@/utils/pokemon-format';

export type ShareState = { status: 'idle' | 'loading' } | { status: 'error'; message: string };

/**
 * Shares a Pokémon through the system share sheet. The text needs types and the species name
 * from the cached `/pokemon/{id}` query: when it is cached, the share sheet opens at once;
 * otherwise the state is 'loading' until the details arrive.
 *
 * - Taps while a share is running are ignored, so the system sheet never opens twice.
 * - `cancel()` (the options menu was closed) drops the running share: details that arrive
 *   later no longer open the system sheet. Unmounting cancels too.
 */
export function useSharePokemon() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<ShareState>({ status: 'idle' });
  const running = useRef(false);
  const currentRequest = useRef(0);

  useEffect(() => {
    const requests = currentRequest;
    return () => {
      requests.current += 1;
    };
  }, []);

  async function share(id: number, onShared: () => void) {
    if (running.current) return;
    running.current = true;
    currentRequest.current += 1;
    const request = currentRequest.current;
    const isCurrent = () => request === currentRequest.current;

    const options = pokemonQueryOptions(id);
    if (queryClient.getQueryData(options.queryKey) === undefined) {
      setState({ status: 'loading' });
    }

    let message: string;
    try {
      message = buildShareMessage(await queryClient.ensureQueryData(options));
    } catch (error) {
      if (isCurrent()) {
        running.current = false;
        setState({ status: 'error', message: describeLoadError(error) });
      }
      return;
    }
    if (!isCurrent()) return;

    try {
      await Share.share({ message });
      if (!isCurrent()) return;
      setState({ status: 'idle' });
      onShared();
    } catch {
      if (isCurrent()) setState({ status: 'error', message: 'Could not open the share sheet.' });
    } finally {
      if (isCurrent()) running.current = false;
    }
  }

  function cancel() {
    currentRequest.current += 1;
    running.current = false;
    setState({ status: 'idle' });
  }

  return { state, share, cancel };
}
