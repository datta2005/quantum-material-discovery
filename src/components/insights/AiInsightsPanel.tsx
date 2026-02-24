import { Brain, TrendingUp, Shield, Zap, Lightbulb, BarChart3, Target, AlertTriangle } from "lucide-react";

type AiInsightsPanelProps = {
  title?: string;
  subtitle?: string;
  // backend-ready hooks:
  performanceScore?: number; // 0..10
  confidencePct?: number; // 0..100
  riskLabel?: "Low" | "Medium" | "High";
};

export function AiInsightsPanel({
  title = "AI Insights",
  subtitle = "Machine learning predictions and optimization recommendations",
  performanceScore = 9.2,
  confidencePct = 94.6,
  riskLabel = "Low",
}: AiInsightsPanelProps) {
  const perfWidth = `${Math.min(100, Math.max(0, (performanceScore / 10) * 100))}%`;
  const confWidth = `${Math.min(100, Math.max(0, confidencePct))}%`;
  const riskWidth = riskLabel === "Low" ? "15%" : riskLabel === "Medium" ? "55%" : "85%";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      {/* Prediction Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-success/10 text-success">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Performance Score</p>
              <p className="text-2xl font-bold">{performanceScore.toFixed(1)} / 10</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-success to-quantum" style={{ width: perfWidth }} />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Confidence Level</p>
              <p className="text-2xl font-bold">{confidencePct.toFixed(1)}%</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-accent to-quantum" style={{ width: confWidth }} />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-warning/10 text-warning">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Risk Assessment</p>
              <p className="text-2xl font-bold">{riskLabel}</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-warning" style={{ width: riskWidth }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property vs Performance Chart */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Property vs Performance Analysis
          </h3>
          <div className="h-64 relative">
            <div className="absolute inset-0 flex flex-col justify-between py-4">
              {[100, 75, 50, 25, 0].map((val) => (
                <div key={val} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-8">{val}%</span>
                  <div className="flex-1 border-b border-border/50 border-dashed" />
                </div>
              ))}
            </div>

            <div className="absolute inset-0 flex items-end justify-around pt-8 pb-8 px-12">
              {[
                { label: "Strength", value: 85, color: "from-accent to-quantum" },
                { label: "Conductivity", value: 92, color: "from-quantum to-success" },
                { label: "Stability", value: 88, color: "from-accent to-quantum" },
                { label: "Flexibility", value: 76, color: "from-warning to-accent" },
                { label: "Durability", value: 94, color: "from-success to-quantum" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className={`w-full max-w-12 rounded-t-lg bg-gradient-to-t ${item.color} transition-all hover:opacity-80`}
                    style={{ height: `${item.value * 0.8}%` }}
                  />
                  <span className="text-xs text-muted-foreground text-center">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Optimization Progress */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-accent" />
            AI Optimization Progress
          </h3>
          <div className="h-64 relative px-8 py-4">
            <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(192, 91%, 36%)" />
                  <stop offset="100%" stopColor="hsl(186, 100%, 42%)" />
                </linearGradient>
              </defs>
              {[0, 50, 100, 150, 200].map((y) => (
                <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="currentColor" strokeOpacity="0.1" />
              ))}
              <path
                d="M 0 180 Q 50 170, 75 150 T 150 80 T 225 30 T 300 10"
                fill="none"
                stroke="url(#curveGradient)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {[[0, 180], [75, 150], [150, 80], [225, 30], [300, 10]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="5" fill="hsl(192, 91%, 36%)" className="animate-pulse-slow" />
              ))}
            </svg>
            <div className="absolute bottom-0 left-8 right-8 flex justify-between text-xs text-muted-foreground">
              <span>Iter 1</span>
              <span>Iter 25</span>
              <span>Iter 50</span>
              <span>Iter 75</span>
              <span>Iter 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Applications */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h3 className="text-lg font-semibold">Recommended Applications</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Shield,
              title: "Defense Systems",
              desc: "High stability and thermal resistance make this material ideal for aerospace and military applications.",
              score: 9.4,
            },
            {
              icon: Zap,
              title: "Energy Storage",
              desc: "Exceptional conductivity suggests strong performance in next-generation battery technologies.",
              score: 9.1,
            },
            {
              icon: Lightbulb,
              title: "Electronics",
              desc: "Band gap properties suitable for advanced semiconductor applications.",
              score: 8.7,
            },
          ].map((app, i) => (
            <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-accent/30 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-accent/10 text-accent">
                  <app.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{app.title}</h4>
                    <span className="text-sm font-bold text-accent">{app.score}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{app.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendation Box */}
      <div className="bg-gradient-to-r from-accent/10 via-quantum/5 to-accent/10 rounded-xl border border-accent/20 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-quantum text-accent-foreground">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">AI Recommendation</h3>
            <p className="text-sm text-muted-foreground">Based on comprehensive analysis</p>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-card/50 border border-border/50">
          <p className="text-foreground leading-relaxed">
            This material demonstrates <span className="font-semibold text-success">exceptional stability</span> and
            <span className="font-semibold text-accent"> high conductivity</span>, making it suitable for
            <span className="font-semibold"> defense-grade energy storage systems</span>. The quantum simulation indicates
            a favorable band structure with minimal thermal degradation.
            <span className="font-semibold text-quantum"> Recommended for prototyping</span>.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">High Confidence</div>
          <div className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium">Validated Model</div>
          <div className="px-3 py-1.5 rounded-full bg-quantum/10 text-quantum text-sm font-medium">Quantum Verified</div>
        </div>
      </div>
    </div>
  );
}