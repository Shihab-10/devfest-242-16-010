export interface TranslationStrings {
  appTitle: string;
  appSubtitle: string;
  badgeDevfest: string;
  themeDark: string;
  themeLight: string;
  languageEn: string;
  languageBn: string;

  // Hero
  heroTitle: string;
  heroDescription: string;
  featureChecking: string;
  featureCheckingDesc: string;
  featureCompleteness: string;
  featureCompletenessDesc: string;
  featureDuplicates: string;
  featureDuplicatesDesc: string;
  featureReadiness: string;
  featureReadinessDesc: string;

  // Steps
  step1: string;
  step2: string;
  step3: string;
  step4: string;

  // Tender / Requirements
  requirementsSectionTitle: string;
  loadRequirementsBtn: string;
  loadSampleBtn: string;
  replaceRequirementsBtn: string;
  dropJsonHere: string;
  jsonFormatHint: string;
  tenderId: string;
  tenderTitle: string;
  procuringEntity: string;
  bidder: string;
  submissionDeadline: string;
  totalRequirements: string;
  mandatoryCount: string;
  optionalCount: string;
  noRequirementsLoaded: string;
  noRequirementsHint: string;
  invalidJsonError: string;
  schemaError: string;

  // Upload
  uploadSectionTitle: string;
  uploadDropzoneTitle: string;
  uploadDropzoneSubtitle: string;
  uploadLimits: string;
  uploadedFilesTitle: string;
  noFilesUploaded: string;
  pages: string;
  removeFile: string;
  parsingPdf: string;
  hashLabel: string;
  duplicateWarning: string;
  duplicateGroupTag: string;
  maxFilesExceeded: string;
  maxSizeExceeded: string;
  nonPdfRejected: string;
  pdfParseError: string;

  // Matching & Checklist
  checklistSectionTitle: string;
  colOrder: string;
  colDocument: string;
  colType: string;
  colMatchedFile: string;
  colPages: string;
  colExpiryDate: string;
  colStatus: string;
  colActions: string;
  mandatory: string;
  optional: string;
  expiryRequired: string;
  selectFilePlaceholder: string;
  unassigned: string;
  clearMatch: string;
  noFilesToMatch: string;
  matchedCount: string;

  // Statuses
  statusOk: string;
  statusMissing: string;
  statusExpiryNeeded: string;
  statusExpired: string;
  statusNotProvided: string;

  // Blocking / Generator
  generatePackageBtn: string;
  packageBlockedTitle: string;
  packageBlockedDesc: string;
  packageReadyTitle: string;
  packageReadyDesc: string;
  blockingReasonMissing: string;
  blockingReasonExpiryNeeded: string;
  blockingReasonExpired: string;
  blockingReasonDuplicate: string;
  summaryTitle: string;
  readyDocuments: string;
  blockingIssues: string;
  duplicateFiles: string;
  optionalOmitted: string;
  compilingPackage: string;
  downloadPackageBtn: string;
  downloadAgainBtn: string;
  compilationSuccess: string;
  compilationError: string;

  // Footer & participant
  participantName: string;
  participantReg: string;
  browserOnlyNote: string;
}

export const translations: Record<'en' | 'bn', TranslationStrings> = {
  en: {
    appTitle: "Tender Document Package Builder",
    appSubtitle: "Government & Enterprise Bid Document Compilation & Verification System",
    badgeDevfest: "AI DevFest 2026",
    themeDark: "Dark Mode",
    themeLight: "Light Mode",
    languageEn: "English",
    languageBn: "বাংলা",

    // Hero
    heroTitle: "Build Audit-Ready Tender Packages with Confidence",
    heroDescription: "Streamline procurement documentation with in-browser page counting, exact SHA-256 duplicate detection, expiry date validation, and strict compliance checklist enforcement.",
    featureChecking: "Document Inspection",
    featureCheckingDesc: "Local client-side PDF verification without uploading files to any server.",
    featureCompleteness: "Completeness Check",
    featureCompletenessDesc: "Strict evaluation of mandatory vs optional tender requirements.",
    featureDuplicates: "SHA-256 Duplicate Check",
    featureDuplicatesDesc: "Identifies identical binary files regardless of differing file names.",
    featureReadiness: "Submission Readiness",
    featureReadinessDesc: "Guarantees zero missing or expired documents before package generation.",

    // Steps
    step1: "1. Requirements",
    step2: "2. Upload PDFs",
    step3: "3. Match & Verify",
    step4: "4. Readiness & Package",

    // Tender / Requirements
    requirementsSectionTitle: "Tender Requirements Specification",
    loadRequirementsBtn: "Load requirements.json",
    loadSampleBtn: "Load Sample Tender",
    replaceRequirementsBtn: "Change Requirements",
    dropJsonHere: "Drop requirements.json here or click to browse",
    jsonFormatHint: "Accepts JSON file defining tender metadata and ordered document checklist",
    tenderId: "Tender ID",
    tenderTitle: "Tender Title",
    procuringEntity: "Procuring Entity",
    bidder: "Bidder / Contractor",
    submissionDeadline: "Submission Deadline",
    totalRequirements: "Total Requirements",
    mandatoryCount: "Mandatory",
    optionalCount: "Optional",
    noRequirementsLoaded: "No requirements file loaded yet",
    noRequirementsHint: "Please load a requirements.json file or click 'Load Sample Tender' to begin.",
    invalidJsonError: "Failed to parse JSON. Please check file format syntax.",
    schemaError: "Invalid requirements schema. Must contain 'tender' and 'requirements' array.",

    // Upload
    uploadSectionTitle: "PDF Document Repository",
    uploadDropzoneTitle: "Upload Tender PDF Documents",
    uploadDropzoneSubtitle: "Drag & drop PDF files here, or click to browse",
    uploadLimits: "Max 30 files • Max 50 MB total • PDF format only • 100% Client-side processing",
    uploadedFilesTitle: "Uploaded Files",
    noFilesUploaded: "No PDF files uploaded yet.",
    pages: "pages",
    removeFile: "Remove",
    parsingPdf: "Inspecting PDF...",
    hashLabel: "SHA-256",
    duplicateWarning: "Exact duplicate content detected! This file shares identical SHA-256 hash with another uploaded file.",
    duplicateGroupTag: "Duplicate Group",
    maxFilesExceeded: "File limit exceeded: Maximum 30 files allowed.",
    maxSizeExceeded: "Total size limit exceeded: Total files size must be within 50 MB.",
    nonPdfRejected: "Rejected non-PDF file: Only PDF files (.pdf) are permitted.",
    pdfParseError: "Could not parse PDF file (may be password-protected or corrupted).",

    // Matching & Checklist
    checklistSectionTitle: "Tender Checklist & Verification",
    colOrder: "No.",
    colDocument: "Required Document",
    colType: "Type",
    colMatchedFile: "Matched PDF File",
    colPages: "Pages",
    colExpiryDate: "Expiry Date",
    colStatus: "Status",
    colActions: "Match Action",
    mandatory: "Mandatory",
    optional: "Optional",
    expiryRequired: "Expiry Required",
    selectFilePlaceholder: "Select uploaded PDF...",
    unassigned: "Unassigned",
    clearMatch: "Unmatch",
    noFilesToMatch: "Upload PDFs first to match documents",
    matchedCount: "Matched",

    // Statuses
    statusOk: "OK",
    statusMissing: "Missing",
    statusExpiryNeeded: "Expiry date needed",
    statusExpired: "Expired",
    statusNotProvided: "Not provided",

    // Blocking / Generator
    generatePackageBtn: "Generate Tender Package",
    packageBlockedTitle: "Package Generation Blocked",
    packageBlockedDesc: "The tender package cannot be assembled yet. Please resolve all blocking checklist issues listed below.",
    packageReadyTitle: "Tender Package Verified & Ready",
    packageReadyDesc: "All mandatory documents have been matched, verified, and confirmed compliant with the submission deadline.",
    blockingReasonMissing: "Mandatory document is missing a matched PDF file",
    blockingReasonExpiryNeeded: "Expiry date is required for this matched document",
    blockingReasonExpired: "Document expiry date is earlier than the tender submission deadline",
    blockingReasonDuplicate: "File is an exact duplicate of another matched document",
    summaryTitle: "Package Summary & Compilation",
    readyDocuments: "Compliant Documents",
    blockingIssues: "Blocking Issues",
    duplicateFiles: "Duplicate Files",
    optionalOmitted: "Optional Omitted",
    compilingPackage: "Compiling Tender Document Package...",
    downloadPackageBtn: "Download Tender Package",
    downloadAgainBtn: "Download Again",
    compilationSuccess: "Tender document package compiled successfully!",
    compilationError: "Failed to compile tender document package.",

    // Footer & participant
    participantName: "Participant: Md.Shehabaul Alam",
    participantReg: "Reg: 242-16-010",
    browserOnlyNote: "100% Browser-only processing. Zero server transmission. Privacy guaranteed.",
  },

  bn: {
    appTitle: "দরপত্র নথি প্যাকেজ প্রস্তুতকারক",
    appSubtitle: "সরকারি ও প্রাতিষ্ঠানিক দরপত্র নথি সংকলন ও যাচাইকরণ ব্যবস্থা",
    badgeDevfest: "এআই দেবফেস্ট ২০২৬",
    themeDark: "ডার্ক মোড",
    themeLight: "লাইট মোড",
    languageEn: "English",
    languageBn: "বাংলা",

    // Hero
    heroTitle: "আত্মবিশ্বাসের সাথে নিখুঁত দরপত্র প্যাকেজ তৈরি করুন",
    heroDescription: "ব্রাউজারের মধ্যে পেজ গণনা, নির্ভুল SHA-256 ডুপ্লিকেট শনাক্তকরণ, মেয়াদোত্তীর্ণের তারিখ যাচাই এবং সম্পূর্ণ চেকলিস্ট নিরীক্ষণ করে দরপত্র দাখিল নিশ্চিত করুন।",
    featureChecking: "নথি নিরীক্ষণ",
    featureCheckingDesc: "কোন সার্ভারে আপলোড ছাড়াই সম্পূর্ণ নিরাপদ ও গোপনীয় ক্লায়েন্ট-সাইড পিডিএফ যাচাইকরণ।",
    featureCompleteness: "সম্পূর্ণতা যাচাই",
    featureCompletenessDesc: "বাধ্যতামূলক ও ঐচ্ছিক দরপত্র চাহিদাসমূহের নিখুঁত স্বয়ংক্রিয় মূল্যায়ন।",
    featureDuplicates: "SHA-256 ডুপ্লিকেট শনাক্ত",
    featureDuplicatesDesc: "ফাইলের নাম ভিন্ন হলেও হুবহু বাইনারি মিলযুক্ত ফাইল নিখুঁতভাবে চিহ্নিত করে।",
    featureReadiness: "দাখিল প্রস্তুতি",
    featureReadinessDesc: "প্যাকেজ তৈরির পূর্বে কোনো নথি অপূর্ণ বা মেয়াদোত্তীর্ণ থাকলে তা নিশ্চিতভাবে প্রতিরোধ করে।",

    // Steps
    step1: "১. দরপত্র চাহিদা",
    step2: "২. পিডিএফ আপলোড",
    step3: "৩. মিলকরণ ও যাচাই",
    step4: "৪. প্যাকেজ প্রস্তুতি",

    // Tender / Requirements
    requirementsSectionTitle: "দরপত্রের চাহিদাসমূহ",
    loadRequirementsBtn: "requirements.json লোড করুন",
    loadSampleBtn: "নমুনা দরপত্র লোড করুন",
    replaceRequirementsBtn: "চাহিদা ফাইল পরিবর্তন করুন",
    dropJsonHere: "requirements.json ফাইলটি এখানে ফেলুন অথবা ব্রাউজ করুন",
    jsonFormatHint: "দরপত্রের মেটাডাটা ও ক্রমিক চেকলিস্ট সমৃদ্ধ জেএসওন (JSON) ফাইল গ্রহণ করে",
    tenderId: "দরপত্র আইডি",
    tenderTitle: "দরপত্রের শিরোনাম",
    procuringEntity: "সংগ্রহকারী কর্তৃপক্ষ",
    bidder: "দরপত্রদাতা / ঠিকাদার",
    submissionDeadline: "দাখিলের শেষ সময়",
    totalRequirements: "মোট চাহিদাকৃত নথি",
    mandatoryCount: "বাধ্যতামূলক",
    optionalCount: "ঐচ্ছিক",
    noRequirementsLoaded: "এখনো কোনো চাহিদা ফাইল লোড করা হয়নি",
    noRequirementsHint: "অনুগ্রহ করে requirements.json ফাইল লোড করুন অথবা শুরু করতে 'নমুনা দরপত্র লোড করুন' বাটনে ক্লিক করুন।",
    invalidJsonError: "জেএসওন ফাইল পড়তে ব্যর্থ হয়েছে। ফাইলের বিন্যাস পরীক্ষা করুন।",
    schemaError: "ভুল চাহিদা বিন্যাস। ফাইলটিতে অবশ্যই 'tender' এবং 'requirements' থাকতে হবে।",

    // Upload
    uploadSectionTitle: "পিডিএফ নথি ভাণ্ডার",
    uploadDropzoneTitle: "দরপত্র পিডিএফ নথি আপলোড করুন",
    uploadDropzoneSubtitle: "পিডিএফ ফাইল টেনে এনে ড্রপ করুন অথবা ব্রাউজ করুন",
    uploadLimits: "সর্বোচ্চ ৩০টি ফাইল • মোট ৫০ মেগাবাইট পর্যন্ত • শুধুমাত্র পিডিএফ • ব্রাউজারেই প্রক্রিয়াজাত",
    uploadedFilesTitle: "আপলোডকৃত ফাইলসমূহ",
    noFilesUploaded: "এখনো কোনো পিডিএফ আপলোড করা হয়নি।",
    pages: "পৃষ্ঠা",
    removeFile: "মুছে ফেলুন",
    parsingPdf: "পিডিএফ বিশ্লেষণ করা হচ্ছে...",
    hashLabel: "SHA-256",
    duplicateWarning: "হুবহু একই ডুপ্লিকেট কন্টেন্ট শনাক্ত হয়েছে! এই ফাইলের SHA-256 হ্যাশ অপর একটি ফাইলের সাথে মিলে গেছে।",
    duplicateGroupTag: "ডুপ্লিকেট গ্রুপ",
    maxFilesExceeded: "ফাইলের সংখ্যা সীমা অতিক্রম করেছে: সর্বোচ্চ ৩০টি ফাইল অনুমোদিত।",
    maxSizeExceeded: "মোট ফাইলের আকার সীমা অতিক্রম করেছে: ফাইলের মোট আকার ৫০ মেগাবাইটের মধ্যে হতে হবে।",
    nonPdfRejected: "পিডিএফ ব্যতীত অন্য ফাইল বাতিল করা হয়েছে: শুধুমাত্র .pdf ফাইল অনুমোদিত।",
    pdfParseError: "পিডিএফ ফাইলটি পড়া সম্ভব হয়নি (পাসওয়ার্ড সুরক্ষিত বা ত্রুটিপূর্ণ হতে পারে)।",

    // Matching & Checklist
    checklistSectionTitle: "দরপত্র চেকলিস্ট ও যাচাইকরণ",
    colOrder: "ক্রমিক",
    colDocument: "চাহিদাকৃত নথি",
    colType: "ধরন",
    colMatchedFile: "সংযুক্ত পিডিএফ ফাইল",
    colPages: "পৃষ্ঠা",
    colExpiryDate: "মেয়াদোত্তীর্ণের তারিখ",
    colStatus: "অবস্থা",
    colActions: "মিলকরণ",
    mandatory: "বাধ্যতামূলক",
    optional: "ঐচ্ছিক",
    expiryRequired: "মেয়াদ প্রযোজ্য",
    selectFilePlaceholder: "পিডিএফ ফাইল নির্বাচন করুন...",
    unassigned: "সংযুক্ত নেই",
    clearMatch: "বাতিল করুন",
    noFilesToMatch: "নথি মিলকরণের জন্য প্রথমে পিডিএফ আপলোড করুন",
    matchedCount: "সংযুক্ত",

    // Statuses
    statusOk: "সঠিক (OK)",
    statusMissing: "অনুপস্থিত (Missing)",
    statusExpiryNeeded: "মেয়াদ প্রয়োজন (Expiry needed)",
    statusExpired: "মেয়াদোত্তীর্ণ (Expired)",
    statusNotProvided: "প্রদান করা হয়নি (Not provided)",

    // Blocking / Generator
    generatePackageBtn: "দরপত্র প্যাকেজ প্রস্তুত করুন",
    packageBlockedTitle: "প্যাকেজ প্রস্তুতকরণ অবরুদ্ধ",
    packageBlockedDesc: "দরপত্র প্যাকেজ এখনই প্রস্তুত করা যাচ্ছে না। নিম্নে উল্লিখিত অবরুদ্ধকারী সমস্যাগুলো সমাধান করুন।",
    packageReadyTitle: "দরপত্র প্যাকেজ সম্পূর্ণ ও প্রস্তুত",
    packageReadyDesc: "সকল বাধ্যতামূলক নথি যথাযথভাবে সংযুক্ত, যাচাইকৃত এবং দাখিলের শেষ সময়সীমার সাথে সামঞ্জস্যপূর্ণ।",
    blockingReasonMissing: "বাধ্যতামূলক নথির জন্য কোনো পিডিএফ সংযুক্ত করা হয়নি",
    blockingReasonExpiryNeeded: "সংযুক্ত নথির জন্য মেয়াদোত্তীর্ণের তারিখ প্রদান আবশ্যক",
    blockingReasonExpired: "নথির মেয়াদ দরপত্র দাখিলের শেষ তারিখের পূর্বে উত্তীর্ণ হয়ে গেছে",
    blockingReasonDuplicate: "ফাইলটি অপর একটি সংযুক্ত নথির হুবহু ডুপ্লিকেট",
    summaryTitle: "প্যাকেজ সারসংক্ষেপ ও সংকলন",
    readyDocuments: "যথাযথ নথি",
    blockingIssues: "অবরুদ্ধকারী সমস্যা",
    duplicateFiles: "ডুপ্লিকেট ফাইল",
    optionalOmitted: "অনুপস্থিত ঐচ্ছিক নথি",
    compilingPackage: "দরপত্র নথি প্যাকেজ প্রস্তুত করা হচ্ছে...",
    downloadPackageBtn: "দরপত্র প্যাকেজ ডাউনলোড করুন",
    downloadAgainBtn: "পুনরায় ডাউনলোড করুন",
    compilationSuccess: "দরপত্র নথি প্যাকেজ সফলভাবে সংকলিত হয়েছে!",
    compilationError: "দরপত্র নথি প্যাকেজ সংকলনে ত্রুটি হয়েছে।",

    // Footer & participant
    participantName: "অংশগ্রহণকারী: মো. শেহাবাউল আলম",
    participantReg: "নিবন্ধন নং: ২৪২-১৬-০১০",
    browserOnlyNote: "১০০% ব্রাউজার-নির্ভর প্রক্রিয়াকরণ। কোনো সার্ভারে তথ্য পাঠানো হয় না। সম্পূর্ণ নিরাপদ।",
  }
};
