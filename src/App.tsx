import { useCallback, useEffect, useRef, useState } from 'react';
import { Boxes, RotateCcw, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';
import Dropzone from '@/components/Dropzone';
import BackendBadge from '@/components/BackendBadge';
import ProgressBar from '@/components/ProgressBar';
import DepthCanvas from '@/components/DepthCanvas';
import ImagePreview, { PreviewPlaceholder } from '@/components/ImagePreview';
import {
  runDepthEstimation,
  type ProgressInfo,
  type DepthResult,
  type Backend,
} from '@/lib/depth';

const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [depth, setDepth] = useState<DepthResult | null>(null);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [backend, setBackend] = useState<Backend | null>(null);

  const objectUrlRef = useRef<string | null>(null);

  // Revoke any object URL when it is replaced or on unmount.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!ACCEPTED.includes(file.type.toLowerCase())) {
      setError('Unsupported file type. Please use JPG, PNG, or WEBP.');
      return;
    }

    // Clean up previous image URL.
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;

    setImageUrl(url);
    setDepth(null);
    setError(null);
    setBusy(true);
    setBackend(null);
    setProgress({ stage: 'initializing', progress: null, message: 'Initializing AI model', backend: null });

    try {
      const result = await runDepthEstimation(url, (info) => {
        setProgress(info);
        if (info.backend) setBackend(info.backend);
      });
      setDepth(result);
      setBackend(result.backend);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Depth estimation failed: ${msg}`);
      setProgress({
        stage: 'error',
        progress: null,
        message: 'Model loading or inference failed',
        backend: null,
        error: msg,
      });
    } finally {
      setBusy(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setImageUrl(null);
    setDepth(null);
    setError(null);
    setProgress(null);
    setBackend(null);
    setBusy(false);
  }, []);

  const stage = progress?.stage ?? 'idle';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">DepthForge</h1>
              <p className="text-xs text-slate-500">In-browser image-to-depth estimation</p>
            </div>
          </div>
          <BackendBadge backend={backend} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {!imageUrl && (
          <section className="mx-auto max-w-2xl">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Turn a photo into a depth map
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Upload an image and a real AI model runs entirely in your browser to estimate
                per-pixel depth. No photo leaves your device.
              </p>
            </div>
            <Dropzone onFile={handleFile} disabled={busy} />
            {error && <ErrorBanner message={error} />}
          </section>
        )}

        {imageUrl && (
          <section className="space-y-6">
            {/* Status / progress row */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <ProgressBar info={progress} />
              {error && <ErrorBanner message={error} />}
              {stage === 'done' && !error && (
                <div className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Depth map generated with {backend === 'webgpu' ? 'WebGPU' : 'WASM'}
                </div>
              )}
            </div>

            {/* Side-by-side preview */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Panel title="Original Image" icon={<Layers className="h-4 w-4" />}>
                <ImagePreview src={imageUrl} />
              </Panel>
              <Panel title="Generated Depth Map" icon={<Boxes className="h-4 w-4" />}>
                {depth ? (
                  <DepthCanvas data={depth.data} width={depth.width} height={depth.height} />
                ) : (
                  <PreviewPlaceholder label={busy ? 'Estimating depth…' : 'No depth map yet'} />
                )}
              </Panel>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end">
              <button
                onClick={handleReset}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Upload another image
              </button>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-slate-400">
          Powered by Depth Anything V2 (Small) running locally via Transformers.js.
        </div>
      </footer>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span className="text-sky-500">{icon}</span>
        {title}
      </div>
      <div className="flex items-center justify-center">{children}</div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export default App;
