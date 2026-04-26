import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { load, save } from '../utils/storage';

const ThemeContext = createContext(null);
const THEME_KEY = 'gomusic_theme';

// Derive full palette from accent + dark/light mode
export function buildPalette(accent, dark) {
  return {
    accent,
    bg:        dark ? '#0f0f0f' : '#f2f2f2',
    bg2:       dark ? '#1a1a1a' : '#e0e0e0',
    bg3:       dark ? '#252525' : '#d0d0d0',
    card:      dark ? '#1a1a1a' : '#ffffff',
    border:    dark ? '#2a2a2a' : '#cccccc',
    text:      dark ? '#ffffff' : '#111111',
    textSub:   dark ? '#888888' : '#555555',
    textMuted: dark ? '#555555' : '#999999',
    tabBar:    dark ? '#111111' : '#ffffff',
    tabBorder: dark ? '#222222' : '#dddddd',
    miniPlayer:dark ? '#1a1a2e' : '#e8e8f8',
    isDark: dark,
  };
}

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme(); // 'dark' | 'light'
  const [accentColor, setAccentColor] = useState('#1DB954');
  const [colorScheme, setColorScheme] = useState('system'); // 'dark' | 'light' | 'system'

  useEffect(() => {
    load(THEME_KEY, null).then(saved => {
      if (saved) {
        if (saved.accentColor) setAccentColor(saved.accentColor);
        if (saved.colorScheme) setColorScheme(saved.colorScheme);
      }
    });
  }, []);

  function setAccent(color) {
    setAccentColor(color);
    save(THEME_KEY, { accentColor: color, colorScheme });
  }

  function setScheme(scheme) {
    setColorScheme(scheme);
    save(THEME_KEY, { accentColor, colorScheme: scheme });
  }

  const isDark = colorScheme === 'system'
    ? systemScheme !== 'light'
    : colorScheme === 'dark';

  const palette = buildPalette(accentColor, isDark);

  return (
    <ThemeContext.Provider value={{ palette, accentColor, colorScheme, setAccent, setScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
