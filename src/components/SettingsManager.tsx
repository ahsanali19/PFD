import React, { useState, useEffect } from 'react';
import { Save, Settings2, Info } from 'lucide-react';
import { cn } from '@/src/lib/utils.ts';

interface SettingsData {
  schemeYear: number;
  wheatRate40kg: string | number;
  deliveryChargesJute: string | number;
  deliveryChargesPp: string | number;
  wheatSaleRate: string | number;
  subsidyAmount: string | number;
  bagPrices: string | number;
}

export default function SettingsManager() {
  const [settings, setSettings] = useState<SettingsData>({
    schemeYear: 2025,
    wheatRate40kg: 0,
    deliveryChargesJute: 0,
    deliveryChargesPp: 0,
    wheatSaleRate: 0,
    subsidyAmount: 0,
    bagPrices: 0
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setSettings(data);
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        setMessage('Settings updated successfully (UPSERT protocol active)');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-sm font-black uppercase tracking-wide">Policy Management</h2>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Directorate Level Control Panel</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl shadow-sm p-10 space-y-8 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-blue-600 border-b border-slate-100 pb-2">Procurement Rates</h3>
            
            <div className="space-y-4">
              <div className="group">
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Wheat Rate (Per 40kg)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-mono">RS.</span>
                  <input 
                    type="number"
                    name="wheatRate40kg"
                    value={settings.wheatRate40kg}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-12 pr-4 py-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Bag Prices (Global)</label>
                <input 
                  type="number"
                  name="bagPrices"
                  value={settings.bagPrices}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Subsidy Amount</label>
                <input 
                  type="number"
                  name="subsidyAmount"
                  value={settings.subsidyAmount}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-emerald-600 border-b border-slate-100 pb-2">Logistics & Sales</h3>
            
            <div className="space-y-4">
              <div className="group">
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Delivery Charges (Jute)</label>
                <input 
                  type="number"
                  name="deliveryChargesJute"
                  value={settings.deliveryChargesJute}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Delivery Charges (PP)</label>
                <input 
                  type="number"
                  name="deliveryChargesPp"
                  value={settings.deliveryChargesPp}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Wheat Sale Rate</label>
                <input 
                  type="number"
                  name="wheatSaleRate"
                  value={settings.wheatSaleRate}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded">
              <Info size={14} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Updates will cascade atomically across all nodes.</span>
          </div>
          
          <div className="flex items-center gap-4">
            {message && <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest animate-pulse">{message}</span>}
            <button 
              type="submit"
              disabled={saving}
              className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all disabled:opacity-50"
            >
              <Save size={12} />
              <span>{saving ? 'Processing...' : 'Execute Policy Update'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
