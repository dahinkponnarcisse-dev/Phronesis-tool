import { useState, useEffect, useMemo, useCallback } from 'react';
import { ClubData, Member, Transaction, TransactionType, Holding, PerformanceDataPoint, MemberStatus, ProfileType, PortfolioType, PortfolioState } from '../types';

const generatePerformanceHistory = (): PerformanceDataPoint[] => {
  const history: PerformanceDataPoint[] = [];
  let nav = 25000;
  let benchmark = 4000;
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 5); // Start 5 years ago
  startDate.setDate(1); // Start at the beginning of the month

  for (let i = 0; i < 60; i++) { // 5 years of monthly data
    const date = new Date(startDate);
    date.setMonth(startDate.getMonth() + i);
    
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const navChange = (Math.random() - 0.45) * 0.1; 
    const benchmarkChange = (Math.random() - 0.47) * 0.08;

    nav *= (1 + navChange);
    benchmark *= (1 + benchmarkChange);

    history.push({
      date: endOfMonth.toISOString().split('T')[0],
      nav: Math.round(nav),
      shareValue: 100 * (nav / 25000), 
      benchmark: Math.round(benchmark),
    });
  }
  return history;
};


const getInitialState = (): ClubData => {
  const savedData = localStorage.getItem('clubData');
  if (savedData) {
     const parsedData = JSON.parse(savedData);
    if (!parsedData.performanceHistory || parsedData.performanceHistory.length < 50) {
        parsedData.performanceHistory = generatePerformanceHistory();
    }
    // Migration for older data structure
    if (!parsedData.portfolios) {
        parsedData.portfolios = {
            [PortfolioType.PHRONESIS]: { holdings: [], cash: 0, totalValue: 0 },
            [PortfolioType.FLAGSHIP]: { holdings: [], cash: 0, totalValue: 0 },
        }
    }
    return parsedData;
  }

  const members: Member[] = [
     { id: 'm1', name: 'Alice Johnson', email: 'alice@email.com', phone: '555-0101', joinDate: '2019-07-20', exitDate: null, investedCapital: 10000, shares: 100, status: MemberStatus.ACTIVE, profileType: ProfileType.DYNAMIC },
     { id: 'm2', name: 'Bob Williams', email: 'bob@email.com', phone: '555-0102', joinDate: '2019-07-20', exitDate: null, investedCapital: 15000, shares: 150, status: MemberStatus.ACTIVE, profileType: ProfileType.PRUDENT },
     { id: 'm3', name: 'Charlie Brown', email: 'charlie@email.com', phone: '555-0103', joinDate: '2022-06-01', exitDate: '2023-12-31', investedCapital: 5000, shares: 0, status: MemberStatus.INACTIVE, profileType: ProfileType.DYNAMIC },
  ];

  const transactions: Transaction[] = [
    { id: 't1', date: '2019-07-20', type: TransactionType.DEPOSIT, memberId: 'm1', amount: 10000, portfolio: PortfolioType.PHRONESIS },
    { id: 't2', date: '2019-07-20', type: TransactionType.DEPOSIT, memberId: 'm2', amount: 15000, portfolio: PortfolioType.PHRONESIS },
    { id: 't-charlie-in', date: '2022-06-01', type: TransactionType.DEPOSIT, memberId: 'm3', amount: 5000, portfolio: PortfolioType.FLAGSHIP },
    { id: 't3', date: '2022-08-01', type: TransactionType.BUY, asset: 'AAPL', quantity: 30, price: 150, amount: 4500, portfolio: PortfolioType.PHRONESIS },
    { id: 't4', date: '2023-03-10', type: TransactionType.BUY, asset: 'GOOGL', quantity: 10, price: 100, amount: 1000, portfolio: PortfolioType.PHRONESIS },
    { id: 't5', date: '2023-05-15', type: TransactionType.BUY, asset: 'XAU/USD', quantity: 2, price: 1900, amount: 3800, portfolio: PortfolioType.FLAGSHIP },
    { id: 't6', date: '2023-06-01', type: TransactionType.SELL, asset: 'XAU/USD', quantity: 1, price: 1950, amount: 1950, portfolio: PortfolioType.FLAGSHIP },
    { id: 't-charlie-out', date: '2023-12-31', type: TransactionType.WITHDRAWAL, memberId: 'm3', amount: 5500, portfolio: PortfolioType.FLAGSHIP },
  ];
  
  const performanceHistory = generatePerformanceHistory();

  return {
    members,
    transactions,
    portfolios: {
        [PortfolioType.PHRONESIS]: { holdings: [], cash: 0, totalValue: 0 },
        [PortfolioType.FLAGSHIP]: { holdings: [], cash: 0, totalValue: 0 },
    },
    cash: 0,
    holdings: [],
    totalShares: 0,
    totalValue: 0,
    shareValue: 0,
    performanceHistory
  };
};

export const useClubData = () => {
  const [data, setData] = useState<ClubData>(getInitialState());

  const addTransaction = useCallback((newTransaction: Omit<Transaction, 'id'>) => {
    setData(prevData => {
      const transactionWithId: Transaction = { id: `t${Date.now()}`, ...newTransaction };
      const updatedTransactions = [...prevData.transactions, transactionWithId];
      let updatedMembers = [...prevData.members];
      const shareValue = prevData.shareValue || 100;

      if (newTransaction.type === TransactionType.DEPOSIT && newTransaction.memberId) {
        const newShares = newTransaction.amount / shareValue;
        updatedMembers = updatedMembers.map(m => m.id === newTransaction.memberId ? { ...m, shares: m.shares + newShares, investedCapital: m.investedCapital + newTransaction.amount, status: MemberStatus.ACTIVE, exitDate: null } : m );
      }

      if (newTransaction.type === TransactionType.WITHDRAWAL && newTransaction.memberId) {
        const withdrawnShares = newTransaction.amount / shareValue;
        updatedMembers = updatedMembers.map(m => {
          if (m.id === newTransaction.memberId) {
            const newShares = Math.max(0, m.shares - withdrawnShares);
            const isFullyWithdrawn = newShares < 0.01;
            return { ...m, shares: newShares, status: isFullyWithdrawn ? MemberStatus.INACTIVE : MemberStatus.ACTIVE, exitDate: isFullyWithdrawn ? new Date().toISOString().split('T')[0] : m.exitDate };
          }
          return m;
        });
      }
      
      return { ...prevData, transactions: updatedTransactions, members: updatedMembers };
    });
  }, []);

  const calculatedData = useMemo(() => {
    const portfolios: { [key in PortfolioType]: PortfolioState } = {
        [PortfolioType.PHRONESIS]: { cash: 0, holdings: [], totalValue: 0 },
        [PortfolioType.FLAGSHIP]: { cash: 0, holdings: [], totalValue: 0 },
    };

    const holdingsMap: { [key in PortfolioType]: { [asset: string]: { quantity: number; totalCost: number } } } = {
        [PortfolioType.PHRONESIS]: {},
        [PortfolioType.FLAGSHIP]: {},
    };

    data.transactions.forEach(tx => {
      const portfolio = portfolios[tx.portfolio];
      const portfolioHoldingsMap = holdingsMap[tx.portfolio];

      switch (tx.type) {
        case TransactionType.DEPOSIT: portfolio.cash += tx.amount; break;
        case TransactionType.WITHDRAWAL: portfolio.cash -= tx.amount; break;
        case TransactionType.BUY:
          if (tx.asset && tx.quantity && tx.price) {
            portfolio.cash -= tx.amount;
            if (!portfolioHoldingsMap[tx.asset]) {
              portfolioHoldingsMap[tx.asset] = { quantity: 0, totalCost: 0 };
            }
            portfolioHoldingsMap[tx.asset].quantity += tx.quantity;
            portfolioHoldingsMap[tx.asset].totalCost += tx.amount;
          }
          break;
        case TransactionType.SELL:
           if (tx.asset && tx.quantity) {
            portfolio.cash += tx.amount;
            if (portfolioHoldingsMap[tx.asset]) {
                portfolioHoldingsMap[tx.asset].quantity -= tx.quantity;
            }
           }
          break;
        case TransactionType.DIVIDEND: portfolio.cash += tx.amount; break;
      }
    });

    const mockCurrentPrices: { [key: string]: number } = { 'AAPL': 175, 'GOOGL': 130, 'MSFT': 330, 'XAU/USD': 1980 };
    
    let allHoldings: Holding[] = [];

    for (const portfolioType in portfolios) {
        const pType = portfolioType as PortfolioType;
        const pState = portfolios[pType];
        const pHoldingsMap = holdingsMap[pType];

        pState.holdings = Object.entries(pHoldingsMap)
            .map(([asset, data]) => {
                const currentPrice = mockCurrentPrices[asset] || data.totalCost / data.quantity;
                const marketValue = data.quantity * currentPrice;
                const averageCost = data.quantity > 0 ? data.totalCost / data.quantity : 0;
                const unrealizedGainLoss = marketValue - data.totalCost;
                return { asset, quantity: data.quantity, averageCost, currentPrice, marketValue, unrealizedGainLoss, portfolio: pType };
            })
            .filter(h => h.quantity > 0.001); // Filter out empty holdings

        const portfolioMarketValue = pState.holdings.reduce((sum, h) => sum + h.marketValue, 0);
        pState.totalValue = portfolioMarketValue + pState.cash;
        allHoldings = [...allHoldings, ...pState.holdings];
    }
    
    const totalCash = portfolios[PortfolioType.PHRONESIS].cash + portfolios[PortfolioType.FLAGSHIP].cash;
    const totalPortfolioValue = portfolios[PortfolioType.PHRONESIS].totalValue + portfolios[PortfolioType.FLAGSHIP].totalValue;
    const totalShares = data.members.reduce((sum, member) => sum + member.shares, 0);
    const shareValue = totalShares > 0 ? totalPortfolioValue / totalShares : 0;

    return { ...data, portfolios, cash: totalCash, holdings: allHoldings, totalShares, totalValue: totalPortfolioValue, shareValue };
  }, [data.transactions, data.members]);
  
  useEffect(() => {
    localStorage.setItem('clubData', JSON.stringify(calculatedData));
  }, [calculatedData]);

  return { ...calculatedData, addTransaction };
};