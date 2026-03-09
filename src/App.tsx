import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme-context";
import AppLayout from "@/components/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import DevicesPage from "@/pages/DevicesPage";
import DeviceDetailPage from "@/pages/DeviceDetailPage";
import DeviceTypesPage from "@/pages/DeviceTypesPage";
import LocationsPage from "@/pages/LocationsPage";
import PeoplePage from "@/pages/PeoplePage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const navigate = useNavigate();
  const handleGlobalSearch = (query: string) => {
    if (query.trim()) navigate(`/devices?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <AppLayout onGlobalSearch={handleGlobalSearch}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/devices" element={<DevicesPage />} />
        <Route path="/devices/:id" element={<DeviceDetailPage />} />
        <Route path="/device-types" element={<DeviceTypesPage />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
