import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Dimensions, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { save } from '../utils/storage';

const { width, height } = Dimensions.get('window');

export const ONBOARDING_KEY = 'gomusic_onboarded_v1';

const SLIDES = [
  {
    icon: 'musical-notes',
    color: '#1DB954',
    title: 'Welcome to Go-Music',
    body: 'Your music, your way. Play every audio file on your device with a beautiful, fast player.',
  },
  {
    icon: 'color-palette',
    color: '#E91E63',
    title: 'Make It Yours',
    body: 'Tap the ⚙️ icon on the home screen to change the accent color from a full color wheel and switch between Dark, Light, or System mode.',
  },
  {
    icon: 'list',
    color: '#2196F3',
    title: 'Queue & Playlists',
    body: 'Long-press any song to add it to the queue, play it next, or save it to a playlist. Find smart auto-generated playlists in the Library → Smart tab.',
  },
  {
    icon: 'sparkles',
    color: '#FF9800',
    title: 'Smart Features',
    body: 'Karaoke lyrics, crossfade, sleep timer, fuzzy search, audio normalization, and your personal Wrapped stats — all built in.',
  },
];

export default function OnboardingScreen({ onDone }) {
  const { palette } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  function next() {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      finish();
    }
  }

  async function finish() {
    await save(ONBOARDING_KEY, true);
    onDone();
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]}>
      {/* Skip */}
      <TouchableOpacity style={styles.skip} onPress={finish}>
        <Text style={[styles.skipText, { color: palette.textMuted }]}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <Animated.FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={e => setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={[styles.iconCircle, { backgroundColor: item.color + '22' }]}>
              <Ionicons name={item.icon} size={72} color={item.color} />
            </View>
            <Text style={[styles.slideTitle, { color: palette.text }]}>{item.title}</Text>
            <Text style={[styles.slideBody, { color: palette.textSub }]}>{item.body}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp' });
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });
          return (
            <Animated.View
              key={i}
              style={[styles.dot, { width: dotWidth, opacity, backgroundColor: palette.accent }]}
            />
          );
        })}
      </View>

      {/* Next / Get Started */}
      <TouchableOpacity style={[styles.nextBtn, { backgroundColor: palette.accent }]} onPress={next}>
        <Text style={styles.nextText}>
          {activeIndex === SLIDES.length - 1 ? "Let's Go 🎵" : 'Next'}
        </Text>
        {activeIndex < SLIDES.length - 1 && (
          <Ionicons name="arrow-forward" size={18} color="#000" style={{ marginLeft: 6 }} />
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skip: { alignSelf: 'flex-end', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  skipText: { fontSize: 14 },
  slide: { width, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 24 },
  iconCircle: { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center' },
  slideTitle: { fontSize: 26, fontWeight: '800', textAlign: 'center', lineHeight: 34 },
  slideBody: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 24 },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 32, marginBottom: 32, paddingVertical: 16, borderRadius: 32 },
  nextText: { color: '#000', fontWeight: '800', fontSize: 16 },
});
