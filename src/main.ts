/** 应用入口：初始化 WebGPU 并驱动渲染循环。 */

import { GpuContext } from '@/core/gpu_context';
import { TriangleRenderer } from '@/renderer/triangle_renderer';

const canvas = document.querySelector<HTMLCanvasElement>('#leaf-canvas');
const overlay = document.querySelector<HTMLDivElement>('#overlay');

function showError(message: string): void {
  if (!overlay) return;
  overlay.classList.add('visible', 'error');
  overlay.innerHTML = `<h1>Leaf</h1><p>${message}</p>`;
}

async function bootstrap(): Promise<void> {
  if (!canvas) throw new Error('找不到 #leaf-canvas 元素。');

  const gpu = await GpuContext.create({ canvas });
  const renderer = new TriangleRenderer(gpu);

  overlay?.classList.remove('visible');
  console.info('[leaf] WebGPU 就绪，画布格式:', gpu.format);

  const frame = (): void => {
    gpu.resize();
    renderer.render();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

bootstrap().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('[leaf] 初始化失败:', err);
  showError(message);
});
