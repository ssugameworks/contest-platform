"use client";

import { VStack } from "@seed-design/react";
import { getCurrentStaff, mockStaff } from "@/entities/staff";
import { PageHeader } from "@/shared/ui/page-header";
import { JudgeTeamList } from "@/widgets/judge-team-list";

export default function JudgeDashboardPage() {
  const currentStaff =
    getCurrentStaff() ?? mockStaff.find((staff) => staff.role === "judge");

  if (!currentStaff) {
    return null;
  }

  return (
    <VStack gap="x6" width="full" px="spacingX.globalGutter" py="x6">
      <PageHeader
        title={`${currentStaff.name} 채점`}
        description="팀마다 평가요소별 점수를 매기고 메모를 남겨주세요"
      />
      <JudgeTeamList judgeId={currentStaff.id} />
    </VStack>
  );
}
