import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, User, Scale, Package, Printer, ChevronRight, History, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';
import { cn } from '@/src/lib/utils.ts';
import { motion } from 'motion/react';

interface Farmer {
  id: number;
  name: string;
  cnic: string;
  acreage: string;
  fatherName: string;
}

interface Inventory {
  juteBags: number;
  ppBags: number;
}

export default function BardanaIssuance() {
  const [searchCnic, setSearchCnic] = useState('');
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(false);
  const [successSlip, setSuccessSlip] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Form state
  const [bagsRequested, setBagsRequested] = useState('');
  const [bagType, setBagType] = useState<'jute' | 'pp'>('pp');
  const [repName, setRepName] = useState('');

  const handleSearch = async () => {
    if (!searchCnic) return;
    setLoading(true);
    setError(null);
    setFarmer(null);
    setSuccessSlip(null);
    
    try {
      const res = await fetch(`/api/farmers/search/${searchCnic}`);
      const data = await res.json();
      
      if (data) {
        setFarmer(data);
        fetchHistory(data.id);
        // Also fetch center inventory (mocked centerId 1 for demo)
        fetchInventory(1); 
      } else {
        setError('Access Denied: Farmer must be registered in the system first.');
      }
    } catch (err) {
      setError('System Error during verification');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async (centerId: number) => {
    try {
      const res = await fetch('/api/inventory/centers');
      const data = await res.json();
      const center = data.find((c: any) => c.centerId === centerId);
      if (center) setInventory({ juteBags: center.juteBags, ppBags: center.ppBags });
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHistory = async (farmerId: number) => {
    try {
      const res = await fetch(`/api/bardana/history/${farmerId}`);
      const data = await res.json();
      setHistory(data);
    } catch (e) {
      console.error(e);
    }
  };

  const maxEligibility = farmer ? Math.floor(parseFloat(farmer.acreage) * 10) : 0; // Example: 10 bags per acre
  const alreadyIssued = history.reduce((acc, curr) => acc + (curr.bagsIssued || 0), 0);
  const remainingEligibility = maxEligibility - alreadyIssued;

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(bagsRequested);
    
    if (qty > remainingEligibility) {
      alert(`Requested quantity exceeds maximum eligibility (${remainingEligibility} bags remaining)`);
      return;
    }

    if (inventory && (bagType === 'jute' ? (inventory.juteBags || 0) : (inventory.ppBags || 0)) < qty) {
      alert('Insufficient stock in center inventory');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bardana/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: farmer?.id,
          centerId: 1, // Mock
          bagType,
          bagsRequested: qty,
          bagsIssued: qty,
          representativeName: repName
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessSlip(data.slipNumber);
        if (farmer) fetchHistory(farmer.id);
        fetchInventory(1);
        setBagsRequested('');
        setRepName('');
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .main-content { padding: 0 !important; }
        }
        .print-only { display: none; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wide">Bardana Issuance Terminal</h2>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Operational Policy Enforcement Node</p>
        </div>
        <div className="flex items-center gap-4">
           {inventory && (
              <div className="flex gap-4">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Jute Bags</p>
                  <p className="text-xs font-black text-[#DAA520]">{inventory.juteBags || 0}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">PP Bags</p>
                  <p className="text-xs font-black text-blue-400">{inventory.ppBags || 0}</p>
                </div>
              </div>
           )}
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="max-w-2xl mx-auto no-print">
        <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3 text-center">Verify Farmer Identity via CNIC</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-[#1a5928]/5 rounded-2xl blur-xl group-focus-within:bg-[#1a5928]/10 transition-all" />
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="00000-0000000-0"
                value={searchCnic}
                onChange={(e) => setSearchCnic(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-xl text-sm font-black tracking-widest focus:border-[#1a5928] outline-none transition-all shadow-sm"
              />
            </div>
            <button 
              onClick={handleSearch}
              disabled={loading || !searchCnic}
              className="bg-[#1a5928] text-white px-8 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#154620] transition-all disabled:opacity-50 shadow-lg shadow-[#1a5928]/20"
            >
              {loading ? 'Verifying...' : 'Authenticate'}
            </button>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-4 text-red-600"
          >
            <ShieldAlert size={20} className="shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
              <p className="text-[9px] font-bold opacity-60 uppercase mt-0.5">Please direct farmer to the Registration Counter.</p>
            </div>
          </motion.div>
        )}
      </div>

      {farmer && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
          {/* Farmer Profile & Eligibility */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <User size={24} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight text-slate-900">{farmer.name}</h4>
                  <p className="text-[10px] font-mono text-slate-400 font-bold">{farmer.cnic}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Father's Name</span>
                  <span className="text-[10px] font-black text-slate-900 uppercase">{farmer.fatherName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Acreage</span>
                  <span className="text-[10px] font-black text-[#1a5928]">{farmer.acreage} ACRES</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Bardana Eligibility</p>
                <div className="p-4 bg-[#1a5928]/5 rounded-xl border border-[#1a5928]/10 text-center">
                  <p className="text-2xl font-black text-[#1a5928]">{remainingEligibility}</p>
                  <p className="text-[9px] font-bold text-[#1a5928]/60 uppercase tracking-tight">Remaining Bag Allowance</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <div className="flex-1 p-2 bg-slate-50 rounded-lg text-center">
                    <p className="text-xs font-black text-slate-600">{maxEligibility}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Max</p>
                  </div>
                  <div className="flex-1 p-2 bg-slate-50 rounded-lg text-center">
                    <p className="text-xs font-black text-slate-600">{alreadyIssued}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Issued</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Issuance History */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <History size={14} className="text-slate-400" />
                Previous Issuance
              </h4>
              <div className="space-y-3">
                {history.map((tx, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-black uppercase text-slate-400">{new Date(tx.issuedAt).toLocaleDateString()}</span>
                      <span className={cn(
                        "text-[8px] font-black px-1.5 py-0.5 rounded uppercase",
                        tx.bagType === 'jute' ? "bg-[#DAA520]/10 text-[#DAA520]" : "bg-blue-50 text-blue-600"
                      )}>
                        {tx.bagType}
                      </span>
                    </div>
                    <p className="text-[10px] font-black text-slate-900">{tx.bagsIssued} Bags Issued</p>
                    <p className="text-[8px] font-mono text-slate-400 mt-1">SLIP: {tx.issuanceSlipNumber}</p>
                  </div>
                ))}
                {history.length === 0 && (
                  <p className="text-[10px] text-center text-slate-400 font-bold uppercase py-4">No issuance history</p>
                )}
              </div>
            </div>
          </div>

          {/* ISSUANCE FORM */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
               <div className="p-6 bg-slate-900 text-white flex items-center gap-3">
                  <Package size={20} className="text-[#DAA520]" />
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest">Bardana Issuance Protocol</h3>
                    <p className="text-[9px] text-white/40 font-bold uppercase">Manual stock deduction & Slip generation</p>
                  </div>
               </div>

               <form onSubmit={handleIssue} className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">Quantity to Issue</label>
                        <div className="relative">
                           <Scale size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                           <input 
                              type="number"
                              required
                              value={bagsRequested}
                              onChange={(e) => setBagsRequested(e.target.value)}
                              max={remainingEligibility}
                              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-black focus:border-[#DAA520] outline-none transition-all"
                              placeholder="0"
                           />
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 mt-2">Max allowed: {remainingEligibility} bags</p>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">Bag Type Distribution</label>
                        <div className="grid grid-cols-2 gap-3">
                           <button 
                              type="button"
                              onClick={() => setBagType('pp')}
                              className={cn(
                                "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                bagType === 'pp' ? "border-blue-500 bg-blue-50" : "border-slate-100 bg-white"
                              )}
                           >
                              <div className={cn("w-3 h-3 rounded-full border-2", bagType === 'pp' ? "bg-blue-500 border-blue-500" : "border-slate-200")} />
                              <span className="text-[10px] font-black uppercase">PP Bags</span>
                           </button>
                           <button 
                              type="button"
                              onClick={() => setBagType('jute')}
                              className={cn(
                                "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                bagType === 'jute' ? "border-[#DAA520] bg-[#DAA520]/10" : "border-slate-100 bg-white"
                              )}
                           >
                              <div className={cn("w-3 h-3 rounded-full border-2", bagType === 'jute' ? "bg-[#DAA520] border-[#DAA520]" : "border-slate-200")} />
                              <span className="text-[10px] font-black uppercase">Jute Bags</span>
                           </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">Recipient/Representative Name</label>
                        <input 
                           type="text"
                           value={repName}
                           onChange={(e) => setRepName(e.target.value)}
                           className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-black focus:border-[#DAA520] outline-none transition-all"
                           placeholder="OWNER / REPRESENTATIVE NAME"
                        />
                        <p className="text-[9px] font-bold text-slate-400 mt-2">Leave blank if farmer is collecting in person</p>
                      </div>

                      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                        <div className="flex items-center gap-3 text-amber-700 mb-3">
                           <AlertTriangle size={18} />
                           <h5 className="text-[10px] font-black uppercase tracking-widest">Safety Check</h5>
                        </div>
                        <p className="text-[10px] font-bold text-amber-800 leading-relaxed">
                          By confirming, you verify that the physical stock is available and the farmer's identity has been verified through original CNIC.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading || !bagsRequested || parseInt(bagsRequested) <= 0}
                    className="w-full bg-[#1a5928] text-white py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-[#1a5928]/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    {loading ? 'Processing Transaction...' : 'Authorize Bardana Issuance'}
                  </button>
               </form>

               {successSlip && (
                 <div className="p-8 bg-emerald-50 border-t border-emerald-100 animate-in slide-in-from-bottom duration-500">
                    <div className="flex items-center gap-4 mb-6">
                       <CheckCircle2 size={32} className="text-emerald-500" />
                       <div>
                          <h4 className="text-xs font-black text-emerald-900 uppercase">Issuance Slip Generated</h4>
                          <p className="text-[10px] font-bold text-emerald-700/60 uppercase">Slip Number: {successSlip}</p>
                       </div>
                    </div>
                    <button 
                       onClick={() => window.print()}
                       className="w-full bg-slate-900 text-white flex items-center justify-center gap-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl"
                    >
                       <Printer size={16} />
                       Print Official Issuance Slip
                    </button>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {!farmer && !error && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center no-print">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
              <Package size={40} />
           </div>
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Ready for Verification</h3>
           <p className="text-[10px] font-bold text-slate-300 uppercase mt-2">Enter CNIC above to begin the issuance protocol</p>
        </div>
      )}

      {/* PRINTABLE SLIP */}
      <div className="print-only p-12 bg-white border-4 border-black font-sans">
         <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-8">
            <div className="flex gap-4">
               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Government_of_the_Punjab_Logo.svg/1024px-Government_of_the_Punjab_Logo.svg.png" className="w-20 h-20" />
               <div>
                  <h1 className="text-2xl font-black uppercase">Food Department</h1>
                  <p className="text-sm font-bold uppercase tracking-widest">Government of the Punjab</p>
                  <p className="text-xs font-bold text-slate-500 mt-2 uppercase">Bardana Issuance Slip • Scheme 2024</p>
               </div>
            </div>
            <div className="text-right">
               <div className="border-4 border-black p-3 font-black text-xl uppercase mb-2">Issuance Slip</div>
               <p className="text-sm font-black font-mono">{successSlip}</p>
               <p className="text-xs font-bold mt-1">{new Date().toLocaleString()}</p>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="space-y-6">
               <div className="border-b-2 border-slate-100 pb-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Farmer Identity</p>
                  <p className="text-lg font-black uppercase">{farmer?.name}</p>
                  <p className="text-sm font-mono font-bold">{farmer?.cnic}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase mt-1">S/O: {farmer?.fatherName}</p>
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Acreage Record</p>
                  <p className="text-sm font-black uppercase">{farmer?.acreage} ACRES</p>
               </div>
            </div>
            <div className="bg-slate-50 p-8 border-2 border-black">
               <h3 className="text-xs font-black uppercase tracking-widest mb-6">Issuance Details</h3>
               <div className="space-y-4">
                  <div className="flex justify-between text-sm font-bold">
                     <span>BAG TYPE:</span>
                     <span className="uppercase font-black">{bagType}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                     <span>QUANTITY ISSUED:</span>
                     <span className="font-black">{bagsRequested} BAGS</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t-2 border-slate-200 pt-4">
                     <span>REPRESENTATIVE:</span>
                     <span className="uppercase font-black">{repName || 'SELF'}</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="mt-20 grid grid-cols-2 gap-20">
            <div className="space-y-12">
               <div className="border-t-2 border-black pt-4">
                  <p className="text-[10px] font-black uppercase">Farmer Signature / Thumb Impression</p>
               </div>
            </div>
            <div className="space-y-12">
               <div className="border-t-2 border-black pt-4">
                  <p className="text-[10px] font-black uppercase">Center In-Charge (Stamp & Sign)</p>
               </div>
            </div>
         </div>

         <div className="mt-20 pt-8 border-t border-slate-200 text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">This is a computer generated document • Verification ID: {successSlip?.split('-')[1]}</p>
         </div>
      </div>
    </div>
  );
}
