import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';
import { parseLRC, getActiveCueIndex } from '../utils/lrcParser';
import { load, save } from '../utils/storage';

export default function LyricsScreen({ navigation }) {
  const { currentTrack, position } = usePlayer();
  const { palette } = useTheme();
  const [cues, setCues] = useState([]);
  const [rawLrc, setRawLrc] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);
  const lastScrollIdx = useRef(-1);

  const storageKey = currentTrack ? `lrc_${currentTrack.id}` : null;

  useEffect(() => {
    if (!storageKey) return;
    load(storageKey, '').then(lrc => {
      setRawLrc(lrc);
      setCues(parseLRC(lrc));
    });
  }, [storageKey]);

  const activeIdx = cues.length > 0 ? getActiveCueIndex(cues, position) : -1;

  useEffect(() => {
    if (activeIdx >= 0 && activeIdx !== lastScrollIdx.current && listRef.current) {
      lastScrollIdx.current = activeIdx;
      listRef.current.scrollToIndex({ index: activeIdx, animated: true, viewPosition: 0.4 });
    }
  }, [activeIdx]);

  function saveLrc() {
    const parsed = parseLRC(draft);
    setCues(parsed);
    setRawLrc(draft);
    save(storageKey, draft);
    setEditing(false);
  }

  if (!currentTrack) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-down" size={28} color={palette.text} />
        </TouchableOpacity>
        <View style={styles.center}>
          <Ionicons name="musical-notes-outline" size={48} color={palette.bg3} />
          <Text style={[styles.empty, { color: palette.textMuted }]}>Nothing playing</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]}>
      <View style={[styles.header, { borderBottomColor: palette.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color={palette.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: palette.text }]} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={[styles.sub, { color: palette.accent }]}>Lyrics</Text>
        </View>
        <TouchableOpacity onPress={() => { setDraft(rawLrc); setEditing(true); }}>
          <Ionicons name="pencil" size={20} color={palette.accent} />
        </TouchableOpacity>
      </View>

      {cues.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="document-text-outline" size={48} color={palette.bg3} />
          <Text style={[styles.empty, { color: palette.textMuted }]}>No lyrics yet</Text>
          <Text style={[styles.emptySub, { color: palette.textMuted }]}>Tap the pencil to paste LRC lyrics</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={cues}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item, index }) => (
            <Text style={[styles.line, { color: palette.textMuted }, index === activeIdx && { color: palette.accent, fontSize: 22, fontWeight: '700' }]}>
              {item.text || '·'}
            </Text>
          )}
          contentContainerStyle={styles.listContent}
          onScrollToIndexFailed={() => {}}
        />
      )}

      <Modal visible={editing} animationType="slide">
        <KeyboardAvoidingView style={[styles.editModal, { backgroundColor: palette.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.editHeader, { borderBottomColor: palette.border }]}>
              <TouchableOpacity onPress={() => setEditing(false)}>
                <Text style={[styles.editCancel, { color: palette.textSub }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.editTitle, { color: palette.text }]}>Paste LRC Lyrics</Text>
              <TouchableOpacity onPress={saveLrc}>
                <Text style={[styles.editSave, { color: palette.accent }]}>Save</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.editInput, { color: palette.text }]}
              multiline
              value={draft}
              onChangeText={setDraft}
              placeholder={'[00:12.00] First line\n[00:15.50] Second line...'}
              placeholderTextColor={palette.textMuted}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12, borderBottomWidth: 1 },
  headerCenter: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700' },
  sub: { fontSize: 12, marginTop: 2 },
  backBtn: { padding: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  empty: { fontSize: 16 },
  emptySub: { fontSize: 13 },
  listContent: { paddingHorizontal: 28, paddingVertical: 40 },
  line: { fontSize: 18, textAlign: 'center', marginVertical: 10, lineHeight: 28 },
  editModal: { flex: 1 },
  editHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  editTitle: { fontSize: 16, fontWeight: '700' },
  editCancel: { fontSize: 15 },
  editSave: { fontSize: 15, fontWeight: '700' },
  editInput: { flex: 1, fontSize: 13, padding: 20, textAlignVertical: 'top', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
});
