import { cn } from "@/lib/utils";

interface Element {
  symbol: string;
  name: string;
  atomicNumber: number;
  atomicMass: number;
  category: string;
  row: number;
  col: number;
}

const elements: Element[] = [
  { symbol: "H", name: "Hydrogen", atomicNumber: 1, atomicMass: 1.008, category: "nonmetal", row: 1, col: 1 },
  { symbol: "He", name: "Helium", atomicNumber: 2, atomicMass: 4.003, category: "noble-gas", row: 1, col: 18 },
  { symbol: "Li", name: "Lithium", atomicNumber: 3, atomicMass: 6.941, category: "alkali", row: 2, col: 1 },
  { symbol: "Be", name: "Beryllium", atomicNumber: 4, atomicMass: 9.012, category: "alkaline", row: 2, col: 2 },
  { symbol: "B", name: "Boron", atomicNumber: 5, atomicMass: 10.81, category: "metalloid", row: 2, col: 13 },
  { symbol: "C", name: "Carbon", atomicNumber: 6, atomicMass: 12.01, category: "nonmetal", row: 2, col: 14 },
  { symbol: "N", name: "Nitrogen", atomicNumber: 7, atomicMass: 14.01, category: "nonmetal", row: 2, col: 15 },
  { symbol: "O", name: "Oxygen", atomicNumber: 8, atomicMass: 16.00, category: "nonmetal", row: 2, col: 16 },
  { symbol: "F", name: "Fluorine", atomicNumber: 9, atomicMass: 19.00, category: "halogen", row: 2, col: 17 },
  { symbol: "Ne", name: "Neon", atomicNumber: 10, atomicMass: 20.18, category: "noble-gas", row: 2, col: 18 },
  { symbol: "Na", name: "Sodium", atomicNumber: 11, atomicMass: 22.99, category: "alkali", row: 3, col: 1 },
  { symbol: "Mg", name: "Magnesium", atomicNumber: 12, atomicMass: 24.31, category: "alkaline", row: 3, col: 2 },
  { symbol: "Al", name: "Aluminum", atomicNumber: 13, atomicMass: 26.98, category: "metal", row: 3, col: 13 },
  { symbol: "Si", name: "Silicon", atomicNumber: 14, atomicMass: 28.09, category: "metalloid", row: 3, col: 14 },
  { symbol: "P", name: "Phosphorus", atomicNumber: 15, atomicMass: 30.97, category: "nonmetal", row: 3, col: 15 },
  { symbol: "S", name: "Sulfur", atomicNumber: 16, atomicMass: 32.07, category: "nonmetal", row: 3, col: 16 },
  { symbol: "Cl", name: "Chlorine", atomicNumber: 17, atomicMass: 35.45, category: "halogen", row: 3, col: 17 },
  { symbol: "Ar", name: "Argon", atomicNumber: 18, atomicMass: 39.95, category: "noble-gas", row: 3, col: 18 },
  { symbol: "K", name: "Potassium", atomicNumber: 19, atomicMass: 39.10, category: "alkali", row: 4, col: 1 },
  { symbol: "Ca", name: "Calcium", atomicNumber: 20, atomicMass: 40.08, category: "alkaline", row: 4, col: 2 },
  { symbol: "Ti", name: "Titanium", atomicNumber: 22, atomicMass: 47.87, category: "transition", row: 4, col: 4 },
  { symbol: "Fe", name: "Iron", atomicNumber: 26, atomicMass: 55.85, category: "transition", row: 4, col: 8 },
  { symbol: "Co", name: "Cobalt", atomicNumber: 27, atomicMass: 58.93, category: "transition", row: 4, col: 9 },
  { symbol: "Ni", name: "Nickel", atomicNumber: 28, atomicMass: 58.69, category: "transition", row: 4, col: 10 },
  { symbol: "Cu", name: "Copper", atomicNumber: 29, atomicMass: 63.55, category: "transition", row: 4, col: 11 },
  { symbol: "Zn", name: "Zinc", atomicNumber: 30, atomicMass: 65.38, category: "transition", row: 4, col: 12 },
  { symbol: "Ga", name: "Gallium", atomicNumber: 31, atomicMass: 69.72, category: "metal", row: 4, col: 13 },
  { symbol: "Ge", name: "Germanium", atomicNumber: 32, atomicMass: 72.63, category: "metalloid", row: 4, col: 14 },
  { symbol: "As", name: "Arsenic", atomicNumber: 33, atomicMass: 74.92, category: "metalloid", row: 4, col: 15 },
  { symbol: "Se", name: "Selenium", atomicNumber: 34, atomicMass: 78.97, category: "nonmetal", row: 4, col: 16 },
  { symbol: "Br", name: "Bromine", atomicNumber: 35, atomicMass: 79.90, category: "halogen", row: 4, col: 17 },
  { symbol: "Kr", name: "Krypton", atomicNumber: 36, atomicMass: 83.80, category: "noble-gas", row: 4, col: 18 },
  { symbol: "Ag", name: "Silver", atomicNumber: 47, atomicMass: 107.87, category: "transition", row: 5, col: 11 },
  { symbol: "Sn", name: "Tin", atomicNumber: 50, atomicMass: 118.71, category: "metal", row: 5, col: 14 },
  { symbol: "I", name: "Iodine", atomicNumber: 53, atomicMass: 126.90, category: "halogen", row: 5, col: 17 },
  { symbol: "Au", name: "Gold", atomicNumber: 79, atomicMass: 196.97, category: "transition", row: 6, col: 11 },
  { symbol: "Pt", name: "Platinum", atomicNumber: 78, atomicMass: 195.08, category: "transition", row: 6, col: 10 },
  { symbol: "Pb", name: "Lead", atomicNumber: 82, atomicMass: 207.2, category: "metal", row: 6, col: 14 },
];

const categoryColors: Record<string, string> = {
  "nonmetal": "bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
  "noble-gas": "bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/40 text-purple-700 dark:text-purple-300",
  "alkali": "bg-red-500/20 hover:bg-red-500/30 border-red-500/40 text-red-700 dark:text-red-300",
  "alkaline": "bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/40 text-orange-700 dark:text-orange-300",
  "metalloid": "bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/40 text-cyan-700 dark:text-cyan-300",
  "halogen": "bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/40 text-yellow-700 dark:text-yellow-300",
  "metal": "bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/40 text-blue-700 dark:text-blue-300",
  "transition": "bg-pink-500/20 hover:bg-pink-500/30 border-pink-500/40 text-pink-700 dark:text-pink-300",
};

interface PeriodicTableProps {
  onElementSelect: (element: { symbol: string; name: string; atomicMass: number }) => void;
}

export function PeriodicTable({ onElementSelect }: PeriodicTableProps) {
  const handleDragStart = (e: React.DragEvent, element: Element) => {
    e.dataTransfer.setData("application/json", JSON.stringify({
      symbol: element.symbol,
      name: element.name,
      atomicMass: element.atomicMass,
    }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Periodic Table</h2>
      <p className="text-sm text-muted-foreground">Drag elements to build your molecule</p>
      
      <div className="grid grid-cols-9 gap-1">
        {elements.slice(0, 36).map((element) => (
          <div
            key={element.symbol}
            draggable
            onDragStart={(e) => handleDragStart(e, element)}
            onClick={() => onElementSelect({ symbol: element.symbol, name: element.name, atomicMass: element.atomicMass })}
            className={cn(
              "w-10 h-10 rounded-md border cursor-grab active:cursor-grabbing transition-all flex flex-col items-center justify-center",
              categoryColors[element.category] || "bg-muted"
            )}
            title={element.name}
          >
            <span className="text-[9px] opacity-60">{element.atomicNumber}</span>
            <span className="text-sm font-bold leading-none">{element.symbol}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
        <span className="text-xs text-muted-foreground">Legend:</span>
        {Object.entries(categoryColors).slice(0, 4).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1">
            <div className={cn("w-3 h-3 rounded", color.split(" ")[0])} />
            <span className="text-xs text-muted-foreground capitalize">{cat.replace("-", " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
