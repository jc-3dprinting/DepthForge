import { useMemo } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  maxHeight?: number;
}

export default function ImagePreview({ src, maxHeight = 420 }: ImagePreviewProps) {
  const aspect = useMemo(() => {
    // Use natural sizing via object-contain; aspect handled by CSS.
    return undefined;
  }, []);

  void aspect;

  return (
    <div
      className="flex items-center justify-center rounded-xl bg-slate-900"
      style={{ minHeight: maxHeight }}
    >
      <img
        src={src}
        alt="Original upload"
        style={{ maxHeight }}
        className="max-h-full max-w-full rounded-xl object-contain"
      />
    </div>
  );
}

interface PlaceholderProps {
  label: string;
}

export function PreviewPlaceholder({ label }: PlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400" style={{ minHeight: 280 }}>
      <ImageIcon className="h-8 w-8" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
