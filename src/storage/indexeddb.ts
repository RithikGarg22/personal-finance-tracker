/**
 * IndexedDB storage adapter implementation
 * Provides persistent local storage for transactions and budgets
 */

import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Transaction, Budget, StorageAdapter } from '../types';
import { StorageError, retryWithBackoff, logError } from '../utils/errorHandling';

/**
 * Database schema definition for TypeScript type safety
 */
interface FinanceTrackerDB extends DBSchema {
  transactions: {
    key: string;
    value: Transaction;
    indexes: {
      'date': string;
      'category': string;
    };
  };
  budgets: {
    key: string;
    value: Budget;
    indexes: {
      'month': string;
      'category': string;
      'month-category': [string, string];
    };
  };
}

/**
 * Generic IndexedDB adapter implementing the StorageAdapter interface
 */
export class IndexedDBAdapter<T extends { id: string }> implements StorageAdapter<T> {
  private dbPromise: Promise<IDBPDatabase<FinanceTrackerDB>>;
  private dbName: string;
  private storeName: keyof FinanceTrackerDB;
  private version: number;

  constructor(
    dbName: string,
    storeName: keyof FinanceTrackerDB,
    version: number = 1
  ) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;
    this.dbPromise = this.initDatabase();
  }

  /**
   * Initialize the IndexedDB database with proper schema
   */
  private async initDatabase(): Promise<IDBPDatabase<FinanceTrackerDB>> {
    try {
      return await retryWithBackoff(
        () => openDB<FinanceTrackerDB>(this.dbName, this.version, {
          upgrade(db) {
            // Create transactions store if it doesn't exist
            if (!db.objectStoreNames.contains('transactions')) {
              const transactionStore = db.createObjectStore('transactions', {
                keyPath: 'id',
              });
              transactionStore.createIndex('date', 'date', { unique: false });
              transactionStore.createIndex('category', 'category', { unique: false });
            }

            // Create budgets store if it doesn't exist
            if (!db.objectStoreNames.contains('budgets')) {
              const budgetStore = db.createObjectStore('budgets', {
                keyPath: 'id',
              });
              budgetStore.createIndex('month', 'month', { unique: false });
              budgetStore.createIndex('category', 'category', { unique: false });
              budgetStore.createIndex('month-category', ['month', 'category'], {
                unique: true,
              });
            }
          },
        }),
        2, // Max 2 retries for database initialization
        200 // Initial delay of 200ms
      );
    } catch (error) {
      logError('IndexedDB initialization', error);
      throw new StorageError(
        'Failed to initialize database. Please check browser compatibility.',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Generate a UUID v4
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Add a new item to storage
   */
  async add(item: Omit<T, 'id'>): Promise<string> {
    try {
      const db = await this.dbPromise;
      const id = this.generateUUID();
      const itemWithId = { ...item, id } as T;
      
      await retryWithBackoff(
        async () => {
          await db.add(this.storeName as any, itemWithId as any);
        },
        2 // Max 2 retries
      );
      
      return id;
    } catch (error) {
      logError(`IndexedDB add to ${this.storeName}`, error);
      
      if (error instanceof Error) {
        if (error.name === 'QuotaExceededError') {
          throw new StorageError('Storage quota exceeded. Please export your data and clear old records.', error);
        }
        throw new StorageError(`Failed to add item: ${error.message}`, error);
      }
      throw new StorageError('Failed to add item: Unknown error');
    }
  }

  /**
   * Retrieve all items from storage
   */
  async getAll(): Promise<T[]> {
    try {
      const db = await this.dbPromise;
      return await retryWithBackoff(
        async () => (await db.getAll(this.storeName as any)) as T[],
        2 // Max 2 retries
      );
    } catch (error) {
      logError(`IndexedDB getAll from ${this.storeName}`, error);
      
      if (error instanceof Error) {
        throw new StorageError(`Failed to retrieve items: ${error.message}`, error);
      }
      throw new StorageError('Failed to retrieve items: Unknown error');
    }
  }

  /**
   * Retrieve a single item by id
   */
  async getById(id: string): Promise<T | undefined> {
    try {
      const db = await this.dbPromise;
      return await retryWithBackoff(
        async () => (await db.get(this.storeName as any, id)) as T | undefined,
        2 // Max 2 retries
      );
    } catch (error) {
      logError(`IndexedDB getById from ${this.storeName}`, error);
      
      if (error instanceof Error) {
        throw new StorageError(`Failed to retrieve item: ${error.message}`, error);
      }
      throw new StorageError('Failed to retrieve item: Unknown error');
    }
  }

  /**
   * Update an existing item
   */
  async update(id: string, item: Partial<T>): Promise<void> {
    try {
      const db = await this.dbPromise;
      
      await retryWithBackoff(
        async () => {
          const existing = await db.get(this.storeName as any, id);
          
          if (!existing) {
            throw new StorageError(`Item with id ${id} not found`);
          }

          const updated = { ...existing, ...item, id } as T;
          await db.put(this.storeName as any, updated as any);
        },
        2 // Max 2 retries
      );
    } catch (error) {
      logError(`IndexedDB update in ${this.storeName}`, error);
      
      if (error instanceof StorageError) {
        throw error; // Re-throw storage errors as-is
      }
      
      if (error instanceof Error) {
        throw new StorageError(`Failed to update item: ${error.message}`, error);
      }
      throw new StorageError('Failed to update item: Unknown error');
    }
  }

  /**
   * Delete an item by id
   */
  async delete(id: string): Promise<void> {
    try {
      const db = await this.dbPromise;
      
      await retryWithBackoff(
        async () => {
          await db.delete(this.storeName as any, id);
        },
        2 // Max 2 retries
      );
    } catch (error) {
      logError(`IndexedDB delete from ${this.storeName}`, error);
      
      if (error instanceof Error) {
        throw new StorageError(`Failed to delete item: ${error.message}`, error);
      }
      throw new StorageError('Failed to delete item: Unknown error');
    }
  }
}

/**
 * Factory function to create a storage adapter for transactions
 */
export const createTransactionStorage = (): StorageAdapter<Transaction> => {
  return new IndexedDBAdapter<Transaction>('finance-tracker', 'transactions', 1);
};

/**
 * Factory function to create a storage adapter for budgets
 */
export const createBudgetStorage = (): StorageAdapter<Budget> => {
  return new IndexedDBAdapter<Budget>('finance-tracker', 'budgets', 1);
};
