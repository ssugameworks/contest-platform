import { Divider, VStack } from "@seed-design/react";
import { getCurrentUser } from "@/entities/session/model/session";
import {
  ChangePasswordForm,
  EditParticipantProfileForm,
} from "@/features/edit-participant-profile";
import { PageHeader } from "@/shared/ui/page-header";

export default async function DashboardProfilePage() {
  const user = await getCurrentUser();
  if (!user || user.kind !== "participant") return null;

  return (
    <VStack gap="x6" width="full" px="spacingX.globalGutter" py="x6">
      <PageHeader title="내 프로필" />
      <EditParticipantProfileForm name={user.name} avatarUrl={user.avatarUrl} />
      <Divider />
      <ChangePasswordForm />
    </VStack>
  );
}
