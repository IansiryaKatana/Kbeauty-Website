import { rmSync } from "node:fs";
import { resolve } from "node:path";

const roots = [
  resolve(process.cwd(), "node_modules", ".vite"),
  resolve(process.cwd(), "dist", "tanstack_start_app", ".vite"),
  resolve(process.cwd(), ".tanstack"),
];

for (const dir of roots) {
  try {
    rmSync(dir, { recursive: true, force: true });
    console.log(`Removed ${dir}`);
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : null;
    if (code === "EBUSY" || code === "EPERM") {
      console.warn(
        `Could not remove ${dir} (${code}). Stop the dev server (Ctrl+C), then run this script again.`,
      );
    }
  }
}
