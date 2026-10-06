# Tender Document Package Builder

> **AI DevFest 2026 — Solo Vibe-Coding Contest**  
> **Participant:** Md. Shehabaul Alam  
> **Registration Number:** 242-16-010  
> **GitHub Repository:** [https://github.com/Shihab-10/devfest-242-16-010](https://github.com/Shihab-10/devfest-242-16-010)  
> **Live Website:** [https://devfest-242-16-010.vercel.app/](https://devfest-242-16-010.vercel.app/)

---

## 📌 Overview

**Tender Document Package Builder** is a browser-only, zero-server document compilation and verification system designed for public and enterprise procurement workflows. It guides staff in assembling audit-ready tender submission packages by verifying document completeness, matching requirements to uploaded PDFs, evaluating expiry dates against submission deadlines, and catching exact duplicate uploads via cryptographic binary hashing.

All document processing happens **100% locally in the browser**. No files or metadata are ever transmitted to any external server or third-party database.

---

## 🚀 Key Features (Phase 1 — MVP)

1. **Enterprise Application Shell**
   - Clean, professional government procurement visual hierarchy.
   - **Bilingual Interface:** Full toggle between English (`EN`) and Bangla (`বাংলা`) across every screen, label, and document name (`title_en` / `title_bn`).
   - **Dark / Light Mode:** High-contrast accessible themes persisted in `localStorage`.
   - **4-Step Workflow Tracker:** Live progress across Requirements, Upload, Match & Verify, and Package Ready.

2. **Tender Requirements Loader (`requirements.json`)**
   - Drag-and-drop or file selector to load and validate structured tender definitions.
   - Extracts and displays: Tender ID, Title, Procuring Entity, Bidder Name, Submission Deadline, and ordered requirement items.
   - Supports any valid external JSON adhering to the schema.
   - Built-in "Load Sample Tender" button for instant one-click demonstration.

3. **Multi-File PDF Upload & Client-Side Inspection**
   - Drag-and-drop PDF repository supporting up to 30 files and 50 MB total upload size.
   - Rejects non-PDF files with clear human-readable explanations.
   - Extracts page counts client-side using `pdf-lib` without server round-trips.
   - Gracefully handles encrypted, password-protected, or corrupted PDFs without application crashes.
   - In-browser demo PDF generator for rapid test evaluation without needing local PDF files.

4. **Exact Duplicate Detection via SHA-256**
   - Computes cryptographic SHA-256 hashes of raw binary PDF bytes using Web Cryptography (`crypto.subtle.digest`).
   - Detects identical files even if filenames differ.
   - Automatically groups duplicates and blocks identical files from being matched to different requirements.

5. **1-to-1 Document Matching Model**
   - Enforces the strict rule: **One requirement can have at most one matched file; one file can be matched to at most one requirement**.
   - Intuitive dropdown selection with visual indications for already-matched files and duplicate files.
   - Unmatch / reassign controls with immediate state recalculation.

6. **Strict Compliance Status Engine**
   - Evaluates each requirement into exactly one of five statuses:
     - 🔴 **Missing:** Mandatory requirement without a matched PDF (blocks package).
     - 🟠 **Expiry date needed:** Matched requirement has `has_expiry = true` but no date entered (blocks package).
     - 🔴 **Expired:** Matched expiry date is strictly before the submission deadline (blocks package).
     - ⚪ **Not provided:** Optional requirement without a matched file (allowed, non-blocking).
     - 🟢 **OK:** Matched and compliant; if expiry applies, date is on or after the deadline (non-blocking).
   - Recalculates immediately on any file or requirement change.

7. **Browser-Side PDF Package Generator (`pdf-lib`)**
   - **Page 1 Cover Page:** Generated in professional English with tender details (Tender ID, Title, Procuring Entity, Bidder, Deadline, Creation Date) and an ordered table of all included documents.
   - **Requirement-Driven Page Order:** Matched PDFs are appended in strict numerical order of requirement `order` (skipping omitted optional items).
   - **Page X of Y Running Footers:** Every page (including Cover Page) receives an official `<tender_id> | Page X of Y` footer with a subtle protective background band to prevent obscuring content.
   - **Instant Browser Download:** Downloads directly as `<tender_id>_Package.pdf` via temporary object URL without any server or backend dependencies.
   - **Live Progress Bar:** Shows real-time compilation steps and percentages.

8. **Blocked Package Protection**
   - The "Generate Tender Package" control is strictly disabled when any blocking issues or duplicate conflicts exist.
   - Displays an interactive breakdown of all blocking problems preventing package compilation.

9. **Phase 2 & 3 Polish & Productivity Enhancements**
   - **Compliance CSV Report Export:** One-click export of an audit-ready CSV report formatted with UTF-8 BOM for Microsoft Excel compatibility, documenting requirement compliance, matched filenames, page counts, expiry validity, and status explanations.
   - **Smart Auto-Match Suggestions:** Heuristic assistant that suggests matching unassigned PDFs to checklist items based on filename and title similarity.
   - **Real-Time Resource Meters:** Visual usage gauges for the 30-file count limit and 50 MB total upload ceiling with dynamic color transitions.
   - **Duplicate Explanation Callouts:** Contextual notifications explaining why files sharing identical SHA-256 hashes cannot be used to satisfy separate requirements.
   - **Comprehensive Automated Test Suite:** 34 automated verification tests (`scripts/test-edge-cases.ts`) covering all 20 edge cases and PDF generation requirements.

---

## 🛠️ Tech Stack

- **Framework:** React 18 with TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS with dark mode support
- **PDF Engine:** `pdf-lib` (browser-side PDF parsing, manipulation, and generation)
- **Icons:** `lucide-react`
- **Crypto:** Native Web Crypto API (`crypto.subtle.digest`)

---

## 💻 Local Development & Testing

```bash
# Clone the repository
git clone https://github.com/Shihab-10/devfest-242-16-010.git
cd devfest-242-16-010

# Install dependencies
npm install

# Run the 20 Edge Cases + PDF Package Generator automated test suite (34 checks)
npm test
# (or: npx tsx scripts/test-edge-cases.ts)

# Start the Vite development server
npm run dev

# Build for production
npm run build
```

---

## 📄 License

MIT © 2026 Md. Shehabaul Alam (Registration: 242-16-010) — AI DevFest 2026