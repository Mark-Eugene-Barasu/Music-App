import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { PlayerProvider } from './src/context/PlayerContext';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import PlayerScreen from './src/screens/PlayerScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#111', borderTopColor: '#222' },
        tabBarActiveTintColor: '#1DB954',
        tabBarInactiveTintColor: '#666',
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

export default function App() {
  return (
    <SafeAreaProvider>
      <PlayerProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen
              name="Player"
              component={PlayerScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PlayerProvider>
    </SafeAreaProvider>
  );
}
