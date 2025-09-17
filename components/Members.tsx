import React from 'react';
import { useClubData } from '../hooks/useClubData';
import Card from './common/Card';
import { MemberStatus } from '../types';

type MembersProps = ReturnType<typeof useClubData>;

const StatusPill: React.FC<{ status: MemberStatus }> = ({ status }) => {
  const statusClasses: { [key in MemberStatus]: string } = {
    [MemberStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    [MemberStatus.INACTIVE]: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}>
      {status}
    </span>
  );
};

const Members: React.FC<MembersProps> = ({ members, shareValue, totalShares }) => {
  return (
    <Card title="Club Members">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name / ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Membership Dates</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invested Capital</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Equity Value / Shares (%)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Profile</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
            {members.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">{member.name}</div>
                  <div className="text-xs text-gray-500 dark:text-dark-text-secondary">ID: {member.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="text-sm text-gray-900 dark:text-dark-text-primary">{member.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="text-sm text-gray-900 dark:text-dark-text-primary">{member.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-dark-text-primary">Joined: {member.joinDate}</div>
                  {member.exitDate && <div className="text-sm text-gray-500 dark:text-dark-text-secondary">Exited: {member.exitDate}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text-primary text-right">
                  {member.investedCapital.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary">
                    {(member.shares * shareValue).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-dark-text-secondary">
                    {totalShares > 0 ? ((member.shares / totalShares) * 100).toFixed(2) : '0.00'}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <StatusPill status={member.status} />
                </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">{member.profileType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default Members;