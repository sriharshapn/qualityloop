import React, { useState, useEffect } from 'react';
import { Incident } from '../types';
import { api } from '../services/api';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { Search, Filter, Plus, ArrowUpDown, ChevronRight, Layers } from 'lucide-react';

interface Props {
  onNavigate: (tab: string, incidentId?: string) => void;
  onOpenReport: () => void;
  initialSearch?: string;
}

export const IncidentsPage: React.FC<Props> = ({
  onNavigate,
  onOpenReport,
  initialSearch = ''
}) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [search, setSearch] = useState(initialSearch);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await api.getIncidents({
        status: statusFilter,
        category: categoryFilter,
        severity: severityFilter,
        search: search
      });
      setIncidents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter, categoryFilter, severityFilter, search]);

  const categories = [
    'All',
    'Surface defect',
    'Dimensional defect',
    'Packaging defect',
    'Material defect',
    'Assembly defect',
    'Functional defect',
    'Other'
  ];

  const severities = ['All', 'Critical', 'High', 'Medium', 'Low'];
  const statuses = ['All', 'Open', 'Action Required', 'Investigating', 'Resolved'];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight">Defect Incident Registry</h1>
          <p className="text-xs text-[#687386] mt-1">
            Browse, filter, and review manufacturing non-conformances and their AI investigations.
          </p>
        </div>
        <button
          onClick={onOpenReport}
          className="px-4 py-2 text-xs font-bold text-white bg-[#4169E1] hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          + Report Defect
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E9F0] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-[#F7F8FA] text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-[#F7F8FA] text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Severity filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-[#F7F8FA] text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
            >
              {severities.map((sev) => (
                <option key={sev} value={sev}>{sev}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, title, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md bg-[#F7F8FA] focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
          />
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-xl border border-[#E5E9F0] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading incident records...</div>
        ) : incidents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            No matching incidents found. Adjust your filters or create a new defect report.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FA] text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Incident ID</th>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Product / SKU</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">Stage & Machine</th>
                  <th className="py-3 px-4">Units Affected</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => onNavigate('investigation-details', inc.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                      {inc.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 max-w-xs truncate">{inc.title}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{inc.description}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{inc.product_name}</div>
                      <div className="font-mono text-[10px] text-slate-500">{inc.product_id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {inc.batch_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800">{inc.production_stage}</div>
                      <div className="text-[10px] text-slate-500">{inc.machine || 'General line'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {inc.quantity_affected}
                    </td>
                    <td className="py-3.5 px-4">
                      <SeverityBadge severity={inc.severity} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1">
                        View <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
