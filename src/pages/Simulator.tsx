import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Cpu,
  Brain,
  Zap,
  CheckCircle2,
  Download,
  RotateCcw,
  Atom,
  Sparkles,
  ChevronRight,
  Beaker,
  AlertCircle,
  Activity,
  FlaskConical,
  Layers,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const API_URL = "http://localhost:5000";

function formatElements(elements: any[] = []) {
  if (!elements?.length) return "";
  return elements
    .slice()
    .sort((a: any, b: any) => a.symbol.localeCompare(b.symbol))
    .map((e: any) => `${e.symbol}×${e.count}`)
    .join(", ");
}

function downloadJSON(filename: string, obj: any) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Visual Quantum Circuit Diagram ───────────────────────────────────────────
function QuantumCircuitDiagram({ layers, nQubits }: { layers: any[]; nQubits: number }) {
  if (!layers?.length || !nQubits) return null;

  const QUBIT_ROWS = Array.from({ length: nQubits }, (_, i) => i);
  const COL_WIDTH = 110;
  const ROW_HEIGHT = 44;
  const PADDING_X = 40;
  const PADDING_Y = 32;
  const LABEL_W = 36;
  const svgWidth = PADDING_X * 2 + LABEL_W + layers.length * COL_WIDTH;
  const svgHeight = PADDING_Y * 2 + nQubits * ROW_HEIGHT;

  // Gate color map
  const gateColor: Record<string, { bg: string; text: string; border: string }> = {
    rotation:     { bg: "#6366f120", text: "#a5b4fc", border: "#6366f1" },
    entanglement: { bg: "#a855f720", text: "#d8b4fe", border: "#a855f7" },
    measurement:  { bg: "#f59e0b20", text: "#fcd34d", border: "#f59e0b" },
  };

  return (
    <div className="overflow-x-auto rounded-xl bg-black/30 border border-border/40 p-1">
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        className="font-mono"
      >
        {/* Qubit wire labels + horizontal lines */}
        {QUBIT_ROWS.map((q) => {
          const y = PADDING_Y + q * ROW_HEIGHT + ROW_HEIGHT / 2;
          return (
            <g key={`wire-${q}`}>
              {/* q label */}
              <text x={PADDING_X} y={y + 4} fontSize={11} fill="#94a3b8" textAnchor="middle">
                q{q}
              </text>
              {/* wire */}
              <line
                x1={PADDING_X + LABEL_W}
                y1={y}
                x2={svgWidth - PADDING_X}
                y2={y}
                stroke="#334155"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            </g>
          );
        })}

        {/* Gate blocks per layer */}
        {layers.map((layer, colIdx) => {
          const x = PADDING_X + LABEL_W + colIdx * COL_WIDTH;
          const colors = gateColor[layer.type] ?? gateColor.rotation;

          return (
            <g key={`layer-${colIdx}`}>
              {/* Layer header label */}
              <text
                x={x + COL_WIDTH / 2}
                y={PADDING_Y - 10}
                fontSize={9}
                fill="#64748b"
                textAnchor="middle"
              >
                {layer.type === "measurement" ? "M" : `L${colIdx + 1}`}
              </text>

              {QUBIT_ROWS.map((q) => {
                const y = PADDING_Y + q * ROW_HEIGHT;
                const cy = y + ROW_HEIGHT / 2;

                // Entanglement: draw vertical connector lines between adjacent qubits
                const isEntangle = layer.type === "entanglement";

                /* For entanglement, draw a vertical "coupler" line */
                if (isEntangle && q < nQubits - 1) {
                  const cy2 = PADDING_Y + (q + 1) * ROW_HEIGHT + ROW_HEIGHT / 2;
                  return (
                    <g key={`gate-${colIdx}-${q}`}>
                      {/* Control dot */}
                      <circle cx={x + COL_WIDTH / 2} cy={cy} r={6} fill={colors.border} />
                      {/* Target circle */}
                      <circle cx={x + COL_WIDTH / 2} cy={cy2} r={9} fill="none" stroke={colors.border} strokeWidth={1.8} />
                      <line
                        x1={x + COL_WIDTH / 2} y1={cy}
                        x2={x + COL_WIDTH / 2} y2={cy2}
                        stroke={colors.border} strokeWidth={1.5}
                      />
                      {/* Cross inside target */}
                      <line x1={x + COL_WIDTH / 2} y1={cy2 - 6} x2={x + COL_WIDTH / 2} y2={cy2 + 6} stroke={colors.border} strokeWidth={1.5} />
                      <line x1={x + COL_WIDTH / 2 - 6} y1={cy2} x2={x + COL_WIDTH / 2 + 6} y2={cy2} stroke={colors.border} strokeWidth={1.5} />
                    </g>
                  );
                }

                if (isEntangle) return null; // skip last qubit for entangle

                // Rotation / Measurement gate box
                const label = layer.type === "measurement" ? "M" : `Ry(θ${q})`;
                const boxW = layer.type === "measurement" ? 24 : 56;
                const boxH = 24;

                return (
                  <g key={`gate-${colIdx}-${q}`}>
                    <rect
                      x={x + COL_WIDTH / 2 - boxW / 2}
                      y={cy - boxH / 2}
                      width={boxW}
                      height={boxH}
                      rx={5}
                      fill={colors.bg}
                      stroke={colors.border}
                      strokeWidth={1.2}
                    />
                    <text
                      x={x + COL_WIDTH / 2}
                      y={cy + 4}
                      fontSize={9}
                      fill={colors.text}
                      textAnchor="middle"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Mini chart for convergence ───────────────────────────────────────────────
function ConvergenceChart({ history, unit }: { history: number[]; unit: string }) {
  if (!history?.length) return null;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const pts = history.map((v, i) => {
    const x = (i / (history.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 90;
    return `${x},${y}`;
  });

  return (
    <div className="p-4 rounded-xl bg-black/20 border border-purple-500/20 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-purple-400" />
          VQE Energy Convergence
        </span>
        <span className="font-mono text-purple-300 text-[10px]">
          Final: {history[history.length - 1]?.toFixed(6)} {unit}
        </span>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-24">
        <defs>
          <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <polygon
          points={`0,100 ${pts.join(" ")} 100,100`}
          fill="url(#convGrad)"
        />
        {/* Line */}
        <polyline
          points={pts.join(" ")}
          fill="none"
          stroke="#a855f7"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex justify-between text-[9px] text-muted-foreground/60">
        <span>Iter 1</span>
        <span className="text-purple-400/70">{history.length} total</span>
        <span>Iter {history.length}</span>
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, accent, color, border,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent?: boolean;
  color?: string;
  border?: string;
}) {
  return (
    <div className={`p-3 rounded-xl border ${border ?? "border-border/50"} bg-card/60`}>
      <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
      <p className={`font-bold text-sm leading-tight ${color ?? (accent ? "text-accent" : "text-foreground")}`}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5 font-mono">{sub}</p>}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ value, color = "bg-accent" }: { value: number; color?: string }) {
  return (
    <div className="flex-1 h-1.5 bg-muted/40 rounded-full overflow-hidden">
      <div className={`${color} h-full rounded-full transition-all duration-700`} style={{ width: `${Math.min(100, value * 100)}%` }} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const Simulator = () => {
  const location = useLocation();
  const state = (location?.state as any) || {};
  const incomingElements = state?.elements || [];
  const incomingFormula = state?.formula || "";

  const [formula, setFormula] = useState(incomingFormula || "");
  const [qubits, setQubits] = useState([3]);
  const [simulationType, setSimulationType] = useState("electronic");
  const [maxIterations, setMaxIterations] = useState([30]);

  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<any>(null);
  const [quantumResults, setQuantumResults] = useState<any>(null);
  const [applications, setApplications] = useState<any>(null);

  const canRun = formula.trim().length > 0;
  const allDone = aiResults && quantumResults;

  const handleRunSimulation = async () => {
    if (!canRun) return;
    setIsRunning(true);
    setError(null);
    setAiResults(null);
    setQuantumResults(null);
    setApplications(null);

    try {
      const res = await fetch(`${API_URL}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formula: formula.trim(),
          n_qubits: qubits[0],
          max_iterations: maxIterations[0],
          simulation_type: simulationType,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setAiResults(data.ai_screening);
      setQuantumResults(data.quantum_simulation);
      setApplications(data.predicted_applications);
    } catch (err: any) {
      setError(err.message || "Simulation failed");
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setAiResults(null);
    setQuantumResults(null);
    setApplications(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient quantum glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-accent/5 blur-3xl animate-pulse" style={{ animationDelay: "3s" }} />
      </div>

      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent/20 to-purple-500/20 border border-accent/20">
            <Cpu className="h-6 w-6 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">AI + Quantum Simulator</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium uppercase tracking-wider">
                Research Grade
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              VQE · Hückel Hamiltonian · Ensemble Uncertainty · Ehull Prediction · Circuit Visualization
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ─── Left Panel ─── */}
          <div className="space-y-5 lg:col-span-1">
            {/* Formula */}
            <div className="bg-card/80 backdrop-blur rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-sm">
                <Beaker className="h-4 w-4 text-accent" />
                Compound
              </h3>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Chemical Formula</label>
                <input
                  type="text"
                  value={formula}
                  onChange={(e) => setFormula(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRunSimulation()}
                  placeholder="e.g. TiO2, LiCoO2"
                  className="w-full px-3 py-2.5 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 font-mono"
                />
              </div>
              {incomingElements?.length > 0 && (
                <p className="text-[10px] text-muted-foreground bg-muted/30 rounded-lg p-2">
                  From Builder: {formatElements(incomingElements)}
                </p>
              )}
            </div>

            {/* Quantum Parameters */}
            <div className="bg-card/80 backdrop-blur rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-sm">
                <Atom className="h-4 w-4 text-accent" />
                Quantum Parameters
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-medium">Simulation Type</label>
                <Select value={simulationType} onValueChange={setSimulationType}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronic">Electronic Structure</SelectItem>
                    <SelectItem value="energy">Energy Optimization</SelectItem>
                    <SelectItem value="quantum">Quantum State Approx.</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="font-medium">Qubits</label>
                  <span className="font-bold text-accent">{qubits[0]}</span>
                </div>
                <Slider value={qubits} onValueChange={setQubits} min={2} max={6} step={1} className="py-1" />
                <p className="text-[10px] text-muted-foreground">More qubits = deeper Hamiltonian</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="font-medium">VQE Iterations</label>
                  <span className="font-bold text-accent">{maxIterations[0]}</span>
                </div>
                <Slider value={maxIterations} onValueChange={setMaxIterations} min={10} max={60} step={5} className="py-1" />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="quantum"
                  className="flex-1"
                  onClick={handleRunSimulation}
                  disabled={!canRun || isRunning}
                >
                  {isRunning ? (
                    <>
                      <div className="h-4 w-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Run Simulation
                    </>
                  )}
                </Button>
                {allDone && (
                  <Button variant="outline" size="icon" onClick={handleReset} title="Reset">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Pipeline Status */}
            <div className="bg-card/80 backdrop-blur rounded-xl border border-border p-4">
              <h3 className="font-semibold text-xs mb-3 text-muted-foreground uppercase tracking-wider">Pipeline</h3>
              <div className="space-y-1.5">
                {[
                  { label: "AI Screening + Ehull", done: !!aiResults, icon: Brain },
                  { label: "VQE Optimization", done: !!quantumResults, icon: Cpu },
                  { label: "Application Analysis", done: !!applications, icon: Sparkles },
                ].map(({ label, done, icon: Icon }) => (
                  <div key={label} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${done ? "bg-emerald-500/10 text-emerald-400" : "text-muted-foreground"}`}>
                    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5 opacity-30" />}
                    {label}
                    {done && <ChevronRight className="h-3 w-3 ml-auto" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Right Panel ─── */}
          <div className="lg:col-span-3 space-y-5">
            {/* Error */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-destructive text-sm">Simulation Error</p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{error}</p>
                </div>
              </div>
            )}

            {/* ── AI SCREENING ── */}
            {aiResults && (
              <div className="bg-card/80 backdrop-blur rounded-xl border border-border p-6 space-y-5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-400" />
                    AI Screening Results
                  </h3>
                  <div className="flex gap-1.5">
                    {aiResults.model_type && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {aiResults.model_type}
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                        aiResults.is_stable
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                      {aiResults.is_stable ? "✓ Stable" : "Metastable"}
                    </span>
                  </div>
                </div>

                {/* Core Properties Row */}
                <div>
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-2">Thermodynamic Properties</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <StatCard
                      label="Formation Energy"
                      value={aiResults.formation_energy_eV_per_atom != null
                        ? `${aiResults.formation_energy_eV_per_atom.toFixed(3)} eV/atom`
                        : "N/A"}
                      sub={aiResults.formation_energy_uncertainty != null
                        ? `±${aiResults.formation_energy_uncertainty.toFixed(4)} eV`
                        : undefined}
                      color={aiResults.formation_energy_eV_per_atom < -0.5 ? "text-emerald-400" : "text-amber-400"}
                    />
                    <StatCard
                      label="E hull (primary)"
                      value={aiResults.e_above_hull_predicted != null
                        ? `${aiResults.e_above_hull_predicted.toFixed(4)} eV`
                        : "Not Evaluated"}
                      sub={aiResults.ehull_uncertainty != null
                        ? `±${aiResults.ehull_uncertainty.toFixed(4)} eV`
                        : undefined}
                      color={aiResults.e_above_hull_predicted == null ? "text-muted-foreground/50 italic"
                        : aiResults.e_above_hull_predicted < 0.05 ? "text-emerald-400"
                        : aiResults.e_above_hull_predicted < 0.2 ? "text-amber-400"
                        : "text-red-400"}
                      border={aiResults.e_above_hull_predicted == null ? "border-border/40"
                        : aiResults.e_above_hull_predicted < 0.05 ? "border-emerald-500/30"
                        : "border-amber-500/30"}
                    />
                    <StatCard
                      label="Band Gap"
                      value={aiResults.band_gap_eV != null
                        ? `${aiResults.band_gap_eV.toFixed(3)} eV`
                        : "N/A"}
                      sub={aiResults.band_gap_uncertainty != null
                        ? `±${aiResults.band_gap_uncertainty.toFixed(3)} eV`
                        : undefined}
                      color="text-cyan-400"
                    />
                    <StatCard
                      label="Thermodynamic Status"
                      value={aiResults.stability_label ?? (aiResults.is_stable ? "Stable" : "Metastable")}
                      color={aiResults.is_stable ? "text-emerald-400" : "text-amber-400"}
                    />
                    <StatCard
                      label="Convex Hull Status"
                      value={
                        aiResults.hull_status === "on_hull" ? "✓ On Hull"
                        : aiResults.hull_status === "near_hull" ? "◐ Near Hull"
                        : aiResults.hull_status === "above_hull" ? "✗ Above Hull"
                        : "Not Evaluated"
                      }
                      sub={aiResults.hull_distance_eV != null
                        ? `Δ = ${aiResults.hull_distance_eV.toFixed(3)} eV`
                        : undefined}
                      color={
                        aiResults.hull_status === "on_hull" ? "text-emerald-400"
                        : aiResults.hull_status === "near_hull" ? "text-amber-400"
                        : aiResults.hull_status === "above_hull" ? "text-red-400"
                        : "text-muted-foreground/50 italic"
                      }
                    />
                    <StatCard
                      label="Decomposition Risk"
                      value={aiResults.decomposition_risk_pct != null
                        ? `${aiResults.decomposition_risk_pct.toFixed(1)}%`
                        : "Not Evaluated"}
                      sub={aiResults.likely_decomposition_products?.length > 0
                        ? `→ ${aiResults.likely_decomposition_products.slice(0, 2).map((p: any) => p.formula).join(" + ")}`
                        : undefined}
                      color={
                        aiResults.decomposition_risk_pct == null ? "text-muted-foreground/50 italic"
                        : aiResults.decomposition_risk_pct < 10 ? "text-emerald-400"
                        : aiResults.decomposition_risk_pct < 50 ? "text-amber-400"
                        : "text-red-400"
                      }
                    />
                  </div>
                </div>

                {/* Uncertainty + Confidence Row */}
                <div>
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-2">Model Uncertainty (Bayesian Ensemble)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <StatCard
                      label="95% Confidence Interval"
                      value={aiResults.confidence_interval_95 != null
                        ? `±${aiResults.confidence_interval_95.toFixed(3)} eV`
                        : "N/A"}
                      sub={aiResults.confidence_interval_95 != null ? "Formation energy" : undefined}
                    />
                    <StatCard
                      label="Epistemic Uncertainty"
                      value={aiResults.epistemic_uncertainty != null
                        ? `${aiResults.epistemic_uncertainty.toFixed(4)} eV`
                        : "N/A"}
                      sub="Model knowledge gap"
                    />
                    <StatCard
                      label="Aleatoric Uncertainty"
                      value={aiResults.aleatoric_uncertainty != null
                        ? `${aiResults.aleatoric_uncertainty.toFixed(4)} eV`
                        : "N/A"}
                      sub="Intrinsic data noise"
                    />
                  </div>
                </div>

                {/* ML Prototype + Structure */}
                <div>
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-2">Crystal Structure</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                      <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1.5">
                        <Layers className="h-3 w-3 text-cyan-400" />
                        ML Crystal Prototype
                      </p>
                      <p className="font-bold text-sm text-cyan-300 capitalize">
                        {aiResults.ml_prototype || aiResults.structure_type || "Unknown"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Confidence: {((aiResults.ml_prototype_confidence || 0) * 100).toFixed(0)}%
                      </p>
                      {aiResults.ml_prototype_top3?.length > 0 && (
                        <div className="mt-1.5 space-y-0.5">
                          {aiResults.ml_prototype_top3.map((p: any) => (
                            <div key={p.label} className="flex items-center gap-1.5 text-[9px]">
                              <ProgressBar value={p.prob} color="bg-cyan-500" />
                              <span className="text-muted-foreground w-16 truncate">{p.label}</span>
                              <span className="text-cyan-400 font-mono">{(p.prob * 100).toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                      <p className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <Zap className="h-3 w-3 text-indigo-400" />
                        Electronic Structure Insights
                      </p>
                      {[
                        { label: "Orbital Interaction", value: quantumResults?.orbital_interaction },
                        { label: "DOS Dispersion", value: quantumResults?.dos_dispersion },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center gap-2 text-[10px] mb-1.5">
                          <span className="text-muted-foreground w-28">{label}</span>
                          <ProgressBar value={value ?? 0} color="bg-indigo-500" />
                          <span className="text-indigo-300 font-mono w-8 text-right">
                            {value != null ? `${(value * 100).toFixed(0)}%` : "—"}
                          </span>
                        </div>
                      ))}
                      {quantumResults?.energy_correction != null && (
                        <p className="text-[10px] text-muted-foreground mt-2">
                          Energy correction: <span className="text-indigo-300 font-mono">{quantumResults.energy_correction.toFixed(4)} a.u.</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score breakdown */}
                {aiResults.score_breakdown && (
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/30">
                    <p className="text-[10px] text-muted-foreground mb-2">Stability Score Breakdown (Probabilistic Model)</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {Object.entries(aiResults.score_breakdown as Record<string, number>).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-1.5 text-[10px]">
                          <span className="text-muted-foreground w-24 truncate">
                            {key === "p_stability" ? "Stability Prob"
                              : key === "struct_coeff" ? "Structure Adj"
                              : key === "novelty_pts" ? "Novelty Bonus"
                              : key === "quantum_pts" ? "Quantum Refine"
                              : key}
                          </span>
                          <ProgressBar value={(val as number) / 100} color="bg-accent" />
                          <span className="font-mono w-8 text-right text-accent">{(val as number).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[9px] text-muted-foreground/40 mt-2 italic">
                      Ehull &gt; 0.1 eV → score capped at 70%. Trained on real DFT data.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── APPLICATIONS ── */}
            {applications && (
              <div className="bg-card/80 backdrop-blur rounded-xl border border-border p-6 space-y-4 animate-fade-in">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  Predicted Applications
                  {applications.material_class && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 ml-auto">
                      {applications.material_class}
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(applications.primary_applications || []).map((app: string) => (
                    <span key={app} className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20 hover:bg-accent/20 transition-colors">
                      {app}
                    </span>
                  ))}
                </div>
                {applications.detailed_applications?.length > 0 && (
                  <div className="space-y-2">
                    {applications.detailed_applications.slice(0, 4).map((app: any) => (
                      <div key={app.application} className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground w-48 truncate">{app.application}</span>
                        <ProgressBar value={app.confidence || 0} color="bg-accent" />
                        <span className="font-mono font-bold text-accent w-8 text-right">{Math.round((app.confidence || 0) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                )}
                {applications.solar_suitability != null && (
                  <div className="flex items-center gap-3 text-xs pt-1">
                    <span className="text-muted-foreground">Solar Suitability</span>
                    <ProgressBar value={applications.solar_suitability} color="bg-amber-500" />
                    <span className="font-bold text-amber-400">{Math.round(applications.solar_suitability * 100)}%</span>
                  </div>
                )}
                {applications.stability_note && (
                  <p className="text-xs text-muted-foreground italic border-l-2 border-accent/30 pl-2">{applications.stability_note}</p>
                )}
              </div>
            )}

            {/* ── VQE RESULTS ── */}
            {quantumResults && (
              <div className="bg-card/80 backdrop-blur rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent p-6 space-y-5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-purple-400" />
                    {quantumResults.energy_label || "VQE Quantum Simulation"}
                  </h3>
                  <div className="flex gap-1.5">
                    {quantumResults.hamiltonian_type && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {quantumResults.hamiltonian_type}
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                      quantumResults.converged
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {quantumResults.converged ? "✓ Converged" : "✗ Not Converged"}
                    </span>
                  </div>
                </div>

                {quantumResults.hamiltonian_description && (
                  <p className="text-[10px] text-muted-foreground bg-purple-500/5 rounded-lg p-3 border border-purple-500/10">
                    ⚛️ {quantumResults.hamiltonian_description}
                  </p>
                )}

                {/* VQE Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard
                    label="Ground State Energy"
                    value={`${quantumResults.energy?.toFixed(6)} ${quantumResults.energy_unit || "a.u."}`}
                    accent
                    border="border-purple-500/30"
                  />
                  <StatCard label="Qubits" value={quantumResults.n_qubits} />
                  <StatCard
                    label="Iterations"
                    value={`${quantumResults.iterations} / ${quantumResults.max_iterations}`}
                    color={quantumResults.converged ? "text-emerald-400" : "text-amber-400"}
                  />
                  <StatCard label="Exec Time" value={`${quantumResults.execution_time_s}s`} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Total Parameters" value={quantumResults.n_parameters} />
                  <StatCard label="Total Gates" value={quantumResults.total_gates} />
                  <StatCard label="Circuit Depth" value={quantumResults.circuit_depth} />
                </div>

                {/* Elements used in Hamiltonian */}
                {quantumResults.elements_used?.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-muted-foreground">Hamiltonian elements:</span>
                    {quantumResults.elements_used.map((el: string) => (
                      <span key={el} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-medium border border-purple-500/20">
                        {el}
                      </span>
                    ))}
                  </div>
                )}

                {/* Convergence chart */}
                <ConvergenceChart
                  history={quantumResults.convergence_history}
                  unit={quantumResults.energy_unit || "a.u."}
                />

                {/* ── Quantum Circuit Diagram ── */}
                {quantumResults.circuit_layers?.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-purple-400" />
                        Quantum Circuit Diagram
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {quantumResults.n_qubits} qubits · {quantumResults.total_gates} gates · depth {quantumResults.circuit_depth}
                      </span>
                    </div>
                    <QuantumCircuitDiagram
                      layers={quantumResults.circuit_layers}
                      nQubits={quantumResults.n_qubits}
                    />
                    {/* Layer legend */}
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-500/40 border border-indigo-500 inline-block" />Rotation (Ry)</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-500/40 border border-purple-500 inline-block" />Entanglement (CNOT)</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500/40 border border-amber-500 inline-block" />Measurement</span>
                    </div>

                    {/* Circuit layer text summary */}
                    <div className="space-y-1">
                      {quantumResults.circuit_layers.map((layer: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-[10px] px-3 py-1.5 rounded-lg bg-muted/20 border border-border/30">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                            layer.type === "rotation" ? "bg-indigo-500/10 text-indigo-400"
                            : layer.type === "entanglement" ? "bg-purple-500/10 text-purple-400"
                            : "bg-amber-500/10 text-amber-400"
                          }`}>{layer.type}</span>
                          <span className="text-muted-foreground flex-1">{layer.name}</span>
                          <span className="font-mono text-muted-foreground">{layer.gates?.length} gates: {layer.gates?.slice(0, 4).join(", ")}{layer.gates?.length > 4 ? "..." : ""}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Export */}
            {allDone && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadJSON(`simulation_${formula}.json`, { formula, ai_screening: aiResults, quantum_simulation: quantumResults, predicted_applications: applications })}
                >
                  <Download className="h-3.5 w-3.5 mr-2" />
                  Export JSON
                </Button>
                {["cif", "poscar", "xyz"].map((fmt) => (
                  <a
                    key={fmt}
                    href={`${API_URL}/export/${fmt}?formula=${encodeURIComponent(formula)}`}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/30 border border-border/50 text-muted-foreground hover:text-accent hover:border-accent/30 transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    {fmt.toUpperCase()}
                  </a>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isRunning && !allDone && !error && (
              <div className="bg-card/60 rounded-xl border border-border/50 p-16 flex flex-col items-center justify-center text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Cpu className="h-8 w-8 text-purple-400/50" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                    <Zap className="h-3 w-3 text-accent" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-muted-foreground/70 mb-2">Ready to Simulate</h3>
                <p className="text-xs text-muted-foreground/40 max-w-md">
                  Enter a chemical formula (e.g. <span className="font-mono text-accent/60">TiO2</span>, <span className="font-mono text-accent/60">LiCoO2</span>) and click "Run Simulation" to get AI predictions, Ehull analysis, and the full VQE quantum circuit.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Simulator;