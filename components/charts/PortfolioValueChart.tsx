
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PerformanceDataPoint } from '../../types';

interface PortfolioValueChartProps {
  data: PerformanceDataPoint[];
}

const PortfolioValueChart: React.FC<PortfolioValueChartProps> = ({ data }) => {
    
  const formattedData = data.map(d => ({
      ...d,
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      'Club NAV': d.nav,
      'Benchmark': d.benchmark
  }));

  const formatYAxis = (tickItem: number) => `$${(tickItem / 1000)}k`;

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={formattedData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatYAxis} />
          <Tooltip formatter={(value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
          <Legend />
          <Line type="monotone" dataKey="Club NAV" stroke="#1e3a8a" strokeWidth={2} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="Benchmark" stroke="#10b981" strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioValueChart;
