import { requireJudge } from "@/entities/staff/model/session";
import { JudgeDashboardClient } from "./judge-dashboard-client";

export default async function JudgeDashboardPage() {
  const staff = await requireJudge();
  return <JudgeDashboardClient currentStaff={staff} />;
}
