import { z } from "zod";

export const investorLoginSchema = z.object({
  studentId: z.string().min(1, "학번을 입력해주세요"),
  name: z.string().optional(),
});
export type InvestorLoginInput = z.infer<typeof investorLoginSchema>;
