import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, Cylinder, Text, Environment } from "@react-three/drei";
import { useMemo, useState, useCallback } from "react";
import * as THREE from "three";
import type { MoleculeElement } from "./MoleculeConstructionZone";

// Bond legend component
function BondLegend({ bondTypes }: { bondTypes: Set<number> }) {
  if (bondTypes.size === 0) return null;

  const bondInfo = [
    { order: 1, label: "Single", lines: 1 },
    { order: 2, label: "Double", lines: 2 },
    { order: 3, label: "Triple", lines: 3 },
  ];

  const presentBonds = bondInfo.filter(b => bondTypes.has(b.order));

  return (
    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border">
      <p className="text-xs font-semibold text-muted-foreground mb-2">Bond Types</p>
      <div className="space-y-1.5">
        {presentBonds.map(bond => (
          <div key={bond.order} className="flex items-center gap-2">
            <div className="w-8 h-4 flex items-center justify-center gap-0.5">
              {Array.from({ length: bond.lines }).map((_, i) => (
                <div
                  key={i}
                  className="w-full h-0.5 bg-muted-foreground rounded-full"
                  style={{ 
                    height: bond.lines === 1 ? "3px" : "2px",
                    opacity: 0.8 
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{bond.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Element colors based on CPK coloring convention
const ELEMENT_COLORS: Record<string, string> = {
  H: "#FFFFFF",
  C: "#909090",
  N: "#3050F8",
  O: "#FF0D0D",
  F: "#90E050",
  Cl: "#1FF01F",
  Br: "#A62929",
  I: "#940094",
  S: "#FFFF30",
  P: "#FF8000",
  B: "#FFB5B5",
  Si: "#F0C8A0",
  Fe: "#E06633",
  Cu: "#C88033",
  Zn: "#7D80B0",
  Na: "#AB5CF2",
  K: "#8F40D4",
  Ca: "#3DFF00",
  Mg: "#8AFF00",
  Al: "#BFA6A6",
  Ti: "#BFC2C7",
  Li: "#CC80FF",
  He: "#D9FFFF",
  Ne: "#B3E3F5",
  Ar: "#80D1E3",
};

// Element radii (van der Waals radii in relative units)
const ELEMENT_RADII: Record<string, number> = {
  H: 0.25,
  C: 0.4,
  N: 0.38,
  O: 0.35,
  F: 0.32,
  Cl: 0.45,
  Br: 0.5,
  I: 0.55,
  S: 0.5,
  P: 0.48,
  B: 0.42,
  Si: 0.55,
  Fe: 0.55,
  Cu: 0.5,
  Zn: 0.5,
  Na: 0.6,
  K: 0.7,
  Ca: 0.6,
  Mg: 0.55,
  Al: 0.5,
  Ti: 0.55,
  Li: 0.5,
  He: 0.28,
  Ne: 0.3,
  Ar: 0.4,
};

// Bond order determination based on common chemistry rules
const TYPICAL_BOND_ORDERS: Record<string, Record<string, number>> = {
  C: { C: 1, O: 2, N: 2, H: 1, S: 2 },
  O: { O: 2, C: 2, N: 2, H: 1, S: 2 },
  N: { N: 3, C: 2, O: 2, H: 1 },
  S: { S: 2, C: 2, O: 2, H: 1 },
};

function getBondOrder(symbol1: string, symbol2: string): number {
  // Check if we have a predefined bond order
  if (TYPICAL_BOND_ORDERS[symbol1]?.[symbol2]) {
    return TYPICAL_BOND_ORDERS[symbol1][symbol2];
  }
  if (TYPICAL_BOND_ORDERS[symbol2]?.[symbol1]) {
    return TYPICAL_BOND_ORDERS[symbol2][symbol1];
  }
  // Default to single bond
  return 1;
}

interface AtomPosition {
  symbol: string;
  position: [number, number, number];
  color: string;
  radius: number;
}

interface Bond {
  start: [number, number, number];
  end: [number, number, number];
  order: number; // 1 = single, 2 = double, 3 = triple
  startSymbol: string;
  endSymbol: string;
}

function Atom({ position, color, radius, symbol }: AtomPosition) {
  return (
    <group position={position}>
      <Sphere args={[radius, 32, 32]}>
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.4}
          envMapIntensity={0.5}
        />
      </Sphere>
      <Text
        position={[0, radius + 0.15, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {symbol}
      </Text>
    </group>
  );
}

function SingleCylinder({ 
  start, 
  end, 
  offset = [0, 0, 0],
  radius = 0.06 
}: { 
  start: [number, number, number]; 
  end: [number, number, number]; 
  offset?: [number, number, number];
  radius?: number;
}) {
  const { position, rotation, length } = useMemo(() => {
    const startVec = new THREE.Vector3(...start).add(new THREE.Vector3(...offset));
    const endVec = new THREE.Vector3(...end).add(new THREE.Vector3(...offset));
    const midpoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
    const direction = new THREE.Vector3().subVectors(endVec, startVec);
    const length = direction.length();
    
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize()
    );
    const euler = new THREE.Euler().setFromQuaternion(quaternion);
    
    return {
      position: midpoint.toArray() as [number, number, number],
      rotation: [euler.x, euler.y, euler.z] as [number, number, number],
      length,
    };
  }, [start, end, offset]);

  return (
    <Cylinder
      args={[radius, radius, length, 16]}
      position={position}
      rotation={rotation}
    >
      <meshStandardMaterial
        color="#6B7280"
        metalness={0.5}
        roughness={0.3}
      />
    </Cylinder>
  );
}

function BondCylinder({ start, end, order }: Bond) {
  const offsets = useMemo(() => {
    // Calculate perpendicular offset direction for double/triple bonds
    const direction = new THREE.Vector3(
      end[0] - start[0],
      end[1] - start[1],
      end[2] - start[2]
    ).normalize();
    
    // Find a perpendicular vector
    const up = new THREE.Vector3(0, 1, 0);
    let perpendicular = new THREE.Vector3().crossVectors(direction, up);
    if (perpendicular.length() < 0.1) {
      perpendicular = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(1, 0, 0));
    }
    perpendicular.normalize();
    
    // Second perpendicular for triple bonds
    const perpendicular2 = new THREE.Vector3().crossVectors(direction, perpendicular).normalize();
    
    const spacing = 0.12;
    
    if (order === 1) {
      return [[0, 0, 0] as [number, number, number]];
    } else if (order === 2) {
      return [
        [perpendicular.x * spacing, perpendicular.y * spacing, perpendicular.z * spacing] as [number, number, number],
        [-perpendicular.x * spacing, -perpendicular.y * spacing, -perpendicular.z * spacing] as [number, number, number],
      ];
    } else {
      // Triple bond - one in center, two offset
      return [
        [0, 0, 0] as [number, number, number],
        [perpendicular.x * spacing * 1.5, perpendicular.y * spacing * 1.5, perpendicular.z * spacing * 1.5] as [number, number, number],
        [-perpendicular.x * spacing * 1.5, -perpendicular.y * spacing * 1.5, -perpendicular.z * spacing * 1.5] as [number, number, number],
      ];
    }
  }, [start, end, order]);

  const cylinderRadius = order === 1 ? 0.06 : order === 2 ? 0.045 : 0.04;

  return (
    <group>
      {offsets.map((offset, i) => (
        <SingleCylinder
          key={i}
          start={start}
          end={end}
          offset={offset}
          radius={cylinderRadius}
        />
      ))}
    </group>
  );
}

function MoleculeStructure({ elements, onBondTypesChange }: { elements: MoleculeElement[]; onBondTypesChange?: (types: Set<number>) => void }) {
  const { atoms, bonds } = useMemo(() => {
    const atoms: AtomPosition[] = [];
    const bonds: Bond[] = [];
    
    // Generate 3D positions for atoms in a realistic arrangement
    let atomIndex = 0;
    const baseRadius = 1.2;
    
    elements.forEach((element, elementIndex) => {
      const color = ELEMENT_COLORS[element.symbol] || "#808080";
      const radius = ELEMENT_RADII[element.symbol] || 0.35;
      
      for (let i = 0; i < element.count; i++) {
        // Arrange atoms in a spherical pattern
        const phi = Math.acos(-1 + (2 * atomIndex) / Math.max(1, getTotalAtoms(elements) - 1));
        const theta = Math.sqrt(getTotalAtoms(elements) * Math.PI) * phi;
        
        // Add some variation for visual interest
        const r = baseRadius + (elementIndex * 0.3);
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        
        atoms.push({
          symbol: element.symbol,
          position: [x, y, z],
          color,
          radius,
        });
        
        atomIndex++;
      }
    });
    
    // Generate bonds between nearby atoms with bond order
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const dist = Math.sqrt(
          Math.pow(atoms[i].position[0] - atoms[j].position[0], 2) +
          Math.pow(atoms[i].position[1] - atoms[j].position[1], 2) +
          Math.pow(atoms[i].position[2] - atoms[j].position[2], 2)
        );
        
        // Connect atoms that are close enough
        const bondThreshold = atoms[i].radius + atoms[j].radius + 0.8;
        if (dist < bondThreshold && bonds.length < atoms.length * 2) {
          const bondOrder = getBondOrder(atoms[i].symbol, atoms[j].symbol);
          bonds.push({
            start: atoms[i].position,
            end: atoms[j].position,
            order: bondOrder,
            startSymbol: atoms[i].symbol,
            endSymbol: atoms[j].symbol,
          });
        }
      }
    }
    
    return { atoms, bonds };
  }, [elements]);

  // Notify parent of bond types present
  useMemo(() => {
    if (onBondTypesChange) {
      const types = new Set(bonds.map(b => b.order));
      onBondTypesChange(types);
    }
  }, [bonds, onBondTypesChange]);

  if (atoms.length === 0) {
    return null;
  }

  return (
    <group>
      {bonds.map((bond, i) => (
        <BondCylinder key={`bond-${i}`} {...bond} />
      ))}
      {atoms.map((atom, i) => (
        <Atom key={`atom-${i}`} {...atom} />
      ))}
    </group>
  );
}

function getTotalAtoms(elements: MoleculeElement[]): number {
  return elements.reduce((sum, el) => sum + el.count, 0);
}

interface Molecule3DViewerProps {
  elements: MoleculeElement[];
}

export function Molecule3DViewer({ elements }: Molecule3DViewerProps) {
  const totalAtoms = getTotalAtoms(elements);
  const [bondTypes, setBondTypes] = useState<Set<number>>(new Set());

  const handleBondTypesChange = useCallback((types: Set<number>) => {
    setBondTypes(types);
  }, []);

  return (
    <div className="relative h-full w-full min-h-[300px] rounded-xl overflow-hidden bg-gradient-to-b from-muted/30 to-muted/50 border border-border">
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
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            <spotLight
              position={[0, 10, 0]}
              angle={0.3}
              penumbra={1}
              intensity={0.5}
            />
            <MoleculeStructure elements={elements} onBondTypesChange={handleBondTypesChange} />
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              autoRotate={true}
              autoRotateSpeed={1}
            />
            <Environment preset="studio" />
          </Canvas>
          <BondLegend bondTypes={bondTypes} />
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2">
            <span>{totalAtoms} atom{totalAtoms !== 1 ? 's' : ''}</span>
            <span className="opacity-60">Drag to rotate • Scroll to zoom</span>
          </div>
        </>
      )}
    </div>
  );
}
