import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Repeat,
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Search,
  ShieldCheck,
  Cpu,
  Database,
  SlidersHorizontal,
  ChevronRight,
  Zap,
  Flame
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { DashboardStats, Incident } from '../types';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { LearningTimeline } from '../components/LearningTimeline';

interface Props {
  onNavigate: (tab: string, incidentId?: string) => void;
  onOpenReport: () => void;
}

const BAR_GRADIENTS = [
  { id: 'grad-blue', start: '#3B82F6', end: '#1D4ED8' },
  { id: 'grad-indigo', start: '#6366F1', end: '#4338CA' },
  { id: 'grad-emerald', start: '#10B981', end: '#047857' },
  { id: 'grad-amber', start: '#F59E0B', end: '#B45309' },
  { id: 'grad-rose', start: '#F43F5E', end: '#BE123C' },
  { id: 'grad-sky', start: '#0EA5E9', end: '#0369A1' },
  { id: 'grad-purple', start: '#A855F7', end: '#7E22CE' }
];

const SEVERITY_COLORS: Record<string, string> = {
  Critical: '#EF4444',
  High: '#F97316',
  Medium: '#FBBF24',
  Low: '#10B981'
};

export const DashboardPage: React.FC<Props> = ({ onNavigate, onOpenReport }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incidentFilter, setIncidentFilter] = useState<'All' | 'Open' | 'High'>('All');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Compute severity distribution for donut chart
  const severityDistribution = useMemo(() => {
    if (!stats || !stats.recent_incidents) return [];
    const counts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    stats.recent_incidents.forEach((inc) => {
      if (counts[inc.severity] !== undefined) {
        counts[inc.severity]++;
      } else {
        counts[inc.severity] = 1;
      }
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0);
  }, [stats]);

  // Filtered recent incidents
  const filteredIncidents = useMemo(() => {
    if (!stats?.recent_incidents) return [];
    if (incidentFilter === 'Open') {
      return stats.recent_incidents.filter((inc) => inc.status !== 'Resolved');
    }
    if (incidentFilter === 'High') {
      return stats.recent_incidents.filter(
        (inc) => inc.severity === 'Critical' || inc.severity === 'High'
      );
    }
    return stats.recent_incidents;
  }, [stats, incidentFilter]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-44 bg-slate-200/80 dark:bg-slate-800/60 rounded-2xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200/80 dark:bg-slate-800/60 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-200/80 dark:bg-slate-800/60 rounded-2xl lg:col-span-2"></div>
          <div className="h-80 bg-slate-200/80 dark:bg-slate-800/60 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* 1. Hero Intelligence Executive Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-indigo-500/20 text-white p-6 sm:p-8 shadow-xl">
        {/* Ambient background glows */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Autonomous Closed-Loop Quality Intelligence</span>
              <span className="text-indigo-400/60">·</span>
              <span className="font-mono text-[11px] text-indigo-200">Gemini 3.5 & Hindsight Active</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Manufacturing Quality Control & Memory Agent
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every defect diagnosed is retained in the persistent memory bank. When similar manufacturing faults emerge, the agent recalls past root causes and verified fixes instantly.
            </p>

            {/* Quick Intelligence Metric Chips */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>RCA Acceleration: <strong className="text-white font-bold">3.4x Faster</strong></span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>Memory Persistence: <strong className="text-white font-bold">Bank qualityloop</strong></span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fix Verification: <strong className="text-white font-bold">Feedback Guarded</strong></span>
              </div>
            </div>
          </div>

          {/* CTA Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={onOpenReport}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 hover:shadow-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Report Defect
            </button>

            <button
              onClick={() => onNavigate('learning-demo')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl text-xs font-bold backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              Watch Learning Demo
            </button>
          </div>
        </div>
      </section>

      {/* 2. Elevated Modern KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Total Incidents"
          value={stats?.total_incidents || 0}
          subtitle="Non-conformances tracked"
          icon={Activity}
          variant="default"
          trend="+12% total"
          trendPositive={false}
          onClick={() => onNavigate('incidents')}
        />
        <StatCard
          title="Open Incidents"
          value={stats?.open_incidents || 0}
          subtitle="Awaiting root cause or action"
          icon={AlertTriangle}
          variant="warning"
          trend="Action required"
          trendPositive={false}
          onClick={() => onNavigate('incidents')}
        />
        <StatCard
          title="Resolved Defects"
          value={stats?.resolved_incidents || 0}
          subtitle="Verified corrective actions"
          icon={CheckCircle2}
          variant="success"
          trend="Closed loop"
          trendPositive={true}
          onClick={() => onNavigate('incidents')}
        />
        <StatCard
          title="Recurring Faults"
          value={stats?.recurring_defects || 0}
          subtitle="Cross-batch duplicate classes"
          icon={Repeat}
          variant="critical"
          trend="Flagged"
          trendPositive={false}
          onClick={() => onNavigate('incidents')}
        />
        <StatCard
          title="Retained Experiences"
          value={stats?.retained_experiences || 0}
          subtitle="Persistent Hindsight units"
          icon={Sparkles}
          variant="ai"
          badge="Hindsight Sync"
          trend="Active"
          trendPositive={true}
          onClick={() => onNavigate('learning-demo')}
        />
      </section>

      {/* 3. Visual Analytics & Diagnostic Breakdown Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Defect Category Breakdown (BarChart with SVG Gradients) */}
        <article className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Defect Category Distribution</h2>
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-2 py-0.5 rounded-full">
                    {stats?.categories.length || 0} Categories
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Volume of defect incidents categorized by manufacturing non-conformance type
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Live Telemetry</span>
              </div>
            </div>

            <div className="h-68 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.categories || []} margin={{ top: 15, right: 10, left: -20, bottom: 25 }}>
                  <defs>
                    {BAR_GRADIENTS.map((g) => (
                      <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={g.start} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={g.end} stopOpacity={1} />
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748B', fontWeight: 500 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)'
                    }}
                    itemStyle={{ color: '#E2E8F0', fontWeight: 600 }}
                    cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={45}>
                    {(stats?.categories || []).map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#${BAR_GRADIENTS[index % BAR_GRADIENTS.length].id})`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Summary Chips */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
            {(stats?.categories || []).slice(0, 4).map((c, i) => (
              <span
                key={c.name}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 px-2.5 py-1 rounded-lg"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: BAR_GRADIENTS[i % BAR_GRADIENTS.length].start }}
                />
                <span>{c.name}:</span>
                <strong className="text-slate-900 dark:text-white">{c.count}</strong>
              </span>
            ))}
          </div>
        </article>

        {/* Chart 2: Severity Distribution Radial Donut */}
        <article className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Severity Breakdown</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Risk impact of monitored incidents</p>
              </div>
              <Flame className="w-4 h-4 text-rose-500" />
            </div>

            <div className="h-48 relative flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityDistribution}
                    innerRadius={52}
                    outerRadius={74}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {severityDistribution.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={SEVERITY_COLORS[entry.name] || '#94A3B8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {stats?.total_incidents || 0}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total
                </span>
              </div>
            </div>
          </div>

          {/* Severity Legend Cards */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            {['Critical', 'High', 'Medium', 'Low'].map((sev) => {
              const count = severityDistribution.find((x) => x.name === sev)?.value || 0;
              return (
                <div
                  key={sev}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: SEVERITY_COLORS[sev] }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{sev}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{count}</span>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      {/* 4. Production Stage Pipeline Section */}
      <section className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Defect Inception by Production Stage</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Identifies manufacturing choke points and stage vulnerability across the shop floor
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg self-start sm:self-auto border border-slate-200 dark:border-slate-700">
            {stats?.stage_trends?.length || 0} Manufacturing Stages
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {(stats?.stage_trends || []).map((st) => {
            const maxCount = Math.max(...(stats?.stage_trends.map((x) => x.count) || [1]));
            const pct = Math.round((st.count / (stats?.total_incidents || 1)) * 100);

            return (
              <div
                key={st.stage}
                className="group relative bg-slate-100/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 rounded-xl p-4 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate" title={st.stage}>
                    {st.stage}
                  </h3>
                  {st.high_severity > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/60">
                      <Flame className="w-3 h-3 text-rose-500" />
                      {st.high_severity} High
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                      Standard
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {st.count}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {pct}% of defects
                  </span>
                </div>

                {/* Progress bar track */}
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (st.count / maxCount) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Live Operations: Recent Incidents Table & Memory Timeline */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Incidents Table with Filter Tabs */}
        <article className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Manufacturing Incidents</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Click any incident to open the AI investigation and recalled historical experience</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto border border-slate-200/70 dark:border-slate-700">
                {(['All', 'Open', 'High'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setIncidentFilter(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      incidentFilter === tab
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab === 'High' ? 'Critical/High' : tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0 rounded-xl">
              <table className="w-full text-left text-xs min-w-[550px]">
                <thead className="bg-slate-50/90 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-y border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">Product / Title</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Severity</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Investigation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredIncidents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No incidents matching current filter
                      </td>
                    </tr>
                  ) : (
                    filteredIncidents.map((inc) => (
                      <tr
                        key={inc.id}
                        onClick={() => onNavigate('investigation-details', inc.id)}
                        className="group hover:bg-indigo-50/40 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-3 font-mono font-bold text-indigo-700 dark:text-indigo-400">
                          <span className="bg-indigo-50 dark:bg-indigo-950/60 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 transition-colors">
                            {inc.id}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate max-w-[200px] transition-colors">
                            {inc.title}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            {inc.product_name} · Batch: {inc.batch_number}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                          {inc.defect_category}
                        </td>
                        <td className="py-3 px-3">
                          <SeverityBadge severity={inc.severity} />
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={inc.status} />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                            Investigate <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredIncidents.length} of {stats?.total_incidents || 0} incidents
            </span>
            <button
              onClick={() => onNavigate('incidents')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              Open Full Incident Registry <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </article>

        {/* Agent Learning Stream: Live Hindsight Memory Stream */}
        <article className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-xl shadow-md shadow-indigo-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Agent Learning Activity</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Live Hindsight Persistent Memory pipeline</p>
                </div>
              </div>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            <div className="max-h-[380px] overflow-y-auto pr-1">
              <LearningTimeline
                events={stats?.recent_memory_events || []}
                emptyMessage="No memory operations recorded yet. Verify a corrective action to retain experiences!"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">Bank: qualityloop</span>
            <button
              onClick={() => onNavigate('learning-demo')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
            >
              Simulate Learning &rarr;
            </button>
          </div>
        </article>
      </section>
    </div>
  );
};
