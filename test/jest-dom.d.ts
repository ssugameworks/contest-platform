// Mirrors @testing-library/jest-dom's own types/bun.d.ts (augmenting
// bun:test's `Matchers` interface with jest-dom's matchers), but reached via
// a relative node_modules path since that subpath isn't in the package's
// "exports" map and skipLibCheck silently drops the bare-specifier import.
import type { expect } from "bun:test";
import type { TestingLibraryMatchers } from "../node_modules/@testing-library/jest-dom/types/matchers";

declare module "bun:test" {
  interface Matchers<T = unknown>
    extends TestingLibraryMatchers<
      ReturnType<typeof expect.stringContaining>,
      T
    > {}
}
