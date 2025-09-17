import React, { useState } from 'react';
import { useClubData } from '../hooks/useClubData';
import Card from './common/Card';
import { Member, Transaction, TransactionType } from '../types';
import PortfolioValueChart from './charts/PortfolioValueChart';

interface ReportData {
  member: Member;
  equityValue: number;
  transactions: Transaction[];
}

const MyReport: React.FC<ReturnType<typeof useClubData>> = ({ members, transactions, shareValue, performanceHistory }) => {
  const [memberId, setMemberId] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const handleGenerateReport = () => {
    const member = members.find(m => m.id === memberId && m.email.toLowerCase() === email.toLowerCase());
    if (member) {
      const memberTransactions = transactions.filter(
        t => t.memberId === member.id && (t.type === TransactionType.DEPOSIT || t.type === TransactionType.WITHDRAWAL)
      );
      setReportData({
        member,
        equityValue: member.shares * shareValue,
        transactions: memberTransactions,
      });
      setError('');
    } else {
      setError('Invalid Member ID or Email. Please try again.');
      setReportData(null);
    }
  };

  const commonInputClasses = "mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:ring-primary focus:border-primary dark:focus:ring-dark-primary dark:focus:border-dark-primary";

  return (
    <div>
      {!reportData ? (
        <div className="space-y-6">
          <Card title="Club Performance Overview">
            <p className="text-text-secondary dark:text-dark-text-secondary mb-4">
              Here is the overall performance trend of the club against the benchmark (S&P 500).
            </p>
            <PortfolioValueChart data={performanceHistory} />
          </Card>
          <Card title="Generate Personal Report" className="max-w-md mx-auto">
            <div className="space-y-4">
              <p className="text-text-secondary dark:text-dark-text-secondary">Enter your Member ID and Email to generate your personalized report.</p>
              <div>
                <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Member ID</label>
                <input type="text" id="memberId" value={memberId} onChange={e => setMemberId(e.target.value)} className={commonInputClasses} />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className={commonInputClasses} />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                onClick={handleGenerateReport}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-dark-primary dark:hover:bg-dark-primary-hover dark:text-gray-900"
              >
                Generate Report
              </button>
            </div>
          </Card>
        </div>
      ) : (
        <div>
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #print-section, #print-section * {
                visibility: visible;
              }
              #print-section {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
              }
              .no-print {
                display: none;
              }
            }
          `}</style>
          <div className="flex justify-end space-x-2 mb-4 no-print">
            <button onClick={() => setReportData(null)} className="text-sm text-primary dark:text-dark-primary">Go Back</button>
            <button onClick={() => window.print()} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover dark:text-gray-900">
              Print / Save PDF
            </button>
          </div>
          <div id="print-section" className="p-8 bg-white dark:bg-dark-card rounded-lg shadow">
            <div className="flex justify-between items-center border-b pb-4 dark:border-gray-700">
                <div>
                    <h1 className="text-3xl font-bold text-primary dark:text-dark-primary">Phronesis Capital</h1>
                    <p className="text-text-secondary dark:text-dark-text-secondary">Member Statement</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold">{reportData.member.name}</p>
                    <p className="text-sm text-gray-500">{reportData.member.email}</p>
                    <p className="text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 my-6 text-center">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Total Equity Value</p>
                    <p className="text-2xl font-bold text-primary dark:text-dark-primary">{reportData.equityValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                </div>
                 <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Shares Owned</p>
                    <p className="text-2xl font-bold text-primary dark:text-dark-primary">{reportData.member.shares.toFixed(2)}</p>
                </div>
                 <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Member Since</p>
                    <p className="text-2xl font-bold text-primary dark:text-dark-primary">{reportData.member.joinDate}</p>
                </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2 text-text-primary dark:text-dark-text-primary">Capital Transactions</h3>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                  {reportData.transactions.map(tx => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 text-sm">{tx.date}</td>
                      <td className={`px-6 py-4 text-sm font-semibold ${tx.type === TransactionType.DEPOSIT ? 'text-green-600' : 'text-red-600'}`}>{tx.type}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium">{tx.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReport;