import React from 'react';
import { LayoutDashboard, Database, FileText, Settings, ShieldAlert, Activity, ChevronRight, ChevronLeft, Menu } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

const NavItem = ({ icon: Icon, label, active = false, collapsed = false, onClick }: { icon: any, label: string, active?: boolean, collapsed?: boolean, onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={`group flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mx-3 mb-1.5
    ${active
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      }`}
    title={collapsed ? label : undefined}
  >
    <div className={`flex items-center ${collapsed ? 'gap-0' : 'gap-3'}`}>
      <Icon size={18} className={`transition-colors flex-shrink-0 ${active ? 'text-blue-100' : 'text-slate-500 group-hover:text-blue-400'}`} />
      {!collapsed && <span className="whitespace-nowrap">{label}</span>}
    </div>
    {!collapsed && active && <ChevronRight size={14} className="text-blue-200" />}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleCollapse, currentView, onNavigate }) => {
  return (
    <div
      className={`
        h-full bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/60 flex flex-col flex-shrink-0 z-20 shadow-2xl transition-all duration-300 ease-in-out relative
        ${isCollapsed ? 'w-20' : 'w-72'}
      `}
    >
      <div className={`p-6 pb-6 border-b border-slate-800/60 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 flex-shrink-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40 p-1.5">
            <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
          </div>
          {!isCollapsed && (
            <div className="transition-opacity duration-300">
              <h1 className="text-lg font-display font-bold text-white leading-none tracking-tight">ClinFlow</h1>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Insight Engine</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-colors active:scale-95"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      <nav className="flex-1 py-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {!isCollapsed && <div className="px-6 mb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Module</div>}
        <NavItem icon={LayoutDashboard} label="Data Flow" active={currentView === 'data-flow'} collapsed={isCollapsed} onClick={() => onNavigate('data-flow')} />
        <NavItem icon={Database} label="Data Sources" active={currentView === 'data-sources'} collapsed={isCollapsed} onClick={() => onNavigate('data-sources')} />
        <NavItem icon={Activity} label="Monitoring" active={currentView === 'monitoring'} collapsed={isCollapsed} onClick={() => onNavigate('monitoring')} />
        <NavItem icon={ShieldAlert} label="Safety & PV" active={currentView === 'safety'} collapsed={isCollapsed} onClick={() => onNavigate('safety')} />
        <NavItem icon={FileText} label="Regulatory Reports" active={currentView === 'reports'} collapsed={isCollapsed} onClick={() => onNavigate('reports')} />
      </nav>

      <div className="p-4 border-t border-slate-800/60 bg-slate-900/50">
        <NavItem icon={Settings} label="Configuration" collapsed={isCollapsed} />

        {!isCollapsed && (
          <div className="mt-4 px-4 py-4 bg-gradient-to-br from-slate-900/80 to-slate-800/40 rounded-xl border border-white/5 backdrop-blur-sm shadow-inner group cursor-pointer hover:border-white/10 transition-colors">
            <p className="text-[9px] font-bold text-slate-500 uppercase mb-3 tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
              System Status
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium group-hover:text-white transition-colors">Connector</span>
                <span className="flex items-center gap-1.5 text-emerald-300 font-bold bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active
                </span>
              </div>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="mt-4 flex justify-center">
            <button onClick={toggleCollapse} className="p-2.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white active:scale-95 transition-transform">
              <Menu size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};