import { useState } from 'react';
import ExportCSV from './ExportCSV';
import ImportCSV from './ImportCSV';
import { TransactionService } from '../../services/transactionService';
import { BudgetService } from '../../services/budgetService';
import { createTransactionStorage, createBudgetStorage } from '../../storage/indexeddb';

export default function Settings() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Initialize services
  const transactionService = new TransactionService(createTransactionStorage());
  const budgetService = new BudgetService(
    createBudgetStorage(),
    transactionService
  );

  const handleImportComplete = () => {
    // Trigger a refresh by updating the key
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your data import and export</p>
      </div>
      
      <div className="space-y-6 sm:space-y-8">
        {/* Export Section */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
          <ExportCSV 
            transactionService={transactionService}
            budgetService={budgetService}
          />
        </div>

        {/* Import Section */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
          <ImportCSV 
            key={refreshKey}
            transactionService={transactionService}
            budgetService={budgetService}
            onImportComplete={handleImportComplete}
          />
        </div>

        {/* Additional Information */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">About CSV Import/Export</h3>
          <ul className="text-xs sm:text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Export your data regularly to create backups</li>
            <li>CSV files can be opened in spreadsheet applications like Excel or Google Sheets</li>
            <li>When importing, make sure your CSV file matches the expected format</li>
            <li>Duplicate budgets (same month and category) will not be imported</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
