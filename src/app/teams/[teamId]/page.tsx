import { notFound } from "next/navigation";
import { listBooths } from "@/entities/booth";
import {
  getInvestmentRank,
  getInvestorCount,
  getTeamInvestmentTotal,
} from "@/entities/investment";
import { listParticipants } from "@/entities/participant";
import { getCurrentUser } from "@/entities/session/model/session";
import { getCurrentStaff } from "@/entities/staff/model/session";
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

  const [
    booths,
    { rank },
    investorCount,
    amount,
    participants,
    currentUser,
    staff,
  ] = await Promise.all([
    listBooths(),
    getInvestmentRank(team.id),
    getInvestorCount(team.id),
    getTeamInvestmentTotal(team.id),
    listParticipants(),
    getCurrentUser(),
    getCurrentStaff(),
  ]);
  const members = team.memberIds
    .map((id) => participants.find((p) => p.studentId === id))
    .filter((p) => p !== undefined);

  return (
    <TeamShowcase
      team={team}
      booth={booths.find((b) => b.teamId === team.id) ?? null}
      booths={booths}
      rank={rank}
      investorCount={investorCount}
      amount={amount}
      members={members}
      currentUser={currentUser}
      isJudge={staff?.role === "judge"}
    />
  );
}
