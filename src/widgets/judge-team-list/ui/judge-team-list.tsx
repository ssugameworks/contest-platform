"use client";

import { Box, HStack, ScrollFog, Text, VStack } from "@seed-design/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import {
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetRoot,
} from "seed-design/ui/bottom-sheet";
import { getBoothByTeamIdAction } from "@/entities/booth/model/actions";
import { formatBoothLocation } from "@/entities/booth/model/pure";
import { getEvaluationTotal } from "@/entities/score/model/pure";
import type { Team } from "@/entities/team";
import { listTeamsAction } from "@/entities/team/model/actions";
import {
  EvaluateTeamForm,
  type EvaluateTeamFormHandle,
} from "@/features/evaluate-team";
import { getEvaluationAction } from "@/features/evaluate-team/model/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "@/shared/ui/table";

function BoothCell({ teamId }: { teamId: string }) {
  const { data: booth } = useQuery({
    queryKey: ["booth", teamId],
    queryFn: () => getBoothByTeamIdAction(teamId),
  });
  return <>{booth ? formatBoothLocation(booth) : "-"}</>;
}

function StatusCell({ judgeId, teamId }: { judgeId: string; teamId: string }) {
  const { data: evaluation } = useQuery({
    queryKey: ["evaluation", judgeId, teamId],
    queryFn: () => getEvaluationAction(judgeId, teamId),
  });
  return (
    <>
      {evaluation?.submitted
        ? `제출완료 (${getEvaluationTotal(evaluation)}점)`
        : "미채점"}
    </>
  );
}

export function JudgeTeamList({ judgeId }: { judgeId: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [liveTotal, setLiveTotal] = useState(0);
  const formRef = useRef<EvaluateTeamFormHandle>(null);

  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: listTeamsAction,
  });
  const { data: activeEvaluation } = useQuery({
    queryKey: ["evaluation", judgeId, activeTeam?.id],
    queryFn: () =>
      activeTeam ? getEvaluationAction(judgeId, activeTeam.id) : null,
    enabled: !!activeTeam,
  });
  const isReadOnly = activeEvaluation?.submitted ?? false;

  const openTeam = async (team: Team) => {
    setActiveTeam(team);
    const evaluation = await getEvaluationAction(judgeId, team.id);
    setLiveTotal(getEvaluationTotal(evaluation));
    setOpen(true);
  };
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["evaluation", judgeId] });
    queryClient.invalidateQueries({ queryKey: ["submitted-count", judgeId] });
    setOpen(false);
  };

  return (
    <VStack gap="x4" width="full">
      <SubmittedCount judgeId={judgeId} teams={teams} />

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>팀명</TableHeadCell>
            <TableHeadCell align="right">상태</TableHeadCell>
            <TableHeadCell>부스 위치</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id} interactive onClick={() => openTeam(team)}>
              <TableCell>{team.name}</TableCell>
              <TableCell align="right">
                <StatusCell judgeId={judgeId} teamId={team.id} />
              </TableCell>
              <TableCell>
                <BoothCell teamId={team.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <BottomSheetRoot open={open} onOpenChange={setOpen}>
        <BottomSheetContent title={activeTeam?.name ?? "팀 채점"}>
          <BottomSheetBody>
            <Box style={{ maxHeight: "60vh", overflowY: "auto" }}>
              <ScrollFog placement={["top", "bottom"]}>
                <Box style={{ paddingTop: 20, paddingBottom: 24 }}>
                  {activeTeam && (
                    <EvaluateTeamForm
                      ref={formRef}
                      judgeId={judgeId}
                      team={activeTeam}
                      onSaved={refresh}
                      onTotalChange={setLiveTotal}
                    />
                  )}
                </Box>
              </ScrollFog>
            </Box>
          </BottomSheetBody>
          {!isReadOnly && activeTeam && (
            <BottomSheetFooter>
              <HStack
                gap="x2"
                width="full"
                justify="space-between"
                align="center"
              >
                <Text textStyle="t6Bold">{`총점 ${liveTotal}점`}</Text>
                <HStack gap="x2">
                  <ActionButton
                    type="button"
                    variant="neutralWeak"
                    size="large"
                    onClick={() => formRef.current?.saveDraft()}
                  >
                    임시 저장
                  </ActionButton>
                  <ActionButton
                    type="button"
                    variant="brandSolid"
                    size="large"
                    onClick={() => formRef.current?.submitFinal()}
                  >
                    제출 확정
                  </ActionButton>
                </HStack>
              </HStack>
            </BottomSheetFooter>
          )}
        </BottomSheetContent>
      </BottomSheetRoot>
    </VStack>
  );
}

function SubmittedCount({
  judgeId,
  teams,
}: {
  judgeId: string;
  teams: Team[];
}) {
  const { data: submittedCount = 0 } = useQuery({
    queryKey: ["submitted-count", judgeId, teams.map((t) => t.id)],
    queryFn: async () => {
      const evaluations = await Promise.all(
        teams.map((team) => getEvaluationAction(judgeId, team.id)),
      );
      return evaluations.filter((e) => e?.submitted).length;
    },
    enabled: teams.length > 0,
  });

  return (
    <Text textStyle="t4Regular" color="fg.neutralSubtle">
      {`${submittedCount} / ${teams.length}팀 채점 완료`}
    </Text>
  );
}
