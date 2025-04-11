import React from 'react';

const StatCard = ({ title, value, icon, change, changeType, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-shrink-0">
          <div className={`p-3 rounded-full ${
            changeType === 'increase' 
              ? 'bg-green-100 text-green-600' 
              : changeType === 'decrease' 
                ? 'bg-red-100 text-red-600' 
                : 'bg-blue-100 text-blue-600'
          }`}>
            {icon}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 truncate">
            {title}
          </p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">
            {value}
          </p>
        </div>
      </div>
      
      {change && (
        <div className="mt-4">
          <div className={`flex items-center text-sm font-medium ${
            changeType === 'increase' 
              ? 'text-green-600' 
              : changeType === 'decrease' 
                ? 'text-red-600' 
                : 'text-blue-600'
          }`}>
            {changeType === 'increase' ? (
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
            ) : changeType === 'decrease' ? (
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
            ) : null}
            <span>{change}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;