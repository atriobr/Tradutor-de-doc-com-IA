import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface PDFPageContent {
  pageNumber: number;
  text: string;
}

export async function extractTextFromPDF(file: File, onProgress?: (current: number, total: number) => void): Promise<PDFPageContent[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const extractedContent: PDFPageContent[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Improved extraction to preserve basic layout (newlines)
    let pageText = '';
    let lastY = -1;
    const items = textContent.items as any[]; // pdfjs items have .transform [scaleX, skewY, skewX, scaleY, x, y]

    for (let j = 0; j < items.length; j++) {
      const item = items[j];
      const currentY = item.transform ? item.transform[5] : 0;

      // If Y changes significantly (> 10 units), it's a new line
      // Note: PDF coordinates: Y increases upwards. So different Y means new line.
      if (lastY !== -1 && Math.abs(currentY - lastY) > 10) {
        pageText += '\n';
      } else if (pageText.length > 0 && !pageText.endsWith('\n')) {
        // Add space between words on same line
        pageText += ' ';
      }

      pageText += item.str;
      lastY = currentY;
    }

    // Remove excessive whitespace but KEEP newlines
    pageText = pageText
      .split('\n')
      .map(line => line.trim().replace(/\s+/g, ' ')) // Clean each line
      .filter(line => line.length > 0) // Remove empty lines
      .join('\n'); // Re-join with newlines

    extractedContent.push({
      pageNumber: i,
      text: pageText
    });

    if (onProgress) {
      onProgress(i, numPages);
    }
  }

  return extractedContent;
}

export async function renderPageToImage(file: File, pageNumber: number, scale: number = 1.5): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageNumber);

  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) throw new Error('Could not get canvas context');

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({
    canvasContext: context,
    viewport: viewport,
    // @ts-ignore - Some type definitions require canvas but it's not strictly needed if context is provided
    canvas: canvas
  }).promise;

  return canvas.toDataURL('image/jpeg', 0.8);
}
