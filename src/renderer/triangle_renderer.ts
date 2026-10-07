/**
 * 彩色三角形渲染器 —— 项目的链路验证基线。
 * 后续 PBR 渲染器将复用此处的 pipeline / pass 组织方式。
 */

import type { GpuContext } from '@/core/gpu_context';
import triangleShader from '@/shaders/triangle.wgsl?raw';

/** 每个顶点 5 个 float：position(x, y) + color(r, g, b) */
const FLOATS_PER_VERTEX = 5;
const VERTEX_STRIDE = FLOATS_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT;

/** NDC 坐标下的三角形，顶点色为红/绿/蓝 */
const VERTEX_DATA = new Float32Array([
  //  x     y      r    g    b
   0.0,  0.75,   1.0, 0.0, 0.0,
  -0.75, -0.6,   0.0, 1.0, 0.0,
   0.75, -0.6,   0.0, 0.0, 1.0,
]);

const CLEAR_COLOR: GPUColorDict = { r: 0.02, g: 0.03, b: 0.05, a: 1.0 };

export class TriangleRenderer {
  private readonly gpu: GpuContext;
  private readonly pipeline: GPURenderPipeline;
  private readonly vertexBuffer: GPUBuffer;

  constructor(gpu: GpuContext) {
    this.gpu = gpu;
    const { device, format } = gpu;

    this.vertexBuffer = device.createBuffer({
      label: 'triangle-vertices',
      size: VERTEX_DATA.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(this.vertexBuffer, 0, VERTEX_DATA);

    const module = device.createShaderModule({
      label: 'triangle-shader',
      code: triangleShader,
    });

    this.pipeline = device.createRenderPipeline({
      label: 'triangle-pipeline',
      layout: 'auto',
      vertex: {
        module,
        entryPoint: 'vs_main',
        buffers: [
          {
            arrayStride: VERTEX_STRIDE,
            attributes: [
              { shaderLocation: 0, offset: 0, format: 'float32x2' },
              { shaderLocation: 1, offset: 2 * 4, format: 'float32x3' },
            ],
          },
        ],
      },
      fragment: {
        module,
        entryPoint: 'fs_main',
        targets: [{ format }],
      },
      primitive: {
        topology: 'triangle-list',
        cullMode: 'none',
      },
    });
  }

  render(): void {
    const { device } = this.gpu;
    const encoder = device.createCommandEncoder({ label: 'triangle-encoder' });

    const pass = encoder.beginRenderPass({
      label: 'triangle-pass',
      colorAttachments: [
        {
          view: this.gpu.currentView,
          clearValue: CLEAR_COLOR,
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    });

    pass.setPipeline(this.pipeline);
    pass.setVertexBuffer(0, this.vertexBuffer);
    pass.draw(VERTEX_DATA.length / FLOATS_PER_VERTEX);
    pass.end();

    device.queue.submit([encoder.finish()]);
  }

  destroy(): void {
    this.vertexBuffer.destroy();
  }
}
