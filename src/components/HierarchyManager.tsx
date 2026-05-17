import React, { useState, useEffect } from 'react';
import { ChevronRight, MapPin, Building2, Warehouse } from 'lucide-react';
import { cn } from '@/src/lib/utils.ts';

interface HierarchyItem {
  id: number;
  name: string;
}

export default function HierarchyManager() {
  const [divisions, setDivisions] = useState<HierarchyItem[]>([]);
  const [districts, setDistricts] = useState<HierarchyItem[]>([]);
  const [tehsils, setTehsils] = useState<HierarchyItem[]>([]);
  const [centers, setCenters] = useState<HierarchyItem[]>([]);

  const [selectedDivision, setSelectedDivision] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedTehsil, setSelectedTehsil] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/hierarchy/divisions')
      .then(res => res.json())
      .then(setDivisions)
      .catch(console.error);
  }, []);

  const handleDivisionChange = (id: number) => {
    setSelectedDivision(id);
    setSelectedDistrict(null);
    setSelectedTehsil(null);
    setTehsils([]);
    setCenters([]);
    setLoading(true);
    fetch(`/api/hierarchy/districts/${id}`)
      .then(res => res.json())
      .then(data => {
        setDistricts(data);
        setLoading(false);
      });
  };

  const handleDistrictChange = (id: number) => {
    setSelectedDistrict(id);
    setSelectedTehsil(null);
    setCenters([]);
    setLoading(true);
    fetch(`/api/hierarchy/tehsils/${id}`)
      .then(res => res.json())
      .then(data => {
        setTehsils(data);
        setLoading(false);
      });
  };

  const handleTehsilChange = (id: number) => {
    setSelectedTehsil(id);
    setLoading(true);
    fetch(`/api/hierarchy/centers/${id}`)
      .then(res => res.json())
      .then(data => {
        setCenters(data);
        setLoading(false);
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide">Regional Hierarchy Tree</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Cascading Sync Protocol v5.0</p>
        </div>
        <button 
          onClick={() => fetch('/api/dev/seed', { method: 'POST' }).then(() => window.location.reload())}
          className="text-[10px] bg-slate-900 text-white font-bold px-4 py-1.5 rounded-lg shadow-sm hover:bg-slate-800 transition-all uppercase tracking-wider"
        >
          Seed Demo Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[500px]">
        {/* Divisions */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-blue-600" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Divisions</h3>
            </div>
            <span className="text-[9px] font-bold bg-white px-2 py-0.5 rounded shadow-sm text-slate-400">{divisions.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {divisions.map(div => (
              <button 
                key={div.id}
                onClick={() => handleDivisionChange(div.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex justify-between items-center group",
                  selectedDivision === div.id 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {div.name}
                <ChevronRight size={12} className={cn(selectedDivision === div.id ? "opacity-100" : "opacity-0 group-hover:opacity-40")} />
              </button>
            ))}
          </div>
        </div>

        {/* Districts */}
        <div className={cn(
          "bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden transition-all",
          !selectedDivision && "opacity-40 grayscale pointer-events-none"
        )}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-blue-600" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Districts</h3>
            </div>
            {selectedDivision && <span className="text-[9px] font-bold bg-white px-2 py-0.5 rounded shadow-sm text-slate-400">{districts.length}</span>}
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {districts.map(dist => (
              <button 
                key={dist.id}
                onClick={() => handleDistrictChange(dist.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex justify-between items-center group",
                  selectedDistrict === dist.id 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {dist.name}
                <ChevronRight size={12} className={cn(selectedDistrict === dist.id ? "opacity-100" : "opacity-0 group-hover:opacity-40")} />
              </button>
            ))}
            {selectedDivision && districts.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No entries found</p>
              </div>
            )}
          </div>
        </div>

        {/* Tehsils */}
        <div className={cn(
          "bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden transition-all",
          !selectedDistrict && "opacity-40 grayscale pointer-events-none"
        )}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-blue-600" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tehsils</h3>
            </div>
            {selectedDistrict && <span className="text-[9px] font-bold bg-white px-2 py-0.5 rounded shadow-sm text-slate-400">{tehsils.length}</span>}
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {tehsils.map(tehsil => (
              <button 
                key={tehsil.id}
                onClick={() => handleTehsilChange(tehsil.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex justify-between items-center group",
                  selectedTehsil === tehsil.id 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {tehsil.name}
                <ChevronRight size={12} className={cn(selectedTehsil === tehsil.id ? "opacity-100" : "opacity-0 group-hover:opacity-40")} />
              </button>
            ))}
          </div>
        </div>

        {/* Purchase Centers */}
        <div className={cn(
          "bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden transition-all",
          !selectedTehsil && "opacity-40 grayscale pointer-events-none"
        )}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Warehouse size={14} className="text-blue-600" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Centers</h3>
            </div>
            {selectedTehsil && <span className="text-[9px] font-bold bg-white px-2 py-0.5 rounded shadow-sm text-slate-400">{centers.length}</span>}
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {centers.map(center => (
              <div 
                key={center.id}
                className="w-full text-left p-4 rounded-lg bg-slate-50 border border-slate-100 shadow-sm"
              >
                <div className="font-black text-slate-900 text-xs mb-1">{center.name}</div>
                <div className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">ID: {center.centerCode}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
