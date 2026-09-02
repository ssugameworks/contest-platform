import { Grid, VStack } from "@seed-design/react";
import {
  formatBoothLocation,
  getBoothByTeamId,
  getBoothMatrixConfig,
  listBooths,
} from "@/entities/booth";
import { listBoothMarkers } from "@/entities/booth/model/booth";
import { BoothFloorPlan } from "@/entities/booth/ui/booth-floor-plan";
import { requireParticipantTeamId } from "@/entities/session/model/session";
import { listTeams } from "@/entities/team";
import { PageHeader } from "@/shared/ui/page-header";
import { StatCard } from "@/shared/ui/stat-card";

export default async function DashboardBoothPage() {
  const teamId = await requireParticipantTeamId();
  const [booth, booths, markers, teams, matrixConfig] = await Promise.all([
    getBoothByTeamId(teamId),
    listBooths(),
    listBoothMarkers(),
    listTeams(),
    getBoothMatrixConfig(),
  ]);

  return (
    <VStack gap="x6" width="full" px="spacingX.globalGutter" py="x6">
      <PageHeader title="부스 위치" />
      <Grid columns={{ base: 1, sm: 2 }} gap="x4" width="full">
        <StatCard
          label="부스 위치"
          value={booth ? formatBoothLocation(booth) : "-"}
        />
      </Grid>
      <BoothFloorPlan
        booths={booths}
        teams={teams}
        markers={markers}
        matrixConfig={matrixConfig}
        highlightTeamId={teamId}
      />
    </VStack>
  );
}
