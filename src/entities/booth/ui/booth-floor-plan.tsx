"use client";

import { Box, HStack, Text, VStack } from "@seed-design/react";
import type { Booth, BoothMarker } from "../model/pure";
import { BOOTH_MARKER_META } from "./booth-marker-meta";

// zone마다 number 범위가 다를 수 있어서 zone 전체를 아우르는 정사각 그리드
// 대신, zone별로 한 행을 만들고 그 안에서만 number 순으로 wrap해요.
export function BoothFloorPlan({
  booths,
  teams,
  markers = [],
  highlightTeamId,
}: {
  booths: Booth[];
  teams: { id: string; name: string }[];
  markers?: BoothMarker[];
  highlightTeamId?: string | null;
}) {
  // 막힌 자리는 관리자 화면에만 보이고, 여기선 아예 없는 자리처럼 취급해요.
  const visibleBooths = booths.filter((booth) => !booth.blocked);
  const teamNameById = new Map(teams.map((team) => [team.id, team.name]));
  const zones = [
    ...new Set([
      ...visibleBooths.map((booth) => booth.zone),
      ...markers.map((marker) => marker.zone),
    ]),
  ].sort();

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
          {[
            ...visibleBooths
              .filter((booth) => booth.zone === zone)
              .map((booth) => ({ type: "booth" as const, booth })),
            ...markers
              .filter((marker) => marker.zone === zone)
              .map((marker) => ({ type: "marker" as const, marker })),
          ]
            .sort((a, b) => {
              const numberA =
                a.type === "booth" ? a.booth.number : a.marker.number;
              const numberB =
                b.type === "booth" ? b.booth.number : b.marker.number;
              return numberA - numberB;
            })
            .map((item) => {
              if (item.type === "marker") {
                const { label, Icon } = BOOTH_MARKER_META[item.marker.kind];
                return (
                  <Box
                    key={`marker-${item.marker.zone}-${item.marker.number}`}
                    borderRadius="r2"
                    px="x3"
                    py="x2"
                    display="flex"
                    style={{
                      minWidth: 96,
                      alignItems: "center",
                      gap: 6,
                      border:
                        "1px dashed var(--seed-color-stroke-neutral-weak)",
                      background: "var(--seed-color-bg-neutral-weak)",
                    }}
                  >
                    <Icon width={16} height={16} />
                    <Text textStyle="t3Regular" color="fg.neutral">
                      {label}
                    </Text>
                  </Box>
                );
              }
              const { booth } = item;
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
