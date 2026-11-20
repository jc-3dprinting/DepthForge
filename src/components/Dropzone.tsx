import { useCallback, useRef, useState } from 'react';
import { UploadCloud, ImageIcon } from 'lucide-react';

interface DropzoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function Dropzone({ onFile, disabled }: DropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!ACCEPTED.includes(file.type.toLowerCase())) {
        return;
      }
      onFile(file);
    },
    [onFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (disabled) return;
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) inputRef.current?.click();
      }}
      className={[
        'group relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed',
        'px-6 py-16 text-center cursor-pointer transition-colors duration-200 select-none',
        dragging
          ? 'border-sky-400 bg-sky-50'
          : 'border-slate-300 bg-slate-50 hover:border-sky-300 hover:bg-sky-50/50',
        disabled ? 'opacity-50 pointer-events-none' : '',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-600 transition-transform group-hover:scale-105">
        <UploadCloud className="h-7 w-7" />
      </div>
      <div>
        <p className="text-base font-medium text-slate-800">Drop an image here or click to browse</p>
        <p className="mt-1 text-sm text-slate-500">JPG, JPEG, PNG, or WEBP</p>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <ImageIcon className="h-3.5 w-3.5" />
        <span>Photos stay on your device</span>
      </div>
    </div>
  );
}
