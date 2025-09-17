import React, { useState, useMemo } from 'react';
import Card from './common/Card';
import PortfolioValueChart from './charts/PortfolioValueChart';
import AllocationPieChart from './charts/AllocationPieChart';
import { useClubData } from '../hooks/useClubData';
import { PortfolioType, Holding } from '../types';
import PortfolioSplitChart from './charts/PortfolioSplitChart';

type DashboardProps = ReturnType<typeof useClubData>;
type View = 'GLOBAL' | PortfolioType;


const Dashboard: React.FC<DashboardProps> = ({ totalValue, shareValue, holdings, cash, performanceHistory, portfolios }) => {
    const [view, setView] = useState<View>('GLOBAL');

    const overallReturn = performanceHistory.length > 0 ? ((totalValue / performanceHistory[0].nav) - 1) * 100 : 0;
    const benchmarkReturn = performanceHistory.length > 1 ? ((performanceHistory[performanceHistory.length - 1].benchmark / performanceHistory[0].benchmark) - 1) * 100 : 0;
    const outperformance = overallReturn - benchmarkReturn;
    
    const phronesisValue = portfolios[PortfolioType.PHRONESIS].totalValue;
    const flagshipValue = portfolios[PortfolioType.FLAGSHIP].totalValue;

    const portfolioViewData = useMemo(() => {
        if (view === 'GLOBAL') return null;
        const portfolio = portfolios[view];
        return {
            name: view === PortfolioType.PHRONESIS ? 'Phronesis Portfolio' : 'FlagShip Portfolio',
            nav: portfolio.totalValue,
            cash: portfolio.cash,
            holdings: portfolio.holdings,
            color: view === PortfolioType.PHRONESIS ? 'text-blue-700 dark:text-blue-400' : 'text-teal-600 dark:text-teal-400',
        };
    }, [view, portfolios]);
    
    const TabButton: React.FC<{ label: string; viewName: View }> = ({ label, viewName }) => (
      <button
        onClick={() => setView(viewName)}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${view === viewName ? 'bg-primary dark:bg-dark-primary text-white dark:text-gray-900 shadow' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
      >
        {label}
      </button>
    );

  const GlobalView = () => (
     <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Total Club Value (NAV)">
          <p className="text-3xl font-bold text-primary dark:text-dark-primary">
            {totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </p>
        </Card>
        <Card title="Phronesis Portfolio NAV">
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
            {phronesisValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </p>
        </Card>
        <Card title="FlagShip Portfolio NAV">
          <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
            {flagshipValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </p>
        </Card>
       </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Value Per Share">
          <p className="text-3xl font-bold text-primary dark:text-dark-primary">
            {shareValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </p>
        </Card>
         <Card title="Overall Performance">
          <p className={`text-3xl font-bold ${overallReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {overallReturn.toFixed(2)}%
          </p>
          <p className={`text-sm mt-1 ${outperformance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {outperformance >= 0 ? 'Outperforming' : 'Underperforming'} by {Math.abs(outperformance).toFixed(2)}%
          </p>
          <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
            Benchmark: {benchmarkReturn.toFixed(2)}%
          </p>
        </Card>
        <Card title="Cash Balance (Total)">
          <p className="text-3xl font-bold text-primary dark:text-dark-primary">
            {cash.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </p>
           <div className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1 space-y-1">
             <p>Phronesis: {portfolios[PortfolioType.PHRONESIS].cash.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
             <p>FlagShip: {portfolios[PortfolioType.FLAGSHIP].cash.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card title="Global Performance vs. Benchmark (S&P 500)">
                <PortfolioValueChart data={performanceHistory} />
            </Card>
        </div>
        <div className="space-y-6">
           <Card title="Portfolio Split">
                <PortfolioSplitChart phronesisValue={phronesisValue} flagshipValue={flagshipValue} />
            </Card>
             <Card title="Combined Asset Allocation">
                <AllocationPieChart holdings={holdings} cash={cash} />
            </Card>
        </div>
      </div>
    </div>
  );

  const PortfolioView = () => {
    if (!portfolioViewData) return null;
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card title={`${portfolioViewData.name} NAV`}>
                    <p className={`text-3xl font-bold ${portfolioViewData.color}`}>
                        {portfolioViewData.nav.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                </Card>
                 <Card title="Cash Balance">
                    <p className={`text-3xl font-bold ${portfolioViewData.color}`}>
                        {portfolioViewData.cash.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                </Card>
                 <Card title="Number of Holdings">
                    <p className={`text-3xl font-bold ${portfolioViewData.color}`}>
                        {portfolioViewData.holdings.length}
                    </p>
                </Card>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card title="Global Club Performance vs. Benchmark (S&P 500)">
                        <PortfolioValueChart data={performanceHistory} />
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card title={`${portfolioViewData.name} Allocation`}>
                        <AllocationPieChart holdings={portfolioViewData.holdings} cash={portfolioViewData.cash} />
                    </Card>
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-6">
        <div className="flex space-x-2">
           <TabButton label="Global" viewName="GLOBAL" />
           <TabButton label="Phronesis Portfolio" viewName={PortfolioType.PHRONESIS} />
           <TabButton label="FlagShip Portfolio" viewName={PortfolioType.FLAGSHIP} />
        </div>

        {view === 'GLOBAL' ? <GlobalView /> : <PortfolioView />}
    </div>
  );
};

export default Dashboard;