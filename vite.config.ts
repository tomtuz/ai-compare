import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { URL, fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@table": fileURLToPath(new URL("./src/features/Table", import.meta.url)),
      "@plot": fileURLToPath(new URL("./src/features/Plot", import.meta.url)),
    },
  },
});
