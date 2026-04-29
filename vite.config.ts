import type { UserConfig } from "vite";

import { defineConfig } from "vite";
import vueJsx from '@vitejs/plugin-vue-jsx'
import checker from "vite-plugin-checker";
import path from "node:path";
import url from "node:url";
import mediaStylePlugin, { VIRTUAL_PC, VIRTUAL_MOBILE } from "./tools/plugins/build-style";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'

  if (isDev) {
    return getDevConfig();
  } else {
    return getProdConfig();
  }
});

function getBaseConfig() {
  const baseConf: UserConfig = {
    resolve: {
      alias: {
        "@": path.resolve(dirname, "src"),
        "@components": path.resolve(dirname, "src/components"),
        "@utils": path.resolve(dirname, "src/utils"),
        "@store": path.resolve(dirname, "src/store"),
        "@router": path.resolve(dirname, "src/routes"),
        "@config": path.resolve(dirname, "src/configs"),
        "@const": path.resolve(dirname, "src/constants"),
        "@key": path.resolve(dirname, "src/keys"),
      }
    },
    plugins: [vueJsx(), mediaStylePlugin()],
  };

  return baseConf;
}

function getDevConfig() {
  const baseConf = getBaseConfig();

  const { plugins = [], ...rest } = baseConf;

  const devConf: UserConfig = {
    ...rest,
    server: {
      port: 9090,
      open: true,
      strictPort: true,
    },
    build: {
      sourcemap: true,
    },
    plugins: [
      ...plugins,
      checker({
        typescript: true,
        vueTsc: true,
      }),
    ],
  }

  return devConf;
}

function getProdConfig() {
  const baseConf = getBaseConfig();

  const prodConf: UserConfig = {
    ...baseConf,
    base: './',
    build: {
      outDir: 'site',
      sourcemap: true,
      minify: "terser",
      rollupOptions: {
        input: {
          app: path.resolve(dirname, "index.html"),
          'style_pc': VIRTUAL_PC,
          'style_mobile': VIRTUAL_MOBILE,
        },
      },
      terserOptions: {
        sourceMap: true,
        compress: {
          drop_console: true,
        }
      }
    }
  }

  return prodConf;
}