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
} from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { QuantumCircuitViewer } from "@/components/QuantumCircuitViewer";

const API_URL = "http://localhost:5000";

// ---- helpers ----
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

// ---- component ----
const Simulator = () => {
  const location = useLocation();
  const state = (location?.state as any) || {};
  const incomingElements = state?.elements || [];
  const incomingFormula = state?.formula || "";

  const [formula, setFormula] = useState(incomingFormula || "");
  const [qubits, setQubits] = useState([3]);
  const [simulationType, setSimulationType] = useState("electronic");
  const [maxIterations, setMaxIterations] = useState([30]);

  // pipeline state
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<any>(null);
  const [quantumResults, setQuantumResults] = useState<any>(null);
  const [applications, setApplications] = useState<any>(null);
  const [structure, setStructure] = useState<any>(null);

  const canRun = formula.trim().length > 0;

  const handleRunSimulation = async () => {
    if (!canRun) return;
    setIsRunning(true);
    setError(null);
    setAiResults(null);
    setQuantumResults(null);
    setApplications(null);
    setStructure(null);

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
      setStructure(data.structure);
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
    setStructure(null);
    setError(null);
  };

  const allDone = aiResults && quantumResults;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-accent/20">
            <Cpu className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI + Quantum Simulator</h1>
            <p className="text-sm text-muted-foreground">
              Real VQE simulation &amp; AI property prediction
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Left Column: Controls ─── */}
          <div className="space-y-5">
            {/* Formula Input */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Beaker className="h-4 w-4 text-accent" />
                Compound
              </h3>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Chemical Formula</label>
                <input
                  type="text"
                  value={formula}
                  onChange={(e) => setFormula(e.target.value)}
                  placeholder="e.g. TiO2, LiCoO2, Fe2O3"
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              {incomingElements?.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  From Molecule Builder: {formatElements(incomingElements)}
                </p>
              )}
            </div>

            {/* Simulation Controls */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Atom className="h-4 w-4 text-accent" />
                Quantum Parameters
              </h3>

              <div className="space-y-3">
                <label className="text-sm font-medium">Simulation Type</label>
                <Select value={simulationType} onValueChange={setSimulationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronic">Electronic Structure</SelectItem>
                    <SelectItem value="energy">Energy Optimization</SelectItem>
                    <SelectItem value="quantum">Quantum State Approx.</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Qubits</label>
                  <span className="text-sm font-bold text-accent">{qubits[0]}</span>
                </div>
                <Slider value={qubits} onValueChange={setQubits} min={2} max={6} step={1} className="py-1" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">VQE Iterations</label>
                  <span className="text-sm font-bold text-accent">{maxIterations[0]}</span>
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
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm mb-3">Pipeline</h3>
              <div className="space-y-2">
                {[
                  { label: "AI Screening", done: !!aiResults, icon: Brain },
                  { label: "VQE Simulation", done: !!quantumResults, icon: Cpu },
                  { label: "Use-Case Analysis", done: !!applications, icon: Sparkles },
                ].map(({ label, done, icon: Icon }) => (
                  <div key={label} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${done ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4 opacity-40" />}
                    {label}
                    {done && <ChevronRight className="h-3 w-3 ml-auto" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Right Column: Results ─── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Error */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Simulation Error</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* AI Screening Results */}
            {aiResults && (
              <div className="bg-card rounded-xl border border-border p-6 space-y-4 animate-fade-in">
                <h3 className="font-semibold flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-500" />
                  AI Screening Results
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <ResultCard label="Formation Energy" value={`${aiResults.formation_energy_eV_per_atom?.toFixed(3)} eV/atom`} />
                  <ResultCard label="Band Gap" value={`${aiResults.band_gap_eV?.toFixed(3)} eV`} />
                  <ResultCard label="Thermodynamic" value={aiResults.is_stable ? "✓ Stable" : "Metastable"} accent={aiResults.is_stable} />
                  <ResultCard label="Features Used" value={`${aiResults.feature_count}`} />
                </div>
              </div>
            )}

            {/* Use-Case Predictions */}
            {applications && (
              <div className="bg-card rounded-xl border border-border p-6 space-y-4 animate-fade-in">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Predicted Applications
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Material Class</p>
                    <p className="font-semibold text-sm">{applications.material_class}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Solar Suitability</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted/50 rounded-full h-2">
                        <div
                          className="bg-amber-500 rounded-full h-2 transition-all"
                          style={{ width: `${(applications.solar_suitability || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold">{Math.round((applications.solar_suitability || 0) * 100)}%</span>
                    </div>
                  </div>
                </div>
                {applications.stability_note && (
                  <p className="text-sm text-muted-foreground italic">
                    {applications.stability_note}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {(applications.primary_applications || []).map((app: string) => (
                    <span key={app} className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                      {app}
                    </span>
                  ))}
                  {(applications.element_applications || []).map((app: string) => (
                    <span key={app} className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium">
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantum Simulation Results */}
            {quantumResults && (
              <div className="bg-card rounded-xl border border-border p-6 space-y-4 animate-fade-in">
                <h3 className="font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  VQE Quantum Simulation
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <ResultCard label="Method" value={quantumResults.method} />
                  <ResultCard label="Qubits" value={quantumResults.n_qubits} />
                  <ResultCard label="Circuit Depth" value={quantumResults.circuit_depth} />
                  <ResultCard label="Gate Count" value={quantumResults.gate_count} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <ResultCard label="Initial Energy" value={`${quantumResults.initial_energy?.toFixed(4)} Ha`} />
                  <ResultCard label="Final Energy" value={`${quantumResults.final_energy?.toFixed(4)} Ha`} accent />
                  <ResultCard label="Improvement" value={`${quantumResults.energy_improvement?.toFixed(4)} Ha`} />
                </div>

                {/* Convergence Chart */}
                {quantumResults.convergence?.length > 0 && (
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-3">VQE Energy Convergence</p>
                    <div className="h-32 flex items-end gap-[2px]">
                      {quantumResults.convergence.map((e: number, i: number) => {
                        const conv = quantumResults.convergence;
                        const min = Math.min(...conv);
                        const max = Math.max(...conv);
                        const range = max - min || 1;
                        const height = ((e - min) / range) * 100;
                        return (
                          <div
                            key={i}
                            className="flex-1 rounded-t transition-all bg-gradient-to-t from-purple-600 to-accent"
                            style={{ height: `${Math.max(5, 100 - height)}%` }}
                            title={`Iteration ${i + 1}: ${e.toFixed(4)} Ha`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>Iter 1</span>
                      <span>Iter {quantumResults.convergence.length}</span>
                    </div>
                  </div>
                )}

                {/* Quantum Circuit Diagram */}
                {quantumResults.circuit_gates?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Quantum Circuit</p>
                    <QuantumCircuitViewer
                      gates={quantumResults.circuit_gates}
                      nQubits={quantumResults.n_qubits}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Export */}
            {allDone && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => downloadJSON(`simulation_${formula}.json`, {
                    formula,
                    ai_screening: aiResults,
                    quantum_simulation: quantumResults,
                    predicted_applications: applications,
                  })}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </Button>
              </div>
            )}

            {/* Empty state */}
            {!isRunning && !allDone && !error && (
              <div className="bg-card rounded-xl border border-border/50 p-16 flex flex-col items-center justify-center text-center">
                <Cpu className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground/60 mb-2">
                  Ready to Simulate
                </h3>
                <p className="text-sm text-muted-foreground/40 max-w-md">
                  Enter a chemical formula and configure quantum parameters, then click "Run Simulation"
                  to get real AI predictions and VQE quantum results.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

function ResultCard({ label, value, accent }: { label: string; value: any; accent?: boolean }) {
  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`font-semibold text-sm ${accent ? "text-accent" : ""}`}>
        {value}
      </p>
    </div>
  );
}

export default Simulator;