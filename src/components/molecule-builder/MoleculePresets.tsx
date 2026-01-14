import { Button } from "@/components/ui/button";
import { Beaker } from "lucide-react";
import { MoleculeElement } from "./MoleculeConstructionZone";

interface MoleculePresetsProps {
  onLoadPreset: (elements: MoleculeElement[]) => void;
}

export const PRESETS: {
  id: string;
  name: string;
  formula: string;
  elements: MoleculeElement[];
}[] = [
  {
    id: "water",
    name: "Water",
    formula: "H₂O",
    elements: [
      { symbol: "H", name: "Hydrogen", atomicMass: 1.008, count: 2 },
      { symbol: "O", name: "Oxygen", atomicMass: 15.999, count: 1 },
    ],
  },
  {
    id: "co2",
    name: "Carbon Dioxide",
    formula: "CO₂",
    elements: [
      { symbol: "C", name: "Carbon", atomicMass: 12.011, count: 1 },
      { symbol: "O", name: "Oxygen", atomicMass: 15.999, count: 2 },
    ],
  },
  {
    id: "methane",
    name: "Methane",
    formula: "CH₄",
    elements: [
      { symbol: "C", name: "Carbon", atomicMass: 12.011, count: 1 },
      { symbol: "H", name: "Hydrogen", atomicMass: 1.008, count: 4 },
    ],
  },
  {
    id: "benzene",
    name: "Benzene",
    formula: "C₆H₆",
    elements: [
      { symbol: "C", name: "Carbon", atomicMass: 12.011, count: 6 },
      { symbol: "H", name: "Hydrogen", atomicMass: 1.008, count: 6 },
    ],
  },
  {
    id: "ammonia",
    name: "Ammonia",
    formula: "NH₃",
    elements: [
      { symbol: "N", name: "Nitrogen", atomicMass: 14.007, count: 1 },
      { symbol: "H", name: "Hydrogen", atomicMass: 1.008, count: 3 },
    ],
  },
  {
    id: "ethanol",
    name: "Ethanol",
    formula: "C₂H₆O",
    elements: [
      { symbol: "C", name: "Carbon", atomicMass: 12.011, count: 2 },
      { symbol: "H", name: "Hydrogen", atomicMass: 1.008, count: 6 },
      { symbol: "O", name: "Oxygen", atomicMass: 15.999, count: 1 },
    ],
  },
];

export function MoleculePresets({ onLoadPreset }: MoleculePresetsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Beaker className="h-4 w-4" />
        <span>Quick Templates</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.name}
            variant="outline"
            size="sm"
            className="flex flex-col items-center gap-0.5 h-auto py-2 hover:bg-accent/10 hover:border-accent/50 transition-colors"
            onClick={() => onLoadPreset(preset.elements)}
          >
            <span className="text-base font-bold">{preset.formula}</span>
            <span className="text-xs text-muted-foreground">{preset.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
