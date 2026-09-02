"use client";

import { Box, HStack, Text, VStack } from "@seed-design/react";
import type { ComponentType, SVGProps } from "react";
import {
  type Booth,
  type BoothMarker,
  type BoothMatrixConfig,
  buildBoothMatrix,
} from "../model/pure";
import { BOOTH_MARKER_META } from "./booth-marker-meta";

const CELL_MIN_SIZE = 36;
const CELL_MAX_SIZE = 64;
const LABEL_WIDTH = 24;

// 어드민 매트릭스 편집기(admin-booth-grid)와 같은 격자 언어(구역=행,
// 번호=열, 정사각 셀)를 그대로 써서, 관리자가 배치한 모양이 참가자·심사위원
// 눈에 보이는 배치도와 항상 똑같이 보이게 해요. 다만 여기는 읽기 전용이라
// 클릭 편집 대신 hover/tap 시 title 툴팁으로 팀 이름만 보여줘요.
export function BoothFloorPlan({
  booths,
  teams,
  markers = [],
  matrixConfig,
  highlightTeamId,
}: {
  booths: Booth[];
  teams: { id: string; name: string }[];
  markers?: BoothMarker[];
  matrixConfig?: BoothMatrixConfig;
  highlightTeamId?: string | null;
}) {
  const teamNameById = new Map(teams.map((team) => [team.id, team.name]));
  const { zones, columns, grid } = buildBoothMatrix(
    booths,
    markers,
    matrixConfig,
  );
  const presentMarkerKinds = [...new Set(markers.map((marker) => marker.kind))];

  if (zones.length === 0) {
    return (
      <Text textStyle="t4Regular" color="fg.neutralSubtle">
        아직 만들어진 부스가 없어요
      </Text>
    );
  }

  return (
    <VStack gap="x4" width="full">
      <Box style={{ overflowX: "auto", width: "100%" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `${LABEL_WIDTH}px repeat(${columns}, minmax(${CELL_MIN_SIZE}px, ${CELL_MAX_SIZE}px))`,
            gap: 4,
            width: "100%",
            justifyContent: "center",
          }}
        >
          {zones.map((zone, zoneIndex) => (
            <div
              key={zone}
              style={{
                gridColumn: 1,
                gridRow: zoneIndex + 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              {zone}
            </div>
          ))}
          {grid.flatMap((row, zoneIndex) =>
            row.map(({ number, booth, marker }) => {
              if (!booth && !marker) {
                return (
                  <div
                    key={`${zones[zoneIndex]}-${number}`}
                    style={{ gridColumn: number + 1, gridRow: zoneIndex + 1 }}
                  />
                );
              }

              const markerMeta = marker
                ? BOOTH_MARKER_META[marker.kind]
                : undefined;
              const isMine =
                !!highlightTeamId && booth?.teamId === highlightTeamId;
              const teamName = booth?.teamId
                ? (teamNameById.get(booth.teamId) ?? "알 수 없는 팀")
                : undefined;

              return (
                <div
                  key={`${zones[zoneIndex]}-${number}`}
                  title={markerMeta ? markerMeta.label : teamName}
                  style={{
                    gridColumn: number + 1,
                    gridRow: zoneIndex + 1,
                    aspectRatio: "1 / 1",
                    width: "100%",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    ...(markerMeta
                      ? {
                          background: "var(--seed-color-bg-neutral-weak)",
                          color: "var(--seed-color-fg-neutral)",
                        }
                      : isMine
                        ? {
                            background: "var(--seed-color-bg-brand-solid)",
                          }
                        : teamName
                          ? { background: "var(--seed-color-bg-neutral-weak)" }
                          : {
                              background:
                                "var(--seed-color-bg-neutral-weak-alpha)",
                            }),
                  }}
                >
                  {markerMeta && <markerMeta.Icon width="60%" height="60%" />}
                </div>
              );
            }),
          )}
        </div>
      </Box>

      {presentMarkerKinds.length > 0 && (
        <HStack gap="x4" wrap>
          {presentMarkerKinds.map((kind) => {
            const meta = BOOTH_MARKER_META[kind];
            return (
              <MarkerLegendItem
                key={kind}
                icon={meta.Icon}
                label={meta.label}
              />
            );
          })}
        </HStack>
      )}
    </VStack>
  );
}

function MarkerLegendItem({
  icon: Icon,
  label,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
}) {
  return (
    <HStack gap="x1" align="center">
      <Icon
        width={14}
        height={14}
        style={{ color: "var(--seed-color-fg-neutral)" }}
      />
      <Text textStyle="t3Regular" color="fg.neutralSubtle">
        {label}
      </Text>
    </HStack>
  );
}
