import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Atom, 
  Cpu, 
  Brain, 
  FlaskConical,
  Moon,
  Sun,
  User,
  Hexagon
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Materials Explorer", path: "/materials", icon: Atom },
  { name: "Candidate Generator", path: "/candidate-generator", icon: Brain },
  { name: "Molecule Builder", path: "/molecule-builder", icon: Hexagon },
  { name: "Quantum Simulator", path: "/simulator", icon: Cpu },
  { name: "Experiments", path: "/experiments", icon: FlaskConical },
];

export function Navbar() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg ">
<img src="/pure_logo.png" alt="" />
        </div>
          <span className="text-lg font-semibold tracking-tight">QDiscover</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent/20 to-quantum/20 flex items-center justify-center">
              <User className="h-4 w-4 text-accent" />
            </div>
          </Button>
        </div>
      </div>
    </nav>
  );
}
