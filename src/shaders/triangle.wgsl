// Colored triangle: vertex colors are interpolated by the rasterizer.
// Validates the full chain: WebGPU init -> pipeline -> render pass -> present.

struct VertexInput
{
    @location(0) position : vec2f,
    @location(1) color    : vec3f,
};

struct VertexOutput
{
    @builtin(position) clip_position : vec4f,
    @location(0)       color         : vec3f,
};

@vertex
fn vs_main(input : VertexInput) -> VertexOutput
{
    var output : VertexOutput;
    output.clip_position = vec4f(input.position, 0.0, 1.0);
    output.color = input.color;
    return output;
}

@fragment
fn fs_main(input : VertexOutput) -> @location(0) vec4f
{
    // Vertex colors are authored in linear space; apply an approximate
    // sRGB encode before writing to the canvas.
    let encoded = pow(input.color, vec3f(1.0 / 2.2));
    return vec4f(encoded, 1.0);
}
