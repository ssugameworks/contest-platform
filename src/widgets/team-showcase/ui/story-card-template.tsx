"use client";

import { Badge, Box, HStack, Text, VStack } from "@seed-design/react";
import { Avatar } from "seed-design/ui/avatar";
import { IdentityPlaceholder } from "seed-design/ui/identity-placeholder";
import { type Booth, formatBoothLocation } from "@/entities/booth/model/pure";

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
  teamId,
}: {
  teamName: string;
  tags: string[];
  description: string;
  logoUrl: string | null;
  participantNames: string;
  booths: Booth[];
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
          <MiniBoothGrid booths={booths} teamId={teamId} />
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
          <Avatar size="80" src={logoUrl} fallback={<IdentityPlaceholder />} />
        ) : (
          <Avatar size="80" fallback={<IdentityPlaceholder />} />
        )}
      </HStack>
    </Box>
  );
}

// 스토리 카드 스케일(360x640, 3배 캡처)에서는 SEED Text 토큰 하한선보다도
// 작게 그려야 해서 공용 BoothFloorPlan을 그대로 못 씀 — 순수 div 기반의
// 작은 점 그리드로 충분해요(칸 하나하나 이름까지 안 보여도 되고, 전체
// 정보는 대시보드/랜딩페이지 모달에 이미 있음).
function MiniBoothGrid({
  booths,
  teamId,
}: {
  booths: Booth[];
  teamId: string;
}) {
  const visibleBooths = booths.filter((booth) => !booth.blocked);
  const zones = [...new Set(visibleBooths.map((booth) => booth.zone))].sort();
  return (
    <VStack gap="x3">
      {zones.map((zone) => (
        <HStack key={zone} gap="x3" wrap justify="center">
          {visibleBooths
            .filter((booth) => booth.zone === zone)
            .sort((a, b) => a.number - b.number)
            .map((booth) => (
              <div
                key={booth.id}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background:
                    booth.teamId === teamId
                      ? "var(--seed-color-bg-brand-solid)"
                      : booth.teamId
                        ? "rgba(255, 255, 255, 0.35)"
                        : "rgba(255, 255, 255, 0.12)",
                }}
              />
            ))}
        </HStack>
      ))}
    </VStack>
  );
}
