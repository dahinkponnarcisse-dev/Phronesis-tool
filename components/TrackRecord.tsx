import React, { useMemo } from 'react';
import { useClubData } from '../hooks/useClubData';
import Card from './common/Card';
import PortfolioValueChart from './charts/PortfolioValueChart';
import DrawdownChart from './charts/DrawdownChart';
import { PerformanceDataPoint } from '../types';

const RISK_FREE_RATE = 0.02; // 2% risk-free rate for Sharpe Ratio calculation

const TrackRecord: React.FC<ReturnType<typeof useClubData>> = ({ performanceHistory }) => {

  const monthlyReturns = useMemo(() => {
    if (performanceHistory.length < 2) return [];
    const returns = [];
    for (let i = 1; i < performanceHistory.length; i++) {
      const prev = performanceHistory[i - 1];
      const curr = performanceHistory[i];
      returns.push({
        date: curr.date,
        navReturn: (curr.nav - prev.nav) / prev.nav,
        benchmarkReturn: (curr.benchmark - prev.benchmark) / prev.benchmark,
      });
    }
    return returns;
  }, [performanceHistory]);

  const performanceStats = useMemo(() => {
    if (performanceHistory.length < 2 || monthlyReturns.length === 0) {
      return { cumulativeReturn: 0, annualizedReturn: 0, annualizedVolatility: 0, sharpeRatio: 0, maxDrawdown: 0 };
    }

    const firstPoint = performanceHistory[0];
    const lastPoint = performanceHistory[performanceHistory.length - 1];
    
    // Cumulative Return
    const cumulativeReturn = (lastPoint.nav - firstPoint.nav) / firstPoint.nav;

    // Annualized Return
    const years = performanceHistory.length / 12;
    const annualizedReturn = Math.pow((1 + cumulativeReturn), (1 / years)) - 1;
    
    // Annualized Volatility
    const avgReturn = monthlyReturns.reduce((acc, curr) => acc + curr.navReturn, 0) / monthlyReturns.length;
    const variance = monthlyReturns.reduce((acc, curr) => acc + Math.pow(curr.navReturn - avgReturn, 2), 0) / monthlyReturns.length;
    const stdDev = Math.sqrt(variance);
    const annualizedVolatility = stdDev * Math.sqrt(12);
    
    // Sharpe Ratio
    const sharpeRatio = (annualizedReturn - RISK_FREE_RATE) / annualizedVolatility;

    // Max Drawdown
    let peak = -Infinity;
    let maxDrawdown = 0;
    performanceHistory.forEach(point => {
        if (point.nav > peak) {
            peak = point.nav;
        }
        const drawdown = (point.nav - peak) / peak;
        if (drawdown < maxDrawdown) {
            maxDrawdown = drawdown;
        }
    });

    return { cumulativeReturn, annualizedReturn, annualizedVolatility, sharpeRatio, maxDrawdown };

  }, [performanceHistory, monthlyReturns]);

  const drawdownData = useMemo(() => {
      let peak = -Infinity;
      return performanceHistory.map(point => {
          if (point.nav > peak) {
              peak = point.nav;
          }
          const drawdown = (point.nav - peak) / peak;
          return {
              date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
              drawdown: drawdown * 100
          };
      });
  }, [performanceHistory]);
  
  const annualPerformance = useMemo(() => {
    const perfByYear: { [year: string]: { startNav: number; endNav: number; startBenchmark: number; endBenchmark: number } } = {};

    performanceHistory.forEach(point => {
      const year = new Date(point.date).getFullYear().toString();
      if (!perfByYear[year]) {
        perfByYear[year] = { startNav: point.nav, endNav: 0, startBenchmark: point.benchmark, endBenchmark: 0 };
      }
      perfByYear[year].endNav = point.nav;
      perfByYear[year].endBenchmark = point.benchmark;
    });

    return Object.entries(perfByYear).map(([year, data]) => {
      const { startNav, endNav, startBenchmark, endBenchmark } = data;
      const navReturn = (endNav - startNav) / startNav;
      const benchmarkReturn = (endBenchmark - startBenchmark) / startBenchmark;
      return { year, navReturn, benchmarkReturn };
    }).sort((a,b) => b.year.localeCompare(a.year));

  }, [performanceHistory]);
  
  const handleExport = () => {
    const dataToExport = performanceHistory.map((point, index) => {
        const monthlyReturn = index > 0 ? (point.nav - performanceHistory[index-1].nav) / performanceHistory[index-1].nav * 100 : 0;
        const ddPoint = drawdownData.find(d => new Date(point.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) === d.date);
        return {
            date: point.date,
            nav: point.nav,
            benchmark: point.benchmark,
            monthlyReturn: monthlyReturn.toFixed(2),
            drawdown: ddPoint ? ddPoint.drawdown.toFixed(2) : '0.00'
        };
    });

    const headers = ['Date', 'Portfolio NAV', 'Benchmark', 'Monthly Return (%)', 'Drawdown (%)'];
    const rows = dataToExport.map(d => [d.date, d.nav, d.benchmark, d.monthlyReturn, d.drawdown].join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "track_record.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const Stat: React.FC<{ label: string; value: string; positive?: boolean }> = ({ label, value, positive }) => (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
      <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{label}</p>
      <p className={`text-2xl font-bold ${positive === true ? 'text-green-600' : positive === false ? 'text-red-600' : 'text-primary dark:text-dark-primary'}`}>{value}</p>
    </div>
  );
  
  const ValueCell: React.FC<{ value: number }> = ({ value }) => (
    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {(value * 100).toFixed(2)}%
    </td>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">Track Record</h2>
        <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-dark-primary dark:hover:bg-dark-primary-hover dark:text-gray-900"
          >
            Export to CSV
        </button>
      </div>

      <Card title="Key Performance Indicators">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Stat label="Cumulative Return" value={`${(performanceStats.cumulativeReturn * 100).toFixed(2)}%`} positive={performanceStats.cumulativeReturn >= 0}/>
            <Stat label="Annualized Return" value={`${(performanceStats.annualizedReturn * 100).toFixed(2)}%`} positive={performanceStats.annualizedReturn >= 0} />
            <Stat label="Annualized Volatility" value={`${(performanceStats.annualizedVolatility * 100).toFixed(2)}%`} />
            <Stat label="Sharpe Ratio" value={performanceStats.sharpeRatio.toFixed(2)} positive={performanceStats.sharpeRatio >= 0}/>
            <Stat label="Max Drawdown" value={`${(performanceStats.maxDrawdown * 100).toFixed(2)}%`} positive={false}/>
        </div>
      </Card>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Performance vs. Benchmark (S&P 500)">
            <PortfolioValueChart data={performanceHistory} />
        </Card>
        <Card title="Drawdown History">
            <DrawdownChart data={drawdownData} />
        </Card>
      </div>

      <Card title="Annual Returns">
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Portfolio Return</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Benchmark Return</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                {annualPerformance.map(perf => (
                  <tr key={perf.year}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-text-primary">{perf.year}</td>
                    <ValueCell value={perf.navReturn} />
                    <ValueCell value={perf.benchmarkReturn} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </Card>

    </div>
  );
};

export default TrackRecord;