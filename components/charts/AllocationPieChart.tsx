
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Holding } from '../../types';

interface AllocationPieChartProps {
  holdings: Holding[];
  cash: number;
}

const COLORS = ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

const AllocationPieChart: React.FC<AllocationPieChartProps> = ({ holdings, cash }) => {
  const data = [
    ...holdings.map(h => ({ name: h.asset, value: h.marketValue })),
    { name: 'Cash', value: cash }
  ].filter(d => d.value > 0);

  const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0) + cash;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percent = totalValue > 0 ? ((payload[0].value / totalValue) * 100).toFixed(2) : 0;
      return (
        <div className="bg-white dark:bg-dark-card p-2 border rounded shadow-lg dark:border-gray-600">
          <p className="font-bold">{`${payload[0].name}: ${payload[0].value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} (${percent}%)`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AllocationPieChart;