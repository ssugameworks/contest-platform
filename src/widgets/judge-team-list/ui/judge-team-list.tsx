"use client";

import { Box, HStack, ScrollFog, Text, VStack } from "@seed-design/react";
import { useRef, useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import {
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetRoot,
} from "seed-design/ui/bottom-sheet";
import { formatBoothLocation, getBoothByTeamId } from "@/entities/booth";
import { getEvaluation, getEvaluationTotal } from "@/entities/score";
import { mockTeams, type Team } from "@/entities/team";
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

export function JudgeTeamList({ judgeId }: { judgeId: string }) {
  const [, setVersion] = useState(0);
  const [open, setOpen] = useState(false);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [liveTotal, setLiveTotal] = useState(0);
  const formRef = useRef<EvaluateTeamFormHandle>(null);

  const submittedCount = mockTeams.filter(
    (team) => getEvaluation(judgeId, team.id)?.submitted,
  ).length;
  const activeEvaluation = activeTeam
    ? getEvaluation(judgeId, activeTeam.id)
    : undefined;
  const isReadOnly = activeEvaluation?.submitted ?? false;

  const openTeam = (team: Team) => {
    setActiveTeam(team);
    setLiveTotal(getEvaluationTotal(getEvaluation(judgeId, team.id)));
    setOpen(true);
  };
  const refresh = () => {
    setVersion((v) => v + 1);
    setOpen(false);
  };

  return (
    <VStack gap="x4" width="full">
      <Text textStyle="t4Regular" color="fg.neutralSubtle">
        {`${submittedCount} / ${mockTeams.length}팀 채점 완료`}
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
          {mockTeams.map((team) => {
            const evaluation = getEvaluation(judgeId, team.id);
            const booth = getBoothByTeamId(team.id);
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
                  {booth ? formatBoothLocation(booth) : "-"}
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
