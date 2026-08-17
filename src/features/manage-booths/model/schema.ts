import { z } from "zod";

export const createBoothSchema = z.object({
  zone: z.string().min(1, "구역을 입력해주세요"),
  number: z.number().int().positive("번호를 입력해주세요"),
});
export type CreateBoothInput = z.infer<typeof createBoothSchema>;
