"use client";

import NumberFlow from "@number-flow/react";
import { Box, Divider, Grid, HStack, Text, VStack } from "@seed-design/react";
import { useQueryClient } from "@tanstack/react-query";
import { orderBy, sumBy } from "es-toolkit";
import { useSuspenseQuery } from "@/shared/lib/query/use-suspense-query";
import { useRealtimeRefetch } from "@/shared/lib/supabase/use-realtime-refetch";
import { PageHeader } from "@/shared/ui/page-header";
import { StatCard } from "@/shared/ui/stat-card";
import { SuspenseQueryBoundary } from "@/shared/ui/suspense-query-boundary";
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

export function AdminDashboardOverviewPanel(props: {
  initialStats: DashboardStats;
}) {
  return (
    // initialData seeds the query synchronously, so this never suspends on
    // first render — safe to keep full SSR unlike the other boundaries.
    <SuspenseQueryBoundary clientOnly={false}>
      <AdminDashboardOverviewPanelContent {...props} />
    </SuspenseQueryBoundary>
  );
}

function AdminDashboardOverviewPanelContent({
  initialStats,
}: {
  initialStats: DashboardStats;
}) {
  const queryClient = useQueryClient();
  const { data: stats, dataUpdatedAt } = useSuspenseQuery({
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
        <StatCard
          label="총 참가팀 수"
          value={<NumberFlow value={stats.teams.length} suffix="팀" />}
        />
        <StatCard
          label="총 투자자 수"
          value={<NumberFlow value={stats.investorsCount} suffix="명" />}
        />
        <StatCard
          label="총 투자금액"
          value={<NumberFlow value={totalAmount} suffix="원" locales="ko-KR" />}
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
                <TableCell align="right">
                  <NumberFlow
                    value={entry.amount}
                    suffix="원"
                    locales="ko-KR"
                  />
                </TableCell>
                <TableCell align="right">
                  <NumberFlow
                    value={stats.investorCounts[entry.teamId] ?? 0}
                    suffix="명"
                  />
                </TableCell>
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
                <TableCell>
                  <NumberFlow value={index + 1} />
                </TableCell>
                <TableCell>{teamName(entry.teamId)}</TableCell>
                <TableCell align="right">
                  <NumberFlow value={entry.finalScore} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </VStack>
    </VStack>
  );
}
