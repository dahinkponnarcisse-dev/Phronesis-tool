import React, { useState, useCallback } from 'react';
import Card from './common/Card';
import { getMarketAnalysis, getYieldCurveAnalysis } from '../services/geminiService';

const AIEnhancedReport: React.FC = () => {
  const [ticker, setTicker] = useState<string>('AAPL');
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const [yieldCurveAnalysis, setYieldCurveAnalysis] = useState<string>('');
  const [isYieldCurveLoading, setIsYieldCurveLoading] = useState<boolean>(false);
  const [yieldCurveError, setYieldCurveError] = useState<string>('');

  const fetchAnalysis = useCallback(async () => {
    if (!ticker) {
      setError('Please enter a stock ticker.');
      return;
    }
    setIsLoading(true);
    setError('');
    setAnalysis('');
    try {
      const result = await getMarketAnalysis(ticker);
      setAnalysis(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to fetch analysis: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, [ticker]);
  
  const fetchYieldCurveAnalysis = useCallback(async () => {
    setIsYieldCurveLoading(true);
    setYieldCurveError('');
    setYieldCurveAnalysis('');
    try {
      const result = await getYieldCurveAnalysis();
      setYieldCurveAnalysis(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setYieldCurveError(`Failed to fetch analysis: ${message}`);
    } finally {
      setIsYieldCurveLoading(false);
    }
  }, []);

  const commonButtonClasses = "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-dark-primary dark:hover:bg-dark-primary-hover dark:text-gray-900 disabled:bg-gray-400";
  const commonInputClasses = "flex-grow shadow-sm sm:text-sm border-gray-300 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-dark-primary dark:focus:border-dark-primary";

  const LoadingSpinner = () => (
    <>
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Analyzing...
    </>
  );

  return (
    <div className="space-y-6">
      <Card title="AI-Powered Market Analysis">
        <div className="space-y-4">
          <p className="text-text-secondary dark:text-dark-text-secondary">
            Enter a stock ticker to get a brief market analysis powered by Google Gemini.
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="e.g., GOOGL"
              className={commonInputClasses}
            />
            <button
              onClick={fetchAnalysis}
              disabled={isLoading}
              className={commonButtonClasses}
            >
              {isLoading ? <LoadingSpinner /> : 'Get Analysis'}
            </button>
          </div>

          {error && <p className="text-red-600">{error}</p>}
          
          {analysis && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                  <h4 className="font-bold text-lg mb-2">Analysis for {ticker}</h4>
                  <p className="text-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap">{analysis}</p>
              </div>
          )}
        </div>
      </Card>
      
      <Card title="AI-Powered Yield Curve Analysis">
        <div className="space-y-4">
           <p className="text-text-secondary dark:text-dark-text-secondary">
            Get an AI-generated analysis of the current US Treasury yield curve and its economic implications.
          </p>
          <button
              onClick={fetchYieldCurveAnalysis}
              disabled={isYieldCurveLoading}
              className={commonButtonClasses}
            >
              {isYieldCurveLoading ? <LoadingSpinner /> : 'Analyze Yield Curve'}
            </button>
            {yieldCurveError && <p className="text-red-600">{yieldCurveError}</p>}
            {yieldCurveAnalysis && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                  <h4 className="font-bold text-lg mb-2">Yield Curve Analysis</h4>
                  <p className="text-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap">{yieldCurveAnalysis}</p>
              </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AIEnhancedReport;