import type { Metadata } from "next";
import Dashboard from "@/components/reviewboost/Dashboard";

export const metadata: Metadata = {
  title: "ReviewBoost Dashboard Prototype (Demo)",
  description: "Interactive, accessible prototype of the ReviewBoost owner dashboard: send review requests, track clicks, reply to reviews with AI, staff leaderboard, QR standee and settings. Fictional demo business.",
  robots: { index: false },
};

export default function DashboardPage() {
  return <Dashboard />;
}
