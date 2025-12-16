import React, { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle2, FileText, Languages, FileOutput, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
import { extractTextFromPDF } from '../utils/pdfWorker';
import { translateText, TranslationProvider } from '../utils/translationService';

interface ProcessingStatusProps {
  file: File;
  fileName: string;
  provider: TranslationProvider;
  onComplete: (blob: Blob, text: string) => void;
}

const STEPS = [
  { id: 1, label: 'Extraindo texto...', icon: FileText },
  { id: 2, label: 'Traduzindo...', icon: Languages },
  { id: 3, label: 'Gerando PDF...', icon: FileOutput },
];

export default function ProcessingStatus({ file, fileName, provider, onComplete }: ProcessingStatusProps) {
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

        // Step 2: Translation (PARALLEL for speed)
        setCurrentStep(1);

        // Process in batches of 3 pages at a time for optimal speed
        const BATCH_SIZE = 3;
        const translatedPages = [];

        for (let i = 0; i < pages.length; i += BATCH_SIZE) {
          const batch = pages.slice(i, i + BATCH_SIZE);

          // Translate multiple pages simultaneously
          const batchPromises = batch.map(page =>
            translateText({
              text: page.text,
              provider,
              apiKey: undefined
            }).then(translatedText => ({ ...page, text: translatedText }))
          );

          const batchResults = await Promise.all(batchPromises);
          translatedPages.push(...batchResults);

          setProgress(30 + (translatedPages.length / pages.length) * 50); // 30% to 80%
        }

        // Step 3: Reconstruction
        setCurrentStep(2);
        setProgress(90);
        const doc = new jsPDF();

        translatedPages.forEach((page, index) => {
          if (index > 0) doc.addPage();

          doc.setFontSize(12);
          const splitText = doc.splitTextToSize(page.text, 180); // Margin

          let cursorY = 20;
          for (let i = 0; i < splitText.length; i++) {
            if (cursorY > 280) {
              doc.addPage();
              cursorY = 20;
            }
            doc.text(splitText[i], 15, cursorY);
            cursorY += 7;
          }
        });

        const pdfBlob = doc.output('blob');
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

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 w-full">
        <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center max-w-lg">
          <div className="bg-red-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-red-800 mb-2">Erro no Processamento</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-white border border-red-300 rounded-lg text-red-700 hover:bg-red-50"
          >
            Tentar Novamente
          </button>
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
      </div>
    </div>
  );
}