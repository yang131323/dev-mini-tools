# 流程层规则 (Process Flow)

## 1. Store状态管理流程

### 1.1 Store模块组织

```
store/
├── index.ts              # Store入口，导出所有store
├── modules/              # Store按照业务/功能模块化
```

### 1.2 Store开发规范

```typescript
// Store定义模板
export const use[ModuleName]Store = defineStore('[moduleName]', () => {
  // 1. 状态定义
  const state = ref<StateType>(initialState);

  // 2. 计算属性
  const computedValue = computed(() => {
    // 计算逻辑
  })

  // 3. 异步操作
  async function asyncAction(params: ParamsType) {
    try {
      // 异步逻辑
    } catch (error) {
      // 错误处理
    }
  }

  // 4. 同步操作
  function syncAction(data: DataType) {
    // 同步逻辑
  }

  return {
    // 状态
    state,
    // 计算属性
    computedValue,
    // 状态和方法之间空一行

    // 方法
    asyncAction,
    syncAction
  }
})
```

### 1.3 Store使用规范

```typescript
// 在组件中使用store
import { useUserStore } from "@/store";

const userStore = useUserStore();

// 调用方法
async function handleLogin() {
  await userStore.login(loginForm);
}
```

## 2. Router路由管理流程

### 2.1 新增路由规范

- 新的业务模块单独新建个文件（路由模块）
- 路由名称不进行硬编码，使用常量统一在一个地方进行管理，方便各使用场景进行按需引入
- 路由名称常量按模块拆分，每个模块单独文件管理（模块和路由对应），便于维护和扩展
- 每个路由常量名称上方必须添加中文说明注释

```typescript
// 场景一：同个文件使用多个（超3个）同一个模块路由名称
// 导入方式：使用 * as 导入整个模块
import * as BaseRouteNames from "@router/router-name/base";
import * as AppDetailRouteNames from "@router/router-name/appDetail";

// 使用方式：moduleName.ROUTE_NAME
BaseRouteNames.DETAIL;
AppDetailRouteNames.APP_LIST;

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: BaseRouteNames.HOME,
    component: () => import("@/views/page"),
    meta: {
      title: "首页",
    },
  },
  {
    path: "/user/:id",
    name: AppDetailRouteNames.APP_DETAIL,
    component: () => import("@/views/page-a"),
  },
];

// 场景二：同个文件仅使用1、2个模块路由一个名称
import { HOME } from "@router/router-name/module";

// 使用
HOME;
```

### 2.2 路由名称常量文件结构

路由名称常量按模块拆分，每个模块单独文件管理：

```
src/router/router-name/
├── base.ts              # 基础路由名称常量
├── appList.ts           # 应用列表模块路由名称常量
└── appDetail.ts         # 应用详情模块路由名称常量
```

每个路由名称常量文件格式：

```typescript
// ROUTE_NAME名称说明
export const ROUTE_NAME = "route-name";

// ANOTHER_ROUTE_NAME说明
export const ANOTHER_ROUTE_NAME = "another-route-name";
```

## 3. API接口流程

### 3.1 API组织

- 按照业务场景进行分模块，同一个业务场景的接口统一放在一个模块管理
- 同一个模块的Api放在一个地方进行管理
- Api和

示例如下：

```typescript
// API类定义模板
export class [ModuleName]Api {
  // 该模块的所有Api
  static Api = {
    /** 该接口的jsdoc注释 */
    get: '/api/xxx/'
  }

  constructor(private http: HttpClient) {}

  // action表示相关操作：add、del、update等
  async [action][ResourceName]xxx(params: Params): Promise<ApiResponse<ListData>> {
    return this.http.get('/api/[resource]/xxx', { params });
  }
}
```

### 3.2 API使用规范

```typescript
// 在组件中使用API
import { api } from "@/api";

async function fetchData() {
  try {
    // 根据当前接口使用场景判断是否需要loading
    loading.value = true;
    // 结构获取server返回的code、message、data
    const { code, data, message } =
      await api.RateLimit.getRateLimitList(params);
    // 先判断接口响应状态
    if (code != 0) throw new Error(message);

    // 再处理数据
    data.value = data.list;
  } catch (error) {
    // catch部分打印错误日志
    console.error("获取数据失败:", error);
  } finally {
    // 如果使用loading，loading状态的处理放在finally部分
    loading.value = false;
  }
}
```

## 4. 组件开发流程

### 4.1 组件结构规范

#### 4.1.1 jsx组件

```tsx
import { defineComponent } from "vue"

const FileList = defineComponent({
    name: "ComponentName",
    props: {
      // props定义
    },
    emits: {
      // emits定义
    },
    setup(props) {
        // 常量
        // 响应式状态
        // hook
        // computed
        // watch
        // 组件相关逻辑：事件处理器、函数等
        // vue组件声明周期hook

        // 不直接返回渲染函数，提取为render函数
        return render;

        function render() {
            return (
              // 组件实现
            )
        }

        // render使用的其他renderFn
    }
});
```

### 4.2 组件通信规范

#### 4.2.1 Emit定义

```typescript
// Emits接口定义
interface Emits {
  (e: "update:name", value: string): void;
  (e: "delete", id: number): void;
  (e: "save"): void;
}

// Emits定义
const emit = defineEmits<Emits>();

// 触发事件
function handleUpdateName(newName: string) {
  emit("update:name", newName);
}

function handleDelete(id: number) {
  emit("delete", id);
}
```

#### 4.2.2 父子组件通信

```typescript
// 父组件
<template>
  <ChildComponent
    :data="parentData"
    @update="handleUpdate"
  />
</template>

<script setup lang="ts">
const parentData = ref<DataType[]>([])

function handleUpdate(newData: DataType[]) {
  parentData.value = newData
}
</script>

// 子组件
<script setup lang="ts">
interface Props {
  data: DataType[]
}

interface Emits {
  (e: 'update', value: DataType[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleClick() {
  emit('update', newData)
};
</script>
```

## 5. 常量管理流程

### 5.1 常量文件组织

```
constants/
├── index.ts          # 常量入口
├── [module].ts       # 按业务场景 / 功能划分的模块
└── var.ts            # 全局变量，没有明确的业务场景 / 功能界限，一般是整个项目共用
```

### 5.2 常量定义规范

````typescript
// 枚举常量
export enum OrderStatus {
  /** 该枚举值jsdoc注释，值使用PascalCase */
  Pending = 'pending',
}

// 普通js常量
/** 该常量的jsdoc注释 */
export const CONST_VALUE = value as const

### 5.3 常量使用规范

```typescript
// 在组件中使用常量
import { OrderStatus, CONST_VALUE } from '@/constants'

const status = OrderStatus.Pending
````

## 6. 类型管理流程

### 6.1 类型文件组织

```
types/
├── api/             # API相关类型
└── global.d.ts      # 全局类型定义
```

### 6.2 类型使用规范

```typescript
// 在组件中使用类型
import type { RateLimitRule, CreateRateLimitForm } from "types/xxx";

const rule = ref<RateLimitRule | null>(null);
const form = reactive<CreateRateLimitForm>({
  name: "",
  description: "",
  type: "qps",
  config: {},
});
```

## 7. 工具函数管理流程

### 7.1 工具函数组织

```
utils/
├── index.ts         # 工具函数入口
└── [module].ts      # 按功能进行分模块
```

### 7.2 工具函数规范

```typescript
// 明确返回值类型
export function getToken(): string | null {
  return localStorage.getItem("jwt_token");
}
```

### 7.3 工具函数使用规范

```typescript
// 在组件中使用工具函数
import { getToken, downloadFile } from "@/utils";

async function handleDownload() {
  try {
    const response = await api.downloadFile();
    downloadFile(response);
  } catch (error) {
    console.error("下载失败:", error);
  }
}
```

## 8. 页面开发规范

### 8.1 页面组织

#### 8.1.1 jsx组件

```
src/views/
└── [page-name]/         # 页面入口：按功能模块划分
    ├── components/      # 页面级组件
    ├── const.ts         # 页面级常量
    ├── util.ts          # 页面级工具函数
    ├── hooks.ts         # 页面级hook
    └── index.tsx        # 页面入口
```

## 9. hooks管理

### 9.1 基础规范

- hook文件必须使用useHook格式命名
- hook具体实现必须使用useHook格式命名

### 9.2 项目级hook

- 放置在src/hooks目录下
- 使用`@hooks`别名进行引用

示例如下：

```typescript
// src/hooks/useHook.ts

function useHook() {
  // hook使用的状态，按照以下顺序管理，除非有依赖关系需要进行调整，否则按照该顺序管理hook使用的状态
  // const
  // markRaw
  // 其他hook
  // ref
  // computed
  // watch

  // hook相关逻辑实现

  // hook暴露给外面的内容
  return {};
}
```

### 9.3 组件/页面级hook

- 如果只有一个hook：直接放置在组件/页面对应目录下的hook.ts文件
- 如果有多个hook：在组件/页面对应目录下创建hooks目录，将对应的hook提取为模块
