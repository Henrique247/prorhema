
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, User, Calendar, FileText, Award } from "lucide-react";
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
}

const Pauta = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [studentName, setStudentName] = useState("");
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(false);

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
          exams (
            title,
            exam_code
          )
        `)
        .ilike('student_name', `%${studentName.trim()}%`)
        .gt('score', 0)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      const formattedGrades = data.map(item => ({
        id: item.id,
        student_name: item.student_name,
        exam_title: item.exams?.title || 'Prova sem título',
        exam_code: item.exams?.exam_code || '',
        score: item.score,
        feedback: item.feedback,
        completed_at: item.completed_at
      }));

      setGrades(formattedGrades);

      if (formattedGrades.length === 0) {
        toast({
          title: "Nenhuma nota encontrada",
          description: "Não foram encontradas notas para este aluno.",
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
    if (score >= 14) return "bg-green-100 text-green-800";
    if (score >= 10) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
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

  return (
    <div className="space-y-6">
      {/* Busca por Aluno */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Pauta de Notas - Multimédia e Design
          </CardTitle>
          <CardDescription>
            Consulte as notas das provas realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Digite o nome do aluno..."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchGrades()}
              />
            </div>
            <Button onClick={searchGrades} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Buscando...' : 'Buscar Notas'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo das Notas */}
      {grades.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total de Provas</p>
                  <p className="text-2xl font-bold">{grades.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Média Geral</p>
                  <p className="text-2xl font-bold">{calculateAverage()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Aluno</p>
                  <p className="text-lg font-bold">{grades[0]?.student_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Notas */}
      {grades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {grades.map((grade) => (
                <div key={grade.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {grade.exam_title}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>Código: {grade.exam_code}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(grade.completed_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getScoreColor(grade.score)}>
                            {grade.score}/20 - {getScoreStatus(grade.score)}
                          </Badge>
                        </div>
                      </div>
                      {grade.feedback && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-800 mb-1">
                            Feedback do Professor:
                          </p>
                          <p className="text-sm text-blue-700">{grade.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado vazio */}
      {!loading && grades.length === 0 && studentName && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma nota encontrada
            </h3>
            <p className="text-gray-500">
              Não foram encontradas notas para "{studentName}".
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Pauta;
