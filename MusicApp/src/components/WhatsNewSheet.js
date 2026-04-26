import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, Animated, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { save } from '../utils/storage';

export const WHATS_NEW_KEY = 'gomusic_whatsnew_v1';

const FEATURES = [
  { icon: 'color-palette',     color: '#E91E63', title: 'Theme Customization',      body: 'Pick any accent color from a full color wheel. Switch Dark, Light, or System mode.' },
  { icon: 'text',              color: '#2196F3', title: 'Karaoke Lyrics',            body: 'Paste LRC lyrics and watch them scroll in sync with your music.' },
  { icon: 'sparkles',          color: '#FF9800', title: 'Smart Playlists',           body: 'Auto-generated Deep Focus, High Energy, and Late Night playlists in Library → Smart.' },
  { icon: 'swap-horizontal',   color: '#9C27B0', title: 'Crossfade & Gapless',       body: 'Smooth 3-second crossfade between tracks for a professional listening experience.' },
  { icon: 'moon',              color: '#00BCD4', title: 'Sleep Timer',               body: 'Set a timer and music fades out automatically — perfect for falling asleep.' },
  { icon: 'people',            color: '#1DB954', title: 'Blend Playlists',           body: 'Merge your taste with a friend\'s to create a shared auto-playlist.' },
  { icon: 'stats-chart',       color: '#FF5722', title: 'Your Wrapped',              body: 'See your top tracks and artists with visual bar charts. Tap 📊 in Library.' },
  { icon: 'cloud-download',    color: '#607D8B', title: 'Auto-Download Top 50',      body: 'Your 50 most-played songs are cached locally so they always play instantly.' },
];

export default function WhatsNewSheet({ onDismiss }) {
  const { palette } = useTheme();
  const slideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 12 }).start();
  }, []);

  async function dismiss() {
    Animated.timing(slideAnim, { toValue: 600, duration: 250, useNativeDriver: true }).start(async () => {
      await save(WHATS_NEW_KEY, true);
      onDismiss();
    });
  }

  return (
    <Modal transparent animationType="none" statusBarTranslucent>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={dismiss} />
        <Animated.View
          style={[styles.sheet, { backgroundColor: palette.card, transform: [{ translateY: slideAnim }] }]}
        >
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: palette.border }]} />

          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: palette.text }]}>✨ What's New in Go-Music</Text>
            <TouchableOpacity onPress={dismiss}>
              <Ionicons name="close" size={22} color={palette.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {FEATURES.map((f, i) => (
              <View key={i} style={[styles.featureRow, { borderBottomColor: palette.border }]}>
                <View style={[styles.featureIcon, { backgroundColor: f.color + '22' }]}>
                  <Ionicons name={f.icon} size={22} color={f.color} />
                </View>
                <View style={styles.featureText}>
                  <Text style={[styles.featureTitle, { color: palette.text }]}>{f.title}</Text>
                  <Text style={[styles.featureBody, { color: palette.textSub }]}>{f.body}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={[styles.doneBtn, { backgroundColor: palette.accent }]} onPress={dismiss}>
            <Text style={styles.doneBtnText}>Got it!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingHorizontal: 20, paddingBottom: 32, maxHeight: '85%' },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '800' },
  list: { paddingBottom: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 14, borderBottomWidth: 1 },
  featureIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  featureBody: { fontSize: 13, lineHeight: 18 },
  doneBtn: { marginTop: 20, paddingVertical: 14, borderRadius: 28, alignItems: 'center' },
  doneBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
});
