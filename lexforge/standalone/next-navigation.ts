import { usePath } from "./router";

/** Drop-in for next/navigation's usePathname in the standalone build. */
export const usePathname = usePath;
export function notFound(): never {
  throw new Error("Not found");
}
