// Performance utilities for API calls and data fetching

interface ApiCallOptions {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTime?: number;
}

// Debounce function for search inputs
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for scroll events
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Optimized API call with retry logic
export async function apiCall<T>(
  url: string,
  options: RequestInit = {},
  apiOptions: ApiCallOptions = {}
): Promise<T> {
  const {
    timeout = 10000,
    retries = 3,
    cache = false,
    cacheTime = 5 * 60 * 1000 // 5 minutes
  } = apiOptions;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const requestOptions: RequestInit = {
    ...options,
    signal: controller.signal,
  };

  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Check cache first if enabled
      if (cache && typeof window !== 'undefined') {
        const cacheKey = `api_${url}_${JSON.stringify(options)}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < cacheTime) {
            clearTimeout(timeoutId);
            return data;
          }
        }
      }

      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the result if enabled
      if (cache && typeof window !== 'undefined') {
        const cacheKey = `api_${url}_${JSON.stringify(options)}`;
        localStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      }

      clearTimeout(timeoutId);
      return data;
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === retries) {
        clearTimeout(timeoutId);
        throw lastError;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  clearTimeout(timeoutId);
  throw lastError!;
}

// Batch API calls to reduce network requests
export async function batchApiCalls<T>(
  calls: Array<() => Promise<T>>
): Promise<T[]> {
  return Promise.all(calls.map(call => call()));
}

// Preload critical data
export function preloadData(urls: string[]): void {
  if (typeof window === 'undefined') return;
  
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
}

// Optimize images
export function optimizeImageUrl(url: string, width?: number, height?: number): string {
  if (!url) return url;
  
  // Add image optimization parameters if needed
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', '80'); // Quality
  
  return `${url}?${params.toString()}`;
}

// Memory usage monitoring
export function getMemoryUsage(): number {
  if (typeof window === 'undefined' || !(window as Window & { performance?: { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } } }).performance?.memory) {
    return 0;
  }
  
  const memory = (window as Window & { performance: { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } } }).performance.memory;
  return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
}

// Performance monitoring
export function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  
  return fn().then(result => {
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  });
}