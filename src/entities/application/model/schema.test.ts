import { describe, expect, test } from "bun:test";
import { applicationSchema } from "./schema";

function validInput(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    name: "홍길동",
    studentId: "20231234",
    college: "IT대학",
    department: "컴퓨터학부",
    phone: "010-1234-5678",
    birthDate: "2000-01-01",
    role: "developer",
    applicationType: "individual",
    teamMembers: [],
    ...overrides,
  };
}

describe("applicationSchema", () => {
  test("accepts a valid individual application", () => {
    const result = applicationSchema.safeParse(validInput());
    expect(result.success).toBe(true);
  });

  test("rejects a student id that isn't exactly 8 digits", () => {
    const result = applicationSchema.safeParse(
      validInput({ studentId: "1234" }),
    );
    expect(result.success).toBe(false);
  });

  test("rejects a phone number that doesn't match the dash format", () => {
    const result = applicationSchema.safeParse(
      validInput({ phone: "01012345678" }),
    );
    expect(result.success).toBe(false);
  });

  test("rejects a calendar date that doesn't exist (e.g. Feb 30)", () => {
    const result = applicationSchema.safeParse(
      validInput({ birthDate: "2000-02-30" }),
    );
    expect(result.success).toBe(false);
  });

  test("rejects an empty name after trimming whitespace", () => {
    const result = applicationSchema.safeParse(validInput({ name: "   " }));
    expect(result.success).toBe(false);
  });

  test("allows an empty teamMembers array for individual applications", () => {
    const result = applicationSchema.safeParse(
      validInput({ applicationType: "individual", teamMembers: [] }),
    );
    expect(result.success).toBe(true);
  });

  test("requires at least one team member when applicationType is team", () => {
    const result = applicationSchema.safeParse(
      validInput({ applicationType: "team", teamMembers: [] }),
    );
    expect(result.success).toBe(false);
  });

  test("accepts a team application with a fully filled-in member", () => {
    const result = applicationSchema.safeParse(
      validInput({
        applicationType: "team",
        teamMembers: [
          { name: "김철수", college: "IT대학", department: "컴퓨터학부" },
        ],
      }),
    );
    expect(result.success).toBe(true);
  });

  test("flags a team member missing required fields with issues on their exact path", () => {
    const result = applicationSchema.safeParse(
      validInput({
        applicationType: "team",
        teamMembers: [{ name: "", college: "", department: "" }],
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join("."));
      expect(paths).toContain("teamMembers.0.name");
      expect(paths).toContain("teamMembers.0.college");
      expect(paths).toContain("teamMembers.0.department");
    }
  });

  test("rejects more than 4 team members", () => {
    const teamMembers = Array.from({ length: 5 }, (_, i) => ({
      name: `팀원${i}`,
      college: "IT대학",
      department: "컴퓨터학부",
    }));
    const result = applicationSchema.safeParse(
      validInput({ applicationType: "team", teamMembers }),
    );
    expect(result.success).toBe(false);
  });

  test("does not validate leftover team member rows when applicationType is individual", () => {
    // Regression guard: switching back to "individual" shouldn't resurrect
    // validation errors for a team-members section that's no longer shown.
    const result = applicationSchema.safeParse(
      validInput({
        applicationType: "individual",
        teamMembers: [{ name: "", college: "", department: "" }],
      }),
    );
    expect(result.success).toBe(true);
  });
});
