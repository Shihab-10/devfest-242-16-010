import React, { useState } from 'react';
import {
  PackageCheck,
  AlertOctagon,
  FileDown,
  CheckCircle,
  Info,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Language, EvaluatedRequirement, TenderMetadata } from '../types/tender';
import { translations } from '../i18n/translations';
import {
  generateTenderPackage,
  triggerPackageDownload,
  PackageGenerationProgress,
} from '../utils/pdfPackageGenerator';

interface PackageSummaryProps {
  language: Language;
  tender: TenderMetadata | null;
  evaluatedList: EvaluatedRequirement[];
  blockingIssues: string[];
  isPackageReady: boolean;
  duplicateCount: number;
}

export const PackageSummary: React.FC<PackageSummaryProps> = ({
  language,
  tender,
  evaluatedList,
  blockingIssues,
  isPackageReady,
  duplicateCount,
}) => {
  const t = translations[language];

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<PackageGenerationProgress | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<{
    blob: Blob;
    filename: string;
    totalPages: number;
    sizeBytes: number;
  } | null>(null);

  const totalPages = evaluatedList.reduce((acc, curr) => {
    return acc + (curr.matchedFile?.pageCount || 0);
  }, 0) + 1; // +1 for Cover Page

  const compliantCount = evaluatedList.filter((e) => e.status === 'OK').length;
  const optionalOmittedCount = evaluatedList.filter((e) => e.status === 'Not provided').length;

  const handleGenerate = async () => {
    if (!isPackageReady || !tender || isGenerating) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const result = await generateTenderPackage(tender, evaluatedList, (prog) => {
        setProgress(prog);
      });

      setGeneratedResult({
        blob: result.blob,
        filename: result.filename,
        totalPages: result.totalPages,
        sizeBytes: result.blob.size,
      });

      // Auto trigger download
      triggerPackageDownload(result.blob, result.filename);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.compilationError;
      setGenerationError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadAgain = () => {
    if (!generatedResult) return;
    triggerPackageDownload(generatedResult.blob, generatedResult.filename);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
            4
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.summaryTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isPackageReady
                ? `${compliantCount} ${language === 'en' ? 'compliant documents verified' : 'নথি যাচাইকৃত ও প্রস্তুত'}`
                : `${blockingIssues.length} ${language === 'en' ? 'blocking issues preventing package compilation' : 'টি সমস্যা প্যাকেজ তৈরিতে বাধা দিচ্ছে'}`}
            </p>
          </div>
        </div>

        {/* 4 Key Metrics */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="px-2.5 py-1 rounded-full font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {compliantCount} {t.readyDocuments}
          </span>
          {blockingIssues.length > 0 && (
            <span className="px-2.5 py-1 rounded-full font-semibold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse">
              {blockingIssues.length} {t.blockingIssues}
            </span>
          )}
          {optionalOmittedCount > 0 && (
            <span className="px-2.5 py-1 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {optionalOmittedCount} {t.optionalOmitted}
            </span>
          )}
          {duplicateCount > 0 && (
            <span className="px-2.5 py-1 rounded-full font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              {duplicateCount} {t.duplicateFiles}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Generation Error Alert */}
        {generationError && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start gap-2.5 text-xs sm:text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">{t.compilationError}:</span>
              <span>{generationError}</span>
            </div>
          </div>
        )}

        {/* State Banner: Blocked vs Ready */}
        {isPackageReady ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                {t.packageReadyTitle}
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                {t.packageReadyDesc}
              </p>
              <div className="pt-1 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                  {compliantCount} {t.readyDocuments}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300">
                  {totalPages} {language === 'en' ? 'Total Package Pages (incl. Cover)' : 'সর্বমোট পৃষ্ঠা (কভার পেজসহ)'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div>
                <h4 className="font-bold text-sm text-rose-950 dark:text-rose-100">
                  {t.packageBlockedTitle} ({blockingIssues.length})
                </h4>
                <p className="text-xs text-rose-800 dark:text-rose-300">
                  {t.packageBlockedDesc}
                </p>
              </div>

              {/* Blocking issues list */}
              <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-rose-200 dark:border-rose-900/60 space-y-1.5 max-h-48 overflow-y-auto">
                {blockingIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-rose-700 dark:text-rose-300 flex items-start gap-1.5 font-medium"
                  >
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar (while generating) */}
        {isGenerating && progress && (
          <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-200">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span>{progress.message}</span>
              </span>
              <span>{progress.percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Success Download Card (after generation) */}
        {generatedResult && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{generatedResult.filename}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                    Compiled
                  </span>
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {generatedResult.totalPages} {t.pages} • {formatSize(generatedResult.sizeBytes)} • Ready in browser memory
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadAgain}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{t.downloadAgainBtn}</span>
            </button>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              {language === 'en'
                ? 'Output filename:'
                : 'তৈরিকৃত প্যাকেজের নাম:'}{' '}
              <code className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                {tender?.tender_id ? `${tender.tender_id}_Package.pdf` : '<tender_id>_Package.pdf'}
              </code>
            </span>
          </div>

          <button
            type="button"
            disabled={!isPackageReady || isGenerating}
            onClick={handleGenerate}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
              isPackageReady && !isGenerating
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none border border-slate-300 dark:border-slate-700'
            }`}
            title={
              isPackageReady
                ? 'Generate and download tender package'
                : `Blocked by ${blockingIssues.length} unresolved issue(s)`
            }
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>
              {isGenerating ? t.compilingPackage : t.generatePackageBtn}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
