import { VStack } from "@seed-design/react";
import { PageHeader } from "@/shared/ui/page-header";
import { AdminBoothGrid } from "@/widgets/admin-booth-grid";

export default function AdminBoothsPage() {
  return (
    <VStack gap="x6" width="full" px="spacingX.globalGutter" py="x6">
      <PageHeader
        title="부스 관리"
        description="부스 배치를 만들고 팀을 배정해요"
      />
      <AdminBoothGrid />
    </VStack>
  );
}
