"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { VStack } from "@seed-design/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  TextField,
  TextFieldInput,
  TextFieldTextarea,
} from "seed-design/ui/text-field";
import { rubricCriteria, rubricMaxTotal } from "@/entities/rubric";
import type { Team } from "@/entities/team";
import { getEvaluationAction, submitEvaluationAction } from "../model/actions";
import { type EvaluateTeamInput, evaluateTeamSchema } from "../model/schema";

export interface EvaluateTeamFormHandle {
  save: () => void;
}

export const EvaluateTeamForm = forwardRef<
  EvaluateTeamFormHandle,
  {
    judgeId: string;
    team: Team;
    onSaved: () => void;
    onTotalChange?: (total: number) => void;
  }
>(function EvaluateTeamForm({ judgeId, team, onSaved, onTotalChange }, ref) {
  const queryClient = useQueryClient();
  const queryKey = ["evaluation", judgeId, team.id];
  const { data: evaluation, isPending } = useQuery({
    queryKey,
    queryFn: () => getEvaluationAction(judgeId, team.id),
  });

  const { control, register, handleSubmit } = useForm<EvaluateTeamInput>({
    resolver: zodResolver(evaluateTeamSchema),
    values: {
      criteriaScores: Object.fromEntries(
        rubricCriteria.map((criterion) => [
          criterion.id,
          evaluation?.criteriaScores[criterion.id] ?? 0,
        ]),
      ),
      memo: evaluation?.memo ?? "",
    },
  });

  const watchedScores = useWatch({ control, name: "criteriaScores" });
  const total = Math.round(
    (Object.values(watchedScores ?? {}).reduce(
      (sum: number, v) => sum + (v || 0),
      0,
    ) /
      rubricMaxTotal) *
      100,
  );

  useEffect(() => {
    onTotalChange?.(Number.isNaN(total) ? 0 : total);
  }, [total, onTotalChange]);

  const save = handleSubmit(async (data) => {
    await submitEvaluationAction(judgeId, team.id, {
      criteriaScores: data.criteriaScores,
      memo: data.memo ?? "",
    });
    await queryClient.invalidateQueries({ queryKey });
    onSaved();
  });

  useImperativeHandle(ref, () => ({ save }));

  if (isPending) {
    return null;
  }

  return (
    <form noValidate>
      <VStack gap="x5" width="full">
        <VStack gap="x3" width="full">
          {rubricCriteria.map((criterion) => (
            <Controller
              key={criterion.id}
              control={control}
              name={`criteriaScores.${criterion.id}`}
              render={({ field }) => (
                <TextField
                  label={`${criterion.label} (0~${criterion.maxScore})`}
                >
                  <TextFieldInput
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={criterion.maxScore}
                    value={field.value === 0 ? "" : field.value}
                    onBlur={field.onBlur}
                    onChange={(e) =>
                      field.onChange(
                        Math.min(
                          criterion.maxScore,
                          Math.max(0, e.target.valueAsNumber || 0),
                        ),
                      )
                    }
                  />
                </TextField>
              )}
            />
          ))}
        </VStack>

        <TextField label="메모">
          <TextFieldTextarea
            placeholder="이 팀에 대한 메모를 남겨보세요"
            {...register("memo")}
          />
        </TextField>
      </VStack>
    </form>
  );
});
