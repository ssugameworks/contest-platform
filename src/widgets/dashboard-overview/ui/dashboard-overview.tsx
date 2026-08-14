import { Box, Divider, Grid, HStack, Text, VStack } from "@seed-design/react";
import { Avatar, AvatarStack } from "seed-design/ui/avatar";
import { IdentityPlaceholder } from "seed-design/ui/identity-placeholder";
import { List, ListItem } from "seed-design/ui/list";
import { formatBoothLocation, getBoothByTeamId } from "@/entities/booth";
import {
  getInvestmentRank,
  getInvestorCount,
  getTeamInvestmentTotal,
} from "@/entities/investment";
import { listParticipants } from "@/entities/participant";
import type { ScheduleStatus } from "@/entities/schedule";
import { listSchedule } from "@/entities/schedule";
import { getTeamById } from "@/entities/team";
import { PageHeader } from "@/shared/ui/page-header";
import { StatCard } from "@/shared/ui/stat-card";

const STATUS_DOT_COLOR: Record<ScheduleStatus, string> = {
  done: "var(--seed-color-bg-neutral-solid)",
  current: "var(--seed-color-bg-brand-solid)",
  upcoming: "var(--seed-color-bg-layer-default)",
};

function TimelineNode({
  status,
  showTopLine,
  showBottomLine,
}: {
  status: ScheduleStatus;
  showTopLine: boolean;
  showBottomLine: boolean;
}) {
  // Height comes from the prefix HStack (see below), which is grown to the
  // row's real height — the prefix slot itself only stretches to the row's
  // content-box height, not the full row, so a plain 100% here would fall
  // short by the <li>'s own padding-block on each side.
  return (
    <Box
      position="relative"
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="20px"
      height="full"
    >
      {showTopLine && (
        <Box
          position="absolute"
          top="0"
          width="2px"
          height="50%"
          style={{ background: "var(--seed-color-stroke-neutral-weak)" }}
        />
      )}
      {showBottomLine && (
        <Box
          position="absolute"
          bottom="0"
          width="2px"
          height="50%"
          style={{ background: "var(--seed-color-stroke-neutral-weak)" }}
        />
      )}
      <Box
        position="relative"
        width="10px"
        height="10px"
        borderRadius="full"
        style={{
          background: STATUS_DOT_COLOR[status],
          border:
            status === "upcoming"
              ? "1.5px solid var(--seed-color-stroke-neutral-weak)"
              : "none",
        }}
      />
    </Box>
  );
}

export async function DashboardOverview({ teamId }: { teamId: string }) {
  const team = await getTeamById(teamId);
  if (!team) return null;

  const [{ rank }, investorCount, amount, participants, schedule] =
    await Promise.all([
      getInvestmentRank(team.id),
      getInvestorCount(team.id),
      getTeamInvestmentTotal(team.id),
      listParticipants(),
      listSchedule(),
    ]);
  const booth = await getBoothByTeamId(team.id);
  const members = team.memberIds
    .map((id) => participants.find((p) => p.studentId === id))
    .filter((p) => p !== undefined);

  return (
    <VStack gap="x6" width="full" px="spacingX.globalGutter" py="x6">
      <PageHeader title={team.name} description={team.description} />

      <AvatarStack size="36">
        {members.map((member) => (
          <Avatar key={member.studentId} fallback={<IdentityPlaceholder />} />
        ))}
      </AvatarStack>

      <Divider />

      <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap="x4" width="full">
        <StatCard label="받은 투자금" value={`${amount.toLocaleString()}원`} />
        <StatCard label="투자자 수" value={`${investorCount}명`} />
        <StatCard label="투자 등수" value={`${rank}위`} />
        <StatCard
          label="부스 위치"
          value={booth ? formatBoothLocation(booth) : "-"}
        />
      </Grid>

      <Divider />

      <VStack gap="x4" width="full">
        <Text textStyle="t5Bold">데모데이 타임테이블</Text>

        <List width="full">
          {schedule.map((item, index) => (
            <ListItem
              key={item.id}
              alignItems="stretch"
              prefix={
                <HStack
                  gap="x2"
                  alignItems="center"
                  style={{
                    height: "calc(100% + var(--seed-dimension-x3) * 2)",
                  }}
                >
                  <Text
                    textStyle="t4Regular"
                    color="fg.neutralSubtle"
                    style={{
                      width: "40px",
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {item.time}
                  </Text>
                  <TimelineNode
                    status={item.status}
                    showTopLine={index > 0}
                    showBottomLine={index < schedule.length - 1}
                  />
                </HStack>
              }
              title={item.title}
              detail={item.description}
            />
          ))}
        </List>
      </VStack>
    </VStack>
  );
}
