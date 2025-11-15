import { useState, useEffect, memo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TransactionService } from '../../services/transactionService';
import { CalculationService } from '../../services/calculationService';
import { formatCurrency } from '../../utils/formatters';

interface SpendingLineChartProps {
  transactionService: TransactionService;
}

function SpendingLineChart({ transactionService }: SpendingLineChartProps) {
  const [chartData, setChartData] = useState<Array<{ date: string; amount: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculationService = new CalculationService();
    
    const fetchSpendingData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all transactions
        const transactions = await transactionService.getAllTransactions();
        
        // Calculate spending over time (default to monthly grouping)
        const spendingOverTime = calculationService.calculateSpendingOverTime(
          transactions,
          'month'
        );
        
        setChartData(spendingOverTime);
      } catch (err) {
        console.error('Error fetching spending data:', err);
        setError('Failed to load spending data');
      } finally {
        setLoading(false);
      }
    };

    fetchSpendingData();
  }, [transactionService]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].payload.date}</p>
          <p className="text-gray-600">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">
        Spending Over Time
      </h2>
      
      {loading ? (
        <div className="flex items-center justify-center h-64 sm:h-80">
          <div className="animate-pulse">
            <div className="h-32 sm:h-48 w-full bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64 sm:h-80">
          <p className="text-gray-500 text-sm sm:text-base">No transaction data available</p>
        </div>
      ) : (
        <div className="w-full" style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height={400} aria-label="Line chart showing spending over time">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: '10px' }}
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '10px' }}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `$${value}`}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// Memoize component to optimize re-renders
export default memo(SpendingLineChart);
