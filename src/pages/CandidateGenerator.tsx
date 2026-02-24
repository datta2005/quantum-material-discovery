import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Atom,
  Search,
  Sparkles,
  Loader2,
  FlaskConical,
  ShieldCheck,
  Fingerprint,
  Zap,
  Box,
  ChevronDown,
  ChevronUp,
  BarChart3,
  ArrowRight,
  Shield,
  Flame,
  Beaker,
} from "lucide-react";
import { useState } from "react";
import CompoundViewer3D from "@/components/CompoundViewer3D";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

const ELEMENT_GROUP_OPTIONS = [
  { key: "transition_metals", label: "Transition Metals", icon: "⚙️" },
  { key: "nonmetals", label: "Non-Metals", icon: "🌀" },
  { key: "weak_metals", label: "Post-Transition", icon: "🔩" },
  { key: "semi_metals", label: "Semimetals", icon: "💠" },
  { key: "alkali_metals", label: "Alkali Metals", icon: "🔥" },
  { key: "alkaline_earth", label: "Alkaline Earth", icon: "🪨" },
  { key: "rare_earth", label: "Rare Earth", icon: "💎" },
];

interface NovelMaterial {
  compound: string;
  chemical_name?: string;
  formation_energy: number;
  band_gap_eV: number | null;
  quantum_score: number;
  stability_score: number;
  chemistry_stability?: number;
  novelty_score: number;
  is_novel: boolean;
  predicted_applications?: {
    material_class: string;
    primary_applications: string[];
    element_applications: string[];
  };
  structure: {
    atoms: {
      id: number;
      symbol: string;
      x: number;
      y: number;
      z: number;
      radius: number;
      color: string;
    }[];
    bonds: { from: number; to: number }[];
    total_atoms: number;
  };
}

interface SearchStats {
  explored: number;
  after_prediction: number;
  after_energy_filter: number;
  after_novelty: number;
  quantum_validated: number;
  returned: number;
  elapsed_seconds: number;
  stability_level?: string;
  chemistry_validated?: number;
  chemistry_rejected?: number;
}

interface DiscoverResponse {
  novel_materials: NovelMaterial[];
  alloy_candidates: { Alloy: string; UTS: number; MeltingPoint: number }[];
  search_stats: SearchStats;
  error?: string;
}

type StabilityLevel = "high" | "medium" | "low";

const STABILITY_LEVELS: {
  key: StabilityLevel;
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}[] = [
    {
      key: "high",
      label: "High Stability",
      desc: "Only thermodynamically stable compounds (~20-32 score)",
      icon: <Shield className="h-4 w-4" />,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/15",
      borderColor: "border-emerald-500/40",
    },
    {
      key: "medium",
      label: "Medium",
      desc: "Moderate stability — balanced exploration (~12-22 score)",
      icon: <Beaker className="h-4 w-4" />,
      color: "text-amber-400",
      bgColor: "bg-amber-500/15",
      borderColor: "border-amber-500/40",
    },
    {
      key: "low",
      label: "Low Stability",
      desc: "Exotic / metastable — for advanced applications",
      icon: <Flame className="h-4 w-4" />,
      color: "text-rose-400",
      bgColor: "bg-rose-500/15",
      borderColor: "border-rose-500/40",
    },
  ];

const CandidateGenerator = () => {
  const navigate = useNavigate();

  // Target property controls
  const [energyRange, setEnergyRange] = useState<[number, number]>([-4.0, -0.3]);
  const [maxAtoms, setMaxAtoms] = useState(8);
  const [minStability, setMinStability] = useState(15.0);
  const [numCandidates, setNumCandidates] = useState(5);
  const [stabilityLevel, setStabilityLevel] = useState<StabilityLevel>("high");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([
    "transition_metals",
    "nonmetals",
  ]);

  // Results
  const [results, setResults] = useState<DiscoverResponse | null>(() => {
    try {
      const saved = sessionStorage.getItem("candidateResults");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const toggleGroup = (key: string) => {
    setSelectedGroups((prev) =>
      prev.includes(key) ? prev.filter((g) => g !== key) : [...prev, key]
    );
  };

  const handleDiscover = async () => {
    if (selectedGroups.length === 0) {
      setError("Select at least one element group");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const resp = await fetch(`${API_BASE}/discover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_energy_min: energyRange[0],
          target_energy_max: energyRange[1],
          max_atoms: maxAtoms,
          min_stability: minStability,
          element_groups: selectedGroups,
          num_candidates: numCandidates,
          stability_level: stabilityLevel,
        }),
      });

      if (!resp.ok) {
        throw new Error(`Server error: ${resp.status}`);
      }

      const data: DiscoverResponse = await resp.json();
      if (data.error) throw new Error(data.error);

      setResults(data);
      try {
        sessionStorage.setItem("candidateResults", JSON.stringify(data));
      } catch {
        // Storage full or unavailable
      }
    } catch (err: unknown) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Cannot connect to backend. Start the Flask server first.");
      } else {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStabilityColor = (score: number) => {
    if (score >= 25) return "text-emerald-400";
    if (score >= 18) return "text-cyan-400";
    if (score >= 12) return "text-amber-400";
    return "text-rose-400";
  };

  const getStabilityGrade = (score: number) => {
    if (score >= 28) return { grade: "A+", cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
    if (score >= 24) return { grade: "A", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
    if (score >= 20) return { grade: "B+", cls: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" };
    if (score >= 16) return { grade: "B", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
    if (score >= 12) return { grade: "C", cls: "bg-orange-500/15 text-orange-400 border-orange-500/30" };
    return { grade: "D", cls: "bg-rose-500/15 text-rose-400 border-rose-500/30" };
  };

  const getNoveltyBadge = (score: number) => {
    if (score > 0.9)
      return {
        label: "Completely Novel",
        cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      };
    if (score > 0.7)
      return {
        label: "Highly Novel",
        cls: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
      };
    if (score > 0.5)
      return {
        label: "Moderately Novel",
        cls: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      };
    return {
      label: "Low Novelty",
      cls: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-accent" />
            Novel Material Discovery
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Inverse-design pipeline: define your target properties → the AI
            explores thousands of element combinations → filters out known
            compounds → returns only{" "}
            <span className="text-accent font-semibold">
              genuinely novel materials
            </span>{" "}
            with 3D structures and IUPAC names.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left — Controls */}
          <div className="lg:col-span-4 space-y-5">
            {/* Stability Level Selector */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                Stability Level
              </h2>
              <p className="text-xs text-muted-foreground">
                Choose material stability target
              </p>
              <div className="grid grid-cols-1 gap-2">
                {STABILITY_LEVELS.map((level) => {
                  const active = stabilityLevel === level.key;
                  return (
                    <button
                      key={level.key}
                      onClick={() => setStabilityLevel(level.key)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium transition-all border ${active
                          ? `${level.bgColor} ${level.borderColor} ${level.color}`
                          : "bg-muted/20 border-border/50 text-muted-foreground hover:bg-muted/40"
                        }`}
                    >
                      <div className={active ? level.color : ""}>
                        {level.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">{level.label}</div>
                        <div className="text-[10px] opacity-70 mt-0.5">{level.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Properties */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                Target Properties
              </h2>

              {/* Energy range */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Formation Energy (eV/atom)</span>
                  <span className="font-mono font-semibold text-accent">
                    {energyRange[0].toFixed(1)} to {energyRange[1].toFixed(1)}
                  </span>
                </div>
                <Slider
                  value={[energyRange[0] * 10, energyRange[1] * 10]}
                  onValueChange={(v) => setEnergyRange([v[0] / 10, v[1] / 10])}
                  min={-50}
                  max={10}
                  step={1}
                  className="py-1"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>-5.0</span>
                  <span>+1.0</span>
                </div>
              </div>

              {/* Max atoms */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Max Atoms</span>
                  <span className="font-mono font-semibold text-accent">
                    {maxAtoms}
                  </span>
                </div>
                <Slider
                  value={[maxAtoms]}
                  onValueChange={(v) => setMaxAtoms(v[0])}
                  min={2}
                  max={12}
                  step={1}
                  className="py-1"
                />
              </div>

              {/* Min stability */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Min Stability Score</span>
                  <span className="font-mono font-semibold text-accent">
                    {minStability.toFixed(0)}
                  </span>
                </div>
                <Slider
                  value={[minStability]}
                  onValueChange={(v) => setMinStability(v[0])}
                  min={0}
                  max={32}
                  step={1}
                  className="py-1"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 (any)</span>
                  <span>32 (max stable)</span>
                </div>
              </div>

              {/* Num candidates */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Results to Return</span>
                  <span className="font-mono font-semibold text-accent">
                    {numCandidates}
                  </span>
                </div>
                <Slider
                  value={[numCandidates]}
                  onValueChange={(v) => setNumCandidates(v[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="py-1"
                />
              </div>
            </div>

            {/* Element Groups */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Atom className="h-4 w-4 text-accent" />
                Element Groups
              </h2>
              <p className="text-xs text-muted-foreground">
                Select which element families to explore
              </p>
              <div className="grid grid-cols-1 gap-2">
                {ELEMENT_GROUP_OPTIONS.map((g) => {
                  const active = selectedGroups.includes(g.key);
                  return (
                    <button
                      key={g.key}
                      onClick={() => toggleGroup(g.key)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${active
                        ? "bg-accent/15 border-accent/40 text-accent"
                        : "bg-muted/20 border-border/50 text-muted-foreground hover:bg-muted/40"
                        }`}
                    >
                      <span>{g.icon}</span>
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Discover Button */}
            <Button
              variant="quantum"
              className="w-full py-6 text-base font-semibold"
              onClick={handleDiscover}
              disabled={loading || selectedGroups.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Discovering Novel Materials...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Discover Novel Materials
                </>
              )}
            </Button>

            {/* Search Stats */}
            {results?.search_stats && (
              <div className="bg-card/50 rounded-xl border border-border/50 p-4 space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  Search Statistics
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Explored</span>
                    <span className="font-mono font-semibold">
                      {results.search_stats.explored}
                    </span>
                  </div>
                  {results.search_stats.chemistry_validated !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chem Valid</span>
                      <span className="font-mono font-semibold text-emerald-400">
                        {results.search_stats.chemistry_validated}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Predicted</span>
                    <span className="font-mono font-semibold">
                      {results.search_stats.after_prediction}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Energy Match</span>
                    <span className="font-mono font-semibold">
                      {results.search_stats.after_energy_filter}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Novel Only</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      {results.search_stats.after_novelty}
                    </span>
                  </div>
                  {results.search_stats.stability_level && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Level</span>
                      <span className="font-mono font-semibold text-accent capitalize">
                        {results.search_stats.stability_level}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between col-span-2 pt-1 border-t border-border/30">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-mono font-semibold">
                      {results.search_stats.elapsed_seconds}s
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right — Results */}
          <div className="lg:col-span-8 space-y-5">
            {/* Error */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="bg-card rounded-xl border border-border p-12 flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                  <FlaskConical className="h-6 w-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-semibold">Discovering Novel Materials</p>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Exploring element combinations → Chemistry validation →
                    AI prediction → Novelty filtering → Quantum validation →
                    3D structure + naming
                  </p>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && !results && !error && (
              <div className="bg-card rounded-xl border border-border p-12 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    Discover New Materials
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    Choose your stability level, set target properties, and click
                    "Discover" to explore novel compounds with IUPAC names and
                    3D structures.
                  </p>
                </div>
              </div>
            )}

            {/* Results */}
            {results && results.novel_materials.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                    Discovered Novel Materials
                  </h2>
                  <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">
                    {results.novel_materials.length} novel compound
                    {results.novel_materials.length !== 1 && "s"}
                  </span>
                </div>

                {results.novel_materials.map((mat, idx) => {
                  const expanded = expandedCard === idx;
                  const badge = getNoveltyBadge(mat.novelty_score);
                  const stabilityGrade = getStabilityGrade(mat.stability_score);

                  return (
                    <div
                      key={idx}
                      className="bg-card rounded-xl border border-border overflow-hidden transition-all hover:border-accent/30"
                    >
                      {/* Card header */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-violet-500/20 border border-accent/20 flex items-center justify-center font-bold text-accent text-sm">
                              #{idx + 1}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold tracking-tight">
                                {mat.compound}
                              </h3>
                              {/* Chemical Name */}
                              {mat.chemical_name && (
                                <p className="text-xs text-cyan-400 font-medium mt-0.5">
                                  {mat.chemical_name}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full border ${badge.cls}`}
                                >
                                  <Fingerprint className="inline h-3 w-3 mr-1" />
                                  {badge.label}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {mat.structure.total_atoms} atoms
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Stability Score (right side, prominent) */}
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${stabilityGrade.cls}`}
                              >
                                {stabilityGrade.grade}
                              </span>
                              <p
                                className={`text-2xl font-bold ${getStabilityColor(mat.stability_score)}`}
                              >
                                {mat.stability_score.toFixed(1)}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Stability Score
                            </p>
                          </div>
                        </div>

                        {/* Metrics row */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
                          <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                            <p className="text-xs text-muted-foreground">
                              Formation Energy
                            </p>
                            <p className="text-sm font-bold font-mono">
                              {mat.formation_energy?.toFixed(3)}{" "}
                              <span className="text-xs font-normal text-muted-foreground">
                                eV/atom
                              </span>
                            </p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                            <p className="text-xs text-muted-foreground">
                              Band Gap
                            </p>
                            <p className="text-sm font-bold font-mono text-cyan-400">
                              {mat.band_gap_eV?.toFixed(3) ?? "—"}{" "}
                              <span className="text-xs font-normal text-muted-foreground">
                                eV
                              </span>
                            </p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                            <p className="text-xs text-muted-foreground">
                              Quantum Score
                            </p>
                            <p className="text-sm font-bold font-mono text-indigo-400">
                              {mat.quantum_score.toFixed(2)}
                            </p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                            <p className="text-xs text-muted-foreground">
                              Chemistry
                            </p>
                            <p className="text-sm font-bold font-mono text-emerald-400">
                              {mat.chemistry_stability?.toFixed(1) ?? "—"}/10
                            </p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                            <p className="text-xs text-muted-foreground">
                              Material Class
                            </p>
                            <p className="text-sm font-bold">
                              {mat.predicted_applications?.material_class ?? "—"}
                            </p>
                          </div>
                        </div>

                        {/* Predicted Applications */}
                        {mat.predicted_applications && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {[
                              ...(mat.predicted_applications.primary_applications || []),
                              ...(mat.predicted_applications.element_applications || []),
                            ].slice(0, 5).map((app) => (
                              <span
                                key={app}
                                className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs"
                              >
                                {app}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Expand/collapse toggle */}
                        <button
                          className="flex items-center gap-1 mt-3 text-xs text-accent hover:text-accent/80 transition-colors"
                          onClick={() =>
                            setExpandedCard(expanded ? null : idx)
                          }
                        >
                          <Box className="h-3.5 w-3.5" />
                          {expanded
                            ? "Hide 3D Structure"
                            : "View 3D Structure"}
                          {expanded ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      </div>

                      {/* 3D Structure (expandable) */}
                      {expanded && (
                        <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-300">
                          <CompoundViewer3D
                            structure={mat.structure}
                            height="360px"
                            showLabels={true}
                            compoundName={mat.chemical_name}
                          />
                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate("/simulator", {
                                  state: {
                                    formula: mat.compound,
                                    elements: mat.structure.atoms.map((a) => ({
                                      symbol: a.symbol,
                                      count: 1,
                                    })),
                                  },
                                })
                              }
                            >
                              <Zap className="h-3.5 w-3.5 mr-1" />
                              Simulate
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate("/molecule-builder", {
                                  state: { formula: mat.compound },
                                })
                              }
                            >
                              <Atom className="h-3.5 w-3.5 mr-1" />
                              Molecule Builder
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* No novel results */}
            {results && results.novel_materials.length === 0 && (
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <ShieldCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold">No Novel Materials Found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try widening the energy range, increasing max atoms, lowering
                  the stability level, or selecting more element groups.
                </p>
              </div>
            )}

            {/* Alloy Candidates */}
            {results && results.alloy_candidates.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-5 space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-accent" />
                  Known Alloys (from dataset)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-muted-foreground border-b border-border/50">
                        <th className="text-left py-2 px-2">Alloy</th>
                        <th className="text-right py-2 px-2">UTS (psi)</th>
                        <th className="text-right py-2 px-2">
                          Melting Pt (°C)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.alloy_candidates.map((a, i) => (
                        <tr
                          key={i}
                          className="border-b border-border/20 hover:bg-muted/10"
                        >
                          <td className="py-2 px-2 font-medium">{a.Alloy}</td>
                          <td className="py-2 px-2 text-right font-mono">
                            {a.UTS?.toLocaleString() ?? "—"}
                          </td>
                          <td className="py-2 px-2 text-right font-mono">
                            {a.MeltingPoint?.toLocaleString() ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CandidateGenerator;