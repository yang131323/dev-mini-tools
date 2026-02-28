<!--
Sync Impact Report
- Version change: N/A (template) → 1.0.0
- Modified principles: N/A (initial ratification)
- Added sections:
  - Core Principles（从占位符落地为可执行原则）
  - 质量门禁与发布策略
  - 开发流程与文档要求
  - Governance（从占位符落地为治理规则）
- Removed sections: None
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md（补全本仓库默认技术上下文）
  - ✅ .specify/templates/spec-template.md（无需修改）
  - ✅ .specify/templates/tasks-template.md（无需修改）
  - ✅ .cursor/commands/speckit.constitution.md（修正命令文件路径引用）
- Deferred TODOs: None
-->

# Web 提效小工具 (dev-mini-tool) Constitution

## Core Principles

### 1) 用户价值优先 & 工具可独立交付
- 每个工具/页面 MUST 明确“输入 → 输出”，并提供可用默认值与可理解的错误提示。
- 新增功能 MUST 以“单工具可独立使用”为最小交付单元（不依赖未完成的其他工具）。
- 任何复杂抽象（通用框架/过度复用）在没有至少 2 个真实复用点前 MUST 不引入。

### 2) 技术栈与工程约束统一（非协商）
- 前端 MUST 使用 `Vue 3 + TSX + Vite`；禁止引入 `.vue` 单文件组件。
- 状态管理与路由 MUST 复用现有方案（`Pinia`、`vue-router`）。
- 代码风格 MUST 遵循项目现有规范与工具链（`eslint` + `prettier`，2 空格缩进、单引号、分号）。
- 导入路径 MUST 优先使用别名（如 `@/`、`@store` 等），避免深层相对路径。

### 3) 类型安全 & 可维护性优先
- TypeScript 中严禁使用 `any`；公共导出（函数/变量）MUST 有显式类型声明。
- 单文件过长或逻辑嵌套过深时 MUST 原子化拆分（以可读性与可测试性为准绳）。
- 复用逻辑 MUST 下沉到 `src/utils/` 或可复用组件中；页面只保留编排与交互逻辑。

### 4) 结构一致性（降低心智负担）
- 新增工具页面 MUST 按目录组织：`src/views/<tool>/index.tsx` + `index.scss`。
- 公共 UI 组件 MUST 放在 `src/components/`；跨工具共享常量 MUST 放在 `src/constants/`。
- 目录与命名 MUST 符合项目约定（文件夹 kebab-case，组件 PascalCase）。

### 5) 本地优先、隐私安全、性能达标
- 涉及文件/图片/文档处理（如加水印、格式转换）默认 MUST 在本地完成；除非明确需求，否则禁止上传或外发数据。
- 可能阻塞 UI 的重计算/大文件处理 MUST 避免长时间占用主线程（必要时使用分片/异步/Worker）。
- 生产构建 MUST 可用（`vite build` 通过），并避免引入明显的性能退化（如无界循环、重复大计算）。

## 质量门禁与发布策略
- 合并前 MUST 通过：
  - `pnpm run lint`（格式 + 类型检查）
  - `pnpm run build`
- 新增依赖 MUST 有明确理由，并避免重复引入同类库（优先复用现有依赖）。
- 发布版本（`package.json`）遵循 SemVer：
  - PATCH：修复/小改动且不影响既有行为
  - MINOR：新增工具或向后兼容的能力扩展
  - MAJOR：破坏性变更（路由/对外行为/核心交互不兼容）

## 开发流程与文档要求
- 新增工具 MUST 同步更新入口与导航（按项目现有路由/菜单组织方式）。
- 若新增工具对使用方式有学习成本，MUST 在 `README.md` 或 `.cursor/docs/` 增补说明。
- 在动手实现前，优先查阅 `.cursor/docs/README.md` 索引，避免重复造轮子。

## Governance
- 本宪章对本仓库内所有代码与脚本具有最高约束力；与其冲突的约定以本宪章为准。
- 修订流程（必须）：
  - 以 PR 形式提交，PR 描述 MUST 包含：变更动机、影响范围、迁移/兼容策略（如适用）。
  - 宪章版本号 MUST 按 SemVer 递增（删除/重定义原则或治理规则 → MAJOR；新增原则/章节 → MINOR；措辞澄清 → PATCH）。
- 合规审查（Review Checklist）：
  - 是否符合“技术栈统一/类型安全/结构一致性”三项硬约束？
  - 是否满足“本地优先与隐私安全”要求（特别是文件处理类工具）？
  - 是否通过质量门禁（lint + build）？

**Version**: 1.0.0 | **Ratified**: 2026-02-28 | **Last Amended**: 2026-02-28
