import React, { useState, useEffect } from 'react';
import { X, Database, Key, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { SettingsConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, onSettingsSaved }) => {
  const [settings, setSettings] = useState<SettingsConfig | null>(null);
  const [hindsightApiKey, setHindsightApiKey] = useState('');
  const [hindsightBaseUrl, setHindsightBaseUrl] = useState('https://api.hindsight.vectorize.io');
  const [hindsightBankId, setHindsightBankId] = useState('qualityloop');
  const [anthropicApiKey, setAnthropicApiKey] = useState('');
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
      if (data.hindsight_base_url) setHindsightBaseUrl(data.hindsight_base_url);
      if (data.hindsight_bank_id) setHindsightBankId(data.hindsight_bank_id);
    } catch (err: any) {
      setStatusMsg({ text: 'Failed to load settings', type: 'error' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      const updatePayload: any = {
        hindsight_base_url: hindsightBaseUrl,
        hindsight_bank_id: hindsightBankId
      };
      if (hindsightApiKey.trim()) {
        updatePayload.hindsight_api_key = hindsightApiKey.trim();
      }
      if (anthropicApiKey.trim()) {
        updatePayload.anthropic_api_key = anthropicApiKey.trim();
      }

      const res = await api.updateSettings(updatePayload);
      setSettings(res);
      setStatusMsg({ text: 'Settings updated successfully. Hindsight memory bank re-checked.', type: 'success' });
      setHindsightApiKey('');
      setAnthropicApiKey('');
      if (onSettingsSaved) onSettingsSaved();
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Error updating settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide">Memory Engine & System Settings</h2>
              <p className="text-[11px] text-slate-400">Configure Hindsight Cloud / Local Server and LLM Keys</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md">
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

          {/* Hindsight Status Banner */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Hindsight Memory Bank Status
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-100 font-bold text-indigo-900">
                Bank: {settings?.hindsight_bank_id || 'qualityloop'}
              </span>
            </div>
            <p className="text-xs text-indigo-900 leading-relaxed">
              Active Endpoint: <span className="font-mono font-semibold">{settings?.hindsight_base_url || 'https://api.hindsight.vectorize.io'}</span>
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-slate-500">API Key:</span>
              <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                {settings?.hindsight_api_key_masked || 'Not Configured'}
              </span>
              <span className="text-slate-500 ml-2">Status:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                settings?.status === 'connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {settings?.status || 'Active'}
              </span>
            </div>
            {settings?.last_error && (
              <p className="mt-2 text-[11px] text-rose-700 bg-rose-50 p-2 rounded border border-rose-200">
                Last error: {settings.last_error}
              </p>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Hindsight Base URL
              </label>
              <input
                type="text"
                value={hindsightBaseUrl}
                onChange={(e) => setHindsightBaseUrl(e.target.value)}
                placeholder="https://api.hindsight.vectorize.io or http://localhost:8888"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Use official Hindsight Cloud URL or your local container on port 8888.
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Hindsight API Key
              </label>
              <input
                type="password"
                value={hindsightApiKey}
                onChange={(e) => setHindsightApiKey(e.target.value)}
                placeholder="Enter new Hindsight API key (leave blank to keep existing)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Memory Bank Identifier
              </label>
              <input
                type="text"
                value={hindsightBankId}
                onChange={(e) => setHindsightBankId(e.target.value)}
                placeholder="qualityloop"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div className="pt-3 border-t border-slate-200">
              <label className="font-bold text-slate-800 block mb-1">
                Anthropic Claude API Key (Optional)
              </label>
              <input
                type="password"
                value={anthropicApiKey}
                onChange={(e) => setAnthropicApiKey(e.target.value)}
                placeholder="sk-ant-... (already detected in system env if configured)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                QualityLoop will use Claude 3.5 Sonnet for reasoning. If key is omitted, the built-in domain reasoning engine executes with zero downtime.
              </span>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              {saving ? 'Testing & Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
