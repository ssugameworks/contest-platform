import { z } from "zod";

export const manageInvestorSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  studentId: z.string().min(1, "학번을 입력해주세요"),
  totalBudget: z.number().int().min(0, "0원 이상 입력해주세요"),
});
export type ManageInvestorInput = z.infer<typeof manageInvestorSchema>;
