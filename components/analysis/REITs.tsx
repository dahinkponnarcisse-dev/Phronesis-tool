import React, { useState, useCallback } from 'react';
import Card from '../common/Card';
import { getStockModelAnalysis } from '../../services/geminiService';

const REITs: React.FC = () => {
  const [ticker, setTicker] = useState('O'); // Example REIT
  const [inputs, setInputs] = useState({ ffo: '3.80' });
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const generatePrompt = () => {
    return `Provide a detailed analysis of the REIT with ticker ${ticker}. Explain key REIT metrics like Funds From Operations (FFO) and Adjusted Funds From Operations (AFFO). Analyze ${ticker} based on its property portfolio type, geographic diversification, occupancy rates, and dividend history. If available, use a Price/FFO multiple analysis (using a sample FFO of $${inputs.ffo} per share) to discuss its valuation. Format as simple text. Do not use markdown.`;
  };

  const fetchAnalysis = useCallback(async () => {
    if (!ticker) {
      setError('Please enter a REIT ticker.');
      return;
    }
    setIsLoading(true);
    setError('');
    setAnalysis('');
    try {
      const prompt = generatePrompt();
      const result = await getStockModelAnalysis(prompt);
      setAnalysis(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to fetch analysis: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, [ticker, inputs]);

  const commonInputClasses = "mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-dark-primary dark:focus:border-dark-primary";

  const Input: React.FC<any> = ({ label, ...props }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input type="number" step="0.01" {...props} className={commonInputClasses} />
    </div>
  );
  
  return (
    <Card title="AI-Powered REIT Analysis">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h4 className="text-lg font-medium">REIT Profile & Valuation</h4>
           <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
             Analyze Real Estate Investment Trusts using key metrics like FFO.
           </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">REIT Ticker</label>
            <input type="text" value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} className={commonInputClasses} />
          </div>
          <Input label="Est. FFO Per Share ($)" name="ffo" value={inputs.ffo} onChange={handleInputChange} />
          <button
              onClick={fetchAnalysis}
              disabled={isLoading}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-dark-primary dark:hover:bg-dark-primary-hover dark:text-gray-900 disabled:bg-gray-400"
            >
              {isLoading ? 'Analyzing...' : 'Generate Analysis'}
            </button>
        </div>
        <div className="lg:col-span-2">
            {error && <p className="text-red-600">{error}</p>}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700 min-h-[300px]">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">Loading...</div>
                ) : (
                    <p className="text-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap">{analysis || 'Enter a REIT ticker and parameters, then click "Generate Analysis" to see the results.'}</p>
                )}
            </div>
        </div>
      </div>
    </Card>
  );
};

export default REITs;