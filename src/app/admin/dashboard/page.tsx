import { getDashboardStats } from "./actions";
import { AdminDashboardOverviewPanel } from "./dashboard-overview-panel";

export default async function AdminDashboardOverviewPage() {
  const stats = await getDashboardStats();
  return <AdminDashboardOverviewPanel initialStats={stats} />;
}
