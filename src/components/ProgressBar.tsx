import type { ProgressInfo } from '@/lib/depth';

interface ProgressBarProps {
  info: ProgressInfo | null;
}

export default function ProgressBar({ info }: ProgressBarProps) {
  if (!info) return null;

  const showBar = info.stage === 'downloading' || info.stage === 'running' || info.stage === 'done';
  const pct = info.progress !== null ? Math.round(info.progress * 100) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{info.message}</span>
        {info.stage === 'downloading' && pct !== null && (
          <span className="text-slate-500">{pct}%</span>
        )}
      </div>
      {showBar && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={[
              'h-full rounded-full transition-all duration-300',
              info.stage === 'done' ? 'bg-emerald-500' : 'bg-sky-500',
              info.progress === null && info.stage !== 'done' ? 'animate-pulse w-1/3' : '',
            ].join(' ')}
            style={{ width: info.progress !== null ? `${pct}%` : info.stage === 'done' ? '100%' : '33%' }}
          />
        </div>
      )}
    </div>
  );
}
