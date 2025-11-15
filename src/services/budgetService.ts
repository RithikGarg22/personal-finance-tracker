/**
 * BudgetService handles business logic for budget management
 * Provides validation, duplicate prevention, and coordination between UI and storage layer
 */

import type { Budget, BudgetWithRemaining, StorageAdapter } from '../types';
import { TransactionService } from './transactionService';
import { CalculationService } from './calculationService';
import { ValidationError, logError } from '../utils/errorHandling';

/**
 * BudgetService class encapsulates all budget-related operations
 */
export class BudgetService {
  private budgetStorage: StorageAdapter<Budget>;
  private transactionService: TransactionService;
  private calculationService: CalculationService;

  constructor(
    budgetStorage: StorageAdapter<Budget>,
    transactionService: TransactionService
  ) {
    this.budgetStorage = budgetStorage;
    this.transactionService = transactionService;
    this.calculationService = new CalculationService();
  }

  /**
   * Validate budget data
   * @throws ValidationError if validation fails
   */
  private validateBudgetData(data: Omit<Budget, 'id'>): void {
    // Validate month
    if (!data.month || typeof data.month !== 'string') {
      throw new ValidationError('Month is required and must be a string');
    }

    // Validate month format (YYYY-MM)
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(data.month)) {
      throw new ValidationError('Month must be in YYYY-MM format');
    }

    // Validate that the month is a valid date
    const monthDate = new Date(data.month + '-01');
    if (isNaN(monthDate.getTime())) {
      throw new ValidationError('Month must be a valid month');
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

    // Validate limit
    if (data.limit === undefined || data.limit === null) {
      throw new ValidationError('Limit is required');
    }

    if (typeof data.limit !== 'number') {
      throw new ValidationError('Limit must be a number');
    }

    if (!isFinite(data.limit)) {
      throw new ValidationError('Limit must be a finite number');
    }

    if (data.limit <= 0) {
      throw new ValidationError('Limit must be a positive number');
    }
  }

  /**
   * Check if a budget already exists for the given month and category
   * @param month - Month in YYYY-MM format
   * @param category - Category name
   * @param excludeId - Optional budget ID to exclude from the check (for updates)
   * @returns Promise resolving to true if duplicate exists, false otherwise
   */
  private async isDuplicateBudget(
    month: string,
    category: string,
    excludeId?: string
  ): Promise<boolean> {
    const allBudgets = await this.budgetStorage.getAll();
    const normalizedCategory = category.trim().toLowerCase();
    
    return allBudgets.some(budget => {
      if (excludeId && budget.id === excludeId) {
        return false; // Exclude the budget being updated
      }
      return (
        budget.month === month &&
        budget.category.toLowerCase() === normalizedCategory
      );
    });
  }

  /**
   * Add a new budget
   * @param data - Budget data without id
   * @returns Promise resolving to the created budget
   * @throws ValidationError if validation fails or duplicate exists
   */
  async addBudget(data: Omit<Budget, 'id'>): Promise<Budget> {
    try {
      // Validate input data
      this.validateBudgetData(data);

      // Trim category
      const sanitizedData = {
        ...data,
        category: data.category.trim(),
      };

      // Check for duplicate
      const isDuplicate = await this.isDuplicateBudget(
        sanitizedData.month,
        sanitizedData.category
      );

      if (isDuplicate) {
        throw new ValidationError(
          `A budget for ${sanitizedData.category} in ${sanitizedData.month} already exists`
        );
      }

      // Add to storage
      const id = await this.budgetStorage.add(sanitizedData);

      // Return the created budget
      return {
        id,
        ...sanitizedData,
      };
    } catch (error) {
      logError('BudgetService.addBudget', error);
      throw error;
    }
  }

  /**
   * Update an existing budget
   * @param id - Budget id
   * @param data - Partial budget data to update
   * @throws ValidationError if validation fails or duplicate would be created
   */
  async updateBudget(id: string, data: Partial<Omit<Budget, 'id'>>): Promise<void> {
    try {
      // Validate that we have data to update
      if (!data || Object.keys(data).length === 0) {
        throw new ValidationError('No data provided for update');
      }

      // Get the existing budget
      const existing = await this.budgetStorage.getById(id);
      if (!existing) {
        throw new Error(`Budget with id ${id} not found`);
      }

      // Merge existing data with updates for validation
      const mergedData = {
        month: data.month ?? existing.month,
        category: data.category ?? existing.category,
        limit: data.limit ?? existing.limit,
      };

      // Validate the merged data
      this.validateBudgetData(mergedData);

      // Check for duplicate if month or category is being changed
      if (data.month !== undefined || data.category !== undefined) {
        const isDuplicate = await this.isDuplicateBudget(
          mergedData.month,
          mergedData.category,
          id
        );

        if (isDuplicate) {
          throw new ValidationError(
            `A budget for ${mergedData.category} in ${mergedData.month} already exists`
          );
        }
      }

      // Sanitize the update data
      const sanitizedData: Partial<Budget> = {};
      if (data.month !== undefined) {
        sanitizedData.month = data.month;
      }
      if (data.category !== undefined) {
        sanitizedData.category = data.category.trim();
      }
      if (data.limit !== undefined) {
        sanitizedData.limit = data.limit;
      }

      // Update in storage
      await this.budgetStorage.update(id, sanitizedData);
    } catch (error) {
      logError('BudgetService.updateBudget', error);
      throw error;
    }
  }

  /**
   * Delete a budget
   * @param id - Budget id
   */
  async deleteBudget(id: string): Promise<void> {
    try {
      await this.budgetStorage.delete(id);
    } catch (error) {
      logError('BudgetService.deleteBudget', error);
      throw error;
    }
  }

  /**
   * Get all budgets
   * @returns Promise resolving to array of all budgets
   */
  async getAllBudgets(): Promise<Budget[]> {
    try {
      return await this.budgetStorage.getAll();
    } catch (error) {
      logError('BudgetService.getAllBudgets', error);
      throw error;
    }
  }

  /**
   * Get a budget with calculated remaining amount
   * @param id - Budget id
   * @returns Promise resolving to budget with remaining amount
   */
  async getBudgetWithRemaining(id: string): Promise<BudgetWithRemaining> {
    try {
      const budget = await this.budgetStorage.getById(id);
      
      if (!budget) {
        throw new Error(`Budget with id ${id} not found`);
      }

      // Get all transactions to calculate spending
      const allTransactions = await this.transactionService.getAllTransactions();
      
      // Calculate remaining using CalculationService
      const remaining = this.calculationService.calculateBudgetRemaining(
        budget,
        allTransactions
      );
      
      const spent = budget.limit - remaining;

      return {
        ...budget,
        spent,
        remaining,
      };
    } catch (error) {
      logError('BudgetService.getBudgetWithRemaining', error);
      throw error;
    }
  }

  /**
   * Get all budgets with calculated remaining amounts
   * @returns Promise resolving to array of budgets with remaining amounts
   */
  async getAllBudgetsWithRemaining(): Promise<BudgetWithRemaining[]> {
    try {
      const allBudgets = await this.budgetStorage.getAll();
      const allTransactions = await this.transactionService.getAllTransactions();

      return allBudgets.map(budget => {
        const remaining = this.calculationService.calculateBudgetRemaining(
          budget,
          allTransactions
        );
        const spent = budget.limit - remaining;

        return {
          ...budget,
          spent,
          remaining,
        };
      });
    } catch (error) {
      logError('BudgetService.getAllBudgetsWithRemaining', error);
      throw error;
    }
  }
}
