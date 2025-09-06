export function generateId(): string {
  return crypto.randomUUID();
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMinutes < 60) {
    return `${diffMinutes} minuti fa`;
  } else if (diffHours < 24) {
    return `${diffHours} ore fa`;
  } else if (diffDays < 7) {
    return `${diffDays} giorni fa`;
  } else {
    return date.toLocaleDateString('it-IT');
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function roundToDecimal(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, maxLength);
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return roundToDecimal((value / total) * 100, 2);
}

export function createTimeWindows(startHour: number, endHour: number, intervalMinutes: number = 60): Array<{ start: string; end: string }> {
  const windows = [];
  
  for (let hour = startHour; hour < endHour; hour += Math.floor(intervalMinutes / 60)) {
    const start = `${hour.toString().padStart(2, '0')}:00`;
    const end = `${(hour + Math.floor(intervalMinutes / 60)).toString().padStart(2, '0')}:00`;
    windows.push({ start, end });
  }
  
  return windows;
}

export function parseTimeString(timeString: string): { hour: number; minute: number } {
  const [hourStr, minuteStr] = timeString.split(':');
  return {
    hour: parseInt(hourStr, 10),
    minute: parseInt(minuteStr, 10)
  };
}

export function isTimeInRange(currentTime: Date, startTime: string, endTime: string): boolean {
  const current = currentTime.getHours() * 60 + currentTime.getMinutes();
  const start = parseTimeString(startTime);
  const end = parseTimeString(endTime);
  
  const startMinutes = start.hour * 60 + start.minute;
  const endMinutes = end.hour * 60 + end.minute;
  
  // Handle overnight ranges (e.g., 22:00 - 07:00)
  if (startMinutes > endMinutes) {
    return current >= startMinutes || current <= endMinutes;
  }
  
  return current >= startMinutes && current <= endMinutes;
}
