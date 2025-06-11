
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, ArrowLeft, User, BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const LoginEstudante = () => {
  const [studentName, setStudentName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentName.trim()) {
      toast({
        title: "Nome necessário",
        description: "Por favor, insira seu nome para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular validação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Armazenar dados do estudante no localStorage
      localStorage.setItem('student_data', JSON.stringify({
        name: studentName.trim(),
        studentNumber: studentNumber.trim() || null,
        loginTime: new Date().toISOString()
      }));

      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${studentName}!`,
      });

      navigate('/dashboard-estudante');
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link 
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar ao início
          </Link>
          
          <div className="flex justify-center items-center space-x-3 mb-4">
            <div className="bg-green-600 rounded-lg p-3">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Portal do Estudante</h1>
              <p className="text-sm text-gray-600">Sistema de Provas Pro Rhema</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <User className="h-5 w-5" />
              <span>Entrar como Estudante</span>
            </CardTitle>
            <CardDescription>
              Insira seus dados para acessar suas provas e notas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">Nome Completo *</Label>
                <Input
                  id="studentName"
                  type="text"
                  placeholder="Ex: João Silva"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="studentNumber">Número do Estudante (opcional)</Label>
                <Input
                  id="studentNumber"
                  type="text"
                  placeholder="Ex: 2024001"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Entrando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>Entrar</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center justify-center space-x-2 text-green-700">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-xs font-medium">Acesso rápido e seguro</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-gray-900">Portal do Estudante</h3>
              <p className="text-xs text-gray-600">
                Realize provas, consulte suas notas e acompanhe seu progresso acadêmico.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginEstudante;
