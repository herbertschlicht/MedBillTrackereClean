import React from 'react';
import { Bill } from '../types';

interface BillItemProps {
  bill: Bill;
  onToggleDkv: (id: string) => void;
  onDelete: (id: string) => void;
}

const BillItem: React.FC<BillItemProps> = ({ bill, onToggleDkv, onDelete }) => {
  const formatDate = (dateStr?: string): string | null => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('de-DE');
  };

  return (
    <div className="p-4 border-b border-gray-50 last:border-0 bg-white hover:bg-blue-50/30 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-gray-900">{formatDate(bill.date)}</span>
            {bill.billNumber && (
              <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                Nr: {bill.billNumber}
              </span>
            )}
          </div>
          <div className="mt-1 space-y-0.5">
            {bill.billingProvider && (
              <p className="text-xs text-gray-500 flex items-center">
                <i className="fas fa-file-invoice mr-1.5 text-[10px]"></i>
                Abrechner: {bill.billingProvider}
              </p>
            )}
            {bill.dueDate && (
              <p className="text-xs text-orange-600 flex items-center">
                <i className="fas fa-calendar-times mr-1.5 text-[10px]"></i>
                Zahlbar bis: {formatDate(bill.dueDate)}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-black text-blue-700">
            {bill.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
      </div>

      <div className="mt-3 flex justify-between items-center">
        <div className="flex flex-col">
          <button
            onClick={() => onToggleDkv(bill.id)}
            className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border transition-all ${
              bill.forwardedToDkv
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {bill.forwardedToDkv ? (
              <>
                <i className="fas fa-check-double mr-1.5"></i>DKV Eingereicht
              </>
            ) : (
              <>
                <i className="fas fa-hourglass-start mr-1.5"></i>DKV Offen
              </>
            )}
          </button>
          {bill.forwardedToDkv && bill.forwardedDate && (
            <span className="text-[9px] text-green-600 mt-1 ml-1 font-medium">
              am {formatDate(bill.forwardedDate)}
            </span>
          )}
        </div>

        <button
          onClick={() => onDelete(bill.id)}
          className="text-gray-300 hover:text-red-400 transition-colors p-2"
        >
          <i className="fas fa-trash-alt text-sm"></i>
        </button>
      </div>
    </div>
  );
};

export default BillItem;
