import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, RotateCcw, Download, Cpu, CircleDot, Waves, Zap } from "lucide-react";
import { useState } from "react";

const Simulator = () => {
  const [qubits, setQubits] = useState([4]);
  const [simulationType, setSimulationType] = useState("electronic");
  const [isRunning, setIsRunning] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  const handleRunSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setHasResults(true);
    }, 2000);
  };

  const handleReset = () => {
    setQubits([4]);
    setSimulationType("electronic");
    setHasResults(false);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quantum Simulator</h1>
          <p className="text-muted-foreground">Configure and run quantum simulations for material analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulation Controls */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Cpu className="h-5 w-5 text-accent" />
              Simulation Controls
            </h2>

            {/* Qubits Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Number of Qubits</label>
                <span className="text-sm font-bold text-accent">{qubits[0]}</span>
              </div>
              <Slider
                value={qubits}
                onValueChange={setQubits}
                min={2}
                max={12}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>2</span>
                <span>12</span>
              </div>
            </div>

            {/* Simulation Type */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Simulation Type</label>
              <Select value={simulationType} onValueChange={setSimulationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronic">Electronic Structure</SelectItem>
                  <SelectItem value="molecular">Molecular Energy</SelectItem>
                  <SelectItem value="evolution">Quantum State Evolution</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* OpenQASM Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium">OpenQASM Code</label>
              <div className="bg-primary/5 rounded-lg p-4 font-mono text-xs text-muted-foreground overflow-x-auto border border-border">
                <pre>{`OPENQASM 2.0;
include "qelib1.inc";
qreg q[${qubits[0]}];
creg c[${qubits[0]}];

h q[0];
cx q[0], q[1];
measure q -> c;`}</pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="quantum" 
                className="flex-1" 
                onClick={handleRunSimulation}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <div className="h-4 w-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Simulation
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Visualization Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quantum Circuit Diagram */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h3 className="text-lg font-semibold">Quantum Circuit</h3>
              <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center border border-border/50 relative overflow-hidden">
                {/* Circuit Lines */}
                <svg className="w-full h-full p-4" viewBox="0 0 400 120">
                  {Array.from({ length: Math.min(qubits[0], 4) }).map((_, i) => (
                    <g key={i}>
                      {/* Qubit line */}
                      <line x1="20" y1={30 + i * 25} x2="380" y2={30 + i * 25} stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
                      <text x="10" y={34 + i * 25} className="text-xs fill-muted-foreground">q{i}</text>
                      
                      {/* Hadamard gate */}
                      {i === 0 && (
                        <rect x="80" y={20 + i * 25} width="20" height="20" rx="2" className="fill-accent/20 stroke-accent" strokeWidth="1" />
                      )}
                      {i === 0 && (
                        <text x="85" y={34 + i * 25} className="text-xs fill-accent font-semibold">H</text>
                      )}
                      
                      {/* CNOT gate */}
                      {i === 0 && (
                        <circle cx="150" cy={30 + i * 25} r="4" className="fill-quantum" />
                      )}
                      {i === 1 && (
                        <>
                          <line x1="150" y1="30" x2="150" y2="55" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1" />
                          <circle cx="150" cy={30 + i * 25} r="8" className="fill-none stroke-quantum" strokeWidth="2" />
                          <line x1="142" y1={30 + i * 25} x2="158" y2={30 + i * 25} className="stroke-quantum" strokeWidth="2" />
                          <line x1="150" y1={22 + i * 25} x2="150" y2={38 + i * 25} className="stroke-quantum" strokeWidth="2" />
                        </>
                      )}
                      
                      {/* Measurement */}
                      <rect x="320" y={20 + i * 25} width="24" height="20" rx="2" className="fill-accent/10 stroke-accent/50" strokeWidth="1" />
                      <path d="M 325 ${35 + i * 25} Q 332 ${25 + i * 25} 339 ${35 + i * 25}" fill="none" stroke="currentColor" strokeOpacity="0.5" />
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bloch Sphere */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <CircleDot className="h-4 w-4 text-accent" />
                  Bloch Sphere
                </h3>
                <div className="h-40 flex items-center justify-center relative">
                  <div className={`w-32 h-32 rounded-full border-2 border-accent/30 relative ${hasResults ? 'animate-pulse-slow' : ''}`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-px bg-accent/20" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-px h-full bg-accent/20" />
                    </div>
                    {hasResults && (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-quantum shadow-quantum animate-glow" />
                    )}
                  </div>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">|0⟩</div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">|1⟩</div>
                </div>
              </div>

              {/* Energy Levels */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Waves className="h-4 w-4 text-accent" />
                  Energy Levels
                </h3>
                <div className="h-40 flex items-end justify-around gap-2 px-4">
                  {(hasResults ? [0.85, 0.12, 0.02, 0.01] : [0.25, 0.25, 0.25, 0.25]).map((prob, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className={`w-full rounded-t-md transition-all duration-500 ${hasResults ? 'bg-gradient-to-t from-accent to-quantum' : 'bg-muted'}`}
                        style={{ height: `${prob * 100}%` }}
                      />
                      <span className="text-xs text-muted-foreground">|{i.toString(2).padStart(2, '0')}⟩</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Summary */}
            {hasResults && (
              <div className="bg-gradient-to-r from-accent/10 to-quantum/10 rounded-xl border border-accent/20 p-6 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-accent" />
                    Simulation Results
                  </h3>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-card/50">
                    <p className="text-xs text-muted-foreground">Ground State Energy</p>
                    <p className="text-lg font-bold">-1.137 Ha</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card/50">
                    <p className="text-xs text-muted-foreground">Fidelity</p>
                    <p className="text-lg font-bold text-success">98.2%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card/50">
                    <p className="text-xs text-muted-foreground">Gate Count</p>
                    <p className="text-lg font-bold">24</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card/50">
                    <p className="text-xs text-muted-foreground">Circuit Depth</p>
                    <p className="text-lg font-bold">8</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Simulator;
