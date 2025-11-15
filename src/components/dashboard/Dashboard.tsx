import { useMemo } from 'react';
import { TransactionService } from '../../services/transactionService';
import { createTransactionStorage } from '../../storage/indexeddb';
import BalanceCard from './BalanceCard';
import MonthlySpendingCard from './MonthlySpendingCard';
import CategoryPieChart from './CategoryPieChart';
import SpendingLineChart from './SpendingLineChart';

export default function Dashboard() {
  // Create transaction service instance
  const transactionService = useMemo(() => {
    const storage = createTransactionStorage();
    return new TransactionService(storage);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of your financial activity
        </p>
      </div>

      {/* Summary Cards - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BalanceCard transactionService={transactionService} />
        <MonthlySpendingCard transactionService={transactionService} />
      </div>

      {/* Charts - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart transactionService={transactionService} />
        <SpendingLineChart transactionService={transactionService} />
      </div>
    </div>
  );
}
