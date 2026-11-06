import React, { useState, useEffect } from 'react';
import { X, Database, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Sparkles, Cpu, Lock, Server } from 'lucide-react';
import { api } from '../services/api';
import { SettingsConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, onSettingsSaved }) => {
  const [settings, setSettings] = useState<SettingsConfig | null>(null);
  const [geminiModel, setGeminiModel] = useState('gemini-3.5-flash-lite');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
      if (data.gemini_model) setGeminiModel(data.gemini_model);
    } catch {
      setStatusMsg({ text: 'Failed to retrieve system status', type: 'error' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await api.updateSettings({ gemini_model: geminiModel });
      setSettings(res);
      setStatusMsg({ text: 'Model parameters updated successfully.', type: 'success' });
      if (onSettingsSaved) onSettingsSaved();
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Error updating settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide">System Architecture & Engine Status</h2>
              <p className="text-[11px] text-slate-400">Hindsight Persistent Memory & Google Gemini Intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1">
          {statusMsg && (
            <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Hindsight Status Card */}
          <div className="bg-gradient-to-r from-indigo-50/90 to-purple-50/70 border border-indigo-200/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Hindsight Memory Engine
              </span>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 font-bold text-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100">
                <span className="text-slate-500 block text-[10px] font-semibold uppercase tracking-wider">Active Memory Bank</span>
                <span className="font-mono font-bold text-slate-800">{settings?.hindsight_bank_id || 'qualityloop'}</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100">
                <span className="text-slate-500 block text-[10px] font-semibold uppercase tracking-wider">Credential Security</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" /> Encrypted Vault
                </span>
              </div>
            </div>

            <p className="text-[11px] text-indigo-900/80 leading-relaxed">
              Retains verified root causes and corrective action outcomes. Operates on a strict verification-only retention policy to prevent hypothetical hallucination cascades.
            </p>
          </div>

          {/* Gemini AI Reasoning Engine Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-600" />
                AI Investigation Agent (Google Gemini)
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-100 font-bold text-indigo-800">
                Active
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Reasoning Model Architecture
              </label>
              <select
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs text-slate-900 bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-600 shadow-2xs"
              >
                <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Fast Throughput & Structured Schema)</option>
                <option value="gemini-3.8-flash">gemini-3.8-flash (Balanced Multimodal Analysis)</option>
                <option value="gemini-4-argon">gemini-4-argon (Maximum Complex Engineering Reasoning)</option>
              </select>
              <span className="text-[10px] text-slate-500 block">
                The agent utilizes structured schema generation to distinguish verified historical facts from new manufacturing hypotheses.
              </span>
            </div>
          </div>

          {/* Infrastructure Security Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2 bg-slate-200 text-slate-700 rounded-lg shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-1">
              <span className="font-bold text-slate-900 block">Secure Zero-Exposure Architecture</span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                All cloud service integrations and authorization credentials are isolated server-side inside Vercel environment variables. No client-side endpoints or web inspectors have visibility into backend authentication secrets.
              </p>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              {saving ? 'Applying...' : 'Apply Model Selection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
