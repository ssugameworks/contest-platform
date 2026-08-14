import { z } from "zod";

const urlSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => !value || /^https?:\/\//.test(value),
    "http:// 또는 https://로 시작하는 URL을 입력해주세요",
  );

const urlListSchema = z
  .string()
  .optional()
  .refine((value) => {
    if (!value) return true;
    return value
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean)
      .every((url) => /^https?:\/\//.test(url));
  }, "각 URL은 http:// 또는 https://로 시작해야 해요");

export const manageTeamSchema = z.object({
  name: z.string().min(1, "팀 이름을 입력해주세요"),
  description: z.string().min(1, "팀 소개를 입력해주세요"),
  imageUrl: urlSchema,
  tags: z.string().optional(),
  screenshotUrls: urlListSchema,
  landingPageUrl: urlSchema,
});
export type ManageTeamInput = z.infer<typeof manageTeamSchema>;
