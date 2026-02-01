import { resolve } from "path";
import { readFileSync } from "fs";

export function getWorkspaceRoot(): string {
  return resolve(__dirname, "../..");
}

export function getPackageRoot(): string {
  return process.cwd();
}

export function findPackageDirectory(packageName: string): string | null {
  const workspaceRoot = getWorkspaceRoot();
  
  try {
    const packageJsonPath = resolve(workspaceRoot, "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    
    if (packageJson.workspaces) {
      for (const workspace of packageJson.workspaces) {
        const workspacePath = resolve(workspaceRoot, workspace);
        const pkgJsonPath = resolve(workspacePath, "package.json");
        
        try {
          const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
          if (pkgJson.name === packageName) {
            return workspacePath;
          }
        } catch {
          continue;
        }
      }
    }
    
    const rootPkgJsonPath = resolve(workspaceRoot, "package.json");
    const rootPkgJson = JSON.parse(readFileSync(rootPkgJsonPath, "utf8"));
    if (rootPkgJson.name === packageName) {
      return workspaceRoot;
    }
    
  } catch (error) {
    console.error("Error finding package directory:", error);
  }
  
  return null;
}