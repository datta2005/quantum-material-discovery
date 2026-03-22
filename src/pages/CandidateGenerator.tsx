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
  ChevronRight,
  Database,
  PieChart,
  Target,
  Layers,
  Shield,
  Flame,
  Beaker,
  Download,
  X,
  Plus,
  Info,
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

const CRYSTAL_SYSTEM_OPTIONS = [
  { key: "cubic", label: "Cubic" },
  { key: "tetragonal", label: "Tetragonal" },
  { key: "orthorhombic", label: "Orthorhombic" },
  { key: "hexagonal", label: "Hexagonal" },
  { key: "monoclinic", label: "Monoclinic" },
  { key: "triclinic", label: "Triclinic" },
];

const APPLICATION_TARGET_OPTIONS = [
  { key: "battery_cathode", label: "Battery Electrode", icon: "🔋" },
  { key: "photovoltaics", label: "Photovoltaic Absorber", icon: "☀️" },
  { key: "thermoelectric", label: "Thermoelectric", icon: "🌡️" },
  { key: "catalyst", label: "Catalyst / Photocatalyst", icon: "⚗️" },
  { key: "semiconductor", label: "Semiconductor Device", icon: "💻" },
];

interface NovelMaterial {
  compound: string;
  chemical_name?: string;
  formation_energy: number;
  formation_energy_raw?: number;
  band_gap_eV: number | null;
  band_gap_raw?: number;
  quantum_score: number;
  stability_score: number;
  chemistry_stability?: number;
  novelty_score: number;
  is_novel: boolean;
  novelty_label?: string;  // "Novel Composition" | "Known Material"
  quantum_method?: string;  // "VQE" | "circuit" | "fallback"
  validity?: string;
  prototype_match?: boolean;
  coordination_ok?: boolean;
  honest_label?: string;  // "Physically Plausible" | "AI Candidate" | "Needs Verification"
  confidence_level?: string;  // "high" | "moderate" | "low" | "speculative"
  compound_class?: string;
  stability_class?: string;
  structure_type?: string;
  goldschmidt_t?: number | null;
  structure_note?: string;
  ml_prototype?: string;
  e_above_hull?: number | null;
  thermodynamic_stability?: string;
  stability_label?: string;
  stability_tier?: number;
  stability_warning?: string | null;
  competing_phases?: { formula: string; formation_energy_eV: number }[];
  predicted_applications?: {
    material_class: string;
    primary_applications: string[];
    detailed_applications?: {
      application: string;
      confidence: number;
      reference: string;
    }[];
    overall_confidence?: number;
    confidence_label?: string;
    solar_efficiency_pct?: number | null;
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
    cif_data?: string | null;
    lattice?: {
      a?: number; b?: number; c?: number;
      alpha?: number; beta?: number; gamma?: number;
      volume?: number;
      crystal_system?: string;
    };
  };
  // Phase 6: Research-grade fields
  pareto_rank?: number;
  chemical_validity_probability?: number;
  crystal_system?: string;
  lattice_params?: {
    a?: number; b?: number; c?: number;
    alpha?: number; beta?: number; gamma?: number;
    volume?: number; crystal_system?: string;
  };
  feature_importance?: {
    feature_name: string;
    importance: number;
    energy_sensitivity: number;
    bandgap_sensitivity: number;
  }[];
  tp_correction?: {
    corrected_formation_energy: number;
    entropy_correction_eV: number;
    pressure_correction_eV: number;
    temperature_K: number;
    pressure_GPa: number;
  } | null;
  formation_energy_at_conditions?: number;
  application_target_match?: boolean;
  score_breakdown?: Record<string, number>;
  score_weights?: Record<string, number>;
  synthesis_confidence?: number;
  synthesis_label?: string;
  mobile_ion_pathway_likelihood?: string;
  battery_prototype_match?: string;
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
      desc: "Only thermodynamically stable compounds (~75-100 score)",
      icon: <Shield className="h-4 w-4" />,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/15",
      borderColor: "border-emerald-500/40",
    },
    {
      key: "medium",
      label: "Medium",
      desc: "Moderate stability — balanced exploration (~50-74 score)",
      icon: <Beaker className="h-4 w-4" />,
      color: "text-amber-400",
      bgColor: "bg-amber-500/15",
      borderColor: "border-amber-500/40",
    },
    {
      key: "low",
      label: "Low Stability",
      desc: "Exotic / metastable — for advanced applications (<50 score)",
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
  const [bandgapRange, setBandgapRange] = useState<[number, number]>([0.0, 10.0]);
  const [useBandgapFilter, setUseBandgapFilter] = useState(false);
  const [maxAtoms, setMaxAtoms] = useState(8);
  const [numCandidates, setNumCandidates] = useState(5);
  const [stabilityLevel, setStabilityLevel] = useState<StabilityLevel>("high");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([
    "transition_metals",
    "nonmetals",
  ]);

  // Element-level selection
  const [includeElements, setIncludeElements] = useState<string[]>([]);
  const [excludeElements, setExcludeElements] = useState<string[]>([]);
  const [elementInput, setElementInput] = useState("");
  const [elementMode, setElementMode] = useState<"include" | "exclude">("include");

  // Phase 6: Research-grade controls
  const [crystalSystems, setCrystalSystems] = useState<string[]>([]);
  const [applicationTargets, setApplicationTargets] = useState<string[]>([]);
  const [temperatureK, setTemperatureK] = useState(300);
  const [pressureGPa, setPressureGPa] = useState(0.0001);

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

  const addElement = () => {
    const elem = elementInput.trim();
    if (!elem || elem.length > 2) return;
    const formatted = elem.charAt(0).toUpperCase() + elem.slice(1).toLowerCase();
    if (elementMode === "include") {
      if (!includeElements.includes(formatted)) {
        setIncludeElements([...includeElements, formatted]);
        // Remove from exclude if present
        setExcludeElements(excludeElements.filter(e => e !== formatted));
      }
    } else {
      if (!excludeElements.includes(formatted)) {
        setExcludeElements([...excludeElements, formatted]);
        setIncludeElements(includeElements.filter(e => e !== formatted));
      }
    }
    setElementInput("");
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
          target_bandgap_min: useBandgapFilter ? bandgapRange[0] : null,
          target_bandgap_max: useBandgapFilter ? bandgapRange[1] : null,
          max_atoms: maxAtoms,
          element_groups: selectedGroups,
          include_elements: includeElements.length > 0 ? includeElements : null,
          exclude_elements: excludeElements.length > 0 ? excludeElements : null,
          num_candidates: numCandidates,
          stability_level: stabilityLevel,
          crystal_systems: crystalSystems.length > 0 ? crystalSystems : null,
          application_targets: applicationTargets.length > 0 ? applicationTargets : null,
          temperature_K: temperatureK,
          pressure_GPa: pressureGPa,
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

  const getStabilityGrade = (score: number, mat?: NovelMaterial) => {
    // Ehull-aware grading: cap grades for thermodynamically unstable compounds
    const tier = mat?.stability_tier ?? 0;

    // Highly Unstable (Ehull > 1.0 eV) → max grade D
    if (tier === 5) return { grade: "D", cls: "bg-rose-500/15 text-rose-400 border-rose-500/30" };
    // Unstable (Ehull 0.5–1.0 eV) → max grade C
    if (tier === 4) {
      if (score >= 16) return { grade: "C+", cls: "bg-orange-500/15 text-orange-400 border-orange-500/30" };
      return { grade: "C", cls: "bg-orange-500/15 text-orange-400 border-orange-500/30" };
    }
    // High-energy metastable (0.2–0.5 eV) → max grade B
    if (tier === 3) {
      if (score >= 20) return { grade: "B", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
      if (score >= 16) return { grade: "B-", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
      return { grade: "C", cls: "bg-orange-500/15 text-orange-400 border-orange-500/30" };
    }

    // Stable / Metastable / Unknown: grade by score
    if (score >= 28) return { grade: "A+", cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
    if (score >= 24) return { grade: "A", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
    if (score >= 20) return { grade: "B+", cls: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" };
    if (score >= 16) return { grade: "B", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
    if (score >= 12) return { grade: "C", cls: "bg-orange-500/15 text-orange-400 border-orange-500/30" };
    return { grade: "D", cls: "bg-rose-500/15 text-rose-400 border-rose-500/30" };
  };

  const getNoveltyBadge = (mat: NovelMaterial) => {
    // Use backend label when available
    if (mat.novelty_label === 'Known Material') {
      return {
        label: "Known Material",
        cls: "bg-slate-500/15 text-slate-400 border-slate-500/30",
      };
    }
    const score = mat.novelty_score;
    if (score > 0.9)
      return {
        label: "Novel Composition",
        cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      };
    if (score > 0.7)
      return {
        label: "Likely Novel",
        cls: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
      };
    if (score > 0.5)
      return {
        label: "Possibly Novel",
        cls: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      };
    return {
      label: "Known Variant",
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
                  max={20}
                  step={1}
                  className="py-1"
                />
              </div>

              {/* Band gap target (toggleable) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="flex items-center gap-2 text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={useBandgapFilter}
                      onChange={(e) => setUseBandgapFilter(e.target.checked)}
                      className="rounded border-border/50 h-3 w-3"
                    />
                    Band Gap Target (eV)
                  </label>
                  {useBandgapFilter && (
                    <span className="font-mono font-semibold text-purple-400">
                      {bandgapRange[0].toFixed(1)} – {bandgapRange[1].toFixed(1)}
                    </span>
                  )}
                </div>
                {useBandgapFilter && (
                  <>
                    <Slider
                      value={[bandgapRange[0] * 10, bandgapRange[1] * 10]}
                      onValueChange={(v) => setBandgapRange([v[0] / 10, v[1] / 10])}
                      min={0}
                      max={100}
                      step={1}
                      className="py-1"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>0.0</span>
                      <span className="text-purple-400/60">Solar: 1.1-1.7</span>
                      <span>10.0</span>
                    </div>
                  </>
                )}
              </div>

              {/* Min stability */}
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
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                  <Atom className="h-4 w-4 text-accent" />
                  Element Groups
                </h3>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Restrict combinatorial generation to specific classifications.
                  Crucial for targeted discovery (e.g., Transition Metal Oxides for batteries, or Halides for perovskites).
                </p>
              </div>
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

            {/* Crystal System Filter */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-3">
              <div>
                <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                  <Box className="h-4 w-4 text-cyan-400" />
                  Crystal System
                </h3>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Restrict to specific lattice symmetries. Leave empty for all.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {CRYSTAL_SYSTEM_OPTIONS.map((cs) => {
                  const active = crystalSystems.includes(cs.key);
                  return (
                    <button
                      key={cs.key}
                      onClick={() =>
                        setCrystalSystems((prev) =>
                          prev.includes(cs.key) ? prev.filter((s) => s !== cs.key) : [...prev, cs.key]
                        )
                      }
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${active
                        ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400"
                        : "bg-muted/20 border-border/50 text-muted-foreground hover:bg-muted/40"
                        }`}
                    >
                      {cs.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Application-Driven Discovery Targets */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-3">
              <div>
                <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-400" />
                  Application Targets
                </h3>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Boost ranking for materials matching specific functional goals.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {APPLICATION_TARGET_OPTIONS.map((app) => {
                  const active = applicationTargets.includes(app.key);
                  return (
                    <button
                      key={app.key}
                      onClick={() =>
                        setApplicationTargets((prev) =>
                          prev.includes(app.key) ? prev.filter((s) => s !== app.key) : [...prev, app.key]
                        )
                      }
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${active
                        ? "bg-purple-500/15 border-purple-500/40 text-purple-400"
                        : "bg-muted/20 border-border/50 text-muted-foreground hover:bg-muted/40"
                        }`}
                    >
                      <span>{app.icon}</span>
                      {app.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Thermodynamic Conditions */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-400" />
                  Thermodynamic Conditions
                </h3>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Higher T enables entropy-stabilized metastable phases. Higher P favors denser structures.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Temperature</span>
                  <span className="font-mono font-semibold text-orange-400">{temperatureK} K</span>
                </div>
                <Slider
                  value={[temperatureK]}
                  onValueChange={(v) => setTemperatureK(v[0])}
                  min={100}
                  max={2000}
                  step={50}
                  className="py-1"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>100 K</span>
                  <span className="text-orange-400/60">RT: 300 K</span>
                  <span>2000 K</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Pressure</span>
                  <span className="font-mono font-semibold text-orange-400">
                    {pressureGPa < 0.01 ? "1 atm" : `${pressureGPa.toFixed(1)} GPa`}
                  </span>
                </div>
                <Slider
                  value={[Math.log10(Math.max(pressureGPa, 0.0001)) * 25 + 100]}
                  onValueChange={(v) => setPressureGPa(Math.pow(10, (v[0] - 100) / 25))}
                  min={0}
                  max={200}
                  step={1}
                  className="py-1"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>1 atm</span>
                  <span>100 GPa</span>
                </div>
              </div>
            </div>
            {/* Element-Level Selection */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Fingerprint className="h-4 w-4 text-accent" />
                Element Selection
              </h2>
              <p className="text-xs text-muted-foreground">
                Include or exclude specific elements
              </p>
              <div className="flex gap-1.5">
                <div className="flex rounded-md overflow-hidden border border-border/50 text-[10px]">
                  <button
                    onClick={() => setElementMode("include")}
                    className={`px-2.5 py-1.5 font-medium transition-all ${elementMode === "include"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-muted/20 text-muted-foreground"
                      }`}
                  >
                    Include
                  </button>
                  <button
                    onClick={() => setElementMode("exclude")}
                    className={`px-2.5 py-1.5 font-medium transition-all ${elementMode === "exclude"
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-muted/20 text-muted-foreground"
                      }`}
                  >
                    Exclude
                  </button>
                </div>
                <input
                  type="text"
                  value={elementInput}
                  onChange={(e) => setElementInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addElement()}
                  placeholder="e.g. Ti, O, Fe"
                  className="flex-1 bg-muted/20 border border-border/50 rounded px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50"
                  maxLength={2}
                />
                <button
                  onClick={addElement}
                  className="px-2 py-1 rounded bg-accent/10 border border-accent/30 text-accent text-xs hover:bg-accent/20 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {/* Include pills */}
              {includeElements.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[9px] text-emerald-400/70 mr-1 self-center">MUST:</span>
                  {includeElements.map((elem) => (
                    <span
                      key={elem}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-medium"
                    >
                      {elem}
                      <button
                        onClick={() => setIncludeElements(includeElements.filter(e => e !== elem))}
                        className="hover:text-white transition-colors"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {/* Exclude pills */}
              {excludeElements.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[9px] text-rose-400/70 mr-1 self-center">NOT:</span>
                  {excludeElements.map((elem) => (
                    <span
                      key={elem}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-medium"
                    >
                      {elem}
                      <button
                        onClick={() => setExcludeElements(excludeElements.filter(e => e !== elem))}
                        className="hover:text-white transition-colors"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
                  const badge = getNoveltyBadge(mat);
                  const stabilityGrade = getStabilityGrade(mat.stability_score, mat);

                  const tierStripe =
                    (mat.stability_tier ?? 0) <= 1 ? "border-l-emerald-500"
                    : (mat.stability_tier ?? 0) === 2 ? "border-l-cyan-400"
                    : (mat.stability_tier ?? 0) === 3 ? "border-l-amber-400"
                    : (mat.stability_tier ?? 0) === 4 ? "border-l-orange-400"
                    : "border-l-rose-500";

                  return (
                    <div
                      key={idx}
                      className={`bg-card rounded-xl border border-border border-l-4 ${tierStripe} overflow-hidden transition-all hover:shadow-lg hover:shadow-accent/5 hover:border-accent/30`}
                    >
                      {/* Card header */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-violet-500/20 border border-accent/20 flex items-center justify-center font-bold text-accent text-sm">
                                #{idx + 1}
                              </div>
                              {mat.pareto_rank === 1 && (
                                <span className="absolute -top-1.5 -right-1.5 text-[10px] bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 rounded-full w-5 h-5 flex items-center justify-center" title="Pareto Optimal">
                                  🏆
                                </span>
                              )}
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
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full border ${badge.cls}`}
                                >
                                  <Fingerprint className="inline h-3 w-3 mr-1" />
                                  {badge.label}
                                </span>
                                {/* Honest label from physics corrector */}
                                {mat.honest_label && (
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${mat.honest_label === 'Physically Plausible'
                                      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                                      : mat.honest_label === 'AI Candidate'
                                        ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
                                        : 'text-orange-400 border-orange-500/30 bg-orange-500/10'
                                      }`}
                                  >
                                    <ShieldCheck className="inline h-3 w-3 mr-1" />
                                    {mat.honest_label}
                                  </span>
                                )}
                                {/* Confidence level */}
                                {mat.confidence_level && (
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${mat.confidence_level === 'high'
                                      ? 'text-emerald-400 border-emerald-500/30'
                                      : mat.confidence_level === 'moderate'
                                        ? 'text-sky-400 border-sky-500/30'
                                        : mat.confidence_level === 'low'
                                          ? 'text-amber-400 border-amber-500/30'
                                          : 'text-red-400 border-red-500/30'
                                      }`}
                                  >
                                    {mat.confidence_level} conf.
                                  </span>
                                )}
                                {mat.prototype_match && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full border text-emerald-400 border-emerald-500/30 bg-emerald-500/10 font-medium" title={mat.structure_note}>
                                    ✓ Prototype
                                  </span>
                                )}
                                {/* Structure / Prototype Badge */}
                                <div className="flex gap-2">
                                  <span className="text-[10px] px-2 py-0.5 rounded-full border bg-muted/20 border-border/50 text-muted-foreground flex items-center gap-1">
                                    <Layers className="h-3 w-3" />
                                    {mat.structure_type || "Unknown Structure"}
                                    {mat.ml_prototype && mat.ml_prototype !== mat.structure_type && ` • ${mat.ml_prototype}`}
                                  </span>
                                  {mat.is_novel && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                                      <Sparkles className="h-3 w-3" /> Novel Phase
                                    </span>
                                  )}
                                </div>
                                {mat.goldschmidt_t !== undefined && mat.goldschmidt_t !== null && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded border border-purple-500/20 text-purple-300 font-medium">
                                    t={mat.goldschmidt_t.toFixed(3)}
                                  </span>
                                )}
                                <span className="text-[10px] text-muted-foreground">
                                  {/* {mat.structure.total_atoms} atoms */}
                                {mat.structure_type || 'Unknown Type'}
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
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              E<sub>hull</sub>
                              <span className="text-[9px] text-muted-foreground/60" title="Energy above the convex hull — the primary thermodynamic stability indicator. Lower = more stable.">ⓘ</span>
                            </p>
                            <p className={`text-sm font-bold font-mono ${(mat.stability_tier ?? 0) <= 1 ? 'text-emerald-400'
                              : (mat.stability_tier ?? 0) === 2 ? 'text-cyan-400'
                                : (mat.stability_tier ?? 0) === 3 ? 'text-amber-400'
                                  : 'text-rose-400'
                              }`}>
                              {mat.e_above_hull != null ? `${mat.e_above_hull.toFixed(3)}` : '—'}{" "}
                              <span className="text-xs font-normal text-muted-foreground">
                                eV
                              </span>
                            </p>
                            {mat.stability_label && (
                              <p className={`text-[9px] mt-0.5 ${(mat.stability_tier ?? 0) <= 1 ? 'text-emerald-400/70'
                                : (mat.stability_tier ?? 0) === 2 ? 'text-cyan-400/70'
                                  : (mat.stability_tier ?? 0) === 3 ? 'text-amber-400/70'
                                    : 'text-rose-400/70'
                                }`}>
                                {mat.stability_label}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Research-Grade: Chemical Validity + Pareto + Crystal System */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                          {/* Chemical Validity Probability */}
                          {mat.chemical_validity_probability != null && (
                            <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                Chemical Validity
                                <span className="text-[9px] text-muted-foreground/60" title="Probability the compound is chemically valid based on charge neutrality, coordination, and prototype matching">ⓘ</span>
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      mat.chemical_validity_probability >= 0.8 ? 'bg-emerald-500' :
                                      mat.chemical_validity_probability >= 0.5 ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${mat.chemical_validity_probability * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm font-bold font-mono">
                                  {(mat.chemical_validity_probability * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Crystal System */}
                          {mat.crystal_system && mat.crystal_system !== 'unknown' && (
                            <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                              <p className="text-xs text-muted-foreground">Crystal System</p>
                              <p className="text-sm font-bold font-mono text-cyan-400 capitalize">
                                {mat.crystal_system}
                              </p>
                            </div>
                          )}

                          {/* Pareto Rank */}
                          {mat.pareto_rank != null && (
                            <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                              <p className="text-xs text-muted-foreground">Pareto Rank</p>
                              <p className={`text-sm font-bold font-mono ${mat.pareto_rank === 1 ? 'text-yellow-400' : mat.pareto_rank <= 3 ? 'text-sky-400' : 'text-muted-foreground'}`}>
                                {mat.pareto_rank === 1 ? '🏆 Front' : `#${mat.pareto_rank}`}
                              </p>
                            </div>
                          )}

                          {/* Synthesis Confidence */}
                          {mat.synthesis_confidence != null && (
                            <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                              <p className="text-xs text-muted-foreground">Synthesis</p>
                              <p className={`text-sm font-bold font-mono ${mat.synthesis_confidence >= 0.7 ? 'text-emerald-400' : mat.synthesis_confidence >= 0.4 ? 'text-amber-400' : 'text-rose-400'}`}>
                                {(mat.synthesis_confidence * 100).toFixed(0)}%
                              </p>
                              {mat.synthesis_label && (
                                <p className="text-[9px] text-muted-foreground mt-0.5">{mat.synthesis_label}</p>
                              )}
                            </div>
                          )}

                          {/* Mobile Ion Pathway */}
                          {mat.mobile_ion_pathway_likelihood && (
                            <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                              <p className="text-xs text-muted-foreground">Ion Pathway</p>
                              <p className={`text-sm font-bold font-mono ${mat.mobile_ion_pathway_likelihood === 'High' ? 'text-emerald-400' : mat.mobile_ion_pathway_likelihood === 'Medium' ? 'text-amber-400' : 'text-rose-400'}`}>
                                {mat.mobile_ion_pathway_likelihood}
                              </p>
                            </div>
                          )}

                          {/* Battery Prototype Match */}
                          {mat.battery_prototype_match && (
                            <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                              <p className="text-xs text-muted-foreground">Battery Structure</p>
                              <p className="text-sm font-bold font-mono text-indigo-400 capitalize">
                                {mat.battery_prototype_match.replace(/_/g, " ")}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Stability Warning Banner */}
                        {mat.stability_warning && (mat.stability_tier ?? 0) >= 3 && (
                          <div className={`mt-3 px-3 py-2 rounded-lg border text-xs ${(mat.stability_tier ?? 0) >= 4
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                            }`}>
                            <span className="font-medium">
                              ⚠ Thermodynamic Warning:
                            </span>{' '}
                            {mat.stability_warning}
                          </div>
                        )}

                        {/* Predicted Applications */}
                        {mat.predicted_applications && (
                          <div className="mt-3 space-y-1.5">
                            <div className="flex flex-wrap gap-1.5">
                              {mat.predicted_applications.primary_applications?.slice(0, 5).map((app) => (
                                <span
                                  key={app}
                                  className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs"
                                >
                                  {app}
                                </span>
                              ))}
                            </div>

                          </div>
                        )}

                        {/* Thermodynamic Stability */}
                        {mat.thermodynamic_stability && mat.thermodynamic_stability !== 'unknown' && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${mat.thermodynamic_stability.includes('stable')
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : mat.thermodynamic_stability === 'metastable'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}>
                              🔬 {mat.thermodynamic_stability}
                            </span>
                            {mat.e_above_hull != null && (
                              <span className="text-[10px] text-muted-foreground font-mono">
                                E<sub>hull</sub>={mat.e_above_hull.toFixed(3)} eV
                              </span>
                            )}
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

                          {/* Lattice Parameters */}
                          {mat.lattice_params && Object.keys(mat.lattice_params).length > 0 && (
                            <div className="mt-3 p-3 rounded-lg bg-muted/10 border border-border/20">
                              <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                                <Box className="h-3.5 w-3.5 text-cyan-400" />
                                Lattice Parameters
                              </h4>
                              <div className="grid grid-cols-4 gap-2 text-[11px]">
                                {mat.lattice_params.a != null && (
                                  <div><span className="text-muted-foreground">a = </span><span className="font-mono font-semibold">{mat.lattice_params.a.toFixed(3)} Å</span></div>
                                )}
                                {mat.lattice_params.b != null && (
                                  <div><span className="text-muted-foreground">b = </span><span className="font-mono font-semibold">{mat.lattice_params.b.toFixed(3)} Å</span></div>
                                )}
                                {mat.lattice_params.c != null && (
                                  <div><span className="text-muted-foreground">c = </span><span className="font-mono font-semibold">{mat.lattice_params.c.toFixed(3)} Å</span></div>
                                )}
                                {mat.lattice_params.volume != null && (
                                  <div><span className="text-muted-foreground">V = </span><span className="font-mono font-semibold">{mat.lattice_params.volume.toFixed(1)} ų</span></div>
                                )}
                                {mat.lattice_params.alpha != null && (
                                  <div><span className="text-muted-foreground">α = </span><span className="font-mono font-semibold">{mat.lattice_params.alpha.toFixed(1)}°</span></div>
                                )}
                                {mat.lattice_params.beta != null && (
                                  <div><span className="text-muted-foreground">β = </span><span className="font-mono font-semibold">{mat.lattice_params.beta.toFixed(1)}°</span></div>
                                )}
                                {mat.lattice_params.gamma != null && (
                                  <div><span className="text-muted-foreground">γ = </span><span className="font-mono font-semibold">{mat.lattice_params.gamma.toFixed(1)}°</span></div>
                                )}
                                {mat.lattice_params.crystal_system && (
                                  <div><span className="text-muted-foreground">System: </span><span className="font-mono font-semibold text-cyan-400 capitalize">{mat.lattice_params.crystal_system}</span></div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* XAI Feature Importance */}
                          {mat.feature_importance && mat.feature_importance.length > 0 && (
                            <div className="mt-3 p-3 rounded-lg bg-muted/10 border border-border/20">
                              <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                                <BarChart3 className="h-3.5 w-3.5 text-purple-400" />
                                Feature Importance (XAI)
                              </h4>
                              <div className="space-y-1.5">
                                {mat.feature_importance.slice(0, 5).map((fi, fiIdx) => {
                                  const maxImportance = mat.feature_importance![0].importance;
                                  const pct = maxImportance > 0 ? (fi.importance / maxImportance) * 100 : 0;
                                  return (
                                    <div key={fiIdx} className="flex items-center gap-2">
                                      <span className="text-[10px] text-muted-foreground w-24 truncate" title={fi.feature_name}>
                                        {fi.feature_name}
                                      </span>
                                      <div className="flex-1 h-2 bg-muted/20 rounded-full overflow-hidden">
                                        <div
                                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-400"
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                      <span className="text-[10px] font-mono text-purple-400 w-10 text-right">
                                        {fi.importance.toFixed(2)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* T/P Correction Info */}
                          {mat.tp_correction && (
                            <div className="mt-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/15">
                              <h4 className="text-xs font-semibold text-orange-400 mb-1.5 flex items-center gap-1.5">
                                <Flame className="h-3.5 w-3.5" />
                                Thermodynamic Correction
                              </h4>
                              <div className="grid grid-cols-3 gap-3 text-[11px]">
                                <div>
                                  <span className="text-muted-foreground">E<sub>f</sub> at T,P: </span>
                                  <span className="font-mono font-semibold">{mat.formation_energy_at_conditions?.toFixed(3)} eV</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">ΔS<sub>conf</sub>: </span>
                                  <span className="font-mono font-semibold text-cyan-400">{mat.tp_correction.entropy_correction_eV.toFixed(4)} eV</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">PΔV: </span>
                                  <span className="font-mono font-semibold text-amber-400">{mat.tp_correction.pressure_correction_eV.toFixed(4)} eV</span>
                                </div>
                              </div>
                            </div>
                          )}
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
                            {/* Export buttons */}
                            {["cif", "poscar", "xyz"].map((fmt) => (
                              <a
                                key={fmt}
                                href={`${API_BASE}/export/${fmt}?formula=${encodeURIComponent(mat.compound)}`}
                                download
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-muted/30 border border-border/50 text-muted-foreground hover:text-accent hover:border-accent/30 transition-colors"
                              >
                                <Download className="h-2.5 w-2.5" />
                                {fmt.toUpperCase()}
                              </a>
                            ))}
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
      </main >
    </div >
  );
};

export default CandidateGenerator;