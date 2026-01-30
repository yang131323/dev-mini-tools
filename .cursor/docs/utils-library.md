# 工具与常量手册

## Utils 工具库 (`src/utils/`)
- `color.ts`: 颜色转换逻辑（数值转 RGB 等）。
- `common.ts`: 通用工具函数。
- `num.ts`: 数值处理。
- `pixel.ts`: 像素/单位转换。
- `type.ts`: 类型判断工具。

## Constants 常量 (`src/constants/`)
- `key.ts`: 存储键名等。
- `var.ts`: 全局变量。

## 使用建议
在实现新功能前，请先检查 `src/utils/` 下是否已有相关工具函数，严禁重复造轮子。
