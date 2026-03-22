import { Activity, Zap, ThermometerSun, Link2, Scale, Info, ShieldCheck, Layers } from "lucide-react";
import { MoleculeElement } from "./MoleculeConstructionZone";

interface MoleculeSummaryProps {
  elements: MoleculeElement[];
}

// Real atomic data for scientific computations
const ELECTRONEGATIVITY: Record<string, number> = {
  H: 2.20, He: 0.0, Li: 0.98, Be: 1.57, B: 2.04, C: 2.55, N: 3.04, O: 3.44, F: 3.98,
  Na: 0.93, Mg: 1.31, Al: 1.61, Si: 1.90, P: 2.19, S: 2.58, Cl: 3.16, K: 0.82, Ca: 1.00,
  Sc: 1.36, Ti: 1.54, V: 1.63, Cr: 1.66, Mn: 1.55, Fe: 1.83, Co: 1.88, Ni: 1.91, Cu: 1.90,
  Zn: 1.65, Ga: 1.81, Ge: 2.01, Zr: 1.33, Nb: 1.60, Mo: 2.16, Ru: 2.20, Pd: 2.20, Ag: 1.93,
  Sn: 1.96, Ba: 0.89, La: 1.10, W: 2.36, Pt: 2.28, Au: 2.54, Pb: 2.33, Sr: 0.95, Y: 1.22,
};
const IONIZATION_ENERGY: Record<string, number> = {
  H: 13.6, Li: 5.4, Be: 9.3, B: 8.3, C: 11.3, N: 14.5, O: 13.6, F: 17.4, Na: 5.1, Mg: 7.6,
  Al: 6.0, Si: 8.2, P: 10.5, S: 10.4, Cl: 13.0, K: 4.3, Ca: 6.1, Ti: 6.8, V: 6.7, Cr: 6.8,
  Mn: 7.4, Fe: 7.9, Co: 7.9, Ni: 7.6, Cu: 7.7, Zn: 9.4, Zr: 6.6, Nb: 6.8, Mo: 7.1, Ru: 7.4,
  Pd: 8.3, Ag: 7.6, Sn: 7.3, Ba: 5.2, La: 5.6, W: 7.9, Pt: 9.0, Au: 9.2, Pb: 7.4, Sr: 5.7,
};
const VALENCE_ELECTRONS: Record<string, number> = {
  H: 1, Li: 1, Be: 2, B: 3, C: 4, N: 5, O: 6, F: 7, Na: 1, Mg: 2, Al: 3, Si: 4, P: 5, S: 6,
  Cl: 7, K: 1, Ca: 2, Sc: 3, Ti: 4, V: 5, Cr: 6, Mn: 7, Fe: 8, Co: 9, Ni: 10, Cu: 11, Zn: 2,
  Zr: 4, Nb: 5, Mo: 6, Ru: 8, Pd: 10, Sn: 4, Ba: 2, La: 3, W: 6, Pt: 10, Au: 11, Pb: 4, Sr: 2,
};

function estimateFormationEnergy(elements: MoleculeElement[]): number {
  if (elements.length < 2) return 0;
  // Pauling-rule approximation: Ef ≈ -0.25 * Σ (ΔEN)² per pair
  let ef = 0;
  let pairCount = 0;
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const en_i = ELECTRONEGATIVITY[elements[i].symbol] ?? 2.0;
      const en_j = ELECTRONEGATIVITY[elements[j].symbol] ?? 2.0;
      ef += -0.25 * (en_i - en_j) ** 2;
      pairCount++;
    }
  }
  const avgIE = elements.reduce((s, el) => s + (IONIZATION_ENERGY[el.symbol] ?? 8.0) * el.count, 0) /
                elements.reduce((s, el) => s + el.count, 0);
  ef -= (avgIE - 7.0) * 0.05; // IE correction
  return parseFloat((ef / Math.max(pairCount, 1)).toFixed(3));
}

function estimateBandGap(elements: MoleculeElement[]): number | null {
  if (elements.length === 0) return null;
  const syms = elements.map(e => e.symbol);
  const metals = ["Fe", "Cu", "Ag", "Au", "Pt", "Pd", "Ni", "Co", "Ru", "W", "Cr", "Mo", "Nb", "Zr"];
  const isMetal = syms.every(s => metals.includes(s));
  if (isMetal) return 0;
  const avgEN = elements.reduce((s, el) => s + (ELECTRONEGATIVITY[el.symbol] ?? 2.0) * el.count, 0)
             / elements.reduce((s, el) => s + el.count, 0);
  const avgValence = elements.reduce((s, el) => s + (VALENCE_ELECTRONS[el.symbol] ?? 4) * el.count, 0)
                   / elements.reduce((s, el) => s + el.count, 0);
  let gap = (avgEN - 1.5) * 1.5 + (4 - Math.abs(avgValence - 4)) * 0.4;
  return parseFloat(Math.max(0, Math.min(gap, 8.0)).toFixed(2));
}

function getChemicalStabilityIndicator(elements: MoleculeElement[]): { label: string; color: string; score: number } {
  if (elements.length === 0) return { label: "No compound", color: "text-muted-foreground", score: 0 };
  const ef = estimateFormationEnergy(elements);
  if (ef < -0.8)  return { label: "High Stability", color: "text-emerald-400", score: 85 };
  if (ef < -0.4)  return { label: "Moderate Stability", color: "text-yellow-400", score: 60 };
  if (ef < 0)     return { label: "Low Stability", color: "text-orange-400", score: 35 };
  return { label: "Unstable / Endothermic", color: "text-red-400", score: 10 };
}

function getBondType(elements: MoleculeElement[]): string {
  if (elements.length === 0) return "—";
  const syms = elements.map(e => e.symbol);
  const metals = ["Fe", "Cu", "Ag", "Au", "Pt", "Pd", "Ni", "Co", "Ru", "W", "Cr", "Mo", "Nb", "Zr", "Ti", "Zn"];
  const alkali = ["Li", "Na", "K", "Rb", "Cs", "Ba", "Ca", "Sr", "Mg"];
  const hasAlkali = syms.some(s => alkali.includes(s));
  const hasHighEN = syms.some(s => (ELECTRONEGATIVITY[s] ?? 0) > 3.0);
  const enValues = syms.map(s => ELECTRONEGATIVITY[s] ?? 2.0);
  const enDiff = Math.max(...enValues) - Math.min(...enValues);
  if (hasAlkali && hasHighEN) return "Ionic";
  if (enDiff > 1.7) return "Polar Ionic";
  if (enDiff > 0.5) return "Polar Covalent";
  if (syms.every(s => metals.includes(s))) return "Metallic";
  return "Covalent";
}

export function MoleculeSummary({ elements }: MoleculeSummaryProps) {
  const formatFormula = () => {
    if (elements.length === 0) return "—";
    return elements.map(el => {
      const subscript = el.count > 1 ? String(el.count).split("").map(d => "₀₁₂₃₄₅₆₇₈₉"[parseInt(d)]).join("") : "";
      return el.symbol + subscript;
    }).join("");
  };

  const mw = elements.reduce((s, el) => s + el.atomicMass * el.count, 0);
  const ef = elements.length >= 2 ? estimateFormationEnergy(elements) : null;
  const bg = estimateBandGap(elements);
  const bondType = getBondType(elements);
  const stability = getChemicalStabilityIndicator(elements);
  const hasElements = elements.length > 0;

  const MaterialTypeLabel = () => {
    if (!hasElements) return <span className="text-muted-foreground text-xs">—</span>;
    if (bg === 0) return <span className="text-xs font-medium text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-full">Metal</span>;
    if (bg !== null && bg < 0.1) return <span className="text-xs font-medium text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-full">Semi-Metal</span>;
    if (bg !== null && bg < 2.0) return <span className="text-xs font-medium text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">Semiconductor</span>;
    return <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Insulator / Oxide</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Material Summary</h2>
        {hasElements && <MaterialTypeLabel />}
      </div>

      <div className="space-y-3">
        {/* Formula */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-quantum/5 border border-accent/20">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Scale className="h-4 w-4" />
            <span className="text-xs">Chemical Formula</span>
          </div>
          <p className="text-2xl font-bold tracking-wide">{formatFormula()}</p>
        </div>

        {/* Molecular Weight */}
        <div className="p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Activity className="h-4 w-4" />
            <span className="text-xs">Molecular Weight</span>
          </div>
          <p className="text-lg font-bold">{hasElements ? `${mw.toFixed(2)} g/mol` : "—"}</p>
        </div>

        {/* Formation Energy — Pauling Estimate */}
        <div className="p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Zap className="h-4 w-4" />
            <span className="text-xs">Est. Formation Energy (Pauling)</span>
          </div>
          <p className={`text-lg font-bold ${ef !== null && ef < 0 ? "text-emerald-400" : ef !== null ? "text-red-400" : ""}`}>
            {ef !== null ? `${ef} eV/atom` : elements.length < 2 ? "Need ≥ 2 elements" : "—"}
          </p>
        </div>

        {/* Estimated Band Gap */}
        <div className="p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Layers className="h-4 w-4" />
            <span className="text-xs">Est. Band Gap</span>
          </div>
          <p className="text-lg font-bold text-accent">
            {bg !== null ? (bg === 0 ? "0 eV (Metallic)" : `${bg} eV`) : "—"}
          </p>
        </div>

        {/* Bond Character */}
        <div className="p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Link2 className="h-4 w-4" />
            <span className="text-xs">Bond Character (Predicted)</span>
          </div>
          <p className="text-lg font-bold">{bondType}</p>
        </div>

        {/* Stability Indicator */}
        <div className="p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs">Thermodynamic Outlook</span>
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-base font-semibold ${stability.color}`}>{stability.label}</p>
            {hasElements && (
              <div className="text-right">
                <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-quantum transition-all duration-700"
                    style={{ width: `${stability.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span>Estimates based on Pauling electronegativity rules and periodic data. Run full quantum simulation for research-grade results.</span>
      </div>
    </div>
  );
}
