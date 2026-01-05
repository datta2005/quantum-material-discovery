import { Button } from "@/components/ui/button";
import { Plus, Minus, X, Atom } from "lucide-react";

export interface MoleculeElement {
  symbol: string;
  name: string;
  atomicMass: number;
  count: number;
}

interface MoleculeConstructionZoneProps {
  elements: MoleculeElement[];
  onAddElement: (element: { symbol: string; name: string; atomicMass: number }) => void;
  onUpdateCount: (symbol: string, delta: number) => void;
  onRemoveElement: (symbol: string) => void;
  onClear: () => void;
}

export function MoleculeConstructionZone({
  elements,
  onAddElement,
  onUpdateCount,
  onRemoveElement,
  onClear,
}: MoleculeConstructionZoneProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-accent", "bg-accent/5");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("border-accent", "bg-accent/5");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-accent", "bg-accent/5");
    
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      onAddElement(data);
    } catch (error) {
      console.error("Failed to parse dropped element");
    }
  };

  const formatFormula = () => {
    if (elements.length === 0) return "";
    return elements.map(el => {
      const subscript = el.count > 1 ? String(el.count).split("").map(d => "₀₁₂₃₄₅₆₇₈₉"[parseInt(d)]).join("") : "";
      return el.symbol + subscript;
    }).join("");
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Molecule Construction</h2>
        {elements.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
            Clear All
          </Button>
        )}
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex-1 min-h-[200px] rounded-xl border-2 border-dashed border-border transition-all p-4"
      >
        {elements.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <Atom className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">Drag elements here to build a molecule</p>
            <p className="text-xs mt-1">Or click on elements in the periodic table</p>
          </div>
        ) : (
          <div className="space-y-3">
            {elements.map((el) => (
              <div
                key={el.symbol}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-quantum/20 flex items-center justify-center font-bold text-accent">
                    {el.symbol}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{el.name}</p>
                    <p className="text-xs text-muted-foreground">{el.atomicMass.toFixed(2)} u</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateCount(el.symbol, -1)}
                    disabled={el.count <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-bold">{el.count}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateCount(el.symbol, 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onRemoveElement(el.symbol)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formula Display */}
      {elements.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-accent/10 to-quantum/10 border border-accent/20">
          <p className="text-xs text-muted-foreground mb-1">Molecular Formula</p>
          <p className="text-2xl font-bold tracking-wide">{formatFormula()}</p>
        </div>
      )}
    </div>
  );
}
