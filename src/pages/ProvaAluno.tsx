import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Clock, User, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useExams } from "@/hooks/useExams";
import { useExamSubmissions } from "@/hooks/useExamSubmissions";

const ProvaAluno = () => {
  const { id: examCode } = useParams();
  const { getExamByCode } = useExams();
  const { submitExam } = useExamSubmissions();
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("identificacao"); // identificacao, prova, finalizada
  const [nomeAluno, setNomeAluno] = useState("");
  const [tempoRestante, setTempoRestante] = useState(3600);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, any>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tentativasCola, setTentativasCola] = useState(0);

  // Buscar dados da prova
  useEffect(() => {
    const fetchExam = async () => {
      if (!examCode) return;
      
      try {
        const examData = await getExamByCode(examCode);
        if (examData) {
          setExam(examData);
          setTempoRestante(examData.duration_minutes * 60);
        } else {
          toast({
            title: "Prova não encontrada",
            description: "O código da prova não é válido.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Erro ao carregar prova:', error);
        toast({
          title: "Erro ao carregar prova",
          description: "Não foi possível carregar a prova.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examCode, getExamByCode]);

  // Timer da prova
  useEffect(() => {
    if (step === "prova" && tempoRestante > 0) {
      const timer = setInterval(() => {
        setTempoRestante(prev => {
          if (prev <= 1) {
            finalizarProva();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, tempoRestante]);

  // Sistema anti-cola
  useEffect(() => {
    if (step === "prova") {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
        if (!document.fullscreenElement && step === "prova") {
          setTentativasCola(prev => prev + 1);
          toast({
            title: "Aviso de Segurança!",
            description: "Você saiu da tela cheia. Retorne imediatamente!",
            variant: "destructive",
          });
          
          if (tentativasCola >= 2) {
            toast({
              title: "Prova Cancelada!",
              description: "Muitas tentativas de cola detectadas.",
              variant: "destructive",
            });
            setTimeout(() => finalizarProva(), 2000);
          }
        }
      };

      const handleVisibilityChange = () => {
        if (document.hidden && step === "prova") {
          setTentativasCola(prev => prev + 1);
          toast({
            title: "Tentativa de Cola Detectada!",
            description: "Você trocou de aba ou minimizou a janela.",
            variant: "destructive",
          });
        }
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, [step, tentativasCola]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const iniciarProva = async () => {
    if (!nomeAluno.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite seu nome para continuar.",
        variant: "destructive",
      });
      return;
    }

    try {
      await document.documentElement.requestFullscreen();
      setStep("prova");
      toast({
        title: "Prova iniciada!",
        description: "Boa sorte! Mantenha a tela cheia durante toda a prova.",
      });
    } catch (error) {
      toast({
        title: "Erro ao iniciar",
        description: "Não foi possível entrar em tela cheia. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const finalizarProva = async () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    
    try {
      if (exam) {
        await submitExam(exam.id, nomeAluno, respostas);
      }
      setStep("finalizada");
    } catch (error) {
      console.error('Erro ao enviar prova:', error);
    }
  };

  const handleResposta = (questaoId: number, resposta: any) => {
    setRespostas(prev => ({
      ...prev,
      [questaoId]: resposta
    }));
  };

  const renderQuestao = (questao: any) => {
    const resposta = respostas[questao.id];

    switch (questao.tipo) {
      case "multipla-escolha":
        return (
          <RadioGroup
            value={resposta?.toString() || ""}
            onValueChange={(value) => handleResposta(questao.id, parseInt(value))}
          >
            {questao.opcoes.map((opcao: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`opcao-${index}`} />
                <Label htmlFor={`opcao-${index}`}>{opcao}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "verdadeiro-falso":
        return (
          <RadioGroup
            value={resposta?.toString() || ""}
            onValueChange={(value) => handleResposta(questao.id, value === "true")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="verdadeiro" />
              <Label htmlFor="verdadeiro">Verdadeiro</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="falso" />
              <Label htmlFor="falso">Falso</Label>
            </div>
          </RadioGroup>
        );

      case "lacunas":
        return (
          <Input
            placeholder="Digite sua resposta..."
            value={resposta || ""}
            onChange={(e) => handleResposta(questao.id, e.target.value)}
          />
        );

      case "aberta":
        return (
          <Textarea
            placeholder="Digite sua resposta completa..."
            value={resposta || ""}
            onChange={(e) => handleResposta(questao.id, e.target.value)}
            rows={4}
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Carregando prova...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Prova não encontrada
            </h3>
            <p className="text-gray-500">
              O código da prova não é válido ou a prova não existe.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "identificacao") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <User className="h-6 w-6" />
              <span>Identificação do Aluno</span>
            </CardTitle>
            <CardDescription>
              {exam.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Informações da Prova</h3>
              <div className="space-y-1 text-sm text-blue-700">
                <p><strong>Código:</strong> {exam.exam_code}</p>
                <p><strong>Questões:</strong> {exam.questions?.length || 0}</p>
                <p><strong>Tempo:</strong> {exam.duration_minutes} minutos</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Importante:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• A prova será em tela cheia</li>
                    <li>• Não saia da tela cheia durante a prova</li>
                    <li>• Não troque de aba ou minimize a janela</li>
                    <li>• Tentativas de cola cancelarão a prova</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                placeholder="Digite seu nome completo"
                value={nomeAluno}
                onChange={(e) => setNomeAluno(e.target.value)}
              />
            </div>

            <Button onClick={iniciarProva} className="w-full">
              Iniciar Prova
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "prova" && exam.questions && exam.questions.length > 0) {
    const questaoAtualData = exam.questions[questaoAtual];
    const progresso = ((questaoAtual + 1) / exam.questions.length) * 100;

    return (
      <div className="min-h-screen bg-white p-4">
        {/* Header da Prova */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <h1 className="text-lg font-bold">{exam.title}</h1>
              <p className="text-sm text-gray-600">Aluno: {nomeAluno}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-red-600">
                <Clock className="h-5 w-5" />
                <span className="font-mono text-lg">{formatTime(tempoRestante)}</span>
              </div>
              {tentativasCola > 0 && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm">Avisos: {tentativasCola}/3</span>
                </div>
              )}
            </div>
          </div>

          {/* Progresso */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Questão {questaoAtual + 1} de {exam.questions.length}</span>
              <span>{Math.round(progresso)}% concluído</span>
            </div>
            <Progress value={progresso} className="h-2" />
          </div>

          {/* Questão */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Questão {questaoAtual + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">{questaoAtualData.pergunta}</p>
              {renderQuestao(questaoAtualData)}
            </CardContent>
          </Card>

          {/* Navegação */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setQuestaoAtual(prev => Math.max(0, prev - 1))}
              disabled={questaoAtual === 0}
            >
              Anterior
            </Button>
            
            {questaoAtual === exam.questions.length - 1 ? (
              <Button onClick={finalizarProva} className="bg-green-600 hover:bg-green-700">
                Finalizar Prova
              </Button>
            ) : (
              <Button
                onClick={() => setQuestaoAtual(prev => Math.min(exam.questions.length - 1, prev + 1))}
              >
                Próxima
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === "finalizada") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span>Prova Finalizada!</span>
            </CardTitle>
            <CardDescription>
              Sua prova foi enviada com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">Resumo</h3>
              <div className="space-y-1 text-sm text-green-700">
                <p><strong>Aluno:</strong> {nomeAluno}</p>
                <p><strong>Questões respondidas:</strong> {Object.keys(respostas).length}/{exam.questions?.length || 0}</p>
                <p><strong>Tempo utilizado:</strong> {formatTime((exam.duration_minutes * 60) - tempoRestante)}</p>
                {tentativasCola > 0 && (
                  <p><strong>Avisos de segurança:</strong> {tentativasCola}</p>
                )}
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Suas respostas foram salvas automaticamente.
                Entre em contato com o professor para mais informações.
              </p>
              
              <Button
                onClick={() => window.open(`https://wa.me/5511999999999?text=Olá professor, finalizei a prova: ${exam.title}`, '_blank')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Falar com o Professor no WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default ProvaAluno;
