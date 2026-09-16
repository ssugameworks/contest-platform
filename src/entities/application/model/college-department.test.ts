import { describe, expect, test } from "bun:test";
import { COLLEGE_DEPARTMENTS, departmentsFor } from "./college-department";

describe("departmentsFor", () => {
  test("returns the departments listed for a known college", () => {
    const [first] = COLLEGE_DEPARTMENTS;
    expect(departmentsFor(first.college)).toEqual(first.departments);
  });

  test("returns an empty array for an unknown college", () => {
    expect(departmentsFor("존재하지 않는 대학")).toEqual([]);
  });

  test("returns an empty array for an empty string", () => {
    expect(departmentsFor("")).toEqual([]);
  });
});
