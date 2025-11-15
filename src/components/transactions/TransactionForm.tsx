import { useState, useEffect, useRef } from 'react';
import type { Transaction } from '../../types';
import { getUserFriendlyErrorMessage } from '../../utils/errorHandling';

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (data: Omit<Transaction, 'id'>) => Promise<void>;
  onCancel: () => void;
  existingCategories?: string[];
}

export default function TransactionForm({
  transaction,
  onSubmit,
  onCancel,
  existingCategories = [],
}: TransactionFormProps) {
  const [date, setDate] = useState(transaction?.date || '');
  const [type, setType] = useState<'income' | 'expense'>(
    transaction?.amount && transaction.amount > 0 ? 'income' : 'expense'
  );
  const [amount, setAmount] = useState(
    transaction?.amount ? Math.abs(transaction.amount).toString() : ''
  );
  const [category, setCategory] = useState(transaction?.category || '');
  const [notes, setNotes] = useState(transaction?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dateInputRef = useRef<HTMLInputElement>(null);

  // Focus on date input when form opens
  useEffect(() => {
    dateInputRef.current?.focus();
  }, []);

  // Set default date to today if adding new transaction
  useEffect(() => {
    if (!transaction && !date) {
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
    }
  }, [transaction, date]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate date
    if (!date) {
      newErrors.date = 'Date is required';
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        newErrors.date = 'Date must be in YYYY-MM-DD format';
      } else {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          newErrors.date = 'Please enter a valid date';
        }
      }
    }

    // Validate amount
    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum)) {
        newErrors.amount = 'Amount must be a valid number';
      } else if (!isFinite(amountNum)) {
        newErrors.amount = 'Amount must be a finite number';
      }
    }

    // Validate category
    if (!category) {
      newErrors.category = 'Category is required';
    } else if (category.trim().length === 0) {
      newErrors.category = 'Category cannot be empty';
    } else if (category.length > 50) {
      newErrors.category = 'Category must not exceed 50 characters';
    }

    // Validate notes (optional)
    if (notes && notes.length > 500) {
      newErrors.notes = 'Notes must not exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const finalAmount = parseFloat(amount) * (type === 'expense' ? -1 : 1);
      await onSubmit({
        date,
        amount: finalAmount,
        category: category.trim(),
        notes: notes.trim() || undefined,
      });
    } catch (error) {
      // Handle validation errors from service with user-friendly messages
      const errorMessage = getUserFriendlyErrorMessage(error);
      setErrors({ submit: errorMessage });
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    onCancel();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-4"
      noValidate
    >
      <h2 className="text-xl font-semibold text-gray-900">
        {transaction ? 'Edit Transaction' : 'Add Transaction'}
      </h2>

      {/* Type Field */}
      <div>
        <label
          htmlFor="transaction-type"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Type <span className="text-red-500" aria-label="required">*</span>
        </label>
        <select
          id="transaction-type"
          value={type}
          onChange={(e) => setType(e.target.value as 'income' | 'expense')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      {/* Date Field */}
      <div>
        <label
          htmlFor="transaction-date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Date <span className="text-red-500" aria-label="required">*</span>
        </label>
        <input
          ref={dateInputRef}
          type="date"
          id="transaction-date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
            ${errors.date 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
            }`}
          aria-invalid={!!errors.date}
          aria-describedby={errors.date ? 'date-error' : undefined}
          required
        />
        {errors.date && (
          <p
            id="date-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.date}
          </p>
        )}
      </div>

      {/* Amount Field */}
      <div>
        <label
          htmlFor="transaction-amount"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Amount <span className="text-red-500" aria-label="required">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-500">$</span>
          <input
            type="number"
            id="transaction-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            placeholder="0.00"
            className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
              ${errors.amount 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
              }`}
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? 'amount-error amount-help' : 'amount-help'}
            required
          />
        </div>
        <p id="amount-help" className="mt-1 text-xs text-gray-500">
          {type === 'income' ? 'Amount will be added to balance' : 'Amount will be deducted from balance'}
        </p>
        {errors.amount && (
          <p
            id="amount-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.amount}
          </p>
        )}
      </div>

      {/* Category Field */}
      <div>
        <label
          htmlFor="transaction-category"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category <span className="text-red-500" aria-label="required">*</span>
        </label>
        {existingCategories.length > 0 ? (
          <>
            <input
              type="text"
              id="transaction-category"
              list="category-suggestions"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              maxLength={50}
              placeholder="Select or enter a category"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
                ${errors.category 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
                }`}
              aria-invalid={!!errors.category}
              aria-describedby={errors.category ? 'category-error' : undefined}
              required
            />
            <datalist id="category-suggestions">
              {existingCategories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </>
        ) : (
          <input
            type="text"
            id="transaction-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            maxLength={50}
            placeholder="e.g., Groceries, Entertainment, Salary"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
              ${errors.category 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
              }`}
            aria-invalid={!!errors.category}
            aria-describedby={errors.category ? 'category-error' : undefined}
            required
          />
        )}
        {errors.category && (
          <p
            id="category-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.category}
          </p>
        )}
      </div>

      {/* Notes Field */}
      <div>
        <label
          htmlFor="transaction-notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Notes <span className="text-gray-500 text-xs">(optional)</span>
        </label>
        <textarea
          id="transaction-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Add any additional details..."
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none
            ${errors.notes 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
            }`}
          aria-invalid={!!errors.notes}
          aria-describedby={errors.notes ? 'notes-error notes-count' : 'notes-count'}
        />
        <div className="flex justify-between items-center mt-1">
          <div>
            {errors.notes && (
              <p
                id="notes-error"
                className="text-sm text-red-600"
                role="alert"
              >
                {errors.notes}
              </p>
            )}
          </div>
          <p id="notes-count" className="text-xs text-gray-500">
            {notes.length}/500
          </p>
        </div>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div
          className="p-3 bg-red-50 border border-red-200 rounded-lg"
          role="alert"
        >
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="px-4 py-2 min-h-[44px] text-gray-700 bg-gray-100 rounded-lg
            hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500
            focus:ring-offset-2 transition-colors font-medium disabled:opacity-50
            disabled:cursor-not-allowed"
          aria-label="Cancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 min-h-[44px] text-white bg-blue-600 rounded-lg
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
            focus:ring-offset-2 transition-colors font-medium disabled:opacity-50
            disabled:cursor-not-allowed"
          aria-label={transaction ? 'Update transaction' : 'Add transaction'}
        >
          {isSubmitting ? 'Saving...' : transaction ? 'Update' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
}
