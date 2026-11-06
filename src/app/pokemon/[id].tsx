import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { EvolutionTree } from '@/components/evolution-tree';
import { FavoriteButton } from '@/components/favorite-button';
import { EmptyState, ErrorState, LoadingState, RefreshError } from '@/components/load-state';
import { PokemonAbout } from '@/components/pokemon-about';
import { PokemonImage } from '@/components/pokemon-image';
import { PokemonStats } from '@/components/pokemon-stats';
import { TypeChip } from '@/components/type-chip';
import { Colors, Fonts, Shadow, Spacing } from '@/constants/theme';
import { type EvolutionCard, type EvolutionState, useEvolution } from '@/hooks/use-evolution';
import { useFavoriteToggle } from '@/hooks/use-favorites';
import { isNotFound, usePokemon } from '@/hooks/use-pokemon';
import { describeLoadError, type Pokemon } from '@/services/pokeapi';
import { favoriteMessage } from '@/utils/favorite-message';
import { formatPokemonName, formatPokemonNumber } from '@/utils/pokemon-format';
import { parsePokemonId } from '@/utils/pokemon-id';

const isIos = Platform.OS === 'ios';

/** Figma: 24 from the iOS navigation bar to the name, 16 below the Android header. */
const TOP_SPACING = isIos ? 24 : 16;
/** Figma: 200 × 200 artwork, overlapping the white sheet by 50. */
const ARTWORK_SIZE = 200;
const ARTWORK_OVERLAP = 50;

const TABS = ['About', 'Stats', 'Evolution'] as const;
type Tab = (typeof TABS)[number];

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pokemonId = parsePokemonId(id);

  if (pokemonId === null) return <PokemonNotFound />;
  return <PokemonDetail id={pokemonId} />;
}

function PokemonDetail({ id }: { id: number }) {
  const query = usePokemon(id);
  const pokemon = query.data;
  // Species and chain start loading as soon as the Pokémon is known, before Evolution is chosen.
  const evolution = useEvolution(pokemon);
  const favorite = useFavoriteToggle(pokemon ?? null);

  if (pokemon !== undefined) {
    return <PokemonContent pokemon={pokemon} evolution={evolution} favorite={favorite} />;
  }
  if (query.isError) {
    if (isNotFound(query.error)) return <PokemonNotFound />;
    return (
      <ErrorState
        title="Could not load this Pokémon"
        message={describeLoadError(query.error)}
        retrying={query.isFetching}
        onRetry={() => query.refetch()}
      />
    );
  }
  return <LoadingState />;
}

type PokemonContentProps = {
  pokemon: Pokemon;
  evolution: EvolutionState;
  favorite: ReturnType<typeof useFavoriteToggle>;
};

function PokemonContent({ pokemon, evolution, favorite }: PokemonContentProps) {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('About');
  // Android: the name moves into the header once the name row has scrolled out of view.
  const [nameBottom, setNameBottom] = useState(0);
  const [nameInHeader, setNameInHeader] = useState(false);

  const name = formatPokemonName(pokemon.name);
  const message = favoriteMessage(favorite);
  // iOS: the header floats over the content, so the content starts below it.
  const contentTop = isIos ? headerHeight : 0;

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const scrolledPast = event.nativeEvent.contentOffset.y > nameBottom;
    if (scrolledPast !== nameInHeader) setNameInHeader(scrolledPast);
  }

  function openEvolution(card: EvolutionCard) {
    // A node opens its species' default Pokémon; nothing happens when that one is already open.
    if (card.pokemon.id === pokemon.id) return;
    router.push({ pathname: '/pokemon/[id]', params: { id: String(card.pokemon.id) } });
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          // iOS (Figma scroll state): the header stays in place, Daylight at 50%, and the
          // content shows through it. Android: an opaque header with the name after scrolling.
          headerTransparent: isIos,
          headerStyle: { backgroundColor: isIos ? Colors.headerTranslucent : Colors.daylight },
          headerShadowVisible: !isIos && nameInHeader,
          headerTitleAlign: 'center',
          headerTitle:
            !isIos && nameInHeader
              ? () => <AppText style={styles.headerTitle}>{name}</AppText>
              : '',
          headerRight: () => (
            <FavoriteButton
              isFavorite={favorite.isFavorite}
              busy={favorite.busy}
              disabled={!favorite.canToggle}
              onPress={() => favorite.toggle()}
            />
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: contentTop + TOP_SPACING }]}
        scrollIndicatorInsets={{ top: contentTop }}
        onScroll={isIos ? undefined : onScroll}
        scrollEventThrottle={16}>
        <View
          style={styles.nameRow}
          onLayout={(event) => {
            const { y, height } = event.nativeEvent.layout;
            setNameBottom(y + height);
          }}>
          <AppText style={styles.name}>{name}</AppText>
          <AppText style={styles.number}>
            {isIos ? '#' : ''}
            {formatPokemonNumber(pokemon.id)}
          </AppText>
        </View>
        <View style={styles.chips}>
          {pokemon.types.map((type) => (
            <TypeChip key={type} type={type} />
          ))}
        </View>
        <View style={styles.artwork}>
          <PokemonImage uri={pokemon.artworkUrl} size={ARTWORK_SIZE} />
        </View>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.screen }]}>
          <DetailTabs value={tab} onChange={setTab} />
          <View style={styles.section}>
            {tab === 'About' && <PokemonAbout pokemon={pokemon} />}
            {tab === 'Stats' && <PokemonStats stats={pokemon.stats} />}
            {tab === 'Evolution' && (
              <EvolutionSection evolution={evolution} onOpen={openEvolution} />
            )}
          </View>
        </View>
      </ScrollView>
      {/* Favorite messages stay visible below the header on every tab. */}
      {message !== null && (
        <View style={[styles.messageStrip, { top: contentTop }]}>
          {favorite.readError !== null ? (
            <RefreshError
              message={message}
              retrying={favorite.busy}
              onRetry={favorite.retryRead}
              style={styles.refreshError}
            />
          ) : (
            <AppText style={styles.messageText}>{message}</AppText>
          )}
        </View>
      )}
    </View>
  );
}

type DetailTabsProps = {
  value: Tab;
  onChange: (tab: Tab) => void;
};

/** About / Stats / Evolution. Switching only changes local state: no new load for About or Stats. */
function DetailTabs({ value, onChange }: DetailTabsProps) {
  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {TABS.map((tab) => {
        const selected = tab === value;
        return (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(tab)}
            style={[styles.tab, selected ? styles.tabActive : styles.tabInactive]}>
            <AppText style={[styles.tabLabel, !selected && styles.tabLabelInactive]}>{tab}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

type EvolutionSectionProps = {
  evolution: EvolutionState;
  onOpen: (card: EvolutionCard) => void;
};

/** The Evolution tab's own states; About and Stats do not wait for them. */
function EvolutionSection({ evolution, onOpen }: EvolutionSectionProps) {
  if (evolution.status === 'loading') return <LoadingState />;
  if (evolution.status === 'error') {
    return (
      <ErrorState
        title="Could not load the evolution chain"
        message={evolution.message}
        retrying={evolution.retrying}
        onRetry={evolution.retry}
      />
    );
  }
  if (evolution.cards.length === 1) return <EmptyState title="This Pokémon does not evolve" />;
  return <EvolutionTree cards={evolution.cards} onOpen={onOpen} />;
}

/** An invalid id (`/pokemon/abc`) or one PokeAPI does not know (404). */
function PokemonNotFound() {
  return (
    <ErrorState
      title="Pokémon not found"
      message="This link does not point to a Pokémon."
      retrying={false}
      onRetry={goBack}
      actionLabel="Back"
    />
  );
}

/** Opened from a link with nothing to go back to: go to the catalogue instead. */
function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  // The white sheet grows to the bottom of the screen when a tab is short.
  content: {
    flexGrow: 1,
  },
  // Figma: name Rubik Bold 32 / 120% (replacing Cabinet Grotesk); number Regular 24 / 38 at
  // 30%, right-aligned in the same 38 high row.
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.gap,
    paddingHorizontal: Spacing.screen,
  },
  name: {
    flexShrink: 1,
    fontFamily: Fonts.bold,
    fontSize: 32,
    lineHeight: 38.4,
  },
  number: {
    marginLeft: 'auto',
    fontFamily: Fonts.regular,
    fontSize: 24,
    lineHeight: 38,
    opacity: 0.3,
  },
  // Figma: 12 below the name, 8 between chips, 24 above the artwork.
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: Spacing.screen,
  },
  artwork: {
    zIndex: 1,
    alignSelf: 'center',
    marginTop: Spacing.screen,
    marginBottom: -ARTWORK_OVERLAP,
  },
  // Figma: the tabs start 24 below the artwork's bottom edge.
  sheet: {
    flexGrow: 1,
    paddingTop: ARTWORK_OVERLAP + Spacing.screen,
    paddingHorizontal: Spacing.screen,
    backgroundColor: Colors.white,
  },
  // Figma: 24 between the tabs and the tab content.
  section: {
    marginTop: Spacing.screen,
  },
  // Figma: three equal tabs, padding T 5 / B 10, a 2 pt bottom line.
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 10,
    borderBottomWidth: 2,
  },
  tabActive: {
    borderBottomColor: Colors.purple,
  },
  tabInactive: {
    borderBottomColor: Colors.silver,
  },
  tabLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    lineHeight: 16.8,
  },
  tabLabelInactive: {
    opacity: 0.5,
  },
  // Figma (Android scroll state): the name centred in the header, 20 / 24, in Rubik Bold.
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    lineHeight: 24,
  },
  // Project decision (no design): a white strip with the card shadow below the header.
  messageStrip: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: Spacing.screen,
    backgroundColor: Colors.white,
    boxShadow: Shadow.card,
  },
  refreshError: {
    marginBottom: 0,
  },
  messageText: {
    textAlign: 'center',
  },
});
