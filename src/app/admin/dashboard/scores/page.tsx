import { VStack } from "@seed-design/react";
import { PageHeader } from "@/shared/ui/page-header";
import { AdminScoreTable } from "@/widgets/admin-score-table";

export default function AdminScoresPage() {
  return (
    <VStack gap="x6" width="full" px="spacingX.globalGutter" py="x6">
      <PageHeader
        title="점수 관리"
        description="투자 점수와 심사위원 점수를 가중 합산해 최종 순위를 계산해요"
      />
      <AdminScoreTable />
    </VStack>
  );
}
