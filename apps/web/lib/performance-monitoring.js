// =====================================================
// LifeOS Performance Monitoring
// File: performance-monitoring.js
// =====================================================

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.observers = {};
    this.isEnabled = typeof window !== 'undefined' && 'performance' in window;
    
    if (this.isEnabled) {
      this.initializeObservers();
    }
  }

  initializeObservers() {
    // Performance Observer per Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      this.observeLCP();
      
      // First Input Delay (FID)
      this.observeFID();
      
      // Cumulative Layout Shift (CLS)
      this.observeCLS();
      
      // Time to First Byte (TTFB)
      this.observeTTFB();
    }

    // Memory monitoring
    this.observeMemory();
    
    // LifeOS specific metrics
    this.observeLifeOSMetrics();
  }

  observeLCP() {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      this.metrics.lcp = {
        value: lastEntry.startTime,
        timestamp: Date.now(),
        rating: this.rateLCP(lastEntry.startTime)
      };
      
      this.reportMetric('lcp', this.metrics.lcp);
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.lcp = observer;
  }

  observeFID() {
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.metrics.fid = {
          value: entry.processingStart - entry.startTime,
          timestamp: Date.now(),
          rating: this.rateFID(entry.processingStart - entry.startTime)
        };
        
        this.reportMetric('fid', this.metrics.fid);
      }
    });
    
    observer.observe({ entryTypes: ['first-input'] });
    this.observers.fid = observer;
  }

  observeCLS() {
    let clsValue = 0;
    let clsEntries = [];
    let sessionValue = 0;
    let sessionEntries = [];

    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

          if (sessionValue && 
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }

          if (sessionValue > clsValue) {
            clsValue = sessionValue;
            clsEntries = [...sessionEntries];

            this.metrics.cls = {
              value: clsValue,
              timestamp: Date.now(),
              rating: this.rateCLS(clsValue)
            };
            
            this.reportMetric('cls', this.metrics.cls);
          }
        }
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.cls = observer;
  }

  observeTTFB() {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      for (const entry of entries) {
        if (entry.entryType === 'navigation') {
          this.metrics.ttfb = {
            value: entry.responseStart - entry.requestStart,
            timestamp: Date.now(),
            rating: this.rateTTFB(entry.responseStart - entry.requestStart)
          };
          
          this.reportMetric('ttfb', this.metrics.ttfb);
        }
      }
    });
    
    observer.observe({ entryTypes: ['navigation'] });
    this.observers.ttfb = observer;
  }

  observeMemory() {
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = performance.memory;
        this.metrics.memory = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          timestamp: Date.now(),
          rating: this.rateMemory(memory.usedJSHeapSize / memory.jsHeapSizeLimit)
        };
        
        this.reportMetric('memory', this.metrics.memory);
      };

      // Check memory ogni 30 secondi
      setInterval(checkMemory, 30000);
      checkMemory(); // Initial check
    }
  }

  observeLifeOSMetrics() {
    // Hook rendering performance LifeOS
    this.measureHookPerformance();
    
    // Component mount time
    this.measureComponentPerformance();
    
    // Edge Functions response time
    this.measureEdgeFunctionPerformance();
  }

  measureHookPerformance() {
    const originalUseState = React.useState;
    const originalUseEffect = React.useEffect;
    
    React.useState = function(...args) {
      const start = performance.now();
      const result = originalUseState.apply(this, args);
      const end = performance.now();
      
      window.performanceMonitor?.recordHookTime('useState', end - start);
      return result;
    };
    
    React.useEffect = function(...args) {
      const start = performance.now();
      const result = originalUseEffect.apply(this, args);
      const end = performance.now();
      
      window.performanceMonitor?.recordHookTime('useEffect', end - start);
      return result;
    };
  }

  measureComponentPerformance() {
    // Higher Order Component per misurare render time
    window.withPerformanceTracking = (WrappedComponent, componentName) => {
      return function PerformanceTrackedComponent(props) {
        React.useEffect(() => {
          const start = performance.now();
          
          return () => {
            const end = performance.now();
            window.performanceMonitor?.recordComponentTime(componentName, end - start);
          };
        }, []);
        
        return React.createElement(WrappedComponent, props);
      };
    };
  }

  measureEdgeFunctionPerformance() {
    const originalFetch = window.fetch;
    
    window.fetch = async function(url, options) {
      if (url.includes('/functions/v1/')) {
        const start = performance.now();
        
        try {
          const response = await originalFetch.apply(this, arguments);
          const end = performance.now();
          
          window.performanceMonitor?.recordEdgeFunctionTime(
            url.split('/').pop(),
            end - start,
            response.status
          );
          
          return response;
        } catch (error) {
          const end = performance.now();
          
          window.performanceMonitor?.recordEdgeFunctionTime(
            url.split('/').pop(),
            end - start,
            'error'
          );
          
          throw error;
        }
      }
      
      return originalFetch.apply(this, arguments);
    };
  }

  // Recording methods
  recordHookTime(hookName, duration) {
    if (!this.metrics.hooks) this.metrics.hooks = {};
    if (!this.metrics.hooks[hookName]) this.metrics.hooks[hookName] = [];
    
    this.metrics.hooks[hookName].push({
      duration,
      timestamp: Date.now()
    });
    
    // Keep only last 100 measurements
    if (this.metrics.hooks[hookName].length > 100) {
      this.metrics.hooks[hookName].shift();
    }
  }

  recordComponentTime(componentName, duration) {
    if (!this.metrics.components) this.metrics.components = {};
    if (!this.metrics.components[componentName]) this.metrics.components[componentName] = [];
    
    this.metrics.components[componentName].push({
      duration,
      timestamp: Date.now()
    });
  }

  recordEdgeFunctionTime(functionName, duration, status) {
    if (!this.metrics.edgeFunctions) this.metrics.edgeFunctions = {};
    if (!this.metrics.edgeFunctions[functionName]) this.metrics.edgeFunctions[functionName] = [];
    
    this.metrics.edgeFunctions[functionName].push({
      duration,
      status,
      timestamp: Date.now()
    });
  }

  // Rating methods
  rateLCP(value) {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  rateFID(value) {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }

  rateCLS(value) {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  rateTTFB(value) {
    if (value <= 800) return 'good';
    if (value <= 1800) return 'needs-improvement';
    return 'poor';
  }

  rateMemory(ratio) {
    if (ratio <= 0.5) return 'good';
    if (ratio <= 0.8) return 'needs-improvement';
    return 'poor';
  }

  // Reporting
  reportMetric(metricName, data) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[LifeOS Performance] ${metricName}:`, data);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metricName, data);
    }
  }

  async sendToAnalytics(metricName, data) {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: metricName,
          data,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error('Failed to send performance data:', error);
    }
  }

  // Public API
  getMetrics() {
    return { ...this.metrics };
  }

  getMetricSummary() {
    const summary = {};
    
    Object.keys(this.metrics).forEach(key => {
      const metric = this.metrics[key];
      if (metric.value !== undefined) {
        summary[key] = {
          value: metric.value,
          rating: metric.rating,
          timestamp: metric.timestamp
        };
      }
    });
    
    return summary;
  }

  destroy() {
    Object.values(this.observers).forEach(observer => {
      observer.disconnect();
    });
    this.observers = {};
    this.metrics = {};
  }
}

// Initialize global performance monitor
if (typeof window !== 'undefined') {
  window.performanceMonitor = new PerformanceMonitor();
}

export default PerformanceMonitor;
