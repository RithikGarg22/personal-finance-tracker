import { useState, useEffect, useRef } from 'react';
import type { Budget } from '../../types';
import { getUserFriendlyErrorMessage } from '../../utils/errorHandling';

interface BudgetFormProps {
  budget?: Budget;
  onSubmit: (data: Omit<Budget, 'id'>) => Promise<void>;
  onCancel: () => void;
  existingCategories?: string[];
}

export default function BudgetForm({
  budget,
  onSubmit,
  onCancel,
  existingCategories = [],
}: BudgetFormProps) {
  const [month, setMonth] = useState(budget?.month || '');
  const [category, setCategory] = useState(budget?.category || '');
  const [limit, setLimit] = useState(budget?.limit?.toString() || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const monthInputRef = useRef<HTMLInputElement>(null);

  // Focus on month input when form opens
  useEffect(() => {
    monthInputRef.current?.focus();
  }, []);

  // Set default month to current month if adding new budget
  useEffect(() => {
    if (!budget && !month) {
      const today = new Date();
      const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      setMonth(currentMonth);
    }
  }, [budget, month]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate month
    if (!month) {
      newErrors.month = 'Month is required';
    } else {
      const monthRegex = /^\d{4}-\d{2}$/;
      if (!monthRegex.test(month)) {
        newErrors.month = 'Month must be in YYYY-MM format';
      } else {
        const [year, monthNum] = month.split('-').map(Number);
        if (year <= 0 || monthNum < 1 || monthNum > 12) {
          newErrors.month = 'Please enter a valid month';
        }
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

    // Validate limit
    if (!limit) {
      newErrors.limit = 'Limit is required';
    } else {
      const limitNum = parseFloat(limit);
      if (isNaN(limitNum)) {
        newErrors.limit = 'Limit must be a valid number';
      } else if (!isFinite(limitNum)) {
        newErrors.limit = 'Limit must be a finite number';
      } else if (limitNum <= 0) {
        newErrors.limit = 'Limit must be a positive number';
      }
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
      await onSubmit({
        month,
        category: category.trim(),
        limit: parseFloat(limit),
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
        {budget ? 'Edit Budget' : 'Add Budget'}
      </h2>

      {/* Month Field */}
      <div>
        <label
          htmlFor="budget-month"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Month <span className="text-red-500" aria-label="required">*</span>
        </label>
        <input
          ref={monthInputRef}
          type="month"
          id="budget-month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
            ${errors.month 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
            }`}
          aria-invalid={!!errors.month}
          aria-describedby={errors.month ? 'month-error' : undefined}
          required
        />
        {errors.month && (
          <p
            id="month-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.month}
          </p>
        )}
      </div>

      {/* Category Field */}
      <div>
        <label
          htmlFor="budget-category"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category <span className="text-red-500" aria-label="required">*</span>
        </label>
        {existingCategories.length > 0 ? (
          <>
            <input
              type="text"
              id="budget-category"
              list="budget-category-suggestions"
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
            <datalist id="budget-category-suggestions">
              {existingCategories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </>
        ) : (
          <input
            type="text"
            id="budget-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            maxLength={50}
            placeholder="e.g., Groceries, Entertainment, Utilities"
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

      {/* Limit Field */}
      <div>
        <label
          htmlFor="budget-limit"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Limit <span className="text-red-500" aria-label="required">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-500">$</span>
          <input
            type="number"
            id="budget-limit"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            step="0.01"
            min="0.01"
            placeholder="0.00"
            className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
              ${errors.limit 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
              }`}
            aria-invalid={!!errors.limit}
            aria-describedby={errors.limit ? 'limit-error limit-help' : 'limit-help'}
            required
          />
        </div>
        <p id="limit-help" className="mt-1 text-xs text-gray-500">
          Maximum amount you want to spend in this category for the month
        </p>
        {errors.limit && (
          <p
            id="limit-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.limit}
          </p>
        )}
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
          aria-label={budget ? 'Update budget' : 'Add budget'}
        >
          {isSubmitting ? 'Saving...' : budget ? 'Update' : 'Add Budget'}
        </button>
      </div>
    </form>
  );
}
