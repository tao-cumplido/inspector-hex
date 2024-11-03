import path from "node:path";

import { defineConfig } from "vite";

export default defineConfig({
	root: path.resolve(__dirname, "src"),
	publicDir: path.resolve(__dirname, "public"),
	build: {
		outDir: "../../../dist/editor",
		emptyOutDir: true,
		rollupOptions: {
			output: {
				chunkFileNames: "[name].js",
				entryFileNames: "[name].js",
				assetFileNames: "[name].[ext]",
			},
		},
	},
});
