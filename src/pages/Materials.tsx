import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Eye, Atom, Zap, ThermometerSun, Activity, Cpu } from "lucide-react";
import { useState } from "react";

const materialsData = [
  { id: 1, name: "Graphene Oxide", composition: "C₂O", category: "Energy", stability: 9.2, conductivity: 8.9, efficiency: 94, bandGap: 0.5 },
  { id: 2, name: "LiCoO₂ Cathode", composition: "LiCoO₂", category: "Battery", stability: 8.8, conductivity: 7.5, efficiency: 92, bandGap: 1.2 },
  { id: 3, name: "GaN Semiconductor", composition: "GaN", category: "Electronics", stability: 9.0, conductivity: 6.8, efficiency: 89, bandGap: 3.4 },
  { id: 4, name: "MoS₂ Monolayer", composition: "MoS₂", category: "Defense", stability: 8.5, conductivity: 7.2, efficiency: 87, bandGap: 1.8 },
  { id: 5, name: "Perovskite CaTiO₃", composition: "CaTiO₃", category: "Energy", stability: 7.9, conductivity: 8.1, efficiency: 85, bandGap: 2.1 },
  { id: 6, name: "Silicon Carbide", composition: "SiC", category: "Semiconductor", stability: 9.4, conductivity: 5.9, efficiency: 91, bandGap: 3.0 },
  { id: 7, name: "Titanium Nitride", composition: "TiN", category: "Defense", stability: 8.7, conductivity: 9.1, efficiency: 88, bandGap: 0.0 },
  { id: 8, name: "Zinc Oxide", composition: "ZnO", category: "Electronics", stability: 8.3, conductivity: 6.5, efficiency: 82, bandGap: 3.3 },
];

interface Material {
  id: number;
  name: string;
  composition: string;
  category: string;
  stability: number;
  conductivity: number;
  efficiency: number;
  bandGap: number;
}

const Materials = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredMaterials = materialsData.filter(mat => {
    const matchesSearch = mat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          mat.composition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || mat.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Materials Explorer</h1>
            <p className="text-muted-foreground">Browse and analyze advanced materials in our database</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search materials (Graphene, Li-Ion, Alloy...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Energy">Energy</SelectItem>
                <SelectItem value="Battery">Battery</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Defense">Defense</SelectItem>
                <SelectItem value="Semiconductor">Semiconductor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Materials Table */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Material</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Composition</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-muted-foreground">Stability</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-muted-foreground">Conductivity</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-muted-foreground">Efficiency</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaterials.map((material) => (
                    <tr 
                      key={material.id} 
                      className={`border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer ${selectedMaterial?.id === material.id ? 'bg-accent/5' : ''}`}
                      onClick={() => setSelectedMaterial(material)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/20 to-quantum/20 flex items-center justify-center">
                            <Atom className="w-4 h-4 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{material.name}</p>
                            <p className="text-xs text-muted-foreground">{material.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{material.composition}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-sm font-semibold ${material.stability >= 9 ? 'text-success' : material.stability >= 8 ? 'text-accent' : 'text-warning'}`}>
                          {material.stability}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold text-foreground">{material.conductivity}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold text-accent">{material.efficiency}%</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedMaterial(material); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Material Detail Panel */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            {selectedMaterial ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-quantum flex items-center justify-center">
                    <Atom className="w-7 h-7 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedMaterial.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedMaterial.composition} • {selectedMaterial.category}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50 space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ThermometerSun className="h-4 w-4" />
                      <span className="text-xs">Stability</span>
                    </div>
                    <p className="text-2xl font-bold text-success">{selectedMaterial.stability}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Zap className="h-4 w-4" />
                      <span className="text-xs">Conductivity</span>
                    </div>
                    <p className="text-2xl font-bold text-accent">{selectedMaterial.conductivity}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Activity className="h-4 w-4" />
                      <span className="text-xs">Efficiency</span>
                    </div>
                    <p className="text-2xl font-bold text-quantum">{selectedMaterial.efficiency}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Atom className="h-4 w-4" />
                      <span className="text-xs">Band Gap</span>
                    </div>
                    <p className="text-2xl font-bold">{selectedMaterial.bandGap} eV</p>
                  </div>
                </div>

                {/* AI Prediction Chart Placeholder */}
                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                  <h4 className="text-sm font-semibold">AI-Predicted Performance</h4>
                  <div className="h-32 flex items-end justify-around gap-2">
                    {[65, 82, 94, 78, 88].map((height, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-accent to-quantum rounded-t-md transition-all hover:opacity-80" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                  <div className="flex justify-around text-xs text-muted-foreground">
                    <span>Str</span>
                    <span>Cond</span>
                    <span>Stab</span>
                    <span>Flex</span>
                    <span>Dur</span>
                  </div>
                </div>

                <Button variant="quantum" className="w-full">
                  <Cpu className="h-4 w-4" />
                  Run Quantum Simulation
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                <Atom className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm">Select a material to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Materials;
