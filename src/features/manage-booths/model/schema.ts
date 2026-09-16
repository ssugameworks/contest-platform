import { z } from "zod";

export const createBoothSchema = z.object({
  zone: z.string().min(1, "구역을 입력해주세요"),
  number: z.number().int().positive("번호를 입력해주세요"),
});
export type CreateBoothInput = z.infer<typeof createBoothSchema>;

// Re-exported so callers only need "./schema" for every input validator —
// the schema itself lives with BoothMarkerKind in the entity layer (single
// source of truth for the enum's members).
export { boothMarkerKindSchema } from "@/entities/booth/model/pure";
