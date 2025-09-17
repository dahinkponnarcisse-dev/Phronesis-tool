import React, { useMemo, useState, useCallback } from 'react';
import { useClubData } from '../hooks/useClubData';
import Card from './common/Card';
import AllocationPieChart from './charts/AllocationPieChart';
import { getPortfolioRiskAnalysis } from '../services/geminiService';
import { PortfolioType, Holding } from '../types';

type View = 'COMBINED' | PortfolioType;

const RiskManagement: React.FC<ReturnType<typeof useClubData>> = (props) => {
  const [view, setView] = useState<View>('COMBINED');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { holdings, cash, totalValue } = useMemo(() => {
    switch(view) {
      case PortfolioType.PHRONESIS:
        return {
          holdings: props.portfolios[PortfolioType.PHRONESIS].holdings,
          cash: props.portfolios[PortfolioType.PHRONESIS].cash,
          totalValue: props.portfolios[PortfolioType.PHRONESIS].totalValue
        };
      case PortfolioType.FLAGSHIP:
        return {
          holdings: props.portfolios[PortfolioType.FLAGSHIP].holdings,
          cash: props.portfolios[PortfolioType.FLAGSHIP].cash,
          totalValue: props.portfolios[PortfolioType.FLAGSHIP].totalValue
        };
      case 'COMBINED':
      default:
        return {
          holdings: props.holdings,
          cash: props.cash,
          totalValue: props.totalValue
        };
    }
  }, [view, props]);

  const concentration = useMemo(() => {
    if (!holdings || holdings.length === 0 || totalValue === 0) {
      return { top1: 0, top3: 0, top5: 0 };
    }
    const sortedHoldings = [...holdings].sort((a, b) => b.marketValue - a.marketValue);
    const top1 = sortedHoldings.slice(0, 1).reduce((sum, h) => sum + h.marketValue, 0);
    const top3 = sortedHoldings.slice(0, 3).reduce((sum, h) => sum + h.marketValue, 0);
    const top5 = sortedHoldings.slice(0, 5).reduce((sum, h) => sum + h.marketValue, 0);
    
    return {
      top1: (top1 / totalValue) * 100,
      top3: (top3 / totalValue) * 100,
      top5: (top5 / totalValue) * 100,
    };
  }, [holdings, totalValue]);
  
  const fetchRiskAnalysis = useCallback(async () => {
    if (holdings.length === 0) {
      setError('Selected portfolio is empty. Cannot generate analysis.');
      return;
    }
    setIsLoading(true);
    setError('');
    setAnalysis('');
    try {
      const result = await getPortfolioRiskAnalysis(holdings);
      setAnalysis(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to fetch analysis: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, [holdings]);
  
  const TabButton: React.FC<{ label: string; viewName: View }> = ({ label, viewName }) => (
      <button
        onClick={() => setView(viewName)}
        className={`px-4 py-2 text-sm font-medium rounded-md ${view === viewName ? 'bg-primary dark:bg-dark-primary text-white dark:text-gray-900' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
      >
        {label}
      </button>
  );

  const MetricBar: React.FC<{ label: string; percentage: number }> = ({ label, percentage }) => (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-text-primary dark:text-dark-text-primary">{label}</span>
        <span className="text-sm font-medium text-primary dark:text-dark-primary">{percentage.toFixed(2)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div className="bg-primary dark:bg-dark-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
       <div className="flex space-x-2">
           <TabButton label="Combined" viewName="COMBINED" />
           <TabButton label="Phronesis" viewName={PortfolioType.PHRONESIS} />
           <TabButton label="FlagShip" viewName={PortfolioType.FLAGSHIP} />
        </div>

      <Card title={`Portfolio Concentration (${view})`}>
        <div className="space-y-4">
          <MetricBar label="Top Holding" percentage={concentration.top1} />
          <MetricBar label="Top 3 Holdings" percentage={concentration.top3} />
          <MetricBar label="Top 5 Holdings" percentage={concentration.top5} />
        </div>
      </Card>

      <Card title={`Asset Allocation (${view})`}>
        <AllocationPieChart holdings={holdings} cash={cash} />
      </Card>
      
      <Card title={`AI Qualitative Risk Summary (${view})`}>
         <div className="space-y-4">
            <p className="text-text-secondary dark:text-dark-text-secondary">
              Generate a qualitative risk summary for the selected portfolio based on concentration and market factors.
            </p>
            <button
              onClick={fetchRiskAnalysis}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-dark-primary dark:hover:bg-dark-primary-hover dark:text-gray-900 disabled:bg-gray-400"
            >
              {isLoading ? 'Analyzing...' : 'Generate AI Summary'}
            </button>

            {error && <p className="text-red-600">{error}</p>}
            
            {analysis && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                    <p className="text-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap">{analysis}</p>
                </div>
            )}
        </div>
      </Card>
    </div>
  );
};

export default RiskManagement;