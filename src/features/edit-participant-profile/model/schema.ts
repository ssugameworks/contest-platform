import { z } from "zod";

export const editParticipantProfileSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
});
export type EditParticipantProfileInput = z.infer<
  typeof editParticipantProfileSchema
>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요"),
    newPassword: z.string().min(8, "비밀번호는 8자 이상이어야 해요"),
    confirmNewPassword: z.string().min(1, "새 비밀번호를 다시 입력해주세요"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "새 비밀번호가 일치하지 않아요",
    path: ["confirmNewPassword"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
