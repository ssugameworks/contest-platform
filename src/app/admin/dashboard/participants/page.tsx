import { VStack } from "@seed-design/react";
import { PageHeader } from "@/shared/ui/page-header";
import { AdminParticipantTable } from "@/widgets/admin-participant-table";

export default function AdminParticipantsPage() {
  return (
    <VStack gap="x6" width="full" px="spacingX.globalGutter" py="x6">
      <PageHeader
        title="참가자 관리"
        description="참가자 로스터를 추가·수정·삭제해요"
      />
      <AdminParticipantTable />
    </VStack>
  );
}
