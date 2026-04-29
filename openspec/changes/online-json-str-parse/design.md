## Context

项目是一个 Vue 3 + TypeScript + Ant Design Vue 工具集，采用 TSX 风格的 `defineComponent` 编写页面，路由和菜单均集中管理。目前无 JSON 相关功能页面，也无 JSON 树形展示组件库。

## Goals / Non-Goals

**Goals:**
- 实现递归深层 JSON 字符串解析工具函数，子层失败时保留错误信息且不阻断父层
- 新增"在线JSON解析"页面，提供输入框和树形展示
- 集成 `vue-json-pretty` 进行可折叠的 JSON 树渲染
- 将新页面注册到路由与菜单

**Non-Goals:**
- 不支持编辑 JSON（只读展示）
- 不支持 JSON Schema 校验
- 不支持保存/分享解析结果
- 不对超大 JSON（>1MB）做特殊性能优化

## Decisions

### 1. 深层解析算法设计

将递归解析逻辑封装为纯函数 `deepParseJson(input: string): DeepParseResult`：

- **入口**：接受字符串，尝试 `JSON.parse`；失败则返回带顶层错误的结构
- **递归**：对解析成功的值，遍历对象/数组的每个叶子节点
  - 若叶子是字符串 → 再次尝试 `JSON.parse`；成功则替换为递归解析结果，失败则保持原字符串（非 JSON 字符串是正常情况，不标记错误）
  - 仅当一个值 **明确看起来像 JSON**（以 `{`/`[` 开头并以对应字符结尾，或以 `"` 包裹）但解析失败时，才标记解析错误
- **错误标记**：用特殊结构 `{ "__json_parse_error__": true, "message": "...", "raw": "..." }` 替换失败节点，解析器和视图都能识别该标记

**为何不直接对所有字符串尝试解析**：减少误报——普通字符串如 `"hello"` 不应标记为解析失败。判断"看起来像 JSON"的标准为：trim 后首字符为 `{`、`[`、`"` 且首尾字符配对。

### 2. JSON 树形展示组件选型

引入 `vue-json-pretty`（社区主流 Vue 3 JSON 树形展示库），理由：
- 支持折叠/展开、语法高亮、深度控制
- 纯展示组件，无副作用，体积轻量
- 对已有 `{ "__json_parse_error__": true }` 节点，通过自定义渲染插槽或外层 CSS 高亮显示错误样式

**备选 `@vue-flow/json-viewer`**：功能较少，社区活跃度低，不选。

### 3. 页面布局

左侧（或上方，移动端）：`<textarea>` 输入待解析字符串 + "解析"按钮  
右侧（或下方）：`vue-json-pretty` 树形展示区

布局形式参考现有 `image-watermark` 的左侧边栏 + 主内容区模式，但因为是文本工具，调整为上下分栏或左右各半。

### 4. 文件组织

```
src/views/json-parser/
  index.tsx          # 页面主文件
  index.scss         # 页面样式
  util.ts            # deepParseJson 工具函数（业务级，仅此页面使用）
```

`src/routes/name.ts` 新增 `JSON_PARSER_PAGE = "jsonParser"`  
`src/routes/index.ts` 新增路由  
`src/components/app/index.tsx` 的 `items` 数组新增菜单项

## Risks / Trade-offs

- **误判"看起来像 JSON"的边界条件** → 通过保守的首尾字符检测降低误报，不影响父层展示
- **vue-json-pretty 对 `__json_parse_error__` 节点无特殊样式** → 通过为该 key 的节点所在行添加 CSS 自定义颜色来标记；`vue-json-pretty` 支持 `renderNodeKey`/`renderNodeValue` 插槽覆盖渲染
- **包体积略增**（vue-json-pretty ≈ 30KB gzip）→ 工具站可接受，按需 import 即可
