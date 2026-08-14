import { z } from "zod";

export const editTeamProfileSchema = z.object({
  name: z.string().min(1, "팀 이름을 입력해주세요"),
  description: z.string().min(1, "팀 소개를 입력해주세요"),
  tags: z.string().optional(),
  landingPageUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^https?:\/\//.test(value),
      "http:// 또는 https://로 시작하는 URL을 입력해주세요",
    ),
});
export type EditTeamProfileInput = z.infer<typeof editTeamProfileSchema>;
