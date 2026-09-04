import { z } from "zod";

export const ROLE_OPTIONS = [
  { value: "pm", label: "PM" },
  { value: "design", label: "Design" },
  { value: "developer", label: "Developer" },
] as const;

const PHONE_REGEX = /^\d{2,3}-\d{3,4}-\d{4}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value: string): boolean {
  if (!DATE_REGEX.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

// No .min(1) here on purpose — item validity is only enforced in
// superRefine below, gated on applicationType === "team". A plain
// z.array(schema-with-min) would validate leftover rows even after
// switching back to "individual" (the section holding the error is
// unmounted, so submit would silently fail with no visible feedback).
const teamMemberSchema = z.object({
  name: z.string().trim(),
  college: z.string(),
  department: z.string(),
});

// Shared between the client form (react-hook-form resolver) and the server
// action (re-validated there since a Server Action is a callable endpoint —
// nothing stops a request from bypassing the form entirely).
export const applicationSchema = z
  .object({
    name: z.string().trim().min(1, "이름을 입력해주세요"),
    studentId: z.string().regex(/^\d{8}$/, "학번 8자리를 입력해주세요"),
    college: z.string().min(1, "단과대를 선택해주세요"),
    department: z.string().min(1, "학과를 선택해주세요"),
    phone: z.string().regex(PHONE_REGEX, "전화번호를 정확히 입력해주세요"),
    birthDate: z.string().refine(isRealDate, "생년월일을 정확히 입력해주세요"),
    role: z.enum(["pm", "design", "developer"], {
      message: "역할을 선택해주세요",
    }),
    applicationType: z.enum(["individual", "team"]),
    teamMembers: z.array(teamMemberSchema).max(4),
  })
  .superRefine((data, ctx) => {
    if (data.applicationType !== "team") return;
    if (data.teamMembers.length < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["teamMembers"],
        message: "팀원을 1명 이상 추가해주세요 (본인 포함 2~5명)",
      });
      return;
    }
    data.teamMembers.forEach((member, index) => {
      if (!member.name) {
        ctx.addIssue({
          code: "custom",
          path: ["teamMembers", index, "name"],
          message: "이름을 입력해주세요",
        });
      }
      if (!member.college) {
        ctx.addIssue({
          code: "custom",
          path: ["teamMembers", index, "college"],
          message: "단과대를 선택해주세요",
        });
      }
      if (!member.department) {
        ctx.addIssue({
          code: "custom",
          path: ["teamMembers", index, "department"],
          message: "학과를 선택해주세요",
        });
      }
    });
  });

export type ApplicationFormInput = z.infer<typeof applicationSchema>;
