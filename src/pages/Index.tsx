import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Atom, Cpu, Brain, TrendingUp } from "lucide-react";

const metrics = [
  {
    title: "Materials Analyzed",
    value: "1,248",
    description: "Total materials in database",
    icon: Atom,
    trend: { value: 12.5, isPositive: true },
  },
  {
    title: "Quantum Simulations",
    value: "312",
    description: "Simulations completed this month",
    icon: Cpu,
    trend: { value: 8.2, isPositive: true },
  },
  {
    title: "AI Prediction Accuracy",
    value: "94.6%",
    description: "Model performance score",
    icon: Brain,
    trend: { value: 2.1, isPositive: true },
  },
  {
    title: "Top Material Score",
    value: "9.3/10",
    description: "Highest performing material",
    icon: TrendingUp,
    trend: { value: 0.4, isPositive: true },
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 space-y-8">
        {/* Hero Section */}
        <HeroSection />

        {/* Metrics Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Platform Overview</h2>
              <p className="text-muted-foreground">Key metrics and performance indicators</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                description={metric.description}
                icon={metric.icon}
                trend={metric.trend}
              />
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3 className="text-lg font-semibold">Recent Simulations</h3>
            <div className="space-y-3">
              {[
                { name: "Graphene-Li2S Composite", status: "Completed", time: "2 min ago", score: 9.1 },
                { name: "Silicon Carbide Alloy", status: "Running", time: "5 min ago", score: null },
                { name: "Perovskite Solar Cell", status: "Completed", time: "12 min ago", score: 8.7 },
                { name: "Titanium Nitride Film", status: "Completed", time: "1 hour ago", score: 8.4 },
              ].map((sim, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${sim.status === 'Running' ? 'bg-warning animate-pulse' : 'bg-success'}`} />
                    <div>
                      <p className="font-medium text-sm">{sim.name}</p>
                      <p className="text-xs text-muted-foreground">{sim.time}</p>
                    </div>
                  </div>
                  {sim.score && (
                    <span className="text-sm font-semibold text-accent">{sim.score}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3 className="text-lg font-semibold">Top Performing Materials</h3>
            <div className="space-y-3">
              {[
                { name: "Graphene Oxide", category: "Energy", score: 9.3, efficiency: 94 },
                { name: "LiCoO₂ Cathode", category: "Battery", score: 9.1, efficiency: 92 },
                { name: "GaN Semiconductor", category: "Electronics", score: 8.9, efficiency: 89 },
                { name: "MoS₂ Monolayer", category: "Defense", score: 8.7, efficiency: 87 },
              ].map((mat, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-quantum/20 flex items-center justify-center">
                      <Atom className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{mat.name}</p>
                      <p className="text-xs text-muted-foreground">{mat.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-accent">{mat.score}</p>
                    <p className="text-xs text-muted-foreground">{mat.efficiency}% eff.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
