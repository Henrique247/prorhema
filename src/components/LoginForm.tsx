
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, BookOpen, Monitor, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const LoginForm = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(name, password);
    if (success) {
      // Recarregar a página para mostrar a dashboard
      window.location.reload();
    }
    
    setIsLoading(false);
  };

  const goToStudentPortal = () => {
    window.location.href = '/portal-aluno';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center space-x-3 mb-4">
            <div className="bg-blue-600 rounded-lg p-3">
              <Monitor className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pro Rhema</h1>
              <p className="text-sm text-gray-600">Sistema de Provas Multimédia & Design</p>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border">
            <p className="text-xs text-gray-700 font-medium">Patrocinado pela TechStar</p>
          </div>
        </div>

        {/* Student Portal Button */}
        <Card className="shadow-xl border-0 bg-green-500/10 backdrop-blur-sm border-green-200">
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="bg-green-600 rounded-lg p-3">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-green-800">Portal do Aluno</h3>
              <p className="text-sm text-green-700">
                Acesse suas notas, realize provas e veja seu histórico acadêmico
              </p>
              <Button 
                onClick={goToStudentPortal}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Entrar como Aluno
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <LogIn className="h-5 w-5" />
              <span>Acesso de Professor</span>
            </CardTitle>
            <CardDescription>
              Insira as suas credenciais para aceder ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Professor</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ex: Kenan Mendes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Palavra-passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>A entrar...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Entrar</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center justify-center space-x-2 text-blue-700">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-xs font-medium">Escola de Multimédia & Design</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-gray-900">Sistema de Avaliação Digital</h3>
              <p className="text-xs text-gray-600">
                Plataforma especializada em provas de design gráfico e multimédia.
                Crie e gere provas personalizadas para os seus alunos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
