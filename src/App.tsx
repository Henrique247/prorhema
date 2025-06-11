
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import ProvaAluno from "./pages/ProvaAluno";
import PortalAluno from "./pages/PortalAluno";
import LoginEstudante from "./pages/LoginEstudante";
import DashboardEstudante from "./pages/DashboardEstudante";
import NotFound from "./pages/NotFound";
import LoginForm from "./components/LoginForm";

const queryClient = new QueryClient();

const AppContent = () => {
  const { teacher, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login-estudante" element={<LoginEstudante />} />
        <Route path="/dashboard-estudante" element={<DashboardEstudante />} />
        <Route path="/portal-aluno" element={<PortalAluno />} />
        <Route path="/prova/:id" element={<ProvaAluno />} />
        
        {/* Rotas do professor */}
        {teacher ? (
          <Route path="/" element={<Index />} />
        ) : (
          <Route path="/" element={<LoginForm />} />
        )}
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
