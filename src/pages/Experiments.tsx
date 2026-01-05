import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { 
  FlaskConical, 
  Download, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  FileText,
  ChevronRight
} from "lucide-react";

const experimentsData = [
  {
    id: 1,
    name: "Graphene-Li2S Composite Analysis",
    date: "2024-01-15",
    time: "14:32",
    status: "completed",
    duration: "2h 34m",
    qubits: 8,
    accuracy: 98.2,
  },
  {
    id: 2,
    name: "Silicon Carbide Thermal Study",
    date: "2024-01-15",
    time: "12:15",
    status: "running",
    duration: "1h 45m",
    qubits: 6,
    accuracy: null,
  },
  {
    id: 3,
    name: "Perovskite Solar Cell Optimization",
    date: "2024-01-14",
    time: "16:45",
    status: "completed",
    duration: "3h 12m",
    qubits: 10,
    accuracy: 96.8,
  },
  {
    id: 4,
    name: "MoS2 Monolayer Band Structure",
    date: "2024-01-14",
    time: "09:22",
    status: "completed",
    duration: "1h 58m",
    qubits: 8,
    accuracy: 97.5,
  },
  {
    id: 5,
    name: "Titanium Nitride Conductivity",
    date: "2024-01-13",
    time: "15:10",
    status: "failed",
    duration: "0h 45m",
    qubits: 12,
    accuracy: null,
    error: "Qubit decoherence exceeded threshold",
  },
  {
    id: 6,
    name: "GaN Semiconductor Validation",
    date: "2024-01-13",
    time: "11:30",
    status: "completed",
    duration: "2h 15m",
    qubits: 6,
    accuracy: 99.1,
  },
  {
    id: 7,
    name: "LiCoO2 Cathode Energy Levels",
    date: "2024-01-12",
    time: "14:00",
    status: "completed",
    duration: "4h 22m",
    qubits: 10,
    accuracy: 95.3,
  },
  {
    id: 8,
    name: "Zinc Oxide Optical Properties",
    date: "2024-01-12",
    time: "08:45",
    status: "completed",
    duration: "1h 30m",
    qubits: 4,
    accuracy: 98.7,
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case "running":
      return <Loader2 className="h-4 w-4 text-accent animate-spin" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: string) => {
  const styles = {
    completed: "bg-success/10 text-success",
    running: "bg-accent/10 text-accent",
    failed: "bg-destructive/10 text-destructive",
  };
  return styles[status as keyof typeof styles] || "bg-muted text-muted-foreground";
};

const Experiments = () => {
  const completedCount = experimentsData.filter(e => e.status === "completed").length;
  const runningCount = experimentsData.filter(e => e.status === "running").length;
  const failedCount = experimentsData.filter(e => e.status === "failed").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Experiments & History</h1>
            <p className="text-muted-foreground">Track and manage your quantum simulations</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All Reports
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10 text-success">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent/10 text-accent">
              <Loader2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{runningCount}</p>
              <p className="text-sm text-muted-foreground">Running</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{failedCount}</p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="font-semibold flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-accent" />
              Experiment Timeline
            </h3>
          </div>
          
          <div className="divide-y divide-border">
            {experimentsData.map((experiment, index) => (
              <div
                key={experiment.id}
                className="p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className="mt-1">{getStatusIcon(experiment.status)}</div>
                    {index < experimentsData.length - 1 && (
                      <div className="w-px h-full min-h-8 bg-border mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-medium group-hover:text-accent transition-colors">
                          {experiment.name}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{experiment.date}</span>
                          <span>•</span>
                          <span>{experiment.time}</span>
                          <span>•</span>
                          <span>{experiment.qubits} qubits</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {experiment.duration}
                          </span>
                        </div>
                        {experiment.error && (
                          <p className="text-sm text-destructive">{experiment.error}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(experiment.status)}`}>
                          {experiment.status}
                        </span>
                        {experiment.accuracy && (
                          <span className="text-sm font-semibold text-success">
                            {experiment.accuracy}%
                          </span>
                        )}
                        {experiment.status === "completed" && (
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <FileText className="h-4 w-4 mr-1" />
                            Report
                          </Button>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="flex justify-center gap-4 py-4">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export as PDF
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export as CSV
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Experiments;
