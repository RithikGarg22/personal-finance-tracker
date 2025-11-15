import { useState } from 'react';
import type { Transaction } from '../../types';
import ConfirmDialog from '../common/ConfirmDialog';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionItem({
  transaction,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = () => {
    onEdit(transaction);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(transaction.id);
    setShowDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  const isIncome = transaction.amount >= 0;
  const amountColorClass = isIncome ? 'text-green-600' : 'text-red-600';

  return (
    <>
      <div
        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        role="article"
        aria-label={`Transaction: ${transaction.category} on ${formatDate(transaction.date)}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Transaction Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {transaction.category}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatDate(transaction.date)}
                </p>
              </div>
              <div className={`text-lg font-bold ${amountColorClass} flex-shrink-0`}>
                {formatCurrency(transaction.amount)}
              </div>
            </div>
            {transaction.notes && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {transaction.notes}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:flex-shrink-0">
            <button
              type="button"
              onClick={handleEdit}
              className="px-4 py-2 min-h-[44px] min-w-[44px] text-blue-600 bg-blue-50 
                rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 
                focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              aria-label={`Edit ${transaction.category} transaction`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDeleteClick}
              className="px-4 py-2 min-h-[44px] min-w-[44px] text-red-600 bg-red-50 
                rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 
                focus:ring-red-500 focus:ring-offset-2 transition-colors font-medium"
              aria-label={`Delete ${transaction.category} transaction`}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Transaction"
        message={`Are you sure you want to delete this ${transaction.category} transaction for ${formatCurrency(transaction.amount)}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
