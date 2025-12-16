import React, { useEffect, useState } from 'react';
import { Download, CheckCircle, ArrowLeft, FileText, Shield } from 'lucide-react';

interface ResultViewProps {
  fileName: string;
  originalSize: string;
  resultBlob: Blob;
  resultText?: string;
  onReset: () => void;
}

export default function ResultView({ fileName, originalSize, resultBlob, resultText, onReset }: ResultViewProps) {
  // Construct a new filename for the translated version
  const translatedFileName = fileName.replace('.pdf', '_PT-BR.pdf');
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  useEffect(() => {
    if (resultBlob) {
      const url = URL.createObjectURL(resultBlob);
      setDownloadUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [resultBlob]);

  const handleDownload = () => {
    if (!downloadUrl) return;

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = translatedFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 w-full bg-gradient-to-b from-white to-indigo-50/30">
      <div className="w-full max-w-lg text-center space-y-6">

        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Tradução Concluída!</h2>
          <p className="text-slate-600">Seu documento foi traduzido com sucesso para Português.</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          {resultText && (
            <div className="mb-6 text-left">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 sticky top-0 bg-white">Pré-visualização do Texto Traduzido</h4>
              <div className="bg-slate-50 p-4 rounded-lg max-h-40 overflow-y-auto custom-scrollbar border border-slate-100">
                <p className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                  {resultText.slice(0, 600)}
                  {resultText.length > 600 ? '...' : ''}
                </p>
              </div>
            </div>
          )}

          <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 flex items-center text-left">
            <div className="bg-red-50 p-3 rounded-lg mr-4">
              <FileText className="w-8 h-8 text-red-500" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="font-semibold text-slate-900 truncate" title={translatedFileName}>
                {translatedFileName}
              </h4>
              <div className="flex items-center text-xs text-slate-500 mt-1 space-x-2">
                <span>PDF</span>
                <span>•</span>
                <span>{originalSize} (aprox.)</span>
                <span>•</span>
                <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded">PT-BR</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              onClick={handleDownload}
            >
              <Download className="w-5 h-5" />
              <span>Baixar PDF Traduzido</span>
            </button>

            <button
              onClick={onReset}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-6 rounded-xl border border-slate-200 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Traduzir outro arquivo</span>
            </button>
          </div>

          <div className="pt-6 border-t border-slate-200 mt-6">
            <div className="flex items-center justify-center text-slate-400 text-xs space-x-1">
              <Shield className="w-3 h-3" />
              <span>O arquivo gerado é local e seguro.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}