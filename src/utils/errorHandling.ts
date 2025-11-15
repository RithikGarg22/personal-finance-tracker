/**
 * Error handling utilities for consistent error management across the application
 */

/**
 * Custom error types for better error categorization
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class StorageError extends Error {
  public readonly originalError?: Error;
  
  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'StorageError';
    this.originalError = originalError;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Check if an error is a transient error that can be retried
 */
export function isTransientError(error: Error): boolean {
  const transientMessages = [
    'network',
    'timeout',
    'temporarily unavailable',
    'connection',
    'ECONNREFUSED',
    'ETIMEDOUT',
  ];

  const errorMessage = error.message.toLowerCase();
  return transientMessages.some(msg => errorMessage.includes(msg));
}

/**
 * Retry a function with exponential backoff
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param initialDelay - Initial delay in milliseconds (default: 100)
 * @returns Promise resolving to the function result
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 100
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry if it's not a transient error
      if (!isTransientError(lastError)) {
        throw lastError;
      }
      
      // Don't retry if we've exhausted all attempts
      if (attempt === maxRetries) {
        console.error(`Failed after ${maxRetries + 1} attempts:`, lastError);
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, lastError.message);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw lastError!;
}

/**
 * Get a user-friendly error message from an error object
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    return error.message;
  }
  
  if (error instanceof StorageError) {
    if (error.message.includes('quota exceeded')) {
      return 'Storage is full. Please export your data and clear old records.';
    }
    return 'Failed to save data. Please try again.';
  }
  
  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('not found')) {
      return 'The requested item was not found.';
    }
    
    if (error.message.includes('duplicate')) {
      return error.message; // Validation messages are already user-friendly
    }
    
    if (error.message.includes('quota exceeded')) {
      return 'Storage is full. Please export your data and clear old records.';
    }
    
    // Return the error message if it seems user-friendly
    if (error.message.length < 100 && !error.message.includes('undefined')) {
      return error.message;
    }
  }
  
  // Generic fallback message
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Log error to console with context
 */
export function logError(context: string, error: unknown): void {
  console.error(`[${context}]`, error);
  
  if (error instanceof Error && error.stack) {
    console.error('Stack trace:', error.stack);
  }
}

/**
 * Wrap an async function with error handling and logging
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(context, error);
      throw error;
    }
  };
}
