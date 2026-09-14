"use client";

import NumberFlow from "@number-flow/react";
import { Box, Text, VStack } from "@seed-design/react";
import { useQueryClient } from "@tanstack/react-query";
import { getScoreLeaderboardAction } from "@/entities/score/model/actions";
import { listTeamsAction } from "@/entities/team/model/actions";
import { useSuspenseQuery } from "@/shared/lib/query/use-suspense-query";
import { useRealtimeRefetch } from "@/shared/lib/supabase/use-realtime-refetch";
import { LoadingSpinner } from "@/shared/ui/loading-spinner";
import { SuspenseQueryBoundary } from "@/shared/ui/suspense-query-boundary";

const QUERY_KEY = ["leaderboard"];
const REALTIME_TABLES = [
  "teams",
  "transactions",
  "judge_evaluations",
  "app_settings",
];

const darkPageStyle = {
  minHeight: "100dvh",
  flexDirection: "column" as const,
  alignItems: "center" as const,
  background: "#0a0a0a",
};

export default function LeaderboardPage() {
  return (
    <Box display="flex" style={darkPageStyle} paddingY="x14" paddingX="x6">
      <SuspenseQueryBoundary
        loadingFallback={<LoadingSpinner size="40" tone="staticWhite" />}
      >
        <LeaderboardContent />
      </SuspenseQueryBoundary>
    </Box>
  );
}

function LeaderboardContent() {
  const queryClient = useQueryClient();
  const { data: entries } = useSuspenseQuery({
    queryKey: QUERY_KEY,
    queryFn: getScoreLeaderboardAction,
  });
  const { data: teams } = useSuspenseQuery({
    queryKey: ["teams"],
    queryFn: listTeamsAction,
  });

  useRealtimeRefetch("leaderboard-realtime", REALTIME_TABLES, () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ["teams"] });
  });

  return (
    <VStack gap="x2" width="full" style={{ maxWidth: 720 }}>
      <Text textStyle="t14Bold" style={{ color: "#fff", textAlign: "center" }}>
        실시간 순위
      </Text>

      <VStack
        gap="x3"
        width="full"
        style={{ marginTop: "var(--seed-dimension-x8)" }}
      >
        {entries.map((entry, index) => {
          const team = teams.find((t) => t.id === entry.teamId);
          const isTop = index === 0;
          return (
            <Box
              key={entry.teamId}
              display="flex"
              width="full"
              style={{
                alignItems: "center",
                justifyContent: "space-between",
                background: isTop ? "#ffffff" : "#1a1a1a",
                borderRadius: "var(--seed-radius-r3)",
              }}
              paddingX="x6"
              paddingY="x5"
            >
              <Box display="flex" style={{ alignItems: "center", gap: 20 }}>
                <Text
                  textStyle={isTop ? "t13Bold" : "t9Bold"}
                  style={{ color: isTop ? "#0a0a0a" : "#fff", width: 48 }}
                >
                  <NumberFlow value={index + 1} />
                </Text>
                <Text
                  textStyle={isTop ? "t12Bold" : "t8Bold"}
                  style={{ color: isTop ? "#0a0a0a" : "#fff" }}
                >
                  {team?.name ?? entry.teamId}
                </Text>
              </Box>
              <Text
                textStyle={isTop ? "t12Bold" : "t8Bold"}
                style={{
                  color: isTop ? "#0a0a0a" : "var(--seed-color-fg-brand)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <NumberFlow value={entry.finalScore} />
              </Text>
            </Box>
          );
        })}
      </VStack>
    </VStack>
  );
}
