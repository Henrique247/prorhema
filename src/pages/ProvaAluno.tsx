
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Clock, User, AlertTriangle, CheckCircle, Smartphone, Monitor } from "lucide-react";
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
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

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

  // Sistema anti-cola RIGOROSO
  useEffect(() => {
    if (step === "prova") {
      const handleFullscreenChange = () => {
        const isCurrentlyFullscreen = !!document.fullscreenElement;
        setIsFullscreen(isCurrentlyFullscreen);
        
        if (!isCurrentlyFullscreen && step === "prova") {
          toast({
            title: "PROVA FINALIZADA!",
            description: "Você saiu da tela cheia. A prova foi encerrada automaticamente.",
            variant: "destructive",
          });
          setTimeout(() => finalizarProva(), 1000);
        }
      };

      const handleVisibilityChange = () => {
        if (document.hidden && step === "prova") {
          toast({
            title: "PROVA FINALIZADA!",
            description: "Você trocou de aba. A prova foi encerrada automaticamente.",
            variant: "destructive",
          });
          setTimeout(() => finalizarProva(), 1000);
        }
      };

      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (step === "prova") {
          e.preventDefault();
          e.returnValue = 'Você tem certeza que deseja sair? A prova será finalizada automaticamente.';
          setTimeout(() => finalizarProva(), 100);
          return e.returnValue;
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        // Bloquear teclas que podem ser usadas para trapacear
        if (step === "prova" && (
          e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.ctrlKey && e.key === 'u') ||
          (e.altKey && e.key === 'Tab')
        )) {
          e.preventDefault();
          toast({
            title: "PROVA FINALIZADA!",
            description: "Tentativa de usar ferramentas de desenvolvimento detectada.",
            variant: "destructive",
          });
          setTimeout(() => finalizarProva(), 1000);
        }
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("beforeunload", handleBeforeUnload);
      document.addEventListener("keydown", handleKeyDown);

      // Desabilitar menu de contexto
      const handleContextMenu = (e: MouseEvent) => {
        if (step === "prova") {
          e.preventDefault();
        }
      };
      document.addEventListener("contextmenu", handleContextMenu);

      return () => {
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("beforeunload", handleBeforeUnload);
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("contextmenu", handleContextMenu);
      };
    }
  }, [step]);

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
      if (!isMobile) {
        await document.documentElement.requestFullscreen();
      }
      setStep("prova");
      toast({
        title: "Prova iniciada!",
        description: isMobile ? 
          "Boa sorte! Não saia do aplicativo durante a prova." : 
          "Boa sorte! Mantenha a tela cheia durante toda a prova.",
      });
    } catch (error) {
      if (!isMobile) {
        toast({
          title: "Erro ao iniciar",
          description: "Não foi possível entrar em tela cheia. Tente novamente.",
          variant: "destructive",
        });
      } else {
        setStep("prova");
      }
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
            className="space-y-3"
          >
            {questao.opcoes.map((opcao: string, index: number) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                <RadioGroupItem value={index.toString()} id={`opcao-${index}`} className="mt-1" />
                <Label htmlFor={`opcao-${index}`} className="flex-1 cursor-pointer text-sm leading-relaxed">
                  {opcao}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "verdadeiro-falso":
        return (
          <RadioGroup
            value={resposta?.toString() || ""}
            onValueChange={(value) => handleResposta(questao.id, value === "true")}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
              <RadioGroupItem value="true" id="verdadeiro" />
              <Label htmlFor="verdadeiro" className="cursor-pointer">Verdadeiro</Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
              <RadioGroupItem value="false" id="falso" />
              <Label htmlFor="falso" className="cursor-pointer">Falso</Label>
            </div>
          </RadioGroup>
        );

      case "lacunas":
        return (
          <Input
            placeholder="Digite sua resposta..."
            value={resposta || ""}
            onChange={(e) => handleResposta(questao.id, e.target.value)}
            className="text-base p-4"
          />
        );

      case "aberta":
        return (
          <Textarea
            placeholder="Digite sua resposta completa..."
            value={resposta || ""}
            onChange={(e) => handleResposta(questao.id, e.target.value)}
            rows={isMobile ? 6 : 4}
            className="text-base p-4 resize-none"
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
          <CardContent className="p-8 md:p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Prova não encontrada
            </h3>
            <p className="text-gray-500 text-sm">
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
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center space-x-2 text-lg md:text-xl">
              {isMobile ? <Smartphone className="h-5 w-5 md:h-6 md:w-6" /> : <Monitor className="h-5 w-5 md:h-6 md:w-6" />}
              <span>Identificação do Aluno</span>
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              {exam.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 md:px-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
              <h3 className="font-medium text-blue-800 mb-2 text-sm md:text-base">Informações da Prova</h3>
              <div className="space-y-1 text-xs md:text-sm text-blue-700">
                <p><strong>Código:</strong> {exam.exam_code}</p>
                <p><strong>Questões:</strong> {exam.questions?.length || 0}</p>
                <p><strong>Tempo:</strong> {exam.duration_minutes} minutos</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs md:text-sm text-red-800">
                  <p className="font-medium mb-1">⚠️ IMPORTANTE - SISTEMA ANTI-COLA:</p>
                  <ul className="space-y-1 text-xs">
                    {!isMobile && <li>• A prova será em tela cheia</li>}
                    <li>• {isMobile ? 'NÃO saia do aplicativo' : 'NÃO saia da tela cheia'}</li>
                    <li>• NÃO troque de aba ou minimize</li>
                    <li>• NÃO use ferramentas de desenvolvimento</li>
                    <li>• <strong>QUALQUER tentativa de cola FINALIZARÁ a prova automaticamente</strong></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome" className="text-sm md:text-base">Nome Completo</Label>
              <Input
                id="nome"
                placeholder="Digite seu nome completo"
                value={nomeAluno}
                onChange={(e) => setNomeAluno(e.target.value)}
                className="text-base p-3 md:p-4"
              />
            </div>

            <Button onClick={iniciarProva} className="w-full text-base p-3 md:p-4">
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
      <div className="min-h-screen bg-white">
        {/* Header da Prova - Responsivo */}
        <div className="w-full px-4 py-3 md:py-4 bg-gray-50 border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-base md:text-lg font-bold truncate">{exam.title}</h1>
                <p className="text-xs md:text-sm text-gray-600 truncate">Aluno: {nomeAluno}</p>
              </div>
              <div className="flex items-center justify-between md:justify-end space-x-4 flex-shrink-0">
                <div className="flex items-center space-x-2 text-red-600">
                  <Clock className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="font-mono text-sm md:text-lg font-bold">{formatTime(tempoRestante)}</span>
                </div>
                {tentativasCola > 0 && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-xs md:text-sm">Avisos: {tentativasCola}/3</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24 md:pb-8">
          {/* Progresso - Responsivo */}
          <div className="mb-4 md:mb-6">
            <div className="flex justify-between text-xs md:text-sm text-gray-600 mb-2">
              <span>Questão {questaoAtual + 1} de {exam.questions.length}</span>
              <span>{Math.round(progresso)}% concluído</span>
            </div>
            <Progress value={progresso} className="h-2 md:h-3" />
          </div>

          {/* Questão - Responsivo */}
          <Card className="mb-6">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-sm md:text-base flex items-center space-x-2">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-xs md:text-sm font-bold">
                  {questaoAtual + 1}
                </span>
                <span>Questão {questaoAtual + 1}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <p className="text-sm md:text-lg leading-relaxed">{questaoAtualData.pergunta}</p>
              {renderQuestao(questaoAtualData)}
            </CardContent>
          </Card>
        </div>

        {/* Navegação - Fixo no mobile, normal no desktop */}
        <div className="fixed md:relative bottom-0 left-0 right-0 bg-white border-t md:border-t-0 p-4 md:p-0">
          <div className="max-w-4xl mx-auto flex justify-between">
            <Button
              variant="outline"
              onClick={() => setQuestaoAtual(prev => Math.max(0, prev - 1))}
              disabled={questaoAtual === 0}
              className="text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
            >
              Anterior
            </Button>
            
            {questaoAtual === exam.questions.length - 1 ? (
              <Button 
                onClick={finalizarProva} 
                className="bg-green-600 hover:bg-green-700 text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
              >
                Finalizar Prova
              </Button>
            ) : (
              <Button
                onClick={() => setQuestaoAtual(prev => Math.min(exam.questions.length - 1, prev + 1))}
                className="text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
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
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center space-x-2 text-lg md:text-xl">
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
              <span>Prova Finalizada!</span>
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              Sua prova foi enviada com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 md:px-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
              <h3 className="font-medium text-green-800 mb-2 text-sm md:text-base">Resumo</h3>
              <div className="space-y-1 text-xs md:text-sm text-green-700">
                <p><strong>Aluno:</strong> {nomeAluno}</p>
                <p><strong>Questões respondidas:</strong> {Object.keys(respostas).length}/{exam.questions?.length || 0}</p>
                <p><strong>Tempo utilizado:</strong> {formatTime((exam.duration_minutes * 60) - tempoRestante)}</p>
                {tentativasCola > 0 && (
                  <p><strong>Avisos de segurança:</strong> {tentativasCola}</p>
                )}
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs md:text-sm text-gray-600 mb-4">
                Suas respostas foram salvas automaticamente.
                Entre em contato com o professor para mais informações.
              </p>
              
              <Button
                onClick={() => window.open(`https://wa.me/5511999999999?text=Olá professor, finalizei a prova: ${exam.title}`, '_blank')}
                className="w-full bg-green-600 hover:bg-green-700 text-sm md:text-base p-3 md:p-4"
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
