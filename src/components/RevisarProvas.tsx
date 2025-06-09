
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, User, Clock, CheckCircle, X, Save, Eye } from "lucide-react";
import { useExams } from "@/hooks/useExams";
import { useExamSubmissions } from "@/hooks/useExamSubmissions";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const RevisarProvas = () => {
  const { exams } = useExams();
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [examDetails, setExamDetails] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [nota, setNota] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchExamDetails = async (examId: string) => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single();

      if (error) throw error;
      setExamDetails(data);
    } catch (error) {
      console.error('Erro ao carregar detalhes da prova:', error);
    }
  };

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
      
      // Buscar detalhes da prova
      await fetchExamDetails(examId);
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

  const renderQuestionWithAnswer = (question: any, questionIndex: number, studentAnswer: any) => {
    const questionId = question.id || questionIndex + 1;
    const answer = studentAnswer?.[questionId] || studentAnswer?.[questionIndex];

    return (
      <div key={questionId} className="border rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-gray-900">
            Questão {questionIndex + 1} ({question.pontos || 1} ponto{(question.pontos || 1) > 1 ? 's' : ''})
          </h4>
          <Badge variant="outline" className="text-xs">
            {question.tipo === 'multipla-escolha' ? 'Múltipla Escolha' : 
             question.tipo === 'verdadeiro-falso' ? 'V/F' : 'Aberta'}
          </Badge>
        </div>
        
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-blue-800 font-medium mb-2">Pergunta:</p>
          <p className="text-blue-700">{question.pergunta}</p>
        </div>

        {question.tipo === 'multipla-escolha' && question.opcoes && (
          <div className="space-y-2">
            <p className="font-medium text-gray-700">Opções:</p>
            {question.opcoes.map((opcao: string, opcaoIndex: number) => (
              <div 
                key={opcaoIndex} 
                className={`p-2 rounded border ${
                  question.resposta_correta === opcaoIndex 
                    ? 'bg-green-50 border-green-200' 
                    : answer === opcaoIndex 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-gray-50 border-gray-200'
                }`}
              >
                <span className="font-medium">
                  {String.fromCharCode(65 + opcaoIndex)}) 
                </span>
                <span className="ml-2">{opcao}</span>
                {question.resposta_correta === opcaoIndex && (
                  <Badge className="ml-2 bg-green-600">Correta</Badge>
                )}
                {answer === opcaoIndex && answer !== question.resposta_correta && (
                  <Badge variant="destructive" className="ml-2">Selecionada</Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {question.tipo === 'verdadeiro-falso' && (
          <div className="space-y-2">
            <p className="font-medium text-gray-700">Opções:</p>
            <div className={`p-2 rounded border ${
              question.resposta_correta === true 
                ? 'bg-green-50 border-green-200' 
                : answer === true 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-gray-50 border-gray-200'
            }`}>
              Verdadeiro
              {question.resposta_correta === true && (
                <Badge className="ml-2 bg-green-600">Correta</Badge>
              )}
              {answer === true && answer !== question.resposta_correta && (
                <Badge variant="destructive" className="ml-2">Selecionada</Badge>
              )}
            </div>
            <div className={`p-2 rounded border ${
              question.resposta_correta === false 
                ? 'bg-green-50 border-green-200' 
                : answer === false 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-gray-50 border-gray-200'
            }`}>
              Falso
              {question.resposta_correta === false && (
                <Badge className="ml-2 bg-green-600">Correta</Badge>
              )}
              {answer === false && answer !== question.resposta_correta && (
                <Badge variant="destructive" className="ml-2">Selecionada</Badge>
              )}
            </div>
          </div>
        )}

        <div className="bg-yellow-50 p-3 rounded">
          <p className="text-yellow-800 font-medium mb-2">Resposta do Aluno:</p>
          <p className="text-yellow-700">
            {question.tipo === 'aberta' 
              ? answer || 'Não respondida'
              : question.tipo === 'multipla-escolha'
                ? answer !== undefined ? `Opção ${String.fromCharCode(65 + answer)}` : 'Não respondida'
                : answer !== undefined ? (answer ? 'Verdadeiro' : 'Falso') : 'Não respondida'
            }
          </p>
        </div>

        {question.tipo === 'aberta' && question.resposta_correta && (
          <div className="bg-green-50 p-3 rounded">
            <p className="text-green-800 font-medium mb-2">Resposta Esperada:</p>
            <p className="text-green-700">{question.resposta_correta}</p>
          </div>
        )}
      </div>
    );
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
          {selectedSubmission && examDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Corrigir Prova - {selectedSubmission.student_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Respostas Detalhadas */}
                <div>
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Respostas Detalhadas:
                  </h4>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {examDetails.questions?.map((question: any, index: number) => 
                      renderQuestionWithAnswer(question, index, selectedSubmission.answers)
                    )}
                  </div>
                </div>

                {/* Atribuir Nota */}
                <div className="space-y-4 border-t pt-4">
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
