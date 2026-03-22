import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Send, Brain, Cpu, Waves, Zap, ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";
import { MoleculeElement } from "./MoleculeConstructionZone";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate } from "react-router-dom";
import { QuantumCircuitViewer } from "@/components/QuantumCircuitViewer";

const API_URL = "http://localhost:5000";

interface SimulationPanelProps {
  elements: MoleculeElement[];
}

export function SimulationPanel({ elements }: SimulationPanelProps) {
  const navigate = useNavigate();
  const [qubits, setQubits] = useState([3]);
  const [simulationType, setSimulationType] = useState("electronic");
  const [isRunning, setIsRunning] = useState(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  // Real results from backend
  const [aiResults, setAiResults] = useState<any>(null);
  const [quantumResults, setQuantumResults] = useState<any>(null);
  const [applications, setApplications] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const hasElements = elements.length > 0;

  const formatFormula = () => {
    return elements.map(el => {
      const subscript = el.count > 1 ? String(el.count).split("").map(d => "₀₁₂₃₄₅₆₇₈₉"[parseInt(d)]).join("") : "";
      return el.symbol + subscript;
    }).join("");
  };

  const getRawFormula = () => {
    return elements.map(el => `${el.symbol}${el.count > 1 ? el.count : ""}`).join("");
  };

  const handleRunSimulation = async () => {
    if (!hasElements) return;
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
          formula: getRawFormula(),
          n_qubits: qubits[0],
          max_iterations: 25,
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

  return (
    <div className="space-y-6">
      {/* Simulation Controls */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-5">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Cpu className="h-5 w-5 text-accent" />
          Quantum Simulation
        </h3>

        <div className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">Simulation Type</label>
            <Select value={simulationType} onValueChange={setSimulationType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronic">Electronic Structure</SelectItem>
                <SelectItem value="energy">Energy Optimization</SelectItem>
                <SelectItem value="quantum">Quantum State Approximation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Qubits</label>
              <span className="text-sm font-bold text-accent">{qubits[0]}</span>
            </div>
            <Slider value={qubits} onValueChange={setQubits} min={2} max={6} step={1} className="py-2" />
          </div>

          <Button
            variant="quantum"
            className="w-full"
            onClick={handleRunSimulation}
            disabled={!hasElements || isRunning}
          >
            {isRunning ? (
              <>
                <div className="h-4 w-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                Running Simulation...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Quantum Simulation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* AI results */}
      {aiResults && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4 animate-fade-in">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            AI Prediction
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground">Formation Energy</p>
              <p className="font-semibold text-sm">{aiResults.formation_energy_eV_per_atom?.toFixed(3)} eV/atom</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground">Band Gap</p>
              <p className="font-semibold text-sm">{aiResults.band_gap_eV?.toFixed(3)} eV</p>
            </div>
          </div>
        </div>
      )}

      {/* Applications */}
      {applications && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-3 animate-fade-in">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Predicted Applications
          </h3>
          <p className="text-xs font-medium text-accent">{applications.material_class}</p>
          <div className="flex flex-wrap gap-1.5">
            {[...(applications.primary_applications || []), ...(applications.element_applications || [])].slice(0, 5).map((app: string) => (
              <span key={app} className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs">
                {app}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* VQE Results + Circuit */}
      {quantumResults && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4 animate-fade-in">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            VQE Results
          </h3>
          <div className="grid grid-cols-2 gap-3">
             <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground">Ground State Energy</p>
              <p className="font-semibold text-sm text-accent">{quantumResults.energy?.toFixed(6)} a.u.</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground">Circuit Depth</p>
              <p className="font-semibold text-sm">{quantumResults.circuit_depth}</p>
            </div>
          </div>
          {/* Circuit diagram */}
           {quantumResults.circuit_layers?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Quantum Circuit Layers ({quantumResults.n_qubits} qubits)</p>
              <div className="space-y-1">
                {quantumResults.circuit_layers.slice(0, 4).map((layer: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      layer.type === 'rotation' ? 'bg-accent' :
                      layer.type === 'entanglement' ? 'bg-purple-400' : 'bg-muted'
                    }`} />
                    <span className="text-muted-foreground">{layer.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground/60">{layer.gates?.length} gates</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      {hasElements && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() =>
              navigate("/simulator", {
                state: {
                  elements,
                  formula: getRawFormula(),
                  source: "molecule-builder",
                },
              })
            }
          >
            <Send className="h-4 w-4 mr-2" />
            Full Simulator
          </Button>
          <Button variant="outline" onClick={() => navigate("/insights")}>
            <Brain className="h-4 w-4 mr-2" />
            AI Insights
          </Button>
        </div>
      )}

      {/* How It Works */}
      <Collapsible open={isExplanationOpen} onOpenChange={setIsExplanationOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              How It Works
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isExplanationOpen ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div className="p-4 rounded-xl bg-card border border-border space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Waves className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Element Ratios → Molecules</p>
                <p className="text-xs text-muted-foreground">
                  Atoms combine in specific ratios based on their valence electrons. H₂O means 2 hydrogen atoms bond with 1 oxygen.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-sm">AI Property Prediction</p>
                <p className="text-xs text-muted-foreground">
                  GradientBoosting models trained on Materials Project data predict formation energy and band gap from 20 elemental features.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Cpu className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-sm">VQE Quantum Simulation</p>
                <p className="text-xs text-muted-foreground">
                  Real Variational Quantum Eigensolver using Qiskit — parameterized ansatz with Ry/CNOT gates optimized to find ground state energy.
                </p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
