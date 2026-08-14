import { z } from "zod";

export const investorLoginSchema = z.object({
  studentId: z.string().min(1, "학번을 입력해주세요"),
  name: z.string().optional(),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 해요"),
});
export type InvestorLoginInput = z.infer<typeof investorLoginSchema>;
