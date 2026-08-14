"use client";

import { HStack, Text, VStack } from "@seed-design/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ActionButton } from "seed-design/ui/action-button";
import { listJudgesAction } from "@/entities/staff/model/actions";
import { getTeamByIdAction } from "@/entities/team/model/actions";
import {
  getEvaluationAction,
  unlockEvaluationAction,
} from "@/features/evaluate-team/model/actions";
import { EvaluateTeamForm } from "@/features/evaluate-team/ui/evaluate-team-form";

function JudgeRow({
  judge,
  teamId,
  onSaved,
}: {
  judge: { id: string; name: string };
  teamId: string;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const { data: evaluation } = useQuery({
    queryKey: ["evaluation", judge.id, teamId],
    queryFn: () => getEvaluationAction(judge.id, teamId),
  });

  return (
    <VStack gap="x3" width="full">
      <HStack justify="space-between" align="center" width="full">
        <Text textStyle="t4Bold">{judge.name}</Text>
        {evaluation?.submitted && (
          <ActionButton
            type="button"
            variant="neutralWeak"
            size="small"
            onClick={async () => {
              await unlockEvaluationAction(judge.id, teamId);
              await queryClient.invalidateQueries({
                queryKey: ["evaluation", judge.id, teamId],
              });
              onSaved();
            }}
          >
            잠금 해제
          </ActionButton>
        )}
      </HStack>
      <EvaluateTeamFormForJudge
        judgeId={judge.id}
        teamId={teamId}
        onSaved={onSaved}
      />
    </VStack>
  );
}

// getTeamById requires a full Team object; ManageScoreForm only has a teamId,
// so this small wrapper resolves the team before rendering EvaluateTeamForm.
function EvaluateTeamFormForJudge({
  judgeId,
  teamId,
  onSaved,
}: {
  judgeId: string;
  teamId: string;
  onSaved: () => void;
}) {
  const { data: team } = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => getTeamByIdAction(teamId),
  });
  if (!team) return null;
  return <EvaluateTeamForm judgeId={judgeId} team={team} onSaved={onSaved} />;
}

export function ManageScoreForm({
  teamId,
  onSaved,
}: {
  teamId: string;
  onSaved: () => void;
}) {
  const { data: judges = [] } = useQuery({
    queryKey: ["judges"],
    queryFn: listJudgesAction,
  });

  return (
    <VStack gap="x6" width="full">
      {judges.map((judge) => (
        <JudgeRow
          key={judge.id}
          judge={judge}
          teamId={teamId}
          onSaved={onSaved}
        />
      ))}
    </VStack>
  );
}
