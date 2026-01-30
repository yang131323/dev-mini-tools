# 架构深度解析

## 技术栈
- **框架**: Vue 3 (Composition API)
- **渲染**: TSX/JSX (禁止使用 `.vue` 模板)
- **构建**: Vite
- **UI 组件库**: Ant Design Vue
- **样式**: Sass (SCSS)
- **状态/持久化**: `@isq/storage` (用于本地存储)

## 核心流程
- **路由管理**: 位于 `src/routes/`，采用配置化路由。
- **构建逻辑**: `vite.config.ts` 分为 `getDevConfig` 和 `getProdConfig`，配置了丰富的路径别名（Alias）。
- **静态资源**: 样式变量定义在 `src/style/var.scss`，全局样式在 `src/style/index.scss`。

## 路径别名 (Alias)
- `@`: `src`
- `@components`: `src/components`
- `@utils`: `src/utils`
- `@router`: `src/routes`
- `@const`: `src/constants`
