## 1. 安装依赖

- [x] 1.1 在 `package.json` 中安装 `vue-json-pretty` 包

## 2. 路由与菜单配置

- [x] 2.1 在 `src/routes/name.ts` 中新增 `JSON_PARSER_PAGE = "jsonParser"` 路由名常量
- [x] 2.2 在 `src/routes/index.ts` 中新增 `/json-parser` 路由，懒加载 `@/views/json-parser`
- [x] 2.3 在 `src/components/app/index.tsx` 的 `items` 数组中新增"在线JSON解析"菜单项

## 3. 核心解析工具函数

- [x] 3.1 创建 `src/views/json-parser/util.ts`，实现 `looksLikeJson(str: string): boolean` 辅助函数（首尾字符配对检测）
- [x] 3.2 在 `util.ts` 中实现 `deepParseJson(input: unknown): unknown` 递归解析函数，子层失败时返回 `__json_parse_error__` 标记对象

## 4. 页面实现

- [x] 4.1 创建 `src/views/json-parser/index.tsx`，包含输入区（`<textarea>` + 解析/清空按钮）和展示区骨架
- [x] 4.2 集成 `vue-json-pretty` 在展示区渲染解析结果，设置合适的初始展开深度
- [x] 4.3 实现错误节点的自定义渲染：对含 `__json_parse_error__` 的值以红色/警告样式高亮显示
- [x] 4.4 实现顶层解析失败时的错误提示展示（区别于子层错误）
- [x] 4.5 实现输入为空时的空状态提示
- [x] 4.6 创建 `src/views/json-parser/index.scss`，编写页面布局及错误节点样式
