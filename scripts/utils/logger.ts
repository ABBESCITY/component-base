import { Signale } from "signale";
import ora from "ora";

export function createLogger(scope: string) {
  return new Signale({ scope });
}

export function createLoadingLogger(text?: string) {
  return ora(text);
}
