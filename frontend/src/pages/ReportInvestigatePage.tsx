import React, { useState } from 'react';
import { api } from '../services/api';
import {
  UploadCloud,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileText,
  ShieldCheck
} from 'lucide-react';

interface Props {
  onIncidentCreated: (incidentId: string) => void;
  onCancel: () => void;
}

export const ReportInvestigatePage: React.FC<Props> = ({ onIncidentCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    product_name: '',
    product_id: '',
    batch_number: '',
    defect_category: 'Surface defect',
    severity: 'Medium',
    description: '',
    production_stage: 'Finishing & Packaging',
    machine: '',
    supplier: '',
    quantity_affected: 1,
    image_url: ''
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    'Saving incident record to manufacturing database...',
    'Querying Hindsight memory bank for relevant historical experiences...',
    'Synthesizing defect context and evaluating potential root causes...',
    'Generating grounded corrective action recommendations...'
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData({ ...formData, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.product_name || !formData.batch_number || !formData.description) {
      setError('Please fill in all required fields (Title, Product Name, Batch, and Description).');
      return;
    }

    setError(null);
    setSubmitting(true);
    setCurrentStep(0);

    try {
      // Step 1: Create incident in DB
      const created = await api.createIncident({
        title: formData.title,
        product_name: formData.product_name,
        product_id: formData.product_id || `SKU-${formData.product_name.slice(0, 3).toUpperCase()}-01`,
        batch_number: formData.batch_number,
        defect_category: formData.defect_category,
        severity: formData.severity as any,
        description: formData.description,
        production_stage: formData.production_stage,
        machine: formData.machine || undefined,
        supplier: formData.supplier || undefined,
        quantity_affected: Number(formData.quantity_affected) || 1,
        image_url: formData.image_url || undefined
      });

      // Animate investigation steps for high visual fidelity
      setCurrentStep(1);
      await new Promise(r => setTimeout(r, 600));

      setCurrentStep(2);
      // Step 2: Trigger backend agent investigation (which does Hindsight recall)
      await api.runInvestigation(created.id, true);

      setCurrentStep(3);
      await new Promise(r => setTimeout(r, 500));

      // Done -> navigate to details
      onIncidentCreated(created.id);
    } catch (err: any) {
      setError(err.message || 'Failed to submit incident');
      setSubmitting(false);
    }
  };

  const handleLoadSampleScenario = (scenario: 'scratches' | 'tolerance' | 'cracking') => {
    if (scenario === 'scratches') {
      setFormData({
        title: 'Surface scratches on newly received aluminium housings',
        product_name: 'Aluminium Housing Pro',
        product_id: 'PRD-AL-100',
        batch_number: 'BATCH-009',
        defect_category: 'Surface defect',
        severity: 'Medium',
        description: 'Multiple components have visible scratches on outer anodized casing after finishing and packaging process on line 4.',
        production_stage: 'Finishing & Packaging',
        machine: 'Packaging Station 3',
        supplier: 'Apex Metallurgy Ltd',
        quantity_affected: 35,
        image_url: ''
      });
    } else if (scenario === 'tolerance') {
      setFormData({
        title: 'Bore diameter dimensional drift +0.06mm',
        product_name: 'Precision Shaft B2',
        product_id: 'PRD-SF-204',
        batch_number: 'BATCH-014',
        defect_category: 'Dimensional defect',
        severity: 'High',
        description: 'Internal bore measures 25.06mm against tolerance limit of 25.02mm after rough and finish turning.',
        production_stage: 'CNC Machining',
        machine: 'CNC Lathe #2',
        supplier: 'In-house Machining Cell',
        quantity_affected: 20,
        image_url: ''
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">Report Manufacturing Defect</h1>
          <p className="text-xs text-[#687386] mt-1">
            Submit a defect incident to trigger the QualityLoop investigation agent and persistent memory recall.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500">Quick Fill:</span>
          <button
            type="button"
            onClick={() => handleLoadSampleScenario('scratches')}
            className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
          >
            Aluminium Housing (Demo)
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E5E9F0] shadow-xs p-4 sm:p-6 space-y-6">
        {/* Section 1: Product Information */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            1. Product & Production Context
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-800 block mb-1">
                Incident Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Surface scratches on casing perimeter"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-[#F7F8FA] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aluminium Housing Pro"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-[#F7F8FA] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Product ID / SKU
              </label>
              <input
                type="text"
                placeholder="e.g. PRD-AL-100"
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-[#F7F8FA] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Production Batch Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BATCH-009"
                value={formData.batch_number}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-[#F7F8FA] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Machine / Equipment (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Packaging Station 3"
                value={formData.machine}
                onChange={(e) => setFormData({ ...formData, machine: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-[#F7F8FA] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-800 block mb-1">
                Supplier (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Metallurgy Ltd"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-[#F7F8FA] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Defect Classification */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            2. Defect Classification & Severity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Defect Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.defect_category}
                onChange={(e) => setFormData({ ...formData, defect_category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-[#F7F8FA] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 font-medium"
              >
                <option value="Surface defect">Surface defect</option>
                <option value="Dimensional defect">Dimensional defect</option>
                <option value="Packaging defect">Packaging defect</option>
                <option value="Material defect">Material defect</option>
                <option value="Assembly defect">Assembly defect</option>
                <option value="Functional defect">Functional defect</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Severity Level <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-[#F7F8FA] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 font-medium"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Quantity Affected <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity_affected}
                onChange={(e) => setFormData({ ...formData, quantity_affected: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-[#F7F8FA] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 font-mono"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="font-semibold text-slate-800 block mb-1">
                Production Stage <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.production_stage}
                onChange={(e) => setFormData({ ...formData, production_stage: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-[#F7F8FA] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 font-medium"
              >
                <option value="Raw Material Inspection">Raw Material Inspection</option>
                <option value="CNC Machining">CNC Machining</option>
                <option value="Injection Moulding">Injection Moulding</option>
                <option value="Surface Coating">Surface Coating</option>
                <option value="Finishing & Packaging">Finishing & Packaging</option>
                <option value="Final Assembly">Final Assembly</option>
                <option value="Final Quality Audit">Final Quality Audit</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="font-semibold text-slate-800 block mb-1">
                Defect Description & Physical Findings <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe the physical observation, location of defect, and conditions under which it was observed..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-[#F7F8FA] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 leading-relaxed"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Section 3: Visual Evidence */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            3. Visual Evidence (Optional)
          </h2>
          {imagePreview ? (
            <div className="relative inline-block border border-slate-300 rounded-lg overflow-hidden group">
              <img src={imagePreview} alt="Defect preview" className="w-48 h-32 object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setFormData({ ...formData, image_url: '' });
                }}
                className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50">
              <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-slate-700">Click or drag defect photograph here</span>
              <span className="text-[10px] text-slate-400 mt-1">PNG, JPG or WEBP up to 5MB</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Multi-stage submission progress */}
        {submitting && (
          <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <span className="text-xs font-bold text-indigo-950">AI Quality Agent Investigation in Progress</span>
            </div>
            <div className="space-y-1.5 text-xs text-indigo-900">
              {steps.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {idx < currentStep ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : idx === currentStep ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin shrink-0"></div>
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"></div>
                  )}
                  <span className={idx === currentStep ? 'font-semibold text-indigo-950' : 'text-slate-600'}>
                    {s}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            Submit for AI Investigation
          </button>
        </div>
      </form>
    </div>
  );
};
