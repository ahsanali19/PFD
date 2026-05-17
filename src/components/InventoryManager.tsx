import React, { useState, useEffect } from 'react';
import { Package, Truck, AlertTriangle, ArrowRight, History, Plus, Filter, Search, Warehouse, BarChart3 } from 'lucide-react';
import { cn } from '@/src/lib/utils.ts';

interface InventoryItem {
  centerId: number;
  centerName: string;
  centerCode: string;
  juteBags: number;
  ppBags: number;
  updatedAt: string | null;
}

export default function InventoryManager() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<InventoryItem | null>(null);
  
  // Dispatch form state
  const [dispatchForm, setDispatchForm] = useState({
    centerId: 0,
    bagType: 'pp',
    quantity: 0
  });

  const fetchInventory = () => {
    setLoading(true);
    fetch('/api/inventory/centers')
      .then(res => res.json())
      .then(setInventory)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/inventory/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          districtId: 1, // Static for demo
          centerId: dispatchForm.centerId || selectedCenter?.centerId,
          bagType: dispatchForm.bagType,
          quantity: dispatchForm.quantity
        })
      });
      if (res.ok) {
        setShowDispatchModal(false);
        fetchInventory();
        setDispatchForm({ centerId: 0, bagType: 'pp', quantity: 0 });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const STOCK_THRESHOLD = 500; // Example threshold for demo

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wide">Bardana Stock Ledger</h2>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Inventory Control • Jute & PP Bags</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowDispatchModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a5928] text-white rounded-lg text-xs font-bold shadow-lg shadow-[#1a5928]/20 hover:bg-[#154620] transition-all"
          >
            <Truck size={14} />
            <span>Dispatch New Stock</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Provincial Stock</p>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {(inventory.reduce((acc, curr) => acc + (curr.juteBags || 0) + (curr.ppBags || 0), 0)).toLocaleString()}
          </p>
          <div className="mt-4 flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#DAA520]" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Jute: {inventory.reduce((acc, curr) => acc + (curr.juteBags || 0), 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">PP: {inventory.reduce((acc, curr) => acc + (curr.ppBags || 0), 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Critical Low Stock</p>
          <p className="text-2xl font-black text-red-600 tracking-tight">
            {inventory.filter(i => (i.juteBags || 0) + (i.ppBags || 0) < STOCK_THRESHOLD).length} Centers
          </p>
          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Below 10% Required Level</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Utilization</p>
            <p className="text-2xl font-black text-[#1a5928] tracking-tight">64.2%</p>
          </div>
          <BarChart3 className="text-[#1a5928] opacity-20" size={40} />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Center-wise Stock Allocation</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
              <input type="text" placeholder="Search center..." className="pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded text-[10px] outline-none focus:ring-1 focus:ring-[#1a5928]" />
            </div>
            <button className="p-1.5 bg-slate-50 border border-slate-100 rounded hover:bg-slate-100"><Filter size={12} /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Center Info</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jute Bags (MT)</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">PP Bags (MT)</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Stock</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {inventory.map((item) => {
                const total = (item.juteBags || 0) + (item.ppBags || 0);
                const isLow = total < STOCK_THRESHOLD;
                
                return (
                  <tr key={item.centerId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Warehouse className="text-slate-300" size={16} />
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase">{item.centerName}</p>
                          <p className="text-[9px] text-slate-400 font-bold">{item.centerCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-600">{(item.juteBags || 0).toLocaleString()}</td>
                    <td className="p-4 text-xs font-bold text-slate-600">{(item.ppBags || 0).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={cn(
                        "text-xs font-black",
                        isLow ? "text-red-600" : "text-slate-900"
                      )}>
                        {total.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      {isLow ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 rounded text-[9px] font-black uppercase">
                          <AlertTriangle size={10} />
                          CRITICAL LOW
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black uppercase">
                          <Plus size={10} />
                          OPTIMAL
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => { setSelectedCenter(item); setShowDispatchModal(true); }}
                        className="text-slate-400 hover:text-[#1a5928] transition-all"
                      >
                        <ArrowRight size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Truck className="text-[#DAA520]" size={20} />
                <h3 className="text-sm font-black uppercase tracking-wider">Dispatch Stock</h3>
              </div>
              <button onClick={() => setShowDispatchModal(false)} className="text-white/40 hover:text-white transition-colors">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleDispatch} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Target Center</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1a5928]"
                  value={dispatchForm.centerId || selectedCenter?.centerId || ''}
                  onChange={(e) => setDispatchForm(prev => ({ ...prev, centerId: parseInt(e.target.value) }))}
                  required
                >
                  <option value="">Select Center...</option>
                  {inventory.map(i => <option key={i.centerId} value={i.centerId}>{i.centerName} ({i.centerCode})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Bag Material</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setDispatchForm(prev => ({ ...prev, bagType: 'pp' }))}
                      className={cn(
                        "flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
                        dispatchForm.bagType === 'pp' ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200" : "bg-white text-slate-400 border-slate-200"
                      )}
                    >
                      PP BAGS
                    </button>
                    <button 
                      type="button"
                      onClick={() => setDispatchForm(prev => ({ ...prev, bagType: 'jute' }))}
                      className={cn(
                        "flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
                        dispatchForm.bagType === 'jute' ? "bg-[#DAA520] text-white border-[#DAA520] shadow-lg shadow-[#DAA520]/20" : "bg-white text-slate-400 border-slate-200"
                      )}
                    >
                      JUTE
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Quantity (Bags)</label>
                  <input 
                    type="number"
                    value={dispatchForm.quantity}
                    onChange={(e) => setDispatchForm(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs font-bold outline-none"
                    placeholder="e.g. 5000"
                    required
                  />
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl flex items-start gap-3 border border-emerald-100">
                <Package className="text-emerald-600 shrink-0" size={16} />
                <div>
                  <p className="text-[10px] font-black text-emerald-800 uppercase tracking-tight">Stock Validation Pass</p>
                  <p className="text-[9px] text-emerald-600/70 font-bold leading-tight mt-1">This amount will be deducted from District Godown #4 and added to the selected center's ledger.</p>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#1a5928] text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[#1a5928]/20 hover:bg-[#154620] transition-all"
              >
                Confirm Dispatch
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
