## Why

开发者在调试接口、日志或消息队列时，经常遇到多层嵌套 JSON 字符串（JSON stringify 了多次），用肉眼或普通工具难以逐层解析。需要一个在线工具，能自动递归解析所有层级，并以树形结构展示最终结果。

## What Changes

- 新增菜单项"在线JSON解析"，路由至独立页面
- 页面提供文本输入区域，用于粘贴待解析的 JSON 字符串
- 自动递归检测并解析所有嵌套的 JSON 字符串层
- 以可交互的树形/折叠视图展示解析后的 JSON 结构
- 子层解析失败时，在该节点显示解析错误原因，不影响父层及其他节点的展示

## Capabilities

### New Capabilities

- `json-deep-parser`: 核心解析逻辑，递归地将 JSON 字符串解析为多层 JSON 结构，子层失败时保留错误信息
- `json-viewer-page`: 在线 JSON 解析页面，包含输入区、解析触发、树形展示，集成 json-deep-parser 能力

### Modified Capabilities

## Impact

- `src/router/` — 新增路由配置，挂载 JSON 解析页面
- `src/views/` 或 `src/pages/` — 新增 JSON 解析页面目录
- `package.json` — 可能引入 JSON 树形展示相关社区组件（如 `vue-json-pretty` 或类似包）
