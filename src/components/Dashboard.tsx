import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  LayoutDashboard, 
  Users, 
  Settings, 
  FileText, 
  MapPin, 
  ChevronRight,
  TrendingUp,
  Warehouse,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils.ts';
import HierarchyManager from './HierarchyManager.tsx';
import SettingsManager from './SettingsManager.tsx';
import StaffManager from './StaffManager.tsx';
import ProcurementManager from './ProcurementManager.tsx';
import ExecutiveReport from './ExecutiveReport.tsx';
import ExecutiveCommandCenter from './ExecutiveCommandCenter.tsx';
import FarmerManager from './FarmerManager.tsx';
import InventoryManager from './InventoryManager.tsx';
import VoucherManager from './VoucherManager.tsx';
import BardanaIssuance from './BardanaIssuance.tsx';

// Types
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  color?: string;
}

const StatCard = ({ label, value, icon: Icon, trend, color }: StatCardProps) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
    <div className="flex justify-between items-start">
      <div className="p-2 bg-slate-50 rounded-lg">
        <Icon size={18} className="text-slate-500" />
      </div>
      {trend && (
        <span className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded",
          trend.startsWith('+') ? "text-emerald-600 bg-emerald-50" : "text-slate-600 bg-slate-50"
        )}>
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-2xl font-black text-slate-900 tracking-tight">
        {value}
      </p>
    </div>
  </div>
);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalBags: '0',
    totalWeight: '0',
    totalFarmers: '0',
    activeCenters: '0'
  });

  useEffect(() => {
    fetch('/api/procurement/stats')
      .then(res => res.json())
      .then(data => {
        setStats({
          totalBags: data.totalBags.toLocaleString(),
          totalWeight: `${data.totalWeight} MT`,
          totalFarmers: data.totalFarmers.toLocaleString(),
          activeCenters: data.activeCenters.toString()
        });
      })
      .catch(console.error);
  }, []);

  return (
    <div className="h-screen bg-slate-50 text-slate-900 font-sans flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a5928] text-white flex flex-col shrink-0">
        <div className="p-6 bg-[#154620]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#DAA520] rounded flex items-center justify-center font-bold text-white shadow-lg">P</div>
            <div>
              <h1 className="text-sm font-black text-white tracking-wider uppercase leading-none">Punjab Food</h1>
              <p className="text-[9px] text-white/50 mt-1 uppercase tracking-widest leading-none">Command & Control</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <div className="pb-2 px-3 text-[10px] text-white/30 uppercase tracking-widest font-bold">Strategic Nodes</div>
          <button 
            onClick={() => setActiveTab('overview')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all",
              activeTab === 'overview' ? "bg-white/10 text-white font-bold" : "hover:bg-white/5 text-white/60"
            )}
          >
            <LayoutDashboard size={16} />
            <span>Master Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('hierarchy')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all",
              activeTab === 'hierarchy' ? "bg-white/10 text-white font-bold" : "hover:bg-white/5 text-white/60"
            )}
          >
            <MapPin size={16} />
            <span>Regional Hierarchy</span>
          </button>
          <button 
            onClick={() => setActiveTab('farmers')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all",
              activeTab === 'farmers' ? "bg-white/10 text-white font-bold" : "hover:bg-white/5 text-white/60"
            )}
          >
            <Users size={16} />
            <span>Farmer Registry</span>
          </button>
          <button 
            onClick={() => setActiveTab('bardana')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all",
              activeTab === 'bardana' ? "bg-white/10 text-white font-bold" : "hover:bg-white/5 text-white/60"
            )}
          >
            <Package size={16} />
            <span>Bardana Issuance</span>
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all",
              activeTab === 'inventory' ? "bg-white/10 text-white font-bold" : "hover:bg-white/5 text-white/60"
            )}
          >
            <Package size={16} />
            <span>Bag Inventory</span>
          </button>
          <button 
            onClick={() => setActiveTab('vouchers')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all",
              activeTab === 'vouchers' ? "bg-white/10 text-white font-bold" : "hover:bg-white/5 text-white/60"
            )}
          >
            <FileText size={16} />
            <span>Payment Vouchers</span>
          </button>
          <button 
            onClick={() => setActiveTab('records')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all",
              activeTab === 'records' ? "bg-white/10 text-white font-bold" : "hover:bg-white/5 text-white/60"
            )}
          >
            <FileText size={16} />
            <span>Procurement Records</span>
          </button>
          
          <div className="pt-6 pb-2 px-3 text-[10px] text-white/30 uppercase tracking-widest font-bold">Administration</div>
          <button 
            onClick={() => setActiveTab('users')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all",
              activeTab === 'users' ? "bg-white/10 text-white font-bold" : "hover:bg-white/5 text-white/60"
            )}
          >
            <Users size={16} />
            <span>Staff Management</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all",
              activeTab === 'settings' ? "bg-white/10 text-white font-bold" : "hover:bg-white/5 text-white/60"
            )}
          >
            <Settings size={16} />
            <span>Policy Settings</span>
          </button>
        </nav>

        <div className="p-4 bg-slate-950 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">SA</div>
          <div className="min-w-0">
            <p className="font-bold text-white text-xs truncate">Admin User</p>
            <p className="text-[10px] text-slate-500 truncate">Directorate Level</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded uppercase tracking-wider">LIVE: 2024 SCHEME</span>
            <nav className="text-xs text-slate-400">
              Directorate / <span className="text-slate-600 font-medium capitalize prose-sm">{activeTab}</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right border-r border-slate-100 pr-4">
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">System Status</p>
              <div className="flex items-center gap-1.5 justify-end">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter">Connected</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase text-slate-400 font-bold tracking-tight">Current Scheme</p>
              <p className="text-[11px] font-bold text-blue-700">WHEAT 2024-25</p>
            </div>
          </div>
        </header>

        {/* Scrollable Content Viewport */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ExecutiveCommandCenter />
              </motion.div>
            )}

            {activeTab === 'hierarchy' && (
              <motion.div 
                key="hierarchy"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <HierarchyManager />
              </motion.div>
            )}

            {activeTab === 'farmers' && (
              <motion.div 
                key="farmers"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <FarmerManager />
              </motion.div>
            )}

            {activeTab === 'bardana' && (
              <motion.div 
                key="bardana"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <BardanaIssuance />
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div 
                key="inventory"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <InventoryManager />
              </motion.div>
            )}

            {activeTab === 'vouchers' && (
              <motion.div 
                key="vouchers"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <VoucherManager />
              </motion.div>
            )}

            {activeTab === 'records' && (
              <motion.div 
                key="records"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ProcurementManager />
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div 
                key="users"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <StaffManager />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SettingsManager />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="h-10 bg-slate-200 border-t border-slate-300 flex items-center px-6 text-[10px] justify-between shrink-0 font-medium text-slate-600 uppercase tracking-wider">
          <div className="flex gap-6">
            <span>Ver: 5.0.0-PRO</span>
            <span>Uptime: 99.98%</span>
          </div>
          <div className="flex gap-6">
            <span className="text-blue-700 font-bold tracking-tight">PostgreSQL Connected</span>
            <span className="text-slate-500 font-bold tracking-tight">NODE: {typeof window !== 'undefined' ? window.location.hostname : 'SERVER'}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
