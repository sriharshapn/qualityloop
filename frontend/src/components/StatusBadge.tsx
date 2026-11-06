import React from 'react';
import { IncidentStatus } from '../types';

interface Props {
  status: IncidentStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<Props> = ({ status, className = '' }) => {
  const normalized = status.toLowerCase();

  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

  if (normalized === 'resolved') {
    badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (normalized === 'action required') {
    badgeStyle = 'bg-amber-50 text-amber-800 border-amber-300';
  } else if (normalized === 'investigating') {
    badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (normalized === 'open') {
    badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle} ${className}`}>
      {status}
    </span>
  );
};
