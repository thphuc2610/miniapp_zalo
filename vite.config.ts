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
        "app": path.resolve(__dirname, "./src/app"),
        "shared": path.resolve(__dirname, "./src/shared"),
        "features": path.resolve(__dirname, "./src/features"),
        "components": path.resolve(__dirname, "./src/shared/components"),
        "utils": path.resolve(__dirname, "./src/shared/utils"),
        "service": path.resolve(__dirname, "./src/shared/services"),
        "hooks": path.resolve(__dirname, "./src/shared/hooks"),
        "state": path.resolve(__dirname, "./src/app/state"),
        "static": path.resolve(__dirname, "./src/shared/assets"),
        "css": path.resolve(__dirname, "./src/app/css"),
        "models": path.resolve(__dirname, "./src/shared/types"),
        "data": path.resolve(__dirname, "./src/shared/data")
      }
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
    optimizeDeps: {
      include: ["zmp-sdk"],
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
  });
};

