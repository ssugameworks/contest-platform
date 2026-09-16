import { describe, expect, test } from "bun:test";
import { z } from "zod";
import { parseKnownValue } from "./parse-known-value";

const roleSchema = z.enum(["admin", "judge"]);

describe("parseKnownValue", () => {
  test("returns the value when it matches the schema", () => {
    expect(parseKnownValue(roleSchema, "admin", "role")).toBe("admin");
  });

  test("throws a labeled error for a value outside the known set", () => {
    expect(() => parseKnownValue(roleSchema, "superadmin", "role")).toThrow(
      /role/,
    );
  });

  test("throws for null/undefined (e.g. a DB column that was never set)", () => {
    expect(() => parseKnownValue(roleSchema, null, "role")).toThrow();
    expect(() => parseKnownValue(roleSchema, undefined, "role")).toThrow();
  });
});
