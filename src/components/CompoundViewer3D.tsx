/**
 * CompoundViewer3D — Clean 2D/3D compound structure viewer.
 *
 * Default: 2D ball-and-stick diagram on a HTML Canvas (always correct).
 * Optional: 3D via 3Dmol.js toggle (no unit cell box, no axes).
 */
import { useEffect, useRef, useCallback, useState } from "react";

interface Atom {
    id: number;
    symbol: string;
    x: number;
    y: number;
    z: number;
    radius: number;
    color: string;
}

interface Bond {
    from: number;
    to: number;
}

interface LatticeInfo {
    a?: number;
    b?: number;
    c?: number;
    alpha?: number;
    beta?: number;
    gamma?: number;
    volume?: number;
    crystal_system?: string;
    symmetry_confidence?: number;
    prototype_tag?: string;
}

interface CompoundStructure {
    atoms: Atom[];
    bonds: Bond[];
    total_atoms: number;
    cif_data?: string | null;
    lattice?: LatticeInfo;
}

interface CompoundViewer3DProps {
    structure: CompoundStructure;
    height?: string;
    showLabels?: boolean;
    className?: string;
    compoundName?: string;
}

// ─── CPK-style element colors ───
const ELEMENT_COLORS: Record<string, string> = {
    H: "#FFFFFF", He: "#D9FFFF", Li: "#CC80FF", Be: "#C2FF00",
    B: "#FFB5B5", C: "#909090", N: "#3050F8", O: "#FF0D0D",
    F: "#90E050", Ne: "#B3E3F5", Na: "#AB5CF2", Mg: "#8AFF00",
    Al: "#BFA6A6", Si: "#F0C8A0", P: "#FF8000", S: "#FFFF30",
    Cl: "#1FF01F", Ar: "#80D1E3", K: "#8F40D4", Ca: "#3DFF00",
    Ti: "#BFC2C7", V: "#A6A6AB", Cr: "#8A99C7", Mn: "#9C7AC7",
    Fe: "#E06633", Co: "#F090A0", Ni: "#50D050", Cu: "#C88033",
    Zn: "#7D80B0", Ga: "#C28F8F", Ge: "#668F8F", As: "#BD80E3",
    Se: "#FFA100", Br: "#A62929", Zr: "#94E0E0", Nb: "#73C2C9",
    Mo: "#54B5B5", Ru: "#248F8F", Rh: "#0A7D8C", Pd: "#006985",
    Ag: "#C0C0C0", Cd: "#FFD98F", In: "#A67573", Sn: "#668080",
    Sb: "#9E63B5", Te: "#D47A00", I: "#940094", Ba: "#00C900",
    La: "#70D4FF", Ce: "#FFFFC7", W: "#2194D6", Pt: "#D0D0E0",
    Au: "#FFD123", Pb: "#575961", Bi: "#9E4FB5", default: "#A0A0A0",
};

function getColor(symbol: string): string {
    return ELEMENT_COLORS[symbol] || ELEMENT_COLORS.default;
}

// ─── Element radius for 2D rendering ───
const ELEMENT_RADIUS: Record<string, number> = {
    H: 0.31, He: 0.28, Li: 1.28, Be: 0.96, B: 0.84, C: 0.76,
    N: 0.71, O: 0.66, F: 0.57, Na: 1.66, Mg: 1.41, Al: 1.21,
    Si: 1.11, P: 1.07, S: 1.05, Cl: 1.02, K: 2.03, Ca: 1.76,
    Ti: 1.60, V: 1.53, Cr: 1.39, Mn: 1.39, Fe: 1.32, Co: 1.26,
    Ni: 1.24, Cu: 1.32, Zn: 1.22, Ga: 1.22, Ge: 1.20, As: 1.19,
    Se: 1.20, Br: 1.20, Zr: 1.75, Nb: 1.64, Mo: 1.54, Ag: 1.45,
    Cd: 1.44, In: 1.42, Sn: 1.39, Sb: 1.39, Te: 1.38, I: 1.39,
    Ba: 2.15, La: 2.07, Ce: 2.04, W: 1.62, Pt: 1.36, Au: 1.36,
    Pb: 1.46, Bi: 1.48, default: 1.20,
};

function getRadius(symbol: string): number {
    return ELEMENT_RADIUS[symbol] || ELEMENT_RADIUS.default;
}

// ─── Project 3D → 2D using simple perspective ───
function project(
    atom: Atom,
    centerX: number,
    centerY: number,
    centerZ: number,
    scale: number,
    rotY: number,
    canvasW: number,
    canvasH: number
) {
    // Translate to center
    let x = atom.x - centerX;
    let y = atom.y - centerY;
    let z = atom.z - centerZ;

    // Rotate around Y axis
    const cos = Math.cos(rotY);
    const sin = Math.sin(rotY);
    const rx = x * cos - z * sin;
    const rz = x * sin + z * cos;

    // Simple perspective
    const depth = 5;
    const perspFactor = depth / (depth + rz * 0.2);

    return {
        px: canvasW / 2 + rx * scale * perspFactor,
        py: canvasH / 2 - y * scale * perspFactor,
        depth: rz,
        perspFactor,
    };
}

// ─── 2D Canvas Renderer ───
function render2D(
    canvas: HTMLCanvasElement,
    structure: CompoundStructure,
    rotation: number,
    showLabels: boolean
) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    // Clear with dark gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#0a0f1e");
    bgGrad.addColorStop(0.5, "#111827");
    bgGrad.addColorStop(1, "#0d1117");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    if (structure.atoms.length === 0) return;

    // Compute center of mass
    let cx = 0, cy = 0, cz = 0;
    for (const a of structure.atoms) {
        cx += a.x; cy += a.y; cz += a.z;
    }
    cx /= structure.atoms.length;
    cy /= structure.atoms.length;
    cz /= structure.atoms.length;

    // Compute scale to fit
    let maxDist = 1;
    for (const a of structure.atoms) {
        const d = Math.sqrt(
            (a.x - cx) ** 2 + (a.y - cy) ** 2 + (a.z - cz) ** 2
        );
        maxDist = Math.max(maxDist, d);
    }
    const padding = 80 * dpr;
    const scale = (Math.min(W, H) / 2 - padding) / maxDist;

    // Project all atoms
    const projected = structure.atoms.map((atom) => ({
        atom,
        ...project(atom, cx, cy, cz, scale, rotation, W, H),
    }));

    // Sort by depth (far first for painter's algorithm)
    projected.sort((a, b) => a.depth - b.depth);

    // Draw bonds first
    ctx.lineCap = "round";
    for (const bond of structure.bonds) {
        const a1 = projected.find((p) => p.atom.id === bond.from);
        const a2 = projected.find((p) => p.atom.id === bond.to);
        if (!a1 || !a2) continue;

        const avgDepth = (a1.depth + a2.depth) / 2;
        const alpha = Math.max(0.3, Math.min(1, 0.7 + avgDepth * 0.05));

        // Gradient bond
        const grad = ctx.createLinearGradient(a1.px, a1.py, a2.px, a2.py);
        const c1 = getColor(a1.atom.symbol);
        const c2 = getColor(a2.atom.symbol);
        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2);

        ctx.strokeStyle = grad;
        ctx.globalAlpha = alpha * 0.8;
        ctx.lineWidth = Math.max(2, 3.5 * dpr * a1.perspFactor);
        ctx.beginPath();
        ctx.moveTo(a1.px, a1.py);
        ctx.lineTo(a2.px, a2.py);
        ctx.stroke();
    }

    ctx.globalAlpha = 1;

    // Draw atoms (sorted back-to-front)
    for (const { atom, px, py, perspFactor, depth } of projected) {
        const baseR = getRadius(atom.symbol);
        const r = Math.max(8 * dpr, baseR * scale * 0.28 * perspFactor);
        const color = getColor(atom.symbol);

        // Depth-based dimming
        const brightFactor = Math.max(0.5, Math.min(1, 0.8 + depth * 0.03));

        // Draw glow
        const glow = ctx.createRadialGradient(px, py, r * 0.2, px, py, r * 2.5);
        glow.addColorStop(0, color + "40");
        glow.addColorStop(1, color + "00");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, r * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw sphere with 3D gradient
        const sphereGrad = ctx.createRadialGradient(
            px - r * 0.3, py - r * 0.3, r * 0.1,
            px, py, r
        );
        sphereGrad.addColorStop(0, lightenColor(color, 60));
        sphereGrad.addColorStop(0.5, color);
        sphereGrad.addColorStop(1, darkenColor(color, 40));

        ctx.globalAlpha = brightFactor;
        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();

        // Rim highlight
        ctx.strokeStyle = lightenColor(color, 30) + "60";
        ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.stroke();

        // Element label
        if (showLabels) {
            ctx.globalAlpha = 1;
            const fontSize = Math.max(10, Math.min(14, r * 0.85)) * dpr;
            ctx.font = `bold ${fontSize / dpr}px "Inter", "SF Pro", system-ui, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Shadow for contrast
            ctx.fillStyle = "#000000";
            ctx.globalAlpha = 0.6;
            ctx.fillText(atom.symbol, px + 1, py + 1);

            // White label
            ctx.fillStyle = "#FFFFFF";
            ctx.globalAlpha = 0.95;
            ctx.fillText(atom.symbol, px, py);
        }
    }

    ctx.globalAlpha = 1;
}

// ─── Color helpers ───
function lightenColor(hex: string, amount: number): string {
    const h = hex.replace("#", "");
    const r = Math.min(255, parseInt(h.substring(0, 2), 16) + amount);
    const g = Math.min(255, parseInt(h.substring(2, 4), 16) + amount);
    const b = Math.min(255, parseInt(h.substring(4, 6), 16) + amount);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function darkenColor(hex: string, amount: number): string {
    const h = hex.replace("#", "");
    const r = Math.max(0, parseInt(h.substring(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(h.substring(2, 4), 16) - amount);
    const b = Math.max(0, parseInt(h.substring(4, 6), 16) - amount);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ─── Load 3Dmol.js from CDN ───
let scriptLoaded = false;
let scriptPromise: Promise<void> | null = null;

function load3Dmol(): Promise<void> {
    if (scriptLoaded && (window as any).$3Dmol) return Promise.resolve();
    if (scriptPromise) return scriptPromise;

    scriptPromise = new Promise((resolve, reject) => {
        if ((window as any).$3Dmol) {
            scriptLoaded = true;
            resolve();
            return;
        }
        const script = document.createElement("script");
        script.src = "https://3Dmol.org/build/3Dmol-min.js";
        script.onload = () => {
            scriptLoaded = true;
            resolve();
        };
        script.onerror = () => reject(new Error("Failed to load 3Dmol.js"));
        document.head.appendChild(script);
    });

    return scriptPromise;
}

function structureToSDF(structure: CompoundStructure): string {
    const { atoms, bonds } = structure;
    const lines: string[] = [];

    lines.push("CompoundViewer");
    lines.push("  QuantumMD   3D");
    lines.push("Generated by QuantumMaterialDiscovery");

    const nAtoms = String(atoms.length).padStart(3);
    const nBonds = String(bonds.length).padStart(3);
    lines.push(`${nAtoms}${nBonds}  0  0  0  0  0  0  0  0999 V2000`);

    for (const atom of atoms) {
        const x = atom.x.toFixed(4).padStart(10);
        const y = atom.y.toFixed(4).padStart(10);
        const z = atom.z.toFixed(4).padStart(10);
        const sym = ` ${atom.symbol.padEnd(3)}`;
        lines.push(`${x}${y}${z}${sym} 0  0  0  0  0  0  0  0  0  0  0  0`);
    }

    for (const bond of bonds) {
        const a1 = String(bond.from + 1).padStart(3);
        const a2 = String(bond.to + 1).padStart(3);
        const bo = "  1";
        lines.push(`${a1}${a2}${bo}  0  0  0  0`);
    }

    lines.push("M  END");
    lines.push("$$$$");
    return lines.join("\n");
}

// ─── Main Component ───
export function CompoundViewer3D({
    structure,
    height = "320px",
    showLabels = true,
    className = "",
    compoundName,
}: CompoundViewer3DProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<any>(null);
    const animRef = useRef<number>(0);
    const [mode, setMode] = useState<"2d" | "3d">("2d");
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [showUnitCell, setShowUnitCell] = useState(true);
    const [supercellScale, setSupercellScale] = useState(1);
    const [showDiffusion, setShowDiffusion] = useState(false);
    const lastMouseX = useRef(0);

    // ─── 2D Canvas Rendering with auto-rotation ───
    useEffect(() => {
        if (mode !== "2d" || !canvasRef.current || !structure || structure.atoms.length === 0) return;

        const canvas = canvasRef.current;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        let rot = rotation;
        let running = true;

        function frame() {
            if (!running || !canvas) return;
            if (!isDragging) {
                rot += 0.005;
                setRotation(rot);
            }
            render2D(canvas, structure, rot, showLabels);
            animRef.current = requestAnimationFrame(frame);
        }

        frame();

        return () => {
            running = false;
            cancelAnimationFrame(animRef.current);
        };
    }, [mode, structure, showLabels, isDragging]);

    // ─── Mouse drag for 2D rotation ───
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (mode !== "2d") return;
        setIsDragging(true);
        lastMouseX.current = e.clientX;
    }, [mode]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (mode !== "2d" || !isDragging) return;
        const dx = e.clientX - lastMouseX.current;
        lastMouseX.current = e.clientX;
        setRotation((r) => r + dx * 0.01);
    }, [mode, isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // ─── 3D Viewer Init (when toggled to 3d) ───
    useEffect(() => {
        if (mode !== "3d" || !containerRef.current || !structure || structure.atoms.length === 0) return;

        let mounted = true;

        (async () => {
            try {
                await load3Dmol();
            } catch {
                console.error("Could not load 3Dmol.js");
                return;
            }

            if (!mounted || !containerRef.current) return;

            const $3Dmol = (window as any).$3Dmol;
            if (!$3Dmol) return;

            if (viewerRef.current) {
                try { viewerRef.current.clear(); } catch { }
            }
            containerRef.current.innerHTML = "";

            const viewer = $3Dmol.createViewer(containerRef.current, {
                backgroundColor: "0x0a0f1e",
                antialias: true,
            });
            viewerRef.current = viewer;

            // Use CIF if available for periodic crystal rendering, else fallback to SDF
            if (structure.cif_data) {
                viewer.addModel(structure.cif_data, "cif", { supercell: [supercellScale, supercellScale, supercellScale] });
                if (showUnitCell) {
                    viewer.addUnitCell(viewer.getModel());
                }
            } else {
                const sdf = structureToSDF(structure);
                viewer.addModel(sdf, "sdf");
            }

            // Ball-and-stick style — NO unit cell, NO axes
            viewer.setStyle({}, {
                stick: { radius: 0.18, colorscheme: "Jmol" },
                sphere: { scale: 0.45, colorscheme: "Jmol" },
            });

            const mobileIons = ["Li", "Na", "Mg", "Zn", "Al"];
            
            // First apply global defaults to clear previous specific styles
            viewer.setStyle({}, {
                stick: { radius: showDiffusion ? 0.05 : 0.18, colorscheme: "Jmol", opacity: showDiffusion ? 0.3 : 1.0 },
                sphere: { scale: showDiffusion ? 0.15 : 0.45, colorscheme: "Jmol", opacity: showDiffusion ? 0.3 : 1.0 },
            });

            structure.atoms.forEach((atom) => {
                if (atom.color) {
                    const hexColor = parseInt(atom.color.replace("#", "0x"), 16);
                    if (showDiffusion) {
                        const isMobile = mobileIons.includes(atom.symbol);
                        viewer.setStyle({ elem: atom.symbol }, {
                            stick: { radius: isMobile ? 0.3 : 0.05, color: hexColor, opacity: isMobile ? 1.0 : 0.3 },
                            sphere: { scale: isMobile ? 0.6 : 0.15, color: hexColor, opacity: isMobile ? 1.0 : 0.3 },
                        });
                    } else {
                        viewer.setStyle({ elem: atom.symbol }, {
                            stick: { radius: 0.18, color: hexColor },
                            sphere: { scale: 0.45, color: hexColor },
                        });
                    }
                }
            });

            viewer.zoomTo();
            viewer.zoom(0.85);
            viewer.spin("y", 0.6);
            viewer.render();
        })();

        return () => {
            mounted = false;
            if (viewerRef.current) {
                try { viewerRef.current.clear(); } catch { }
                viewerRef.current = null;
            }
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
        };
    }, [mode, structure, showUnitCell, supercellScale, showDiffusion]);

    if (!structure || structure.atoms.length === 0) {
        return (
            <div
                className={`flex items-center justify-center bg-muted/20 rounded-lg border border-border/50 ${className}`}
                style={{ height }}
            >
                <p className="text-sm text-muted-foreground">No structure data</p>
            </div>
        );
    }

    const lattice = structure.lattice;
    const uniqueElements = [...new Set(structure.atoms.map((a) => a.symbol))];

    return (
        <div
            className={`relative rounded-xl overflow-hidden ${className}`}
            style={{
                height,
                background: "linear-gradient(135deg, #0a0f1e 0%, #111827 40%, #1a1f2e 100%)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
        >
            {/* 2D Canvas */}
            {mode === "2d" && (
                <canvas
                    ref={canvasRef}
                    style={{ width: "100%", height: "100%", cursor: isDragging ? "grabbing" : "grab" }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
            )}

            {/* 3D Viewer container */}
            {mode === "3d" && (
                <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
            )}

            {/* 2D/3D toggle — top left */}
            <div className="absolute top-2 left-2 flex gap-1 bg-black/60 backdrop-blur-sm rounded-lg p-1 border border-white/10">
                <button
                    onClick={() => setMode("2d")}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${mode === "2d"
                        ? "bg-indigo-500/80 text-white shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-white/10"
                        }`}
                >
                    2D View
                </button>
                <button
                    onClick={() => setMode("3d")}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${mode === "3d"
                        ? "bg-indigo-500/80 text-white shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-white/10"
                        }`}
                >
                    3D View
                </button>
                {mode === "3d" && structure.cif_data && (
                    <>
                        <div className="w-px h-auto bg-white/20 mx-1"></div>
                        <button
                            onClick={() => setShowUnitCell(!showUnitCell)}
                            className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                                showUnitCell ? "bg-emerald-500/80 text-white shadow-sm" : "text-slate-400 hover:text-white"
                            }`}
                        >
                            Box
                        </button>
                        <button
                            onClick={() => setShowDiffusion(!showDiffusion)}
                            className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                                showDiffusion ? "bg-cyan-500/80 text-white shadow-sm" : "text-slate-400 hover:text-white"
                            }`}
                            title="Highlight Mobile Ion Pathways"
                        >
                            Pathways
                        </button>
                        
                        <div className="flex items-center gap-1.5 ml-2 mr-1 bg-black/40 px-2 py-1 rounded-md border border-white/5">
                            <span className="text-[9px] text-slate-400">Scale:</span>
                            <input
                                type="range"
                                min="1"
                                max="3"
                                step="1"
                                value={supercellScale}
                                onChange={(e) => setSupercellScale(parseInt(e.target.value))}
                                className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-[9px] text-white font-mono">{supercellScale}x</span>
                        </div>
                    </>
                )}
            </div>

            {/* Element legend — top right */}
            <div className="absolute top-2 right-2 flex gap-1.5 flex-wrap justify-end max-w-[200px]">
                {uniqueElements.map((el) => (
                    <span
                        key={el}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-black/60 backdrop-blur-sm border border-white/10"
                    >
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getColor(el) }}
                        />
                        <span className="text-white/80">{el}</span>
                    </span>
                ))}
            </div>

            {/* Compound info — bottom left */}
            <div className="absolute bottom-2 left-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 flex items-center gap-3 pointer-events-none">
                <span className="text-[10px] text-cyan-400 font-mono font-bold">
                    {structure.total_atoms} atoms
                </span>
                <span className="text-[10px] text-slate-500">•</span>
                <span className="text-[10px] text-indigo-400 font-mono">
                    {structure.bonds.length} bonds
                </span>
                {lattice?.crystal_system && (
                    <>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] text-purple-400 font-medium capitalize" title={`Symmetry Confidence: ${lattice.symmetry_confidence ? (lattice.symmetry_confidence * 100).toFixed(0) + '%' : 'N/A'}`}>
                            {lattice.crystal_system} {lattice.symmetry_confidence && lattice.symmetry_confidence > 0.8 && '✨'}
                        </span>
                    </>
                )}
                {(lattice as any)?.dimensionality && (
                    <>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] text-amber-400 font-medium capitalize">
                            {(lattice as any).dimensionality}
                        </span>
                    </>
                )}
                {lattice?.prototype_tag && (
                    <>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] text-sky-400 font-medium capitalize">
                            {lattice.prototype_tag}
                        </span>
                    </>
                )}
                {compoundName && (
                    <>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] text-emerald-400 font-medium">
                            {compoundName}
                        </span>
                    </>
                )}
            </div>

            {/* Controls hint — bottom right */}
            <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-[9px] text-slate-500 pointer-events-none border border-white/5">
                {mode === "2d" ? "Drag to rotate" : "Rotate: drag · Zoom: scroll"}
            </div>
        </div>
    );
}

export default CompoundViewer3D;
