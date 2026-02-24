import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Materials from "./pages/Materials";
import MoleculeBuilder from "./pages/MoleculeBuilder";
import Simulator from "./pages/Simulator";
import Insights from "./pages/Insights";
import Experiments from "./pages/Experiments";
import NotFound from "./pages/NotFound";
import CandidateGenerator from "./pages/CandidateGenerator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/molecule-builder" element={<MoleculeBuilder />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/experiments" element={<Experiments />} />
          <Route path="/candidate-generator" element={<CandidateGenerator />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
