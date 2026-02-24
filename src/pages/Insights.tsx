import { Navbar } from "@/components/layout/Navbar";
import { AiInsightsPanel } from "@/components/insights/AiInsightsPanel";

const Insights = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <AiInsightsPanel />
      </main>
    </div>
  );
};

export default Insights;