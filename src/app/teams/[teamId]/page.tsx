import { notFound } from "next/navigation";
import { mockTeam } from "@/entities/team";
import { TeamShowcase } from "@/widgets/team-showcase";

export default async function TeamPage({
  params,
}: PageProps<"/teams/[teamId]">) {
  const { teamId } = await params;

  if (teamId !== mockTeam.id) {
    notFound();
  }

  return <TeamShowcase team={mockTeam} />;
}
