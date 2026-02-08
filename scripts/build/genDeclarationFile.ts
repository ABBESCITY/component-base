import { execSync } from "child_process";
import { existsSync, mkdirSync, rmSync } from "fs";
import { createLogger } from "../utils/logger";

const logger = createLogger("type");

interface GenDeclarationOptions {
  tsconfigPath: string;
}

export async function generateDeclarationFiles(options: GenDeclarationOptions) {
  const { tsconfigPath } = options;

  try {

    const tscCommand = `yarn tsc --project ${tsconfigPath}`;

    logger.info("Generating TypeScript declaration files...");
    execSync(tscCommand, { stdio: "inherit" });

    logger.success(`Declaration files generated successfully`);
  } catch (error: any) {
    logger.error("Failed to generate declaration files:", error.message);
    throw error;
  }
}
