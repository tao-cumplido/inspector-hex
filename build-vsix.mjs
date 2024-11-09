import fs from "node:fs/promises";
import path from "node:path";

import { $ } from "execa";

import pkg from "./package.json" with { type: "json" };

delete pkg.devDependencies;
delete pkg.scripts;

pkg.main = "extension.js";
pkg.browser = "extension.web.js";

async function buildTarget({ os, cpu, }) {
	const destination = `vsix/${os}-${cpu}`;

	await fs.mkdir(path.join(destination, "editor"), { recursive: true, });
	await fs.writeFile(path.join(destination, "package.json"), JSON.stringify(pkg));
	await fs.copyFile(".vscodeignore", path.join(destination, ".vscodeignore"));
	await fs.copyFile("license", path.join(destination, "license"));
	await fs.copyFile("logo.png", path.join(destination, "logo.png"));
	await fs.copyFile("dist/editor/index.js", path.join(destination, "editor/index.js"));
	await fs.copyFile("dist/editor/index.css", path.join(destination, "editor/index.css"));

	const extension = await fs.readFile("dist/extension.js", "utf-8");
	const extensionWeb = await fs.readFile("dist/extension.web.js", "utf-8");

	await fs.writeFile(path.join(destination, "extension.js"), extension.replaceAll("dist/editor", "editor"));
	await fs.writeFile(path.join(destination, "extension.web.js"), extensionWeb.replaceAll("dist/editor", "editor"));

	const $$ = $({ cwd: destination, });

	await $$`npm install --os ${os} --cpu ${cpu} --ignore-scripts`;
	await $$`npx vsce package --target ${os}-${cpu}`;
}

const targets = [
	{ os: "linux", cpu: "x64", },
	{ os: "linux", cpu: "arm64", },
	{ os: "darwin", cpu: "x64", },
	{ os: "darwin", cpu: "arm64", },
	{ os: "win32", cpu: "x64", },
	{ os: "win32", cpu: "arm64", },
];

Promise.all(targets.map((target) => buildTarget(target)));
