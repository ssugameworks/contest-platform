import { VStack } from "@seed-design/react";
import { EditTeamProfileForm } from "@/features/edit-team-profile";
import { PageHeader } from "@/shared/ui/page-header";

export default function DashboardTeamPage() {
  return (
    <VStack gap="x6" width="full" px="spacingX.globalGutter" py="x6">
      <PageHeader title="팀 프로필" />
      <EditTeamProfileForm />
    </VStack>
  );
}
