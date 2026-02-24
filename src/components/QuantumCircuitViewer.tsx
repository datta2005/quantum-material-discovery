import { useMemo } from "react";

/**
 * QuantumCircuitViewer — SVG-based quantum circuit renderer.
 *
 * Renders qubit wire lines and gate blocks from an array of gate descriptors
 * returned by the VQE service:
 *   { gate: "ry", qubits: [0], params: [1.234] }
 *   { gate: "cx", qubits: [0, 1] }
 *   { gate: "measure", qubits: [0] }
 */

interface GateInfo {
    gate: string;
    qubits: number[];
    params?: number[];
}

interface QuantumCircuitViewerProps {
    gates: GateInfo[];
    nQubits: number;
    className?: string;
}

const GATE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    h: { bg: "#3b82f6", border: "#2563eb", text: "#fff" },
    x: { bg: "#ef4444", border: "#dc2626", text: "#fff" },
    y: { bg: "#f59e0b", border: "#d97706", text: "#fff" },
    z: { bg: "#10b981", border: "#059669", text: "#fff" },
    ry: { bg: "#6366f1", border: "#4f46e5", text: "#fff" },
    rz: { bg: "#8b5cf6", border: "#7c3aed", text: "#fff" },
    rx: { bg: "#06b6d4", border: "#0891b2", text: "#fff" },
    cx: { bg: "#a855f7", border: "#9333ea", text: "#fff" },
    measure: { bg: "#22c55e", border: "#16a34a", text: "#fff" },
};

const DEFAULT_GATE_COLOR = { bg: "#64748b", border: "#475569", text: "#fff" };

// Layout constants
const WIRE_Y_START = 40;
const WIRE_SPACING = 44;
const GATE_WIDTH = 36;
const GATE_HEIGHT = 28;
const GATE_X_START = 60;
const GATE_X_SPACING = 48;
const LABEL_X = 10;

export function QuantumCircuitViewer({ gates, nQubits, className }: QuantumCircuitViewerProps) {
    // Assign each gate a column (simple greedy: advance per qubit usage)
    const layout = useMemo(() => {
        const qubitCol = Array(nQubits).fill(0); // next available column per qubit
        const placed: { gate: GateInfo; col: number; row: number }[] = [];

        for (const g of gates) {
            const affectedQubits = g.qubits;
            const col = Math.max(...affectedQubits.map((q) => qubitCol[q] ?? 0));

            if (g.gate === "cx" && affectedQubits.length === 2) {
                // CNOT: control dot + target cross
                placed.push({ gate: g, col, row: affectedQubits[0] });
            } else {
                for (const q of affectedQubits) {
                    placed.push({ gate: { ...g, qubits: [q] }, col, row: q });
                }
            }
            for (const q of affectedQubits) {
                qubitCol[q] = col + 1;
            }
        }

        const totalCols = Math.max(...qubitCol, 1);
        return { placed, totalCols };
    }, [gates, nQubits]);

    const svgWidth = GATE_X_START + layout.totalCols * GATE_X_SPACING + 30;
    const svgHeight = WIRE_Y_START + nQubits * WIRE_SPACING + 10;

    return (
        <div className={`overflow-x-auto rounded-lg border border-border/50 bg-muted/20 ${className ?? ""}`}>
            <svg
                width={Math.max(svgWidth, 300)}
                height={svgHeight}
                viewBox={`0 0 ${Math.max(svgWidth, 300)} ${svgHeight}`}
                className="font-mono"
            >
                {/* Qubit labels + wires */}
                {Array.from({ length: nQubits }).map((_, i) => {
                    const y = WIRE_Y_START + i * WIRE_SPACING;
                    return (
                        <g key={`wire-${i}`}>
                            {/* Wire line */}
                            <line
                                x1={GATE_X_START - 10}
                                y1={y}
                                x2={svgWidth - 10}
                                y2={y}
                                stroke="currentColor"
                                strokeOpacity={0.25}
                                strokeWidth={1.5}
                            />
                            {/* Label */}
                            <text
                                x={LABEL_X}
                                y={y + 4}
                                fill="currentColor"
                                fillOpacity={0.6}
                                fontSize={11}
                                fontFamily="monospace"
                            >
                                q[{i}]
                            </text>
                        </g>
                    );
                })}

                {/* Gates */}
                {layout.placed.map((p, idx) => {
                    const x = GATE_X_START + p.col * GATE_X_SPACING;
                    const y = WIRE_Y_START + p.row * WIRE_SPACING;
                    const g = p.gate;
                    const colors = GATE_COLORS[g.gate] || DEFAULT_GATE_COLOR;

                    // Special rendering for CNOT
                    if (g.gate === "cx" && g.qubits.length === 2) {
                        const controlY = WIRE_Y_START + g.qubits[0] * WIRE_SPACING;
                        const targetY = WIRE_Y_START + g.qubits[1] * WIRE_SPACING;
                        return (
                            <g key={`gate-${idx}`}>
                                {/* Vertical line connecting control and target */}
                                <line
                                    x1={x + GATE_WIDTH / 2}
                                    y1={controlY}
                                    x2={x + GATE_WIDTH / 2}
                                    y2={targetY}
                                    stroke={colors.border}
                                    strokeWidth={2}
                                />
                                {/* Control dot */}
                                <circle
                                    cx={x + GATE_WIDTH / 2}
                                    cy={controlY}
                                    r={5}
                                    fill={colors.bg}
                                    stroke={colors.border}
                                    strokeWidth={1.5}
                                />
                                {/* Target circle with ⊕ */}
                                <circle
                                    cx={x + GATE_WIDTH / 2}
                                    cy={targetY}
                                    r={10}
                                    fill="none"
                                    stroke={colors.border}
                                    strokeWidth={2}
                                />
                                <line
                                    x1={x + GATE_WIDTH / 2 - 7}
                                    y1={targetY}
                                    x2={x + GATE_WIDTH / 2 + 7}
                                    y2={targetY}
                                    stroke={colors.border}
                                    strokeWidth={1.5}
                                />
                                <line
                                    x1={x + GATE_WIDTH / 2}
                                    y1={targetY - 7}
                                    x2={x + GATE_WIDTH / 2}
                                    y2={targetY + 7}
                                    stroke={colors.border}
                                    strokeWidth={1.5}
                                />
                            </g>
                        );
                    }

                    // Measurement gate — special icon
                    if (g.gate === "measure") {
                        return (
                            <g key={`gate-${idx}`}>
                                <rect
                                    x={x}
                                    y={y - GATE_HEIGHT / 2}
                                    width={GATE_WIDTH}
                                    height={GATE_HEIGHT}
                                    rx={4}
                                    fill={colors.bg}
                                    stroke={colors.border}
                                    strokeWidth={1.5}
                                    opacity={0.9}
                                />
                                {/* Meter arc */}
                                <path
                                    d={`M ${x + 8} ${y + 6} A 10 10 0 0 1 ${x + GATE_WIDTH - 8} ${y + 6}`}
                                    fill="none"
                                    stroke={colors.text}
                                    strokeWidth={1.5}
                                />
                                {/* Needle */}
                                <line
                                    x1={x + GATE_WIDTH / 2}
                                    y1={y + 6}
                                    x2={x + GATE_WIDTH / 2 + 6}
                                    y2={y - 6}
                                    stroke={colors.text}
                                    strokeWidth={1.5}
                                />
                            </g>
                        );
                    }

                    // Standard gate box
                    const label = g.gate.toUpperCase();
                    return (
                        <g key={`gate-${idx}`}>
                            <rect
                                x={x}
                                y={y - GATE_HEIGHT / 2}
                                width={GATE_WIDTH}
                                height={GATE_HEIGHT}
                                rx={4}
                                fill={colors.bg}
                                stroke={colors.border}
                                strokeWidth={1.5}
                                opacity={0.9}
                            />
                            <text
                                x={x + GATE_WIDTH / 2}
                                y={y + 4}
                                fill={colors.text}
                                fontSize={label.length > 2 ? 9 : 11}
                                fontWeight="bold"
                                textAnchor="middle"
                                fontFamily="monospace"
                            >
                                {label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
