export function stressTrend(last7:number[]): 'up'|'down'|'flat' {
  if (last7.length < 3) return 'flat';
  const first = last7[0], last = last7[last7.length-1];
  if (last - first > 0.5) return 'up';
  if (first - last > 0.5) return 'down';
  return 'flat';
}
