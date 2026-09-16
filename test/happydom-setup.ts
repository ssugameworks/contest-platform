// happydom-register.ts must run first (it registers the DOM globals that
// @testing-library/dom's `screen` binds to at its own module-load time) —
// see bunfig.toml's preload order.
import { afterEach, expect } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
