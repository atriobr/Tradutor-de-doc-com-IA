import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export default function FileUploader({ onFileSelect }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndUpload(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const validateAndUpload = (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Por favor, selecione apenas arquivos PDF.');
      return;
    }
    // Limit to 50MB for demo purposes
    if (file.size > 50 * 1024 * 1024) {
      setError('O arquivo excede o limite de 50MB.');
      return;
    }
    onFileSelect(file);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div 
        className={`w-full max-w-lg h-64 border-3 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer relative
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50 scale-105' 
            : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input 
          type="file" 
          id="file-input" 
          className="hidden" 
          accept=".pdf" 
          onChange={handleFileInput}
        />
        
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
          {isDragging ? <FileText className="w-8 h-8 animate-bounce" /> : <UploadCloud className="w-8 h-8" />}
        </div>
        
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          {isDragging ? 'Solte o arquivo aqui' : 'Arraste & Solte seu PDF'}
        </h3>
        <p className="text-slate-500 text-center px-4">
          ou clique para selecionar do seu computador
        </p>
        
        {error && (
          <div className="absolute bottom-4 left-0 right-0 mx-auto w-max flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full border border-slate-200">
          Máx. 50MB
        </span>
        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full border border-slate-200">
          PDF apenas
        </span>
        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full border border-slate-200">
          Automate the Boring Stuff Compatible
        </span>
      </div>
    </div>
  );
}