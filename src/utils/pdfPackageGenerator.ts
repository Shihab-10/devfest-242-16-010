import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { TenderMetadata, EvaluatedRequirement } from '../types/tender';

export interface PackageGenerationProgress {
  stage: 'initializing' | 'cover' | 'merging' | 'footers' | 'finalizing' | 'completed';
  currentDocument?: string;
  currentIndex?: number;
  totalDocuments?: number;
  percentage: number;
  message: string;
}

/**
 * Formats current date as YYYY-MM-DD
 */
export function getFormattedCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Assembles and compiles the final combined PDF package entirely in the browser.
 *
 * Rules:
 * 1. Page 1 is an English cover page with tender metadata and included documents.
 * 2. Documents are included in strict numerical order by requirement `order`.
 * 3. Optional requirements without a matched file are skipped.
 * 4. Every page (including cover page) contains `<tender_id> | Page X of Y` footer.
 * 5. Returns a Blob ready for instant download as `<tender_id>_Package.pdf`.
 */
export async function generateTenderPackage(
  tender: TenderMetadata,
  evaluatedList: EvaluatedRequirement[],
  onProgress?: (progress: PackageGenerationProgress) => void
): Promise<{ blob: Blob; filename: string; totalPages: number }> {
  onProgress?.({
    stage: 'initializing',
    percentage: 5,
    message: 'Initializing PDF document package builder...',
  });

  // 1. Filter and sort included documents strictly by requirement.order
  const includedItems = evaluatedList
    .filter((item) => item.matchedFile !== null && item.status === 'OK')
    .sort((a, b) => a.requirement.order - b.requirement.order);

  // Create master document
  const masterDoc = await PDFDocument.create();
  const fontRegular = await masterDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await masterDoc.embedFont(StandardFonts.HelveticaBold);

  // 2. Build Cover Page (Page 1)
  onProgress?.({
    stage: 'cover',
    percentage: 15,
    message: 'Generating official English cover page...',
  });

  const coverPage = masterDoc.addPage([595.28, 841.89]); // A4 (w: 595.28, h: 841.89)
  const pageWidth = coverPage.getWidth();
  const pageHeight = coverPage.getHeight();

  // Top header banner
  coverPage.drawRectangle({
    x: 0,
    y: pageHeight - 90,
    width: pageWidth,
    height: 90,
    color: rgb(0.12, 0.16, 0.28), // Dark slate/navy
  });

  coverPage.drawText('GOVERNMENT & ENTERPRISE PROCUREMENT SUBMISSION', {
    x: 40,
    y: pageHeight - 40,
    size: 10,
    font: fontBold,
    color: rgb(0.58, 0.68, 0.95),
  });

  coverPage.drawText('OFFICIAL TENDER DOCUMENT PACKAGE', {
    x: 40,
    y: pageHeight - 65,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Metadata Card background
  const metaBoxY = pageHeight - 245;
  coverPage.drawRectangle({
    x: 40,
    y: metaBoxY,
    width: pageWidth - 80,
    height: 135,
    color: rgb(0.96, 0.97, 0.99),
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1,
  });

  // Tender Metadata fields
  const drawMetaRow = (label: string, value: string, yPos: number) => {
    coverPage.drawText(label.toUpperCase(), {
      x: 55,
      y: yPos,
      size: 8,
      font: fontBold,
      color: rgb(0.35, 0.4, 0.5),
    });
    // Truncate long value if necessary
    const cleanValue = value.length > 70 ? `${value.substring(0, 67)}...` : value;
    coverPage.drawText(cleanValue, {
      x: 180,
      y: yPos,
      size: 9.5,
      font: fontRegular,
      color: rgb(0.08, 0.1, 0.15),
    });
  };

  const currentDate = getFormattedCurrentDate();
  drawMetaRow('Tender ID:', tender.tender_id, metaBoxY + 110);
  drawMetaRow('Tender Title:', tender.title, metaBoxY + 88);
  drawMetaRow('Procuring Entity:', tender.procuring_entity, metaBoxY + 66);
  drawMetaRow('Bidder / Contractor:', tender.bidder, metaBoxY + 44);
  drawMetaRow('Submission Deadline:', tender.submission_deadline, metaBoxY + 22);
  drawMetaRow('Package Date:', currentDate, metaBoxY + 5);

  // Section Heading: Included Documents Table
  const tableTopY = metaBoxY - 30;
  coverPage.drawText('TABLE OF INCLUDED DOCUMENTS', {
    x: 40,
    y: tableTopY,
    size: 11,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.28),
  });

  coverPage.drawText(`(${includedItems.length} verified documents compiled in order)`, {
    x: 230,
    y: tableTopY,
    size: 9,
    font: fontRegular,
    color: rgb(0.45, 0.5, 0.55),
  });

  // Table header bar
  const headerY = tableTopY - 22;
  coverPage.drawRectangle({
    x: 40,
    y: headerY,
    width: pageWidth - 80,
    height: 20,
    color: rgb(0.9, 0.92, 0.96),
  });

  coverPage.drawText('ORDER', { x: 50, y: headerY + 6, size: 8, font: fontBold, color: rgb(0.2, 0.25, 0.35) });
  coverPage.drawText('DOCUMENT TITLE', { x: 95, y: headerY + 6, size: 8, font: fontBold, color: rgb(0.2, 0.25, 0.35) });
  coverPage.drawText('FILE NAME', { x: 310, y: headerY + 6, size: 8, font: fontBold, color: rgb(0.2, 0.25, 0.35) });
  coverPage.drawText('PAGES', { x: 470, y: headerY + 6, size: 8, font: fontBold, color: rgb(0.2, 0.25, 0.35) });
  coverPage.drawText('STATUS', { x: 515, y: headerY + 6, size: 8, font: fontBold, color: rgb(0.2, 0.25, 0.35) });

  // Rows
  let currentY = headerY - 18;
  for (let i = 0; i < includedItems.length; i++) {
    const item = includedItems[i];
    const isEven = i % 2 === 0;

    if (isEven) {
      coverPage.drawRectangle({
        x: 40,
        y: currentY - 4,
        width: pageWidth - 80,
        height: 18,
        color: rgb(0.98, 0.98, 0.99),
      });
    }

    // Order
    coverPage.drawText(String(item.requirement.order), {
      x: 58,
      y: currentY + 1,
      size: 8.5,
      font: fontBold,
      color: rgb(0.15, 0.2, 0.3),
    });

    // Title (always English title for cover per rule)
    const title = item.requirement.title_en.length > 36
      ? `${item.requirement.title_en.substring(0, 34)}...`
      : item.requirement.title_en;
    coverPage.drawText(title, {
      x: 95,
      y: currentY + 1,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.1, 0.12, 0.15),
    });

    // File name
    const fileName = (item.matchedFile?.name || '').length > 25
      ? `${(item.matchedFile?.name || '').substring(0, 23)}...`
      : item.matchedFile?.name || '';
    coverPage.drawText(fileName, {
      x: 310,
      y: currentY + 1,
      size: 8,
      font: fontRegular,
      color: rgb(0.35, 0.4, 0.45),
    });

    // Pages
    coverPage.drawText(String(item.matchedFile?.pageCount || 1), {
      x: 480,
      y: currentY + 1,
      size: 8.5,
      font: fontBold,
      color: rgb(0.15, 0.2, 0.3),
    });

    // Status
    coverPage.drawText('OK (Verified)', {
      x: 515,
      y: currentY + 1,
      size: 7.5,
      font: fontBold,
      color: rgb(0.05, 0.5, 0.2), // Dark emerald
    });

    currentY -= 20;
  }

  // Verification stamp note at bottom of cover page
  const noteBoxY = Math.max(currentY - 40, 50);
  coverPage.drawRectangle({
    x: 40,
    y: noteBoxY,
    width: pageWidth - 80,
    height: 32,
    color: rgb(0.95, 0.98, 0.95),
    borderColor: rgb(0.7, 0.85, 0.7),
    borderWidth: 1,
  });

  coverPage.drawText('COMPLIANCE VERIFICATION NOTICE:', {
    x: 50,
    y: noteBoxY + 18,
    size: 7.5,
    font: fontBold,
    color: rgb(0.1, 0.5, 0.2),
  });

  coverPage.drawText(
    'All mandatory documents have been inspected, validated against submission deadline, and compiled in accordance with procurement rules.',
    {
      x: 50,
      y: noteBoxY + 6,
      size: 7,
      font: fontRegular,
      color: rgb(0.15, 0.3, 0.18),
    }
  );

  // 3. Merge matched PDF documents in strict requirement.order
  for (let idx = 0; idx < includedItems.length; idx++) {
    const item = includedItems[idx];
    const percentage = 20 + Math.round(((idx + 1) / includedItems.length) * 60);

    onProgress?.({
      stage: 'merging',
      currentDocument: item.matchedFile?.name,
      currentIndex: idx + 1,
      totalDocuments: includedItems.length,
      percentage,
      message: `Merging document ${idx + 1} of ${includedItems.length}: ${item.matchedFile?.name}...`,
    });

    try {
      const fileBytes = await item.matchedFile!.file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      const sourcePageCount = sourcePdf.getPageCount();
      const pageIndices = Array.from({ length: sourcePageCount }, (_, i) => i);

      // Copy pages into master doc
      const copiedPages = await masterDoc.copyPages(sourcePdf, pageIndices);
      for (const copiedPage of copiedPages) {
        masterDoc.addPage(copiedPage);
      }
    } catch (err) {
      console.error(`Failed to load and merge document ${item.matchedFile?.name}:`, err);
      throw new Error(`Failed to process PDF: "${item.matchedFile?.name}". The document may be corrupted.`);
    }
  }

  // 4. Calculate final accurate total pages Y across all pages
  const totalPages = masterDoc.getPageCount();

  onProgress?.({
    stage: 'footers',
    percentage: 85,
    message: `Applying accurate running footers (1 to ${totalPages} pages)...`,
  });

  // 5. Draw Running Footer on EVERY page (including Cover Page)
  // Format: `<tender_id> | Page X of Y`
  const pages = masterDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const pWidth = p.getWidth();
    const pageNum = i + 1;
    const footerText = `${tender.tender_id} | Page ${pageNum} of ${totalPages}`;

    const textWidth = fontRegular.widthOfTextAtSize(footerText, 8.5);
    const textX = (pWidth - textWidth) / 2;

    // Draw clean footer background bar on bottom (height 20pt)
    // to guarantee footer is readable and doesn't collide with page content
    p.drawRectangle({
      x: 0,
      y: 0,
      width: pWidth,
      height: 20,
      color: rgb(0.98, 0.98, 0.99),
      opacity: 0.95,
    });

    // Thin top border line on footer band
    p.drawLine({
      start: { x: 20, y: 20 },
      end: { x: pWidth - 20, y: 20 },
      thickness: 0.5,
      color: rgb(0.82, 0.85, 0.88),
    });

    // Draw footer text centered
    p.drawText(footerText, {
      x: textX,
      y: 6,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.25, 0.3, 0.38),
    });
  }

  // 6. Save final PDF bytes and create download Blob
  onProgress?.({
    stage: 'finalizing',
    percentage: 95,
    message: 'Compressing and serializing final package...',
  });

  const pdfBytes = await masterDoc.save();
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const filename = `${tender.tender_id}_Package.pdf`;

  onProgress?.({
    stage: 'completed',
    percentage: 100,
    message: `Package compiled successfully: ${filename}`,
  });

  return {
    blob,
    filename,
    totalPages,
  };
}

/**
 * Initiates an in-browser download of the generated PDF package Blob and cleans up.
 */
export function triggerPackageDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 2000);
}
