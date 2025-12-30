
import React, { useRef, useState } from 'react';
import { FileData } from '../types';
import { UploadIcon, FileTextIcon, CameraIcon, XIcon } from './Icons';

interface FileUploadCardProps {
  title: string;
  description: string;
  icon: 'report' | 'food';
  files: FileData[];
  onFilesChange: (files: FileData[]) => void;
  accept: string;
}

export const FileUploadCard: React.FC<FileUploadCardProps> = ({ 
  title, 
  description, 
  icon, 
  files, 
  onFilesChange,
  accept
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (fileList: FileList | File[]) => {
    const newFiles: FileData[] = [];
    const filesArray = Array.from(fileList);
    let processedCount = 0;

    filesArray.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
          const base64String = (e.target?.result as string).split(',')[1];
          newFiles.push({
              file,
              previewUrl: URL.createObjectURL(file),
              base64: base64String,
              mimeType: file.type
          });
          processedCount++;
          
          if (processedCount === filesArray.length) {
            onFilesChange([...files, ...newFiles]);
          }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset value to allow selecting the same file again if needed
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = (indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    onFilesChange(updatedFiles);
  };

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
        className="flex-grow relative group"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={inputRef} 
          className="hidden" 
          accept={accept}
          onChange={handleChange}
          multiple
        />
        
        {files.length === 0 ? (
          // Empty State
          <div 
            onClick={() => inputRef.current?.click()}
            className={`h-64 md:h-80 w-full rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center justify-center cursor-pointer
              ${isDragging 
                ? 'border-cyan-500 bg-slate-900/80' 
                : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-cyan-500/30'
              }`}
          >
            <div className="text-center p-6 transition-transform duration-300 group-hover:-translate-y-1">
              <div className="bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-slate-700 group-hover:scale-110 transition-all border border-slate-700 group-hover:border-cyan-500/30">
                <UploadIcon className="text-slate-400 w-8 h-8" />
              </div>
              <p className="text-slate-200 font-semibold text-lg">Click or Drag & Drop</p>
              <p className="text-sm text-slate-500 mt-2">
                 {icon === 'report' ? 'Upload multiple pages/PDFs' : 'Upload multiple food angles'}
              </p>
            </div>
          </div>
        ) : (
          // Grid State with files
          <div className="h-64 md:h-80 w-full rounded-2xl bg-slate-900 border border-slate-700 p-4 overflow-y-auto custom-scrollbar">
             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {files.map((fileData, index) => {
                   const isPdf = fileData.mimeType === 'application/pdf';
                   return (
                     <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 bg-slate-800 group/item">
                        {isPdf ? (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-cyan-100">
                                <FileTextIcon className="w-8 h-8 text-cyan-500 mb-2" />
                                <span className="text-[10px] text-center w-full truncate px-1">{fileData.file.name}</span>
                            </div>
                        ) : (
                            <img src={fileData.previewUrl} className="w-full h-full object-cover" alt="preview" />
                        )}
                        
                        {/* Remove Button */}
                        <button 
                            onClick={(e) => removeFile(index, e)}
                            className="absolute top-1 right-1 bg-slate-950/80 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/item:opacity-100 transition-all"
                        >
                            <XIcon className="w-3 h-3" />
                        </button>
                     </div>
                   );
                })}

                {/* Add More Button */}
                <div 
                    onClick={() => inputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 transition-colors flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-cyan-400"
                >
                    <UploadIcon className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold uppercase">Add More</span>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
