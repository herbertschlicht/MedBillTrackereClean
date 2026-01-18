
import React, { useState } from 'react';
import { GroupedBills } from '../types';
import BillItem from './BillItem';

interface DoctorSectionProps {
  group: GroupedBills;
  onToggleDkv: (id: string) => void;
  onDelete: (id: string) => void;
}

const DoctorSection: React.FC<DoctorSectionProps> = ({ group, onToggleDkv, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-4 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <i className="fas fa-user-md text-lg"></i>
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900 leading-tight">{group.doctorName}</h3>
            <p className="text-xs text-gray-500">{group.bills.length} Rechnung(en)</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="font-bold text-gray-900">
            {group.totalAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </span>
          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-400`}></i>
        </div>
      </button>
      
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/30">
          {group.bills.map(bill => (
            <BillItem 
              key={bill.id} 
              bill={bill} 
              onToggleDkv={onToggleDkv} 
              onDelete={onDelete} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorSection;
