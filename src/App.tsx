import React, { useState, useEffect, useMemo } from 'react';
import { Bill, GroupedBills } from './types';
import DoctorSection from './components/DoctorSection';
import BillForm from './components/BillForm';
import CameraView from './components/CameraView';
import { parseInvoiceImage } from './geminiServices';

const App: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('med_bills');
    return saved ? JSON.parse(saved) : [];
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<Partial<Bill> | null>(null);

  useEffect(() => {
    localStorage.setItem('med_bills', JSON.stringify(bills));
  }, [bills]);

  const handleAddBill = (newBillData: Omit<Bill, 'id'>) => {
    const newBill: Bill = {
      ...newBillData,
      id: crypto.randomUUID(),
    };
    setBills([...bills, newBill]);
    setIsFormOpen(false);
    setScannedData(null);
  };

  const handleToggleDkv = (id: string) => {
    setBills(bills.map(b => {
      if (b.id === id) {
        const isNowForwarded = !b.forwardedToDkv;
        return {
          ...b,
          forwardedToDkv: isNowForwarded,
          forwardedDate: isNowForwarded ? new Date().toISOString().split('T')[0] : ''
        };
      }
      return b;
    }));
  };

  const handleDeleteBill = (id: string) => {
    if (window.confirm('Möchten Sie diese Rechnung wirklich löschen?')) {
      setBills(bills.filter(b => b.id !== id));
    }
  };

  const handleCameraCapture = async (base64: string) => {
    setIsCameraOpen(false);
    setIsScanning(true);
    setIsFormOpen(true);

    try {
      const extracted = await parseInvoiceImage(base64);
      setScannedData(extracted);
      setIsScanning(false);
    } catch (err) {
      console.error('AI Extraction failed:', err);
      alert('Fehler beim Scannen. Bitte manuell eingeben.');
      setIsScanning(false);
    }
  };

  const groupedAndSortedBills = useMemo(() => {
    const groups: Record<string, Bill[]> = {};

    bills.forEach(bill => {
      const name = bill.doctorName || 'Unbekannter Arzt';
      if (!groups[name]) groups[name] = [];
      groups[name].push(bill);
    });

    const result: GroupedBills[] = Object.keys(groups).map(doctorName => ({
      doctorName,
      bills: groups[doctorName].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
      totalAmount: groups[doctorName].reduce((sum, b) => sum + b.amount, 0),
    }));

    return result.sort((a, b) => a.doctorName.localeCompare(b.doctorName));
  }, [bills]);

  const grandTotal = useMemo(
    () => bills.reduce((sum, b) => sum + b.amount, 0),
    [bills]
  );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-36 relative">
      {isCameraOpen && (
        <CameraView
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      <header className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-b-[2.5rem] shadow-xl mb-6 sticky top-0 z-30">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-black uppercase tracking-tighter">
            MedBill Tracker
          </h1>
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            <i className="fas fa-stethoscope text-lg"></i>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <p className="text-blue-100 text-[9px] font-bold uppercase tracking-widest mb-1">
              Gesamtbetrag
            </p>
            <p className="text-2xl font-black truncate">
              {grandTotal.toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR',
              })}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <p className="text-blue-100 text-[9px] font-bold uppercase tracking-widest mb-1">
              Belege
            </p>
            <p className="text-2xl font-black">{bills.length}</p>
          </div>
        </div>
      </header>

      <main className="px-4">
        {isFormOpen ? (
          <div className="bg-white p-1 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
            <div className="bg-gray-50 p-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-gray-900 font-black text-lg">
                  {isScanning
                    ? '🔍 Scan läuft...'
                    : scannedData
                    ? 'Daten kontrollieren'
                    : 'Manuelle Eingabe'}
                </h2>
                <p className="text-xs text-gray-400 font-medium">
                  Alle Daten sind korrigierbar
                </p>
              </div>

              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setScannedData(null);
                  setIsScanning(false);
                }}
                className="bg-gray-200 text-gray-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-gray-300"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>

            {isScanning ? (
              <div className="p-6 text-center text-gray-500 animate-pulse">
                <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
                <p>Scan läuft… bitte warten</p>
              </div>
            ) : (
              <BillForm
                initialData={scannedData || undefined}
                onSubmit={handleAddBill}
              />
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {groupedAndSortedBills.map(group => (
              <DoctorSection
                key={group.doctorName}
                doctorName={group.doctorName}
                bills={group.bills}
                totalAmount={group.totalAmount}
                onToggleDkv={handleToggleDkv}
                onDelete={handleDeleteBill}
              />
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => setIsCameraOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white w-16 h-16 rounded-full shadow-xl flex items-center justify-center text-2xl hover:bg-blue-700 transition"
      >
        <i className="fas fa-camera"></i>
      </button>
    </div>
  );
};

export default App;
