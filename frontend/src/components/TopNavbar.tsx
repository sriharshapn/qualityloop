import React from 'react';
import { Search, Bell, Shield, Database, Sparkles, RefreshCw, Menu } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';

interface Props {
  activeTab: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onOpenSettings: () => void;
  hindsightConnected: boolean;
  onResetDemo?: () => void;
  onOpenSidebar?: () => void;
}

export const TopNavbar: React.FC<Props> = ({
  activeTab,
  searchTerm,
  setSearchTerm,
  onOpenSettings,
  hindsightConnected,
  onResetDemo,
  onOpenSidebar
}) => {
  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Overview';
      case 'incidents':
        return 'Incident Registry';
      case 'report':
        return 'Report Defect';
      case 'investigation-details':
        return 'Investigation';
      case 'learning-demo':
        return 'Learning Demo';
      default:
        return 'QualityLoop';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#E5E9F0] fixed top-0 lg:left-64 left-0 right-0 z-20 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 transition-all duration-200">
      {/* Left: Mobile Menu Toggle + Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#687386] min-w-0">
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <span className="font-semibold text-slate-800 shrink-0">QualityLoop</span>
        <span className="text-slate-300">/</span>
        <span className="text-[#4169E1] font-medium truncate">{getBreadcrumb()}</span>
      </div>

      {/* Right: Search, Hindsight Status & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search Input (Collapses on small mobile) */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search defects, batches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#F7F8FA] border border-[#E5E9F0] rounded-lg text-xs text-[#172033] placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#4169E1] focus:bg-white transition-all"
          />
        </div>

        {/* Theme Selector */}
        <ThemeSwitcher variant="compact" />

        {/* Hindsight Status Pill */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-slate-50 transition-colors bg-white border-slate-200 shadow-2xs shrink-0"
          title="Click to view System and Memory Engine status"
        >
          <Database className={`w-3.5 h-3.5 ${hindsightConnected ? 'text-emerald-600' : 'text-indigo-600'}`} />
          <span className="text-slate-700 font-semibold hidden sm:inline">Hindsight:</span>
          <span className={`inline-block w-2 h-2 rounded-full ${hindsightConnected ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
          <span className="text-slate-600">{hindsightConnected ? 'Live' : 'Active'}</span>
        </button>

        {/* Live Demo Reset Shortcut */}
        {onResetDemo && (
          <button
            onClick={onResetDemo}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-200 shrink-0"
            title="Reset demonstration scenario to baseline state"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200 shrink-0">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
            QE
          </div>
        </div>
      </div>
    </header>
  );
};
