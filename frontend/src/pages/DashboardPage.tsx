import React, { useState, useEffect } from 'react';
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
  Search
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
  Pie
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

const CATEGORY_COLORS = ['#4169E1', '#715CE5', '#16A36A', '#D99524', '#DC5353', '#0284C7', '#9333EA'];

export const DashboardPage: React.FC<Props> = ({ onNavigate, onOpenReport }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-10 bg-slate-200 rounded-lg w-2/3 sm:w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200 rounded-xl lg:col-span-2"></div>
          <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">Quality Overview</h1>
          <p className="text-xs text-[#687386] mt-1">
            Monitor manufacturing quality, investigate defects and learn from operational experience.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('learning-demo')}
            className="flex-1 sm:flex-initial justify-center px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Watch Learning Demo
          </button>
          <button
            onClick={onOpenReport}
            className="flex-1 sm:flex-initial justify-center px-4 py-2 text-xs font-bold text-white bg-[#4169E1] hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            + Report Defect
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Total Incidents"
          value={stats?.total_incidents || 0}
          subtitle="All reported non-conformances"
          icon={Activity}
          variant="default"
        />
        <StatCard
          title="Open Incidents"
          value={stats?.open_incidents || 0}
          subtitle="Awaiting resolution or action"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="Resolved Incidents"
          value={stats?.resolved_incidents || 0}
          subtitle="Verified corrective actions"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Recurring Defects"
          value={stats?.recurring_defects || 0}
          subtitle="Categories occurring >1 time"
          icon={Repeat}
          variant="critical"
        />
        <StatCard
          title="Retained Experiences"
          value={stats?.retained_experiences || 0}
          subtitle="Persistent Hindsight memories"
          icon={Sparkles}
          variant="ai"
          badge="Hindsight Active"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Defect Category Distribution */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E9F0] shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#172033]">Defect Category Breakdown</h2>
              <p className="text-xs text-[#687386]">Distribution of reported manufacturing non-conformances</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
              Total Categories: {stats?.categories.length || 0}
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.categories || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#687386' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#687386' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#101827', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {(stats?.categories || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stage Inception Rates */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E9F0] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#172033]">Defect by Production Stage</h2>
              <p className="text-xs text-[#687386]">High vs standard severity occurrences</p>
            </div>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-3.5">
            {(stats?.stage_trends || []).slice(0, 5).map((st, i) => (
              <div key={i} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-800">{st.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{st.count} incidents</span>
                    {st.high_severity > 0 && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        {st.high_severity} Crit/High
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${Math.min(100, (st.count / Math.max(...(stats?.stage_trends.map(x => x.count) || [1]))) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Incidents & Memory Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Incidents Table */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E9F0] shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#172033]">Recent Manufacturing Incidents</h2>
              <p className="text-xs text-[#687386]">Directly click an incident to inspect AI investigation and recalled experiences</p>
            </div>
            <button
              onClick={() => onNavigate('incidents')}
              className="text-xs font-semibold text-[#4169E1] hover:underline flex items-center gap-1"
            >
              View all ({stats?.total_incidents || 0}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead className="bg-[#F7F8FA] text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Product / Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(stats?.recent_incidents || []).map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => onNavigate('investigation-details', inc.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                      {inc.id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 truncate max-w-[200px]">{inc.title}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{inc.product_name} · {inc.batch_number}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {inc.defect_category}
                    </td>
                    <td className="py-3 px-3">
                      <SeverityBadge severity={inc.severity} />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                        Investigate &rarr;
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Agent Learning Activity Panel */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E9F0] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#172033]">Agent Learning Activity</h2>
                <p className="text-xs text-[#687386]">Live Hindsight memory pipeline audit</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <LearningTimeline
            events={stats?.recent_memory_events || []}
            emptyMessage="No memory operations recorded yet. Record a corrective action to retain memories!"
          />
        </div>
      </div>
    </div>
  );
};
