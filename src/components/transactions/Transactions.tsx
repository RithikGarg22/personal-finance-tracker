import { useState, useMemo } from 'react';
import type { Transaction } from '../../types';
import { TransactionService } from '../../services/transactionService';
import { createTransactionStorage } from '../../storage/indexeddb';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';

export default function Transactions() {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { announce } = useAccessibility();

  // Create transaction service instance
  const transactionService = useMemo(() => {
    const storage = createTransactionStorage();
    return new TransactionService(storage);
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

  const handleAddTransaction = () => {
    setEditingTransaction(undefined);
    handleShowForm();
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    handleShowForm();
  };

  const handleFormSubmit = async (data: Omit<Transaction, 'id'>) => {
    try {
      if (editingTransaction) {
        // Update existing transaction
        await transactionService.updateTransaction(editingTransaction.id, data);
        announce('Transaction updated successfully');
      } else {
        // Add new transaction
        await transactionService.addTransaction(data);
        announce('Transaction added successfully');
      }

      // Close form and refresh list
      setShowForm(false);
      setEditingTransaction(undefined);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      // Re-throw error to be handled by form
      throw error;
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTransaction(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Transactions
          </h1>
          <p className="text-gray-600 mt-1">
            Track your income and expenses
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={handleAddTransaction}
            className="px-6 py-3 min-h-[44px] text-white bg-blue-600 rounded-lg
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
              focus:ring-offset-2 transition-colors font-medium shadow-sm
              flex items-center justify-center gap-2"
            aria-label="Add new transaction"
          >
            <span className="text-xl" aria-hidden="true">+</span>
            Add Transaction
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          existingCategories={existingCategories}
        />
      )}

      {/* Transaction List */}
      <TransactionList
        transactionService={transactionService}
        onEdit={handleEditTransaction}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
