export interface MetricPoint {
  timestamp: string;
  value: number;
  category?: string;
}

export function calculateTrend(points: MetricPoint[]): 'improving' | 'stable' | 'declining' {
  if (points.length < 2) return 'stable';
  
  const firstHalf = points.slice(0, Math.floor(points.length / 2));
  const secondHalf = points.slice(Math.floor(points.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, p) => sum + p.value, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, p) => sum + p.value, 0) / secondHalf.length;
  
  const change = secondAvg - firstAvg;
  
  if (change > 0.5) return 'improving';
  if (change < -0.5) return 'declining';
  return 'stable';
}

export function groupByTimeInterval(
  points: MetricPoint[], 
  interval: 'hour' | 'day' | 'week'
): Record<string, MetricPoint[]> {
  const groups: Record<string, MetricPoint[]> = {};
  
  points.forEach(point => {
    const date = new Date(point.timestamp);
    let key: string;
    
    switch (interval) {
      case 'hour':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
        break;
      case 'day':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
        break;
      default:
        key = point.timestamp;
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(point);
  });
  
  return groups;
}

export function calculateMovingAverage(points: MetricPoint[], windowSize: number): MetricPoint[] {
  if (points.length < windowSize) return points;
  
  const result: MetricPoint[] = [];
  
  for (let i = windowSize - 1; i < points.length; i++) {
    const window = points.slice(i - windowSize + 1, i + 1);
    const avgValue = window.reduce((sum, p) => sum + p.value, 0) / windowSize;
    
    result.push({
      timestamp: points[i].timestamp,
      value: avgValue,
      category: points[i].category
    });
  }
  
  return result;
}
