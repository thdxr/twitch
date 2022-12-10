import solid from "solid-start/vite";
import { defineConfig } from "vite";
import { macaronVitePlugin } from "@macaron-css/vite";
import aws from "solid-start-aws";

export default defineConfig({
  plugins: [
    macaronVitePlugin(),
    solid({
      adapter: aws(),
    }),
  ],
  build: {
    target: "esnext",
  },
});
