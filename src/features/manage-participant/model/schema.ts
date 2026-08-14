import { z } from "zod";

export const manageParticipantSchema = z.object({
  studentId: z.string().min(1, "학번을 입력해주세요"),
  name: z.string().min(1, "이름을 입력해주세요"),
  teamId: z.string().nullable(),
});
export type ManageParticipantInput = z.infer<typeof manageParticipantSchema>;
