import React, { useState } from 'react';
import { useClubData } from '../hooks/useClubData';
import { Transaction, TransactionType, PortfolioType } from '../types';
import Card from './common/Card';

type TransactionsProps = ReturnType<typeof useClubData>;

const TransactionPill: React.FC<{ type: TransactionType }> = ({ type }) => {
  const typeClasses: { [key in TransactionType]: string } = {
    [TransactionType.DEPOSIT]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    [TransactionType.WITHDRAWAL]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    [TransactionType.BUY]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    [TransactionType.SELL]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    [TransactionType.DIVIDEND]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${typeClasses[type]}`}>
      {type}
    </span>
  );
};

const PortfolioPill: React.FC<{ type: PortfolioType }> = ({ type }) => {
  const typeClasses: { [key in PortfolioType]: string } = {
    [PortfolioType.PHRONESIS]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    [PortfolioType.FLAGSHIP]: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${typeClasses[type]}`}>
      {type === PortfolioType.PHRONESIS ? 'Phronesis' : 'FlagShip'}
    </span>
  );
};

const Transactions: React.FC<TransactionsProps> = ({ transactions, members, addTransaction }) => {
  const [formState, setFormState] = useState<Partial<Transaction>>({
    type: TransactionType.DEPOSIT,
    date: new Date().toISOString().split('T')[0],
    portfolio: PortfolioType.PHRONESIS,
  });
  
  const sortedTransactions = transactions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.type || !formState.date || !formState.portfolio || !formState.amount) {
        if(formState.type === TransactionType.BUY || formState.type === TransactionType.SELL) {
            if(!formState.quantity || !formState.price) return;
        } else {
            return;
        }
    }
    
    let transactionAmount = Number(formState.amount) || 0;
    if ( (formState.type === TransactionType.BUY || formState.type === TransactionType.SELL) && formState.quantity && formState.price) {
        transactionAmount = Number(formState.quantity) * Number(formState.price);
    }
    
    addTransaction({ ...formState, amount: transactionAmount } as Omit<Transaction, 'id'>);
  };
  
  const handleExport = () => {
    const headers = ['ID', 'Date', 'Type', 'Portfolio', 'Member', 'Asset', 'Quantity', 'Price', 'Amount'];
    const rows = sortedTransactions.map(tx => 
      [
        tx.id,
        tx.date,
        tx.type,
        tx.portfolio,
        tx.memberId ? members.find(m => m.id === tx.memberId)?.name || tx.memberId : '',
        tx.asset || '',
        tx.quantity || '',
        tx.price || '',
        tx.amount
      ].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const commonInputClasses = "mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-dark-primary dark:focus:border-dark-primary";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card title="Add Transaction">
          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
              <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio</label>
              <select id="portfolio" name="portfolio" value={formState.portfolio} onChange={handleInputChange} className={commonInputClasses}>
                <option value={PortfolioType.PHRONESIS}>Phronesis (Passive)</option>
                <option value={PortfolioType.FLAGSHIP}>FlagShip (Active)</option>
              </select>
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
              <select id="type" name="type" value={formState.type} onChange={handleInputChange} className={commonInputClasses}>
                {Object.values(TransactionType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {(formState.type === TransactionType.DEPOSIT || formState.type === TransactionType.WITHDRAWAL) && (
              <div>
                <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Member</label>
                <select id="memberId" name="memberId" value={formState.memberId} onChange={handleInputChange} className={commonInputClasses} required>
                  <option value="">Select Member</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            )}
            {(formState.type === TransactionType.BUY || formState.type === TransactionType.SELL || formState.type === TransactionType.DIVIDEND) && (
              <div>
                <label htmlFor="asset" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Asset</label>
                <input type="text" name="asset" id="asset" value={formState.asset || ''} onChange={handleInputChange} className={commonInputClasses} required/>
              </div>
            )}
            {(formState.type === TransactionType.BUY || formState.type === TransactionType.SELL) && (
              <div className="flex space-x-2">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                  <input type="number" name="quantity" id="quantity" value={formState.quantity || ''} onChange={handleInputChange} className={commonInputClasses} required/>
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                  <input type="number" name="price" id="price" step="0.01" value={formState.price || ''} onChange={handleInputChange} className={commonInputClasses} required/>
                </div>
              </div>
            )}
            {(formState.type !== TransactionType.BUY && formState.type !== TransactionType.SELL) && (
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                <input type="number" name="amount" id="amount" step="0.01" value={formState.amount || ''} onChange={handleInputChange} className={commonInputClasses} required/>
              </div>
            )}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
              <input type="date" name="date" id="date" value={formState.date || ''} onChange={handleInputChange} className={commonInputClasses} required/>
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-dark-primary dark:hover:bg-dark-primary-hover dark:text-gray-900">
              Add Transaction
            </button>
          </form>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card title="Transaction History">
          <div className="flex justify-end mb-4">
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Portfolio</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                {sortedTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">{tx.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"><TransactionPill type={tx.type} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"><PortfolioPill type={tx.portfolio} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text-primary">
                      {tx.type === TransactionType.DEPOSIT || tx.type === TransactionType.WITHDRAWAL
                        ? members.find(m => m.id === tx.memberId)?.name
                        : `${tx.asset} (${tx.quantity || ''} @ ${tx.price || ''})`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text-primary font-semibold text-right">
                      {tx.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Transactions;