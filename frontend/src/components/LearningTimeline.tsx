import React from 'react';
import { MemoryEvent } from '../types';
import { Database, Search, Sparkles, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface Props {
  events: MemoryEvent[];
  emptyMessage?: string;
}

export const LearningTimeline: React.FC<Props> = ({
  events,
  emptyMessage = 'No memory operations recorded yet.'
}) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-xs">
        <Clock className="w-6 h-6 mx-auto mb-2 text-slate-400" />
        {emptyMessage}
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'RETAIN':
        return <Database className="w-3.5 h-3.5 text-emerald-600" />;
      case 'RECALL':
        return <Search className="w-3.5 h-3.5 text-indigo-600" />;
      case 'REFLECT':
        return <Sparkles className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Database className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'SUCCESS') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
          <CheckCircle2 className="w-2.5 h-2.5" /> SUCCESS
        </span>
      );
    }
    if (status === 'WARNING') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
          <AlertCircle className="w-2.5 h-2.5" /> AUDIT ONLY
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
        <AlertCircle className="w-2.5 h-2.5" /> FAILED
      </span>
    );
  };

  return (
    <div className="space-y-3">
      {events.map((evt) => {
        const dateStr = new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return (
          <div key={evt.id} className="bg-white border border-slate-200 rounded-lg p-3 text-xs shadow-2xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                <span className="p-1 rounded bg-slate-100 flex items-center justify-center">
                  {getEventIcon(evt.event_type)}
                </span>
                <span className="font-bold tracking-wider text-slate-800 text-[11px]">
                  {evt.event_type}
                </span>
                {evt.incident_id && (
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    {evt.incident_id}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(evt.operation_status)}
                <span className="text-[10px] text-slate-400 font-mono">
                  {evt.latency_ms}ms · {dateStr}
                </span>
              </div>
            </div>

            <p className="text-slate-700 font-medium mt-1 leading-snug">
              {evt.response_summary}
            </p>

            {evt.query_or_content && (
              <details className="mt-2 text-[11px] text-slate-500">
                <summary className="cursor-pointer hover:text-slate-700 font-mono text-[10px]">
                  View Operation Payload
                </summary>
                <pre className="mt-1 p-2 bg-slate-50 rounded border border-slate-200 overflow-x-auto text-[10px] text-slate-700 font-mono whitespace-pre-wrap">
                  {evt.query_or_content}
                </pre>
              </details>
            )}
          </div>
        );
      })}
    </div>
  );
};
