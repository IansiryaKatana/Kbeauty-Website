import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const require = createRequire(import.meta.url);

function tryLoadLightningcss() {
  try {
    require("lightningcss");
    return true;
  } catch {
    return false;
  }
}

if (tryLoadLightningcss()) {
  process.exit(0);
}

console.warn(
  "[ensure-native-css] lightningcss native binding missing for this platform; rebuilding…",
);

try {
  execSync("npm rebuild lightningcss @tailwindcss/oxide --verbose", {
    stdio: "inherit",
  });
} catch (error) {
  console.error(
    "[ensure-native-css] rebuild failed. On the server, delete node_modules and run a fresh `npm ci` (do not upload node_modules from Windows).",
  );
  throw error;
}

if (!tryLoadLightningcss()) {
  console.error(
    "[ensure-native-css] lightningcss still unavailable after rebuild.",
  );
  process.exit(1);
}
