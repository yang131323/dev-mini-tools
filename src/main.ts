import { createApp } from "vue";
import router from "@router/index";
import App from "@components/app";
import { createPinia } from "pinia";

import "@/style/common.scss";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router).mount("#app");
