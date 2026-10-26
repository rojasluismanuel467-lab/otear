// Compiles src/**/*.test.ts (type checking is done by `npm run typecheck`) into a
// temp folder and runs them with the Node test runner. Node here has no TS support.
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function collect(dir, found = [], pattern = /\.test\.ts$/) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) collect(path, found, pattern);
    else if (pattern.test(name)) found.push(path);
  }
  return found;
}

const tests = collect("src");
if (!tests.length) process.exit(0);
const out = mkdtempSync(join(tmpdir(), "otear-tests-"));
try {
  execFileSync(
    "npx",
    [
      "tsc",
      ...tests,
      "--outDir", out,
      "--module", "nodenext",
      "--moduleResolution", "nodenext",
      "--target", "es2022",
      "--noCheck",
      "--rewriteRelativeImportExtensions",
      "--rootDir", "src",
    ],
    { stdio: "inherit" },
  );
  execFileSync("node", ["--test", "--test-reporter=spec", ...collect(out, [], /\.test\.js$/)], { stdio: "inherit" });
} finally {
  rmSync(out, { recursive: true, force: true });
}
