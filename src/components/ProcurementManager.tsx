import React, { useState, useEffect } from 'react';
import { Package, Scale, CreditCard, ChevronRight, Calculator, FileCheck, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/src/lib/utils.ts';

interface DailyStats {
  bagsIssuedToday: number;
  wheatWeightToday: number;
  paymentsProcessedToday: number;
}

interface ProcurementRecord {
  farmerCnic: string;
  bagsIssued: number;
  wheatWeight: string; // Calculated
  centerId: number;
  operatorId: number;
}

export default function ProcurementManager() {
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    bagsIssuedToday: 0,
    wheatWeightToday: 0,
    paymentsProcessedToday: 0
  });

  const [settings, setSettings] = useState({
    wheatRate40kg: 3900,
  });

  const [formData, setFormData] = useState({
    farmerCnic: '',
    bagsIssued: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto-calculated fields
  const bagWeightKg = 50; // Standard 50kg bag
  const wheatWeightMt = (formData.bagsIssued * bagWeightKg) / 1000;
  const totalWeight40kg = (formData.bagsIssued * bagWeightKg) / 40;
  const totalPayment = totalWeight40kg * settings.wheatRate40kg;

  useEffect(() => {
    // Fetch center stats
    fetch('/api/procurement/daily-summary')
      .then(res => res.json())
      .then(setDailyStats)
      .catch(console.error);

    // Fetch rates
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.wheatRate40kg) {
          setSettings({ wheatRate40kg: parseFloat(data.wheatRate40kg) });
        }
      });
  }, []);

  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 13) value = value.slice(0, 13);
    
    // Format: 00000-0000000-0
    let formatted = value;
    if (value.length > 5 && value.length <= 12) {
      formatted = `${value.slice(0, 5)}-${value.slice(5)}`;
    } else if (value.length > 12) {
      formatted = `${value.slice(0, 5)}-${value.slice(5, 12)}-${value.slice(12)}`;
    }
    
    setFormData(prev => ({ ...prev, farmerCnic: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{5}-\d{7}-\d{1}$/.test(formData.farmerCnic)) {
      setError('CNIC must follow 00000-0000000-0 format');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/procurement/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          wheatWeight: wheatWeightMt.toString(),
          centerId: 1, // Mocked for demo
          operatorId: 1 // Mocked for demo
        })
      });

      if (res.ok) {
        setSuccess('Intake record stored successfully');
        setFormData({ farmerCnic: '', bagsIssued: 0 });
        // Refresh local stats
        setDailyStats(prev => ({
          ...prev,
          bagsIssuedToday: prev.bagsIssuedToday + formData.bagsIssued,
          wheatWeightToday: prev.wheatWeightToday + wheatWeightMt
        }));
      } else {
        const data = await res.json();
        setError(data.error || 'Submission failed');
      }
    } catch (err) {
      setError('Network synchronization error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Daily Summary Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Package size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bags Issued Today</p>
            <p className="text-xl font-black text-slate-900">{dailyStats.bagsIssuedToday.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Scale size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weight Procurement</p>
            <p className="text-xl font-black text-slate-900">{dailyStats.wheatWeightToday.toFixed(2)} MT</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. Daily Payment</p>
            <p className="text-xl font-black text-slate-900">PKR {(dailyStats.bagsIssuedToday * 0.05 * 1.25 * settings.wheatRate40kg).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intake Form */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest">Procurement Intake Form</h3>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 mt-1">Direct Field Entry Node</p>
            </div>
            <FileCheck size={18} className="text-emerald-400" />
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Farmer CNIC (National ID)</label>
                <input 
                  type="text"
                  placeholder="00000-0000000-0"
                  value={formData.farmerCnic}
                  onChange={handleCnicChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Quantity (Number of Bags)</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={formData.bagsIssued}
                    onChange={(e) => setFormData(prev => ({ ...prev, bagsIssued: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    required
                    min="1"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Jute/PP</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold uppercase leading-tight">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-start gap-2 text-emerald-600">
                <Check size={14} className="shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold uppercase leading-tight">{success}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all disabled:opacity-50"
            >
              <Package size={14} />
              <span>{loading ? 'Recording...' : 'Finalize Bardana Issuance'}</span>
            </button>
          </form>
        </div>

        {/* Real-time Calculation Panel */}
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-8">
            <Calculator size={16} className="text-slate-400" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Yield & Payment Calculator</h3>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Calculated Weight (MT)</span>
              <span className="text-lg font-black text-slate-900">{wheatWeightMt.toFixed(3)}</span>
            </div>
            
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Procurement Base Rate</span>
              <span className="text-xs font-bold text-slate-400">RS. {settings.wheatRate40kg} / 40KG</span>
            </div>

            <div className="flex justify-between items-center bg-blue-600 p-6 rounded-xl shadow-xl shadow-blue-100 text-white">
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-60">Estimated Total Payment</span>
                <p className="text-2xl font-black tracking-tight">RS. {totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <ChevronRight size={24} className="opacity-20" />
            </div>
          </div>

          <p className="mt-10 text-[9px] font-bold text-slate-400 leading-relaxed uppercase text-center tracking-widest opacity-60">
            * Calculations based on standard {bagWeightKg}kg wheat weight per bag.<br />
            Directorate policy rates applied for current scheme year.
          </p>
        </div>
      </div>
    </div>
  );
}
