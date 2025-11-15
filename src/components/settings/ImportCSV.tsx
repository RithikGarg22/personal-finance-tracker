import { useState, useRef } from 'react';
import { TransactionService } from '../../services/transactionService';
import { BudgetService } from '../../services/budgetService';
import { parseTransactionsCSV, parseBudgetsCSV, CSVParseError } from '../../utils/csv';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import type { Transaction, Budget } from '../../types';

interface ImportCSVProps {
  transactionService: TransactionService;
  budgetService: BudgetService;
  onImportComplete?: () => void;
}

type ImportType = 'transactions' | 'budgets';

interface ParsedData {
  transactions?: Transaction[];
  budgets?: Budget[];
}

interface ImportError {
  row?: number;
  field?: string;
  message: string;
}

export default function ImportCSV({ transactionService, budgetService, onImportComplete }: ImportCSVProps) {
  const [importType, setImportType] = useState<ImportType>('transactions');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { announce } = useAccessibility();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset state
    setParsedData(null);
    setErrors([]);
    setImportResult(null);

    try {
      const content = await file.text();
      
      if (importType === 'transactions') {
        const transactions = parseTransactionsCSV(content);
        setParsedData({ transactions });
      } else {
        const budgets = parseBudgetsCSV(content);
        setParsedData({ budgets });
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      
      if (error instanceof CSVParseError) {
        setErrors([{
          row: error.row,
          field: error.field,
          message: error.message,
        }]);
      } else {
        setErrors([{
          message: error instanceof Error ? error.message : 'Failed to parse CSV file',
        }]);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!parsedData) return;

    setIsImporting(true);
    setErrors([]);
    setImportResult(null);

    let successCount = 0;
    let failedCount = 0;
    const importErrors: ImportError[] = [];

    try {
      if (parsedData.transactions) {
        // Import transactions
        for (let i = 0; i < parsedData.transactions.length; i++) {
          const transaction = parsedData.transactions[i];
          try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...transactionData } = transaction;
            await transactionService.addTransaction(transactionData);
            successCount++;
          } catch (error) {
            failedCount++;
            importErrors.push({
              row: i + 2, // +2 because row 1 is header and array is 0-indexed
              message: error instanceof Error ? error.message : 'Failed to import transaction',
            });
          }
        }
      } else if (parsedData.budgets) {
        // Import budgets
        for (let i = 0; i < parsedData.budgets.length; i++) {
          const budget = parsedData.budgets[i];
          try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...budgetData } = budget;
            await budgetService.addBudget(budgetData);
            successCount++;
          } catch (error) {
            failedCount++;
            importErrors.push({
              row: i + 2, // +2 because row 1 is header and array is 0-indexed
              message: error instanceof Error ? error.message : 'Failed to import budget',
            });
          }
        }
      }

      setImportResult({ success: successCount, failed: failedCount });
      setErrors(importErrors);

      // Announce import result
      if (failedCount === 0) {
        announce(`Successfully imported ${successCount} ${importType}`);
      } else {
        announce(`Import complete: ${successCount} succeeded, ${failedCount} failed`, 'assertive');
      }

      // Clear preview after successful import
      if (successCount > 0) {
        setParsedData(null);
        onImportComplete?.();
      }
    } catch (error) {
      console.error('Error during import:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to import data';
      setErrors([{
        message: errorMessage,
      }]);
      announce(errorMessage, 'assertive');
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    setParsedData(null);
    setErrors([]);
    setImportResult(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-2">Import Data</h2>
        <p className="text-gray-600 text-xs sm:text-sm mb-4">
          Upload CSV files to import transactions or budgets
        </p>
      </div>

      {/* Import Type Selection */}
      <fieldset className="flex gap-4">
        <legend className="sr-only">Select import type</legend>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="importType"
            value="transactions"
            checked={importType === 'transactions'}
            onChange={(e) => setImportType(e.target.value as ImportType)}
            disabled={!!parsedData || isImporting}
            className="mr-2 focus:ring-2 focus:ring-blue-500"
            aria-label="Import transactions"
          />
          <span>Transactions</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="importType"
            value="budgets"
            checked={importType === 'budgets'}
            onChange={(e) => setImportType(e.target.value as ImportType)}
            disabled={!!parsedData || isImporting}
            className="mr-2 focus:ring-2 focus:ring-blue-500"
            aria-label="Import budgets"
          />
          <span>Budgets</span>
        </label>
      </fieldset>

      {/* File Input */}
      {!parsedData && (
        <div>
          <label htmlFor="csv-file-input" className="sr-only">
            Select CSV file to import
          </label>
          <input
            id="csv-file-input"
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={isImporting}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4 file:min-h-[44px]
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed"
            aria-describedby="csv-format-hint"
          />
          <p id="csv-format-hint" className="text-xs text-gray-500 mt-2">
            {importType === 'transactions' 
              ? 'Expected format: date,amount,category,notes'
              : 'Expected format: month,category,limit'}
          </p>
        </div>
      )}

      {/* Preview */}
      {parsedData && !importResult && (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">Preview</h3>
          <p className="text-sm text-gray-600 mb-3">
            {parsedData.transactions 
              ? `${parsedData.transactions.length} transaction${parsedData.transactions.length === 1 ? '' : 's'} ready to import`
              : `${parsedData.budgets?.length} budget${parsedData.budgets?.length === 1 ? '' : 's'} ready to import`}
          </p>

          {/* Preview Table */}
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-200 sticky top-0">
                <tr>
                  {parsedData.transactions ? (
                    <>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Amount</th>
                      <th className="px-3 py-2 text-left">Category</th>
                      <th className="px-3 py-2 text-left">Notes</th>
                    </>
                  ) : (
                    <>
                      <th className="px-3 py-2 text-left">Month</th>
                      <th className="px-3 py-2 text-left">Category</th>
                      <th className="px-3 py-2 text-left">Limit</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {parsedData.transactions?.slice(0, 10).map((transaction, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-3 py-2">{transaction.date}</td>
                    <td className="px-3 py-2">${transaction.amount.toFixed(2)}</td>
                    <td className="px-3 py-2">{transaction.category}</td>
                    <td className="px-3 py-2 truncate max-w-xs">{transaction.notes || '-'}</td>
                  </tr>
                ))}
                {parsedData.budgets?.slice(0, 10).map((budget, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-3 py-2">{budget.month}</td>
                    <td className="px-3 py-2">{budget.category}</td>
                    <td className="px-3 py-2">${budget.limit.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {((parsedData.transactions && parsedData.transactions.length > 10) ||
            (parsedData.budgets && parsedData.budgets.length > 10)) && (
            <p className="text-xs text-gray-500 mt-2">
              Showing first 10 rows. All rows will be imported.
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="px-4 py-2 min-h-[44px] bg-green-600 text-white rounded-lg hover:bg-green-700 
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              aria-label="Confirm and import data"
            >
              {isImporting ? 'Importing...' : 'Confirm Import'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isImporting}
              className="px-4 py-2 min-h-[44px] bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 
                focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
              aria-label="Cancel import"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Import Result */}
      {importResult && (
        <div
          className={`p-4 rounded-lg ${
            importResult.failed === 0
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
          }`}
          role="alert"
        >
          <h3 className="font-semibold mb-1">Import Complete</h3>
          <p>
            Successfully imported: {importResult.success}
            {importResult.failed > 0 && ` | Failed: ${importResult.failed}`}
          </p>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="p-4 rounded-lg bg-red-100 text-red-800 border border-red-200">
          <h3 className="font-semibold mb-2">Errors</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {errors.map((error, index) => (
              <li key={index}>
                {error.row && `Row ${error.row}: `}
                {error.field && `${error.field} - `}
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
