import type { MenuInfo } from "ant-design-vue/es/menu/src/interface";

import { defineComponent, onBeforeMount, ref } from "vue";
import { useRouter, RouterView, useRoute } from "vue-router";
import { Menu } from "ant-design-vue";
import { RouteName } from "@/routes";
import PageFooter from "@/components/footer";

import "./index.scss";

function createItem(key: string, label: string, title = label) {
  return {
    key,
    label,
    title,
  };
}

const App = defineComponent({
  name: "App",
  setup() {
    const selectItem = ref<MenuInfo["key"][]>([RouteName.COLOR_PAGE]);
    const router = useRouter();
    const route = useRoute();

    const items = [
      createItem(RouteName.COLOR_PAGE, "颜色/Color转换"),
      createItem(RouteName.IMAGE_PAGE, "图片转换"),
      createItem(RouteName.WATERMARK_PAGE, "图片水印"),
    ];

    function menuClickHandler({ key }: MenuInfo) {
      const current = selectItem.value[0];
      if (key && key != current) { 
        router.push({ name: key as string });
        selectItem.value = [key];
      }
    }

    onBeforeMount(async () => {
      await router.isReady();
      const routeName = route.name as MenuInfo["key"];
      if (routeName) selectItem.value = [routeName];
    })

    return render;

    function render() {
      return (
        <div class="page-container">
            <div class="page-header">
              <h3 class="page-title">Web效率工具</h3>
              <Menu onClick={menuClickHandler} v-model:selectedKeys={selectItem.value} class="app-nav" mode="horizontal" items={items} triggerSubMenuAction="click"></Menu>
            </div>
          <main class="page-content">
            <RouterView />
          </main>
          <PageFooter />
        </div>
      )
    }
  }
});

export default App;