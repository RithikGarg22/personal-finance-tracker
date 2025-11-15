import { useState, useEffect } from 'react';
import type { BudgetWithRemaining } from '../../types';
import { BudgetService } from '../../services/budgetService';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import BudgetItem from './BudgetItem';

interface BudgetListProps {
  budgetService: BudgetService;
  onEdit: (budget: BudgetWithRemaining) => void;
  refreshTrigger?: number;
}

export default function BudgetList({
  budgetService,
  onEdit,
  refreshTrigger = 0,
}: BudgetListProps) {
  const [budgets, setBudgets] = useState<BudgetWithRemaining[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { announce } = useAccessibility();

  // Fetch budgets with remaining amounts
  const fetchBudgets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await budgetService.getAllBudgetsWithRemaining();
      // Sort by month (newest first) and then by category
      const sorted = data.sort((a, b) => {
        const monthCompare = b.month.localeCompare(a.month);
        if (monthCompare !== 0) return monthCompare;
        return a.category.localeCompare(b.category);
      });
      setBudgets(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budgets');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount and when refresh trigger changes
  useEffect(() => {
    fetchBudgets();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    try {
      await budgetService.deleteBudget(id);
      announce('Budget deleted successfully');
      // Refresh the list
      await fetchBudgets();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete budget';
      setError(errorMessage);
      announce(errorMessage, 'assertive');
    }
  };

  const handleRetry = () => {
    fetchBudgets();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
            role="status"
          >
            <span className="sr-only">Loading budgets...</span>
          </div>
          <p className="mt-2 text-gray-600">Loading budgets...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="bg-red-50 border border-red-200 rounded-lg p-4"
        role="alert"
      >
        <div className="flex items-start gap-3">
          <span className="text-red-600 text-xl" aria-hidden="true">
            ⚠️
          </span>
          <div className="flex-1">
            <h3 className="text-red-800 font-semibold">Error Loading Budgets</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-3 px-4 py-2 min-h-[44px] text-red-700 bg-red-100 rounded-lg
                hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500
                focus:ring-offset-2 transition-colors font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (budgets.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-6xl mb-4" aria-hidden="true">
          💰
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Budgets Yet
        </h3>
        <p className="text-gray-600">
          Get started by creating your first budget
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      role="list"
      aria-label="Budget list"
    >
      {budgets.map((budget) => (
        <BudgetItem
          key={budget.id}
          budget={budget}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
