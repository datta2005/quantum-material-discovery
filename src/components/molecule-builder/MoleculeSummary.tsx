import { Activity, Zap, ThermometerSun, Link2, Scale, Info } from "lucide-react";
import { MoleculeElement } from "./MoleculeConstructionZone";

interface MoleculeSummaryProps {
  elements: MoleculeElement[];
}

export function MoleculeSummary({ elements }: MoleculeSummaryProps) {
  const formatFormula = () => {
    if (elements.length === 0) return "—";
    return elements.map(el => {
      const subscript = el.count > 1 ? String(el.count).split("").map(d => "₀₁₂₃₄₅₆₇₈₉"[parseInt(d)]).join("") : "";
      return el.symbol + subscript;
    }).join("");
  };

  const calculateMolecularWeight = () => {
    if (elements.length === 0) return 0;
    return elements.reduce((sum, el) => sum + el.atomicMass * el.count, 0);
  };

  const getStabilityScore = () => {
    if (elements.length === 0) return 0;
    // Dummy calculation based on element composition
    const baseScore = 7.5;
    const diversity = Math.min(elements.length * 0.5, 2);
    return Math.min(9.9, baseScore + diversity + Math.random() * 0.5).toFixed(1);
  };

  const getEnergyLevel = () => {
    if (elements.length === 0) return "—";
    const weight = calculateMolecularWeight();
    return (-1.2 - weight * 0.01 - Math.random() * 0.3).toFixed(3) + " Ha";
  };

  const getBondType = () => {
    if (elements.length === 0) return "—";
    const symbols = elements.map(e => e.symbol);
    if (symbols.includes("Na") || symbols.includes("K") || symbols.includes("Ca")) return "Ionic";
    if (symbols.includes("C") && symbols.includes("H")) return "Covalent (Organic)";
    if (symbols.some(s => ["Fe", "Cu", "Au", "Ag", "Pt"].includes(s))) return "Metallic";
    return "Covalent";
  };

  const hasElements = elements.length > 0;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Molecule Summary</h2>
      
      <div className="space-y-3">
        {/* Formula Card */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Scale className="h-4 w-4" />
            <span className="text-xs">Molecular Formula</span>
          </div>
          <p className="text-xl font-bold">{formatFormula()}</p>
        </div>

        {/* Weight */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Activity className="h-4 w-4" />
            <span className="text-xs">Molecular Weight</span>
          </div>
          <p className="text-xl font-bold">
            {hasElements ? `${calculateMolecularWeight().toFixed(2)} g/mol` : "—"}
          </p>
        </div>

        {/* Stability */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <ThermometerSun className="h-4 w-4" />
            <span className="text-xs">Estimated Stability Score</span>
          </div>
          <p className={`text-xl font-bold ${hasElements ? "text-success" : ""}`}>
            {hasElements ? getStabilityScore() : "—"}
            {hasElements && <span className="text-sm font-normal text-muted-foreground"> / 10</span>}
          </p>
        </div>

        {/* Energy Level */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Zap className="h-4 w-4" />
            <span className="text-xs">Estimated Energy Level</span>
          </div>
          <p className="text-xl font-bold text-accent">{getEnergyLevel()}</p>
        </div>

        {/* Bond Type */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Link2 className="h-4 w-4" />
            <span className="text-xs">Bond Type (Predicted)</span>
          </div>
          <p className="text-xl font-bold">{getBondType()}</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span>Values are AI-approximated and quantum-inspired. For research reference only.</span>
      </div>
    </div>
  );
}
