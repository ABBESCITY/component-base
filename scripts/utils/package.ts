import { resolve, dirname } from "path";

export function getChildPackageWorkPath(packageName: string): string {
  // Extract the actual package name from scoped package names
  // e.g., @abbes-component-base/Cascader -> Cascader, @abbes-base/core -> core
  const actualName = packageName.includes("/") 
    ? packageName.split("/")[1] 
    : packageName;
  
  // Check if it's a core package (without components subdirectory)
  if (packageName.includes("@abbes-base/core")) {
    return resolve(process.cwd(), "packages", actualName);
  }
  
  // Default to components directory for other packages
  return resolve(process.cwd(), "packages", "components", actualName);
}