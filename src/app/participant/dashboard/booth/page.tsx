import { Grid, VStack } from "@seed-design/react";
import { formatBoothLocation, getBoothByTeamId } from "@/entities/booth";
import { PLACEHOLDER_TEAM_ID } from "@/entities/team";
import { PageHeader } from "@/shared/ui/page-header";
import { StatCard } from "@/shared/ui/stat-card";

export default async function DashboardBoothPage() {
  const booth = await getBoothByTeamId(PLACEHOLDER_TEAM_ID);

  return (
    <VStack gap="x6" width="full" px="spacingX.globalGutter" py="x6">
      <PageHeader title="부스 위치" />
      <Grid columns={{ base: 1, sm: 2 }} gap="x4" width="full">
        <StatCard
          label="부스 위치"
          value={booth ? formatBoothLocation(booth) : "-"}
        />
      </Grid>
    </VStack>
  );
}
