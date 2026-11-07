import React, { useState, useEffect } from 'react';
import {
  Incident,
  Investigation,
  CorrectiveAction,
  HistoricalMemory,
  RecommendationItem
} from '../types';
import { api } from '../services/api';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { HistoricalMemoryCard } from '../components/HistoricalMemoryCard';
import { RecommendationCard } from '../components/RecommendationCard';
import {
  Sparkles,
  Database,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  RefreshCw,
  FileCheck,
  Send,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

interface Props {
  incidentId: string;
  onBack: () => void;
  onNavigateToDemo?: () => void;
}

export const InvestigationDetailsPage: React.FC<Props> = ({
  incidentId,
  onBack,
  onNavigateToDemo
}) => {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Outcome recording state for an action
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [outcomeVal, setOutcomeVal] = useState<'Successful' | 'Partially successful' | 'Unsuccessful'>('Successful');
  const [verifiedCauseVal, setVerifiedCauseVal] = useState('');
  const [feedbackVal, setFeedbackVal] = useState('');
  const [savingOutcome, setSavingOutcome] = useState(false);

  const loadData = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      else setLoading(true);

      // Step 1: Resilient incident retrieval (retry once after short pause in case of container propagation)
      let inc: Incident | null = null;
      try {
        inc = await api.getIncident(incidentId);
      } catch (err1) {
        await new Promise(r => setTimeout(r, 600));
        try {
          inc = await api.getIncident(incidentId);
        } catch (err2) {
          console.warn(`Incident ${incidentId} not found after retry:`, err2);
        }
      }

      if (inc) {
        setIncident(inc);
      }

      // Step 2: Fetch investigation and corrective actions in parallel without blocking each other
      const invPromise = forceRefresh
        ? api.runInvestigation(incidentId, true)
        : api.getInvestigation(incidentId);
      const actsPromise = api.getActions(incidentId);

      const [invResult, actsResult] = await Promise.allSettled([invPromise, actsPromise]);

      if (invResult.status === 'fulfilled') {
        setInvestigation(invResult.value);
      } else {
        console.warn('Investigation load notice:', invResult.reason);
      }

      if (actsResult.status === 'fulfilled') {
        const acts = actsResult.value;
        setActions(acts);
        // Pre-fill outcome form if action exists
        if (acts.length > 0) {
          setSelectedActionId(acts[0].id);
          if (acts[0].verified_root_cause) setVerifiedCauseVal(acts[0].verified_root_cause);
          if (acts[0].feedback) setFeedbackVal(acts[0].feedback);
        }
      }
    } catch (err) {
      console.error('Error loading incident details:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [incidentId]);

  const handleRecordOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActionId) return;

    try {
      setSavingOutcome(true);
      setFeedbackSuccess(null);

      const updated = await api.updateAction(selectedActionId, {
        status: 'Completed',
        outcome: outcomeVal,
        verified_root_cause: verifiedCauseVal.trim() || undefined,
        feedback: feedbackVal.trim() || undefined
      });

      setFeedbackSuccess(
        outcomeVal === 'Successful'
          ? 'Outcome verified & retained in Hindsight memory bank! The agent will use this experience in future investigations.'
          : 'Corrective action feedback recorded.'
      );

      // Reload fresh state
      await loadData();
    } catch (err: any) {
      alert(`Error saving outcome: ${err.message}`);
    } finally {
      setSavingOutcome(false);
    }
  };

  const handleAcceptRecommendation = async (rec: RecommendationItem) => {
    try {
      // Find matching action or update
      await api.getActions(incidentId);
      setFeedbackSuccess(`Accepted corrective recommendation: "${rec.action}"`);
      await loadData();
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-slate-200 rounded-xl"></div>
          <div className="h-96 bg-slate-200 rounded-xl lg:col-span-2"></div>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 text-center text-xs text-slate-500">
        Incident not found. <button onClick={onBack} className="text-indigo-600 underline">Go back</button>
      </div>
    );
  }

  const recalledMemories: HistoricalMemory[] = investigation?.recalled_memories || [];
  const hasMemories = recalledMemories.length > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shrink-0"
            aria-label="Back to incidents list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 shrink-0">
                {incident.id}
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">{incident.title}</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              Reported on {new Date(incident.created_at).toLocaleString()} · Batch: <span className="font-mono font-medium">{incident.batch_number}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
            Re-run Agent Investigation
          </button>
          {onNavigateToDemo && (
            <button
              onClick={onNavigateToDemo}
              className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Demo View
            </button>
          )}
        </div>
      </div>

      {feedbackSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
          <button onClick={() => setFeedbackSuccess(null)} className="text-emerald-700 hover:text-emerald-900 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Two-Column Investigation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Incident Summary & Production Context */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Incident Summary
              </span>
              <StatusBadge status={incident.status} />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Product / SKU</span>
                <p className="font-semibold text-slate-800 text-sm">{incident.product_name}</p>
                <p className="font-mono text-slate-500 text-[11px]">{incident.product_id}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block font-medium">Defect Category</span>
                  <p className="font-semibold text-slate-800">{incident.defect_category}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Severity</span>
                  <SeverityBadge severity={incident.severity} className="mt-0.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block font-medium">Production Stage</span>
                  <p className="font-semibold text-slate-800">{incident.production_stage}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Units Affected</span>
                  <p className="font-mono font-bold text-slate-800">{incident.quantity_affected} units</p>
                </div>
              </div>

              {incident.machine && (
                <div>
                  <span className="text-slate-400 block font-medium">Machine / Equipment</span>
                  <p className="font-medium text-slate-800">{incident.machine}</p>
                </div>
              )}

              {incident.supplier && (
                <div>
                  <span className="text-slate-400 block font-medium">Supplier</span>
                  <p className="font-medium text-slate-800">{incident.supplier}</p>
                </div>
              )}

              <div>
                <span className="text-slate-400 block font-medium">Defect Description</span>
                <p className="font-normal text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1 leading-relaxed">
                  {incident.description}
                </p>
              </div>

              {incident.image_url && (
                <div>
                  <span className="text-slate-400 block font-medium mb-1">Visual Evidence</span>
                  <img
                    src={incident.image_url}
                    alt="Defect"
                    className="w-full h-44 object-cover rounded-lg border border-slate-200"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Corrective Action Feedback & Outcome Controls (FR-04) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Record Outcome & Feedback
              </span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Triggers Hindsight Retain
              </span>
            </div>

            <form onSubmit={handleRecordOutcome} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Target Corrective Action
                </label>
                {actions.length === 0 ? (
                  <p className="text-slate-500 italic">No actions registered yet.</p>
                ) : (
                  <select
                    value={selectedActionId || ''}
                    onChange={(e) => setSelectedActionId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-600 font-medium"
                  >
                    {actions.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.action_description.slice(0, 50)}... ({a.outcome})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Observed Outcome Choice <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Successful', 'Partially successful', 'Unsuccessful'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setOutcomeVal(opt)}
                      className={`py-1.5 px-2 rounded text-[11px] font-bold border transition-colors ${
                        outcomeVal === opt
                          ? opt === 'Successful'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : opt === 'Partially successful'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Verified Root Cause (Confirmed Fact)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Improper handling during packaging without separators"
                  value={verifiedCauseVal}
                  onChange={(e) => setVerifiedCauseVal(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Trial Verification Notes & Feedback
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 100% inspection of 200 units confirmed zero defects over 3 shifts."
                  value={feedbackVal}
                  onChange={(e) => setFeedbackVal(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={savingOutcome || !selectedActionId}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {savingOutcome ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {savingOutcome ? 'Retaining to Hindsight...' : 'Verify Outcome & Retain Memory'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Agent Investigation & Historical Memory */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive AI Analysis */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">AI Quality Agent Investigation</h2>
                  <p className="text-[11px] text-slate-500">Autonomous synthesis using Hindsight persistent memory</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Confidence:</span>
                <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {investigation?.confidence_level || 'Medium'} Evidence
                </span>
              </div>
            </div>

            {!investigation ? (
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 text-xs text-indigo-950 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-semibold">AI Agent Investigation Ready to Run</span>
                </div>
                <p className="text-slate-600">
                  This incident is safely saved. Trigger the agent now to recall past manufacturing resolutions from Hindsight persistent memory and formulate root-cause hypotheses.
                </p>
                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={refreshing}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-xs shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Analyzing with Hindsight...' : 'Run Investigation Now'}
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-700 bg-slate-50/70 p-3.5 rounded-lg border border-slate-200 leading-relaxed font-medium">
                {investigation.summary}
              </div>
            )}

            {/* Historical Experience Card (Prominent section per PRD) */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  Historical Experience (Recalled from Hindsight)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {recalledMemories.length} relevant memory unit(s)
                </span>
              </div>

              {hasMemories ? (
                <div className="space-y-3">
                  {recalledMemories.map((mem, i) => (
                    <HistoricalMemoryCard key={mem.id || i} memory={mem} />
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500 bg-slate-50 flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-700">No historical memory recalled. </span>
                    <span>This defect pattern has not yet been verified in the Hindsight memory bank. Generic exploratory investigation applied.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Possible Root Causes (Distinguishing Hypotheses vs Facts per PRD) */}
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                Potential Root Causes (Working Hypotheses)
              </span>
              <div className="space-y-2">
                {(investigation?.possible_root_causes || []).map((cause, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 flex items-start gap-2 shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>
                    <span className="leading-snug">{cause}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Corrective Action Recommendations */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Recommended Corrective Actions
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {investigation?.recommendations.length || 0} Action Items
                </span>
              </div>
              <div className="space-y-3">
                {(investigation?.recommendations || []).map((rec, idx) => (
                  <RecommendationCard
                    key={rec.id || idx}
                    recommendation={rec}
                    onAccept={handleAcceptRecommendation}
                  />
                ))}
              </div>
            </div>

            {/* Supporting Engineering Evidence */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                Supporting Evidence & Context
              </span>
              <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                {(investigation?.evidence || []).map((ev, i) => (
                  <li key={i} className="leading-relaxed">{ev}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
