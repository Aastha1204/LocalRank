import type { Metadata } from "next";
import ReviewBoostApp from "@/components/reviewboost/ReviewBoostApp";

export const metadata: Metadata = {
  title: "ReviewBoost: Google Review Automation on WhatsApp (Demo)",
  description: "Send a one-tap Google review link on WhatsApp after every visit and watch reviews grow. 3D interactive demo by Neovia AI — fictional business.",
  alternates: { canonical: "/reviewboost" },
};

export default function ReviewBoostPage() {
  return <ReviewBoostApp />;
}
