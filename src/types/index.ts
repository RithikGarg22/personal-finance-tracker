/**
 * Core data models for the Personal Finance Tracker application
 */

/**
 * Transaction represents a financial record with date, amount, category, and optional notes
 */
export interface Transaction {
  id: string;
  date: string; // ISO 8601 format (YYYY-MM-DD)
  amount: number; // Positive for income, negative for expenses
  category: string;
  notes?: string;
}

/**
 * Budget represents a monthly spending limit for a specific category
 */
export interface Budget {
  id: string;
  month: string; // Format: YYYY-MM
  category: string;
  limit: number; // Positive number
}

/**
 * BudgetWithRemaining extends Budget with calculated spending and remaining amounts
 */
export interface BudgetWithRemaining extends Budget {
  spent: number;
  remaining: number;
}

/**
 * CategoryTotal represents the total spending for a specific category
 */
export interface CategoryTotal {
  category: string;
  total: number;
}

/**
 * SpendingOverTime represents spending data aggregated by time period
 */
export interface SpendingOverTime {
  date: string;
  amount: number;
}

/**
 * StorageAdapter provides a generic interface for CRUD operations
 * This abstraction allows for different storage implementations
 */
export interface StorageAdapter<T> {
  /**
   * Add a new item to storage
   * @param item - The item to add (without id)
   * @returns Promise resolving to the generated id
   */
  add(item: Omit<T, 'id'>): Promise<string>;

  /**
   * Retrieve all items from storage
   * @returns Promise resolving to array of all items
   */
  getAll(): Promise<T[]>;

  /**
   * Retrieve a single item by id
   * @param id - The unique identifier
   * @returns Promise resolving to the item or undefined if not found
   */
  getById(id: string): Promise<T | undefined>;

  /**
   * Update an existing item
   * @param id - The unique identifier
   * @param item - Partial item data to update
   * @returns Promise resolving when update is complete
   */
  update(id: string, item: Partial<T>): Promise<void>;

  /**
   * Delete an item by id
   * @param id - The unique identifier
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;
}
