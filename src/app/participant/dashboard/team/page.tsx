import { VStack } from "@seed-design/react";
import { requireParticipantTeamId } from "@/entities/session/model/session";
import { getTeamById } from "@/entities/team";
import { EditTeamProfileForm } from "@/features/edit-team-profile";
import { PageHeader } from "@/shared/ui/page-header";

export default async function DashboardTeamPage() {
  const teamId = await requireParticipantTeamId();
  const team = await getTeamById(teamId);

  return (
    <VStack gap="x6" width="full" px="spacingX.globalGutter" py="x6">
      <PageHeader title="팀 프로필" />
      {team && <EditTeamProfileForm team={team} />}
    </VStack>
  );
}
