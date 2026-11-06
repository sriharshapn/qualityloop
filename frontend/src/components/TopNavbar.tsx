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
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 fixed top-0 lg:left-64 left-0 right-0 z-20 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 transition-all duration-200">
      {/* Left: Mobile Menu Toggle + Adaptive Breadcrumb */}
      <div className="flex items-center gap-2 text-xs min-w-0">
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <span className="font-bold text-slate-900 dark:text-white shrink-0 text-sm tracking-tight">QualityLoop</span>
        <span className="hidden sm:inline text-slate-300 dark:text-slate-700">/</span>
        <span className="hidden sm:inline text-indigo-600 dark:text-indigo-400 font-semibold truncate">{getBreadcrumb()}</span>
      </div>

      {/* Right: Search, Theme Selector, Hindsight Status & Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Search Input (Collapses on small screens) */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search defects, batches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-600 transition-all"
          />
        </div>

        {/* Theme Selector */}
        <ThemeSwitcher variant="compact" />

        {/* Hindsight Status Pill */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-2xs shrink-0"
          title="Click to view System and Memory Engine status"
        >
          <Database className={`w-3.5 h-3.5 ${hindsightConnected ? 'text-emerald-500' : 'text-indigo-500'}`} />
          <span className="text-slate-700 dark:text-slate-300 font-semibold hidden md:inline">Hindsight:</span>
          <span className={`inline-block w-2 h-2 rounded-full ${hindsightConnected ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
          <span className="hidden sm:inline">{hindsightConnected ? 'Live' : 'Active'}</span>
        </button>

        {/* Live Demo Reset Shortcut (Hidden on small mobile) */}
        {onResetDemo && (
          <button
            onClick={onResetDemo}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700 shrink-0"
            title="Reset demonstration scenario to baseline state"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800 shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
            QE
          </div>
        </div>
      </div>
    </header>
  );
};
