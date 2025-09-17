import React, { useState, useCallback } from 'react';
import Card from '../common/Card';
import { getStockModelAnalysis } from '../../services/geminiService';

type Model = 'dcf' | 'graham' | 'safety_margin';

const Stocks: React.FC = () => {
  const [model, setModel] = useState<Model>('dcf');
  const [ticker, setTicker] = useState('AAPL');
  const [inputs, setInputs] = useState({
    growthRate: '10',
    discountRate: '8',
    eps: '6.0',
    currentPrice: '175',
  });
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const generatePrompt = () => {
    switch (model) {
      case 'dcf':
        return `Explain a simple Discounted Cash Flow (DCF) model for stock valuation. Then, provide a sample calculation for a hypothetical company similar to ${ticker} using a future free cash flow growth rate of ${inputs.growthRate}% and a discount rate of ${inputs.discountRate}%. Explain the inputs and the result. Keep it educational. Format as simple text. Do not use markdown.`;
      case 'graham':
        return `Explain Benjamin Graham's intrinsic value formula: Value = EPS * (8.5 + 2g). Explain each component. Then, calculate the intrinsic value for a stock like ${ticker} with a current EPS of $${inputs.eps} and an estimated annual growth rate (g) of ${inputs.growthRate}% for the next 7-10 years. Format as simple text. Do not use markdown.`;
      case 'safety_margin':
        return `Explain the concept of "Margin of Safety" in value investing, as popularized by Benjamin Graham. Then, using an intrinsic value calculated from Graham's formula (EPS of $${inputs.eps}, growth rate of ${inputs.growthRate}%), calculate the margin of safety if the current market price for a stock like ${ticker} is $${inputs.currentPrice}. Explain what the result means for an investor. Format as simple text. Do not use markdown.`;
      default:
        return '';
    }
  };

  const fetchAnalysis = useCallback(async () => {
    if (!ticker) {
      setError('Please enter a stock ticker.');
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
  }, [ticker, model, inputs]);

  const commonInputClasses = "mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-dark-primary dark:focus:border-dark-primary";

  const renderInputs = () => {
    switch(model) {
      case 'dcf':
        return (
          <>
            <Input label="Est. Growth Rate (%)" name="growthRate" value={inputs.growthRate} onChange={handleInputChange} />
            <Input label="Discount Rate (%)" name="discountRate" value={inputs.discountRate} onChange={handleInputChange} />
          </>
        );
      case 'graham':
        return (
          <>
            <Input label="Current EPS ($)" name="eps" value={inputs.eps} onChange={handleInputChange} />
            <Input label="Est. Growth Rate (%)" name="growthRate" value={inputs.growthRate} onChange={handleInputChange} />
          </>
        );
      case 'safety_margin':
         return (
          <>
            <Input label="Current Market Price ($)" name="currentPrice" value={inputs.currentPrice} onChange={handleInputChange} />
            <Input label="Current EPS ($)" name="eps" value={inputs.eps} onChange={handleInputChange} />
            <Input label="Est. Growth Rate (%)" name="growthRate" value={inputs.growthRate} onChange={handleInputChange} />
          </>
        );
      default:
        return null;
    }
  }

  const Input: React.FC<any> = ({ label, ...props }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input type="number" step="0.1" {...props} className={commonInputClasses} />
    </div>
  );

  const ModelButton: React.FC<{ modelName: Model; label: string }> = ({ modelName, label }) => (
     <button
        onClick={() => setModel(modelName)}
        className={`px-3 py-2 text-sm font-medium rounded-md flex-grow text-center ${model === modelName ? 'bg-primary dark:bg-dark-primary text-white dark:text-gray-900' : 'bg-gray-200 dark:bg-gray-700'}`}
    >
        {label}
    </button>
  );

  return (
    <Card title="AI-Powered Stock Analysis Models">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="flex flex-wrap gap-1">
             <ModelButton modelName="dcf" label="DCF" />
             <ModelButton modelName="graham" label="Graham" />
             <ModelButton modelName="safety_margin" label="Safety Margin" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ticker</label>
            <input type="text" value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} className={commonInputClasses} />
          </div>
          {renderInputs()}
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
                    <p className="text-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap">{analysis || 'Select a model, enter parameters, and click "Generate Analysis" to see the results.'}</p>
                )}
            </div>
        </div>
      </div>
    </Card>
  );
};

export default Stocks;