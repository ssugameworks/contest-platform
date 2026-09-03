import IconChevronRightSmallLine from "@karrotmarket/react-monochrome-icon/IconChevronRightSmallLine";
import { Badge, Grid, HStack, Text, VStack } from "@seed-design/react";
import Link from "next/link";
import { Avatar, AvatarStack } from "seed-design/ui/avatar";
import { ContentPlaceholder } from "seed-design/ui/content-placeholder";
import { IdentityPlaceholder } from "seed-design/ui/identity-placeholder";
import { List, ListDivider } from "seed-design/ui/list";
import { formatBoothLocation, listBooths } from "@/entities/booth";
import { listParticipants } from "@/entities/participant";
import { listTeams } from "@/entities/team";
import { TeamsTopNav } from "@/widgets/teams-top-nav";
import { TeamListPagination } from "./team-list-pagination";

const PAGE_SIZE = 10;
const SCREENSHOT_GRID_SIZE = 4;

export default async function TeamListPage(props: PageProps<"/teams">) {
  const { page: pageParam } = await props.searchParams;
  const [teams, participants, booths] = await Promise.all([
    listTeams(),
    listParticipants(),
    listBooths(),
  ]);

  const totalPages = Math.max(1, Math.ceil(teams.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const pageTeams = teams.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <TeamsTopNav variant="root" title="팀 목록" />

      <VStack
        gap="x6"
        width="full"
        maxWidth="720px"
        style={{ marginInline: "auto" }}
        px="spacingX.globalGutter"
        py="x8"
      >
        <Text color="fg.neutralSubtle">출전 중인 팀을 둘러보세요</Text>

        {pageTeams.length > 0 ? (
          <List width="full">
            {pageTeams.flatMap((team, index) => {
              const members = team.memberIds
                .map((id) => participants.find((p) => p.studentId === id))
                .filter((p) => p !== undefined);
              const booth = booths.find((b) => b.teamId === team.id);

              return [
                ...(index > 0
                  ? [<ListDivider key={`${team.id}-divider`} />]
                  : []),
                <li key={team.id} style={{ listStyle: "none" }}>
                  <Link
                    href={`/teams/${team.id}`}
                    style={{
                      display: "block",
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    <VStack gap="x3" width="full" py="x4">
                      {/* 로고 옆에 태그 + 팀명을 세로로 묶음 */}
                      <HStack gap="x3" align="center" width="full">
                        <Avatar
                          size="56"
                          src={team.imageUrl ?? undefined}
                          fallback={<IdentityPlaceholder identity="business" />}
                        />
                        <VStack gap="x1" flexGrow={1} style={{ minWidth: 0 }}>
                          {(team.tags.length > 0 || booth) && (
                            <HStack gap="x1" wrap>
                              {booth && (
                                <Badge tone="brand" variant="solid">
                                  {formatBoothLocation(booth)}
                                </Badge>
                              )}
                              {team.tags.map((tag) => (
                                <Badge key={tag} tone="neutral" variant="weak">
                                  {tag}
                                </Badge>
                              ))}
                            </HStack>
                          )}
                          <Text textStyle="t7Bold">{team.name}</Text>
                        </VStack>
                        <IconChevronRightSmallLine
                          width={18}
                          height={18}
                          style={{
                            flexShrink: 0,
                            color: "var(--seed-color-fg-neutral-subtle)",
                          }}
                        />
                      </HStack>

                      {/* 제품 스크린샷 — 팀마다 장수가 달라도 3칸 그리드
                          모양은 유지되도록 빈 칸을 채워둠 */}
                      {team.screenshotUrls.length > 0 && (
                        <Grid
                          columns={SCREENSHOT_GRID_SIZE}
                          gap="x2"
                          width="full"
                        >
                          {Array.from({ length: SCREENSHOT_GRID_SIZE }).map(
                            (_, slot) => {
                              const url = team.screenshotUrls[slot];
                              return url ? (
                                // biome-ignore lint/performance/noImgElement: 사용자 업로드 스크린샷, 정적 자산 아님
                                <img
                                  key={url}
                                  src={url}
                                  alt={`${team.name} 제품 화면 ${slot + 1}`}
                                  style={{
                                    width: "100%",
                                    aspectRatio: "9 / 16",
                                    objectFit: "cover",
                                    borderRadius: "var(--seed-radius-r2)",
                                  }}
                                />
                              ) : (
                                <ContentPlaceholder
                                  key={`${team.id}-placeholder-${slot}`}
                                  type="image"
                                  style={{
                                    width: "100%",
                                    aspectRatio: "9 / 16",
                                    borderRadius: "var(--seed-radius-r2)",
                                  }}
                                />
                              );
                            },
                          )}
                        </Grid>
                      )}

                      {/* 소개 + 팀원 — 소개는 2줄로 축약, 팀원 아바타는 같은 줄 우측 끝에 */}
                      <HStack gap="x3" align="center" width="full">
                        <Text
                          textStyle="t4Regular"
                          color="fg.neutralSubtle"
                          style={{
                            flexGrow: 1,
                            minWidth: 0,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {team.description}
                        </Text>
                        {members.length > 0 && (
                          <AvatarStack size="24" style={{ flexShrink: 0 }}>
                            {members.map((member) => (
                              <Avatar
                                key={member.studentId}
                                src={member.avatarUrl ?? undefined}
                                fallback={<IdentityPlaceholder />}
                              />
                            ))}
                          </AvatarStack>
                        )}
                      </HStack>
                    </VStack>
                  </Link>
                </li>,
              ];
            })}
          </List>
        ) : (
          <Text color="fg.neutralSubtle">아직 등록된 팀이 없어요</Text>
        )}

        <HStack justify="center" width="full">
          <TeamListPagination page={page} totalPages={totalPages} />
        </HStack>
      </VStack>
    </>
  );
}
