import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/app-text';
import { ScreenPlaceholder } from '@/components/screen-placeholder';
import { Colors } from '@/constants/theme';

export default function PokemonListScreen() {
  return (
    <ScreenPlaceholder title="All Pokémon" note="The catalogue comes in issue #2.">
      {/* Temporary links to test the Detail route until the grid exists (#2). */}
      <Link href={{ pathname: '/pokemon/[id]', params: { id: '1' } }} asChild>
        <Pressable>
          <AppText variant="medium" style={styles.link}>
            Open Pokémon #1
          </AppText>
        </Pressable>
      </Link>
      <Link href={{ pathname: '/pokemon/[id]', params: { id: 'abc' } }} asChild>
        <Pressable>
          <AppText variant="medium" style={styles.link}>
            Open an invalid id
          </AppText>
        </Pressable>
      </Link>
    </ScreenPlaceholder>
  );
}

const styles = StyleSheet.create({
  link: {
    color: Colors.purple,
  },
});
