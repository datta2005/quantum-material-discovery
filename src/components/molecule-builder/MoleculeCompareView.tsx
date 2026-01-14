import { useState } from "react";
import { MoleculeElement } from "./MoleculeConstructionZone";
import { MoleculePresets, PRESETS } from "./MoleculePresets";
import { Molecule3DViewer } from "./Molecule3DViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, X, ChevronDown, Scale, Activity, ThermometerSun, Zap, Link2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MoleculeCompareViewProps {
  currentMolecule: MoleculeElement[];
  onClose: () => void;
}

function calculateProperties(elements: MoleculeElement[]) {
  const formatFormula = () => {
    if (elements.length === 0) return "—";
    return elements.map(el => {
      const subscript = el.count > 1 ? String(el.count).split("").map(d => "₀₁₂₃₄₅₆₇₈₉"[parseInt(d)]).join("") : "";
      return el.symbol + subscript;
    }).join("");
  };

  const molecularWeight = elements.reduce((sum, el) => sum + el.atomicMass * el.count, 0);
  
  const stabilityScore = elements.length === 0 ? 0 : 
    Math.min(9.9, 7.5 + Math.min(elements.length * 0.5, 2) + (elements.length * 0.1)).toFixed(1);
  
  const energyLevel = elements.length === 0 ? "—" : 
    (-1.2 - molecularWeight * 0.01 - elements.length * 0.1).toFixed(3) + " Ha";

  const getBondType = () => {
    if (elements.length === 0) return "—";
    const symbols = elements.map(e => e.symbol);
    if (symbols.includes("Na") || symbols.includes("K") || symbols.includes("Ca")) return "Ionic";
    if (symbols.includes("C") && symbols.includes("H")) return "Covalent (Organic)";
    if (symbols.some(s => ["Fe", "Cu", "Au", "Ag", "Pt"].includes(s))) return "Metallic";
    return "Covalent";
  };

  return {
    formula: formatFormula(),
    molecularWeight: elements.length === 0 ? 0 : molecularWeight,
    stabilityScore,
    energyLevel,
    bondType: getBondType(),
    atomCount: elements.reduce((sum, el) => sum + el.count, 0),
    elementCount: elements.length,
  };
}

export function MoleculeCompareView({ currentMolecule, onClose }: MoleculeCompareViewProps) {
  const [compareMolecule, setCompareMolecule] = useState<MoleculeElement[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
      setCompareMolecule(preset.elements);
    }
  };

  const currentProps = calculateProperties(currentMolecule);
  const compareProps = calculateProperties(compareMolecule);

  const renderComparisonRow = (
    label: string, 
    icon: React.ReactNode, 
    currentValue: string | number, 
    compareValue: string | number,
    unit?: string,
    higherIsBetter?: boolean
  ) => {
    const current = typeof currentValue === "number" ? currentValue : parseFloat(String(currentValue));
    const compare = typeof compareValue === "number" ? compareValue : parseFloat(String(compareValue));
    
    let currentClass = "";
    let compareClass = "";
    
    if (!isNaN(current) && !isNaN(compare) && current !== compare) {
      if (higherIsBetter) {
        currentClass = current > compare ? "text-success" : "text-destructive";
        compareClass = compare > current ? "text-success" : "text-destructive";
      }
    }

    return (
      <div className="grid grid-cols-3 gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-sm">{label}</span>
        </div>
        <div className={`text-center font-semibold ${currentClass}`}>
          {currentValue}{unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
        </div>
        <div className={`text-center font-semibold ${compareClass}`}>
          {compareValue}{unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold">Compare Molecules</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* Molecule Selection Headers */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Current Molecule */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Current Molecule</h3>
                <span className="px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                  {currentProps.formula}
                </span>
              </div>
              <div className="h-[200px] rounded-xl border border-border overflow-hidden">
                <Molecule3DViewer elements={currentMolecule} />
              </div>
            </div>

            {/* Compare Molecule */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Compare With</h3>
                <Select value={selectedPreset} onValueChange={handlePresetSelect}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select molecule" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESETS.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.name} ({preset.formula})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="h-[200px] rounded-xl border border-border overflow-hidden">
                {compareMolecule.length > 0 ? (
                  <Molecule3DViewer elements={compareMolecule} />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    Select a molecule to compare
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-muted/30 rounded-xl border border-border overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 border-b border-border">
              <div className="text-sm font-medium text-muted-foreground">Property</div>
              <div className="text-center text-sm font-medium">{currentProps.formula}</div>
              <div className="text-center text-sm font-medium">
                {compareMolecule.length > 0 ? compareProps.formula : "—"}
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-border/50">
              {renderComparisonRow(
                "Molecular Weight",
                <Scale className="h-4 w-4" />,
                currentProps.molecularWeight.toFixed(2),
                compareMolecule.length > 0 ? compareProps.molecularWeight.toFixed(2) : "—",
                "g/mol"
              )}
              {renderComparisonRow(
                "Stability Score",
                <ThermometerSun className="h-4 w-4" />,
                currentProps.stabilityScore,
                compareMolecule.length > 0 ? compareProps.stabilityScore : "—",
                "/10",
                true
              )}
              {renderComparisonRow(
                "Energy Level",
                <Zap className="h-4 w-4" />,
                currentProps.energyLevel,
                compareMolecule.length > 0 ? compareProps.energyLevel : "—"
              )}
              {renderComparisonRow(
                "Bond Type",
                <Link2 className="h-4 w-4" />,
                currentProps.bondType,
                compareMolecule.length > 0 ? compareProps.bondType : "—"
              )}
              {renderComparisonRow(
                "Total Atoms",
                <Activity className="h-4 w-4" />,
                currentProps.atomCount,
                compareMolecule.length > 0 ? compareProps.atomCount : "—"
              )}
              {renderComparisonRow(
                "Element Types",
                <ChevronDown className="h-4 w-4" />,
                currentProps.elementCount,
                compareMolecule.length > 0 ? compareProps.elementCount : "—"
              )}
            </div>
          </div>

          {/* Comparison Insight */}
          {compareMolecule.length > 0 && (
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-accent/10 to-quantum/10 border border-accent/20">
              <p className="text-sm font-medium mb-2">Comparison Insight</p>
              <p className="text-sm text-muted-foreground">
                {currentProps.formula} has a molecular weight of {currentProps.molecularWeight.toFixed(2)} g/mol 
                compared to {compareProps.formula}'s {compareProps.molecularWeight.toFixed(2)} g/mol. 
                {Number(currentProps.stabilityScore) > Number(compareProps.stabilityScore) 
                  ? ` ${currentProps.formula} shows higher predicted stability.`
                  : Number(compareProps.stabilityScore) > Number(currentProps.stabilityScore)
                  ? ` ${compareProps.formula} shows higher predicted stability.`
                  : " Both molecules show similar stability profiles."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}