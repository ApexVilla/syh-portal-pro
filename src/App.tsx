import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Ventas from "@/pages/Ventas";
import Clientes from "@/pages/Clientes";
import Inventario from "@/pages/Inventario";
import CXC from "@/pages/CXC";
import CXP from "@/pages/CXP";
import Proveedores from "@/pages/Proveedores";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/vendas" element={<ProtectedRoute><Ventas /></ProtectedRoute>} />
    <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
    <Route path="/estoque" element={<ProtectedRoute><Inventario /></ProtectedRoute>} />
    <Route path="/cxc" element={<ProtectedRoute><CXC /></ProtectedRoute>} />
    <Route path="/cxp" element={<ProtectedRoute><CXP /></ProtectedRoute>} />
    <Route path="/proveedores" element={<ProtectedRoute><Proveedores /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

import { ErrorBoundary } from "@/components/ErrorBoundary";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
