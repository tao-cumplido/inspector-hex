import fs from "node:fs/promises";

import { extract } from "tar";

import pkg from "./package.json" with { type: "json" };

const target = process.argv[2];
const version = pkg.dependencies.esbuild;
const url = `https://registry.npmjs.org/@esbuild/${target}/-/${target}-${version}.tgz`;

const data = await fetch(url).then((response) => response.blob()).then((blob) => blob.bytes());

await fs.writeFile("esbuild.tgz", data);
await extract({ file: "esbuild.tgz", });
await fs.rm("node_modules/@esbuild", { recursive: true, force: true, });
await fs.mkdir("node_modules/@esbuild", { recursive: true, });
await fs.rename("package", `node_modules/@esbuild/${target}`);
