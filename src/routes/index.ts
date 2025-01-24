import type { RouteRecordRaw } from "vue-router";

import { isStatic } from "@/constants/var";
import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import * as ROUTE from "./name";

export const RouteName = ROUTE;

const routes: RouteRecordRaw[] = [
  {
    name: ROUTE.HOME_PAGE,
    path: "/",
    redirect: "/color",
  },
  {
    name: ROUTE.COLOR_PAGE,
    path: "/color",
    component: () => import("@/views/color"),
  }
];

const router = createRouter({
  history: isStatic ? createWebHistory() : createWebHashHistory(),
  routes,
});

export default router;