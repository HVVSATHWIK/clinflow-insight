import React from 'react';
import { Bell, Search, ChevronDown, UserCircle, Calendar, MapPin, FileText, PlusCircle } from 'lucide-react';
import { UserRole } from '../types';

interface TopNavProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onConnectClick: () => void;
}

const FilterPill = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-slate-800 border border-transparent hover:border-slate-700 rounded-lg text-sm transition-all group">
    <div className="p-1.5 bg-slate-800 rounded-md text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
      <Icon size={14} />
    </div>
    <div className="flex flex-col items-start leading-none gap-0.5">
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide group-hover:text-slate-400">{label}</span>
      <span className="font-semibold text-slate-300 text-xs flex items-center gap-1 group-hover:text-white">
        {value} <ChevronDown size={10} className="opacity-40" />
      </span>
    </div>
  </button>
);

export const TopNav: React.FC<TopNavProps> = ({ currentRole, onRoleChange, onConnectClick }) => {
  return (
    <header className="h-16 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/60 flex items-center justify-between px-6 py-3 flex-shrink-0 z-10 sticky top-0 transition-all">
      <div className="flex items-center gap-4">
        <FilterPill icon={FileText} label="Study" value="ONC-2024-001 (Phase III)" />
        <div className="h-8 w-px bg-slate-800 mx-1"></div>
        <FilterPill icon={MapPin} label="Site" value="All Sites" />
        <div className="h-8 w-px bg-slate-800 mx-1"></div>
        <FilterPill icon={Calendar} label="Period" value="Last 30 Days" />
      </div>

      <div className="flex items-center gap-6">

        {/* Action: Connect Source */}
        <button
          onClick={onConnectClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-900/30 hover:bg-blue-500 hover:shadow-blue-600/40 active:scale-95 transition-all btn-click-effect"
        >
          <PlusCircle size={16} className="text-white/80" />
          <span>Connect Data</span>
        </button>

        <div className="relative group ml-2">
          <div className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer border border-transparent hover:border-white/10 hover:shadow-lg hover:shadow-blue-900/20 active:scale-95">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-rose-500 border-2 border-slate-900 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse"></span>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Viewing As</span>
            <div className="relative group">
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="appearance-none bg-transparent text-sm font-bold text-slate-200 outline-none cursor-pointer pr-5 text-right hover:text-blue-400 transition-colors"
              >
                {Object.values(UserRole).map(role => (
                  <option key={role} value={role} className="bg-slate-900 text-slate-200">{role}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-blue-400 transition-colors" />
            </div>

          </div>
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shadow-inner overflow-hidden">
            <UserCircle size={28} className="text-slate-500" />
          </div>
        </div>
      </div>
    </header>
  );
};