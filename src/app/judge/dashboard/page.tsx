import { listJudges } from "@/entities/staff";
import { JudgeDashboardClient } from "./judge-dashboard-client";

export default async function JudgeDashboardPage() {
  const judges = await listJudges();
  return <JudgeDashboardClient fallbackJudge={judges[0] ?? null} />;
}
