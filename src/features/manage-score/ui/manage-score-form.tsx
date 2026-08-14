"use client";

import { HStack, Text, VStack } from "@seed-design/react";
import { ActionButton } from "seed-design/ui/action-button";
import { getEvaluation, upsertEvaluation } from "@/entities/score";
import { mockStaff } from "@/entities/staff";
import { getTeamById } from "@/entities/team";
import { EvaluateTeamForm } from "@/features/evaluate-team/ui/evaluate-team-form";

export function ManageScoreForm({
  teamId,
  onSaved,
}: {
  teamId: string;
  onSaved: () => void;
}) {
  const team = getTeamById(teamId);
  const judges = mockStaff.filter((staff) => staff.role === "judge");

  if (!team) return null;

  return (
    <VStack gap="x6" width="full">
      {judges.map((judge) => {
        const evaluation = getEvaluation(judge.id, teamId);
        return (
          <VStack key={judge.id} gap="x3" width="full">
            <HStack justify="space-between" align="center" width="full">
              <Text textStyle="t4Bold">{judge.name}</Text>
              {evaluation?.submitted && (
                <ActionButton
                  type="button"
                  variant="neutralWeak"
                  size="small"
                  onClick={() => {
                    upsertEvaluation(judge.id, teamId, { submitted: false });
                    onSaved();
                  }}
                >
                  잠금 해제
                </ActionButton>
              )}
            </HStack>
            <EvaluateTeamForm
              judgeId={judge.id}
              team={team}
              onSaved={onSaved}
            />
          </VStack>
        );
      })}
    </VStack>
  );
}
