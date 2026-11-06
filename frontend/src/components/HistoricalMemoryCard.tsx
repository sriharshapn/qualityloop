import React from 'react';
import { Database, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { HistoricalMemory } from '../types';

interface Props {
  memory: HistoricalMemory;
}

export const HistoricalMemoryCard: React.FC<Props> = ({ memory }) => {
  const isSuccess = memory.recorded_outcome.toLowerCase().includes('success');

  return (
    <div className="bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 border-2 border-indigo-200/90 rounded-xl p-4 shadow-xs relative">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-600 text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            Retrieved from Hindsight
          </span>
          {memory.original_incident_id && (
            <span className="font-mono text-xs font-bold text-indigo-950 bg-indigo-100/80 px-2 py-0.5 rounded border border-indigo-200">
              Ref: {memory.original_incident_id}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {isSuccess ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Outcome: {memory.recorded_outcome}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Outcome: {memory.recorded_outcome}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2.5 text-xs">
        <div>
          <span className="text-slate-500 font-medium block">Previous Defect Pattern:</span>
          <p className="text-slate-900 font-medium mt-0.5 bg-white/80 p-2 rounded border border-slate-200/70">
            {memory.previous_defect}
          </p>
        </div>

        {memory.verified_root_cause && (
          <div>
            <span className="text-emerald-800 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Root Cause (Established Fact):
            </span>
            <p className="text-slate-800 bg-emerald-50/60 p-2 rounded border border-emerald-200/80 mt-0.5">
              {memory.verified_root_cause}
            </p>
          </div>
        )}

        <div>
          <span className="text-slate-500 font-medium block">Proven Corrective Action:</span>
          <p className="text-slate-900 font-medium bg-white/80 p-2 rounded border border-slate-200/70 mt-0.5">
            {memory.corrective_action}
          </p>
        </div>

        <div className="bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100 mt-2">
          <span className="text-indigo-900 font-semibold flex items-center gap-1 mb-0.5">
            <ArrowRight className="w-3 h-3 text-indigo-600" /> Why this memory is relevant:
          </span>
          <p className="text-indigo-800 text-xs leading-relaxed">
            {memory.relevance_reason}
          </p>
        </div>
      </div>
    </div>
  );
};
