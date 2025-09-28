import { useState, useEffect, useCallback, useRef } from 'react';
import { apiCall } from '@/utils/performance';

interface UseOptimizedFetchOptions {
  enabled?: boolean;
  refetchInterval?: number;
  cache?: boolean;
  cacheTime?: number;
  retries?: number;
  timeout?: number;
}

interface UseOptimizedFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

export function useOptimizedFetch<T>(
  url: string,
  options: UseOptimizedFetchOptions = {}
): UseOptimizedFetchResult<T> {
  const {
    enabled = true,
    refetchInterval,
    cache = true,
    cacheTime = 5 * 60 * 1000,
    retries = 3,
    timeout = 10000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall<T>(
        url,
        { signal: abortControllerRef.current.signal },
        { cache, cacheTime, retries, timeout }
      );
      
      setData(result);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [url, enabled, cache, cacheTime, retries, timeout]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }

    // Set up interval refetch
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(fetchData, refetchInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, refetchInterval, enabled]);

  return {
    data,
    loading,
    error,
    refetch,
    mutate
  };
}

// Hook for paginated data
export function usePaginatedFetch<T>(
  baseUrl: string,
  page: number = 1,
  limit: number = 10,
  options: UseOptimizedFetchOptions = {}
) {
  const url = `${baseUrl}?page=${page}&limit=${limit}`;
  const result = useOptimizedFetch<{
    data: T[];
    total: number;
    page: number;
    totalPages: number;
  }>(url, options);

  return {
    ...result,
    hasNextPage: result.data ? result.data.page < result.data.totalPages : false,
    hasPrevPage: result.data ? result.data.page > 1 : false,
  };
}

// Hook for infinite scroll
export function useInfiniteFetch<T>(
  baseUrl: string,
  limit: number = 10,
  options: UseOptimizedFetchOptions = {}
) {
  const [allData, setAllData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const url = `${baseUrl}?page=${page}&limit=${limit}`;
      const result = await apiCall<{
        data: T[];
        total: number;
        page: number;
        totalPages: number;
      }>(url, {}, options);

      if (result.data.length === 0) {
        setHasMore(false);
      } else {
        setAllData(prev => [...prev, ...result.data]);
        setPage(prev => prev + 1);
        setHasMore(result.page < result.totalPages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [baseUrl, page, limit, loading, hasMore, options]);

  const reset = useCallback(() => {
    setAllData([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    loadMore,
    reset
  };
}

