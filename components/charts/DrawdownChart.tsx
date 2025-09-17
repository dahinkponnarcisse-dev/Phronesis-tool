import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DrawdownChartProps {
  data: { date: string; drawdown: number }[];
}

const DrawdownChart: React.FC<DrawdownChartProps> = ({ data }) => {
  
  const formatYAxis = (tickItem: number) => `${tickItem.toFixed(0)}%`;
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-dark-card p-2 border rounded shadow-lg dark:border-gray-600">
          <p className="font-bold">{label}</p>
          <p className="text-red-600">{`Drawdown: ${payload[0].value.toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatYAxis} domain={['auto', 0]}/>
          <Tooltip content={<CustomTooltip />} />
          <defs>
            <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="drawdown" stroke="#ef4444" fillOpacity={1} fill="url(#colorDrawdown)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DrawdownChart;