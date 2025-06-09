
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, User, Calendar, FileText, Award, Download, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface StudentGrade {
  id: string;
  student_name: string;
  exam_title: string;
  score: number;
  feedback?: string;
  completed_at: string;
  exam_code: string;
  answers: any;
}

const Pauta = () => {
  const [studentName, setStudentName] = useState("");
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<StudentGrade | null>(null);

  const searchGrades = async () => {
    if (!studentName.trim()) {
      toast({
        title: "Nome necessário",
        description: "Por favor, insira o nome do aluno para buscar as notas.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exam_submissions')
        .select(`
          id,
          student_name,
          score,
          feedback,
          completed_at,
          answers,
          exams (
            title,
            exam_code
          )
        `)
        .ilike('student_name', `%${studentName.trim()}%`)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      const formattedGrades = data?.map(item => ({
        id: item.id,
        student_name: item.student_name,
        exam_title: item.exams?.title || 'Prova sem título',
        exam_code: item.exams?.exam_code || '',
        score: item.score,
        feedback: item.feedback,
        completed_at: item.completed_at,
        answers: item.answers
      })) || [];

      setGrades(formattedGrades);

      if (formattedGrades.length === 0) {
        toast({
          title: "Nenhuma nota encontrada",
          description: "Não foram encontradas notas para este aluno.",
        });
      } else {
        toast({
          title: "Notas carregadas",
          description: `${formattedGrades.length} nota(s) encontrada(s) para ${studentName}.`,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível buscar as notas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 14) return "bg-green-100 text-green-800 border-green-300";
    if (score >= 10) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const getScoreStatus = (score: number) => {
    if (score >= 10) return "Aprovado";
    return "Reprovado";
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, grade) => acc + grade.score, 0);
    return (sum / grades.length).toFixed(1);
  };

  const calculatePassRate = () => {
    if (grades.length === 0) return 0;
    const passed = grades.filter(grade => grade.score >= 10).length;
    return Math.round((passed / grades.length) * 100);
  };

  const exportGrades = () => {
    if (grades.length === 0) return;

    const csvContent = [
      ['Aluno', 'Prova', 'Código', 'Nota', 'Status', 'Data', 'Feedback'].join(','),
      ...grades.map(grade => [
        `"${grade.student_name}"`,
        `"${grade.exam_title}"`,
        `"${grade.exam_code}"`,
        grade.score,
        getScoreStatus(grade.score),
        new Date(grade.completed_at).toLocaleDateString('pt-BR'),
        `"${grade.feedback || 'Sem feedback'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pauta_${studentName.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewAnswers = (grade: StudentGrade) => {
    setSelectedGrade(grade);
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      {/* Busca por Aluno */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Award className="h-5 w-5 md:h-6 md:w-6" />
            Pauta de Notas - Multimédia e Design
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            Consulte as notas das provas realizadas pelos alunos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="flex-1">
              <Input
                placeholder="Digite o nome do aluno..."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchGrades()}
                className="text-base p-3 md:p-4"
              />
            </div>
            <Button 
              onClick={searchGrades} 
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 text-base"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Buscando...' : 'Buscar Notas'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo das Notas */}
      {grades.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <User className="h-6 w-6 md:h-8 md:w-8 text-purple-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-gray-600">Aluno</p>
                    <p className="text-base md:text-lg font-bold truncate">{grades[0]?.student_name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 md:h-8 md:w-8 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Total de Provas</p>
                    <p className="text-xl md:text-2xl font-bold">{grades.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <Award className="h-6 w-6 md:h-8 md:w-8 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Média Geral</p>
                    <p className="text-xl md:text-2xl font-bold">{calculateAverage()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 md:h-8 md:w-8 text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Taxa Aprovação</p>
                    <p className="text-xl md:text-2xl font-bold">{calculatePassRate()}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botão de Exportar */}
          <div className="flex justify-end">
            <Button 
              onClick={exportGrades}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar para CSV
            </Button>
          </div>
        </>
      )}

      {/* Lista de Notas */}
      {grades.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-xl">Histórico de Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {grades.map((grade) => (
                <div key={grade.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">
                        {grade.exam_title}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs md:text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                          <span className="truncate">Código: {grade.exam_code}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                          <span>
                            {new Date(grade.completed_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getScoreColor(grade.score)} text-xs`}>
                            {grade.score}/20 - {getScoreStatus(grade.score)}
                          </Badge>
                        </div>
                      </div>
                      {grade.feedback && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs md:text-sm font-medium text-blue-800 mb-1">
                            Feedback do Professor:
                          </p>
                          <p className="text-xs md:text-sm text-blue-700">{grade.feedback}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewAnswers(grade)}
                        className="text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver Respostas
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Respostas */}
      {selectedGrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Respostas - {selectedGrade.exam_title}</CardTitle>
              <CardDescription>
                Aluno: {selectedGrade.student_name} | Nota: {selectedGrade.score}/20
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedGrade.answers && Object.entries(selectedGrade.answers).map(([questionId, answer]) => (
                <div key={questionId} className="border-b pb-3">
                  <p className="font-medium text-sm mb-1">Questão {questionId}:</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {typeof answer === 'object' ? JSON.stringify(answer) : String(answer)}
                  </p>
                </div>
              ))}
              <div className="flex justify-end pt-4">
                <Button onClick={() => setSelectedGrade(null)}>
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Estado vazio */}
      {!loading && grades.length === 0 && studentName && (
        <Card>
          <CardContent className="p-8 md:p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma nota encontrada
            </h3>
            <p className="text-gray-500 text-sm md:text-base">
              Não foram encontradas notas para "{studentName}".
            </p>
          </CardContent>
        </Card>
      )}

      {/* Estado inicial */}
      {!loading && grades.length === 0 && !studentName && (
        <Card>
          <CardContent className="p-8 md:p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Buscar Notas de Aluno
            </h3>
            <p className="text-gray-500 text-sm md:text-base">
              Digite o nome de um aluno para consultar suas notas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Pauta;
