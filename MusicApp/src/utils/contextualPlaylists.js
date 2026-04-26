// Generates smart playlists based on time-of-day and play stats
export function getContextualPlaylists(tracks, stats) {
  const hour = new Date().getHours();

  // Score tracks by play count
  const scored = tracks.map(t => ({
    ...t,
    plays: stats[t.id]?.count ?? 0,
    totalMs: stats[t.id]?.totalMs ?? 0,
  }));

  // Deep Focus: morning (5–11), low-energy = shorter tracks or less played
  const deepFocus = [...scored]
    .sort((a, b) => a.duration - b.duration)
    .slice(0, 25);

  // High Energy: afternoon/evening (12–22), most played
  const highEnergy = [...scored]
    .sort((a, b) => b.plays - a.plays || b.totalMs - a.totalMs)
    .slice(0, 25);

  // Late Night: after 22 or before 5, longest tracks
  const lateNight = [...scored]
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 25);

  const suggested =
    hour >= 5 && hour < 12 ? 'Deep Focus'
    : hour >= 12 && hour < 22 ? 'High Energy'
    : 'Late Night';

  return [
    { id: '__deep_focus__', name: '🧠 Deep Focus', tracks: deepFocus, smart: true },
    { id: '__high_energy__', name: '⚡ High Energy', tracks: highEnergy, smart: true },
    { id: '__late_night__', name: '🌙 Late Night', tracks: lateNight, smart: true },
  ];
}
