import React, { useState, useEffect } from 'react';
import { FileUp, FileCheck, RefreshCw, Download, BookOpen, Languages, ShieldCheck, Zap } from 'lucide-react';
import FileUploader from './components/FileUploader';
import ProcessingStatus from './components/ProcessingStatus';
import ResultView from './components/ResultView';

import CoverPreview from './components/CoverPreview';

export type AppState = 'upload' | 'processing' | 'preview' | 'result';

export default function App() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'deepseek'>('deepseek');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultText, setResultText] = useState<string>('');

  // Preview Data
  const [previewData, setPreviewData] = useState<{ original: string, translated: string } | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleFileUpload = (selectedFile: File) => {
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileSize((selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB');

    // Start with preview mode
    setAppState('processing');
    setIsPreviewMode(true);
  };

  const handlePreviewReady = (original: string, translated: string) => {
    setPreviewData({ original, translated });
    setAppState('preview');
  };

  const handleConfirmTranslation = () => {
    setAppState('processing');
    setIsPreviewMode(false); // Disable preview mode to continue full translation
  };

  const handleProcessingComplete = (blob: Blob, text: string) => {
    setResultBlob(blob);
    setResultText(text);
    setAppState('result');
  };

  const handleReset = () => {
    setAppState('upload');
    setFileName('');
    setFileSize('');
    setFile(null);
    setResultBlob(null);
    setResultText('');
    setPreviewData(null);
    setIsPreviewMode(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={handleReset}>
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">TradutorPDF<span className="text-indigo-600">Pro</span></span>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <span className="flex items-center hover:text-indigo-600 cursor-pointer transition-colors">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Seguro & Privado
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-3xl">

          {appState === 'upload' && (
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Tradução de Documentos com IA
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Traduza livros técnicos, manuais e documentos PDF mantendo a formatação original.
                Especializado em Inglês para Português Brasileiro.
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden min-h-[400px] flex flex-col">
            {appState === 'upload' && (
              <FileUploader onFileSelect={handleFileUpload} />
            )}

            {appState === 'processing' && file && (
              <ProcessingStatus
                file={file}
                fileName={fileName}
                provider={provider}
                onComplete={handleProcessingComplete}
                previewOnly={isPreviewMode}
                onPreviewReady={handlePreviewReady}
              />
            )}

            {appState === 'preview' && previewData && (
              <CoverPreview
                originalText={previewData.original}
                translatedText={previewData.translated}
                fileName={fileName}
                onConfirm={handleConfirmTranslation}
                onCancel={handleReset}
              />
            )}

            {appState === 'result' && resultBlob && (
              <ResultView
                fileName={fileName}
                originalSize={fileSize}
                resultBlob={resultBlob}
                resultText={resultText}
                onReset={handleReset}
              />
            )}
          </div>

          {/* Features Footer within the main area */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Rápido e Preciso</h3>
              <p className="text-sm text-slate-600">Utiliza modelos Gemini 2.5 Flash para traduções contextuais de alta velocidade.</p>
            </div>
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Mantém Formatação</h3>
              <p className="text-sm text-slate-600">Preserva imagens, tabelas e layouts complexos do seu documento original.</p>
            </div>
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Criptografia Total</h3>
              <p className="text-sm text-slate-600">Seus arquivos são processados de forma segura e deletados após o download.</p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
        <p>&copy; 2025 TradutorPDF Pro. Desenvolvido por tecc.cloud.</p>
      </footer>
    </div>
  );
}