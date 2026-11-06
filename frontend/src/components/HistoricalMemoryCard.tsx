import React from 'react';
import { Database, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { HistoricalMemory } from '../types';

interface Props {
  memory: HistoricalMemory;
}

export const HistoricalMemoryCard: React.FC<Props> = ({ memory }) => {
  const isSuccess = memory.recorded_outcome.toLowerCase().includes('success');

  return (
    <div className="bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 border-2 border-indigo-200/90 dark:border-indigo-800/60 rounded-xl p-4 shadow-xs relative">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-600 text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            Retrieved from Hindsight
          </span>
          {memory.original_incident_id && (
            <span className="font-mono text-xs font-bold text-indigo-950 dark:text-indigo-200 bg-indigo-100/80 dark:bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
              Ref: {memory.original_incident_id}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {isSuccess ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Outcome: {memory.recorded_outcome}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 px-2 py-0.5 rounded-full font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Outcome: {memory.recorded_outcome}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2.5 text-xs">
        <div>
          <span className="text-slate-500 dark:text-slate-400 font-medium block">Previous Defect Pattern:</span>
          <p className="text-slate-900 dark:text-slate-100 font-medium mt-0.5 bg-white/80 dark:bg-slate-800/80 p-2 rounded border border-slate-200/70 dark:border-slate-700/60">
            {memory.previous_defect}
          </p>
        </div>

        {memory.verified_root_cause && (
          <div>
            <span className="text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Verified Root Cause (Established Fact):
            </span>
            <p className="text-slate-800 dark:text-slate-200 bg-emerald-50/60 dark:bg-emerald-950/40 p-2 rounded border border-emerald-200/80 dark:border-emerald-800/60 mt-0.5">
              {memory.verified_root_cause}
            </p>
          </div>
        )}

        <div>
          <span className="text-slate-500 dark:text-slate-400 font-medium block">Proven Corrective Action:</span>
          <p className="text-slate-900 dark:text-slate-100 font-medium bg-white/80 dark:bg-slate-800/80 p-2 rounded border border-slate-200/70 dark:border-slate-700/60 mt-0.5">
            {memory.corrective_action}
          </p>
        </div>

        <div className="bg-indigo-50/50 dark:bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-800/60 mt-2">
          <span className="text-indigo-900 dark:text-indigo-300 font-semibold flex items-center gap-1 mb-0.5">
            <ArrowRight className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> Why this memory is relevant:
          </span>
          <p className="text-indigo-800 dark:text-indigo-200 text-xs leading-relaxed">
            {memory.relevance_reason}
          </p>
        </div>
      </div>
    </div>
  );
};
