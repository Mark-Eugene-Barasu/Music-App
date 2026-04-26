import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { StatsProvider } from './src/context/StatsContext';
import { PlayerProvider } from './src/context/PlayerContext';
import { PlaylistProvider } from './src/context/PlaylistContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { load } from './src/utils/storage';

import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import QueueScreen from './src/screens/QueueScreen';
import WrappedScreen from './src/screens/WrappedScreen';
import PlaylistScreen from './src/screens/PlaylistScreen';
import LyricsScreen from './src/screens/LyricsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnboardingScreen, { ONBOARDING_KEY } from './src/screens/OnboardingScreen';
import WhatsNewSheet, { WHATS_NEW_KEY } from './src/components/WhatsNewSheet';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  const { palette } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: palette.tabBar, borderTopColor: palette.tabBorder },
        tabBarActiveTintColor: palette.accent,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarIcon: ({ color, size }) => {
          const icons = { Home: 'home', Search: 'search', Library: 'library' };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { palette } = useTheme();
  return (
    <>
      <StatusBar style={palette.isDark ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Player" component={PlayerScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Queue" component={QueueScreen} />
        <Stack.Screen name="Wrapped" component={WrappedScreen} />
        <Stack.Screen name="Playlist" component={PlaylistScreen} />
        <Stack.Screen name="Lyrics" component={LyricsScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </>
  );
}

function AppWithOverlays() {
  const [ready, setReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  useEffect(() => {
    async function check() {
      const onboarded = await load(ONBOARDING_KEY, false);
      const seenWhatsNew = await load(WHATS_NEW_KEY, false);
      if (!onboarded) {
        setShowOnboarding(true);
      } else if (!seenWhatsNew) {
        setShowWhatsNew(true);
      }
      setReady(true);
    }
    check();
  }, []);

  if (!ready) return null;

  if (showOnboarding) {
    return (
      <OnboardingScreen onDone={() => {
        setShowOnboarding(false);
        setShowWhatsNew(true);
      }} />
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator />
      {showWhatsNew && <WhatsNewSheet onDismiss={() => setShowWhatsNew(false)} />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatsProvider>
          <PlaylistProvider>
            <PlayerProvider>
              <AppWithOverlays />
            </PlayerProvider>
          </PlaylistProvider>
        </StatsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
