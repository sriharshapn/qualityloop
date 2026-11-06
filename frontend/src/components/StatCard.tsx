import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  variant?: 'default' | 'ai' | 'success' | 'warning' | 'critical';
}

export const StatCard: React.FC<Props> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  variant = 'default'
}) => {
  let iconBg = 'bg-slate-100 text-slate-700';
  let borderAccent = 'border-[#E5E9F0]';

  if (variant === 'ai') {
    iconBg = 'bg-indigo-100 text-indigo-700';
    borderAccent = 'border-indigo-200';
  } else if (variant === 'success') {
    iconBg = 'bg-emerald-100 text-emerald-700';
  } else if (variant === 'warning') {
    iconBg = 'bg-amber-100 text-amber-700';
  } else if (variant === 'critical') {
    iconBg = 'bg-rose-100 text-rose-700';
  }

  return (
    <div className={`bg-white rounded-xl p-5 border ${borderAccent} shadow-xs hover:shadow-sm transition-shadow relative overflow-hidden`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#687386]">{title}</p>
          <h3 className="text-2xl font-bold text-[#172033] mt-1.5">{value}</h3>
          {subtitle && (
            <p className="text-xs text-[#687386] mt-1 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {badge && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[#687386]">Status</span>
          <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};
