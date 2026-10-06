import { PDFDocument } from 'pdf-lib';

/**
 * Computes exact cryptographic SHA-256 hash of binary file content.
 */
export async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Checks whether a file is genuinely a PDF by verifying both mime/extension and magic bytes.
 */
export async function isPdfFile(file: File): Promise<boolean> {
  const nameLower = file.name.toLowerCase();
  const isPdfExtension = nameLower.endsWith('.pdf');
  const isPdfMime = file.type === 'application/pdf' || file.type === '';

  if (!isPdfExtension && !isPdfMime) {
    return false;
  }

  try {
    const slice = file.slice(0, 5);
    const buffer = await slice.arrayBuffer();
    const headerBytes = new Uint8Array(buffer);
    const headerStr = String.fromCharCode(...headerBytes);
    return headerStr.startsWith('%PDF');
  } catch {
    return false;
  }
}

/**
 * Inspects a PDF in the browser to extract its page count safely.
 * Handles encrypted/password-protected or damaged files without crashing.
 */
export async function inspectPdfFile(file: File): Promise<{ pageCount: number; error?: string }> {
  try {
    const buffer = await file.arrayBuffer();
    // Validate PDF magic bytes (%PDF-)
    const headerBytes = new Uint8Array(buffer.slice(0, 5));
    const headerStr = String.fromCharCode(...headerBytes);
    if (!headerStr.startsWith('%PDF')) {
      return { pageCount: 0, error: 'Not a valid PDF header format' };
    }

    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: false });
    const count = pdfDoc.getPageCount();
    return { pageCount: count };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.toLowerCase().includes('encrypted') || errorMsg.toLowerCase().includes('password')) {
      return { pageCount: 0, error: 'PDF is password protected or encrypted' };
    }
    return { pageCount: 0, error: 'Damaged or unreadable PDF document' };
  }
}

/**
 * Helper to generate a valid test PDF in memory with custom title and page count.
 * Useful for automated tests or 1-click test file generation.
 */
export async function generateTestPdf(title: string, numPages: number = 1): Promise<File> {
  const pdfDoc = await PDFDocument.create();
  for (let i = 1; i <= numPages; i++) {
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    page.drawText(`${title} - Page ${i} of ${numPages}`, {
      x: 50,
      y: 780,
      size: 16,
    });
    page.drawText(`Generated for Tender Package Verification Testing`, {
      x: 50,
      y: 750,
      size: 11,
    });
  }
  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  return new File([blob], `${title.replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' });
}
