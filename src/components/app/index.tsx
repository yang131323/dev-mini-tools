import type { MenuInfo } from "ant-design-vue/es/menu/src/interface";

import { computed, defineComponent, onBeforeMount, onBeforeUnmount, ref, unref } from "vue";
import { useRouter, RouterView, useRoute } from "vue-router";
import { Button, Dropdown, Menu } from "ant-design-vue";
import { MenuOutlined } from "@ant-design/icons-vue";
import { RouteName } from "@/routes";
import PageFooter from "@/components/footer";
import { Platform, usePlatformStore, useViewportStore } from "@/store";

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
    const platformStore = usePlatformStore();
    const viewportStore = useViewportStore();
    const platformClass = computed(() => {
      return platformStore.currentPlat === Platform.MOBILE ? "mobile-platform" : "pc-platform";
    });

    let unmountListener: (() => void) | null = null;
    let unmountViewportListener: (() => void) | null = null;

    const items = [
      createItem(RouteName.COLOR_PAGE, "颜色/Color转换"),
      createItem(RouteName.IMAGE_PAGE, "图片转换"),
      createItem(RouteName.WATERMARK_PAGE, "图片水印"),
      createItem(RouteName.JSON_PARSER_PAGE, "在线JSON解析"),
    ];

    function menuClickHandler({ key }: MenuInfo) {
      const current = selectItem.value[0];
      if (key && key != current) { 
        router.push({ name: key as string });
        selectItem.value = [key];
      }
    }

    onBeforeMount(async () => {
      unmountListener = platformStore.mountPlatformListener();
      unmountViewportListener = viewportStore.mountViewportListener();
      await router.isReady();
      const routeName = route.name as MenuInfo["key"];
      if (routeName) selectItem.value = [routeName];
    });

    onBeforeUnmount(() => {
      unmountListener?.();
      unmountListener = null;
      unmountViewportListener?.();
      unmountViewportListener = null;
    });

    return render;

    function render() {
      return (
        <div class={["page-container", unref(platformClass)]}>
          <header class="page-header">
            <div class="header-left">
              <h3 class="page-title">Web效率工具</h3>
            </div>
            <div class="header-right">
              <Menu
                onClick={menuClickHandler}
                v-model:selectedKeys={selectItem.value}
                class="app-nav app-nav--pc"
                mode="horizontal"
                items={items}
                triggerSubMenuAction="click"
              />
              <Dropdown
                trigger={["click"]}
                placement="bottomRight"
                arrow={true}
                v-slots={{
                  default: () => (
                    <Button
                      class="app-nav--mobile"
                      type="text"
                      aria-label="打开菜单"
                      icon={<MenuOutlined />}
                    />
                  ),
                  overlay: () => (
                    <Menu
                      onClick={menuClickHandler}
                      selectedKeys={selectItem.value}
                      mode="vertical"
                      items={items}
                    />
                  ),
                }}
              />
            </div>
          </header>
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