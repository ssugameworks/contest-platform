"use client";

import IconCheckmarkClipboardLine from "@karrotmarket/react-monochrome-icon/IconCheckmarkClipboardLine";
import {
  Badge,
  Box,
  Divider,
  Grid,
  HStack,
  ImageFrame,
  ScrollFog,
  Text,
  VStack,
} from "@seed-design/react";
import { IconKakaoTalk } from "seed-design/icon/icon-kakaotalk";
import { ActionButton } from "seed-design/ui/action-button";
import { Avatar, AvatarStack } from "seed-design/ui/avatar";
import { IdentityPlaceholder } from "seed-design/ui/identity-placeholder";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import { type Booth, formatBoothLocation } from "@/entities/booth/model/pure";
import type { Participant } from "@/entities/participant";
import type { Team } from "@/entities/team";
import { InvestButton } from "@/features/invest-in-team";
import { PageHeader } from "@/shared/ui/page-header";
import { StatCard } from "@/shared/ui/stat-card";
import { InvestmentTransactions } from "@/widgets/investment-transactions";

export function TeamShowcase({
  team,
  booth,
  rank,
  investorCount,
  amount,
  members,
}: {
  team: Team;
  booth: Booth | null;
  rank: number;
  investorCount: number;
  amount: number;
  members: Participant[];
}) {
  const adapter = useSnackbarAdapter();

  const shareStub = () => {
    adapter.create({
      onClose: () => {},
      render: () => <Snackbar message="아직 연결되지 않았어요" />,
    });
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    adapter.create({
      onClose: () => {},
      render: () => <Snackbar message="링크를 복사했어요" />,
    });
  };

  return (
    <Box
      display="flex"
      style={{ flexDirection: "column", height: "100dvh" }}
      width="full"
    >
      <Box maxHeight="full" overflowY="auto" width="full">
        <ScrollFog placement={["top", "bottom"]}>
          <VStack
            gap="x8"
            width="full"
            maxWidth="720px"
            style={{ marginInline: "auto" }}
            px="spacingX.globalGutter"
            pt="20px"
            pb="80px"
          >
            {/* 헤더 */}
            <VStack gap="x3" width="full">
              <HStack gap="x2" wrap>
                {team.tags.map((tag) => (
                  <Badge key={tag} tone="neutral" variant="weak">
                    {tag}
                  </Badge>
                ))}
              </HStack>
              <HStack gap="x3" align="center" width="full">
                <Avatar
                  size="48"
                  src={team.imageUrl ?? undefined}
                  fallback={<IdentityPlaceholder />}
                />
                <PageHeader title={team.name} description={team.description} />
              </HStack>
            </VStack>

            <Divider />

            {/* 통계 */}
            <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap="x4" width="full">
              <StatCard label="모금액" value={`${amount.toLocaleString()}원`} />
              <StatCard label="투자자 수" value={`${investorCount}명`} />
              <StatCard label="투자 등수" value={`${rank}위`} />
              <StatCard
                label="부스 위치"
                value={booth ? formatBoothLocation(booth) : "-"}
              />
            </Grid>

            <Divider />

            {/* 구성원 */}
            <VStack gap="x3" width="full">
              <Text textStyle="t5Bold">팀 구성원</Text>
              <HStack gap="x3" align="center" wrap>
                <AvatarStack size="36">
                  {members.map((member) => (
                    <Avatar
                      key={member.studentId}
                      fallback={<IdentityPlaceholder />}
                    />
                  ))}
                </AvatarStack>
                <Text textStyle="t4Regular" color="fg.neutralSubtle">
                  {members.map((member) => member.name).join(", ")}
                </Text>
              </HStack>
            </VStack>

            {/* 스크린샷 */}
            {team.screenshotUrls.length > 0 && (
              <VStack gap="x3" width="full">
                <Text textStyle="t5Bold">제품 화면</Text>
                <Grid columns={{ base: 1, sm: 3 }} gap="x3" width="full">
                  {team.screenshotUrls.map((url) => (
                    <ImageFrame
                      key={url}
                      src={url}
                      alt={`${team.name} 제품 화면`}
                      ratio={4 / 3}
                      borderRadius="r2"
                    />
                  ))}
                </Grid>
              </VStack>
            )}

            {/* 랜딩페이지 */}
            {team.landingPageUrl && (
              <ActionButton variant="neutralWeak" className="w-full" asChild>
                <a
                  href={team.landingPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  팀 랜딩페이지 방문하기
                </a>
              </ActionButton>
            )}

            <Divider />

            {/* 최근 투자 내역 (익명) */}
            <VStack gap="x3" width="full">
              <Text textStyle="t5Bold">최근 투자 내역</Text>
              <InvestmentTransactions teamId={team.id} anonymize />
            </VStack>

            <Divider />

            {/* 공유 */}
            <VStack gap="x3" width="full">
              <Text textStyle="t5Bold">이 팀 공유하기</Text>
              <HStack gap="x3">
                <ActionButton variant="neutralWeak" onClick={shareStub}>
                  <IconKakaoTalk width={16} height={16} />
                  카카오톡 공유
                </ActionButton>
                <ActionButton variant="neutralWeak" onClick={copyLink}>
                  <IconCheckmarkClipboardLine width={16} height={16} />
                  링크 복사
                </ActionButton>
              </HStack>
            </VStack>
          </VStack>
        </ScrollFog>
      </Box>

      {/* 투자하기 — ScrollFog 밖에 고정, 콘텐츠는 뒤에서 스크롤 */}
      <Box
        bg="bg.layerDefault"
        width="full"
        px="spacingX.globalGutter"
        py="x4"
        style={{ paddingBottom: "calc(var(--seed-safe-area-bottom) + 16px)" }}
      >
        <Box width="full" style={{ maxWidth: "720px", marginInline: "auto" }}>
          <InvestButton teamId={team.id} teamName={team.name} />
        </Box>
      </Box>
    </Box>
  );
}
