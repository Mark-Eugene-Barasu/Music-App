import AsyncStorage from '@react-native-async-storage/async-storage';

export async function load(key, fallback = null) {
  try {
    const val = await AsyncStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}

export async function save(key, value) {
  try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch {}
}
