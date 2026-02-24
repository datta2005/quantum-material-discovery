/**
 * Molecule3DViewer — 3Dmol.js viewer with PubChem real structure support.
 *
 * Fetches real 3D molecular structures from PubChem when available,
 * with fallback to locally generated SDF for unknown compounds.
 * Supports double/triple bond rendering via SDF format.
 */
import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import type { MoleculeElement } from "./MoleculeConstructionZone";

// CPK colors for common elements
const ELEMENT_COLORS: Record<string, string> = {
  H: "#FFFFFF", He: "#D9FFFF", Li: "#CC80FF", Be: "#C2FF00", B: "#FFB5B5",
  C: "#909090", N: "#3050F8", O: "#FF0D0D", F: "#90E050", Ne: "#B3E3F5",
  Na: "#AB5CF2", Mg: "#8AFF00", Al: "#BFA6A6", Si: "#F0C8A0", P: "#FF8000",
  S: "#FFFF30", Cl: "#1FF01F", Ar: "#80D1E3", K: "#8F40D4", Ca: "#3DFF00",
  Ti: "#BFC2C7", V: "#A6A6AB", Cr: "#8A99C7", Mn: "#9C7AC7", Fe: "#E06633",
  Co: "#F090A0", Ni: "#50D050", Cu: "#C88033", Zn: "#7D80B0", Br: "#A62929",
  I: "#940094", Ag: "#C0C0C0", Au: "#FFD123",
};

// Covalent radii (Å)
const COVALENT_RADII: Record<string, number> = {
  H: 0.31, He: 0.28, Li: 1.28, Be: 0.96, B: 0.84, C: 0.76, N: 0.71,
  O: 0.66, F: 0.57, Ne: 0.58, Na: 1.66, Mg: 1.41, Al: 1.21, Si: 1.11,
  P: 1.07, S: 1.05, Cl: 1.02, Ar: 1.06, K: 2.03, Ca: 1.76, Ti: 1.60,
  V: 1.53, Cr: 1.39, Mn: 1.39, Fe: 1.32, Co: 1.26, Ni: 1.24, Cu: 1.32,
  Zn: 1.22, Br: 1.20, I: 1.39, Ag: 1.45, Au: 1.36,
};

// Bond order lookup
const BOND_ORDERS: Record<string, Record<string, number>> = {
  C: { C: 1, O: 2, N: 2, H: 1, S: 2, Cl: 1, F: 1, Br: 1, I: 1 },
  O: { O: 2, C: 2, N: 2, H: 1, S: 2, P: 2 },
  N: { N: 3, C: 2, O: 2, H: 1 },
  S: { S: 2, C: 2, O: 2, H: 1 },
  P: { O: 2, H: 1 },
};

function getBondOrder(s1: string, s2: string): number {
  return BOND_ORDERS[s1]?.[s2] || BOND_ORDERS[s2]?.[s1] || 1;
}

// Load 3Dmol.js from CDN once
let scriptLoaded = false;
let scriptPromise: Promise<void> | null = null;

function load3Dmol(): Promise<void> {
  if (scriptLoaded && (window as any).$3Dmol) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if ((window as any).$3Dmol) { scriptLoaded = true; resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://3Dmol.org/build/3Dmol-min.js";
    script.onload = () => { scriptLoaded = true; resolve(); };
    script.onerror = () => reject(new Error("Failed to load 3Dmol.js"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Build a molecular formula string from elements array.
 * E.g. [{symbol:"C",count:6},{symbol:"H",count:6}] → "C6H6"
 */
function buildFormula(elements: MoleculeElement[]): string {
  return elements
    .map((el) => el.symbol + (el.count > 1 ? el.count : ""))
    .join("");
}

interface AtomPos { symbol: string; x: number; y: number; z: number }
interface BondInfo { from: number; to: number; order: number }

/**
 * Generate a FALLBACK SDF when PubChem doesn't have the structure.
 * Uses golden spiral positioning with connectivity-guaranteed bonding.
 */
function generateFallbackSDF(elements: MoleculeElement[]): string {
  const atoms: AtomPos[] = [];
  const bonds: BondInfo[] = [];
  const totalAtoms = elements.reduce((s, e) => s + e.count, 0);
  if (totalAtoms === 0) return "";

  // Position atoms
  let idx = 0;
  for (const el of elements) {
    const cr = COVALENT_RADII[el.symbol] || 1.0;
    for (let i = 0; i < el.count; i++) {
      if (totalAtoms === 1) {
        atoms.push({ symbol: el.symbol, x: 0, y: 0, z: 0 });
      } else if (totalAtoms === 2) {
        atoms.push({ symbol: el.symbol, x: idx === 0 ? -cr : cr, y: 0, z: 0 });
      } else {
        const phi = Math.acos(1 - (2 * (idx + 0.5)) / totalAtoms);
        const theta = Math.PI * (1 + Math.sqrt(5)) * idx;
        const r = 0.9 + cr * 0.5 + Math.sqrt(totalAtoms) * 0.25;
        atoms.push({
          symbol: el.symbol,
          x: r * Math.sin(phi) * Math.cos(theta),
          y: r * Math.sin(phi) * Math.sin(theta),
          z: r * Math.cos(phi),
        });
      }
      idx++;
    }
  }

  // Connectivity-guaranteed bonding
  const bondSet = new Set<string>();
  function addBond(i: number, j: number) {
    const key = i < j ? `${i}-${j}` : `${j}-${i}`;
    if (bondSet.has(key)) return;
    bondSet.add(key);
    bonds.push({ from: i + 1, to: j + 1, order: getBondOrder(atoms[i].symbol, atoms[j].symbol) });
  }
  function dist(a: AtomPos, b: AtomPos) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
  }

  // Pass 1: nearest neighbor
  for (let i = 0; i < atoms.length; i++) {
    let nj = -1, nd = Infinity;
    for (let j = 0; j < atoms.length; j++) {
      if (i === j) continue;
      const d = dist(atoms[i], atoms[j]);
      if (d < nd) { nd = d; nj = j; }
    }
    if (nj >= 0) addBond(i, nj);
  }
  // Pass 2: close pairs
  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const ri = COVALENT_RADII[atoms[i].symbol] || 1.0;
      const rj = COVALENT_RADII[atoms[j].symbol] || 1.0;
      if (dist(atoms[i], atoms[j]) < (ri + rj) * 1.5 + 0.8) addBond(i, j);
    }
  }

  // Build SDF
  const lines: string[] = [];
  lines.push("FallbackStructure");
  lines.push("  QuantumMD   3D");
  lines.push("Generated locally (PubChem unavailable)");
  lines.push(`${String(atoms.length).padStart(3)}${String(bonds.length).padStart(3)}  0  0  0  0  0  0  0  0999 V2000`);
  for (const a of atoms) {
    lines.push(`${a.x.toFixed(4).padStart(10)}${a.y.toFixed(4).padStart(10)}${a.z.toFixed(4).padStart(10)} ${a.symbol.padEnd(3)} 0  0  0  0  0  0  0  0  0  0  0  0`);
  }
  for (const b of bonds) {
    lines.push(`${String(b.from).padStart(3)}${String(b.to).padStart(3)}${String(b.order).padStart(3)}  0  0  0  0`);
  }
  lines.push("M  END");
  lines.push("$$$$");
  return lines.join("\n");
}

function getTotalAtoms(elements: MoleculeElement[]): number {
  return elements.reduce((sum, el) => sum + el.count, 0);
}

interface Molecule3DViewerProps {
  elements: MoleculeElement[];
}

export function Molecule3DViewer({ elements }: Molecule3DViewerProps) {
  const totalAtoms = getTotalAtoms(elements);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [structureSource, setStructureSource] = useState<"pubchem" | "generated" | "loading" | "idle">("idle");
  const [bondCount, setBondCount] = useState(0);

  const formula = useMemo(() => buildFormula(elements), [elements]);
  const fallbackSDF = useMemo(() => generateFallbackSDF(elements), [elements]);

  const initViewer = useCallback(async () => {
    if (!containerRef.current || totalAtoms === 0) {
      setStructureSource("idle");
      return;
    }

    try {
      await load3Dmol();
    } catch {
      console.error("Could not load 3Dmol.js");
      return;
    }

    const $3Dmol = (window as any).$3Dmol;
    if (!$3Dmol) return;

    // Clear previous
    if (viewerRef.current) {
      try { viewerRef.current.clear(); } catch { }
    }
    containerRef.current.innerHTML = "";

    // Create viewer
    const viewer = $3Dmol.createViewer(containerRef.current, {
      backgroundColor: "0x0f172a",
      antialias: true,
    });
    viewerRef.current = viewer;

    // Try fetching from PubChem first
    setStructureSource("loading");
    let sdfToUse = fallbackSDF;
    let source: "pubchem" | "generated" = "generated";

    try {
      const resp = await fetch(
        `http://localhost:5000/api/molecule/pubchem-structure?formula=${encodeURIComponent(formula)}`,
        { signal: AbortSignal.timeout(12000) }
      );
      if (resp.ok) {
        const data = await resp.json();
        if (data.sdf && data.source === "pubchem") {
          sdfToUse = data.sdf;
          source = "pubchem";
        }
      }
    } catch {
      // PubChem unavailable — use fallback
    }

    setStructureSource(source);

    // Load the SDF
    const model = viewer.addModel(sdfToUse, "sdf");

    // Style: ball-and-stick
    viewer.setStyle({}, {
      stick: { radius: 0.15, colorscheme: "Jmol" },
      sphere: { scale: 0.3, colorscheme: "Jmol" },
    });

    // Add labels
    const modelAtoms = model.atoms || [];
    for (let i = 0; i < modelAtoms.length; i++) {
      const atom = modelAtoms[i];
      if (atom) {
        const sym = atom.elem || "?";
        const hexColor = ELEMENT_COLORS[sym] || "#808080";
        viewer.addLabel(sym, {
          position: { x: atom.x, y: atom.y, z: atom.z },
          fontSize: 11,
          fontColor: "white",
          fontOpacity: 0.9,
          backgroundColor: "0x1e293b",
          backgroundOpacity: 0.7,
          borderColor: hexColor,
          borderThickness: 1,
          showBackground: true,
          alignment: "center",
          inFront: true,
        });
      }
    }

    // Count bonds
    const totalBonds = modelAtoms.reduce((c: number, a: any) =>
      c + (a.bonds ? a.bonds.length : 0), 0);
    setBondCount(Math.floor(totalBonds / 2));

    viewer.zoomTo();
    viewer.spin("y", 1);
    viewer.render();
  }, [formula, fallbackSDF, totalAtoms]);

  useEffect(() => {
    initViewer();
    return () => {
      if (viewerRef.current) {
        try { viewerRef.current.clear(); } catch { }
        viewerRef.current = null;
      }
    };
  }, [initViewer]);

  return (
    <div
      className="relative h-full w-full min-h-[300px] rounded-xl overflow-hidden border border-border"
      style={{ background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)" }}
    >
      {totalAtoms === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
              <svg className="w-8 h-8 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3" />
                <circle cx="5" cy="8" r="2" />
                <circle cx="19" cy="8" r="2" />
                <circle cx="5" cy="16" r="2" />
                <circle cx="19" cy="16" r="2" />
                <line x1="9" y1="10" x2="7" y2="9" />
                <line x1="15" y1="10" x2="17" y2="9" />
                <line x1="9" y1="14" x2="7" y2="15" />
                <line x1="15" y1="14" x2="17" y2="15" />
              </svg>
            </div>
            <p className="text-sm font-medium">3D Molecule View</p>
            <p className="text-xs mt-1">Add elements to visualize</p>
          </div>
        </div>
      ) : (
        <>
          <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

          {/* Source badge */}
          {structureSource === "loading" && (
            <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border">
              <p className="text-xs text-muted-foreground animate-pulse">
                ⏳ Fetching from PubChem...
              </p>
            </div>
          )}
          {structureSource === "pubchem" && (
            <div className="absolute top-3 right-3 bg-emerald-500/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-emerald-500/30">
              <p className="text-xs text-emerald-400 font-medium">
                ✓ PubChem 3D Structure
              </p>
              <p className="text-[10px] text-emerald-400/60 mt-0.5">
                Real molecular geometry
              </p>
            </div>
          )}
          {structureSource === "generated" && (
            <div className="absolute top-3 right-3 bg-amber-500/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-amber-500/30">
              <p className="text-xs text-amber-400 font-medium">
                ⚠ Approximate Structure
              </p>
              <p className="text-[10px] text-amber-400/60 mt-0.5">
                Not found in PubChem
              </p>
            </div>
          )}

          {/* Bottom bar */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-xs text-muted-foreground bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
            <span className="flex items-center gap-1.5">
              <span>🧪</span>
              <span>{formula}</span>
              <span>•</span>
              <span>{totalAtoms} atom{totalAtoms !== 1 ? "s" : ""}</span>
              {bondCount > 0 && (
                <>
                  <span>•</span>
                  <span>{bondCount} bonds</span>
                </>
              )}
            </span>
            <span className="opacity-60">Drag to rotate • Scroll to zoom</span>
          </div>
        </>
      )}
    </div>
  );
}
