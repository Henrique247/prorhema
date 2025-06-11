
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, BookOpen, Monitor, GraduationCap, Users, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

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
      window.location.reload();
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
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

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Student Portal Card */}
          <Card className="shadow-xl border-0 bg-green-500/10 backdrop-blur-sm border-green-200 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-green-600 rounded-lg p-4">
                    <GraduationCap className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">Portal do Estudante</h3>
                  <p className="text-sm text-green-700 mb-4">
                    Acesse suas notas, realize provas e acompanhe seu progresso acadêmico
                  </p>
                  <div className="space-y-2 text-xs text-green-600 mb-4">
                    <div className="flex items-center justify-center gap-2">
                      <BookOpen className="h-3 w-3" />
                      <span>Provas disponíveis</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Users className="h-3 w-3" />
                      <span>Ranking e gamificação</span>
                    </div>
                  </div>
                </div>
                <Link to="/login-estudante">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Entrar como Estudante
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Teacher Area Card */}
          <Card className="shadow-xl border-0 bg-blue-500/10 backdrop-blur-sm border-blue-200 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-blue-600 rounded-lg p-4">
                    <Monitor className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-800 mb-2">Área do Professor</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Crie provas, gerencie turmas e acompanhe o desempenho dos estudantes
                  </p>
                  <div className="space-y-2 text-xs text-blue-600 mb-4">
                    <div className="flex items-center justify-center gap-2">
                      <BookOpen className="h-3 w-3" />
                      <span>Criar e gerenciar provas</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Users className="h-3 w-3" />
                      <span>Relatórios e análises</span>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-xs text-blue-700 font-medium mb-3">Login de Professor:</p>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <Input
                        type="text"
                        placeholder="Nome do Professor"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Input
                        type="password"
                        placeholder="Palavra-passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="text-sm"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading}
                      size="sm"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          <span>Entrando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <LogIn className="h-3 w-3" />
                          <span>Entrar</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access to Student Portal */}
        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="font-medium text-gray-900">Acesso Rápido</h3>
              <p className="text-sm text-gray-600">
                Estudantes podem acessar diretamente o portal para realizar provas ou consultar notas
              </p>
              <Link to="/portal-aluno">
                <Button variant="outline" size="sm">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Portal Simples do Aluno
                </Button>
              </Link>
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
                Interface moderna e intuitiva para professores e estudantes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
