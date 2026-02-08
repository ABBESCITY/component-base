import { readdirSync, existsSync, rmSync } from "fs";
import { join } from "path";
import { createLogger } from "../utils/logger";

const logger = createLogger("build-clear");
function buildClear() {

  const packagesDir = join(process.cwd(), "packages");
  const buildDirs = ["dist", "lib", "build", "out", ".next", ".nuxt", ".output"];

  let cleanedCount = 0;

  if (existsSync(packagesDir)) {
    const packages = readdirSync(packagesDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    packages.forEach((packageName) => {
      const packagePath = join(packagesDir, packageName);

      buildDirs.forEach((buildDir) => {
        const buildPath = join(packagePath, buildDir);

        if (existsSync(buildPath)) {
          try {
            rmSync(buildPath, { recursive: true, force: true });
            logger.success(`✓ ${packageName}/${buildDir} removed`);
            cleanedCount++;
          } catch (error) {
            logger.error(`✗ Failed to remove ${packageName}/${buildDir}:`,error);
          }
        }
      });

      // Handle *.tsbuildinfo files separately
      try {
        const files = readdirSync(packagePath);
        const tsbuildinfoFiles = files.filter(file => file.endsWith('.tsbuildinfo'));
        
        tsbuildinfoFiles.forEach(file => {
          const filePath = join(packagePath, file);
          try {
            rmSync(filePath, { force: true });
            logger.success(`✓ ${packageName}/${file} removed`);
            cleanedCount++;
          } catch (error) {
            logger.error(`✗ Failed to remove ${packageName}/${file}:`, error);
          }
        });
      } catch (error) {
        logger.error(`✗ Failed to read package directory ${packageName}:`, error);
      }
    });
  } else {
   logger.error("packages directory not found");
  }
}

buildClear()