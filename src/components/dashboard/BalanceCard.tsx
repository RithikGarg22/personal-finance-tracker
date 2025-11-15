import { useState, useEffect } from 'react';
import type { TransactionService } from '../../services/transactionService';
import { CalculationService } from '../../services/calculationService';
import { formatCurrency } from '../../utils/formatters';

interface BalanceCardProps {
  transactionService: TransactionService;
}

export default function BalanceCard({ transactionService }: BalanceCardProps) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculationService = new CalculationService();

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all transactions
        const transactions = await transactionService.getAllTransactions();
        
        // Calculate total balance
        const totalBalance = calculationService.calculateTotalBalance(transactions);
        
        setBalance(totalBalance);
      } catch (err) {
        console.error('Error fetching balance:', err);
        setError('Failed to load balance');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [transactionService, calculationService]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Total Balance</h2>
      
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : (
        <p
          className={`text-2xl sm:text-3xl font-bold ${
            balance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {formatCurrency(balance)}
        </p>
      )}
    </div>
  );
}
