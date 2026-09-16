import { describe, expect, test } from "bun:test";
import { manageTeamSchema } from "./schema";

describe("manageTeamSchema", () => {
  test("accepts a valid team without a github url", () => {
    const result = manageTeamSchema.safeParse({
      name: "팀 이름",
      description: "팀 소개",
    });
    expect(result.success).toBe(true);
  });

  test("accepts a valid https github url", () => {
    const result = manageTeamSchema.safeParse({
      name: "팀 이름",
      description: "팀 소개",
      githubUrl: "https://github.com/example/repo",
    });
    expect(result.success).toBe(true);
  });

  test("rejects a github url without a protocol", () => {
    const result = manageTeamSchema.safeParse({
      name: "팀 이름",
      description: "팀 소개",
      githubUrl: "github.com/example/repo",
    });
    expect(result.success).toBe(false);
  });

  test("requires a non-empty name", () => {
    const result = manageTeamSchema.safeParse({
      name: "",
      description: "팀 소개",
    });
    expect(result.success).toBe(false);
  });

  test("requires a non-empty description", () => {
    const result = manageTeamSchema.safeParse({
      name: "팀 이름",
      description: "",
    });
    expect(result.success).toBe(false);
  });
});
