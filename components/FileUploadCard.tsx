import React, { useRef, useState } from 'react';
import { FileData } from '../types';
import { UploadIcon, FileTextIcon, CameraIcon } from './Icons';

interface FileUploadCardProps {
  title: string;
  description: string;
  icon: 'report' | 'food';
  fileData: FileData | null;
  onFileSelect: (data: FileData) => void;
  accept: string;
}

export const FileUploadCard: React.FC<FileUploadCardProps> = ({ 
  title, 
  description, 
  icon, 
  fileData, 
  onFileSelect,
  accept
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const base64String = (e.target?.result as string).split(',')[1];
        onFileSelect({
            file,
            previewUrl: URL.createObjectURL(file),
            base64: base64String,
            mimeType: file.type
        });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const isPdf = fileData?.mimeType === 'application/pdf';

  return (
    <div className={`flex flex-col h-full ${isDragging ? 'ring-2 ring-cyan-400 rounded-3xl' : ''}`}>
      <div className="mb-4 px-1">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          {icon === 'report' ? <FileTextIcon className="text-cyan-400" /> : <CameraIcon className="text-cyan-400" />}
          {title}
        </h2>
        <p className="text-sm text-slate-400 mt-1">{description}</p>
      </div>

      <div 
        className="flex-grow relative group cursor-pointer"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={inputRef} 
          className="hidden" 
          accept={accept}
          onChange={handleChange}
        />
        
        <div className={`h-64 md:h-80 w-full rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center justify-center overflow-hidden relative
          ${fileData 
            ? 'border-cyan-500/50 bg-slate-900 shadow-inner' 
            : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-cyan-500/30'
          }`}
        >
          {fileData ? (
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                {isPdf ? (
                    <div className="flex flex-col items-center text-cyan-100 p-6 animate-in zoom-in duration-300">
                        <div className="w-20 h-20 mb-4 text-cyan-500 bg-cyan-950/30 rounded-2xl flex items-center justify-center border border-cyan-500/20">
                            <FileTextIcon className="w-10 h-10" />
                        </div>
                        <span className="font-semibold text-sm truncate max-w-[200px]">{fileData.file.name}</span>
                        <span className="text-xs text-slate-400 mt-1 uppercase tracking-wider">PDF Document</span>
                    </div>
                ) : (
                    <>
                        <img 
                          src={fileData.previewUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                    </>
                )}
                
                {!isPdf && (
                    <div className="absolute bottom-4 left-4 right-4">
                        <span className="inline-flex items-center text-xs bg-slate-900/90 text-cyan-200 px-3 py-1.5 rounded-full border border-cyan-500/30 backdrop-blur-md shadow-lg">
                            {fileData.file.name}
                        </span>
                    </div>
                )}
                
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-slate-900/80 p-2 rounded-full text-white border border-slate-700">
                        <UploadIcon className="w-4 h-4" />
                    </div>
                </div>
            </div>
          ) : (
            <div className="text-center p-6 transition-transform duration-300 group-hover:-translate-y-1">
              <div className="bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-slate-700 group-hover:scale-110 transition-all border border-slate-700 group-hover:border-cyan-500/30">
                <UploadIcon className="text-slate-400 w-8 h-8" />
              </div>
              <p className="text-slate-200 font-semibold text-lg">Click or Drag & Drop</p>
              <p className="text-sm text-slate-500 mt-2">
                 {icon === 'report' ? 'PDF or Image Reports' : 'JPG, PNG Photos'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};