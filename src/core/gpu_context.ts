/**
 * WebGPU device context: wraps adapter / device / canvas configuration.
 */

export interface GpuContextOptions
{
    canvas: HTMLCanvasElement;
    /** Upper bound of device pixel ratio, avoids excessive resolution on HiDPI displays. */
    maxPixelRatio?: number;
}

export class GpuContext
{
    private readonly m_canvas: HTMLCanvasElement;
    private readonly m_adapter: GPUAdapter;
    private readonly m_device: GPUDevice;
    private readonly m_context: GPUCanvasContext;
    private readonly m_format: GPUTextureFormat;
    private readonly m_maxPixelRatio: number;

    private constructor(
        canvas: HTMLCanvasElement,
        adapter: GPUAdapter,
        device: GPUDevice,
        context: GPUCanvasContext,
        format: GPUTextureFormat,
        maxPixelRatio: number,
    )
    {
        this.m_canvas = canvas;
        this.m_adapter = adapter;
        this.m_device = device;
        this.m_context = context;
        this.m_format = format;
        this.m_maxPixelRatio = maxPixelRatio;
    }

    /** Initializes WebGPU, throws an error with a readable reason on failure. */
    static async Create(options: GpuContextOptions): Promise<GpuContext>
    {
        const { canvas, maxPixelRatio = 2 } = options;

        if (!navigator.gpu)
        {
            throw new Error(
                'WebGPU is not supported by this browser. Please use Chrome 113+ / Edge 113+, '
                + 'or enable the WebGPU feature flag in Safari.',
            );
        }

        const adapter = await navigator.gpu.requestAdapter({
            powerPreference: 'high-performance',
        });
        if (!adapter)
        {
            throw new Error('Failed to acquire a GPUAdapter. The GPU driver may not support WebGPU.');
        }

        const device = await adapter.requestDevice();
        device.lost.then((info) =>
        {
            console.error(`[leaf] WebGPU device lost: ${info.reason} - ${info.message}`);
        });

        const context = canvas.getContext('webgpu');
        if (!context)
        {
            throw new Error('Failed to acquire a webgpu context from the canvas.');
        }

        const format = navigator.gpu.getPreferredCanvasFormat();
        context.configure({
            device,
            format,
            alphaMode: 'opaque',
        });

        const gpuContext = new GpuContext(canvas, adapter, device, context, format, maxPixelRatio);
        gpuContext.Resize();
        return gpuContext;
    }

    /**
     * Syncs the canvas backing store with its CSS size and device pixel ratio.
     * @returns Whether the size actually changed.
     */
    Resize(): boolean
    {
        const ratio = Math.min(window.devicePixelRatio || 1, this.m_maxPixelRatio);
        const width = Math.max(1, Math.floor(this.m_canvas.clientWidth * ratio));
        const height = Math.max(1, Math.floor(this.m_canvas.clientHeight * ratio));

        if (this.m_canvas.width === width && this.m_canvas.height === height)
        {
            return false;
        }

        this.m_canvas.width = width;
        this.m_canvas.height = height;
        return true;
    }

    GetCurrentView(): GPUTextureView
    {
        return this.m_context.getCurrentTexture().createView();
    }

    GetDevice(): GPUDevice
    {
        return this.m_device;
    }

    GetFormat(): GPUTextureFormat
    {
        return this.m_format;
    }

    GetAdapter(): GPUAdapter
    {
        return this.m_adapter;
    }

    Destroy(): void
    {
        this.m_device.destroy();
    }
}
