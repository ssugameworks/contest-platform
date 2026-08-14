import { z } from "zod";

export const participantLoginSchema = z.object({
  studentId: z.string().min(1, "학번을 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});
export type ParticipantLoginInput = z.infer<typeof participantLoginSchema>;
