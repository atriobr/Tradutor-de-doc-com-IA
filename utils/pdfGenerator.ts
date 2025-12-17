import jsPDF from 'jspdf';
import { renderPageToImage, PDFPageContent } from './pdfWorker';

export async function generateVisualPDF(
    file: File,
    translatedPages: PDFPageContent[],
    onProgress?: (current: number, total: number) => void
): Promise<Blob> {
    const doc = new jsPDF();
    const totalPages = translatedPages.length;

    for (let i = 0; i < totalPages; i++) {
        const pageData = translatedPages[i];
        const pageNum = pageData.pageNumber;

        if (i > 0) doc.addPage();

        try {
            // 1. Render original page as background image
            const imageData = await renderPageToImage(file, pageNum, 1.5); // 1.5 scale for good quality/speed balance
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = doc.internal.pageSize.getHeight();

            doc.addImage(imageData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

            // 2. Add "Whitewash" Overlay
            // Define margins (approx 15mm)
            const margin = 15;
            const contentWidth = pdfWidth - (margin * 2);
            const contentHeight = pdfHeight - (margin * 2);

            doc.setFillColor(255, 255, 255);
            // Use a slightly transparent white to let some background bleed through? 
            // No, for readability solid white is better, maybe 0.95 opacity
            doc.setGState(new (doc as any).GState({ opacity: 0.95 }));
            doc.rect(margin, margin, contentWidth, contentHeight, 'F');

            // Reset opacity for text
            doc.setGState(new (doc as any).GState({ opacity: 1.0 }));

            // 3. Write Translated Text
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);

            const splitText = doc.splitTextToSize(pageData.text, contentWidth - 4); // extra padding inside box

            let cursorY = margin + 10;
            for (let j = 0; j < splitText.length; j++) {
                if (cursorY > (margin + contentHeight - 5)) {
                    // If text overflows the box, we just stop printing for this page 
                    // (or simple overflow handling, but usually translation roughly matches length)
                    // For now, simple overflow protection
                    break;
                }
                doc.text(splitText[j], margin + 2, cursorY);
                cursorY += 6; // Line height
            }

        } catch (err) {
            console.error(`Error generating visual page ${pageNum}:`, err);
            // Fallback: just print text on a blank page if image fails
            doc.text(pageData.text, 10, 10);
        }

        if (onProgress) onProgress(i + 1, totalPages);
    }

    return doc.output('blob');
}
