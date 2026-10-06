import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Language, UploadedFileItem, DuplicateGroup } from '../types/tender';
import { translations } from '../i18n/translations';
import { computeFileHash, inspectPdfFile, generateTestPdf, isPdfFile } from '../utils/pdf';

interface PdfUploaderProps {
  language: Language;
  files: UploadedFileItem[];
  duplicateGroups: Map<string, DuplicateGroup>;
  onFilesAdded: (newFiles: UploadedFileItem[]) => void;
  onFileRemoved: (fileId: string) => void;
}

const MAX_FILES = 30;
const MAX_TOTAL_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export const PdfUploader: React.FC<PdfUploaderProps> = ({
  language,
  files,
  duplicateGroups,
  onFilesAdded,
  onFileRemoved,
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);

  const totalSizeBytes = files.reduce((acc, f) => acc + f.size, 0);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const processIncomingFiles = async (selectedFiles: File[]) => {
    setUploadError(null);
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);

    try {
      const validFiles: File[] = [];
      const rejectedNonPdfs: string[] = [];
      const skippedDueToLimit: string[] = [];

      let runningCount = files.length;
      let runningSize = totalSizeBytes;

      for (const file of selectedFiles) {
        // Check actual PDF type and magic bytes
        const isPdf = await isPdfFile(file);
        if (!isPdf) {
          rejectedNonPdfs.push(file.name);
          continue;
        }

        // Check file count limit
        if (runningCount >= MAX_FILES) {
          skippedDueToLimit.push(`${file.name} (exceeded 30 files limit)`);
          continue;
        }

        // Check size limit
        if (runningSize + file.size > MAX_TOTAL_SIZE_BYTES) {
          skippedDueToLimit.push(`${file.name} (would exceed 50 MB total limit)`);
          continue;
        }

        validFiles.push(file);
        runningCount++;
        runningSize += file.size;
      }

      // Construct user-friendly feedback if any files were rejected or skipped
      const notices: string[] = [];
      if (rejectedNonPdfs.length > 0) {
        notices.push(
          `${t.nonPdfRejected}: [${rejectedNonPdfs.join(', ')}]`
        );
      }
      if (skippedDueToLimit.length > 0) {
        notices.push(
          `Some files could not be added due to limits: [${skippedDueToLimit.join(', ')}]`
        );
      }
      if (notices.length > 0) {
        setUploadError(notices.join(' • '));
      }

      // Process valid PDFs
      const processedItems: UploadedFileItem[] = [];
      for (const file of validFiles) {
        const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        // Calculate cryptographic hash
        const sha256 = await computeFileHash(file);

        // Inspect PDF & count pages safely
        const { pageCount, error } = await inspectPdfFile(file);

        processedItems.push({
          id: fileId,
          file,
          name: file.name,
          size: file.size,
          sha256,
          pageCount: error ? null : pageCount,
          status: error ? 'error' : 'ready',
          error,
          uploadedAt: Date.now(),
        });
      }

      if (processedItems.length > 0) {
        onFilesAdded(processedItems);
      }
    } catch (err: unknown) {
      setUploadError('Unexpected error inspecting PDF documents');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      processIncomingFiles(Array.from(fileList));
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const fileList = e.dataTransfer.files;
    if (fileList && fileList.length > 0) {
      processIncomingFiles(Array.from(fileList));
    }
  };

  const copyHashToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleGenerateSampleFiles = async () => {
    setIsGeneratingDemo(true);
    try {
      const dummy1 = await generateTestPdf('Trade_License_2026', 2);
      const dummy2 = await generateTestPdf('TIN_Return_Certificate', 1);
      const dummy3 = await generateTestPdf('VAT_BIN_Registration', 1);
      const dummy4 = await generateTestPdf('Bank_Guarantee_Security', 3);
      await processIncomingFiles([dummy1, dummy2, dummy3, dummy4]);
    } finally {
      setIsGeneratingDemo(false);
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.uploadSectionTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {files.length} / {MAX_FILES} {language === 'en' ? 'files' : 'ফাইল'} • {formatFileSize(totalSizeBytes)} / 50 MB
            </p>
          </div>
        </div>

        {/* Dual Resource Meters (File Count & Total Size) */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-28 sm:w-36 space-y-1">
            <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              <span>{t.fileCountMeter}</span>
              <span>{files.length}/{MAX_FILES}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  files.length >= MAX_FILES ? 'bg-rose-500' : files.length > 20 ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(100, (files.length / MAX_FILES) * 100)}%` }}
              />
            </div>
          </div>

          <div className="w-28 sm:w-36 space-y-1">
            <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              <span>{t.fileSizeMeter}</span>
              <span>{formatFileSize(totalSizeBytes)}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  totalSizeBytes >= MAX_TOTAL_SIZE_BYTES ? 'bg-rose-500' : totalSizeBytes > 40 * 1024 * 1024 ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, (totalSizeBytes / MAX_TOTAL_SIZE_BYTES) * 100)}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateSampleFiles}
            disabled={isGeneratingDemo || isProcessing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors disabled:opacity-50"
            title="Generate test PDF documents in browser for quick testing"
          >
            {isGeneratingDemo ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{language === 'en' ? 'Create Demo PDFs' : 'নমুনা পিডিএফ তৈরি'}</span>
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {uploadError && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start gap-2.5 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Upload Rejected:</span>
              <span>{uploadError}</span>
            </div>
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40'
              : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/40 dark:bg-slate-900/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <h4 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
            {isProcessing ? t.parsingPdf : t.uploadDropzoneTitle}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            {t.uploadDropzoneSubtitle}
          </p>
          <span className="inline-block text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {t.uploadLimits}
          </span>
        </div>

        {/* Uploaded Files Listing */}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.uploadedFilesTitle} ({files.length})
              </h4>
              {duplicateGroups.size > 0 && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>
                    {duplicateGroups.size} {language === 'en' ? 'Duplicate Group(s) Detected' : 'ডুপ্লিকেট গ্রুপ শনাক্ত'}
                  </span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {files.map((file) => {
                const isDuplicate = duplicateGroups.has(file.sha256);
                const duplicateCount = isDuplicate ? duplicateGroups.get(file.sha256)!.files.length : 1;

                return (
                  <div
                    key={file.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      file.status === 'error'
                        ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/80'
                        : isDuplicate
                        ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                        : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 overflow-hidden">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            file.status === 'error'
                              ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-400'
                              : isDuplicate
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-400'
                              : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400'
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <p
                            className="font-medium text-xs sm:text-sm text-slate-900 dark:text-white truncate"
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            {file.pageCount !== null ? (
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {file.pageCount} {t.pages}
                              </span>
                            ) : file.status === 'error' ? (
                              <span className="text-rose-600 dark:text-rose-400 font-medium">
                                {file.error || t.pdfParseError}
                              </span>
                            ) : (
                              <span>{t.parsingPdf}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onFileRemoved(file.id)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={t.removeFile}
                        aria-label={t.removeFile}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* SHA-256 and duplicate tag */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5 font-mono text-slate-400 dark:text-slate-500 truncate">
                        <span className="font-bold text-[9px] uppercase tracking-wider">SHA:</span>
                        <span className="truncate max-w-[130px] sm:max-w-[180px]">
                          {file.sha256}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyHashToClipboard(file.sha256)}
                          className="hover:text-slate-700 dark:hover:text-slate-300 p-0.5"
                          title="Copy full SHA-256 hash"
                        >
                          {copiedHash === file.sha256 ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      {isDuplicate && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200"
                          title={t.duplicateWarning}
                        >
                          {t.duplicateGroupTag} ({duplicateCount}x)
                        </span>
                      )}
                    </div>

                    {/* Duplicate Detailed Explanation Callout */}
                    {isDuplicate && (
                      <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 space-y-0.5">
                        <div className="flex items-center gap-1 font-bold text-amber-800 dark:text-amber-300">
                          <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>
                            {language === 'en' ? 'Duplicate Content Alert' : 'ডুপ্লিকেট কন্টেন্ট সতর্কতা'}
                          </span>
                        </div>
                        <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-tight">
                          {t.duplicateExplanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
