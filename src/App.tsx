
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import FlowerManagement from "./pages/FlowerManagement";
import FlowerDetail from "./pages/FlowerDetail";
import FlowerCreate from "./pages/FlowerCreate";
import FlowerEdit from "./pages/FlowerEdit";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/flowers" element={<FlowerManagement />} />
          <Route path="/flowers/new" element={<FlowerCreate />} />
          <Route path="/flowers/:seq" element={<FlowerDetail />} />
          <Route path="/flowers/:seq/edit" element={<FlowerEdit />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
