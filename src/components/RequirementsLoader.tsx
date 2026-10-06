import React, { useRef, useState } from 'react';
import {
  FileText,
  Upload,
  Calendar,
  Building2,
  Briefcase,
  Hash,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Language, RequirementsFile } from '../types/tender';
import { translations } from '../i18n/translations';
import { sampleTender } from '../data/sampleTender';

interface RequirementsLoaderProps {
  language: Language;
  requirementsData: RequirementsFile | null;
  onRequirementsLoaded: (data: RequirementsFile) => void;
  onResetRequirements: () => void;
}

export const RequirementsLoader: React.FC<RequirementsLoaderProps> = ({
  language,
  requirementsData,
  onRequirementsLoaded,
  onResetRequirements,
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndLoadJson = (text: string) => {
    setErrorMessage(null);
    try {
      const parsed = JSON.parse(text);

      // Validate schema
      if (!parsed || typeof parsed !== 'object') {
        throw new Error(t.invalidJsonError);
      }

      if (!parsed.tender || typeof parsed.tender !== 'object') {
        throw new Error(t.schemaError + " (missing 'tender' object)");
      }

      const { tender, requirements } = parsed;
      if (!tender.tender_id || !tender.title || !tender.submission_deadline) {
        throw new Error("Tender must have 'tender_id', 'title', and 'submission_deadline'");
      }

      if (!Array.isArray(requirements) || requirements.length === 0) {
        throw new Error("Requirements list must be a non-empty array");
      }

      // Check items and normalize
      const normalizedRequirements = requirements.map((req: any, index: number) => {
        if (!req || typeof req !== 'object') {
          throw new Error(`Invalid requirement at index ${index}`);
        }
        if (!req.id) {
          throw new Error(`Requirement item #${index + 1} is missing an 'id'`);
        }
        const numOrder = Number(req.order);
        if (isNaN(numOrder)) {
          throw new Error(`Requirement item #${req.id} has an invalid non-numeric 'order'`);
        }
        if (!req.title_en) {
          throw new Error(`Requirement item #${req.id} is missing 'title_en'`);
        }

        return {
          id: String(req.id),
          order: numOrder,
          title_en: String(req.title_en),
          title_bn: String(req.title_bn || req.title_en),
          mandatory: Boolean(req.mandatory),
          has_expiry: Boolean(req.has_expiry),
        };
      });

      // Sort requirements numerically by order
      normalizedRequirements.sort((a: any, b: any) => a.order - b.order);

      onRequirementsLoaded({
        tender: {
          tender_id: String(tender.tender_id),
          title: String(tender.title),
          procuring_entity: String(tender.procuring_entity || ''),
          bidder: String(tender.bidder || ''),
          submission_deadline: String(tender.submission_deadline),
        },
        requirements: normalizedRequirements,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.invalidJsonError;
      setErrorMessage(msg);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      validateAndLoadJson(content);
    };
    reader.onerror = () => {
      setErrorMessage(t.invalidJsonError);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setErrorMessage('Please provide a valid .json file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      validateAndLoadJson(content);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setErrorMessage(null);
    onRequirementsLoaded(sampleTender);
  };

  const mandatoryCount = requirementsData?.requirements.filter((r) => r.mandatory).length || 0;
  const optionalCount = requirementsData?.requirements.filter((r) => !r.mandatory).length || 0;

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.requirementsSectionTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {requirementsData
                ? `Tender #${requirementsData.tender.tender_id} loaded`
                : t.noRequirementsLoaded}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {requirementsData ? (
            <button
              type="button"
              onClick={onResetRequirements}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.replaceRequirementsBtn}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{t.loadSampleBtn}</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 flex items-start gap-2.5 text-xs sm:text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Error Loading Requirements:</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {!requirementsData ? (
          /* Empty / Upload View */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/30 dark:bg-slate-900/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {t.dropJsonHere}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-md mx-auto">
              {t.jsonFormatHint}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm shadow-sm transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>{t.loadRequirementsBtn}</span>
              </button>
              <button
                type="button"
                onClick={handleLoadSample}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-medium text-xs sm:text-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{t.loadSampleBtn}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Loaded Tender Details Display */
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
                  <Hash className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{t.tenderId}</span>
                </div>
                <div className="font-mono font-bold text-sm text-slate-900 dark:text-white truncate">
                  {requirementsData.tender.tender_id}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{t.procuringEntity}</span>
                </div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white truncate" title={requirementsData.tender.procuring_entity}>
                  {requirementsData.tender.procuring_entity}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{t.bidder}</span>
                </div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white truncate" title={requirementsData.tender.bidder}>
                  {requirementsData.tender.bidder}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs mb-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t.submissionDeadline}</span>
                </div>
                <div className="font-mono font-bold text-sm text-amber-900 dark:text-amber-200">
                  {requirementsData.tender.submission_deadline}
                </div>
              </div>
            </div>

            {/* Title & Count Badges */}
            <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/60 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium block">
                  {t.tenderTitle}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {requirementsData.tender.title}
                </h4>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  {t.totalRequirements}: {requirementsData.requirements.length}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  {t.mandatoryCount}: {mandatoryCount}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {t.optionalCount}: {optionalCount}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Valid Schema</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
