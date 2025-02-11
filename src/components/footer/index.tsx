import { defineComponent } from "vue";
import { Tooltip } from "ant-design-vue";

import "./index.scss";
import router, { RouteName } from "@/routes";

const startYear = 2025;

const BaseFooter = defineComponent({
  name: "BaseFooter",
  setup() {
    const currentYear = new Date().getFullYear();

    return render;

    function render() {
      const aboutRoute = router.resolve({ name: RouteName.ABOUT_PAGE }).href;

      return (
        <footer class="base-footer">
          <ul class="site-infos">
            <li class="info-item outer-link">
              <a href={aboutRoute} target="_blank">关于前端开发工具</a>
            </li>
            <li class="info-item outer-link">
              <a href="https://github.com/yang131323/dev-mini-tools" target="_blank">Github</a>
            </li>
            <li class="info-item">
              <Tooltip placement="top" title="1509525854@qq.com">联系方式</Tooltip>
            </li>
            <li class="info-item outer-link">
              <a href="https://wj.qq.com/s2/17885605/fea5/" target="_blank">反馈 & 建议</a>
            </li>
          </ul>
          <div class="right-info">©️ CopyRight {startYear}-{currentYear}, OYoung.All Rights Reserved.</div>
        </footer>
      );
    }
  }
});

export default BaseFooter;
