"use client";

import { Badge, Box, HStack, Text, VStack } from "@seed-design/react";
import { Avatar } from "seed-design/ui/avatar";
import { IdentityPlaceholder } from "seed-design/ui/identity-placeholder";
import {
  type Booth,
  type BoothMarker,
  type BoothMatrixConfig,
  buildBoothMatrix,
  formatBoothLocation,
} from "@/entities/booth/model/pure";
import { BOOTH_MARKER_META } from "@/entities/booth/ui/booth-marker-meta";

export const STORY_CARD_WIDTH = 360;
export const STORY_CARD_HEIGHT = 640;

// 인스타그램 스토리 카드. 실제 화면 크기(360x640, 9:16)로 SEED 컴포넌트를
// 그대로 그린 다음 build-story-card가 3배 해상도(1080x1920)로 캡처해요.
// data-seed-color-mode="dark-only"로 이 서브트리만 다크 테마로 고정해서,
// 보는 사람의 시스템 테마와 무관하게 항상 같은 카드가 나가게 했어요.
export function StoryCardTemplate({
  teamName,
  tags,
  description,
  logoUrl,
  participantNames,
  booths,
  markers = [],
  matrixConfig,
  teamId,
}: {
  teamName: string;
  tags: string[];
  description: string;
  logoUrl: string | null;
  participantNames: string;
  booths: Booth[];
  markers?: BoothMarker[];
  matrixConfig?: BoothMatrixConfig;
  teamId: string;
}) {
  const myBooth = booths.find((booth) => booth.teamId === teamId);

  return (
    <Box
      data-seed-color-mode="dark-only"
      bg="bg.layerDefault"
      width={`${STORY_CARD_WIDTH}px`}
      height={`${STORY_CARD_HEIGHT}px`}
      px="x6"
      py="x8"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <VStack gap="x5" width="full">
        <HStack gap="x2" wrap>
          {tags.slice(0, 3).map((tag, index) => (
            <Badge
              key={tag}
              tone={index === 0 ? "brand" : "neutral"}
              variant={index === 0 ? "solid" : "weak"}
            >
              {tag}
            </Badge>
          ))}
        </HStack>
        <VStack gap="x3" width="full">
          <Text textStyle="t14Bold" color="fg.neutral">
            {teamName}
          </Text>
          {description && (
            <Text textStyle="t7Regular" color="fg.neutralSubtle">
              {description}
            </Text>
          )}
        </VStack>
      </VStack>

      {myBooth && (
        <Box
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MiniBoothGrid
            booths={booths}
            markers={markers}
            matrixConfig={matrixConfig}
            teamId={teamId}
          />
        </Box>
      )}

      <HStack justify="space-between" align="flex-end" width="full">
        <VStack gap="x1">
          <Text textStyle="t6Bold" color="fg.brand">
            {myBooth ? `부스 ${formatBoothLocation(myBooth)}` : "GAMEWORKS"}
          </Text>
          <Text textStyle="t6Regular" color="fg.neutralSubtle">
            {participantNames}
          </Text>
          <Text textStyle="t6Bold" color="fg.neutral">
            이 팀에 투자해보세요.
          </Text>
        </VStack>
        {logoUrl ? (
          <Avatar
            size="80"
            src={logoUrl}
            crossOrigin="anonymous"
            fallback={<IdentityPlaceholder identity="business" />}
          />
        ) : (
          <Avatar
            size="80"
            fallback={<IdentityPlaceholder identity="business" />}
          />
        )}
      </HStack>
    </Box>
  );
}

// 스토리 카드 스케일(360x640, 3배 캡처)에서는 행사장 전체 배치를 2D 행/열 매트릭스로
// 정확히 정렬해 보여줘요. 빈 자리나 통로는 투명 셀로 자리를 유지해 행이 흐트러지지 않아요.
function MiniBoothGrid({
  booths,
  markers = [],
  matrixConfig,
  teamId,
}: {
  booths: Booth[];
  markers?: BoothMarker[];
  matrixConfig?: BoothMatrixConfig;
  teamId: string;
}) {
  const { columns, grid } = buildBoothMatrix(booths, markers, matrixConfig);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: 6,
        width: "100%",
        maxWidth: `${Math.min(312, columns * 32)}px`,
      }}
    >
      {grid.map((row) =>
        row.map(({ zone, number, booth, marker }) => {
          if (booth?.teamId === teamId) {
            return (
              <div
                key={`${zone}-${number}`}
                style={{
                  aspectRatio: "1 / 1",
                  borderRadius: 6,
                  background: "var(--seed-color-bg-brand-solid)",
                }}
              />
            );
          }

          if (booth?.teamId) {
            return (
              <div
                key={`${zone}-${number}`}
                style={{
                  aspectRatio: "1 / 1",
                  borderRadius: 6,
                  background: "rgba(255, 255, 255, 0.35)",
                }}
              />
            );
          }

          if (marker) {
            const meta = BOOTH_MARKER_META[marker.kind];
            const Icon = meta?.Icon;
            return (
              <div
                key={`${zone}-${number}`}
                style={{
                  aspectRatio: "1 / 1",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.12)",
                  color: "rgba(255, 255, 255, 0.75)",
                }}
              >
                {Icon ? <Icon width="60%" height="60%" /> : null}
              </div>
            );
          }

          if (booth) {
            return (
              <div
                key={`${zone}-${number}`}
                style={{
                  aspectRatio: "1 / 1",
                  borderRadius: 6,
                  background: "rgba(255, 255, 255, 0.12)",
                }}
              />
            );
          }

          return (
            <div
              key={`${zone}-${number}`}
              style={{
                aspectRatio: "1 / 1",
              }}
            />
          );
        }),
      )}
    </div>
  );
}
