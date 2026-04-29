## ADDED Requirements

### Requirement: 递归深层解析 JSON 字符串
系统 SHALL 提供 `deepParseJson(input: string): unknown` 函数，将输入字符串递归解析为多层 JSON 结构。

#### Scenario: 正常单层 JSON 字符串解析
- **WHEN** 输入为合法 JSON 字符串（如 `'{"a":1}'`）
- **THEN** 返回对应的 JavaScript 对象（`{ a: 1 }`）

#### Scenario: 多层嵌套 JSON 字符串解析
- **WHEN** 输入为 JSON 字符串，其中某个字段的值是另一个 JSON 字符串（如 `'{"data":"{\"b\":2}"}'`）
- **THEN** 返回结果中该字段被替换为递归解析后的对象（`{ data: { b: 2 } }`）

#### Scenario: 子层解析失败不影响父层
- **WHEN** 输入为合法 JSON，其中某个字段值是"看起来像 JSON"但格式错误的字符串（如 `'{"x":"{broken json}"}'`）
- **THEN** 父层正常返回对象，该字段值被替换为带错误标记的对象 `{ "__json_parse_error__": true, "message": "<原因>", "raw": "<原始字符串>" }`

#### Scenario: 普通字符串字段不标记错误
- **WHEN** 输入 JSON 中某字段值为普通字符串（如 `"hello world"`，不以 `{`/`[`/`"` 首尾配对）
- **THEN** 该字段保持原字符串值，不产生错误标记

#### Scenario: 顶层输入不是合法 JSON
- **WHEN** 输入字符串本身无法被 `JSON.parse` 解析
- **THEN** 返回 `{ "__json_parse_error__": true, "message": "<原因>", "raw": "<原始字符串>" }`

#### Scenario: 数组中的 JSON 字符串元素
- **WHEN** JSON 数组中某元素是 JSON 字符串
- **THEN** 该元素被递归替换为解析后的结构，失败时替换为错误标记对象

### Requirement: 识别"看起来像 JSON"的字符串
系统 SHALL 通过首尾字符配对规则识别疑似 JSON 的字符串，避免对普通字符串误标记错误。

#### Scenario: 识别对象型 JSON 字符串
- **WHEN** 字符串 trim 后以 `{` 开头且以 `}` 结尾
- **THEN** 视为疑似 JSON，尝试解析；失败时标记错误

#### Scenario: 识别数组型 JSON 字符串
- **WHEN** 字符串 trim 后以 `[` 开头且以 `]` 结尾
- **THEN** 视为疑似 JSON，尝试解析；失败时标记错误

#### Scenario: 识别字符串型 JSON 值
- **WHEN** 字符串 trim 后以 `"` 开头且以 `"` 结尾
- **THEN** 视为疑似 JSON，尝试解析；失败时标记错误

#### Scenario: 不识别普通字符串
- **WHEN** 字符串不符合上述任何模式（如 `"abc"`、`"123"`、`"true"`）
- **THEN** 不尝试解析，直接保留原值
