import { requireStaff } from "@/entities/staff/model/session";
import { JudgeDashboardClient } from "./judge-dashboard-client";

export default async function JudgeDashboardPage() {
  const staff = await requireStaff();
  return <JudgeDashboardClient currentStaff={staff} />;
}
