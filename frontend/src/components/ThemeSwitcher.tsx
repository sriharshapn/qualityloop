import React, { useState, useRef, useEffect } from 'react';
import { useTheme, THEME_OPTIONS, ThemeMode } from '../context/ThemeContext';
import { Moon, Sun, Layers, Zap, Check, ChevronDown, Palette } from 'lucide-react';

interface Props {
  variant?: 'compact' | 'full';
}

export const ThemeSwitcher: React.FC<Props> = ({ variant = 'compact' }) => {
  const { theme, setTheme, currentOption } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getIcon = (name: string, className = "w-3.5 h-3.5") => {
    switch (name) {
      case 'Moon':
        return <Moon className={className} />;
      case 'Sun':
        return <Sun className={className} />;
      case 'Layers':
        return <Layers className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      default:
        return <Palette className={className} />;
    }
  };

  if (variant === 'full') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {THEME_OPTIONS.map((opt) => {
          const isSelected = opt.id === theme;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-50/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs shrink-0"
                    style={{ backgroundColor: opt.colorSwatch }}
                  />
                  <span className="font-bold text-xs text-slate-900">{opt.name}</span>
                </div>
                {isSelected && (
                  <span className="p-0.5 rounded-full bg-indigo-600 text-white">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>
    );
  }

  // Compact variant for TopNavbar
  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs transition-all"
        title="Change application theme"
        aria-label="Change application theme"
      >
        <span
          className="w-2.5 h-2.5 rounded-full border border-slate-400/40 shrink-0 shadow-2xs"
          style={{ backgroundColor: currentOption.colorSwatch }}
        />
        <span className="hidden sm:inline">{currentOption.name}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Select Display Theme
          </div>

          <div className="p-1 space-y-0.5">
            {THEME_OPTIONS.map((opt) => {
              const isSelected = opt.id === theme;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                      style={{ backgroundColor: opt.colorSwatch }}
                    />
                    <div>
                      <div className="leading-tight">{opt.name}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
