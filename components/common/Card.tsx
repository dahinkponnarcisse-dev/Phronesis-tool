import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-card dark:bg-dark-card rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-medium text-text-secondary dark:text-dark-text-secondary mb-4">{title}</h3>
      <div>{children}</div>
    </div>
  );
};

export default Card;