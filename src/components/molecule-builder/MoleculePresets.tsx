import { Button } from "@/components/ui/button";
import { Beaker, Atom, Zap } from "lucide-react";
import { MoleculeElement } from "./MoleculeConstructionZone";

interface MoleculePresetsProps {
  onLoadPreset: (elements: MoleculeElement[]) => void;
}

export const PRESETS: {
  id: string;
  name: string;
  formula: string;
  category: "oxide" | "perovskite" | "semiconductor" | "organic";
  elements: MoleculeElement[];
}[] = [
  // Quantum/Advanced Materials
  {
    id: "tio2",
    name: "Titania",
    formula: "TiO₂",
    category: "oxide",
    elements: [
      { symbol: "Ti", name: "Titanium", atomicMass: 47.867, count: 1 },
      { symbol: "O", name: "Oxygen", atomicMass: 15.999, count: 2 },
    ],
  },
  {
    id: "srcro4",
    name: "SrCrO₄",
    formula: "SrCrO₄",
    category: "perovskite",
    elements: [
      { symbol: "Sr", name: "Strontium", atomicMass: 87.62, count: 1 },
      { symbol: "Cr", name: "Chromium", atomicMass: 51.996, count: 1 },
      { symbol: "O", name: "Oxygen", atomicMass: 15.999, count: 4 },
    ],
  },
  {
    id: "licoo2",
    name: "LiCoO₂",
    formula: "LiCoO₂",
    category: "oxide",
    elements: [
      { symbol: "Li", name: "Lithium", atomicMass: 6.941, count: 1 },
      { symbol: "Co", name: "Cobalt", atomicMass: 58.933, count: 1 },
      { symbol: "O", name: "Oxygen", atomicMass: 15.999, count: 2 },
    ],
  },
  {
    id: "fe2o3",
    name: "Hematite",
    formula: "Fe₂O₃",
    category: "oxide",
    elements: [
      { symbol: "Fe", name: "Iron", atomicMass: 55.845, count: 2 },
      { symbol: "O", name: "Oxygen", atomicMass: 15.999, count: 3 },
    ],
  },
  {
    id: "mno2",
    name: "Pyrolusite",
    formula: "MnO₂",
    category: "oxide",
    elements: [
      { symbol: "Mn", name: "Manganese", atomicMass: 54.938, count: 1 },
      { symbol: "O", name: "Oxygen", atomicMass: 15.999, count: 2 },
    ],
  },
  {
    id: "gaas",
    name: "Gallium Arsenide",
    formula: "GaAs",
    category: "semiconductor",
    elements: [
      { symbol: "Ga", name: "Gallium", atomicMass: 69.723, count: 1 },
      { symbol: "As", name: "Arsenic", atomicMass: 74.922, count: 1 },
    ],
  },
  {
    id: "nacl",
    name: "NaCl (Rock Salt)",
    formula: "NaCl",
    category: "oxide",
    elements: [
      { symbol: "Na", name: "Sodium", atomicMass: 22.990, count: 1 },
      { symbol: "Cl", name: "Chlorine", atomicMass: 35.453, count: 1 },
    ],
  },
  {
    id: "batio3",
    name: "BaTiO₃",
    formula: "BaTiO₃",
    category: "perovskite",
    elements: [
      { symbol: "Ba", name: "Barium", atomicMass: 137.327, count: 1 },
      { symbol: "Ti", name: "Titanium", atomicMass: 47.867, count: 1 },
      { symbol: "O", name: "Oxygen", atomicMass: 15.999, count: 3 },
    ],
  },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  oxide:        <Atom className="h-3 w-3" />,
  perovskite:   <Zap className="h-3 w-3 text-purple-400" />,
  semiconductor: <Zap className="h-3 w-3 text-yellow-400" />,
  organic:      <Beaker className="h-3 w-3 text-emerald-400" />,
};

export function MoleculePresets({ onLoadPreset }: MoleculePresetsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Beaker className="h-4 w-4 text-accent" />
        <span>Research Presets</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Curated quantum materials — oxides, perovskites & semiconductors.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.id}
            variant="outline"
            size="sm"
            className="flex flex-col items-center gap-0.5 h-auto py-2.5 hover:bg-accent/10 hover:border-accent/50 transition-all duration-200 group"
            onClick={() => onLoadPreset(preset.elements)}
          >
            <div className="flex items-center gap-1 text-muted-foreground group-hover:text-accent transition-colors">
              {CATEGORY_ICONS[preset.category]}
              <span className="text-[10px] uppercase tracking-wider">{preset.category}</span>
            </div>
            <span className="text-sm font-bold">{preset.formula}</span>
            <span className="text-xs text-muted-foreground">{preset.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
