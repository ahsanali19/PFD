import React, { useState, useEffect } from 'react';
import { FileText, Download, TrendingUp, Package, Landmark, Warehouse, ChevronDown, Filter, Printer } from 'lucide-react';
import { cn } from '@/src/lib/utils.ts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface AnalyticsData {
  totalWheatProcured: number;
  totalBagsIssued: number;
  totalSubsidyDisbursed: number;
  activeCenters: number;
  districtPerformance: {
    district: string;
    target: number;
    achieved: number;
    percentage: number;
  }[];
  procurementTrend: {
    date: string;
    weight: number;
  }[];
}

const StatCard = ({ label, value, icon: Icon, color, subValue }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-2 rounded-lg", color)}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="text-right">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
      </div>
    </div>
    {subValue && (
      <div className="pt-4 border-t border-slate-50">
        <p className="text-[10px] text-slate-500 font-medium">{subValue}</p>
      </div>
    )}
  </div>
);

export default function ExecutiveReport() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/executive-summary')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    window.print();
  };

  if (loading || !data) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Generating Provincial Report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 print:p-0">
      {/* Report Header */}
      <div className="flex items-end justify-between print:hidden">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#1a5928] rounded flex items-center justify-center shadow-lg shadow-[#1a5928]/20">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Government_of_the_Punjab_Logo.svg/1024px-Government_of_the_Punjab_Logo.svg.png" alt="Punjab Logo" className="w-6 h-6 invert brightness-0" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide">Provincial Procurement Overview</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secretariat Level Analytics • Live Data Stream</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Filter size={14} />
            <span>Apply Filters</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
          >
            <Printer size={14} />
            <span>Generate PDF Report</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Wheat Procured" 
          value={`${data.totalWheatProcured.toLocaleString()} MT`} 
          icon={TrendingUp} 
          color="bg-[#1a5928]" 
          subValue="Against 5,000,000 MT Provincial Target"
        />
        <StatCard 
          label="Total Bags Issued" 
          value={data.totalBagsIssued.toLocaleString()} 
          icon={Package} 
          color="bg-blue-600" 
          subValue="92.4% Issuance Rate"
        />
        <StatCard 
          label="Subsidy Disbursed" 
          value={`PKR ${(data.totalSubsidyDisbursed / 1000000).toFixed(1)}M`} 
          icon={Landmark} 
          color="bg-[#DAA520]" 
          subValue="Atomic Banking Sync Active"
        />
        <StatCard 
          label="Active Centers" 
          value={data.activeCenters} 
          icon={Warehouse} 
          color="bg-slate-800"
          subValue="Across 36 Districts"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Procurement Progress (30-Day Trend)</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Weight in Metric Tons (MT)</p>
            </div>
          </div>
          <div className="flex-1 p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.procurementTrend}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a5928" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1a5928" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#1a5928" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorWeight)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Targets Sidebar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-50">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Target Efficiency</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Completion Rate</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-100">
                    Sargodha (Leading)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black inline-block text-emerald-600">
                    87.5%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-emerald-50">
                <div style={{ width: "87.5%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"></div>
              </div>
            </div>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-100">
                    Overall Progress
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black inline-block text-blue-600">
                    74.2%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-blue-50">
                <div style={{ width: "74.2%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Critical Alerts</h4>
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1" />
                  <p className="text-[10px] font-bold text-slate-600 leading-tight">Mianwali district is 15% behind target issuance.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1" />
                  <p className="text-[10px] font-bold text-slate-600 leading-tight">Bag shortage reported in Center BH-04.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* District Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">District-wise Performance Analytics</h3>
          <button className="text-[9px] font-black bg-slate-50 px-3 py-1 rounded hover:bg-slate-100 transition-all uppercase tracking-widest text-slate-400">Expand All Districts</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">District Name</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Procurement Target (MT)</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Achieved to Date</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.districtPerformance.map((dist, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{dist.district}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold text-slate-400">{dist.target.toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-black text-blue-700">{dist.achieved.toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-[100px] bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            dist.percentage > 90 ? "bg-emerald-500" : dist.percentage > 80 ? "bg-blue-500" : "bg-amber-500"
                          )} 
                          style={{ width: `${dist.percentage}%` }} 
                        />
                      </div>
                      <span className="text-[10px] font-black text-slate-600">{dist.percentage}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black uppercase tracking-tighter">
                      <TrendingUp size={10} />
                      Steady
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12 text-center text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em] pb-10">
        End of Provincial Procurement Report • Data Validated by Directorate IT Node
      </div>
    </div>
  );
}
