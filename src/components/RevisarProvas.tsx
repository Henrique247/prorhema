
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, User, Clock, CheckCircle, X, Save } from "lucide-react";
import { useExams } from "@/hooks/useExams";
import { useExamSubmissions } from "@/hooks/useExamSubmissions";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const RevisarProvas = () => {
  const { exams } = useExams();
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [nota, setNota] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchSubmissions = async (examId: string) => {
    if (!examId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exam_submissions')
        .select('*')
        .eq('exam_id', examId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Erro ao carregar submissões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as submissões.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubmission = (submission: any) => {
    setSelectedSubmission(submission);
    setNota(submission.score?.toString() || "");
    setFeedback(submission.feedback || "");
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission || !nota) return;

    try {
      const { error } = await supabase
        .from('exam_submissions')
        .update({
          score: parseFloat(nota),
          feedback: feedback
        })
        .eq('id', selectedSubmission.id);

      if (error) throw error;

      toast({
        title: "Nota salva!",
        description: "A nota e feedback foram salvos com sucesso.",
      });

      // Atualizar a lista de submissões
      fetchSubmissions(selectedExam);
      
      // Atualizar a submissão selecionada
      setSelectedSubmission({
        ...selectedSubmission,
        score: parseFloat(nota),
        feedback: feedback
      });
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a nota.",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 14) return "bg-green-100 text-green-800";
    if (score >= 10) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      {/* Seleção de Prova */}
      <Card>
        <CardHeader>
          <CardTitle>Revisar Provas dos Alunos</CardTitle>
          <CardDescription>
            Selecione uma prova para ver as submissões dos alunos e atribuir notas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Selecionar Prova:</label>
              <Select value={selectedExam} onValueChange={(value) => {
                setSelectedExam(value);
                fetchSubmissions(value);
                setSelectedSubmission(null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma prova..." />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.title} - {exam.exam_code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedExam && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Submissões */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Submissões dos Alunos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Carregando submissões...</p>
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhuma submissão encontrada para esta prova.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedSubmission?.id === submission.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSelectSubmission(submission)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{submission.student_name}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(submission.completed_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          {submission.score > 0 ? (
                            <Badge className={getScoreColor(submission.score)}>
                              {submission.score}/20
                            </Badge>
                          ) : (
                            <Badge variant="outline">Não avaliado</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detalhe da Submissão */}
          {selectedSubmission && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Corrigir Prova - {selectedSubmission.student_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Respostas do Aluno */}
                <div>
                  <h4 className="font-medium mb-3">Respostas do Aluno:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(selectedSubmission.answers, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Atribuir Nota */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nota (0-20):
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      value={nota}
                      onChange={(e) => setNota(e.target.value)}
                      placeholder="Ex: 16.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Feedback (opcional):
                    </label>
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Adicione comentários sobre o desempenho do aluno..."
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleSaveGrade}
                    className="w-full"
                    disabled={!nota}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Nota e Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default RevisarProvas;
