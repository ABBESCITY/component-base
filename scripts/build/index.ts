import yargs from "yargs";
import { compile } from "./compile";
import { generateDeclarationFiles } from "./genDeclarationFile";
import { generatePackageJson } from "./genPackageJson";
import {
  getPackageInfoList,
  getPackageInfo,
  PackageInfo,
} from "../utils/package";
import { createLogger } from "../utils/logger";

interface BuildOptions {
  watch?: boolean;
  minify?: boolean;
  all?: boolean;
  package?: string;
}

const logger = createLogger("build");

async function buildPkg(argv: BuildOptions) {
  if (argv.all && argv.package) {
    logger.error("Error: Cannot use --all and --package options together");
    process.exit(1);
  }

  const packageList = argv.all
    ? getPackageInfoList()
    : argv.package
    ? [getPackageInfo(argv.package)]
    : [];

  if (packageList.length === 0) {
    logger.error("Error: No packages to build");
    process.exit(1);
  }

  // Compile Source Code
  packageList.forEach(async (packageInfo: PackageInfo) => {
    await compile({
      watch: argv.watch,
      minify: argv.minify,
      package: packageInfo,
    });
  });

  // Generate Declaration File
  await generateDeclarationFiles();

  // Generate Package'json
  await generatePackageJson();
}

/**
 * Build CLI
 *
 * Usage:
 * tsx scripts/build/index.ts build --all
 * tsx scripts/build/index.ts build --component <component-name>
 */
async function bootstrap() {
  await yargs(process.argv.slice(2))
    .usage("Usage: $0 <command> [options]")
    .command(
      "build",
      "Build packages",
      {
        all: {
          alias: "a",
          type: "boolean",
          description: "Build all packages",
          default: true,
        },
        package: {
          alias: "p",
          type: "string",
          description: "Package name to build (core or components)",
          choices: ["core", "components"],
        },
        watch: {
          alias: "w",
          type: "boolean",
          description: "Enable watch mode for development",
          default: false,
        },
        minify: {
          alias: "m",
          type: "boolean",
          description: "Enable minification",
          default: true,
        },
      },
      buildPkg
    )
    .demandCommand(1, "Please provide a command")
    .help()
    .alias("h", "help")
    .alias("v", "version")
    .strict()
    .parse();
}

bootstrap();
