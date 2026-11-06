import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MemoryEvent, HistoricalMemory } from '../types';
import {
  BrainCircuit,
  Sparkles,
  Database,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Search,
  Zap,
  Play,
  RotateCcw,
  Check,
  ShieldCheck
} from 'lucide-react';
import { LearningTimeline } from '../components/LearningTimeline';

export const LearningDemoPage: React.FC = () => {
  // Demo step state: 0 = unrun, 1 = before completed, 2 = learning retained, 3 = after completed
  const [demoStep, setDemoStep] = useState<number>(0);
  const [loadingStep, setLoadingStep] = useState<number | null>(null);

  // Before Learning state
  const [beforeData, setBeforeData] = useState<any>(null);

  // Learning retention state
  const [learningResult, setLearningResult] = useState<any>(null);

  // After Learning state
  const [afterData, setAfterData] = useState<any>(null);

  // Reflection result state
  const [reflectionText, setReflectionText] = useState<string | null>(null);
  const [reflecting, setReflecting] = useState(false);

  // Memory events
  const [memoryEvents, setMemoryEvents] = useState<MemoryEvent[]>([]);

  const loadMemoryEvents = async () => {
    try {
      const events = await api.getMemoryEvents(20);
      setMemoryEvents(events);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadMemoryEvents();
  }, []);

  // Step 1: Run Before Learning
  const handleRunBefore = async () => {
    try {
      setLoadingStep(1);
      const res = await api.runBeforeDemo();
      setBeforeData(res);
      setDemoStep(Math.max(demoStep, 1));
      await loadMemoryEvents();
    } catch (err: any) {
      alert(`Error running Before Learning: ${err.message}`);
    } finally {
      setLoadingStep(null);
    }
  };

  // Step 2: Record Learning & Retain
  const handleRecordLearning = async () => {
    try {
      setLoadingStep(2);
      const res = await api.recordLearningDemo();
      setLearningResult(res);
      setDemoStep(Math.max(demoStep, 2));
      await loadMemoryEvents();
    } catch (err: any) {
      alert(`Error recording learning: ${err.message}`);
    } finally {
      setLoadingStep(null);
    }
  };

  // Step 3: Run After Learning
  const handleRunAfter = async () => {
    try {
      setLoadingStep(3);
      const res = await api.runAfterDemo();
      setAfterData(res);
      setDemoStep(3);
      await loadMemoryEvents();
    } catch (err: any) {
      alert(`Error running After Learning: ${err.message}`);
    } finally {
      setLoadingStep(null);
    }
  };

  // Reset Demo
  const handleReset = async () => {
    try {
      setLoadingStep(0);
      await api.resetDemo();
      setBeforeData(null);
      setLearningResult(null);
      setAfterData(null);
      setReflectionText(null);
      setDemoStep(0);
      await loadMemoryEvents();
    } catch (err: any) {
      alert(`Error resetting demo: ${err.message}`);
    } finally {
      setLoadingStep(null);
    }
  };

  // Synthesize Reflection
  const handleReflect = async () => {
    try {
      setReflecting(true);
      const res = await api.manualReflect(
        "Analyze recurring failure patterns, root causes, and successful corrective actions for surface defects on aluminium components across all manufacturing experiences."
      );
      setReflectionText(res.text || 'Reflection generated across retained experiences.');
      await loadMemoryEvents();
    } catch (err: any) {
      alert(`Error synthesizing reflection: ${err.message}`);
    } finally {
      setReflecting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Flagship Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-sm">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">See How QualityLoop Learns</h1>
          </div>
          <p className="text-xs text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
            Watch how previous manufacturing defect investigations and verified corrective action outcomes stored in{' '}
            <strong className="text-indigo-700 font-semibold">Hindsight persistent memory</strong> directly improve decision-making in new situations.
          </p>
        </div>

        {/* Demo Controller Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            disabled={loadingStep !== null}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Reset Demo State
          </button>
        </div>
      </div>

      {/* Step Progress Controller Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
          Interactive Evaluation Flow
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Step 1 Button */}
          <button
            onClick={handleRunBefore}
            disabled={loadingStep !== null}
            className={`p-3 rounded-lg border text-left transition-all ${
              demoStep >= 1
                ? 'bg-blue-50/70 border-blue-300 text-blue-950'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1">
              <span>1. Initial Incident (QL-001)</span>
              {demoStep >= 1 ? <CheckCircle2 className="w-4 h-4 text-blue-600" /> : <Play className="w-3.5 h-3.5 text-slate-400" />}
            </div>
            <p className="text-[11px] text-slate-600">
              {loadingStep === 1 ? 'Investigating with 0 prior memories...' : 'Run investigation without prior memory.'}
            </p>
          </button>

          {/* Step 2 Button */}
          <button
            onClick={handleRecordLearning}
            disabled={loadingStep !== null || demoStep < 1}
            className={`p-3 rounded-lg border text-left transition-all ${
              demoStep >= 2
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : demoStep === 1
                ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 hover:bg-indigo-100/70 animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1">
              <span>2. Engineer Verifies & Retains</span>
              {demoStep >= 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Database className="w-3.5 h-3.5 text-indigo-600" />}
            </div>
            <p className="text-[11px] text-slate-600">
              {loadingStep === 2 ? 'Persisting experience to Hindsight...' : 'Verify outcome & retain to Hindsight.'}
            </p>
          </button>

          {/* Step 3 Button */}
          <button
            onClick={handleRunAfter}
            disabled={loadingStep !== null || demoStep < 2}
            className={`p-3 rounded-lg border text-left transition-all ${
              demoStep >= 3
                ? 'bg-purple-50/70 border-purple-300 text-purple-950'
                : demoStep === 2
                ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1">
              <span>3. New Similar Defect (QL-009)</span>
              {demoStep >= 3 ? <Sparkles className="w-4 h-4 text-purple-600" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </div>
            <p className={`text-[11px] ${demoStep === 2 ? 'text-indigo-100' : 'text-slate-600'}`}>
              {loadingStep === 3 ? 'Recalling Hindsight memory...' : 'Investigate similar defect using memory.'}
            </p>
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Panels (Part 7-G & Part 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANEL: BEFORE LEARNING */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Scenario 1: Before Learning
                </span>
                <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  QL-001 (BATCH-001)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Aluminium Housing Pro · Surface Scratches</p>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
              Zero Prior Memory
            </span>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4 flex-1">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-400 font-semibold block uppercase text-[10px] tracking-wider mb-1">
                Defect Context
              </span>
              <p className="text-slate-800 leading-snug">
                Multiple components have visible scratches after the finishing and packaging process on line 4.
              </p>
            </div>

            {beforeData ? (
              <div className="space-y-4 text-xs">
                {/* Memory Status */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900 block">Hindsight Recall Result:</span>
                    <p className="text-amber-800 text-[11px]">
                      Zero relevant historical experiences available in Hindsight memory bank. The agent acknowledges zero prior experience and initiates broad exploratory investigation.
                    </p>
                  </div>
                </div>

                {/* Hypotheses */}
                <div>
                  <span className="text-slate-500 font-bold block uppercase text-[10px] tracking-wider mb-1.5">
                    Working Hypotheses (Unverified)
                  </span>
                  <div className="space-y-1.5">
                    {beforeData.investigation.possible_root_causes.map((c: string, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200 text-slate-700 text-xs">
                        {c}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <span className="text-slate-500 font-bold block uppercase text-[10px] tracking-wider mb-1.5">
                    Initial Corrective Suggestions
                  </span>
                  <div className="space-y-2">
                    {beforeData.investigation.recommendations.map((rec: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{rec.priority} Priority</span>
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Generic Baseline</span>
                        </div>
                        <p className="font-semibold text-slate-900">{rec.action}</p>
                        <p className="text-[11px] text-slate-500 mt-1">{rec.expected_impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Click "1. Initial Incident" above to run the investigation without prior memory.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: AFTER LEARNING */}
        <div className="bg-white rounded-xl border-2 border-indigo-300 shadow-sm overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 bg-indigo-50/80 border-b border-indigo-200 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-950 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Scenario 3: After Learning
                </span>
                <span className="font-mono text-xs font-bold text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
                  QL-009 (BATCH-009)
                </span>
              </div>
              <p className="text-[11px] text-indigo-800 mt-0.5">Aluminium Housing Pro · Recurring Surface Scratches</p>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded border border-indigo-300">
              Hindsight Experience Applied
            </span>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4 flex-1">
            <div className="p-3 bg-indigo-50/40 rounded-lg border border-indigo-100 text-xs">
              <span className="text-indigo-900 font-semibold block uppercase text-[10px] tracking-wider mb-1">
                New Incident Context
              </span>
              <p className="text-indigo-950 leading-snug">
                Similar scratches have appeared on components from a new production batch after packaging on line 4.
              </p>
            </div>

            {afterData ? (
              <div className="space-y-4 text-xs">
                {/* Retrieved Memory Alert */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-indigo-50 border border-emerald-300 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Recalled from Hindsight Memory Bank
                    </span>
                    <span className="font-mono text-[10px] font-bold text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
                      Ref: QL-001 Verified Experience
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-800 bg-white/80 p-2.5 rounded-lg border border-emerald-200/60 space-y-1">
                    <p><strong className="text-slate-900">Verified Root Cause:</strong> Improper handling during packaging without separators.</p>
                    <p><strong className="text-slate-900">Proven Corrective Action:</strong> Introduce protective corrugated foam separators between components.</p>
                    <p><strong className="text-emerald-700 font-semibold">Outcome:</strong> Successful (zero defects confirmed in 200 unit validation trial).</p>
                  </div>
                </div>

                {/* Informed Hypotheses */}
                <div>
                  <span className="text-slate-700 font-bold block uppercase text-[10px] tracking-wider mb-1.5">
                    Memory-Informed Root Cause Hypotheses
                  </span>
                  <div className="space-y-1.5">
                    {afterData.investigation.possible_root_causes.map((c: string, idx: number) => (
                      <div
                        key={idx}
                        className={`p-2 rounded border text-xs ${
                          c.includes('[Grounded') || c.includes('Prior Memory')
                            ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950 font-medium'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Improved Recommendations */}
                <div>
                  <span className="text-slate-700 font-bold block uppercase text-[10px] tracking-wider mb-1.5">
                    Targeted Action Plan (Grounded in History)
                  </span>
                  <div className="space-y-2">
                    {afterData.investigation.recommendations.map((rec: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border shadow-2xs ${
                          rec.grounded_in_memory
                            ? 'bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border-indigo-300'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-indigo-700 uppercase">{rec.priority} Priority</span>
                          {rec.grounded_in_memory && (
                            <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded shadow-2xs flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Informed by QL-001 Experience
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-slate-900">{rec.action}</p>
                        <p className="text-[11px] text-slate-600 mt-1">{rec.expected_impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                {demoStep < 2
                  ? 'Complete Step 1 and Step 2 above to unlock the memory-informed investigation.'
                  : 'Click "3. New Similar Defect" above to run the investigation powered by Hindsight!'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix (PRD Part 10: Show the difference) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Demonstration Outcome Comparison (Before vs After Learning)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Evaluation Dimension</th>
                <th className="py-2.5 px-3">Before Learning (Traditional Agent)</th>
                <th className="py-2.5 px-3">After Learning (QualityLoop + Hindsight)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Historical Memory</td>
                <td className="py-2.5 px-3 text-slate-600">Zero context retained; stateless execution</td>
                <td className="py-2.5 px-3 font-semibold text-indigo-700">Recalls verified QL-001 cause & outcome via Hindsight</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Investigation Scope</td>
                <td className="py-2.5 px-3 text-slate-600">Generic exploratory sweep across all lines</td>
                <td className="py-2.5 px-3 font-semibold text-indigo-700">Targeted inspection of packaging separators and handling SOP</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Corrective Plan</td>
                <td className="py-2.5 px-3 text-slate-600">Uninformed trial-and-error suggestions</td>
                <td className="py-2.5 px-3 font-semibold text-indigo-700">Applies previously verified solution with high confidence</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Uncertainty Handling</td>
                <td className="py-2.5 px-3 text-slate-600">Assumes equal probability across tooling & debris</td>
                <td className="py-2.5 px-3 font-semibold text-indigo-700">Still checks boundary conditions to rule out new variables</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Hindsight Reflection Feature (FR-03 C & Part 4.5) */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">Synthesize Higher-Level Insights with Hindsight Reflect</h2>
              <p className="text-xs text-indigo-200">
                Consolidate multiple defect investigations across memory into permanent operational lessons
              </p>
            </div>
          </div>
          <button
            onClick={handleReflect}
            disabled={reflecting}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {reflecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {reflecting ? 'Reflecting across memory...' : 'Run Hindsight Reflect'}
          </button>
        </div>

        {reflectionText ? (
          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-lg border border-white/15 text-xs text-indigo-50 leading-relaxed space-y-2">
            <span className="font-bold text-white text-xs block flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Synthesized Operational Insight:
            </span>
            <p>{reflectionText}</p>
          </div>
        ) : (
          <p className="text-xs text-indigo-300/80 italic">
            Click "Run Hindsight Reflect" to trigger the Hindsight reflection engine and produce strategic quality insights across all retained incidents.
          </p>
        )}
      </div>

      {/* Memory Activity Timeline (FR-05) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Live Hindsight Memory Activity Stream</h2>
              <p className="text-xs text-slate-500">Real-time audit of retain, recall, reflect operations</p>
            </div>
          </div>
          <button
            onClick={loadMemoryEvents}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <LearningTimeline events={memoryEvents} />
      </div>
    </div>
  );
};
