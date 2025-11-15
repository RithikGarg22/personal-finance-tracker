import { useState, useMemo } from 'react';
import type { Budget, BudgetWithRemaining } from '../../types';
import { BudgetService } from '../../services/budgetService';
import { TransactionService } from '../../services/transactionService';
import { createBudgetStorage, createTransactionStorage } from '../../storage/indexeddb';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import BudgetForm from './BudgetForm';
import BudgetList from './BudgetList';

export default function Budgets() {
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithRemaining | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { announce } = useAccessibility();

  // Create service instances
  const { budgetService, transactionService } = useMemo(() => {
    const budgetStorage = createBudgetStorage();
    const transactionStorage = createTransactionStorage();
    const txService = new TransactionService(transactionStorage);
    const bgService = new BudgetService(budgetStorage, txService);
    return { budgetService: bgService, transactionService: txService };
  }, []);

  // Get existing categories for form suggestions
  const [existingCategories, setExistingCategories] = useState<string[]>([]);

  // Load categories when form is shown
  const handleShowForm = async () => {
    try {
      const transactions = await transactionService.getAllTransactions();
      const categories = Array.from(new Set(transactions.map((t) => t.category))).sort();
      setExistingCategories(categories);
    } catch (error) {
      // If we can't load categories, just show empty form
      setExistingCategories([]);
    }
    setShowForm(true);
  };

  const handleAddBudget = () => {
    setEditingBudget(undefined);
    handleShowForm();
  };

  const handleEditBudget = (budget: BudgetWithRemaining) => {
    setEditingBudget(budget);
    handleShowForm();
  };

  const handleFormSubmit = async (data: Omit<Budget, 'id'>) => {
    try {
      if (editingBudget) {
        // Update existing budget
        await budgetService.updateBudget(editingBudget.id, data);
        announce('Budget updated successfully');
      } else {
        // Add new budget
        await budgetService.addBudget(data);
        announce('Budget added successfully');
      }

      // Close form and refresh list
      setShowForm(false);
      setEditingBudget(undefined);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      // Re-throw error to be handled by form
      throw error;
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingBudget(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Budgets
          </h1>
          <p className="text-gray-600 mt-1">
            Set spending limits and track your progress
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={handleAddBudget}
            className="px-6 py-3 min-h-[44px] text-white bg-blue-600 rounded-lg
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
              focus:ring-offset-2 transition-colors font-medium shadow-sm
              flex items-center justify-center gap-2"
            aria-label="Add new budget"
          >
            <span className="text-xl" aria-hidden="true">+</span>
            Add Budget
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <BudgetForm
          budget={editingBudget}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          existingCategories={existingCategories}
        />
      )}

      {/* Budget List */}
      <BudgetList
        budgetService={budgetService}
        onEdit={handleEditBudget}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
