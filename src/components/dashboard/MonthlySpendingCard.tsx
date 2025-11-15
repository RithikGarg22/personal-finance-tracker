import { useState, useEffect } from 'react';
import type { TransactionService } from '../../services/transactionService';
import { CalculationService } from '../../services/calculationService';
import { formatCurrency } from '../../utils/formatters';
import { getCurrentMonth, formatMonth } from '../../utils/dateUtils';

interface MonthlySpendingCardProps {
  transactionService: TransactionService;
}

export default function MonthlySpendingCard({ transactionService }: MonthlySpendingCardProps) {
  const [spending, setSpending] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth] = useState(getCurrentMonth());

  const calculationService = new CalculationService();

  useEffect(() => {
    const fetchMonthlySpending = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch transactions for current month
        const transactions = await transactionService.getTransactionsByMonth(currentMonth);
        
        // Calculate monthly spending
        const monthlySpending = calculationService.calculateMonthlySpending(
          transactions,
          currentMonth
        );
        
        setSpending(monthlySpending);
      } catch (err) {
        console.error('Error fetching monthly spending:', err);
        setError('Failed to load monthly spending');
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlySpending();
  }, [transactionService, calculationService, currentMonth]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
        Monthly Spending
      </h2>
      <p className="text-xs sm:text-sm text-gray-500 mb-2">{formatMonth(currentMonth)}</p>
      
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : (
        <p
          className={`text-2xl sm:text-3xl font-bold ${
            spending >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {formatCurrency(spending)}
        </p>
      )}
    </div>
  );
}
