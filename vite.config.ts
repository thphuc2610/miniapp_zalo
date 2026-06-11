import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import path from "path";
import zaloMiniApp from "zmp-vite-plugin";
import { DEFAULT_API_BASE_URL } from "./api.config";

export default () => {
  return defineConfig({
    root: ".",
    base: "",
    resolve: {
      alias: {
        "components": path.resolve(__dirname, "./src/components"),
        "utils": path.resolve(__dirname, "./src/utils"),
        "pages": path.resolve(__dirname, "./src/pages"),
        "service": path.resolve(__dirname, "./src/service"),
        "config": path.resolve(__dirname, "./src/config"),
        "hooks": path.resolve(__dirname, "./src/hooks"),
        "state": path.resolve(__dirname, "./src/state"),
        "static": path.resolve(__dirname, "./src/static"),
        "css": path.resolve(__dirname, "./src/css")
      }
    },
    server: {
      proxy: {
        "/api": {
          target: DEFAULT_API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [
      tsconfigPaths(),
      react(),
      zaloMiniApp(),
      {
        name: "override-config",
        config: () => ({
          build: {
            target: "esnext",
          },
        }),
      },
    ],
  });
};
