import { notFound } from "next/navigation";
import { getBoothByTeamId } from "@/entities/booth";
import {
  getInvestmentRank,
  getInvestorCount,
  getTeamInvestmentTotal,
} from "@/entities/investment";
import { listParticipants } from "@/entities/participant";
import { getCurrentUser } from "@/entities/session/model/session";
import { getTeamById } from "@/entities/team";
import { TeamShowcase } from "@/widgets/team-showcase";

export default async function TeamPage({
  params,
}: PageProps<"/teams/[teamId]">) {
  const { teamId } = await params;
  const team = await getTeamById(teamId);

  if (!team) {
    notFound();
  }

  const [booth, { rank }, investorCount, amount, participants, currentUser] =
    await Promise.all([
      getBoothByTeamId(team.id),
      getInvestmentRank(team.id),
      getInvestorCount(team.id),
      getTeamInvestmentTotal(team.id),
      listParticipants(),
      getCurrentUser(),
    ]);
  const members = team.memberIds
    .map((id) => participants.find((p) => p.studentId === id))
    .filter((p) => p !== undefined);

  return (
    <TeamShowcase
      team={team}
      booth={booth}
      rank={rank}
      investorCount={investorCount}
      amount={amount}
      members={members}
      currentUser={currentUser}
    />
  );
}
