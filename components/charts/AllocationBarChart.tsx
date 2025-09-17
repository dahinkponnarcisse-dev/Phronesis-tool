import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BarChartData {
    name: string;
    value: number;
}

interface AllocationBarChartProps {
    data: BarChartData[];
    title: string;
}

const COLORS = ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

const AllocationBarChart: React.FC<AllocationBarChartProps> = ({ data, title }) => {
    
    const formatYAxis = (tickItem: string) => {
        return tickItem.length > 10 ? `${tickItem.substring(0, 10)}...` : tickItem;
    }
    
    return (
        <div>
            <h4 className="text-md font-semibold text-text-secondary dark:text-dark-text-secondary mb-2 text-center">{title}</h4>
            <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" unit="%" />
                        <YAxis type="category" dataKey="name" width={80} tickFormatter={formatYAxis} />
                        <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                        <Bar dataKey="value" fill="#8884d8">
                             {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AllocationBarChart;
