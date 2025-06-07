
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Clock, FileText, Download, TrendingUp } from "lucide-react";
import { useExams } from "@/hooks/useExams";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ExamStats {
  id: string;
  title: string;
  exam_code: string;
  submissoes: number;
  media: number;
  aprovacao: number;
  created_at: string;
}

const Relatorios = () => {
  const { exams } = useExams();
  const { teacher } = useAuth();
  const [examStats, setExamStats] = useState<ExamStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({
    totalProvas: 0,
    totalAlunos: 0,
    mediaGeral: 0,
    taxaAprovacao: 0
  });

  const fetchExamStats = async () => {
    if (!teacher) return;

    try {
      const statsPromises = exams.map(async (exam) => {
        const { data: submissions, error } = await supabase
          .from('exam_submissions')
          .select('score, student_name')
          .eq('exam_id', exam.id)
          .gt('score', 0);

        if (error) throw error;

        const totalSubmissions = submissions.length;
        const aprovados = submissions.filter(s => s.score >= 10).length;
        const media = totalSubmissions > 0 
          ? submissions.reduce((acc, s) => acc + s.score, 0) / totalSubmissions 
          : 0;
        const taxaAprovacao = totalSubmissions > 0 
          ? (aprovados / totalSubmissions) * 100 
          : 0;

        return {
          id: exam.id,
          title: exam.title,
          exam_code: exam.exam_code,
          submissoes: totalSubmissions,
          media: Number(media.toFixed(1)),
          aprovacao: Number(taxaAprovacao.toFixed(0)),
          created_at: exam.created_at
        };
      });

      const stats = await Promise.all(statsPromises);
      setExamStats(stats);

      // Calcular estatísticas totais
      const totalSubmissions = stats.reduce((acc, stat) => acc + stat.submissoes, 0);
      const alunosUnicos = new Set();
      
      // Buscar todos os alunos únicos
      for (const exam of exams) {
        const { data: submissions } = await supabase
          .from('exam_submissions')
          .select('student_name')
          .eq('exam_id', exam.id);
        
        if (submissions) {
          submissions.forEach(s => alunosUnicos.add(s.student_name));
        }
      }

      const mediaGeral = stats.length > 0 
        ? stats.reduce((acc, stat) => acc + (stat.media * stat.submissoes), 0) / totalSubmissions || 0
        : 0;

      const aprovacaoGeral = stats.length > 0
        ? stats.reduce((acc, stat) => acc + stat.aprovacao, 0) / stats.length
        : 0;

      setTotalStats({
        totalProvas: exams.length,
        totalAlunos: alunosUnicos.size,
        mediaGeral: Number(mediaGeral.toFixed(1)),
        taxaAprovacao: Number(aprovacaoGeral.toFixed(0))
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (exams.length > 0) {
      fetchExamStats();
    } else {
      setLoading(false);
    }
  }, [exams, teacher]);

  const getAprovacaoBadge = (taxa: number) => {
    if (taxa >= 90) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{taxa}%</Badge>;
    if (taxa >= 70) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{taxa}%</Badge>;
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{taxa}%</Badge>;
  };

  const getMediaBadge = (media: number) => {
    if (media >= 14) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{media}</Badge>;
    if (media >= 10) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{media}</Badge>;
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{media}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Carregando relatórios...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Provas</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.totalProvas}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alunos Únicos</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.totalAlunos}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Média Geral</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalStats.mediaGeral > 0 ? totalStats.mediaGeral : '-'}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Aprovação</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalStats.taxaAprovacao > 0 ? `${totalStats.taxaAprovacao}%` : '-'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relatórios de Provas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Relatórios das Provas</CardTitle>
              <CardDescription>
                Desempenho detalhado de cada prova aplicada pelo Professor {teacher?.name}
              </CardDescription>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {examStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>Nenhuma prova com submissões encontrada.</p>
              <p className="text-sm">Crie provas e aguarde os alunos responderem para ver os relatórios.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {examStats.map((prova) => (
                <div key={prova.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{prova.title}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Código:</span>
                          <span className="ml-2 font-medium">{prova.exam_code}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Submissões:</span>
                          <span className="ml-2 font-medium">{prova.submissoes}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Média:</span>
                          {prova.media > 0 ? getMediaBadge(prova.media) : <span className="ml-2">-</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Aprovação:</span>
                          {prova.aprovacao > 0 ? getAprovacaoBadge(prova.aprovacao) : <span className="ml-2">-</span>}
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Criada em:</span>
                          <span className="ml-2 font-medium">
                            {new Date(prova.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Baixar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance ao Longo do Tempo</CardTitle>
          <CardDescription>
            Evolução da média das notas e taxa de aprovação nas suas provas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Gráfico de performance será exibido aqui</p>
              <p className="text-sm text-gray-400">Dados das suas {totalStats.totalProvas} provas de Multimédia e Design</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Relatorios;
