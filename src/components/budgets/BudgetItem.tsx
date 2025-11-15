import { useState } from 'react';
import type { BudgetWithRemaining } from '../../types';
import ConfirmDialog from '../common/ConfirmDialog';
import { formatCurrency } from '../../utils/formatters';
import { formatMonth } from '../../utils/dateUtils';

interface BudgetItemProps {
  budget: BudgetWithRemaining;
  onEdit: (budget: BudgetWithRemaining) => void;
  onDelete: (id: string) => void;
}

export default function BudgetItem({
  budget,
  onEdit,
  onDelete,
}: BudgetItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = () => {
    onEdit(budget);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(budget.id);
    setShowDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  // Calculate percentage spent
  const percentageSpent = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
  const isOverBudget = budget.remaining < 0;

  // Determine progress bar color
  let progressBarColor = 'bg-green-500';
  if (isOverBudget) {
    progressBarColor = 'bg-red-500';
  } else if (percentageSpent >= 90) {
    progressBarColor = 'bg-yellow-500';
  } else if (percentageSpent >= 75) {
    progressBarColor = 'bg-orange-500';
  }

  return (
    <>
      <div
        className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
          isOverBudget ? 'border-red-300' : 'border-gray-200'
        }`}
        role="article"
        aria-label={`Budget: ${budget.category} for ${formatMonth(budget.month)}`}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {budget.category}
              </h3>
              <p className="text-sm text-gray-500">
                {formatMonth(budget.month)}
              </p>
            </div>
            {isOverBudget && (
              <span
                className="flex-shrink-0 px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded"
                aria-label="Over budget"
              >
                Over Budget
              </span>
            )}
          </div>

          {/* Budget Details */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Limit</p>
              <p className="font-semibold text-gray-900">{formatCurrency(budget.limit)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Spent</p>
              <p className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                {formatCurrency(budget.spent)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Remaining</p>
              <p className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(budget.remaining)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Progress</span>
              <span className={`text-xs font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-700'}`}>
                {Math.min(percentageSpent, 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${progressBarColor}`}
                style={{ width: `${Math.min(percentageSpent, 100)}%` }}
                role="progressbar"
                aria-valuenow={Math.min(percentageSpent, 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${Math.min(percentageSpent, 100).toFixed(0)}% of budget spent`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleEdit}
              className="flex-1 px-4 py-2 min-h-[44px] text-blue-600 bg-blue-50 
                rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 
                focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              aria-label={`Edit ${budget.category} budget`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDeleteClick}
              className="flex-1 px-4 py-2 min-h-[44px] text-red-600 bg-red-50 
                rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 
                focus:ring-red-500 focus:ring-offset-2 transition-colors font-medium"
              aria-label={`Delete ${budget.category} budget`}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Budget"
        message={`Are you sure you want to delete the ${budget.category} budget for ${formatMonth(budget.month)}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
