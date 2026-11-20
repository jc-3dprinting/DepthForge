import { useEffect, useRef } from 'react';

interface DepthCanvasProps {
  /** RGBA pixel data from the depth model. */
  data: Uint8ClampedArray;
  width: number;
  height: number;
  /** Constrain rendered height; width follows aspect ratio. */
  maxHeight?: number;
}

export default function DepthCanvas({ data, width, height, maxHeight = 420 }: DepthCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = new ImageData(new Uint8ClampedArray(data), width, height);
    canvas.width = width;
    canvas.height = height;
    ctx.putImageData(imageData, 0, 0);
  }, [data, width, height]);

  const aspect = width / height;
  const displayWidth = Math.round(maxHeight * aspect);

  return (
    <canvas
      ref={canvasRef}
      style={{ height: maxHeight, width: displayWidth }}
      className="rounded-xl bg-slate-900 object-contain"
    />
  );
}
