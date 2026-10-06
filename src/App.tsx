import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { WorkflowSteps } from './components/WorkflowSteps';
import { RequirementsLoader } from './components/RequirementsLoader';
import { PdfUploader } from './components/PdfUploader';
import { MatchingChecklist } from './components/MatchingChecklist';
import { PackageSummary } from './components/PackageSummary';
import { Footer } from './components/Footer';
import {
  Language,
  Theme,
  RequirementsFile,
  UploadedFileItem,
} from './types/tender';
import {
  calculateDuplicateGroups,
  evaluateAllRequirements,
} from './utils/statusEvaluator';

export const App: React.FC = () => {
  // Theme state with localStorage persistence
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('tender_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Language state with localStorage persistence
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('tender_language');
    return saved === 'bn' ? 'bn' : 'en';
  });

  // Requirements state
  const [requirementsData, setRequirementsData] = useState<RequirementsFile | null>(null);

  // Uploaded files state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);

  // Matches state: requirementId -> fileId
  const [matches, setMatches] = useState<Record<string, string>>({});

  // Expiry dates state: requirementId -> YYYY-MM-DD
  const [expiryDates, setExpiryDates] = useState<Record<string, string>>({});

  const workspaceRef = useRef<HTMLDivElement>(null);

  // Sync theme with document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('tender_theme', theme);
  }, [theme]);

  // Sync language
  useEffect(() => {
    localStorage.setItem('tender_language', language);
  }, [language]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const handleScrollToWorkspace = () => {
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Requirements handlers
  const handleRequirementsLoaded = (data: RequirementsFile) => {
    setRequirementsData(data);
    // Filter matches to existing requirements
    setMatches((prev) => {
      const validReqIds = new Set(data.requirements.map((r) => r.id));
      const next: Record<string, string> = {};
      for (const [reqId, fileId] of Object.entries(prev)) {
        if (validReqIds.has(reqId)) {
          next[reqId] = fileId;
        }
      }
      return next;
    });
  };

  const handleResetRequirements = () => {
    setRequirementsData(null);
    setMatches({});
    setExpiryDates({});
  };

  // Files handlers
  const handleFilesAdded = (newFiles: UploadedFileItem[]) => {
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileRemoved = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    // Clear any matches containing this fileId
    setMatches((prev) => {
      const next: Record<string, string> = {};
      for (const [reqId, fId] of Object.entries(prev)) {
        if (fId !== fileId) {
          next[reqId] = fId;
        }
      }
      return next;
    });
  };

  // Matching handler (enforcing 1-to-1)
  const handleMatchChange = (requirementId: string, fileId: string | null) => {
    setMatches((prev) => {
      const next = { ...prev };
      if (!fileId) {
        delete next[requirementId];
      } else {
        // If fileId was matched to another requirement, unmatch it from there first
        for (const [rId, fId] of Object.entries(next)) {
          if (fId === fileId && rId !== requirementId) {
            delete next[rId];
          }
        }
        next[requirementId] = fileId;
      }
      return next;
    });
  };

  // Expiry date handler
  const handleExpiryChange = (requirementId: string, date: string) => {
    setExpiryDates((prev) => ({
      ...prev,
      [requirementId]: date,
    }));
  };

  // Duplicate groups calculation based on SHA-256
  const duplicateGroups = useMemo(() => {
    return calculateDuplicateGroups(uploadedFiles);
  }, [uploadedFiles]);

  // Status calculation and package readiness
  const { evaluatedList, blockingIssues, isPackageReady, duplicateConflictWarnings } = useMemo(() => {
    if (!requirementsData) {
      return {
        evaluatedList: [],
        blockingIssues: [],
        isPackageReady: false,
        duplicateConflictWarnings: [],
      };
    }

    return evaluateAllRequirements(
      requirementsData.requirements,
      matches,
      expiryDates,
      uploadedFiles,
      requirementsData.tender.submission_deadline
    );
  }, [requirementsData, matches, expiryDates, uploadedFiles]);

  const matchedCount = useMemo(() => {
    return Object.keys(matches).length;
  }, [matches]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Application Navbar */}
      <Navbar
        language={language}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      {/* Hero Opening Experience */}
      <Hero
        language={language}
        onScrollToWorkspace={handleScrollToWorkspace}
      />

      {/* Main Workspace */}
      <main
        ref={workspaceRef}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
      >
        {/* Progress Workflow Bar */}
        <WorkflowSteps
          language={language}
          hasRequirements={Boolean(requirementsData)}
          uploadedCount={uploadedFiles.length}
          matchedCount={matchedCount}
          isPackageReady={isPackageReady}
        />

        {/* Section 1: Tender Requirements Loader */}
        <RequirementsLoader
          language={language}
          requirementsData={requirementsData}
          onRequirementsLoaded={handleRequirementsLoaded}
          onResetRequirements={handleResetRequirements}
        />

        {/* Section 2: PDF Document Repository Upload */}
        <PdfUploader
          language={language}
          files={uploadedFiles}
          duplicateGroups={duplicateGroups}
          onFilesAdded={handleFilesAdded}
          onFileRemoved={handleFileRemoved}
        />

        {/* Section 3: Matching Checklist */}
        {requirementsData && (
          <MatchingChecklist
            language={language}
            evaluatedList={evaluatedList}
            uploadedFiles={uploadedFiles}
            duplicateGroups={duplicateGroups}
            matches={matches}
            expiryDates={expiryDates}
            submissionDeadline={requirementsData.tender.submission_deadline}
            duplicateConflictWarnings={duplicateConflictWarnings}
            onMatchChange={handleMatchChange}
            onExpiryChange={handleExpiryChange}
          />
        )}

        {/* Section 4: Package Summary & Generator */}
        {requirementsData && (
          <PackageSummary
            language={language}
            tender={requirementsData.tender}
            evaluatedList={evaluatedList}
            blockingIssues={blockingIssues}
            isPackageReady={isPackageReady}
            onGeneratePackage={() => {
              console.log('Package compiled successfully!');
            }}
          />
        )}
      </main>

      {/* Application Footer */}
      <Footer language={language} />
    </div>
  );
};

export default App;
