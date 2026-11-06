import React from 'react';
import { MemoryEvent } from '../types';
import { Database, Search, Sparkles, CheckCircle2, AlertCircle, Clock, ArrowUpRight } from 'lucide-react';

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
      <div className="text-center py-10 text-slate-500 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <Clock className="w-6 h-6 mx-auto mb-2 text-slate-400" />
        <p className="font-semibold text-slate-700">{emptyMessage}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Retained corrective experiences appear here live</p>
      </div>
    );
  }

  const getEventMeta = (type: string) => {
    switch (type) {
      case 'RETAIN':
        return {
          icon: Database,
          label: 'RETAIN',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotClass: 'bg-emerald-500 ring-emerald-100',
          gradient: 'from-emerald-500/20 to-transparent'
        };
      case 'RECALL':
        return {
          icon: Search,
          label: 'RECALL',
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dotClass: 'bg-indigo-500 ring-indigo-100',
          gradient: 'from-indigo-500/20 to-transparent'
        };
      case 'REFLECT':
        return {
          icon: Sparkles,
          label: 'REFLECT',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
          dotClass: 'bg-purple-500 ring-purple-100',
          gradient: 'from-purple-500/20 to-transparent'
        };
      default:
        return {
          icon: Database,
          label: type,
          badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
          dotClass: 'bg-slate-500 ring-slate-100',
          gradient: 'from-slate-500/20 to-transparent'
        };
    }
  };

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-indigo-200 before:via-slate-200 before:to-transparent">
      {events.map((evt) => {
        const meta = getEventMeta(evt.event_type);
        const Icon = meta.icon;
        const dateStr = new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        return (
          <article
            key={evt.id}
            className="group relative bg-white border border-slate-200/90 rounded-xl p-3.5 text-xs shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all duration-200"
          >
            {/* Timeline node dot */}
            <div
              className={`absolute -left-6 top-4 w-3.5 h-3.5 rounded-full border-2 border-white ring-4 shadow-xs transition-transform duration-200 group-hover:scale-125 ${meta.dotClass}`}
            />

            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border tracking-wider shadow-2xs ${meta.badgeClass}`}>
                  <Icon className="w-3 h-3" />
                  {meta.label}
                </span>

                {evt.incident_id && (
                  <span className="font-mono text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                    {evt.incident_id}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span className="font-semibold text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                  {evt.latency_ms}ms
                </span>
                <span>{dateStr}</span>
              </div>
            </div>

            <p className="text-slate-800 font-medium leading-relaxed">
              {evt.response_summary}
            </p>

            {evt.query_or_content && (
              <details className="mt-2 text-[11px] text-slate-500">
                <summary className="cursor-pointer hover:text-indigo-600 font-mono text-[10px] flex items-center gap-1 select-none transition-colors">
                  <ArrowUpRight className="w-3 h-3" />
                  View Memory Payload & Grounding
                </summary>
                <pre className="mt-1.5 p-2.5 bg-slate-900 text-slate-200 rounded-lg border border-slate-800 overflow-x-auto text-[10px] font-mono leading-relaxed whitespace-pre-wrap">
                  {evt.query_or_content}
                </pre>
              </details>
            )}
          </article>
        );
      })}
    </div>
  );
};
