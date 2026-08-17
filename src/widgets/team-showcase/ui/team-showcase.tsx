"use client";

import IconCheckmarkClipboardLine from "@karrotmarket/react-monochrome-icon/IconCheckmarkClipboardLine";
import {
  Badge,
  Box,
  Divider,
  Grid,
  HStack,
  ScrollFog,
  Text,
  VStack,
} from "@seed-design/react";
import Link from "next/link";
import { useState } from "react";
import { IconInstagram } from "seed-design/icon/icon-instagram";
import { IconKakaoTalk } from "seed-design/icon/icon-kakaotalk";
import { ActionButton } from "seed-design/ui/action-button";
import { Avatar, AvatarStack } from "seed-design/ui/avatar";
import { HelpBubbleAnchor } from "seed-design/ui/help-bubble";
import { IdentityPlaceholder } from "seed-design/ui/identity-placeholder";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import {
  type Booth,
  type BoothMarker,
  type BoothMatrixConfig,
  formatBoothLocation,
} from "@/entities/booth/model/pure";
import type { Participant } from "@/entities/participant";
import type { CurrentUser } from "@/entities/session";
import type { Team } from "@/entities/team";
import { InvestButton } from "@/features/invest-in-team";
import { PageHeader } from "@/shared/ui/page-header";
import { StatCard } from "@/shared/ui/stat-card";
import { BoothFloorPlanSheet } from "@/widgets/booth-floor-plan-dialog";
import { InvestmentTransactions } from "@/widgets/investment-transactions";
import { shareToInstagramStory } from "../model/share-to-instagram-story";

export function TeamShowcase({
  team,
  booth,
  booths,
  markers = [],
  matrixConfig,
  rank,
  investorCount,
  amount,
  members,
  currentUser,
  isJudge,
}: {
  team: Team;
  booth: Booth | null;
  booths: Booth[];
  markers?: BoothMarker[];
  matrixConfig?: BoothMatrixConfig;
  rank: number;
  investorCount: number;
  amount: number;
  members: Participant[];
  currentUser: CurrentUser | null;
  isJudge: boolean;
}) {
  const adapter = useSnackbarAdapter();
  const [isSharingStory, setIsSharingStory] = useState(false);
  const [floorPlanOpen, setFloorPlanOpen] = useState(false);

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

  const shareStory = async () => {
    setIsSharingStory(true);
    try {
      const outcome = await shareToInstagramStory({
        teamName: team.name,
        tags: team.tags,
        description: team.description,
        logoUrl: team.imageUrl,
        url: window.location.href,
        participantNames: members.map((member) => member.name).join(", "),
        booths,
        markers,
        matrixConfig,
        teamId: team.id,
      });
      if (outcome === "downloaded") {
        adapter.create({
          onClose: () => {},
          render: () => (
            <Snackbar message="스토리 이미지를 저장했어요. 인스타그램에서 직접 올려주세요" />
          ),
        });
      }
    } catch (error) {
      // 사용자가 공유 시트를 취소한 경우(AbortError)는 실패가 아니에요.
      if (error instanceof Error && error.name === "AbortError") return;
      adapter.create({
        onClose: () => {},
        render: () => <Snackbar message="스토리 공유에 실패했어요" />,
      });
    } finally {
      setIsSharingStory(false);
    }
  };

  const bottomAction = isJudge ? null : !currentUser ? (
    <HelpBubbleAnchor
      defaultOpen
      title="학번과 이름을 입력하고 이 팀에 투자해요"
      placement="top"
      closeOnInteractOutside={false}
    >
      <ActionButton
        variant="brandSolid"
        size="large"
        className="w-full"
        asChild
      >
        <Link href="/login">투자하기</Link>
      </ActionButton>
    </HelpBubbleAnchor>
  ) : currentUser.kind === "investor" ? (
    <InvestButton teamId={team.id} teamName={team.name} />
  ) : currentUser.teamId === team.id ? (
    <HStack gap="x2" width="full">
      <ActionButton
        variant="neutralWeak"
        size="large"
        flexGrow={1}
        onClick={copyLink}
      >
        공유
      </ActionButton>

      <ActionButton variant="brandSolid" size="large" flexGrow={3} asChild>
        <Link href="/participant/dashboard">대시보드</Link>
      </ActionButton>
    </HStack>
  ) : null;

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
            <Grid columns={4} gap="x4" width="full">
              <StatCard label="모금액" value={`${amount.toLocaleString()}원`} />
              <StatCard label="투자자 수" value={`${investorCount}명`} />
              <StatCard label="투자 등수" value={`${rank}위`} />
              <Box
                onClick={() => setFloorPlanOpen(true)}
                style={{ cursor: "pointer" }}
              >
                <StatCard
                  label="부스 위치"
                  value={booth ? formatBoothLocation(booth) : "-"}
                />
              </Box>
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

            {/* 스크린샷 — 스마트폰(세로)·데스크톱(가로) 화면비가 섞여 있어서
                고정 비율로 잘라내는 대신, 높이만 맞추고 가로로 스크롤하는
                갤러리로 원본 비율 그대로 보여줌 */}
            {team.screenshotUrls.length > 0 && (
              <VStack gap="x3" width="full">
                <Text textStyle="t5Bold">제품 화면</Text>
                <ScrollFog placement={["left", "right"]}>
                  <HStack
                    gap="x3"
                    style={{
                      overflowX: "auto",
                      scrollSnapType: "x mandatory",
                      paddingInline: "12px",
                    }}
                  >
                    {team.screenshotUrls.map((url) => (
                      <Box
                        key={url}
                        borderRadius="r2"
                        style={{
                          flexShrink: 0,
                          overflow: "hidden",
                          scrollSnapAlign: "center",
                        }}
                      >
                        {/* biome-ignore lint/performance/noImgElement: 스마트폰/데스크톱
                            화면비가 섞여 있어 ImageFrame의 고정 비율 크롭을 쓸 수 없음 */}
                        <img
                          src={url}
                          alt={`${team.name} 제품 화면`}
                          style={{
                            display: "block",
                            height: 360,
                            width: "auto",
                            maxWidth: "min(80vw, 640px)",
                            maxHeight: "60vh",
                            objectFit: "contain",
                          }}
                        />
                      </Box>
                    ))}
                  </HStack>
                </ScrollFog>
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
              <HStack gap="x3" wrap>
                <ActionButton variant="neutralWeak" onClick={shareStub}>
                  <IconKakaoTalk width={16} height={16} />
                  카카오톡 공유
                </ActionButton>
                <ActionButton
                  variant="neutralWeak"
                  onClick={shareStory}
                  loading={isSharingStory}
                >
                  <IconInstagram width={16} height={16} />
                  인스타그램 스토리
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

      {/* 하단 액션 — ScrollFog 밖에 고정, 콘텐츠는 뒤에서 스크롤. 세션에
          따라 로그인 유도/매수매도/공유 중 하나로 바뀌고, 다른 팀
          참가자거나 심사위원이면 아예 렌더링하지 않는다. */}
      {bottomAction && (
        <Box
          bg="bg.layerDefault"
          width="full"
          px="spacingX.globalGutter"
          py="x4"
          style={{
            paddingBottom: "calc(var(--seed-safe-area-bottom) + 16px)",
          }}
        >
          <Box width="full" style={{ maxWidth: "720px", marginInline: "auto" }}>
            {bottomAction}
          </Box>
        </Box>
      )}

      <BoothFloorPlanSheet
        open={floorPlanOpen}
        onOpenChange={setFloorPlanOpen}
        highlightTeamId={team.id}
      />
    </Box>
  );
}
