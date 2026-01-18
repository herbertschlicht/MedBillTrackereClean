
import React, { useState, useEffect } from 'react';
import { Bill } from '../services/src/types';

interface BillFormProps {
  initialData?: Partial<Bill>;
  onSave: (bill: Omit<Bill, 'id'>) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

const BillForm: React.FC<BillFormProps> = ({ initialData, onSave, onCancel, isProcessing }) => {
  const [formData, setFormData] = useState<Omit<Bill, 'id'>>({
    doctorName: initialData?.doctorName || '',
    billingProvider: initialData?.billingProvider || '',
    billNumber: initialData?.billNumber || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    dueDate: initialData?.dueDate || '',
    amount: initialData?.amount || 0,
    forwardedToDkv: initialData?.forwardedToDkv || false,
    forwardedDate: initialData?.forwardedDate || '',
    status: initialData?.status || 'pending',
  });

  // Sync internal state if initialData changes (e.g. after AI scan)
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        // Ensure defaults for new fields if not in initialData
        date: initialData.date || prev.date,
        forwardedToDkv: initialData.forwardedToDkv || prev.forwardedToDkv,
      }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-xl shadow-inner">
      <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 mb-4 text-xs text-blue-700">
        <i className="fas fa-info-circle mr-2"></i>
        Bitte kontrollieren Sie die erkannten Felder und korrigieren Sie diese bei Bedarf.
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Arzt / Absender *</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-3 text-sm"
          placeholder="Name des Arztes"
          value={formData.doctorName}
          onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Abrechner</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-3 text-sm"
            placeholder="z.B. PVS"
            value={formData.billingProvider}
            onChange={(e) => setFormData({ ...formData, billingProvider: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Rechnungs-Nr.</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-3 text-sm"
            value={formData.billNumber}
            onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Rechnungsdatum</label>
          <input
            type="date"
            className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-3 text-sm"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Zahlbar bis</label>
          <input
            type="date"
            className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-3 text-sm"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Rechnungsbetrag (€) *</label>
        <div className="relative mt-1">
          <input
            type="number"
            step="0.01"
            required
            className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-3 pl-8 text-lg font-bold text-blue-700"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <label htmlFor="dkv" className="text-sm font-semibold text-gray-700">An DKV weitergeleitet?</label>
          <input
            type="checkbox"
            id="dkv"
            className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500 h-6 w-6"
            checked={formData.forwardedToDkv}
            onChange={(e) => {
              const checked = e.target.checked;
              setFormData({ 
                ...formData, 
                forwardedToDkv: checked,
                forwardedDate: checked ? new Date().toISOString().split('T')[0] : ''
              });
            }}
          />
        </div>
        
        {formData.forwardedToDkv && (
          <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Weitergeleitet am</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-blue-50 p-3 text-sm"
              value={formData.forwardedDate}
              onChange={(e) => setFormData({ ...formData, forwardedDate: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="flex space-x-3 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 px-4 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 bg-white hover:bg-gray-50 transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isProcessing}
          className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
        >
          {isProcessing ? 'Speichere...' : 'Rechnung sichern'}
        </button>
      </div>
    </form>
  );
};

export default BillForm;
