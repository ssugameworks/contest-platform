"use client";

import { Box, Divider, Grid, HStack, Text, VStack } from "@seed-design/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { orderBy, sumBy } from "es-toolkit";
import { useRealtimeRefetch } from "@/shared/lib/supabase/use-realtime-refetch";
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

const QUERY_KEY = ["admin-dashboard-stats"];
// investors/participants/staff aren't anon-readable (PII, RLS locked down),
// so investorsCount never updates live — only on next page load.
const REALTIME_TABLES = [
  "teams",
  "transactions",
  "judge_evaluations",
  "app_settings",
];

export function AdminDashboardOverviewPanel({
  initialStats,
}: {
  initialStats: DashboardStats;
}) {
  const queryClient = useQueryClient();
  const { data: stats, dataUpdatedAt } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getDashboardStats,
    initialData: initialStats,
  });

  const isLive = useRealtimeRefetch(
    "admin-dashboard-realtime",
    REALTIME_TABLES,
    () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  );

  const totalAmount = sumBy(stats.totals, (entry) => entry.amount);
  const investmentLeaderboard = orderBy(stats.totals, ["amount"], ["desc"]);
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

      <Divider />

      <VStack gap="x3" width="full">
        <HStack gap="x2" align="center" justify="space-between" width="full">
          <HStack gap="x2" align="center">
            <Box
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: isLive
                  ? "var(--seed-color-bg-positive-solid)"
                  : "var(--seed-color-bg-neutral-solid)",
              }}
            />
            <Text textStyle="t5Bold">투자 현황</Text>
          </HStack>
          <Text textStyle="t3Regular" color="fg.neutralSubtle">
            {`${new Date(dataUpdatedAt).toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul" })} 기준`}
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

      <Divider />

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
