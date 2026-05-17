import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, Package, AlertCircle, Building2, Map, 
  ChevronRight, Info, ShieldCheck, Landmark, ArrowUpRight, 
  ArrowDownRight, Minus
} from 'lucide-react';
import { cn } from '@/src/lib/utils.ts';
import { motion } from 'motion/react';

interface DashboardData {
  kpis: {
    procurementProgress: number;
    activeFarmers: number;
    bardanaStock: number;
    systemAlerts: number;
  };
  regionalStats: {
    division: string;
    districts: number;
    target: number;
    achieved: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  policy: {
    wheatRate: number;
    jutePrice: number;
    ppPrice: number;
    deliveryFee: number;
  };
}

const KPICard = ({ label, value, icon: Icon, subtext, color, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
    <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-[0.03] transition-transform group-hover:scale-110", color)}>
      <Icon size={96} />
    </div>
    <div className="flex justify-between items-start relative z-10">
      <div className={cn("p-2.5 rounded-xl text-white shadow-lg", color)}>
        <Icon size={20} />
      </div>
    </div>
    <div className="mt-5 relative z-10">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-1">{subtext}</p>
    </div>
    {trend && (
      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {trend > 0 ? <ArrowUpRight size={12} className="text-emerald-500" /> : <ArrowDownRight size={12} className="text-red-500" />}
          <span className={cn("text-[10px] font-black", trend > 0 ? "text-emerald-500" : "text-red-500")}>
            {Math.abs(trend)}% vs Last Entry
          </span>
        </div>
      </div>
    )}
  </div>
);

export default function ExecutiveCommandCenter() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/executive-dashboard')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#1a5928] border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Command Modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-8 items-start">
      {/* Main Command Area */}
      <div className="flex-1 space-y-8">
        {/* KPI Scorecard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard 
            label="Procurement Progress" 
            value={`${data.kpis.procurementProgress}%`}
            icon={TrendingUp} 
            subtext="Provincial Completion Rate"
            color="bg-[#1a5928]"
          />
          <KPICard 
            label="Active Farmers" 
            value={data.kpis.activeFarmers.toLocaleString()}
            icon={Users} 
            subtext="Verified Digital Registrations"
            color="bg-blue-600"
          />
          <KPICard 
            label="Bardana Stock" 
            value={data.kpis.bardanaStock.toLocaleString()}
            icon={Package} 
            subtext="Available Jute & PP Inventory"
            color="bg-[#DAA520]"
          />
          <KPICard 
            label="System Health" 
            value={data.kpis.systemAlerts}
            icon={AlertCircle} 
            subtext="Centers with Stock Alerts"
            color={data.kpis.systemAlerts > 0 ? "bg-red-600" : "bg-emerald-600"}
          />
        </div>

        {/* Geographic Performance */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Geographic Performance Breakdown</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Division-wise Target Achievement Ledger</p>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
              <Map size={12} />
              <span>Toggle Map View</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Division</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Districts</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Procurement Target</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Achievement</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.regionalStats.map((reg, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Building2 size={16} className="text-slate-300 group-hover:text-[#1a5928] transition-colors" />
                        <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{reg.division}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-bold text-slate-500">{reg.districts} Nodes</span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-bold text-slate-400">{reg.target.toLocaleString()} MT</span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-black text-blue-600">{reg.achieved.toLocaleString()} MT</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 w-24 bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#1a5928] rounded-full transition-all duration-1000" 
                            style={{ width: `${(reg.achieved / reg.target) * 100}%` }} 
                          />
                        </div>
                        <span className="text-[10px] font-black text-slate-600">{Math.round((reg.achieved / reg.target) * 100)}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {reg.trend === 'up' && <ArrowUpRight size={16} className="text-emerald-500 ml-auto" />}
                      {reg.trend === 'down' && <ArrowDownRight size={16} className="text-red-500 ml-auto" />}
                      {reg.trend === 'stable' && <Minus size={16} className="text-slate-300 ml-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Policy Sidebar */}
      <div className="w-80 shrink-0 sticky top-4 space-y-6">
        <div className="bg-[#1a5928] text-white rounded-2xl shadow-xl shadow-[#1a5928]/20 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#DAA520]" />
              Policy Quick-View
            </h3>
            <span className="text-[9px] font-black bg-[#DAA520] text-[#1a5928] px-2 py-0.5 rounded uppercase">Verified</span>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-3">Wheat Support Price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">PKR {data.policy.wheatRate}</span>
                <span className="text-[10px] font-bold text-white/40 uppercase">per 40kg</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Jute Bag Price</p>
                <p className="text-sm font-black text-[#DAA520]">PKR {data.policy.jutePrice}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">PP Bag Price</p>
                <p className="text-sm font-black text-blue-400">PKR {data.policy.ppPrice}</p>
              </div>
            </div>

            <div className="p-4 bg-white/10 rounded-xl flex items-center gap-3">
              <Landmark size={18} className="text-[#DAA520]" />
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-tight">Delivery Allowance</p>
                <p className="text-[9px] text-white/50 font-bold uppercase">PKR {data.policy.deliveryFee} per 100kg</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white/5 text-center">
            <button className="text-[10px] font-black text-white/60 hover:text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto">
              Open Master Circular
              <ChevronRight size={12} />
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info size={16} className="text-blue-500" />
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Executive Directives</h4>
          </div>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
              <p className="text-[10px] font-bold text-slate-600 leading-tight">Strict adherence to "First Come, First Served" during bag issuance is mandatory.</p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
              <p className="text-[10px] font-bold text-slate-600 leading-tight">Moisture content above 10.5% must be flagged at the weight station.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
