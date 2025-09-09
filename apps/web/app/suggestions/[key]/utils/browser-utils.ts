// Utility function to get URL parameters in browser environment
export function getUrlParameter(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  const param = urlParams.get(name);
  if (param) return param;
  
  // Try to get from pathname
  const pathSegments = window.location.pathname.split('/');
  const lastSegment = pathSegments[pathSegments.length - 1];
  return lastSegment || null;
}

export function MMSS(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
