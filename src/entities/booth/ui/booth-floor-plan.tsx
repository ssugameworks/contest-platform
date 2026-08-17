"use client";

import { Box, HStack, Text, VStack } from "@seed-design/react";
import type { Booth } from "../model/pure";

// zone마다 number 범위가 다를 수 있어서 zone 전체를 아우르는 정사각 그리드
// 대신, zone별로 한 행을 만들고 그 안에서만 number 순으로 wrap해요.
export function BoothFloorPlan({
  booths,
  teams,
  highlightTeamId,
}: {
  booths: Booth[];
  teams: { id: string; name: string }[];
  highlightTeamId?: string | null;
}) {
  // 막힌 자리는 관리자 화면에만 보이고, 여기선 아예 없는 자리처럼 취급해요.
  const visibleBooths = booths.filter((booth) => !booth.blocked);
  const teamNameById = new Map(teams.map((team) => [team.id, team.name]));
  const zones = [...new Set(visibleBooths.map((booth) => booth.zone))].sort();

  if (zones.length === 0) {
    return (
      <Text textStyle="t4Regular" color="fg.neutralSubtle">
        아직 만들어진 부스가 없어요
      </Text>
    );
  }

  return (
    <VStack gap="x3" width="full">
      {zones.map((zone) => (
        <HStack key={zone} gap="x2" align="center" wrap>
          <Text textStyle="t4Bold" style={{ width: 24 }}>
            {zone}
          </Text>
          {visibleBooths
            .filter((booth) => booth.zone === zone)
            .sort((a, b) => a.number - b.number)
            .map((booth) => {
              const teamName = booth.teamId
                ? (teamNameById.get(booth.teamId) ?? "알 수 없는 팀")
                : null;
              const isHighlighted =
                !!highlightTeamId && booth.teamId === highlightTeamId;
              return (
                <Box
                  key={booth.id}
                  borderRadius="r2"
                  px="x3"
                  py="x2"
                  style={{
                    minWidth: 96,
                    border: isHighlighted
                      ? "2px solid var(--seed-color-stroke-brand-solid)"
                      : "1px solid var(--seed-color-stroke-neutral-weak)",
                    background: isHighlighted
                      ? "var(--seed-color-bg-brand-weak)"
                      : "var(--seed-color-bg-layer-default)",
                  }}
                >
                  <Text textStyle="t5Bold">{booth.number}</Text>
                  <Text
                    textStyle="t3Regular"
                    color={teamName ? "fg.neutral" : "fg.neutralSubtle"}
                  >
                    {teamName ?? "빈자리"}
                  </Text>
                </Box>
              );
            })}
        </HStack>
      ))}
    </VStack>
  );
}
