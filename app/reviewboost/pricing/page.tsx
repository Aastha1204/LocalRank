import type { Metadata } from "next";
import PricingPlanner from "@/components/reviewboost/PricingPlanner";

export const metadata: Metadata = {
  title: "ReviewBoost pricing planner (private)",
  robots: { index: false, follow: false },
};

export default function PricingPage() {
  return <PricingPlanner />;
}
