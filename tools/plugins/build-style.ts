import type { Plugin } from "vite";

import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(dirname, "..", "..");

export const VIRTUAL_PC = "virtual:style_pc";
export const VIRTUAL_MOBILE = "virtual:style_mobile";

const MOBILE_BREAKPOINT_PX = 768;
const MEDIA_MOBILE = `(max-width: ${MOBILE_BREAKPOINT_PX}px)`;
const MEDIA_PC = `(min-width: ${MOBILE_BREAKPOINT_PX}px)`;

export default function mediaStylePlugin(): Plugin {
  const RESOLVED_PC = `\0${VIRTUAL_PC}`;
  const RESOLVED_MOBILE = `\0${VIRTUAL_MOBILE}`;

  let isBuild = false;
  let outDir = 'dist';

  function normalizeCssHref(fileName: string) {
    // build.base is './' in prod config; keep href relative to index.html
    return fileName.startsWith("assets/") ? `./${fileName}` : fileName;
  }

  return {
    name: "media-style-plugin",
    configResolved(config) {
      isBuild = config.command === "build";
      outDir = config.build.outDir || "dist";
    },
    resolveId(id: string) {
      if (id === VIRTUAL_PC) return RESOLVED_PC;
      if (id === VIRTUAL_MOBILE) return RESOLVED_MOBILE;
      return null;
    },
    load(id: string) {
      if (id === RESOLVED_PC) {
        return 'import "./src/style/pc.scss"; export {};';
      }
      if (id === RESOLVED_MOBILE) {
        return 'import "./src/style/mobile.scss"; export {};';
      }
      return null;
    },
    async writeBundle(_: any, bundle: Record<string, any>) {
      if (!isBuild) return;

      let pcCssFile = "";
      let mobileCssFile = "";

      for (const item of Object.values(bundle)) {
        if (item?.type !== "chunk" || !item.isEntry) continue;

        const importedCss: Set<string> | undefined = item.viteMetadata?.importedCss;
        if (!importedCss || importedCss.size === 0) continue;

        const cssFile = Array.from(importedCss)[0];

        if (item.name === "style_pc") pcCssFile = cssFile;
        if (item.name === "style_mobile") mobileCssFile = cssFile;
      }

      if (!pcCssFile || !mobileCssFile) return;

      const indexHtmlPath = path.resolve(root, outDir, "index.html");
      let html = await fs.readFile(indexHtmlPath, "utf8");

      const mobileHref = normalizeCssHref(mobileCssFile);
      const pcHref = normalizeCssHref(pcCssFile);

      if (html.includes(mobileHref) || html.includes(pcHref)) return;

      const inject = [
        "",
        `  <link rel="stylesheet" href="${mobileHref}" media="${MEDIA_MOBILE}">`,
        `  <link rel="stylesheet" href="${pcHref}" media="${MEDIA_PC}">`,
        "",
      ].join("\n");

      html = html.replace("</head>", `${inject}</head>`);
      await fs.writeFile(indexHtmlPath, html, "utf8");
    },
    transformIndexHtml: {
      order: "post",
      handler() {
        // dev：直接注入 scss（保证在 head 末尾）
        if (!isBuild) {
          return [
            {
              tag: "link",
              injectTo: "head",
              attrs: {
                rel: "stylesheet",
                href: "/src/style/mobile.scss",
                media: MEDIA_MOBILE,
              },
            },
            {
              tag: "link",
              injectTo: "head",
              attrs: {
                rel: "stylesheet",
                href: "/src/style/pc.scss",
                media: MEDIA_PC,
              },
            },
          ];
        }
        return [];
      },
    },
  };
}