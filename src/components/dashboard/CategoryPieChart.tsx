import { useState, useEffect, memo } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import type { TransactionService } from '../../services/transactionService';
import { CalculationService } from '../../services/calculationService';
import { formatCurrency } from '../../utils/formatters';

interface CategoryPieChartProps {
  transactionService: TransactionService;
}

// Color palette for different categories
const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#6366f1', // indigo
];

function CategoryPieChart({ transactionService }: CategoryPieChartProps) {
  const [chartData, setChartData] = useState<Array<{ name: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculationService = new CalculationService();
    
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all transactions
        const transactions = await transactionService.getAllTransactions();
        
        // Calculate category totals
        const categoryTotals = calculationService.calculateCategoryTotals(transactions);
        
        // Transform data for Recharts (use absolute values for pie chart)
        const data = categoryTotals.map(ct => ({
          name: ct.category,
          value: Math.abs(ct.total),
        }));
        
        setChartData(data);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Failed to load category data');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [transactionService]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-gray-600">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">
        Spending by Category
      </h2>
      
      {loading ? (
        <div className="flex items-center justify-center h-64 sm:h-80">
          <div className="animate-pulse">
            <div className="h-32 w-32 sm:h-48 sm:w-48 bg-gray-200 rounded-full"></div>
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
          <ResponsiveContainer width="100%" height={400} aria-label="Pie chart showing spending by category">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius="60%"
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value, legendEntry: any) => (
                  <span className="text-xs sm:text-sm">
                    {value}: {formatCurrency(legendEntry.payload.value)}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// Memoize component to optimize re-renders
export default memo(CategoryPieChart);
