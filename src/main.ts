/** Application entry point: initializes WebGPU and drives the render loop. */

import { GpuContext } from '@/core/gpu_context';
import { TriangleRenderer } from '@/renderer/triangle_renderer';

const canvas = document.querySelector<HTMLCanvasElement>('#leaf-canvas');
const overlay = document.querySelector<HTMLDivElement>('#overlay');

function ShowError(message: string): void
{
    if (!overlay)
    {
        return;
    }

    overlay.classList.add('visible', 'error');
    overlay.innerHTML = `<h1>Leaf</h1><p>${message}</p>`;
}

async function Bootstrap(): Promise<void>
{
    if (!canvas)
    {
        throw new Error('Canvas element #leaf-canvas was not found.');
    }

    const gpu = await GpuContext.Create({ canvas });
    const renderer = new TriangleRenderer(gpu);

    overlay?.classList.remove('visible');
    console.info('[leaf] WebGPU ready, canvas format:', gpu.GetFormat());

    const Frame = (): void =>
    {
        gpu.Resize();
        renderer.Render();
        requestAnimationFrame(Frame);
    };
    requestAnimationFrame(Frame);
}

Bootstrap().catch((err: unknown) =>
{
    const message = err instanceof Error ? err.message : String(err);
    console.error('[leaf] Initialization failed:', err);
    ShowError(message);
});
