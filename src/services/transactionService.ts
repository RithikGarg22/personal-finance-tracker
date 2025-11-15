/**
 * TransactionService handles business logic for transaction management
 * Provides validation and coordination between UI and storage layer
 */

import type { Transaction, StorageAdapter } from '../types';
import { ValidationError, logError } from '../utils/errorHandling';

/**
 * TransactionService class encapsulates all transaction-related operations
 */
export class TransactionService {
  private storage: StorageAdapter<Transaction>;

  constructor(storage: StorageAdapter<Transaction>) {
    this.storage = storage;
  }

  /**
   * Validate transaction data
   * @throws ValidationError if validation fails
   */
  private validateTransactionData(data: Omit<Transaction, 'id'>): void {
    // Validate date
    if (!data.date || typeof data.date !== 'string') {
      throw new ValidationError('Date is required and must be a string');
    }

    // Validate date format (ISO 8601: YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      throw new ValidationError('Date must be in YYYY-MM-DD format');
    }

    // Validate that the date is a valid date
    const dateObj = new Date(data.date);
    if (isNaN(dateObj.getTime())) {
      throw new ValidationError('Date must be a valid date');
    }

    // Validate amount
    if (data.amount === undefined || data.amount === null) {
      throw new ValidationError('Amount is required');
    }

    if (typeof data.amount !== 'number') {
      throw new ValidationError('Amount must be a number');
    }

    if (!isFinite(data.amount)) {
      throw new ValidationError('Amount must be a finite number');
    }

    // Validate category
    if (!data.category || typeof data.category !== 'string') {
      throw new ValidationError('Category is required and must be a string');
    }

    if (data.category.trim().length === 0) {
      throw new ValidationError('Category cannot be empty');
    }

    if (data.category.length > 50) {
      throw new ValidationError('Category must not exceed 50 characters');
    }

    // Validate notes (optional)
    if (data.notes !== undefined && data.notes !== null) {
      if (typeof data.notes !== 'string') {
        throw new ValidationError('Notes must be a string');
      }

      if (data.notes.length > 500) {
        throw new ValidationError('Notes must not exceed 500 characters');
      }
    }
  }

  /**
   * Add a new transaction
   * @param data - Transaction data without id
   * @returns Promise resolving to the created transaction
   * @throws ValidationError if validation fails
   */
  async addTransaction(data: Omit<Transaction, 'id'>): Promise<Transaction> {
    try {
      // Validate input data
      this.validateTransactionData(data);

      // Trim category and notes
      const sanitizedData = {
        ...data,
        category: data.category.trim(),
        notes: data.notes?.trim(),
      };

      // Add to storage
      const id = await this.storage.add(sanitizedData);

      // Return the created transaction
      return {
        id,
        ...sanitizedData,
      };
    } catch (error) {
      logError('TransactionService.addTransaction', error);
      throw error;
    }
  }

  /**
   * Update an existing transaction
   * @param id - Transaction id
   * @param data - Partial transaction data to update
   * @throws ValidationError if validation fails
   */
  async updateTransaction(id: string, data: Partial<Omit<Transaction, 'id'>>): Promise<void> {
    try {
      // Validate that we have data to update
      if (!data || Object.keys(data).length === 0) {
        throw new ValidationError('No data provided for update');
      }

      // Create a temporary object for validation
      // We need to get the existing transaction to validate the complete object
      const existing = await this.storage.getById(id);
      if (!existing) {
        throw new Error(`Transaction with id ${id} not found`);
      }

      // Merge existing data with updates for validation
      const mergedData = {
        date: data.date ?? existing.date,
        amount: data.amount ?? existing.amount,
        category: data.category ?? existing.category,
        notes: data.notes !== undefined ? data.notes : existing.notes,
      };

      // Validate the merged data
      this.validateTransactionData(mergedData);

      // Sanitize the update data
      const sanitizedData: Partial<Transaction> = {};
      if (data.date !== undefined) {
        sanitizedData.date = data.date;
      }
      if (data.amount !== undefined) {
        sanitizedData.amount = data.amount;
      }
      if (data.category !== undefined) {
        sanitizedData.category = data.category.trim();
      }
      if (data.notes !== undefined) {
        sanitizedData.notes = data.notes?.trim();
      }

      // Update in storage
      await this.storage.update(id, sanitizedData);
    } catch (error) {
      logError('TransactionService.updateTransaction', error);
      throw error;
    }
  }

  /**
   * Delete a transaction
   * @param id - Transaction id
   */
  async deleteTransaction(id: string): Promise<void> {
    try {
      await this.storage.delete(id);
    } catch (error) {
      logError('TransactionService.deleteTransaction', error);
      throw error;
    }
  }

  /**
   * Get all transactions
   * @returns Promise resolving to array of all transactions
   */
  async getAllTransactions(): Promise<Transaction[]> {
    try {
      return await this.storage.getAll();
    } catch (error) {
      logError('TransactionService.getAllTransactions', error);
      throw error;
    }
  }

  /**
   * Get transactions for a specific month
   * @param month - Month in YYYY-MM format
   * @returns Promise resolving to array of transactions for the specified month
   */
  async getTransactionsByMonth(month: string): Promise<Transaction[]> {
    try {
      // Validate month format
      const monthRegex = /^\d{4}-\d{2}$/;
      if (!monthRegex.test(month)) {
        throw new ValidationError('Month must be in YYYY-MM format');
      }

      const allTransactions = await this.storage.getAll();
      
      // Filter transactions that match the month
      return allTransactions.filter(transaction => {
        return transaction.date.startsWith(month);
      });
    } catch (error) {
      logError('TransactionService.getTransactionsByMonth', error);
      throw error;
    }
  }

  /**
   * Get transactions for a specific category
   * @param category - Category name
   * @returns Promise resolving to array of transactions for the specified category
   */
  async getTransactionsByCategory(category: string): Promise<Transaction[]> {
    try {
      if (!category || typeof category !== 'string') {
        throw new ValidationError('Category must be a non-empty string');
      }

      const allTransactions = await this.storage.getAll();
      
      // Filter transactions that match the category (case-insensitive)
      const normalizedCategory = category.trim().toLowerCase();
      return allTransactions.filter(transaction => {
        return transaction.category.toLowerCase() === normalizedCategory;
      });
    } catch (error) {
      logError('TransactionService.getTransactionsByCategory', error);
      throw error;
    }
  }
}
