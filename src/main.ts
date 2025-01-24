import { createApp } from "vue";
import router from "@router/index";
import App from "@components/app";

import "@/style/index.scss";

const app = createApp(App);

app.use(router).mount("#app");