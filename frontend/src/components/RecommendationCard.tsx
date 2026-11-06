import React from 'react';
import { RecommendationItem } from '../types';
import { Sparkles, Check, Play, Edit3, ArrowUpRight } from 'lucide-react';

interface Props {
  recommendation: RecommendationItem;
  onAccept?: (rec: RecommendationItem) => void;
  onReject?: (rec: RecommendationItem) => void;
  isActionable?: boolean;
}

export const RecommendationCard: React.FC<Props> = ({
  recommendation,
  onAccept,
  onReject,
  isActionable = true
}) => {
  const isGrounded = recommendation.grounded_in_memory;

  let priorityBadge = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  if (recommendation.priority === 'High') priorityBadge = 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800';
  if (recommendation.priority === 'Medium') priorityBadge = 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  if (recommendation.priority === 'Low') priorityBadge = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isGrounded 
        ? 'bg-indigo-50/40 dark:bg-indigo-950/40 border-indigo-200/90 dark:border-indigo-800/60 shadow-xs' 
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${priorityBadge}`}>
            {recommendation.priority} Priority
          </span>
          {recommendation.target_stage && (
            <span className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              Stage: {recommendation.target_stage}
            </span>
          )}
          {isGrounded && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-600 text-white px-2 py-0.5 rounded shadow-2xs">
              <Sparkles className="w-3 h-3" />
              Informed by Learned Experience
            </span>
          )}
        </div>
      </div>

      <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
        {recommendation.action}
      </p>

      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
        <span className="font-medium text-slate-500 dark:text-slate-400">Expected Impact: </span>
        <span>{recommendation.expected_impact}</span>
      </div>

      {isActionable && onAccept && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          {onReject && (
            <button
              onClick={() => onReject(recommendation)}
              className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            >
              Reject
            </button>
          )}
          <button
            onClick={() => onAccept(recommendation)}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors shadow-2xs"
          >
            <Check className="w-3.5 h-3.5" />
            Accept Action
          </button>
        </div>
      )}
    </div>
  );
};
