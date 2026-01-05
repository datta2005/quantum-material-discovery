import { Navbar } from "@/components/layout/Navbar";
import { PeriodicTable } from "@/components/molecule-builder/PeriodicTable";
import { MoleculeConstructionZone, MoleculeElement } from "@/components/molecule-builder/MoleculeConstructionZone";
import { MoleculeSummary } from "@/components/molecule-builder/MoleculeSummary";
import { SimulationPanel } from "@/components/molecule-builder/SimulationPanel";
import { useState } from "react";

const MoleculeBuilder = () => {
  const [elements, setElements] = useState<MoleculeElement[]>([]);

  const handleAddElement = (element: { symbol: string; name: string; atomicMass: number }) => {
    setElements(prev => {
      const existing = prev.find(e => e.symbol === element.symbol);
      if (existing) {
        return prev.map(e => 
          e.symbol === element.symbol 
            ? { ...e, count: e.count + 1 }
            : e
        );
      }
      return [...prev, { ...element, count: 1 }];
    });
  };

  const handleUpdateCount = (symbol: string, delta: number) => {
    setElements(prev => 
      prev.map(e => 
        e.symbol === symbol 
          ? { ...e, count: Math.max(1, e.count + delta) }
          : e
      )
    );
  };

  const handleRemoveElement = (symbol: string) => {
    setElements(prev => prev.filter(e => e.symbol !== symbol));
  };

  const handleClear = () => {
    setElements([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Molecule Builder</h1>
          <p className="text-muted-foreground">
            Construct molecules visually and run quantum-inspired simulations
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Periodic Table */}
          <div className="lg:col-span-3 bg-card rounded-xl border border-border p-4">
            <PeriodicTable onElementSelect={handleAddElement} />
          </div>

          {/* Center Panel - Construction Zone */}
          <div className="lg:col-span-5 bg-card rounded-xl border border-border p-6">
            <MoleculeConstructionZone
              elements={elements}
              onAddElement={handleAddElement}
              onUpdateCount={handleUpdateCount}
              onRemoveElement={handleRemoveElement}
              onClear={handleClear}
            />
          </div>

          {/* Right Panel - Summary & Simulation */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <MoleculeSummary elements={elements} />
            </div>
            <SimulationPanel elements={elements} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MoleculeBuilder;
