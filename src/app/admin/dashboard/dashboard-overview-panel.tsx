"use client";

import { Box, Grid, HStack, Text, VStack } from "@seed-design/react";
import { useQuery } from "@tanstack/react-query";
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
import { type DashboardStats, getDashboardStats } from "./actions";

// ponytail: polling stand-in for the eventual websocket-driven live feed —
// swap this interval for a socket subscription once that infra exists.
const LIVE_POLL_INTERVAL_MS = 4000;

export function AdminDashboardOverviewPanel({
  initialStats,
}: {
  initialStats: DashboardStats;
}) {
  const { data: stats, dataUpdatedAt } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: getDashboardStats,
    initialData: initialStats,
    refetchInterval: LIVE_POLL_INTERVAL_MS,
  });

  const totalAmount = stats.totals.reduce(
    (sum, entry) => sum + entry.amount,
    0,
  );
  const investmentLeaderboard = [...stats.totals].sort(
    (a, b) => b.amount - a.amount,
  );
  const topTeam = stats.scoreLeaderboard[0]
    ? stats.teams.find((team) => team.id === stats.scoreLeaderboard[0].teamId)
    : undefined;
  const teamName = (teamId: string) =>
    stats.teams.find((team) => team.id === teamId)?.name ?? teamId;

  return (
    <VStack gap="x6" width="full" px="spacingX.globalGutter" py="x6">
      <PageHeader
        title="관리자 대시보드"
        description="대회 현황을 한눈에 확인해요"
      />

      <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap="x4" width="full">
        <StatCard label="총 참가팀 수" value={`${stats.teams.length}팀`} />
        <StatCard label="총 투자자 수" value={`${stats.investorsCount}명`} />
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
            {`${new Date(dataUpdatedAt).toLocaleTimeString("ko-KR")} 기준`}
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
                <TableCell>{teamName(entry.teamId)}</TableCell>
                <TableCell align="right">{`${entry.amount.toLocaleString()}원`}</TableCell>
                <TableCell align="right">{`${stats.investorCounts[entry.teamId] ?? 0}명`}</TableCell>
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
            {stats.scoreLeaderboard.slice(0, 5).map((entry, index) => (
              <TableRow key={entry.teamId}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{teamName(entry.teamId)}</TableCell>
                <TableCell align="right">{entry.finalScore}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </VStack>
    </VStack>
  );
}
