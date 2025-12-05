import React from 'react';

interface InfoCardProps {
  title: string;
  value: string;
  subValue?: string;
  color?: 'blue' | 'green' | 'purple' | 'amber';
  icon?: React.ReactNode;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, value, subValue, color = 'blue', icon }) => {
  const colorStyles = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorStyles[color]} shadow-sm transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-70 mb-1">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
          {subValue && <p className="text-xs mt-1 font-medium opacity-80">{subValue}</p>}
        </div>
        {icon && <div className="opacity-80">{icon}</div>}
      </div>
    </div>
  );
};
