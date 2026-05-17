import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Shield, BadgeCheck, MoreHorizontal, User, AlertCircle, X, Check } from 'lucide-react';
import { cn } from '@/src/lib/utils.ts';

interface StaffUser {
  id?: number;
  username: string;
  fullName: string;
  hierarchyLevel: 'directorate' | 'division' | 'district' | 'center';
  role: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  divisionId?: number | null;
  districtId?: number | null;
  centerId?: number | null;
}

const HIERARCHY_COLORS: Record<string, string> = {
  directorate: "bg-[#1a5928] text-white ring-1 ring-[#1a5928]", // Dark Green
  division: "bg-emerald-600 text-white ring-1 ring-emerald-600",
  district: "bg-[#DAA520] text-white ring-1 ring-[#DAA520]", // Gold
  center: "bg-slate-100 text-slate-600 ring-1 ring-slate-200", // Light
};

export default function StaffManager() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<StaffUser>({
    username: '',
    fullName: '',
    hierarchyLevel: 'center',
    role: 'operator',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);

  const fetchStaff = () => {
    fetch('/api/staff')
      .then(res => res.json())
      .then(setStaff)
      .catch(console.error);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/staff/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchStaff();
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      username: '',
      fullName: '',
      hierarchyLevel: 'center',
      role: 'operator',
      status: 'active'
    });
    setEditMode(false);
    setError('');
    setSuccess('');
  };

  const handleEdit = (user: StaffUser) => {
    setFormData(user);
    setEditMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(editMode ? 'Staff record updated' : 'Staff registered successfully');
        fetchStaff();
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

  const filteredStaff = staff.filter(user => 
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex gap-8 items-start relative pb-20">
      {/* Main Staff Directory */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide">Staff Directory</h2>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Personnel Management & Access Control</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text"
              placeholder="SEARCH STAFF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none w-64 shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Username</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hierarchy</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStaff.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#1a5928] group-hover:text-white transition-all">
                        <User size={14} />
                      </div>
                      <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-mono text-slate-600 font-bold">@{user.username}</span>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "text-[9px] px-2 py-1 rounded inline-flex items-center gap-1.5 font-black uppercase tracking-tight",
                      HIERARCHY_COLORS[user.hierarchyLevel]
                    )}>
                      <Shield size={10} />
                      {user.hierarchyLevel}
                    </span>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => user.id && toggleStatus(user.id, user.status)}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                        user.status === 'active' 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      )}
                    >
                      <div className={cn("w-1.5 h-1.5 rounded-full", user.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                      {user.status}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleEdit(user)}
                      className="text-[10px] font-bold text-[#1a5928] hover:text-white uppercase tracking-widest hover:bg-[#1a5928] px-3 py-1 rounded transition-all"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <User size={40} />
                      <p className="text-xs font-bold uppercase tracking-widest">No staff records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky High-Converting Sidebar: Registration Form */}
      <div className="w-80 shrink-0 sticky top-4">
        <div className="bg-white border-2 border-[#1a5928]/10 rounded-xl shadow-xl overflow-hidden">
          <div className="p-5 bg-[#1a5928] text-white">
            <div className="flex items-center gap-2">
              {editMode ? <BadgeCheck size={18} className="text-[#DAA520]" /> : <UserPlus size={18} className="text-[#DAA520]" />}
              <h3 className="text-xs font-black uppercase tracking-widest">{editMode ? 'Edit Staff Profile' : 'Add New Staff'}</h3>
            </div>
            <p className="text-[9px] uppercase tracking-widest text-emerald-100/60 mt-1">High-Priority Personnel Entry</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Government ID (Full Name)</label>
                <input 
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Ahmad Khan"
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#1a5928] outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Username (Unique)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-mono">@</span>
                  <input 
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="sys_id"
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-8 pr-4 py-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#1a5928] outline-none transition-all"
                    required
                    disabled={editMode}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Hierarchy Level</label>
                <select 
                  name="hierarchyLevel"
                  value={formData.hierarchyLevel}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#1a5928] outline-none transition-all"
                >
                  <option value="directorate">Directorate (Punjab HQ)</option>
                  <option value="division">Division Office</option>
                  <option value="district">District Hub</option>
                  <option value="center">Purchase Center</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Operational Role</label>
                <select 
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#1a5928] outline-none transition-all"
                >
                  <option value="admin">Admin / Policy Maker</option>
                  <option value="officer">Supervisory Officer</option>
                  <option value="operator">Data Operator</option>
                </select>
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

            <div className="flex gap-3">
              {editMode && (
                <button 
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                >
                  <X size={12} />
                  <span>Cancel</span>
                </button>
              )}
              <button 
                type="submit"
                disabled={loading}
                className="flex-[2] bg-[#DAA520] text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#DAA520]/20 transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : (editMode ? 'Update Record' : 'Register Staff')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
