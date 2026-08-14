"use client";

import { Box, Text, VStack } from "@seed-design/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ActionButton } from "seed-design/ui/action-button";
import { getScoreLeaderboardAction } from "@/entities/score/model/actions";
import { listTeamsAction } from "@/entities/team/model/actions";

const QUERY_KEY = ["leaderboard"];

export default function LeaderboardPage() {
  const queryClient = useQueryClient();
  const { data: entries = [] } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getScoreLeaderboardAction,
  });
  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: listTeamsAction,
  });

  return (
    <Box
      display="flex"
      style={{
        minHeight: "100dvh",
        flexDirection: "column",
        alignItems: "center",
        background: "#0a0a0a",
      }}
      paddingY="x14"
      paddingX="x6"
    >
      <VStack gap="x2" width="full" style={{ maxWidth: 720 }}>
        <Text
          textStyle="t14Bold"
          style={{ color: "#fff", textAlign: "center" }}
        >
          실시간 순위
        </Text>
        <ActionButton
          type="button"
          variant="neutralOutline"
          style={{
            alignSelf: "center",
            marginBottom: "var(--seed-dimension-x8)",
          }}
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ["teams"] });
          }}
        >
          새로고침
        </ActionButton>

        <VStack gap="x3" width="full">
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
                    {index + 1}
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
                  {entry.finalScore}
                </Text>
              </Box>
            );
          })}
        </VStack>
      </VStack>
    </Box>
  );
}
