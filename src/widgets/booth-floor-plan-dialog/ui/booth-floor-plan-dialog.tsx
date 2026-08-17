"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetRoot,
} from "seed-design/ui/bottom-sheet";
import {
  listBoothMarkersAction,
  listBoothsAction,
} from "@/entities/booth/model/actions";
import { BoothFloorPlan } from "@/entities/booth/ui/booth-floor-plan";
import { listTeamsAction } from "@/entities/team/model/actions";

export function BoothFloorPlanSheet({
  open,
  onOpenChange,
  highlightTeamId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  highlightTeamId?: string | null;
}) {
  const { data: booths = [] } = useQuery({
    queryKey: ["admin-booths"],
    queryFn: listBoothsAction,
    enabled: open,
  });
  const { data: markers = [] } = useQuery({
    queryKey: ["booth-markers"],
    queryFn: listBoothMarkersAction,
    enabled: open,
  });
  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: listTeamsAction,
    enabled: open,
  });

  return (
    <BottomSheetRoot open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent title="부스 배치도">
        <BottomSheetBody>
          <BoothFloorPlan
            booths={booths}
            teams={teams}
            markers={markers}
            highlightTeamId={highlightTeamId}
          />
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheetRoot>
  );
}
