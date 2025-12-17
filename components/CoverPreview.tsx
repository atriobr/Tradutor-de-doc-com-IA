import React from 'react';
import { ArrowLeft, Play, AlertTriangle } from 'lucide-react';

interface CoverPreviewProps {
    originalText: string;
    translatedText: string;
    fileName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function CoverPreview({ originalText, translatedText, fileName, onConfirm, onCancel }: CoverPreviewProps) {
    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Revisão da Capa</h2>
                <p className="text-slate-600">Verifique a qualidade da tradução da primeira página antes de continuar.</p>
                <p className="text-sm font-medium text-indigo-600 mt-2">{fileName}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Original */}
                <div className="flex flex-col">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 pl-1">Original</h3>
                    <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-[500px] overflow-y-auto custom-scrollbar">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed opacity-80">
                            {originalText || "Não foi possível extrair texto da primeira página."}
                        </p>
                    </div>
                </div>

                {/* Translated */}
                <div className="flex flex-col">
                    <h3 className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-3 pl-1">Traduzido (Preview)</h3>
                    <div className="flex-1 bg-indigo-50/50 rounded-xl border border-indigo-100 p-6 shadow-sm h-[500px] overflow-y-auto custom-scrollbar relative">
                        <p className="text-sm text-slate-800 whitespace-pre-wrap font-mono leading-relaxed">
                            {translatedText || "Tradução não disponível."}
                        </p>
                        <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-bold shadow-sm">
                            IA Gerada
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start">
                <AlertTriangle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">Nota importante:</p>
                    <p>Esta é apenas uma amostra da primeira página. O documento completo manterá a formatação original (imagens, tabelas, layout) no arquivo PDF final.</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={onCancel}
                    className="px-6 py-3 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Cancelar</span>
                </button>

                <button
                    onClick={onConfirm}
                    className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                    <Play className="w-5 h-5" />
                    <span>Aprovar e Traduzir Tudo</span>
                </button>
            </div>
        </div>
    );
}
