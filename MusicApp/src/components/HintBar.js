import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// ── Dismissable hint bar ──────────────────────────────────────────────────────
export function HintBar({ icon = 'information-circle', text, onDismiss }) {
  const { palette } = useTheme();
  return (
    <View style={[styles.hintBar, { backgroundColor: palette.accent + '18', borderColor: palette.accent + '44' }]}>
      <Ionicons name={icon} size={16} color={palette.accent} style={{ flexShrink: 0 }} />
      <Text style={[styles.hintText, { color: palette.text }]}>{text}</Text>
      <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close" size={16} color={palette.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

// ── Pulsing NEW badge ─────────────────────────────────────────────────────────
export function NewBadge() {
  const { palette } = useTheme();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.5, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,   duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.badgeWrap}>
      <Animated.View style={[styles.badgePulse, { backgroundColor: palette.accent, transform: [{ scale: pulse }] }]} />
      <View style={[styles.badgeDot, { backgroundColor: palette.accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  hintBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 6,
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1,
  },
  hintText: { flex: 1, fontSize: 13, lineHeight: 18 },

  badgeWrap: { position: 'absolute', top: -3, right: -3, width: 12, height: 12, alignItems: 'center', justifyContent: 'center' },
  badgePulse: { position: 'absolute', width: 12, height: 12, borderRadius: 6, opacity: 0.35 },
  badgeDot:   { width: 8, height: 8, borderRadius: 4 },
});
