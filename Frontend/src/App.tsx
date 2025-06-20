
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import DashboardLayout from "./layouts/DashboardLayout";
import Index from "./pages/Index";
import DevicesPage from "./pages/DevicesPage";
import DeviceDetailsPage from "./pages/DeviceDetailsPage";
import NetworkProtectionPage from "./pages/NetworkPotectionPage";
import ARSRulesPage from "./pages/ARSRulesPage";
import CrashAnalysisPage from "./pages/CrashAnalysisPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider>
              <Routes>
                <Route path="/" element={<DashboardLayout />}>
                  <Route index element={<Index />} />
                  <Route path="devices" element={<DevicesPage />} />
                  <Route path="devices/:deviceId" element={<DeviceDetailsPage />} />
                  {/* <Route path="security" element={<TrendsPage />} /> */}
                  <Route path="security/networkProtection" element={<NetworkProtectionPage />} />
                  <Route path="security/asrrules" element={<ARSRulesPage />} />
                  <Route path="crashes" element={<CrashAnalysisPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SidebarProvider>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
