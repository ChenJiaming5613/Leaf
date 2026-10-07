# Leaf

A glTF 2.0 physically-based renderer built on **WebGPU** and **TypeScript**.

参考 Khronos 官方 [glTF-Sample-Renderer](https://github.com/KhronosGroup/glTF-Sample-Renderer) 的实现思路，
将其 GLSL 渲染管线移植到 WebGPU / WGSL。

## 当前状态

> 🌱 v0.1 — 链路验证阶段：彩色三角形已跑通（WebGPU 初始化 → 管线 → 渲染通道 → 呈现）。

## 运行要求

WebGPU 需要较新的浏览器：

| 浏览器 | 版本要求 |
| --- | --- |
| Chrome / Edge | 113+ |
| Safari | 18+（或 Technology Preview） |
| Firefox | 141+ |

## 快速开始

```bash
# 克隆（含官方测试资产 submodule）
git clone --recursive git@github.com:ChenJiaming5613/Leaf.git
cd Leaf

# 若忘记 --recursive
git submodule update --init --depth 1

pnpm install
pnpm dev
```

## 脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动开发服务器（WGSL 支持热重载） |
| `pnpm build` | 类型检查 + 生产构建 |
| `pnpm preview` | 预览构建产物 |
| `pnpm typecheck` | 仅做类型检查 |

## 目录结构

```
src/
├── core/        # WebGPU 设备、画布配置、资源封装
├── gltf/        # glTF 解析：JSON + bin → 内存数据模型
├── renderer/    # 渲染管线、render pass、bind group 组织
├── scene/       # 场景图、相机、变换
├── ibl/         # 环境光照预计算（irradiance / prefiltered / BRDF LUT）
├── shaders/     # WGSL 着色器
└── utils/
public/assets/   # 运行时资源
vendor/          # submodule：官方测试资产
docs/            # 设计笔记
```

## 代码规范

| 对象 | 规范 | 示例 |
| --- | --- | --- |
| 文件名 | `snake_case` | `gltf_loader.ts`, `pbr_material.ts` |
| 类 / 接口 | `PascalCase` | `GltfLoader`, `PbrMaterial` |
| 函数 / 变量 | `camelCase` | `createBindGroup()` |
| 常量 | `UPPER_SNAKE_CASE` | `MAX_LIGHT_COUNT` |
| WGSL 文件 / 函数 | `snake_case` | `pbr.wgsl`, `fn compute_brdf()` |

与 Khronos 官方保持一致（参考其 `ibl_sampler.js`、`material_info.glsl`）。

## 路线图

- [x] WebGPU 初始化与彩色三角形
- [x] GitHub Pages 自动部署
- [ ] glTF 2.0 解析（.gltf / .glb）
- [ ] 场景图与轨道相机
- [ ] metallic-roughness PBR 材质
- [ ] 法线 / 遮蔽 / 自发光贴图
- [ ] IBL 环境光照
- [ ] Tone mapping

## 许可

MIT
