import type { UserConfig } from "vite";

import { defineConfig } from "vite";
import vueJsx from '@vitejs/plugin-vue-jsx'
import checker from "vite-plugin-checker";
import path from "node:path";
import url from "node:url";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig(({ command } ) => {
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
        "@router": path.resolve(dirname, "src/router"),
        "@config": path.resolve(dirname, "src/configs"),
        "@const": path.resolve(dirname, "src/constants"),
        "@key": path.resolve(dirname, "src/keys"),
      }
    },
    plugins: [vueJsx()],
  };

  return baseConf;
}

function getDevConfig() {
  const baseConf = getBaseConfig();

  const { plugins = [], ...rest } = baseConf;

  const devConf: UserConfig = {
    ...rest,
    server: {
      port: 8080,
      open: true,
      strictPort: true,
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
    build: {
      sourcemap: true,
      minify: "terser",
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