import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import Home from "@/pages/Home";

const Diagnosis = lazy(() => import("@/pages/Diagnosis"));
const Blog = lazy(() => import("@/pages/Blog"));
const Reviews = lazy(() => import("@/pages/Reviews"));
const Tools = lazy(() => import("@/pages/Tools"));
const PaceCalculator = lazy(() => import("@/pages/PaceCalculator"));
const SizeConverter = lazy(() => import("@/pages/SizeConverter"));
const CalorieCalculator = lazy(() => import("@/pages/CalorieCalculator"));
const HeartRateZones = lazy(() => import("@/pages/HeartRateZones"));
const RacePredictor = lazy(() => import("@/pages/RacePredictor"));
const TrainingPaces = lazy(() => import("@/pages/TrainingPaces"));
const WeightLossCalculator = lazy(() => import("@/pages/WeightLossCalculator"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Admin = lazy(() => import("@/pages/Admin"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center pt-14">
    <p className="text-sm text-muted-foreground">Loading...</p>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Header />
        <Suspense fallback={<PageLoader />}>
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
            <Route
              path="/tools/calorie-calculator"
              element={<CalorieCalculator />}
            />
            <Route
              path="/tools/heart-rate-zones"
              element={<HeartRateZones />}
            />
            <Route path="/tools/race-predictor" element={<RacePredictor />} />
            <Route path="/tools/training-paces" element={<TrainingPaces />} />
            <Route
              path="/tools/weight-loss"
              element={<WeightLossCalculator />}
            />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
