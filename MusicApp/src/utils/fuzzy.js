import Fuse from 'fuse.js';

export function buildFuse(tracks) {
  return new Fuse(tracks, {
    keys: ['title', 'artist', 'filename'],
    threshold: 0.4,
    includeScore: true,
  });
}

export function fuzzySearch(fuse, query) {
  if (!query.trim()) return [];
  return fuse.search(query).map(r => r.item);
}
