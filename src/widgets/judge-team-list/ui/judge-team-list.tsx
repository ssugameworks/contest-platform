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
import { listEvaluationsAction } from "@/entities/score/model/actions";
import { getEvaluationTotal } from "@/entities/score/model/pure";
import type { Team } from "@/entities/team";
import { listTeamsAction } from "@/entities/team/model/actions";
import {
  EvaluateTeamForm,
  type EvaluateTeamFormHandle,
} from "@/features/evaluate-team";
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
  // One query for every team's evaluation by this judge, instead of a
  // separate request per row (status cell) + per open (bottom sheet).
  const { data: evaluations = [] } = useQuery({
    queryKey: ["evaluations"],
    queryFn: listEvaluationsAction,
  });
  const myEvaluations = evaluations.filter((e) => e.judgeId === judgeId);
  const activeEvaluation = activeTeam
    ? myEvaluations.find((e) => e.teamId === activeTeam.id)
    : undefined;
  const isReadOnly = activeEvaluation?.submitted ?? false;
  const submittedCount = myEvaluations.filter((e) => e.submitted).length;

  const openTeam = (team: Team) => {
    setActiveTeam(team);
    const evaluation = myEvaluations.find((e) => e.teamId === team.id);
    setLiveTotal(getEvaluationTotal(evaluation));
    setOpen(true);
  };
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    setOpen(false);
  };

  return (
    <VStack gap="x4" width="full">
      <Text textStyle="t4Regular" color="fg.neutralSubtle">
        {`${submittedCount} / ${teams.length}팀 채점 완료`}
      </Text>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>팀명</TableHeadCell>
            <TableHeadCell align="right">상태</TableHeadCell>
            <TableHeadCell>부스 위치</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {teams.map((team) => {
            const evaluation = myEvaluations.find((e) => e.teamId === team.id);
            return (
              <TableRow
                key={team.id}
                interactive
                onClick={() => openTeam(team)}
              >
                <TableCell>{team.name}</TableCell>
                <TableCell align="right">
                  {evaluation?.submitted
                    ? `제출완료 (${getEvaluationTotal(evaluation)}점)`
                    : "미채점"}
                </TableCell>
                <TableCell>
                  <BoothCell teamId={team.id} />
                </TableCell>
              </TableRow>
            );
          })}
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
