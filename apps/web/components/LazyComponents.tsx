// apps/web/components/LazyComponents.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';

// Loading fallback component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
  </div>
);

const LoadingCard = () => (
  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 animate-pulse">
    <div className="h-6 bg-white/20 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-white/20 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-white/20 rounded w-2/3"></div>
  </div>
);

// 1. MicroAdviceWidget - Heavy AI component (exists in LifeOS)
export const LazyMicroAdviceWidget = dynamic(
  () => import('./MicroAdviceWidget'),
  {
    loading: () => <LoadingCard />,
    ssr: false,
  }
);

// Higher-order component for intersection observer lazy loading
export function withIntersectionLazyLoad<T extends object>(
  Component: React.ComponentType<T>,
  options: IntersectionObserverInit = { threshold: 0.1 }
) {
  return function LazyIntersectionComponent(props: T) {
    const [isVisible, setIsVisible] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasLoaded) {
            setIsVisible(true);
            setHasLoaded(true);
            observer.disconnect();
          }
        },
        options
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => observer.disconnect();
    }, [hasLoaded]);

    return (
      <div ref={ref}>
        {isVisible ? <Component {...props} /> : <LoadingCard />}
      </div>
    );
  };
}

// Memory optimization hook
export function useMemoryOptimization() {
  useEffect(() => {
    // Cleanup event listeners on unmount
    return () => {
      // Force garbage collection hint
      if (typeof window !== 'undefined' && (window as any).gc) {
        (window as any).gc();
      }
    };
  }, []);

  // Debounced resize handler
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const handleResize = debounce(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 250);

    if (typeof window !== 'undefined') {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return windowSize;
}

// Animation performance optimization
export function useAnimationOptimization() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return {
    prefersReducedMotion,
    shouldAnimate: !prefersReducedMotion,
    animationClass: prefersReducedMotion ? '' : 'transition-all duration-300',
  };
}

// Debounce utility for performance
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

// Virtual scrolling for large lists
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (event: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(event.currentTarget.scrollTop);
    },
  };
}