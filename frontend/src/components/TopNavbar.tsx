import React from 'react';
import { Search, Bell, Shield, Database, Sparkles, RefreshCw } from 'lucide-react';

interface Props {
  activeTab: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onOpenSettings: () => void;
  hindsightConnected: boolean;
  onResetDemo?: () => void;
}

export const TopNavbar: React.FC<Props> = ({
  activeTab,
  searchTerm,
  setSearchTerm,
  onOpenSettings,
  hindsightConnected,
  onResetDemo
}) => {
  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Overview / Executive Quality Dashboard';
      case 'incidents':
        return 'Quality / Defect Incident Registry';
      case 'report':
        return 'Quality / Report Defect & AI Investigation';
      case 'investigation-details':
        return 'Quality / Investigation Workspace';
      case 'learning-demo':
        return 'Intelligence / Persistent Memory Learning Demo';
      default:
        return 'QualityLoop';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#E5E9F0] fixed top-0 left-64 right-0 z-20 px-8 flex items-center justify-between">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#687386]">
        <span className="font-semibold text-slate-800">QualityLoop</span>
        <span>/</span>
        <span className="text-[#4169E1] font-medium">{getBreadcrumb()}</span>
      </div>

      {/* Center Search & Actions */}
      <div className="flex items-center gap-4">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search defects, products, batches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#F7F8FA] border border-[#E5E9F0] rounded-lg text-xs text-[#172033] placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#4169E1] focus:bg-white transition-all"
          />
        </div>

        {/* Hindsight Status Pill */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-slate-50 transition-colors bg-white border-slate-200"
          title="Click to view Hindsight status and configuration"
        >
          <Database className={`w-3.5 h-3.5 ${hindsightConnected ? 'text-emerald-600' : 'text-indigo-600'}`} />
          <span className="text-slate-700 font-semibold">Hindsight:</span>
          <span className={`inline-block w-2 h-2 rounded-full ${hindsightConnected ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
          <span className="text-slate-600">{hindsightConnected ? 'Live' : 'Active'}</span>
        </button>

        {/* Live Demo Reset Shortcut */}
        {onResetDemo && (
          <button
            onClick={onResetDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
            title="Reset demonstration scenario to baseline state"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo</span>
          </button>
        )}

        {/* Notifications */}
        <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full"></span>
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
            QE
          </div>
        </div>
      </div>
    </header>
  );
};
