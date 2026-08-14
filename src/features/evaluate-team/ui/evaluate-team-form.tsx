"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { HStack, Text, VStack } from "@seed-design/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  TextField,
  TextFieldInput,
  TextFieldTextarea,
} from "seed-design/ui/text-field";
import { rubricCriteria, rubricMaxTotal } from "@/entities/rubric";
import { getEvaluationTotal } from "@/entities/score/model/pure";
import type { Team } from "@/entities/team";
import { getEvaluationAction, submitEvaluationAction } from "../model/actions";
import { type EvaluateTeamInput, evaluateTeamSchema } from "../model/schema";

export interface EvaluateTeamFormHandle {
  saveDraft: () => void;
  submitFinal: () => void;
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

  const save = (submitted: boolean) =>
    handleSubmit(async (data) => {
      await submitEvaluationAction(judgeId, team.id, {
        criteriaScores: data.criteriaScores,
        memo: data.memo ?? "",
        submitted,
      });
      await queryClient.invalidateQueries({ queryKey });
      onSaved();
    })();

  useImperativeHandle(ref, () => ({
    saveDraft: () => save(false),
    submitFinal: () => save(true),
  }));

  if (isPending) {
    return null;
  }

  if (evaluation?.submitted) {
    return (
      <VStack gap="x4" width="full">
        <Text textStyle="t4Regular" color="fg.neutralSubtle">
          제출 완료된 채점이에요. 관리자가 잠금을 해제해야 다시 수정할 수
          있어요.
        </Text>
        <VStack gap="x2" width="full">
          {rubricCriteria.map((criterion) => (
            <HStack key={criterion.id} width="full" justify="space-between">
              <Text textStyle="t4Regular">{criterion.label}</Text>
              <Text textStyle="t4Bold">
                {`${evaluation.criteriaScores[criterion.id] ?? 0} / ${criterion.maxScore}`}
              </Text>
            </HStack>
          ))}
        </VStack>
        <Text textStyle="t6Bold">{`총점 ${getEvaluationTotal(evaluation)}점`}</Text>
        {evaluation.memo && (
          <Text textStyle="t4Regular" color="fg.neutralSubtle">
            {evaluation.memo}
          </Text>
        )}
      </VStack>
    );
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
