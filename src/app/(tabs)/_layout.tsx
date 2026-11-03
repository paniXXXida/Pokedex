import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabIcon } from '@/components/tab-icon';
import { Colors } from '@/constants/theme';

const isAndroid = Platform.OS === 'android';

/** Android navigation bar height in the design, without the system gesture area. */
const ANDROID_TAB_BAR_HEIGHT = 80;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: styles.scene,
        tabBarActiveTintColor: isAndroid ? Colors.midnight : Colors.purple,
        tabBarInactiveTintColor: isAndroid ? Colors.androidTabInactive : Colors.midnight,
        tabBarLabelStyle: isAndroid ? styles.labelAndroid : styles.labelIos,
        tabBarStyle: [
          styles.tabBar,
          // A custom height replaces the default one, so the bottom inset is added here.
          isAndroid && { height: ANDROID_TAB_BAR_HEIGHT + insets.bottom },
        ],
        tabBarIconStyle: isAndroid ? styles.iconAndroid : undefined,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pokémons',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              image={require('@/assets/images/tab-pokemon.png')}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              image={require('@/assets/images/tab-favorite.png')}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      {/* Compare has no icon in the design: system "opposite arrows" symbol (product.md → Navigation). */}
      <Tabs.Screen
        name="compare"
        options={{
          title: 'Compare',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              symbol={{ ios: 'arrow.left.arrow.right', android: 'compare_arrows' }}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scene: {
    backgroundColor: Colors.daylight,
  },
  tabBar: {
    backgroundColor: Colors.daylight,
    borderTopWidth: 0,
    elevation: 0,
  },
  labelIos: {
    fontSize: 10,
    fontWeight: '600',
  },
  labelAndroid: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  iconAndroid: {
    width: 64,
    height: 32,
  },
});
