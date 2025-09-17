import React, { useState, useMemo } from 'react';
import { useClubData } from '../hooks/useClubData';
import Card from './common/Card';
import { Holding, PortfolioType } from '../types';

type Scenario = 'market_downturn' | 'stock_crash' | 'interest_rate_hike' | 'inflation_spike' | 'tech_sector_boom' | 'energy_sector_crash';
type View = 'COMBINED' | PortfolioType;

const TECH_STOCKS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'NVDA', 'META'];
const ENERGY_STOCKS = ['XOM', 'CVX', 'SHEL'];

const getSector = (ticker: string) => {
  if (TECH_STOCKS.includes(ticker.toUpperCase())) return 'Tech';
  if (ENERGY_STOCKS.includes(ticker.toUpperCase())) return 'Energy';
  return 'Other';
};

const StressTest: React.FC<ReturnType<typeof useClubData>> = (props) => {
  const [view, setView] = useState<View>('COMBINED');
  const [scenario, setScenario] = useState<Scenario>('market_downturn');
  const [percentage, setPercentage] = useState<number>(-20);
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [result, setResult] = useState<{ newTotalValue: number; loss: number } | null>(null);

  const { holdings, totalValue } = useMemo(() => {
    switch(view) {
      case PortfolioType.PHRONESIS:
        return {
          holdings: props.portfolios[PortfolioType.PHRONESIS].holdings,
          totalValue: props.portfolios[PortfolioType.PHRONESIS].totalValue
        };
      case PortfolioType.FLAGSHIP:
         return {
          holdings: props.portfolios[PortfolioType.FLAGSHIP].holdings,
          totalValue: props.portfolios[PortfolioType.FLAGSHIP].totalValue
        };
      case 'COMBINED':
      default:
        return {
          holdings: props.holdings,
          totalValue: props.totalValue
        };
    }
  }, [view, props]);
  
  React.useEffect(() => {
      setSelectedAsset(holdings[0]?.asset || '');
      setResult(null); // Reset result when view changes
  }, [holdings]);


  const handleRunTest = () => {
    let loss = 0;
    
    switch(scenario) {
      case 'market_downturn':
      case 'inflation_spike': {
        const portfolioValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
        loss = portfolioValue * (percentage / 100);
        break;
      }
      case 'stock_crash': {
        if (selectedAsset) {
            const holding = holdings.find(h => h.asset === selectedAsset);
            if (holding) loss = holding.marketValue * (percentage / 100);
        }
        break;
      }
      case 'interest_rate_hike': {
        loss = holdings.reduce((currentLoss, h) => {
          const impactPercentage = getSector(h.asset) === 'Tech' ? percentage : percentage / 2;
          return currentLoss + h.marketValue * (impactPercentage / 100);
        }, 0);
        break;
      }
      case 'tech_sector_boom': {
        const gain = holdings.reduce((g, h) => getSector(h.asset) === 'Tech' ? g + h.marketValue * (percentage / 100) : g, 0);
        loss = -gain;
        break;
      }
      case 'energy_sector_crash': {
        loss = holdings.reduce((l, h) => getSector(h.asset) === 'Energy' ? l + h.marketValue * (percentage / 100) : l, 0);
        break;
      }
    }
    
    const newTotalValue = totalValue + loss;
    setResult({ newTotalValue, loss });
  };
  
  const commonInputClasses = "mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-dark-primary dark:focus:border-dark-primary";
  const isGainScenario = scenario === 'tech_sector_boom';
  
  const TabButton: React.FC<{ label: string; viewName: View }> = ({ label, viewName }) => (
      <button
        onClick={() => setView(viewName)}
        className={`px-4 py-2 text-sm font-medium rounded-md ${view === viewName ? 'bg-primary dark:bg-dark-primary text-white dark:text-gray-900' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
      >
        {label}
      </button>
  );

  return (
    <Card title="Portfolio Stress Test">
       <div className="flex space-x-2 mb-4">
           <TabButton label="Combined" viewName="COMBINED" />
           <TabButton label="Phronesis" viewName={PortfolioType.PHRONESIS} />
           <TabButton label="FlagShip" viewName={PortfolioType.FLAGSHIP} />
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 p-4 border rounded-lg dark:border-gray-700">
          <h4 className="text-lg font-medium">Test Parameters for {view}</h4>
          <div>
            <label htmlFor="scenario" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Scenario</label>
            <select id="scenario" value={scenario} onChange={(e) => {
                const newScenario = e.target.value as Scenario;
                setScenario(newScenario);
                if (newScenario === 'tech_sector_boom') setPercentage(20); else setPercentage(-20);
            }} className={commonInputClasses}>
              <option value="market_downturn">Market Downturn</option>
              <option value="stock_crash">Specific Asset Crash</option>
              <option value="interest_rate_hike">Interest Rate Hike</option>
              <option value="inflation_spike">Inflation Spike</option>
              <option value="tech_sector_boom">Tech Sector Boom</option>
              <option value="energy_sector_crash">Energy Sector Crash</option>
            </select>
          </div>
          {scenario === 'stock_crash' && (
            <div>
              <label htmlFor="asset" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Asset</label>
              <select id="asset" value={selectedAsset} onChange={(e) => setSelectedAsset(e.target.value)} className={commonInputClasses} disabled={holdings.length === 0}>
                {holdings.map(h => <option key={h.asset} value={h.asset}>{h.asset}</option>)}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Percentage Change (%)</label>
            <input type="number" id="percentage" value={percentage} onChange={(e) => setPercentage(parseFloat(e.target.value))} className={commonInputClasses}/>
          </div>
          <button onClick={handleRunTest} className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-dark-primary dark:hover:bg-dark-primary-hover dark:text-gray-900">
            Run Test
          </button>
        </div>

        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
           <h4 className="text-lg font-medium">Test Results</h4>
           {result ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Current Value ({view})</p>
                <p className="text-2xl font-bold">{totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
              </div>
               <div>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{isGainScenario ? 'Potential Gain' : 'Potential Loss'}</p>
                <p className={`text-2xl font-bold ${isGainScenario ? 'text-green-600' : 'text-red-600'}`}>
                    {(isGainScenario ? result.loss * -1 : result.loss).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Hypothetical New Value</p>
                <p className="text-2xl font-bold text-primary dark:text-dark-primary">{result.newTotalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
              </div>
            </div>
           ) : ( <p className="text-text-secondary dark:text-dark-text-secondary">Run a test to see the potential impact.</p> )}
        </div>
      </div>
    </Card>
  );
};

export default StressTest;