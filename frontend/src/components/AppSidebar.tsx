import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  BrainCircuit,
  Settings,
  ShieldCheck,
  User,
  Database,
  X
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
  hindsightConnected: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const AppSidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  hindsightConnected,
  isOpen = false,
  onClose
}) => {
  const navSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'QUALITY',
      items: [
        { id: 'incidents', label: 'Incidents', icon: ClipboardList },
        { id: 'report', label: 'Report & Investigate', icon: PlusCircle }
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'learning-demo', label: 'Learning Demo', icon: BrainCircuit, badge: 'Flagship' }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`w-72 lg:w-64 bg-[#101827] text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-50 select-none border-r border-slate-800 transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & Logo */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              {/* Geometric Loop + Checkmark */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12" />
                <path d="m7 12 3.5 3.5L20 6" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-white text-base tracking-wider flex items-center gap-1.5">
                QUALITYLOOP
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                Self-Learning Quality Agent
              </p>
            </div>
          </div>

          {/* Close button on mobile/tablet */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
              title="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((sec) => (
          <div key={sec.title}>
            <p className="px-3 text-[10px] font-bold text-slate-400 tracking-wider mb-2">
              {sec.title}
            </p>
            <div className="space-y-1">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-indigo-800 text-indigo-100'
                          : 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Memory Engine Status Pill */}
      <div className="p-3 mx-3 mb-3 bg-slate-900/90 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            Hindsight Memory
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            hindsightConnected
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              : 'bg-amber-950 text-amber-300 border border-amber-800'
          }`}>
            {hindsightConnected ? 'Connected' : 'Active'}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-mono truncate">
          Bank: qualityloop
        </p>
      </div>

      {/* Bottom Profile & Settings */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>System & Engine Status</span>
        </button>

        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
            QC
          </div>
          <div className="text-left overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">Lead QC Engineer</p>
            <p className="text-[10px] text-slate-400 truncate">Plant #4 Precision Ops</p>
          </div>
        </div>
      </div>
    </aside>
  </>
  );
};
