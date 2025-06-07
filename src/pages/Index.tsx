
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Users, BarChart3, Settings, LogOut, Monitor, GraduationCap, ClipboardCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useExams } from "@/hooks/useExams";
import { supabase } from "@/integrations/supabase/client";
import CriarProva from "@/components/CriarProva";
import MinhasProvas from "@/components/MinhasProvas";
import Relatorios from "@/components/Relatorios";
import RevisarProvas from "@/components/RevisarProvas";
import Pauta from "@/components/Pauta";

const Index = () => {
  const [activeTab, setActiveTab] = useState("criar");
  const { teacher, logout } = useAuth();
  const { exams } = useExams();
  const [stats, setStats] = useState({
    totalProvas: 0,
    totalAlunos: 0,
    taxaConclusao: 0,
    mediaGeral: 0
  });

  const fetchStats = async () => {
    if (!teacher || !exams.length) return;

    try {
      // Buscar estatísticas reais
      let totalSubmissions = 0;
      let totalScores = 0;
      let completedExams = 0;
      const uniqueStudents = new Set();

      for (const exam of exams) {
        const { data: submissions } = await supabase
          .from('exam_submissions')
          .select('score, student_name')
          .eq('exam_id', exam.id);

        if (submissions) {
          submissions.forEach(submission => {
            uniqueStudents.add(submission.student_name);
            if (submission.score > 0) {
              totalSubmissions++;
              totalScores += submission.score;
              completedExams++;
            }
          });
        }
      }

      const mediaGeral = totalSubmissions > 0 ? totalScores / totalSubmissions : 0;
      const taxaConclusao = exams.length > 0 ? (completedExams / (exams.length * uniqueStudents.size || 1)) * 100 : 0;

      setStats({
        totalProvas: exams.length,
        totalAlunos: uniqueStudents.size,
        taxaConclusao: Math.round(taxaConclusao),
        mediaGeral: Number(mediaGeral.toFixed(1))
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [teacher, exams]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Monitor className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pro Rhema</h1>
                <p className="text-sm text-gray-500">Sistema de Provas Multimédia & Design</p>
              </div>
              <div className="hidden md:block bg-blue-50 px-3 py-1 rounded-full">
                <p className="text-xs text-blue-700 font-medium">Patrocinado pela TechStar</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{teacher?.name}</p>
                <p className="text-xs text-gray-500">Professor de Design & Multimédia</p>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {teacher?.name?.charAt(0) || 'P'}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Provas Criadas</p>
                  <p className="text-2xl font-bold">{stats.totalProvas}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Alunos Participantes</p>
                  <p className="text-2xl font-bold">{stats.totalAlunos}</p>
                </div>
                <Users className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Taxa de Conclusão</p>
                  <p className="text-2xl font-bold">{stats.taxaConclusao}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Média Geral</p>
                  <p className="text-2xl font-bold">
                    {stats.mediaGeral > 0 ? stats.mediaGeral : '-'}
                  </p>
                </div>
                <Settings className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="criar" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Criar Prova</span>
            </TabsTrigger>
            <TabsTrigger value="minhas-provas" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Minhas Provas</span>
            </TabsTrigger>
            <TabsTrigger value="revisar" className="flex items-center space-x-2">
              <ClipboardCheck className="h-4 w-4" />
              <span>Revisar Provas</span>
            </TabsTrigger>
            <TabsTrigger value="pauta" className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4" />
              <span>Pauta</span>
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="criar">
            <CriarProva />
          </TabsContent>
          
          <TabsContent value="minhas-provas">
            <MinhasProvas />
          </TabsContent>
          
          <TabsContent value="revisar">
            <RevisarProvas />
          </TabsContent>
          
          <TabsContent value="pauta">
            <Pauta />
          </TabsContent>
          
          <TabsContent value="relatorios">
            <Relatorios />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
