import { VStack } from "@seed-design/react";
import { PageHeader } from "@/shared/ui/page-header";
import { AdminTeamTable } from "@/widgets/admin-team-table";

export default function AdminTeamsPage() {
  return (
    <VStack gap="x6" width="full" px="spacingX.globalGutter" py="x6">
      <PageHeader
        title="팀 관리"
        description="참가팀 정보를 추가·수정·삭제해요"
      />
      <AdminTeamTable />
    </VStack>
  );
}
