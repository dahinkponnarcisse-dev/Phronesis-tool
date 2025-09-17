import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PortfolioType } from '../../types';

interface PortfolioSplitChartProps {
  phronesisValue: number;
  flagshipValue: number;
}

const COLORS = {
  [PortfolioType.PHRONESIS]: '#3b82f6', // blue
  [PortfolioType.FLAGSHIP]: '#14b8a6', // teal
};

const PortfolioSplitChart: React.FC<PortfolioSplitChartProps> = ({ phronesisValue, flagshipValue }) => {
  const data = [
    { name: 'Phronesis', value: phronesisValue },
    { name: 'FlagShip', value: flagshipValue }
  ].filter(d => d.value > 0);

  const totalValue = phronesisValue + flagshipValue;

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
    <div style={{ width: '100%', height: 150 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            <Cell key={`cell-phronesis`} fill={COLORS[PortfolioType.PHRONESIS]} />
            <Cell key={`cell-flagship`} fill={COLORS[PortfolioType.FLAGSHIP]} />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioSplitChart;