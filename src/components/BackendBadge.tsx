import { Cpu, Zap } from 'lucide-react';
import type { Backend } from '@/lib/depth';

interface BackendBadgeProps {
  backend: Backend | null;
}

export default function BackendBadge({ backend }: BackendBadgeProps) {
  if (!backend) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
        <Cpu className="h-3.5 w-3.5" />
        Backend: detecting
      </span>
    );
  }

  const isWebGPU = backend === 'webgpu';
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
        isWebGPU
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-amber-100 text-amber-700',
      ].join(' ')}
    >
      {isWebGPU ? <Zap className="h-3.5 w-3.5" /> : <Cpu className="h-3.5 w-3.5" />}
      Backend: {isWebGPU ? 'WebGPU' : 'WASM'}
    </span>
  );
}
