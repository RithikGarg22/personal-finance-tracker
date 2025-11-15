import { useState, useEffect, useMemo } from 'react';
import type { Transaction } from '../../types';
import { TransactionService } from '../../services/transactionService';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import TransactionItem from './TransactionItem';

interface TransactionListProps {
  transactionService: TransactionService;
  onEdit: (transaction: Transaction) => void;
  refreshTrigger?: number;
}

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'category';

export default function TransactionList({
  transactionService,
  onEdit,
  refreshTrigger = 0,
}: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const { announce } = useAccessibility();

  // Fetch transactions
  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await transactionService.getAllTransactions();
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount and when refresh trigger changes
  useEffect(() => {
    fetchTransactions();
  }, [refreshTrigger]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = new Set(transactions.map((t) => t.category));
    return Array.from(uniqueCategories).sort();
  }, [transactions]);

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // Apply category filter
    if (filterCategory) {
      result = result.filter(
        (t) => t.category.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return b.date.localeCompare(a.date);
        case 'date-asc':
          return a.date.localeCompare(b.date);
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return result;
  }, [transactions, sortBy, filterCategory]);

  const handleDelete = async (id: string) => {
    try {
      await transactionService.deleteTransaction(id);
      announce('Transaction deleted successfully');
      // Refresh the list
      await fetchTransactions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete transaction';
      setError(errorMessage);
      announce(errorMessage, 'assertive');
    }
  };

  const handleRetry = () => {
    fetchTransactions();
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
            <span className="sr-only">Loading transactions...</span>
          </div>
          <p className="mt-2 text-gray-600">Loading transactions...</p>
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
            <h3 className="text-red-800 font-semibold">Error Loading Transactions</h3>
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
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-6xl mb-4" aria-hidden="true">
          📊
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Transactions Yet
        </h3>
        <p className="text-gray-600">
          Get started by adding your first transaction
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        {/* Sort */}
        <div className="flex-1">
          <label
            htmlFor="sort-select"
            className="block text-sm font-medium text-gray-700 mb-1 sm:inline sm:mr-2"
          >
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            aria-label="Sort transactions"
          >
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="amount-desc">Amount (Highest First)</option>
            <option value="amount-asc">Amount (Lowest First)</option>
            <option value="category">Category (A-Z)</option>
          </select>
        </div>

        {/* Filter */}
        <div className="flex-1">
          <label
            htmlFor="category-filter"
            className="block text-sm font-medium text-gray-700 mb-1 sm:inline sm:mr-2"
          >
            Filter:
          </label>
          <select
            id="category-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          {filteredAndSortedTransactions.length} of {transactions.length} transactions
        </div>
      </div>

      {/* Transaction List */}
      {filteredAndSortedTransactions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            No transactions match the selected filter
          </p>
          <button
            type="button"
            onClick={() => setFilterCategory('')}
            className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear Filter
          </button>
        </div>
      ) : (
        <div
          className="space-y-3"
          role="list"
          aria-label="Transaction list"
        >
          {filteredAndSortedTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
