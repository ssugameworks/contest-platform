"use client";

import { Box, HStack, Text, VStack } from "@seed-design/react";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import {
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetRoot,
} from "seed-design/ui/bottom-sheet";
import { SnackbarAvoidOverlap } from "seed-design/ui/snackbar";
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
import { useSuspenseQuery } from "@/shared/lib/query/use-suspense-query";
import { ScrollFog } from "@/shared/ui/scroll-fog";
import { SuspenseQueryBoundary } from "@/shared/ui/suspense-query-boundary";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "@/shared/ui/table";

function BoothCellContent({ teamId }: { teamId: string }) {
  const { data: booth } = useSuspenseQuery({
    queryKey: ["booth", teamId],
    queryFn: () => getBoothByTeamIdAction(teamId),
  });
  return <>{booth ? formatBoothLocation(booth) : "-"}</>;
}

// Decorative per-row lookup: previously silently fell back to "-" on error
// or while loading, so it keeps that behavior instead of surfacing a
// snackbar per row.
function BoothCell({ teamId }: { teamId: string }) {
  return (
    <ErrorBoundary fallback="-">
      {/* clientOnly: queryFn is a Server Action — see SuspenseQueryBoundary */}
      <Suspense clientOnly fallback="-">
        <BoothCellContent teamId={teamId} />
      </Suspense>
    </ErrorBoundary>
  );
}

export function JudgeTeamList({ judgeId }: { judgeId: string }) {
  return (
    <SuspenseQueryBoundary>
      <JudgeTeamListContent judgeId={judgeId} />
    </SuspenseQueryBoundary>
  );
}

function JudgeTeamListContent({ judgeId }: { judgeId: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [liveTotal, setLiveTotal] = useState(0);
  const formRef = useRef<EvaluateTeamFormHandle>(null);

  const { data: teams } = useSuspenseQuery({
    queryKey: ["teams"],
    queryFn: listTeamsAction,
  });
  // One query for every team's evaluation by this judge, instead of a
  // separate request per row (status cell) + per open (bottom sheet).
  const { data: evaluations } = useSuspenseQuery({
    queryKey: ["evaluations"],
    queryFn: listEvaluationsAction,
  });
  const myEvaluations = evaluations.filter((e) => e.judgeId === judgeId);
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
                    <SuspenseQueryBoundary>
                      <EvaluateTeamForm
                        ref={formRef}
                        judgeId={judgeId}
                        team={activeTeam}
                        onSaved={refresh}
                        onTotalChange={setLiveTotal}
                      />
                    </SuspenseQueryBoundary>
                  )}
                </Box>
              </ScrollFog>
            </Box>
          </BottomSheetBody>
          {activeTeam && (
            <SnackbarAvoidOverlap>
              <BottomSheetFooter>
                <HStack
                  gap="x2"
                  width="full"
                  justify="space-between"
                  align="center"
                >
                  <Text textStyle="t6Bold">{`총점 ${liveTotal}점`}</Text>
                  <ActionButton
                    type="button"
                    variant="brandSolid"
                    size="large"
                    onClick={() => formRef.current?.save()}
                  >
                    저장
                  </ActionButton>
                </HStack>
              </BottomSheetFooter>
            </SnackbarAvoidOverlap>
          )}
        </BottomSheetContent>
      </BottomSheetRoot>
    </VStack>
  );
}
