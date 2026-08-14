import { Grid, VStack } from "@seed-design/react";
import {
  getInvestmentRank,
  getInvestorCount,
  mockInvestment,
} from "@/entities/investment";
import { mockTeam } from "@/entities/team";
import { PageHeader } from "@/shared/ui/page-header";
import { StatCard } from "@/shared/ui/stat-card";
import { InvestmentTransactions } from "@/widgets/investment-transactions";

export default function DashboardInvestmentPage() {
  const { rank } = getInvestmentRank(mockTeam.id);
  const investorCount = getInvestorCount(mockTeam.id);

  return (
    <VStack gap="x6" width="full" px="spacingX.globalGutter" py="x6">
      <PageHeader title="투자 현황" />
      <Grid columns={{ base: 1, sm: 3 }} gap="x4" width="full">
        <StatCard
          label="받은 투자금"
          value={`${mockInvestment.amount.toLocaleString()}원`}
        />
        <StatCard label="투자자 수" value={`${investorCount}명`} />
        <StatCard label="투자 등수" value={`${rank}위`} />
      </Grid>
      <InvestmentTransactions teamId={mockTeam.id} />
    </VStack>
  );
}
