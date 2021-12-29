const shell = require("shelljs");

shell.exec("yarn build");
shell.cp("LICENSE", "dist");
shell.cp("README.md", "dist");
shell.cp("package.json", "dist");
shell.cd("dist");
shell.exec("npm publish --access=public");
