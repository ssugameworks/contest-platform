import { z } from "zod";

export const adminLoginSchema = z.object({
  id: z.string().min(1, "아이디를 입력해주세요"),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 해요"),
});
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
