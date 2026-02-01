import { execSync } from "child_process";
import { existsSync, mkdirSync, rmSync } from "fs";
import { createLogger } from "../utils/logger";

const logger = createLogger("gen-declaration");

interface GenDeclarationOptions {
  input?: string;
  output?: string;
  tsconfig?: string;
  clean?: boolean;
}

export async function generateDeclarationFiles(
  options: GenDeclarationOptions = {}
) {
  const {
    input = "src",
    output = "dist/types",
    tsconfig = "tsconfig.json",
    clean = true,
  } = options;

  try {
    if (clean && existsSync(output)) {
      rmSync(output, { recursive: true });
      logger.info("Cleaned existing declaration directory");
    }

    if (!existsSync(output)) {
      mkdirSync(output, { recursive: true });
      logger.info("Created declaration directory");
    }

    const tscCommand = `npx tsc --project ${tsconfig} --declaration --emitDeclarationOnly --outDir ${output}`;

    logger.info("Generating TypeScript declaration files...");
    execSync(tscCommand, { stdio: "inherit" });

    logger.success(`Declaration files generated successfully in ${output}`);
  } catch (error: any) {
    logger.error("Failed to generate declaration files:", error.message);
    throw error;
  }
}
