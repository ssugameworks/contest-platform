"use client";

import { Box, Grid, HStack, Text, VStack } from "@seed-design/react";
import { useEffect, useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { getInvestorCount, mockLeaderboard } from "@/entities/investment";
import { mockInvestors, resetInvestors } from "@/entities/investor";
import { getScoreLeaderboard, resetScores } from "@/entities/score";
import { getTeamById, mockTeams, resetTeams } from "@/entities/team";
import { PageHeader } from "@/shared/ui/page-header";
import { StatCard } from "@/shared/ui/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "@/shared/ui/table";

// ponytail: polling stand-in for the eventual websocket-driven live feed —
// swap this interval for a socket subscription once that infra exists.
const LIVE_POLL_INTERVAL_MS = 4000;

export default function AdminDashboardOverviewPage() {
  const [, setVersion] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setVersion((v) => v + 1);
      setLastUpdated(new Date());
    }, LIVE_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const totalAmount = mockLeaderboard.reduce(
    (sum, entry) => sum + entry.amount,
    0,
  );
  const investmentLeaderboard = [...mockLeaderboard].sort(
    (a, b) => b.amount - a.amount,
  );
  const scoreLeaderboard = getScoreLeaderboard();
  const topTeam = scoreLeaderboard[0]
    ? getTeamById(scoreLeaderboard[0].teamId)
    : undefined;

  const handleReset = () => {
    resetTeams();
    resetInvestors();
    resetScores();
    setVersion((v) => v + 1);
  };

  return (
    <VStack gap="x6" width="full" px="spacingX.globalGutter" py="x6">
      <PageHeader
        title="관리자 대시보드"
        description="대회 현황을 한눈에 확인해요"
      />

      <ActionButton
        type="button"
        variant="neutralWeak"
        onClick={handleReset}
        style={{ alignSelf: "flex-start" }}
      >
        초기 데이터로 리셋
      </ActionButton>

      <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap="x4" width="full">
        <StatCard label="총 참가팀 수" value={`${mockTeams.length}팀`} />
        <StatCard label="총 투자자 수" value={`${mockInvestors.length}명`} />
        <StatCard
          label="총 투자금액"
          value={`${totalAmount.toLocaleString()}원`}
        />
        <StatCard label="현재 1위 팀" value={topTeam?.name ?? "-"} />
      </Grid>

      <VStack gap="x3" width="full">
        <HStack gap="x2" align="center" justify="space-between" width="full">
          <HStack gap="x2" align="center">
            <Box
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--seed-color-bg-positive-solid)",
              }}
            />
            <Text textStyle="t5Bold">실시간 투자 현황</Text>
          </HStack>
          <Text textStyle="t3Regular" color="fg.neutralSubtle">
            {`${lastUpdated.toLocaleTimeString("ko-KR")} 기준`}
          </Text>
        </HStack>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>팀명</TableHeadCell>
              <TableHeadCell align="right">모금액</TableHeadCell>
              <TableHeadCell align="right">투자자 수</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {investmentLeaderboard.map((entry) => (
              <TableRow key={entry.teamId}>
                <TableCell>
                  {getTeamById(entry.teamId)?.name ?? entry.teamId}
                </TableCell>
                <TableCell align="right">{`${entry.amount.toLocaleString()}원`}</TableCell>
                <TableCell align="right">{`${getInvestorCount(entry.teamId)}명`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </VStack>

      <VStack gap="x3" width="full">
        <Text textStyle="t5Bold">최종 순위 (상위 5팀)</Text>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>순위</TableHeadCell>
              <TableHeadCell>팀명</TableHeadCell>
              <TableHeadCell align="right">최종 점수</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scoreLeaderboard.slice(0, 5).map((entry, index) => (
              <TableRow key={entry.teamId}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {getTeamById(entry.teamId)?.name ?? entry.teamId}
                </TableCell>
                <TableCell align="right">{entry.finalScore}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </VStack>
    </VStack>
  );
}
