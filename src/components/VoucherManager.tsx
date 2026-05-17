import React, { useState, useEffect } from 'react';
import { FileText, Printer, Search, Calculator, CheckCircle2, AlertCircle, History, User, Scale, Droplets } from 'lucide-react';
import { cn } from '@/src/lib/utils.ts';

interface PendingRecord {
  recordId: number;
  farmerCnic: string;
  farmerName: string;
  bagsIssued: number;
  bagType: string;
  centerId: number;
  timestamp: string;
}

export default function VoucherManager() {
  const [pendingRecords, setPendingRecords] = useState<PendingRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<PendingRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Voucher data
  const [calculation, setCalculation] = useState({
    grossWeight: '',
    tareWeight: '',
    moistureContent: '10' // Default moisture
  });

  const fetchRecords = () => {
    fetch('/api/vouchers/pending')
      .then(res => res.json())
      .then(setPendingRecords)
      .catch(console.error);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setLoading(true);
    try {
      const res = await fetch('/api/vouchers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          procurementRecordId: selectedRecord.recordId,
          grossWeight: parseFloat(calculation.grossWeight),
          tareWeight: parseFloat(calculation.tareWeight),
          moistureContent: parseFloat(calculation.moistureContent)
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(data.voucherNumber);
        fetchRecords();
        setSelectedRecord(null);
        setCalculation({ grossWeight: '', tareWeight: '', moistureContent: '10' });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const netWeight = (parseFloat(calculation.grossWeight) || 0) - (parseFloat(calculation.tareWeight) || 0);
  const wheatRate40kg = 3900; // Mock from settings normally
  const wheatRateKg = wheatRate40kg / 40;
  const basePayment = netWeight * wheatRateKg;
  const bagDeduction = selectedRecord ? selectedRecord.bagsIssued * (selectedRecord.bagType === 'jute' ? 100 : 50) : 0;
  const deliveryAllowance = selectedRecord ? selectedRecord.bagsIssued * 20 : 0;
  const netPayment = basePayment - bagDeduction + deliveryAllowance;

  return (
    <div className="flex gap-8 items-start relative pb-20 print:block">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white; }
          .parcha-container { border: 2px solid black; padding: 40px; border-radius: 0; }
        }
        .print-only { display: none; }
      `}</style>

      {/* Pending Records List */}
      <div className="flex-1 space-y-6 no-print">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide">Parcha Billing Terminal</h2>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Acquisition & Payment Node</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="SEARCH BY CNIC..." 
              className="bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#DAA520] outline-none w-64" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {pendingRecords.map((record) => (
            <div 
              key={record.recordId}
              onClick={() => setSelectedRecord(record)}
              className={cn(
                "bg-white p-5 rounded-xl border transition-all cursor-pointer group",
                selectedRecord?.recordId === record.recordId ? "border-[#DAA520] shadow-lg ring-1 ring-[#DAA520]" : "border-slate-200 hover:border-slate-300"
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#DAA520]/10 group-hover:text-[#DAA520] transition-colors">
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight text-slate-900">{record.farmerName}</h4>
                    <p className="text-[10px] font-mono text-slate-400 font-bold">{record.farmerCnic}</p>
                    <div className="flex gap-3 mt-2">
                       <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">{record.bagsIssued} {record.bagType} BAGS</span>
                       <span className="text-[9px] font-black bg-slate-50 text-slate-400 px-2 py-0.5 rounded uppercase">ISSUED: {new Date(record.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <FileText size={18} className="text-slate-200 group-hover:text-[#DAA520] ml-auto transition-colors" />
                </div>
              </div>
            </div>
          ))}
          {pendingRecords.length === 0 && (
            <div className="p-20 bg-white rounded-xl border border-dashed border-slate-200 text-center opacity-50">
              <History size={40} className="mx-auto mb-4" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">No pending receipts to process</p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Terminal */}
      <div className="w-96 shrink-0 sticky top-4 no-print">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <Calculator size={20} className="text-[#DAA520]" />
              <h3 className="text-xs font-black uppercase tracking-widest">Weight & Billing Entry</h3>
            </div>
          </div>

          {!selectedRecord ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <FileText size={24} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select a record to start billing</p>
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="p-8 space-y-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing Farmer</span>
                  <span className="text-[10px] font-black text-[#DAA520]">{selectedRecord.farmerCnic}</span>
                </div>
                <p className="text-xs font-black text-slate-900 uppercase">{selectedRecord.farmerName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Gross Weight (kg)</label>
                  <div className="relative">
                    <Scale size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="number" 
                      step="0.01"
                      value={calculation.grossWeight}
                      onChange={(e) => setCalculation(prev => ({ ...prev, grossWeight: e.target.value }))}
                      className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-[#DAA520] outline-none"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Tare (Bags) (kg)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={calculation.tareWeight}
                    onChange={(e) => setCalculation(prev => ({ ...prev, tareWeight: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-[#DAA520] outline-none"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Moisture Content (%)</label>
                <div className="relative">
                  <Droplets size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="number" 
                    step="0.1"
                    value={calculation.moistureContent}
                    onChange={(e) => setCalculation(prev => ({ ...prev, moistureContent: e.target.value }))}
                    className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-[#DAA520] outline-none"
                    required
                  />
                </div>
              </div>

              {/* Real-time Math Summary */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Net Weight (kg)</span>
                  <span className="text-slate-900 font-black">{netWeight.toFixed(2)} KG</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Bag Price Deduction</span>
                  <span className="text-red-600 font-black">- PKR {bagDeduction}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Delivery Allowance</span>
                  <span className="text-emerald-600 font-black">+ PKR {deliveryAllowance}</span>
                </div>
                <div className="h-px bg-slate-200 my-2" />
                <div className="flex justify-between items-end">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Net Payable</span>
                   <span className="text-xl font-black text-[#1a5928] tracking-tight">PKR {netPayment.toLocaleString()}</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading || !calculation.grossWeight}
                className="w-full bg-[#DAA520] text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#DAA520]/20 hover:shadow-2xl transition-all disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Generate Parcha Voucher'}
              </button>
            </form>
          )}

          {success && (
            <div className="p-8 bg-emerald-50 border-t border-emerald-100 animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center gap-3 text-emerald-600 mb-4">
                <CheckCircle2 size={24} />
                <p className="text-xs font-black uppercase tracking-widest leading-none">Voucher Generated Successfully</p>
              </div>
              <p className="text-[10px] font-mono font-bold text-emerald-600/60 mb-6">NUMBER: {success}</p>
              <button 
                onClick={() => window.print()}
                className="w-full bg-slate-900 text-white flex items-center justify-center gap-3 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
              >
                <Printer size={14} />
                Print Official Parcha
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Print View Parcha */}
      <div className="print-only fixed inset-0 bg-white z-[1000] p-12 parcha-container">
        <div className="flex justify-between items-start mb-12">
          <div className="flex gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Government_of_the_Punjab_Logo.svg/1024px-Government_of_the_Punjab_Logo.svg.png" className="w-16 h-16" />
            <div>
              <h1 className="text-xl font-black uppercase leading-tight">Food Department</h1>
              <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Government of the Punjab</p>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase">Wheat Procurement Scheme 2024</p>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block border-2 border-black p-2 font-black text-xs uppercase mb-2">Payment Voucher</div>
            <p className="text-sm font-black font-mono">{success || 'VOUCH-PENDING'}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">DATE: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div className="space-y-4">
            <div className="border-b-2 border-slate-100 pb-2">
              <p className="text-[10px] font-black text-slate-400 uppercase">Farmer Identity</p>
              <p className="text-sm font-black uppercase">{selectedRecord?.farmerName || '---'}</p>
              <p className="text-xs font-mono font-bold">{selectedRecord?.farmerCnic || '---'}</p>
            </div>
            <div className="border-b-2 border-slate-100 pb-2">
              <p className="text-[10px] font-black text-slate-400 uppercase">Center Information</p>
              <p className="text-sm font-black uppercase">Center Sargodha Node-1</p>
              <p className="text-xs font-bold text-slate-500 uppercase">District Sargodha</p>
            </div>
          </div>
          <div className="bg-slate-50 p-6 border-2 border-slate-200">
            <h3 className="text-xs font-black uppercase tracking-widest mb-4">Financial Breakdown</h3>
            <div className="space-y-2">
               <div className="flex justify-between text-xs font-bold uppercase">
                  <span>Gross Weight:</span>
                  <span>{calculation.grossWeight} KG</span>
               </div>
               <div className="flex justify-between text-xs font-bold uppercase">
                  <span>Tare Weight:</span>
                  <span>{calculation.tareWeight} KG</span>
               </div>
               <div className="flex justify-between text-xs font-bold uppercase">
                  <span>Net Weight:</span>
                  <span>{netWeight.toFixed(2)} KG</span>
               </div>
               <div className="h-px bg-slate-300 my-2" />
               <div className="flex justify-between text-sm font-black uppercase pt-2">
                  <span>Total Payable:</span>
                  <span>PKR {netPayment.toLocaleString()}</span>
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 text-center pt-20">
          <div>
            <div className="border-t-2 border-black pt-2">
              <p className="text-[10px] font-black uppercase">Center In-Charge</p>
            </div>
          </div>
          <div>
            <div className="border-t-2 border-black pt-2">
              <p className="text-[10px] font-black uppercase">Accountant Signature</p>
            </div>
          </div>
          <div>
            <div className="border-t-2 border-black pt-2">
              <p className="text-[10px] font-black uppercase">Farmer Fingerprint</p>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-slate-200 text-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">Verified by provincial digital procurement ledger • No manual edits permitted</p>
        </div>
      </div>
    </div>
  );
}
