import React, { useState, useEffect, useMemo } from 'react';
import { useClubData } from '../hooks/useClubData';
import { getAssetAllocationDetails } from '../services/geminiService';
import { AssetDetails, Holding, PortfolioType } from '../types';
import Card from './common/Card';
import AllocationBarChart from './charts/AllocationBarChart';

type View = 'COMBINED' | PortfolioType;

const aggregateData = (enrichedHoldings: (Holding & Partial<AssetDetails>)[], key: keyof AssetDetails, totalPortfolioValue: number) => {
    if (totalPortfolioValue === 0) return [];
    
    const aggregation = enrichedHoldings.reduce((acc, holding) => {
        const category = holding[key] || 'Unknown';
        acc[category] = (acc[category] || 0) + holding.marketValue;
        return acc;
    }, {} as { [key: string]: number });

    return Object.entries(aggregation)
        .map(([name, value]) => ({
            name,
            value: (value / totalPortfolioValue) * 100,
        }))
        .sort((a, b) => b.value - a.value);
};

const AssetAllocation: React.FC<ReturnType<typeof useClubData>> = (props) => {
    const [view, setView] = useState<View>('COMBINED');
    const [assetDetails, setAssetDetails] = useState<AssetDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const { holdings, cash } = useMemo(() => {
        switch(view) {
            case PortfolioType.PHRONESIS:
                return props.portfolios[PortfolioType.PHRONESIS];
            case PortfolioType.FLAGSHIP:
                return props.portfolios[PortfolioType.FLAGSHIP];
            case 'COMBINED':
            default:
                return { holdings: props.holdings, cash: props.cash };
        }
    }, [view, props]);
    
    useEffect(() => {
        const fetchDetails = async () => {
            if (props.holdings.length === 0) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError('');
            try {
                // We fetch details for all holdings at once to cache them
                const details = await getAssetAllocationDetails(props.holdings);
                setAssetDetails(details);
            } catch (err) {
                setError('Failed to fetch asset allocation details.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [props.holdings]);
    
    const { sectorData, geographyData, assetTypeData } = useMemo(() => {
        const totalPortfolioValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
        if (totalPortfolioValue === 0 && cash === 0) {
            return { sectorData: [], geographyData: [], assetTypeData: [] };
        }

        const enrichedHoldings = holdings.map(h => {
            const details = assetDetails.find(d => d.ticker === h.asset);
            return { ...h, ...details };
        });

        const sectorData = aggregateData(enrichedHoldings, 'sector', totalPortfolioValue);
        const geographyData = aggregateData(enrichedHoldings, 'geography', totalPortfolioValue);
        let assetTypeData = aggregateData(enrichedHoldings, 'assetType', totalPortfolioValue);
        
        const totalValueWithCash = totalPortfolioValue + cash;
        if (totalValueWithCash > 0 && cash > 0) {
             assetTypeData = assetTypeData.map(d => ({ ...d, value: d.value * (totalPortfolioValue / totalValueWithCash) }));
             assetTypeData.push({ name: 'Cash', value: (cash / totalValueWithCash) * 100 });
        }

        return { sectorData, geographyData, assetTypeData };

    }, [holdings, assetDetails, cash]);
    
    const TabButton: React.FC<{ label: string; viewName: View }> = ({ label, viewName }) => (
      <button
        onClick={() => setView(viewName)}
        className={`px-4 py-2 text-sm font-medium rounded-md ${view === viewName ? 'bg-primary dark:bg-dark-primary text-white dark:text-gray-900' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
      >
        {label}
      </button>
    );

    const LoadingState = () => (
         <div className="flex justify-center items-center h-64">
            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary dark:text-dark-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg">Analyzing portfolio with AI...</p>
        </div>
    );
    
    if (error) {
        return <Card title="Error"><p className="text-red-500">{error}</p></Card>;
    }
    
    if (props.holdings.length === 0) {
        return <Card title="Asset Allocation"><p>Your portfolio is empty. Add transactions to see allocation details.</p></Card>
    }

    return (
        <Card title="Detailed Asset Allocation">
           <div className="flex space-x-2 mb-4">
             <TabButton label="Combined" viewName="COMBINED" />
             <TabButton label="Phronesis" viewName={PortfolioType.PHRONESIS} />
             <TabButton label="FlagShip" viewName={PortfolioType.FLAGSHIP} />
          </div>
           {isLoading ? <LoadingState /> : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <AllocationBarChart title="By Sector" data={sectorData} />
                <AllocationBarChart title="By Geography" data={geographyData} />
                <AllocationBarChart title="By Asset Type" data={assetTypeData} />
            </div>
           )}
        </Card>
    );
};

export default AssetAllocation;