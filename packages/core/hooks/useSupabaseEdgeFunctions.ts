// =====================================================
// LifeOS - Base Hook for Supabase Edge Functions
// File: useSupabaseEdgeFunctions.ts
// =====================================================

import { useState, useCallback } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

interface EdgeFunctionOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface EdgeFunctionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

interface UseEdgeFunctionReturn<T = any> {
  loading: boolean;
  error: string | null;
  callFunction: (
    functionName: string,
    payload?: any,
    options?: EdgeFunctionOptions
  ) => Promise<T | null>;
  reset: () => void;
}

export function useSupabaseEdgeFunctions<T = any>(): UseEdgeFunctionReturn<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabaseClient();
  const user = useUser();

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const callFunction = useCallback(async (
    functionName: string,
    payload: any = {},
    options: EdgeFunctionOptions = {}
  ): Promise<T | null> => {
    const {
      timeout = 30000,
      retries = 3,
      retryDelay = 1000
    } = options;

    setLoading(true);
    setError(null);

    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return null;
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const { data, error: functionError } = await supabase.functions.invoke(
          functionName,
          {
            body: payload,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        clearTimeout(timeoutId);

        if (functionError) {
          throw new Error(functionError.message || 'Edge Function error');
        }

        // Handle the response format from our Edge Functions
        const response = data as EdgeFunctionResponse<T>;
        
        if (!response.success) {
          throw new Error(response.error || 'Function call failed');
        }

        setLoading(false);
        return response.data || null;

      } catch (err) {
        lastError = err as Error;
        
        // Don't retry on certain errors
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            setError('Request timeout');
            setLoading(false);
            return null;
          }
          
          if (err.message.includes('auth') || err.message.includes('unauthorized')) {
            setError('Authentication error');
            setLoading(false);
            return null;
          }
          
          if (err.message.includes('validation') || err.message.includes('400')) {
            setError(err.message);
            setLoading(false);
            return null;
          }
        }

        // If this is the last attempt, don't wait
        if (attempt === retries) {
          break;
        }

        // Wait before retrying with exponential backoff
        await sleep(retryDelay * Math.pow(2, attempt - 1));
      }
    }

    setError(lastError?.message || 'Failed to call function');
    setLoading(false);
    return null;
  }, [supabase, user]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    callFunction,
    reset
  };
}

// Typed wrapper for specific functions
export function useTypedEdgeFunction<TInput = any, TOutput = any>(
  functionName: string
) {
  const { loading, error, callFunction, reset } = useSupabaseEdgeFunctions<TOutput>();

  const execute = useCallback(async (
    input: TInput,
    options?: EdgeFunctionOptions
  ): Promise<TOutput | null> => {
    return callFunction(functionName, input, options);
  }, [callFunction, functionName]);

  return {
    loading,
    error,
    execute,
    reset
  };
}
