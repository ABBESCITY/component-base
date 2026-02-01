import { Signale } from "signale";

export function createLogger(scope: string) {
  return new Signale({ scope });
}
