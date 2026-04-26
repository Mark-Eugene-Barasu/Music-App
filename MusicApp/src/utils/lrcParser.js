// Parses LRC format: [mm:ss.xx] lyric line
export function parseLRC(lrc) {
  if (!lrc) return [];
  const lines = lrc.split('\n');
  const cues = [];
  const timeRe = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

  for (const line of lines) {
    const text = line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim();
    let match;
    timeRe.lastIndex = 0;
    while ((match = timeRe.exec(line)) !== null) {
      const ms = (+match[1]) * 60000 + (+match[2]) * 1000 + (+match[3]) * (match[3].length === 2 ? 10 : 1);
      cues.push({ ms, text });
    }
  }
  return cues.sort((a, b) => a.ms - b.ms);
}

export function getActiveCueIndex(cues, positionMs) {
  let idx = 0;
  for (let i = 0; i < cues.length; i++) {
    if (cues[i].ms <= positionMs) idx = i;
    else break;
  }
  return idx;
}
