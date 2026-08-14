import { z } from "zod";

export const studentLoginSchema = z.object({
  email: z.email("올바른 이메일 주소를 입력해주세요"),
});
export type StudentLoginInput = z.infer<typeof studentLoginSchema>;
