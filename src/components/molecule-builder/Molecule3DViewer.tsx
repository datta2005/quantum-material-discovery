import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, Cylinder, Text, Environment } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { MoleculeElement } from "./MoleculeConstructionZone";

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

interface AtomPosition {
  symbol: string;
  position: [number, number, number];
  color: string;
  radius: number;
}

interface Bond {
  start: [number, number, number];
  end: [number, number, number];
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

function BondCylinder({ start, end }: Bond) {
  const ref = useRef<THREE.Mesh>(null);
  
  const { position, rotation, length } = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
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
  }, [start, end]);

  return (
    <Cylinder
      ref={ref}
      args={[0.08, 0.08, length, 16]}
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

function MoleculeStructure({ elements }: { elements: MoleculeElement[] }) {
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
    
    // Generate bonds between nearby atoms (simplified bonding logic)
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
          bonds.push({
            start: atoms[i].position,
            end: atoms[j].position,
          });
        }
      }
    }
    
    return { atoms, bonds };
  }, [elements]);

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
            <MoleculeStructure elements={elements} />
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              autoRotate={true}
              autoRotateSpeed={1}
            />
            <Environment preset="studio" />
          </Canvas>
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2">
            <span>{totalAtoms} atom{totalAtoms !== 1 ? 's' : ''}</span>
            <span className="opacity-60">Drag to rotate • Scroll to zoom</span>
          </div>
        </>
      )}
    </div>
  );
}
