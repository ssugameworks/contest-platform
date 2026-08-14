import { Grid, VStack } from "@seed-design/react";
import { formatBoothLocation, mockBooth } from "@/entities/booth";
import { PageHeader } from "@/shared/ui/page-header";
import { StatCard } from "@/shared/ui/stat-card";

export default function DashboardBoothPage() {
  return (
    <VStack gap="x6" width="full" px="spacingX.globalGutter" py="x6">
      <PageHeader title="부스 위치" />
      <Grid columns={{ base: 1, sm: 2 }} gap="x4" width="full">
        <StatCard label="부스 위치" value={formatBoothLocation(mockBooth)} />
      </Grid>
    </VStack>
  );
}
