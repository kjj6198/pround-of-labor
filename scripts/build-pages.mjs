import { execFileSync } from "node:child_process";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";

execFileSync("npm", ["run", "build"], {
  stdio: "inherit",
  env: { ...process.env, BASE_PATH: "/pround-of-labor/app/" },
});
// Local server root is site/. GitHub Pages artifact root is site/pround-of-labor/.
const destination = "site/pround-of-labor";
await rm(destination, { recursive: true, force: true });
await mkdir(`${destination}/app`, { recursive: true });
await cp(".output/public", `${destination}/app`, { recursive: true });
await writeFile(`${destination}/.nojekyll`, "");
await writeFile(
  `${destination}/index.html`,
  '<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=app/"><title>勞工大代誌</title><a href="app/">前往勞工大代誌</a></html>',
);
console.log(
  "Pages artifact: site/pround-of-labor/. Serve site/ locally and visit /pround-of-labor/app/.",
);
