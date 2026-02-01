import {
  rollup,
  OutputOptions,
  RollupOptions,
  RollupWatchOptions,
} from "rollup";
import esbuild from "rollup-plugin-esbuild";
import nodeResolve from "@rollup/plugin-node-resolve";

import { createLogger } from "../utils/logger";

const logger = createLogger("build-compile");

interface CompileOptions {
  watch?: boolean;
  minify?: boolean;
  package?: string;
}

function createRollupExternal() {
  const baseExternals = ["react/jsx-runtime", "react-is"];

  try {
    const packageJson = require(`${process.cwd()}/package.json`);
    const peerDependencies = packageJson.peerDependencies || {};
    const peerDeps = Object.keys(peerDependencies);

    return [...baseExternals, ...peerDeps];
  } catch (error) {
    return baseExternals;
  }
}

function createRollupOption(options: CompileOptions = {}): RollupOptions {
  return {
    input: "src/index.ts",
    output: [
      {
        dir: "dist/esm",
        format: "esm",
        preserveModules: true,
        preserveModulesRoot: "src",
      },
      {
        dir: "dist/cjs",
        format: "cjs",
        preserveModules: true,
        preserveModulesRoot: "src",
      },
    ],
    plugins: [
      nodeResolve(),
      esbuild({
        tsconfig: "tsconfig.build.json",
        minify: options.minify !== false,
      }),
    ],
    external: createRollupExternal(),
  };
}

export async function compile(options: CompileOptions = {}) {
  try {
    const rollupConfig = createRollupOption(options);

    if (options.watch) {
      const { watch } = await import("rollup");
      const watcher = watch([rollupConfig as RollupWatchOptions]);
      logger.info("Watching for file changes...");

      watcher.on("event", (event) => {
        if (event.code === "START") {
          logger.info("Build started...");
        } else if (event.code === "BUNDLE_END") {
          logger.success("Build completed successfully");
        } else if (event.code === "ERROR") {
          logger.error("Build error:", event.error);
        }
      });

      return;
    }

    const bundle = await rollup(rollupConfig);
    for (const outputOptions of rollupConfig.output as OutputOptions[]) {
      await bundle.write(outputOptions);
    }
    await bundle.close();
    logger.success("Build source code successfully");
  } catch (err: any) {
    logger.error("Build source code failed, error: ", err.message);
  }
}
