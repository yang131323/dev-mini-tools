## ADDED Requirements

### Requirement: 新增"在线JSON解析"菜单项
系统 SHALL 在应用顶部导航菜单中新增"在线JSON解析"条目，点击后跳转到对应页面。

#### Scenario: 菜单项可见并可点击
- **WHEN** 用户访问应用的任意页面
- **THEN** 顶部导航菜单中 SHALL 显示"在线JSON解析"条目

#### Scenario: 点击菜单导航到解析页面
- **WHEN** 用户点击"在线JSON解析"菜单项
- **THEN** 页面跳转到 `/json-parser` 路由，对应 JSON 解析页面

### Requirement: 输入区域
页面 SHALL 提供文本输入区域，用于粘贴待解析的 JSON 字符串。

#### Scenario: 粘贴 JSON 字符串
- **WHEN** 用户在输入框中粘贴或输入文本
- **THEN** 文本被记录并显示在输入框中

#### Scenario: 点击解析按钮
- **WHEN** 用户输入内容后点击"解析"按钮
- **THEN** 系统调用 `deepParseJson` 对输入内容进行解析，并将结果展示在展示区

#### Scenario: 清空输入
- **WHEN** 用户点击"清空"按钮
- **THEN** 输入框内容清空，展示区恢复初始状态

### Requirement: JSON 树形展示
页面 SHALL 使用 `vue-json-pretty` 以可折叠树形结构展示解析结果。

#### Scenario: 正常 JSON 展示
- **WHEN** 解析成功
- **THEN** 展示区以树形结构渲染 JSON，支持节点折叠/展开

#### Scenario: 错误节点高亮展示
- **WHEN** 解析结果中包含 `__json_parse_error__` 标记的节点
- **THEN** 该节点以醒目的错误样式（如红色/警告色）展示，并显示 `message` 字段描述的错误原因

#### Scenario: 输入为空时不展示结果区
- **WHEN** 用户未输入任何内容或清空后
- **THEN** 展示区显示空状态提示，不显示空的树形结构

### Requirement: 顶层解析失败提示
当顶层输入字符串无法解析为 JSON 时，页面 SHALL 以明显方式提示用户输入内容有误。

#### Scenario: 顶层解析失败显示错误提示
- **WHEN** 用户输入无法解析的字符串并点击解析
- **THEN** 展示区显示错误信息，说明顶层 JSON 解析失败及原因，而非显示空树
