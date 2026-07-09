import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The preview runner assigns PORT/HOST and expects a strict bind on that exact
// port; locally we fall back to a fixed port on the IPv4 loopback. allowedHosts
// is open because the dev server is only reached through the trusted preview
// proxy — production is served by the built output (`pnpm start`), not by Vite.
export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 3400,
    host: process.env.HOST || "127.0.0.1",
    strictPort: Boolean(process.env.PORT),
    allowedHosts: true,
  },
  plugins: [tailwindcss(), tanstackStart(), viteReact()],
});
