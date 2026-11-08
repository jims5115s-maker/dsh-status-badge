// Measures how fast the host receives new live snapshots while a turn runs.
const base = process.argv[2];
if (!base) {
  console.error('usage: node .test/live-cadence.mjs http://127.0.0.1:<web port> [durationMs]');
  process.exit(1);
}
const until = Date.now() + Number(process.argv[3] || 6000);
const seen = [];
let lastAt = 0;
while (Date.now() < until) {
  try {
    const response = await fetch(base + '/status-badge/live', { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      const at = Number(data.at) || 0;
      if (at !== 0 && at !== lastAt) {
        lastAt = at;
        seen.push({ at, ms: Date.now(), lines: Array.isArray(data.lines) ? data.lines.length : -1 });
      }
    }
  } catch {
    // host restarting
  }
  await new Promise((resolve) => setTimeout(resolve, 25));
}
const gaps = [];
for (let index = 1; index < seen.length; index += 1) gaps.push(seen[index].ms - seen[index - 1].ms);
const avg = gaps.length === 0 ? 0 : Math.round(gaps.reduce((sum, value) => sum + value, 0) / gaps.length);
console.log(JSON.stringify({ pushes: seen.length, avgGapMs: avg, maxGapMs: gaps.length === 0 ? 0 : Math.max(...gaps), lastLines: seen.length === 0 ? null : seen[seen.length - 1].lines }, null, 0));
