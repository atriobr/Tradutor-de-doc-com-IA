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
    const textItems = textContent.items.map((item: any) => item.str).join(' ');
    
    extractedContent.push({
      pageNumber: i,
      text: textItems
    });

    if (onProgress) {
      onProgress(i, numPages);
    }
  }

  return extractedContent;
}
