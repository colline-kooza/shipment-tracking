import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: {
    value: string | number;
    positive: boolean;
  };
  color?: 'blue' | 'teal' | 'orange' | 'purple' | 'green' | 'red';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  color = 'blue'
}) => {
  // Define color mappings
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-600',
      textColor: 'text-blue-600'
    },
    teal: {
      bg: 'bg-teal-50',
      iconBg: 'bg-teal-600',
      textColor: 'text-teal-600'
    },
    orange: {
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-600',
      textColor: 'text-orange-600'
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-600',
      textColor: 'text-purple-600'
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-600',
      textColor: 'text-green-600'
    },
    red: {
      bg: 'bg-red-50',
      iconBg: 'bg-red-600',
      textColor: 'text-red-600'
    }
  };

  const { bg, iconBg, textColor } = colorMap[color];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
              {title}
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {value}
            </h3>
            
            {change && (
              <div className="flex items-center">
                <span 
                  className={`text-xs font-medium flex items-center ${
                    change.positive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  <span className="mr-1">
                    {change.positive ? '↗' : '↘'}
                  </span>
                  {change.value}
                </span>
                <span className="text-gray-500 text-xs ml-2 whitespace-nowrap">
                  vs last month
                </span>
              </div>
            )}
          </div>
          
          <div className={`${bg} p-3 rounded-lg ml-4`}>
            <div className={`${iconBg} p-2 rounded-md text-white flex items-center justify-center`}>
              {icon}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;