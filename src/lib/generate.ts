import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { jsPDF } from 'jspdf';

export type FileFormat = 'TXT' | 'PDF' | 'DOCX';
export type PdfSettings = { pageSize: 'a4' | 'letter'; font: 'helvetica' | 'times' | 'courier'; fontSize: number; margin: number };
export type DocxSettings = { font: string; fontSize: number; alignment: 'left' | 'center' | 'right' };

export function normalizedFilename(name: string, format: FileFormat): string {
  const safe = name.trim().replace(/[\\/:*?"<>|\u0000-\u001F]/g, '-').replace(/\.+$/g, '') || 'my-document';
  const base = safe.replace(/\.(txt|pdf|docx)$/i, '');
  return `${base}.${format.toLowerCase()}`;
}

export function generateTxt(text: string, filename: string): void {
  const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), text], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, filename);
}

export async function generatePdf(text: string, filename: string, settings: PdfSettings): Promise<void> {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: settings.pageSize, compress: true });
  if (/[^\x00-\x7F]/.test(text)) {
    const response = await fetch('/DejaVuSans.ttf');
    if (!response.ok) throw new Error('Unicode font could not be loaded');
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    doc.addFileToVFS('DejaVuSans.ttf', btoa(binary));
    doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
    doc.setFont('DejaVuSans', 'normal');
  } else { doc.setFont(settings.font, 'normal'); }
  doc.setFontSize(settings.fontSize);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = Math.max(8, Math.min(settings.margin, 35));
  const usableWidth = pageWidth - margin * 2;
  const lineHeight = settings.fontSize * 0.42;
  const paragraphs = text.replace(/\r\n?/g, '\n').split('\n');
  let y = margin;
  for (const paragraph of paragraphs) {
    const lines = paragraph.length ? doc.splitTextToSize(paragraph, usableWidth) as string[] : [''];
    for (const line of lines) {
      if (y + lineHeight > pageHeight - margin) { doc.addPage(); y = margin; }
      doc.text(line, margin, y, { baseline: 'top' });
      y += lineHeight;
    }
    y += lineHeight * 0.45;
  }
  doc.save(filename);
}

export async function generateDocx(text: string, filename: string, settings: DocxSettings): Promise<void> {
  const alignment = settings.alignment === 'center' ? AlignmentType.CENTER : settings.alignment === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT;
  const paragraphs = text.replace(/\r\n?/g, '\n').split('\n').map(line => new Paragraph({
    alignment,
    spacing: { after: 100 },
    children: [new TextRun({ text: line || ' ', font: settings.font, size: settings.fontSize * 2 })]
  }));
  const document = new Document({ sections: [{ properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children: paragraphs }] });
  downloadBlob(await Packer.toBlob(document), filename);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
