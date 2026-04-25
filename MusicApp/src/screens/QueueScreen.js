import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../utils/formatTime';

export default function QueueScreen({ navigation }) {
  const { queue, currentIndex, removeFromQueue, loadAndPlay } = usePlayer();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Queue</Text>
        <View style={{ width: 26 }} />
      </View>
      <FlatList
        data={queue}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.item, index === currentIndex && styles.activeItem]}
            onPress={() => loadAndPlay(item, queue, index)}
          >
            <View style={styles.itemLeft}>
              {index === currentIndex
                ? <Ionicons name="musical-note" size={16} color="#1DB954" style={styles.icon} />
                : <Text style={styles.indexText}>{index + 1}</Text>}
              <View>
                <Text style={[styles.trackTitle, index === currentIndex && styles.activeText]} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.artist} numberOfLines={1}>{item.artist}</Text>
              </View>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.duration}>{formatTime(item.duration)}</Text>
              {index !== currentIndex && (
                <TouchableOpacity onPress={() => removeFromQueue(index)} style={styles.removeBtn}>
                  <Ionicons name="close" size={18} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Queue is empty</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  activeItem: { backgroundColor: '#1a1a1a' },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { marginRight: 12 },
  indexText: { color: '#555', fontSize: 13, width: 28 },
  trackTitle: { color: '#fff', fontSize: 14, fontWeight: '500', maxWidth: 220 },
  activeText: { color: '#1DB954' },
  artist: { color: '#666', fontSize: 12, marginTop: 2 },
  duration: { color: '#555', fontSize: 12 },
  removeBtn: { padding: 4 },
  empty: { color: '#555', textAlign: 'center', marginTop: 60, fontSize: 15 },
});
