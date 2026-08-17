"use client";

import { Badge, Box, HStack, Text, VStack } from "@seed-design/react";
import { Avatar } from "seed-design/ui/avatar";
import { IdentityPlaceholder } from "seed-design/ui/identity-placeholder";

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
  linkLabel,
}: {
  teamName: string;
  tags: string[];
  description: string;
  logoUrl: string | null;
  linkLabel: string;
}) {
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

      <HStack justify="space-between" align="flex-end" width="full">
        <VStack gap="x1">
          <Text textStyle="t6Bold" color="fg.brand">
            GAMEWORKS
          </Text>
          <Text textStyle="t6Regular" color="fg.neutralSubtle">
            {linkLabel}
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
