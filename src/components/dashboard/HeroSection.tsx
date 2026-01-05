import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-12 lg:p-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 800 600" fill="none">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Quantum Orb Effect */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-accent/30 to-quantum/20 blur-3xl" />
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
        {/* Text Content */}
        <div className="flex-1 space-y-6 text-primary-foreground">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-quantum animate-pulse" />
            Next-Gen Materials Science
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-balance">
            Accelerating Materials Discovery with{" "}
            <span className="bg-gradient-to-r from-accent to-quantum bg-clip-text text-transparent">
              AI & Quantum Computing
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl">
            Simulate, predict, and optimize advanced materials at quantum scale. 
            Harness the power of artificial intelligence and quantum mechanics for breakthrough discoveries.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/simulator">
              <Button variant="quantum" size="xl">
                Start Simulation
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/materials">
              <Button variant="hero-secondary" size="xl">
                <Play className="h-5 w-5" />
                Explore Materials
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Illustration */}
        <div className="flex-1 relative">
          <div className="relative w-full max-w-md mx-auto">
            {/* Orbital rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border border-accent/30 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
              <div className="absolute w-48 h-48 border border-quantum/40 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
              <div className="absolute w-32 h-32 border border-accent/50 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
            </div>
            
            {/* Central atom */}
            <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-quantum shadow-quantum animate-pulse-slow" />
              
              {/* Electrons */}
              <div className="absolute w-full h-full animate-spin" style={{ animationDuration: '8s' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent shadow-lg" />
              </div>
              <div className="absolute w-full h-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}>
                <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-quantum shadow-lg" />
              </div>
              <div className="absolute w-full h-full animate-spin" style={{ animationDuration: '12s' }}>
                <div className="absolute top-1/2 right-0 w-3.5 h-3.5 rounded-full bg-accent/80 shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
