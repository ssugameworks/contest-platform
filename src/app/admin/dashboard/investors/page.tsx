import { VStack } from "@seed-design/react";
import { PageHeader } from "@/shared/ui/page-header";
import { AdminInvestorTable } from "@/widgets/admin-investor-table";

export default function AdminInvestorsPage() {
  return (
    <VStack gap="x6" width="full" px="spacingX.globalGutter" py="x6">
      <PageHeader
        title="투자자 관리"
        description="투자자 정보를 추가·수정·삭제해요"
      />
      <AdminInvestorTable />
    </VStack>
  );
}
