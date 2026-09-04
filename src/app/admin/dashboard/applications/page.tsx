import { VStack } from "@seed-design/react";
import { PageHeader } from "@/shared/ui/page-header";
import { AdminApplicationTable } from "@/widgets/admin-application-table";

export default function AdminApplicationsPage() {
  return (
    <VStack gap="x6" width="full" px="spacingX.globalGutter" py="x6">
      <PageHeader
        title="지원서 관리"
        description="가입 신청서를 검토하고 상태를 변경해요"
      />
      <AdminApplicationTable />
    </VStack>
  );
}
