/**
 * Colored triangle renderer -- the pipeline baseline of this project.
 * The upcoming PBR renderer will reuse the pipeline / pass organization here.
 */

import type { GpuContext } from '@/core/gpu_context';
import triangleShader from '@/shaders/triangle.wgsl?raw';

/** 5 floats per vertex: position(x, y) + color(r, g, b) */
const FLOATS_PER_VERTEX = 5;
const VERTEX_STRIDE = FLOATS_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT;
const COLOR_OFFSET = 2 * Float32Array.BYTES_PER_ELEMENT;

/** Triangle in NDC space, vertex colors are red / green / blue. */
const VERTEX_DATA = new Float32Array([
    //  x      y       r    g    b
    0.0, 0.75, 1.0, 0.0, 0.0,
    -0.75, -0.6, 0.0, 1.0, 0.0,
    0.75, -0.6, 0.0, 0.0, 1.0,
]);

const CLEAR_COLOR: GPUColorDict = { r: 0.02, g: 0.03, b: 0.05, a: 1.0 };

export class TriangleRenderer
{
    private readonly m_gpu: GpuContext;
    private readonly m_pipeline: GPURenderPipeline;
    private readonly m_vertexBuffer: GPUBuffer;

    constructor(gpu: GpuContext)
    {
        this.m_gpu = gpu;

        const device = gpu.GetDevice();
        const format = gpu.GetFormat();

        this.m_vertexBuffer = device.createBuffer({
            label: 'triangle-vertices',
            size: VERTEX_DATA.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(this.m_vertexBuffer, 0, VERTEX_DATA);

        const module = device.createShaderModule({
            label: 'triangle-shader',
            code: triangleShader,
        });

        this.m_pipeline = device.createRenderPipeline({
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
                            { shaderLocation: 1, offset: COLOR_OFFSET, format: 'float32x3' },
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

    Render(): void
    {
        const device = this.m_gpu.GetDevice();
        const encoder = device.createCommandEncoder({ label: 'triangle-encoder' });

        const pass = encoder.beginRenderPass({
            label: 'triangle-pass',
            colorAttachments: [
                {
                    view: this.m_gpu.GetCurrentView(),
                    clearValue: CLEAR_COLOR,
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
        });

        pass.setPipeline(this.m_pipeline);
        pass.setVertexBuffer(0, this.m_vertexBuffer);
        pass.draw(VERTEX_DATA.length / FLOATS_PER_VERTEX);
        pass.end();

        device.queue.submit([encoder.finish()]);
    }

    Destroy(): void
    {
        this.m_vertexBuffer.destroy();
    }
}
