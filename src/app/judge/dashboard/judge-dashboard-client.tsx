"use client";

import { VStack } from "@seed-design/react";
import { useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import type { Staff } from "@/entities/staff/model/pure";
import { PageHeader } from "@/shared/ui/page-header";
import { BoothFloorPlanSheet } from "@/widgets/booth-floor-plan-dialog";
import { JudgeTeamList } from "@/widgets/judge-team-list";

export function JudgeDashboardClient({
  currentStaff,
}: {
  currentStaff: Staff;
}) {
  const [floorPlanOpen, setFloorPlanOpen] = useState(false);

  return (
    <VStack gap="x6" width="full" px="spacingX.globalGutter" py="x6">
      <PageHeader
        title={`${currentStaff.name} 채점`}
        description="팀마다 평가요소별 점수를 매기고 메모를 남겨주세요"
      />
      <ActionButton
        variant="neutralWeak"
        onClick={() => setFloorPlanOpen(true)}
      >
        전체 부스 배치도
      </ActionButton>
      <JudgeTeamList judgeId={currentStaff.id} />
      <BoothFloorPlanSheet
        open={floorPlanOpen}
        onOpenChange={setFloorPlanOpen}
      />
    </VStack>
  );
}
