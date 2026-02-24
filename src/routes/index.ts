import type { RouteRecordRaw } from "vue-router";

import { isStatic } from "@/constants/var";
import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import BaseRoutes from "./base";
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
  },
  {
    name: ROUTE.IMAGE_PAGE,
    path: "/image",
    component: () => import("@/views/image-conversion"),
  },
  {
    name: ROUTE.ABOUT_PAGE,
    path: "/about",
    component: () => import("@/views/about"),
  },
  {
    name: ROUTE.WATERMARK_PAGE,
    path: "/watermark",
    component: () => import("@/views/image-watermark"),
  },
  ...BaseRoutes,
];

const router = createRouter({
  history: isStatic ? createWebHistory() : createWebHashHistory(),
  routes,
});

export default router;