import { describe, expect, test } from "bun:test";
import { maskInvestorName } from "./pure";

describe("maskInvestorName", () => {
  test("keeps the first character and masks the rest with 'OO'", () => {
    expect(maskInvestorName("홍길동")).toBe("홍○○");
  });

  test("works for single-character names", () => {
    expect(maskInvestorName("김")).toBe("김○○");
  });
});
