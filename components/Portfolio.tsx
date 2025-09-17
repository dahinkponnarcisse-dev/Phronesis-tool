import React, { useState } from 'react';
import { useClubData } from '../hooks/useClubData';
import Card from './common/Card';
import { PortfolioType, Holding } from '../types';

type PortfolioProps = ReturnType<typeof useClubData>;
type View = 'COMBINED' | PortfolioType;

const Portfolio: React.FC<PortfolioProps> = ({ portfolios, holdings: combinedHoldings }) => {
  const [view, setView] = useState<View>('COMBINED');

  const getHoldingsForView = (): Holding[] => {
    switch(view) {
      case PortfolioType.PHRONESIS:
        return portfolios[PortfolioType.PHRONESIS].holdings;
      case PortfolioType.FLAGSHIP:
        return portfolios[PortfolioType.FLAGSHIP].holdings;
      case 'COMBINED':
      default:
        return combinedHoldings;
    }
  };

  const currentHoldings = getHoldingsForView();

  const GainLoss: React.FC<{ value: number }> = ({ value }) => (
    <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
      {value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
    </span>
  );

  const GainLossPercent: React.FC<{ value: number }> = ({ value }) => (
    <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
      {value.toFixed(2)}%
    </span>
  );
  
  const handleExport = () => {
    const headers = ['Portfolio', 'Asset', 'Quantity', 'Avg. Cost', 'Current Price', 'Market Value', 'Unrealized P/L', 'P/L %'];
    const rows = currentHoldings.map(h => {
      const totalCost = h.averageCost * h.quantity;
      const plPercentage = totalCost > 0 ? (h.unrealizedGainLoss / totalCost) * 100 : 0;
      return [h.portfolio, h.asset, h.quantity, h.averageCost, h.currentPrice, h.marketValue, h.unrealizedGainLoss, plPercentage.toFixed(2)].join(',');
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `portfolio-${view.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const TabButton: React.FC<{ label: string; viewName: View }> = ({ label, viewName }) => (
      <button
        onClick={() => setView(viewName)}
        className={`px-4 py-2 text-sm font-medium rounded-md ${view === viewName ? 'bg-primary dark:bg-dark-primary text-white dark:text-gray-900' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
      >
        {label}
      </button>
  );

  return (
    <Card title="Portfolio Holdings">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
           <TabButton label="Combined" viewName="COMBINED" />
           <TabButton label="Phronesis" viewName={PortfolioType.PHRONESIS} />
           <TabButton label="FlagShip" viewName={PortfolioType.FLAGSHIP} />
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-dark-primary dark:hover:bg-dark-primary-hover dark:text-gray-900"
        >
          Export to CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {view === 'COMBINED' && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Portfolio</th>}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asset</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg. Cost</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Price</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Market Value</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unrealized P/L</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">P/L %</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
            {currentHoldings.map((holding) => {
              const totalCost = holding.averageCost * holding.quantity;
              const plPercentage = totalCost > 0 ? (holding.unrealizedGainLoss / totalCost) * 100 : 0;
              return (
              <tr key={holding.asset}>
                {view === 'COMBINED' && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">{holding.portfolio === PortfolioType.PHRONESIS ? 'Phronesis' : 'FlagShip'}</td>}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-text-primary">{holding.asset}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary text-right">{holding.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary text-right">{holding.averageCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary text-right">{holding.currentPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-dark-text-primary text-right">{holding.marketValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <GainLoss value={holding.unrealizedGainLoss} />
                </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <GainLossPercent value={plPercentage} />
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default Portfolio;