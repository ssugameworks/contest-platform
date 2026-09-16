// Mirrors @testing-library/jest-dom's own types/bun.d.ts (augmenting
// bun:test's `Matchers` interface with jest-dom's matchers).
import type { expect } from "bun:test";
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare module "bun:test" {
  interface Matchers<T = unknown>
    extends TestingLibraryMatchers<
      ReturnType<typeof expect.stringContaining>,
      T
    > {}
}
