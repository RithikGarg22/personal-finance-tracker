import type { Transaction, Budget, CategoryTotal, SpendingOverTime } from '../types';
import { logError } from '../utils/errorHandling';

/**
 * CalculationService provides business logic for financial calculations
 * All methods are pure functions that don't modify input data
 */
export class CalculationService {
  /**
   * Calculate total balance from all transactions
   * @param transactions - Array of all transactions
   * @returns Sum of all transaction amounts
   */
  calculateTotalBalance(transactions: Transaction[]): number {
    try {
      if (!Array.isArray(transactions)) {
        throw new Error('Transactions must be an array');
      }
      return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    } catch (error) {
      logError('CalculationService.calculateTotalBalance', error);
      return 0; // Return safe default on error
    }
  }

  /**
   * Calculate total spending for a specific month (expenses only)
   * @param transactions - Array of all transactions
   * @param month - Month in YYYY-MM format
   * @returns Sum of expense amounts (as positive number) for the specified month
   */
  calculateMonthlySpending(transactions: Transaction[], month: string): number {
    try {
      if (!Array.isArray(transactions)) {
        throw new Error('Transactions must be an array');
      }
      const monthTransactions = transactions.filter(
        t => t.date.startsWith(month) && t.amount < 0
      );
      // Return absolute value (positive) of expenses
      return Math.abs(monthTransactions.reduce((sum, transaction) => sum + transaction.amount, 0));
    } catch (error) {
      logError('CalculationService.calculateMonthlySpending', error);
      return 0; // Return safe default on error
    }
  }

  /**
   * Calculate total spending by category (expenses only)
   * @param transactions - Array of all transactions
   * @returns Array of category totals (as positive numbers) sorted by amount (descending)
   */
  calculateCategoryTotals(transactions: Transaction[]): CategoryTotal[] {
    try {
      if (!Array.isArray(transactions)) {
        throw new Error('Transactions must be an array');
      }
      
      const categoryMap = new Map<string, number>();
      
      // Only include expenses (negative amounts)
      transactions
        .filter(transaction => transaction.amount < 0)
        .forEach(transaction => {
          const current = categoryMap.get(transaction.category) || 0;
          // Store as positive value
          categoryMap.set(transaction.category, current + Math.abs(transaction.amount));
        });
      
      const totals: CategoryTotal[] = Array.from(categoryMap.entries()).map(([category, total]) => ({
        category,
        total,
      }));
      
      return totals.sort((a, b) => b.total - a.total);
    } catch (error) {
      logError('CalculationService.calculateCategoryTotals', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Calculate spending over time with grouping (expenses only)
   * @param transactions - Array of all transactions
   * @param groupBy - Time period to group by ('day', 'week', or 'month')
   * @returns Array of spending data points (as positive numbers) sorted by date
   */
  calculateSpendingOverTime(
    transactions: Transaction[],
    groupBy: 'day' | 'week' | 'month'
  ): SpendingOverTime[] {
    try {
      if (!Array.isArray(transactions)) {
        throw new Error('Transactions must be an array');
      }
      
      const spendingMap = new Map<string, number>();
      
      // Only include expenses (negative amounts)
      transactions
        .filter(transaction => transaction.amount < 0)
        .forEach(transaction => {
          const groupKey = this.getGroupKey(transaction.date, groupBy);
          const current = spendingMap.get(groupKey) || 0;
          // Store as positive value
          spendingMap.set(groupKey, current + Math.abs(transaction.amount));
        });
      
      const spendingData: SpendingOverTime[] = Array.from(spendingMap.entries()).map(([date, amount]) => ({
        date,
        amount,
      }));
      
      return spendingData.sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      logError('CalculationService.calculateSpendingOverTime', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Calculate remaining budget amount (expenses only)
   * @param budget - Budget to calculate remaining for
   * @param transactions - Array of all transactions
   * @returns Remaining budget (limit minus spending for that category and month)
   */
  calculateBudgetRemaining(budget: Budget, transactions: Transaction[]): number {
    try {
      if (!Array.isArray(transactions)) {
        throw new Error('Transactions must be an array');
      }
      
      // Only count expenses (negative amounts) for budget tracking
      const relevantTransactions = transactions.filter(
        t => t.date.startsWith(budget.month) && 
             t.category === budget.category && 
             t.amount < 0
      );
      
      // Calculate spent as positive value
      const spent = Math.abs(relevantTransactions.reduce((sum, transaction) => sum + transaction.amount, 0));
      return budget.limit - spent;
    } catch (error) {
      logError('CalculationService.calculateBudgetRemaining', error);
      return budget.limit; // Return full budget on error (safe default)
    }
  }

  /**
   * Helper method to get the group key for a date based on grouping type
   * @param date - ISO date string (YYYY-MM-DD)
   * @param groupBy - Grouping type
   * @returns Group key string
   */
  private getGroupKey(date: string, groupBy: 'day' | 'week' | 'month'): string {
    if (groupBy === 'day') {
      return date; // Already in YYYY-MM-DD format
    }
    
    if (groupBy === 'month') {
      return date.substring(0, 7); // YYYY-MM
    }
    
    // For week grouping, get the Monday of the week
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
    const monday = new Date(dateObj);
    monday.setDate(dateObj.getDate() + diff);
    
    return monday.toISOString().substring(0, 10); // YYYY-MM-DD of Monday
  }
}
