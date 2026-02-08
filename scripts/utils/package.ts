import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

export type PackageInfo = {
  name: string;
  path: string;
  packageJsonPath: string;
  packageJsonContent: any;
};

/**
 * 根据 package name 获取其实际物理路径
 * @param {string} packageName - 例如 "@abbes-base/utils"
 * @returns {string} - package.json 所在的绝对路径
 */
export function getPackageInfo(packageName: string): PackageInfo {
  const packageJsonPath = require.resolve(`${packageName}/package.json`);

  if (!require("fs").existsSync(packageJsonPath)) {
    throw new Error(`无法找到包: ${packageName}，请确保已执行 yarn install`);
  }

  return {
    name: packageName,
    path: path.dirname(packageJsonPath),
    packageJsonPath: packageJsonPath,
    packageJsonContent: require(packageJsonPath),
  };
}

export function getPackageInfoList(): PackageInfo[] {
  const packageRootDir = path.resolve(process.cwd(), "packages");

  const dirs = fs.readdirSync(packageRootDir);
  const packageInfoList: PackageInfo[] = [];

  for (const dirName of dirs) {
    const pkgDirPath = path.join(packageRootDir, dirName);

    if (!fs.statSync(pkgDirPath).isDirectory()) continue;

    const pkgJsonPath = path.join(pkgDirPath, "package.json");

    if (fs.existsSync(pkgJsonPath)) {
      try {
        const content = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));

        if (content.name) {
          packageInfoList.push({
            name: content.name,
            path: pkgDirPath,
            packageJsonPath: pkgJsonPath,
            packageJsonContent: content,
          });
        }
      } catch (e) {
        console.error(`解析 ${pkgJsonPath} 失败`, e);
      }
    }
  }

  return packageInfoList;
}
