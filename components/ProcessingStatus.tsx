import React, { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle2, FileText, Languages, FileOutput, AlertTriangle, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { extractTextFromPDF } from '../utils/pdfWorker';
import { translateText, TranslationProvider } from '../utils/translationService';
import { saveTranslationProgress, loadTranslationProgress, clearTranslationCache } from '../utils/translationCache';

interface ProcessingStatusProps {
  file: File;
  fileName: string;
  provider: TranslationProvider;
  onComplete: (blob: Blob, text: string) => void;
  previewOnly?: boolean;
  onPreviewReady?: (original: string, translated: string) => void;
}

const STEPS = [
  { id: 1, label: 'Extraindo texto...', icon: FileText },
  { id: 2, label: 'Traduzindo...', icon: Languages },
  { id: 3, label: 'Gerando PDF...', icon: FileOutput },
];

export default function ProcessingStatus({ file, fileName, provider, onComplete, previewOnly, onPreviewReady }: ProcessingStatusProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    // Reset processing state when file changes
    processingRef.current = false;
  }, [file]);

  useEffect(() => {
    if (processingRef.current || !file) return;
    processingRef.current = true;

    const processFile = async () => {
      try {
        // Step 1: Extraction
        setCurrentStep(0);
        setProgress(10);
        const pages = await extractTextFromPDF(file, (current, total) => {
          setProgress(10 + (current / total) * 20); // 10% to 30%
        });

        // Step 2: Translation (PARALLEL for speed + CACHE for resume)
        setCurrentStep(1);

        // Try to load cached progress
        const cachedPages = loadTranslationProgress(fileName, provider);
        let translatedPages = cachedPages || [];

        if (cachedPages) {
          console.log(`📦 Resuming from cache: ${cachedPages.length} pages already translated`);
          setProgress(30 + (cachedPages.length / pages.length) * 50);
        }

        // Only translate pages that haven't been cached
        const startIndex = translatedPages.length;

        // IF PREVIEW ONLY: Just do the first page if not done
        if (previewOnly) {
          if (translatedPages.length === 0 && pages.length > 0) {
            // Translate first page
            const firstPage = pages[0];
            const translatedText = await translateText({
              text: firstPage.text,
              provider,
              apiKey: undefined
            });

            const newPage = { ...firstPage, text: translatedText };
            translatedPages.push(newPage);

            // Save to cache so full run picks it up
            saveTranslationProgress(fileName, provider, translatedPages, pages);
          } else if (translatedPages.length > 0 && pages.length > 0) {
            // First page already in cache
            // do nothing, just use it
          }

          // Done with preview
          if (onPreviewReady && pages.length > 0) {
            // Ensure we have the translated text for the first page
            const firstPageTranslated = translatedPages.find(p => p.pageNumber === pages[0].pageNumber);
            onPreviewReady(pages[0].text, firstPageTranslated?.text || "");
          }
          return; // Stop here
        }

        const BATCH_SIZE = 1; // Reduced to 1 to prevent Vercel 504 timeouts on dense pages

        for (let i = startIndex; i < pages.length; i += BATCH_SIZE) {
          const batch = pages.slice(i, i + BATCH_SIZE);

          try {
            // Translate page by page (or small batch)
            const batchPromises = batch.map(page =>
              translateText({
                text: page.text,
                provider,
                apiKey: undefined
              }).then(translatedText => ({ ...page, text: translatedText }))
            );

            const batchResults = await Promise.all(batchPromises);
            translatedPages.push(...batchResults);

            // Save progress after each batch (checkpoint)
            saveTranslationProgress(fileName, provider, translatedPages, pages);

            setProgress(30 + (translatedPages.length / pages.length) * 50); // 30% to 80%
          } catch (batchError: any) {
            // Save progress before throwing error
            saveTranslationProgress(fileName, provider, translatedPages, pages);
            throw new Error(`Erro na página ${i + 1}: ${batchError.message}. Progresso salvo: ${translatedPages.length}/${pages.length} páginas.`);
          }
        }

        // Clear cache on successful completion
        clearTranslationCache();

        // Step 3: Reconstruction (Visual)
        setCurrentStep(2);
        setProgress(90);

        // Use new Visual Generator
        const { generateVisualPDF } = await import('../utils/pdfGenerator');

        const pdfBlob = await generateVisualPDF(file, translatedPages, (current, total) => {
          // Update progress during PDF generation if it takes time
          setProgress(90 + (current / total) * 10);
        });

        setProgress(100);

        // Collect full text for preview
        const fullTranslatedText = translatedPages.map(p => p.text).join('\n\n');

        // Short delay to show 100%
        setTimeout(() => {
          onComplete(pdfBlob, fullTranslatedText);
        }, 1000);

      } catch (err: any) {
        console.error("Processing error:", err);
        setError(err.message || "Erro ao processar arquivo");
        processingRef.current = false;
      }
    };

    processFile();
  }, [file, provider, onComplete]);

  const handlePartialDownload = async () => {
    const cachedPages = loadTranslationProgress(fileName, provider);
    if (!cachedPages || cachedPages.length === 0) return;

    try {
      const { generateVisualPDF } = await import('../utils/pdfGenerator');
      // Note: Partial download needs 'file' access. 'file' is available in scope.
      const pdfBlob = await generateVisualPDF(file, cachedPages);

      // Manually trigger download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName.replace('.pdf', '')}_PARCIAL_${cachedPages.length}_PAGINAS.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Erro ao gerar PDF parcial:", err);
    }
  };

  if (error) {
    const cachedPages = loadTranslationProgress(fileName, provider);
    const hasPartialContent = cachedPages && cachedPages.length > 0;

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 w-full">
        <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center max-w-lg">
          <div className="bg-red-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-red-800 mb-2">Erro no Processamento</h3>
          <p className="text-red-700 mb-4">{error}</p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white border border-red-300 rounded-lg text-red-700 hover:bg-red-50 font-medium"
            >
              Tentar Novamente
            </button>

            {hasPartialContent && (
              <button
                onClick={handlePartialDownload}
                className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar {cachedPages.length} Páginas Traduzidas
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 w-full">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Processando Documento</h2>
          <p className="text-slate-500 truncate max-w-md mx-auto">{fileName}</p>
          <p className="text-xs text-indigo-500 font-medium mt-1 uppercase tracking-wide">Via {provider}</p>
        </div>

        {/* Steps Visualization */}
        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div
                key={step.id}
                className={`flex items-center p-4 rounded-xl border transition-all duration-500
                  ${isActive
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm transform scale-105'
                    : isCompleted
                      ? 'bg-slate-50 border-slate-100 opacity-50'
                      : 'bg-white border-transparent opacity-30'
                  }`}
              >
                <div className={`mr-4 p-2 rounded-full ${isActive ? 'bg-indigo-100 text-indigo-600' : isCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />}
                </div>
                <div className="flex-1">
                  <span className={`font-medium ${isActive ? 'text-indigo-900' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
                {isActive && <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />}
              </div>
            );
          })}
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-xs text-slate-400 font-medium">{Math.round(progress)}% Concluído</p>

        {/* Partial Download Button during processing */}
        {progress > 15 && !previewOnly && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => handlePartialDownload()}
              className="text-xs text-indigo-600 hover:text-indigo-800 underline cursor-pointer flex items-center"
            >
              <Download className="w-3 h-3 mr-1" />
              Baixar páginas já traduzidas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}