import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Shield, BadgeCheck, User, AlertCircle, X, Check, Landmark, MapPin, Tablet } from 'lucide-react';
import { cn } from '@/src/lib/utils.ts';

interface Farmer {
  id?: number;
  name: string;
  fatherName: string;
  cnic: string;
  mobileNumber: string;
  acreage: string;
  bankIban: string;
}

export default function FarmerManager() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<Farmer>({
    name: '',
    fatherName: '',
    cnic: '',
    mobileNumber: '',
    acreage: '',
    bankIban: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Constants
  const BAGS_PER_ACRE = 8;
  const bagLimit = formData.acreage ? Math.floor(parseFloat(formData.acreage) * BAGS_PER_ACRE) : 0;

  const fetchFarmers = () => {
    fetch('/api/farmers')
      .then(res => res.json())
      .then(setFarmers)
      .catch(console.error);
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 13) value = value.slice(0, 13);
    
    let formatted = value;
    if (value.length > 5 && value.length <= 12) {
      formatted = `${value.slice(0, 5)}-${value.slice(5)}`;
    } else if (value.length > 12) {
      formatted = `${value.slice(0, 5)}-${value.slice(5, 12)}-${value.slice(12)}`;
    }
    
    setFormData(prev => ({ ...prev, cnic: formatted }));
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
    setFormData(prev => ({ ...prev, mobileNumber: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      fatherName: '',
      cnic: '',
      mobileNumber: '',
      acreage: '',
      bankIban: ''
    });
    setEditMode(false);
    setError('');
    setSuccess('');
  };

  const handleSearchByCnic = async () => {
    if (!/^\d{5}-\d{7}-\d{1}$/.test(formData.cnic)) {
      setError('Enter full CNIC to search');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/farmers/search/${formData.cnic}`);
      const data = await res.json();
      if (data) {
        setFormData(data);
        setEditMode(true);
        setSuccess('Farmer record found');
      } else {
        setError('No record found for this CNIC');
      }
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/farmers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(editMode ? 'Farmer record updated' : 'Farmer registered successfully');
        fetchFarmers();
        if (!editMode) resetForm();
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.cnic.includes(searchQuery)
  );

  return (
    <div className="flex gap-8 items-start relative pb-20">
      {/* Main Farmer Directory */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide">Farmer Registry</h2>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Pre-Verification & Allocation Node</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text"
              placeholder="SEARCH BY NAME OR CNIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none w-64 shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Personnel Records</span>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{farmers.length} REGISTERED</span>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Farmer Name</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">CNIC</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acreage</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bag Limit</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredFarmers.map((farmer) => (
                <tr key={farmer.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{farmer.name}</p>
                        <p className="text-[9px] text-slate-400 font-medium">S/O {farmer.fatherName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-mono font-bold text-slate-600">{farmer.cnic}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold text-slate-900">{farmer.acreage} Acres</span>
                  </td>
                  <td className="p-4">
                    <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {Math.floor(parseFloat(farmer.acreage) * BAGS_PER_ACRE)} BAGS
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => { setFormData(farmer); setEditMode(true); }}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Tablet size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredFarmers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <Search size={40} />
                      <p className="text-xs font-bold uppercase tracking-widest">No farmer records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Registration Form */}
      <div className="w-80 shrink-0 sticky top-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-5 bg-[#1a5928] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Landmark size={18} className="text-[#DAA520]" />
              <h3 className="text-xs font-black uppercase tracking-widest">Farmer Onboarding</h3>
            </div>
            {editMode && <button onClick={resetForm} className="text-white/60 hover:text-white"><X size={14} /></button>}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Farmer CNIC</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="00000-0000000-0"
                  value={formData.cnic}
                  onChange={handleCnicChange}
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#1a5928] outline-none"
                  required
                />
                <button 
                  type="button"
                  onClick={handleSearchByCnic}
                  className="bg-slate-900 text-white p-2.5 rounded-lg hover:bg-slate-800 transition-all shadow-sm"
                >
                  <Search size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Full Name</label>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5 text-xs font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Father's Name</label>
                <input 
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5 text-xs font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Mobile No.</label>
                <input 
                  type="text"
                  placeholder="03001234567"
                  value={formData.mobileNumber}
                  onChange={handleMobileChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5 text-xs font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Acreage (Land)</label>
                <input 
                  type="number"
                  name="acreage"
                  value={formData.acreage}
                  onChange={handleInputChange}
                  placeholder="In Acres"
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5 text-xs font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Bank IBAN (24 Chars)</label>
              <input 
                type="text"
                name="bankIban"
                value={formData.bankIban}
                onChange={handleInputChange}
                placeholder="PK00 BANK 0000..."
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5 text-[10px] font-mono font-bold"
                required
              />
            </div>

            {/* Bag Limit Preview */}
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Suggested Bag Limit</span>
                <BadgeCheck size={14} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-700 tracking-tighter">{bagLimit} <span className="text-sm font-bold uppercase">Bags</span></p>
              <p className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-widest mt-1">Based on {BAGS_PER_ACRE} bags/acre ratio</p>
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
              className="w-full bg-[#DAA520] text-white font-black text-[10px] uppercase tracking-widest py-3.5 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#DAA520]/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : (editMode ? 'Update Record' : 'Verify & Register')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
