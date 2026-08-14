import { requireParticipantTeamId } from "@/entities/session/model/session";
import { DashboardOverview } from "@/widgets/dashboard-overview";

export default async function DashboardOverviewPage() {
  const teamId = await requireParticipantTeamId();
  return <DashboardOverview teamId={teamId} />;
}
