"use client";

import {
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetRoot,
} from "seed-design/ui/bottom-sheet";
import {
  getBoothMatrixConfigAction,
  listBoothMarkersAction,
  listBoothsAction,
} from "@/entities/booth/model/actions";
import { BoothFloorPlan } from "@/entities/booth/ui/booth-floor-plan";
import { listTeamsAction } from "@/entities/team/model/actions";
import { useSuspenseQuery } from "@/shared/lib/query/use-suspense-query";
import { SuspenseQueryBoundary } from "@/shared/ui/suspense-query-boundary";

export function BoothFloorPlanSheet({
  open,
  onOpenChange,
  highlightTeamId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  highlightTeamId?: string | null;
}) {
  return (
    <BottomSheetRoot open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent title="부스 배치도">
        <BottomSheetBody
          style={{ paddingBottom: "calc(var(--seed-safe-area-bottom) + 24px)" }}
        >
          {/* Fetch only while the sheet is actually open, matching the
              previous `enabled: open` behavior — useSuspenseQuery has no
              `enabled` escape hatch, so gate by mounting instead. */}
          {open && (
            <SuspenseQueryBoundary>
              <BoothFloorPlanContent highlightTeamId={highlightTeamId} />
            </SuspenseQueryBoundary>
          )}
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheetRoot>
  );
}

function BoothFloorPlanContent({
  highlightTeamId,
}: {
  highlightTeamId?: string | null;
}) {
  const { data: booths } = useSuspenseQuery({
    queryKey: ["admin-booths"],
    queryFn: listBoothsAction,
  });
  const { data: markers } = useSuspenseQuery({
    queryKey: ["booth-markers"],
    queryFn: listBoothMarkersAction,
  });
  const { data: teams } = useSuspenseQuery({
    queryKey: ["teams"],
    queryFn: listTeamsAction,
  });
  const { data: matrixConfig } = useSuspenseQuery({
    queryKey: ["booth-matrix-config"],
    queryFn: getBoothMatrixConfigAction,
  });

  return (
    <BoothFloorPlan
      booths={booths}
      teams={teams}
      markers={markers}
      matrixConfig={matrixConfig}
      highlightTeamId={highlightTeamId}
    />
  );
}
