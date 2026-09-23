import DashboardClient from "./components/DashboardClient";
import { getDashboardStats } from "./actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Fetch all-time stats initially
  const result = await getDashboardStats();
  
  return (
    <DashboardClient 
      initialStats={result.stats} 
      initialOrders={result.recentOrders} 
    />
  );
}
