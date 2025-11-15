import { useState } from 'react';
import { TransactionService } from '../../services/transactionService';
import { BudgetService } from '../../services/budgetService';
import { generateTransactionsCSV, generateBudgetsCSV } from '../../utils/csv';
import { useAccessibility } from '../../contexts/AccessibilityContext';

interface ExportCSVProps {
  transactionService: TransactionService;
  budgetService: BudgetService;
}

export default function ExportCSV({ transactionService, budgetService }: ExportCSVProps) {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { announce } = useAccessibility();

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const handleExportTransactions = async () => {
    setIsExporting(true);
    setMessage(null);

    try {
      const transactions = await transactionService.getAllTransactions();
      
      if (transactions.length === 0) {
        setMessage({ type: 'error', text: 'No transactions to export' });
        return;
      }

      const csv = generateTransactionsCSV(transactions);
      const timestamp = new Date().toISOString().split('T')[0];
      downloadCSV(csv, `transactions-${timestamp}.csv`);
      
      const successMessage = `Successfully exported ${transactions.length} transaction${transactions.length === 1 ? '' : 's'}`;
      setMessage({ 
        type: 'success', 
        text: successMessage
      });
      announce(successMessage);
    } catch (error) {
      console.error('Error exporting transactions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to export transactions';
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
      announce(errorMessage, 'assertive');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportBudgets = async () => {
    setIsExporting(true);
    setMessage(null);

    try {
      const budgets = await budgetService.getAllBudgets();
      
      if (budgets.length === 0) {
        setMessage({ type: 'error', text: 'No budgets to export' });
        return;
      }

      const csv = generateBudgetsCSV(budgets);
      const timestamp = new Date().toISOString().split('T')[0];
      downloadCSV(csv, `budgets-${timestamp}.csv`);
      
      const successMessage = `Successfully exported ${budgets.length} budget${budgets.length === 1 ? '' : 's'}`;
      setMessage({ 
        type: 'success', 
        text: successMessage
      });
      announce(successMessage);
    } catch (error) {
      console.error('Error exporting budgets:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to export budgets';
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
      announce(errorMessage, 'assertive');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-2">Export Data</h2>
        <p className="text-gray-600 text-xs sm:text-sm mb-4">
          Download your data as CSV files for backup or use in other applications
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleExportTransactions}
          disabled={isExporting}
          className="px-4 py-2 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          aria-label="Export transactions to CSV file"
        >
          {isExporting ? 'Exporting...' : 'Export Transactions'}
        </button>

        <button
          onClick={handleExportBudgets}
          disabled={isExporting}
          className="px-4 py-2 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          aria-label="Export budgets to CSV file"
        >
          {isExporting ? 'Exporting...' : 'Export Budgets'}
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
