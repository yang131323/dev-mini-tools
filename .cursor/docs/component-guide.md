# 组件开发指南

## 标准组件结构
项目强制使用 `folder/index.tsx` + `index.scss` 的组织方式。

### 示例模板
```tsx
import { defineComponent } from 'vue';
import './index.scss';

export default defineComponent({
  name: 'ComponentName',
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  setup(props, { slots }) {
    return () => (
      <div class="component-name">
        <h1>{props.title}</h1>
        {slots.default?.()}
      </div>
    );
  }
});
```

## 开发规范
1.  **命名**: 组件文件夹使用 `kebab-case`，组件 `name` 和变量使用 `PascalCase`。
2.  **样式引入**: 必须在 `index.tsx` 中显式引入同级目录的 `index.scss`。
3.  **逻辑复用**: 优先使用 Composition API (Hooks) 提取公共逻辑。
