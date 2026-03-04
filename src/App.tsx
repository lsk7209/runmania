import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import Home from "@/pages/Home";
import Diagnosis from "@/pages/Diagnosis";
import Blog from "@/pages/Blog";
import Reviews from "@/pages/Reviews";
import Tools from "@/pages/Tools";
import PaceCalculator from "@/pages/PaceCalculator";
import SizeConverter from "@/pages/SizeConverter";
import NotFound from "@/pages/NotFound";
import Admin from "@/pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools/diagnosis" element={<Diagnosis />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<Blog />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/reviews/:slug" element={<Reviews />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/pace-calculator" element={<PaceCalculator />} />
          <Route path="/tools/size-converter" element={<SizeConverter />} />
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
