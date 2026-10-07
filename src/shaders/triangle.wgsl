// 彩色三角形：顶点色经光栅化插值后输出。
// 用于验证 WebGPU 初始化 → 管线创建 → 渲染通道 → 呈现 的完整链路。

struct VertexInput {
  @location(0) position : vec2f,
  @location(1) color    : vec3f,
};

struct VertexOutput {
  @builtin(position) clip_position : vec4f,
  @location(0)       color         : vec3f,
};

@vertex
fn vs_main(input : VertexInput) -> VertexOutput {
  var output : VertexOutput;
  output.clip_position = vec4f(input.position, 0.0, 1.0);
  output.color = input.color;
  return output;
}

@fragment
fn fs_main(input : VertexOutput) -> @location(0) vec4f {
  // 顶点色在线性空间定义，输出到 sRGB 画布前做一次近似编码。
  let encoded = pow(input.color, vec3f(1.0 / 2.2));
  return vec4f(encoded, 1.0);
}
