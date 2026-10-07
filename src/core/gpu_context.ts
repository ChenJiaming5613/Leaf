/**
 * WebGPU 设备上下文：封装 adapter / device / canvas 配置。
 */

export interface GpuContextOptions {
  canvas: HTMLCanvasElement;
  /** 画布像素比上限，避免高 DPI 屏下分辨率过高 */
  maxPixelRatio?: number;
}

export class GpuContext {
  readonly canvas: HTMLCanvasElement;
  readonly adapter: GPUAdapter;
  readonly device: GPUDevice;
  readonly context: GPUCanvasContext;
  readonly format: GPUTextureFormat;

  private readonly maxPixelRatio: number;

  private constructor(
    canvas: HTMLCanvasElement,
    adapter: GPUAdapter,
    device: GPUDevice,
    context: GPUCanvasContext,
    format: GPUTextureFormat,
    maxPixelRatio: number,
  ) {
    this.canvas = canvas;
    this.adapter = adapter;
    this.device = device;
    this.context = context;
    this.format = format;
    this.maxPixelRatio = maxPixelRatio;
  }

  /** 初始化 WebGPU，失败时抛出带有可读原因的错误。 */
  static async create(options: GpuContextOptions): Promise<GpuContext> {
    const { canvas, maxPixelRatio = 2 } = options;

    if (!navigator.gpu) {
      throw new Error(
        '当前浏览器不支持 WebGPU。请使用 Chrome 113+ / Edge 113+，或在 Safari 中开启 WebGPU 特性开关。',
      );
    }

    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: 'high-performance',
    });
    if (!adapter) {
      throw new Error('未能获取 GPUAdapter，可能是显卡驱动不支持或浏览器禁用了 WebGPU。');
    }

    const device = await adapter.requestDevice();
    device.lost.then((info) => {
      console.error(`[leaf] WebGPU device lost: ${info.reason} - ${info.message}`);
    });

    const context = canvas.getContext('webgpu');
    if (!context) {
      throw new Error('无法从 canvas 获取 webgpu 上下文。');
    }

    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
      device,
      format,
      alphaMode: 'opaque',
    });

    const ctx = new GpuContext(canvas, adapter, device, context, format, maxPixelRatio);
    ctx.resize();
    return ctx;
  }

  /** 按 CSS 尺寸与设备像素比同步画布后备缓冲区尺寸。返回是否发生了变化。 */
  resize(): boolean {
    const ratio = Math.min(window.devicePixelRatio || 1, this.maxPixelRatio);
    const width = Math.max(1, Math.floor(this.canvas.clientWidth * ratio));
    const height = Math.max(1, Math.floor(this.canvas.clientHeight * ratio));

    if (this.canvas.width === width && this.canvas.height === height) {
      return false;
    }
    this.canvas.width = width;
    this.canvas.height = height;
    return true;
  }

  get currentView(): GPUTextureView {
    return this.context.getCurrentTexture().createView();
  }

  destroy(): void {
    this.device.destroy();
  }
}
