import type { RouteRecordRaw } from "vue-router";

import * as Route from "./name";

const routes: RouteRecordRaw[] = [
  {
    name: Route.BASE_404,
    path: "/:notFound(.*)*", // 404
    component: () => import("@/views/base/404"),
  }
];

export default routes;