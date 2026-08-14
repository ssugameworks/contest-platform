import { z } from "zod";
import { rubricCriteria } from "@/entities/rubric";

export const evaluateTeamSchema = z
  .object({
    criteriaScores: z.record(z.string(), z.number().min(0)),
    memo: z.string().optional(),
  })
  .refine(
    (data) =>
      rubricCriteria.every(
        (criterion) =>
          (data.criteriaScores[criterion.id] ?? 0) <= criterion.maxScore,
      ),
    { message: "평가 점수가 만점을 초과했어요", path: ["criteriaScores"] },
  );

export type EvaluateTeamInput = z.infer<typeof evaluateTeamSchema>;
