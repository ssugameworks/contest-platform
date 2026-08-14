import { VStack } from "@seed-design/react";
import { getTeamById, PLACEHOLDER_TEAM_ID } from "@/entities/team";
import { EditTeamProfileForm } from "@/features/edit-team-profile";
import { PageHeader } from "@/shared/ui/page-header";

export default async function DashboardTeamPage() {
  const team = await getTeamById(PLACEHOLDER_TEAM_ID);

  return (
    <VStack gap="x6" width="full" px="spacingX.globalGutter" py="x6">
      <PageHeader title="팀 프로필" />
      {team && <EditTeamProfileForm team={team} />}
    </VStack>
  );
}
