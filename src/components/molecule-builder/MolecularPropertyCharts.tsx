import { useMemo } from "react";
import { MoleculeElement } from "./MoleculeConstructionZone";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Zap, Atom, TrendingUp, Activity } from "lucide-react";

interface MolecularPropertyChartsProps {
  elements: MoleculeElement[];
}

export function MolecularPropertyCharts({ elements }: MolecularPropertyChartsProps) {
  const hasElements = elements.length > 0;

  // Generate energy distribution data based on elements
  const energyDistributionData = useMemo(() => {
    if (!hasElements) return [];
    
    const totalAtoms = elements.reduce((sum, el) => sum + el.count, 0);
    const baseEnergy = -1.2;
    
    return [
      { orbital: "1s", energy: baseEnergy - 0.5 - Math.random() * 0.2, electrons: Math.min(2, totalAtoms) },
      { orbital: "2s", energy: baseEnergy - 0.35 - Math.random() * 0.15, electrons: Math.min(2, Math.max(0, totalAtoms - 2)) },
      { orbital: "2p", energy: baseEnergy - 0.25 - Math.random() * 0.1, electrons: Math.min(6, Math.max(0, totalAtoms - 4)) },
      { orbital: "3s", energy: baseEnergy - 0.15 - Math.random() * 0.08, electrons: Math.min(2, Math.max(0, totalAtoms - 10)) },
      { orbital: "3p", energy: baseEnergy - 0.08 - Math.random() * 0.05, electrons: Math.min(6, Math.max(0, totalAtoms - 12)) },
      { orbital: "3d", energy: baseEnergy - 0.02 - Math.random() * 0.03, electrons: Math.min(10, Math.max(0, totalAtoms - 18)) },
    ].filter(d => d.electrons > 0);
  }, [elements, hasElements]);

  // Generate electron density data (radial distribution)
  const electronDensityData = useMemo(() => {
    if (!hasElements) return [];
    
    const totalMass = elements.reduce((sum, el) => sum + el.atomicMass * el.count, 0);
    const scaleFactor = Math.log(totalMass + 1) / 3;
    
    return Array.from({ length: 20 }, (_, i) => {
      const r = (i + 1) * 0.25;
      const density = scaleFactor * Math.exp(-r / 2) * Math.pow(r, 2) * (1 + 0.3 * Math.sin(r * 2));
      return {
        radius: r.toFixed(2) + " Å",
        density: Math.max(0, density * 100).toFixed(2),
        densityNum: Math.max(0, density * 100),
      };
    });
  }, [elements, hasElements]);

  // Generate stability trend data
  const stabilityTrendData = useMemo(() => {
    if (!hasElements) return [];
    
    const baseStability = 7.5 + Math.min(elements.length * 0.3, 1.5);
    
    return [
      { temp: "0K", stability: (baseStability + 1.2 + Math.random() * 0.3).toFixed(1) },
      { temp: "100K", stability: (baseStability + 1.0 + Math.random() * 0.3).toFixed(1) },
      { temp: "200K", stability: (baseStability + 0.7 + Math.random() * 0.3).toFixed(1) },
      { temp: "298K", stability: (baseStability + 0.5 + Math.random() * 0.3).toFixed(1) },
      { temp: "400K", stability: (baseStability + 0.2 + Math.random() * 0.3).toFixed(1) },
      { temp: "500K", stability: (baseStability - 0.2 + Math.random() * 0.3).toFixed(1) },
      { temp: "600K", stability: (baseStability - 0.6 + Math.random() * 0.3).toFixed(1) },
      { temp: "800K", stability: (baseStability - 1.2 + Math.random() * 0.3).toFixed(1) },
    ];
  }, [elements, hasElements]);

  // Generate property radar data
  const propertyRadarData = useMemo(() => {
    if (!hasElements) return [];
    
    const totalMass = elements.reduce((sum, el) => sum + el.atomicMass * el.count, 0);
    const atomCount = elements.reduce((sum, el) => sum + el.count, 0);
    
    return [
      { property: "Reactivity", value: Math.min(100, 30 + atomCount * 8 + Math.random() * 20), fullMark: 100 },
      { property: "Polarity", value: Math.min(100, 40 + elements.length * 12 + Math.random() * 15), fullMark: 100 },
      { property: "Stability", value: Math.min(100, 75 + Math.random() * 20), fullMark: 100 },
      { property: "Conductivity", value: Math.min(100, 20 + totalMass * 0.5 + Math.random() * 25), fullMark: 100 },
      { property: "Density", value: Math.min(100, 35 + totalMass * 0.8 + Math.random() * 15), fullMark: 100 },
      { property: "Entropy", value: Math.min(100, 25 + atomCount * 10 + Math.random() * 20), fullMark: 100 },
    ];
  }, [elements, hasElements]);

  const chartColors = {
    primary: "hsl(192, 91%, 36%)",
    secondary: "hsl(186, 100%, 42%)",
    success: "hsl(142, 71%, 45%)",
    warning: "hsl(38, 92%, 50%)",
    accent: "hsl(262, 83%, 58%)",
  };

  const orbitalColors: Record<string, string> = {
    "1s": chartColors.primary,
    "2s": chartColors.secondary,
    "2p": chartColors.success,
    "3s": chartColors.warning,
    "3p": chartColors.accent,
    "3d": chartColors.primary,
  };

  if (!hasElements) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-quantum" />
          Molecular Property Charts
        </h2>
        <div className="p-8 rounded-xl bg-muted/30 border border-dashed border-border text-center">
          <p className="text-muted-foreground">Add elements to view property charts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Activity className="h-5 w-5 text-quantum" />
        Molecular Property Charts
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Energy Distribution Chart */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium">Energy Level Distribution</span>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={energyDistributionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis dataKey="orbital" type="category" width={35} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number, name: string) => [
                    name === "energy" ? `${value.toFixed(3)} Ha` : `${value} e⁻`,
                    name === "energy" ? "Energy" : "Electrons"
                  ]}
                />
                <Bar dataKey="electrons" name="electrons" radius={[0, 4, 4, 0]}>
                  {energyDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={orbitalColors[entry.orbital] || chartColors.primary} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Electron distribution across orbitals
          </p>
        </div>

        {/* Electron Density Visualization */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Atom className="h-4 w-4 text-quantum" />
            <span className="text-sm font-medium">Radial Electron Density</span>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={electronDensityData}>
                <defs>
                  <linearGradient id="densityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.secondary} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={chartColors.secondary} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="radius"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                  interval={3}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={(v) => v.toFixed(0)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: string) => [`${parseFloat(value).toFixed(2)}%`, "Density"]}
                />
                <Area
                  type="monotone"
                  dataKey="densityNum"
                  stroke={chartColors.secondary}
                  strokeWidth={2}
                  fill="url(#densityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Probability density vs. distance from nucleus
          </p>
        </div>

        {/* Stability Trend Chart */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-sm font-medium">Thermal Stability Trend</span>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stabilityTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="temp"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                />
                <YAxis
                  domain={[5, 10]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: string) => [`${value} / 10`, "Stability"]}
                />
                <Line
                  type="monotone"
                  dataKey="stability"
                  stroke={chartColors.success}
                  strokeWidth={2}
                  dot={{ fill: chartColors.success, strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, fill: chartColors.success }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Stability score vs. temperature
          </p>
        </div>

        {/* Property Radar Chart */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Property Profile</span>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={propertyRadarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="property"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8 }}
                />
                <Radar
                  name="Properties"
                  dataKey="value"
                  stroke={chartColors.primary}
                  fill={chartColors.primary}
                  fillOpacity={0.4}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Value"]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Multi-dimensional property analysis
          </p>
        </div>
      </div>
    </div>
  );
}
