import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Send, Brain, Cpu, Waves, Zap, ChevronDown } from "lucide-react";
import { useState } from "react";
import { MoleculeElement } from "./MoleculeConstructionZone";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate } from "react-router-dom";

interface SimulationPanelProps {
  elements: MoleculeElement[];
}

export function SimulationPanel({ elements }: SimulationPanelProps) {
  const navigate = useNavigate();
  const [qubits, setQubits] = useState([6]);
  const [simulationType, setSimulationType] = useState("electronic");
  const [isRunning, setIsRunning] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  const hasElements = elements.length > 0;

  const handleRunSimulation = () => {
    if (!hasElements) return;
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setHasResults(true);
    }, 2000);
  };

  const formatFormula = () => {
    return elements.map(el => {
      const subscript = el.count > 1 ? String(el.count).split("").map(d => "₀₁₂₃₄₅₆₇₈₉"[parseInt(d)]).join("") : "";
      return el.symbol + subscript;
    }).join("");
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
              <label className="text-sm font-medium">Simulation Depth (Qubits)</label>
              <span className="text-sm font-bold text-accent">{qubits[0]}</span>
            </div>
            <Slider
              value={qubits}
              onValueChange={setQubits}
              min={2}
              max={16}
              step={1}
              className="py-2"
            />
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

      {/* Simulation Results */}
      {hasResults && hasElements && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4 animate-fade-in">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            Simulation Results
          </h3>

          {/* Quantum Circuit Placeholder */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Quantum Circuit Visualization</p>
            <div className="h-20 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 300 60">
                {[0, 1, 2].map((i) => (
                  <g key={i}>
                    <line x1="20" y1={15 + i * 20} x2="280" y2={15 + i * 20} stroke="currentColor" strokeOpacity="0.3" />
                    <text x="5" y={19 + i * 20} className="text-[8px] fill-muted-foreground">q{i}</text>
                    <rect x="60" y={7 + i * 20} width="16" height="16" rx="2" className="fill-accent/20 stroke-accent" strokeWidth="1" />
                    <text x="64" y={19 + i * 20} className="text-[8px] fill-accent font-bold">H</text>
                    {i < 2 && <circle cx="120" cy={15 + i * 20} r="3" className="fill-quantum" />}
                    <rect x="200" y={7 + i * 20} width="20" height="16" rx="2" className="fill-accent/10 stroke-accent/50" strokeWidth="1" />
                  </g>
                ))}
                <line x1="120" y1="15" x2="120" y2="35" stroke="currentColor" strokeOpacity="0.5" />
              </svg>
            </div>
          </div>

          {/* Energy Graph */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Energy Levels</p>
            <div className="h-24 flex items-end justify-around gap-2 px-2">
              {[0.78, 0.15, 0.05, 0.02].map((prob, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-accent to-quantum transition-all"
                    style={{ height: `${prob * 100}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">E{i}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insight */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-accent/10 to-quantum/10 border border-accent/20">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">AI-Generated Insight</p>
                <p className="text-sm text-muted-foreground">
                  This molecular structure ({formatFormula()}) shows high stability and potential for energy storage applications. 
                  The quantum simulation indicates favorable electronic properties with a predicted ground state energy of -1.247 Ha.
                </p>
              </div>
            </div>
          </div>

          {/* Integration Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => navigate("/simulator")}>
              <Send className="h-4 w-4 mr-2" />
              Send to Simulator
            </Button>
            <Button variant="outline" onClick={() => navigate("/insights")}>
              <Brain className="h-4 w-4 mr-2" />
              Analyze in AI Insights
            </Button>
          </div>
        </div>
      )}

      {/* AI & Quantum Explanation Panel */}
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
                  Machine learning models trained on quantum chemistry data predict molecular properties like stability and energy levels.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Cpu className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Quantum Simulation</p>
                <p className="text-xs text-muted-foreground">
                  Quantum algorithms model molecular behavior at the atomic level, providing accurate energy calculations impossible for classical computers.
                </p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Future Placeholders */}
      <div className="space-y-2">
        <Button variant="outline" className="w-full" disabled>
          <span className="opacity-50">🥽 AR Molecule View</span>
          <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
        </Button>
        <Button variant="outline" className="w-full" disabled>
          <span className="opacity-50">⚡ Real Quantum Hardware</span>
          <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
        </Button>
        <Button variant="outline" className="w-full" disabled>
          <span className="opacity-50">📄 Export Report</span>
          <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
        </Button>
      </div>
    </div>
  );
}
