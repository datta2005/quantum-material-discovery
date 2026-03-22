import { Navbar } from "@/components/layout/Navbar";
import { PeriodicTable } from "@/components/molecule-builder/PeriodicTable";
import { MoleculeConstructionZone, MoleculeElement } from "@/components/molecule-builder/MoleculeConstructionZone";
import { MoleculeSummary } from "@/components/molecule-builder/MoleculeSummary";
import { SimulationPanel } from "@/components/molecule-builder/SimulationPanel";
import { Molecule3DViewer } from "@/components/molecule-builder/Molecule3DViewer";
import { MoleculePresets } from "@/components/molecule-builder/MoleculePresets";
import { MoleculeCompareView } from "@/components/molecule-builder/MoleculeCompareView";
import { ExportPanel } from "@/components/molecule-builder/ExportPanel";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Atom, Beaker, Brain, FlaskConical, Microscope, ChevronRight } from "lucide-react";

const API_URL = "http://localhost:5000";

// ─── Live AI Preflight Panel ──────────────────────────────────────────────────
interface AIPreflight {
  formation_energy_eV_per_atom: number | null;
  band_gap_eV: number | null;
  is_stable: boolean;
  model_type: string;
  confidence_level: string;
  e_above_hull_predicted?: number | null;
}

function useAIPreflight(elements: MoleculeElement[]) {
  const [data, setData] = useState<AIPreflight | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (elements.length < 2) {
      setData(null);
      return;
    }
    const formula = elements.map(el => `${el.symbol}${el.count > 1 ? el.count : ""}`).join("");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/simulate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formula, n_qubits: 2, max_iterations: 5 }),
        });
        if (res.ok) {
          const json = await res.json();
          const ai = json.ai_screening ?? {};
          setData({
            formation_energy_eV_per_atom: ai.formation_energy_eV_per_atom ?? null,
            band_gap_eV: ai.band_gap_eV ?? null,
            is_stable: ai.is_stable ?? false,
            model_type: ai.model_type ?? "ML",
            confidence_level: ai.confidence_level ?? "medium",
            e_above_hull_predicted: null,
          });
        }
      } catch {
        // no-op — backend may not be running at design time
      } finally {
        setLoading(false);
      }
    }, 700);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [elements]);

  return { data, loading };
}

// ─── Inline Live Property Chip ─────────────────────────────────────────────
function PropertyChip({
  label,
  value,
  unit,
  variant = "neutral",
}: {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  variant?: "positive" | "negative" | "neutral" | "warn";
}) {
  const color =
    variant === "positive" ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/5"
    : variant === "negative" ? "text-red-400 border-red-400/30 bg-red-400/5"
    : variant === "warn" ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/5"
    : "text-accent border-accent/30 bg-accent/5";

  return (
    <div className={`rounded-lg border px-3 py-2 ${color}`}>
      <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-bold">
        {value === null || value === undefined ? "—" : `${value}${unit ? ` ${unit}` : ""}`}
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────────
const MoleculeBuilder = () => {
  const [elements, setElements] = useState<MoleculeElement[]>([]);
  const [showCompareView, setShowCompareView] = useState(false);
  const [activeTab, setActiveTab] = useState<"build" | "simulate">("build");
  const { data: preflight, loading: preflightLoading } = useAIPreflight(elements);

  const handleAddElement = (element: { symbol: string; name: string; atomicMass: number }) => {
    setElements(prev => {
      const existing = prev.find(e => e.symbol === element.symbol);
      if (existing) {
        return prev.map(e => e.symbol === element.symbol ? { ...e, count: e.count + 1 } : e);
      }
      return [...prev, { ...element, count: 1 }];
    });
  };

  const handleUpdateCount = (symbol: string, delta: number) => {
    setElements(prev => prev.map(e => e.symbol === symbol ? { ...e, count: Math.max(1, e.count + delta) } : e));
  };

  const handleRemoveElement = (symbol: string) => {
    setElements(prev => prev.filter(e => e.symbol !== symbol));
  };

  const handleClear = () => setElements([]);
  const handleLoadPreset = (presetElements: MoleculeElement[]) => setElements(presetElements);

  const hasElements = elements.length > 0;
  const formula = elements.map(el => `${el.symbol}${el.count > 1 ? el.count : ""}`).join("");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Floating background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-quantum/5 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <main className="container py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FlaskConical className="h-6 w-6 text-accent" />
              <span className="text-xs font-medium text-accent uppercase tracking-widest">Material Explorer</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Molecule Builder</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Design materials atom-by-atom. Get live <span className="text-accent font-medium">AI + Quantum</span> property predictions instantly.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCompareView(true)}
              disabled={!hasElements}
              className="flex items-center gap-2"
            >
              <ArrowLeftRight className="h-4 w-4" />
              Compare
            </Button>
          </div>
        </div>

        {/* Live AI Preflight Card — shown as soon as user has 2+ elements */}
        {hasElements && (
          <div className="rounded-xl border border-accent/20 bg-gradient-to-r from-accent/5 via-background to-quantum/5 p-4 transition-all duration-500">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-accent" />
                <span className="text-sm font-semibold">Live AI Preview</span>
                <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-full">{formula}</span>
                {preflightLoading && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <div className="h-3 w-3 border border-accent/30 border-t-accent rounded-full animate-spin" />
                    Predicting...
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 ml-auto">
                {preflight ? (
                  <>
                    <PropertyChip
                      label="Formation Energy"
                      value={preflight.formation_energy_eV_per_atom?.toFixed(3)}
                      unit="eV/atom"
                      variant={preflight.formation_energy_eV_per_atom !== null && preflight.formation_energy_eV_per_atom < -0.5 ? "positive" : "warn"}
                    />
                    <PropertyChip
                      label="Band Gap"
                      value={preflight.band_gap_eV?.toFixed(3)}
                      unit="eV"
                      variant="neutral"
                    />
                    <PropertyChip
                      label="AI Stability"
                      value={preflight.is_stable ? "Stable" : "Unstable"}
                      variant={preflight.is_stable ? "positive" : "negative"}
                    />
                    <PropertyChip
                      label="Model"
                      value={preflight.model_type}
                    />
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Properties will appear here in real-time...</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border w-fit">
          {(["build", "simulate"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? "bg-background border border-border text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "build" ? <Atom className="h-4 w-4" /> : <Microscope className="h-4 w-4" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "simulate" && hasElements && (
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {activeTab === "build" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel - Presets + Periodic Table */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-card/80 backdrop-blur rounded-xl border border-border p-4">
                <MoleculePresets onLoadPreset={handleLoadPreset} />
              </div>
              <div className="bg-card/80 backdrop-blur rounded-xl border border-border p-4">
                <PeriodicTable onElementSelect={handleAddElement} />
              </div>
            </div>

            {/* Center Panel - Construction Zone + 3D */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-card/80 backdrop-blur rounded-xl border border-border p-6">
                <MoleculeConstructionZone
                  elements={elements}
                  onAddElement={handleAddElement}
                  onUpdateCount={handleUpdateCount}
                  onRemoveElement={handleRemoveElement}
                  onClear={handleClear}
                />
              </div>
              <div className="bg-card/80 backdrop-blur rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    3D Atomic Structure
                  </h3>
                  {hasElements && (
                    <span className="text-xs text-muted-foreground">{formula}</span>
                  )}
                </div>
                <div className="h-[350px]">
                  <Molecule3DViewer elements={elements} />
                </div>
              </div>
            </div>

            {/* Right Panel - Summary + Export */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-card/80 backdrop-blur rounded-xl border border-border p-6">
                <MoleculeSummary elements={elements} />
              </div>
              <ExportPanel elements={elements} />

              {/* CTA to switch to simulate */}
              {hasElements && (
                <button
                  onClick={() => setActiveTab("simulate")}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-accent/10 to-quantum/10 border border-accent/20 hover:from-accent/20 hover:to-quantum/20 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-2">
                    <Beaker className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">Run Full Quantum Simulation</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === "simulate" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar — quick formula reminder */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-card/80 backdrop-blur rounded-xl border border-border p-6">
                <MoleculeSummary elements={elements} />
              </div>
            </div>
            <div className="lg:col-span-8">
              <SimulationPanel elements={elements} />
            </div>
          </div>
        )}
      </main>

      {/* Compare View Modal */}
      {showCompareView && (
        <MoleculeCompareView
          currentMolecule={elements}
          onClose={() => setShowCompareView(false)}
        />
      )}
    </div>
  );
};

export default MoleculeBuilder;
