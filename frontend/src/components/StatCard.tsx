import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  trend?: string;
  trendPositive?: boolean;
  variant?: 'default' | 'ai' | 'success' | 'warning' | 'critical';
  onClick?: () => void;
}

export const StatCard: React.FC<Props> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  trend,
  trendPositive,
  variant = 'default',
  onClick
}) => {
  const variantStyles = {
    default: {
      topBorder: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      glow: 'group-hover:border-blue-200 group-hover:shadow-blue-500/5',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    ai: {
      topBorder: 'from-indigo-500 via-purple-500 to-pink-500',
      iconBg: 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20',
      glow: 'group-hover:border-indigo-300 group-hover:shadow-indigo-500/10',
      badgeBg: 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-200'
    },
    success: {
      topBorder: 'from-emerald-400 to-teal-500',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      glow: 'group-hover:border-emerald-200 group-hover:shadow-emerald-500/5',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    warning: {
      topBorder: 'from-amber-400 to-orange-500',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      glow: 'group-hover:border-amber-200 group-hover:shadow-amber-500/5',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    critical: {
      topBorder: 'from-rose-500 to-red-600',
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
      glow: 'group-hover:border-rose-200 group-hover:shadow-rose-500/5',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200'
    }
  }[variant];

  return (
    <article
      onClick={onClick}
      className={`group relative bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col justify-between ${
        onClick ? 'cursor-pointer' : ''
      } ${variantStyles.glow}`}
    >
      {/* Top Gradient Highlight Accent */}
      <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${variantStyles.topBorder}`} />

      {/* Hover ambient radial wash */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-slate-100 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
            {title}
          </span>
          <div className={`p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110 ${variantStyles.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </h3>
          {trend && (
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
              trendPositive ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 bg-slate-100'
            }`}>
              {trend}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {badge && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400 font-medium">Loop Status</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${variantStyles.badgeBg}`}>
            {badge}
          </span>
        </div>
      )}
    </article>
  );
};
