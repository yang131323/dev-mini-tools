import { defineComponent } from "vue";
import router, { RouteName } from "@/routes";

import "./index.scss";

const AboutTool = defineComponent({
  name: "AboutTool",
  setup() {
    return render;

    function render() {
      const colorRoute = router.resolve({ name: RouteName.COLOR_PAGE }).href;

      return (
        <div class="about-tool">
          <h1 class="first-title">关于Web效率工具</h1>
          <p class="article-p">Web效率工具目的是为了解决生活中的一些痛点和难点，旨在提升个人的工作效率和生活便利。</p>
          <p class="article-p">目前Web效率工具规划类目如下：</p>
          <ol class="article-ol">
            <li class="list-item">开发工具</li>
            <li class="list-item">生活工具</li>
            <li class="list-item">更多类目...</li>
          </ol>
          <p class="article-p">前端开发工具是将在开发工作中频繁用到的工具进行一个汇总，提高日常开发效率，如颜色互转、图片转换、编码转换、进制转换</p>
          <h3 class="article-h3">实现工具</h3>
          <ul class="article-ul">
            <li class="list-item">
              开发工具：
              <ol class="article-ol">
            <li class="list-item">
              <a class="common-link" href={colorRoute}>颜色/Color转换</a>
            </li>
          </ol>
            </li>
            <li class="list-item">
              生活工具：无
            </li>
          </ul>
          <h3 class="article-h3">TODO LIST</h3>
          <ol class="article-ol">
            <li class="list-item">图片转换</li>
            <li class="list-item">编码转换</li>
            <li class="list-item">进制转换</li>
            <li class="list-item">等等...</li>
          </ol>
          <h3 class="article-h3">新增工具</h3>
          <p class="article-p">如果你有好的工具想法，欢迎提出，我会尽快实现，可以通过以下两种方式提交工具需求：</p>
          <ol class="article-ol">
            <li class="list-item">通过Github Issue提交：<a href="https://github.com/yang131323/dev-mini-tools" class="common-link" target="_blank">仓库地址</a></li>
            <li class="list-item">问卷提交：<a href="https://wj.qq.com/s2/17885605/fea5/" class="common-link" target="_blank">开发工具问卷</a></li>
          </ol>
        </div>
      );
    }
  }
});

export default AboutTool;
