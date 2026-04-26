import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  PanResponder, Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const WHEEL_SIZE = Dimensions.get('window').width - 80;
const RADIUS = WHEEL_SIZE / 2;

// HSV → RGB → hex
function hsvToHex(h, s, v) {
  const f = (n) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  const r = Math.round(f(5) * 255);
  const g = Math.round(f(3) * 255);
  const b = Math.round(f(1) * 255);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// hex → HSV
function hexToHsv(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = ((h * 60) + 360) % 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

// Polar coords from wheel touch
function touchToHueSat(x, y) {
  const dx = x - RADIUS, dy = y - RADIUS;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const sat = Math.min(dist / RADIUS, 1);
  const hue = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
  return { hue, sat };
}

// HSV → wheel position
function hueSatToXY(h, s) {
  const angle = (h * Math.PI) / 180;
  return {
    x: RADIUS + s * RADIUS * Math.cos(angle),
    y: RADIUS + s * RADIUS * Math.sin(angle),
  };
}

// Build wheel gradient as concentric colored rings (SVG-like using Views)
function ColorWheel({ hue, sat, onChangeHS }) {
  const wheelRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      const { hue: h, sat: s } = touchToHueSat(locationX, locationY);
      onChangeHS(h, s);
    },
    onPanResponderMove: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      const { hue: h, sat: s } = touchToHueSat(locationX, locationY);
      onChangeHS(h, s);
    },
  })).current;

  const cursor = hueSatToXY(hue, sat);

  // Render wheel as stacked hue segments using border trick
  const segments = 36;
  const segAngle = 360 / segments;

  return (
    <View style={[styles.wheelContainer, { width: WHEEL_SIZE, height: WHEEL_SIZE }]}>
      {/* Hue ring rendered as colored segments */}
      {Array.from({ length: segments }).map((_, i) => {
        const angle = i * segAngle;
        const color = hsvToHex(angle, 1, 1);
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: WHEEL_SIZE,
              height: WHEEL_SIZE,
              borderRadius: RADIUS,
              backgroundColor: 'transparent',
              overflow: 'hidden',
              transform: [{ rotate: `${angle}deg` }],
            }}
          >
            <View style={{
              position: 'absolute',
              left: RADIUS,
              top: 0,
              width: RADIUS,
              height: WHEEL_SIZE,
              backgroundColor: color,
              opacity: 0.85,
            }} />
          </View>
        );
      })}

      {/* White radial overlay for saturation */}
      <View style={[styles.wheelOverlayWhite, { width: WHEEL_SIZE, height: WHEEL_SIZE, borderRadius: RADIUS }]} />

      {/* Dark center circle */}
      <View style={[styles.wheelCenter, {
        width: WHEEL_SIZE * 0.08,
        height: WHEEL_SIZE * 0.08,
        borderRadius: WHEEL_SIZE * 0.04,
        left: RADIUS - WHEEL_SIZE * 0.04,
        top: RADIUS - WHEEL_SIZE * 0.04,
      }]} />

      {/* Touch layer */}
      <View
        ref={wheelRef}
        style={[StyleSheet.absoluteFill, { borderRadius: RADIUS }]}
        {...panResponder.panHandlers}
      />

      {/* Cursor */}
      <View style={[styles.cursor, {
        left: cursor.x - 14,
        top: cursor.y - 14,
        borderColor: '#fff',
        backgroundColor: hsvToHex(hue, sat, 1),
      }]} />
    </View>
  );
}

const PRESETS = [
  '#1DB954', '#E91E63', '#2196F3', '#FF9800',
  '#9C27B0', '#00BCD4', '#FF5722', '#FFEB3B',
  '#ffffff', '#aaaaaa',
];

const MODES = [
  { key: 'dark',   label: 'Dark',   icon: 'moon' },
  { key: 'light',  label: 'Light',  icon: 'sunny' },
  { key: 'system', label: 'System', icon: 'phone-portrait' },
];

export default function SettingsScreen({ navigation }) {
  const { palette, accentColor, colorScheme, setAccent, setScheme } = useTheme();

  const initial = hexToHsv(accentColor);
  const [hue, setHue] = useState(initial.h);
  const [sat, setSat] = useState(initial.s);
  const [val, setVal] = useState(initial.v);

  const currentHex = hsvToHex(hue, sat, val);

  const handleHS = useCallback((h, s) => {
    setHue(h); setSat(s);
    setAccent(hsvToHex(h, s, val));
  }, [val, setAccent]);

  const handleVal = useCallback((v) => {
    setVal(v);
    setAccent(hsvToHex(hue, sat, v));
  }, [hue, sat, setAccent]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: palette.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={palette.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: palette.text }]}>Appearance</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Color Mode ── */}
        <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>COLOR MODE</Text>
        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
          {MODES.map((m, i) => (
            <TouchableOpacity
              key={m.key}
              style={[
                styles.modeRow,
                i < MODES.length - 1 && { borderBottomWidth: 1, borderBottomColor: palette.border },
                colorScheme === m.key && { backgroundColor: palette.bg2 },
              ]}
              onPress={() => setScheme(m.key)}
            >
              <View style={styles.modeLeft}>
                <View style={[styles.modeIcon, { backgroundColor: colorScheme === m.key ? palette.accent : palette.bg3 }]}>
                  <Ionicons name={m.icon} size={16} color={colorScheme === m.key ? '#000' : palette.textSub} />
                </View>
                <Text style={[styles.modeLabel, { color: palette.text }]}>{m.label}</Text>
              </View>
              {colorScheme === m.key && (
                <Ionicons name="checkmark-circle" size={22} color={palette.accent} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Accent Color ── */}
        <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>ACCENT COLOR</Text>

        {/* Preview swatch */}
        <View style={[styles.previewRow, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={[styles.previewSwatch, { backgroundColor: currentHex }]} />
          <View>
            <Text style={[styles.previewHex, { color: palette.text }]}>{currentHex.toUpperCase()}</Text>
            <Text style={[styles.previewSub, { color: palette.textSub }]}>Current accent color</Text>
          </View>
          <View style={[styles.previewDot, { backgroundColor: currentHex }]}>
            <Ionicons name="musical-note" size={18} color="#000" />
          </View>
        </View>

        {/* Color wheel */}
        <View style={[styles.wheelCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <ColorWheel hue={hue} sat={sat} onChangeHS={handleHS} />

          {/* Brightness slider */}
          <View style={styles.brightnessRow}>
            <Ionicons name="sunny-outline" size={16} color={palette.textMuted} />
            <View style={styles.brightnessTrack}>
              <View style={[styles.brightnessFill, {
                background: `linear-gradient(to right, #000, ${hsvToHex(hue, sat, 1)})`,
              }]} />
              {/* Manual gradient via overlapping views */}
              <View style={[StyleSheet.absoluteFill, { borderRadius: 6, overflow: 'hidden', flexDirection: 'row' }]}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <View key={i} style={{ flex: 1, backgroundColor: hsvToHex(hue, sat, (i + 1) / 20) }} />
                ))}
              </View>
              {/* Thumb */}
              <View style={[styles.brightnessThumb, {
                left: `${val * 100}%`,
                borderColor: palette.bg,
              }]} />
              {/* Touch area */}
              <View
                style={StyleSheet.absoluteFill}
                {...PanResponder.create({
                  onStartShouldSetPanResponder: () => true,
                  onMoveShouldSetPanResponder: () => true,
                  onPanResponderGrant: (e) => handleVal(Math.max(0.05, Math.min(1, e.nativeEvent.locationX / (WHEEL_SIZE - 32)))),
                  onPanResponderMove: (e) => handleVal(Math.max(0.05, Math.min(1, e.nativeEvent.locationX / (WHEEL_SIZE - 32)))),
                }).panHandlers}
              />
            </View>
            <Ionicons name="sunny" size={16} color={palette.textMuted} />
          </View>
        </View>

        {/* Preset swatches */}
        <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>PRESETS</Text>
        <View style={[styles.presetsCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          {PRESETS.map(color => {
            const active = accentColor.toLowerCase() === color.toLowerCase();
            return (
              <TouchableOpacity
                key={color}
                style={[styles.swatch, { backgroundColor: color, borderWidth: active ? 3 : 0, borderColor: palette.text }]}
                onPress={() => {
                  const hsv = hexToHsv(color);
                  setHue(hsv.h); setSat(hsv.s); setVal(hsv.v);
                  setAccent(color);
                }}
              >
                {active && <Ionicons name="checkmark" size={16} color={color === '#ffffff' || color === '#FFEB3B' ? '#000' : '#fff'} />}
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '700' },
  scroll: { padding: 20, gap: 8, paddingBottom: 60 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginTop: 16, marginBottom: 6, marginLeft: 4 },

  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  modeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  modeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modeIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  modeLabel: { fontSize: 15, fontWeight: '500' },

  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  previewSwatch: { width: 48, height: 48, borderRadius: 12 },
  previewHex: { fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  previewSub: { fontSize: 12, marginTop: 2 },
  previewDot: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },

  wheelCard: { borderRadius: 14, borderWidth: 1, padding: 16, alignItems: 'center', gap: 20 },
  wheelContainer: { position: 'relative', overflow: 'hidden', borderRadius: 999 },
  wheelOverlayWhite: {
    position: 'absolute',
    top: 0, left: 0,
    // radial white-to-transparent: approximate with a white circle that fades
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  wheelCenter: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.5)' },
  cursor: { position: 'absolute', width: 28, height: 28, borderRadius: 14, borderWidth: 3, elevation: 4, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 4 },

  brightnessRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' },
  brightnessTrack: { flex: 1, height: 24, borderRadius: 12, overflow: 'visible', position: 'relative', backgroundColor: '#333' },
  brightnessFill: { ...StyleSheet.absoluteFillObject, borderRadius: 12 },
  brightnessThumb: { position: 'absolute', top: -4, width: 32, height: 32, borderRadius: 16, borderWidth: 3, backgroundColor: '#fff', marginLeft: -16, elevation: 4, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 3 },

  presetsCard: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16, borderRadius: 14, borderWidth: 1 },
  swatch: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
