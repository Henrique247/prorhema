
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
  const [step, setStep] = useState("identificacao");
  const [nomeAluno, setNomeAluno] = useState("");
  const [tempoRestante, setTempoRestante] = useState(3600);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, any>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tentativasCola, setTentativasCola] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [examFinalized, setExamFinalized] = useState(false);

  // Detectar se é mobile e configurar viewport
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Configurar viewport para mobile
    const viewport = document.querySelector("meta[name=viewport]");
    if (viewport) {
      viewport.setAttribute("content", "width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0");
    }
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    // Prevenir zoom no mobile
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
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
            description: "O código da prova não é válido ou a prova não está ativa.",
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
    if (step === "prova" && tempoRestante > 0 && !examFinalized) {
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
  }, [step, tempoRestante, examFinalized]);

  // Sistema anti-cola OTIMIZADO para mobile
  useEffect(() => {
    if (step === "prova" && !examFinalized) {
      const handleFullscreenChange = () => {
        const isCurrentlyFullscreen = !!document.fullscreenElement;
        setIsFullscreen(isCurrentlyFullscreen);
        
        if (!isCurrentlyFullscreen && step === "prova" && !isMobile && !examFinalized) {
          toast({
            title: "PROVA FINALIZADA!",
            description: "Você saiu da tela cheia. A prova foi encerrada automaticamente.",
            variant: "destructive",
          });
          setTimeout(() => finalizarProva(), 1000);
        }
      };

      const handleVisibilityChange = () => {
        if (document.hidden && step === "prova" && !examFinalized) {
          toast({
            title: "PROVA FINALIZADA!",
            description: isMobile ? "Você saiu do aplicativo." : "Você trocou de aba.",
            variant: "destructive",
          });
          setTimeout(() => finalizarProva(), 1000);
        }
      };

      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (step === "prova" && !examFinalized) {
          e.preventDefault();
          e.returnValue = 'Você tem certeza que deseja sair? A prova será finalizada automaticamente.';
          setTimeout(() => finalizarProva(), 100);
          return e.returnValue;
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (step === "prova" && !examFinalized && (
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

      // Mobile: detectar gestos suspeitos
      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length > 1 && step === "prova" && !examFinalized) {
          e.preventDefault();
          toast({
            title: "Gesto não permitido!",
            description: "Use apenas um dedo durante a prova.",
            variant: "destructive",
          });
        }
      };

      // Mobile: detectar mudança de orientação
      const handleOrientationChange = () => {
        if (step === "prova" && !examFinalized && isMobile) {
          setTimeout(() => {
            if (screen.orientation?.angle !== 0) {
              toast({
                title: "Orientação incorreta!",
                description: "Mantenha o dispositivo na vertical durante a prova.",
                variant: "destructive",
              });
            }
          }, 100);
        }
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("beforeunload", handleBeforeUnload);
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("touchstart", handleTouchStart, { passive: false });
      window.addEventListener("orientationchange", handleOrientationChange);

      // Desabilitar menu de contexto
      const handleContextMenu = (e: MouseEvent) => {
        if (step === "prova") {
          e.preventDefault();
        }
      };
      document.addEventListener("contextmenu", handleContextMenu);

      const handlePopState = () => {
        if (step === "prova" && !examFinalized) {
          toast({
            title: "PROVA FINALIZADA!",
            description: "Tentativa de navegação detectada. A prova foi encerrada.",
            variant: "destructive",
          });
          setTimeout(() => finalizarProva(), 1000);
        }
      };
      window.addEventListener("popstate", handlePopState);

      return () => {
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("beforeunload", handleBeforeUnload);
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("orientationchange", handleOrientationChange);
        document.removeEventListener("contextmenu", handleContextMenu);
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [step, isMobile, examFinalized]);

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
          "Boa sorte! Não saia do aplicativo e mantenha o dispositivo na vertical." : 
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
    if (examFinalized) return;
    
    setExamFinalized(true);
    
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
      setStep("finalizada");
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
            className="space-y-2 sm:space-y-3"
          >
            {questao.opcoes.map((opcao: string, index: number) => (
              <div key={index} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg border hover:bg-gray-50 touch-manipulation">
                <RadioGroupItem value={index.toString()} id={`opcao-${index}`} className="mt-0.5 sm:mt-1 min-w-[20px]" />
                <Label htmlFor={`opcao-${index}`} className="flex-1 cursor-pointer text-sm sm:text-base leading-relaxed touch-manipulation">
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
            className="space-y-2 sm:space-y-3"
          >
            <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border hover:bg-gray-50 touch-manipulation">
              <RadioGroupItem value="true" id="verdadeiro" className="min-w-[20px]" />
              <Label htmlFor="verdadeiro" className="cursor-pointer text-base sm:text-lg touch-manipulation">Verdadeiro</Label>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border hover:bg-gray-50 touch-manipulation">
              <RadioGroupItem value="false" id="falso" className="min-w-[20px]" />
              <Label htmlFor="falso" className="cursor-pointer text-base sm:text-lg touch-manipulation">Falso</Label>
            </div>
          </RadioGroup>
        );

      case "lacunas":
        return (
          <Input
            placeholder="Digite sua resposta..."
            value={resposta || ""}
            onChange={(e) => handleResposta(questao.id, e.target.value)}
            className="text-base sm:text-lg p-3 sm:p-4 min-h-[48px] touch-manipulation"
          />
        );

      case "aberta":
        return (
          <Textarea
            placeholder="Digite sua resposta completa..."
            value={resposta || ""}
            onChange={(e) => handleResposta(questao.id, e.target.value)}
            rows={isMobile ? 8 : 6}
            className="text-base sm:text-lg p-3 sm:p-4 resize-none min-h-[120px] touch-manipulation"
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
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500 text-sm sm:text-base">Carregando prova...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 sm:p-8 md:p-12 text-center">
            <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              Prova não encontrada
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm">
              O código da prova não é válido, a prova não existe ou não está mais ativa.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "identificacao") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="flex items-center justify-center space-x-2 text-lg sm:text-xl">
              {isMobile ? <Smartphone className="h-5 w-5 sm:h-6 sm:w-6" /> : <Monitor className="h-5 w-5 sm:h-6 sm:w-6" />}
              <span>Identificação do Aluno</span>
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {exam.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <h3 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">Informações da Prova</h3>
              <div className="space-y-1 text-xs sm:text-sm text-blue-700">
                <p><strong>Código:</strong> {exam.exam_code}</p>
                <p><strong>Questões:</strong> {exam.questions?.length || 0}</p>
                <p><strong>Tempo:</strong> {exam.duration_minutes} minutos</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-red-800">
                  <p className="font-medium mb-1">⚠️ IMPORTANTE - SISTEMA ANTI-COLA RIGOROSO:</p>
                  <ul className="space-y-1 text-xs">
                    {!isMobile && <li>• A prova será em tela cheia obrigatória</li>}
                    <li>• {isMobile ? 'NÃO saia do aplicativo' : 'NÃO saia da tela cheia'}</li>
                    <li>• NÃO troque de aba, minimize ou navegue</li>
                    {isMobile && <li>• MANTENHA o dispositivo na vertical</li>}
                    {isMobile && <li>• USE apenas um dedo por vez</li>}
                    <li>• NÃO use ferramentas de desenvolvimento</li>
                    <li>• NÃO pressione botões de voltar/avançar</li>
                    <li>• <strong>QUALQUER violação FINALIZARÁ a prova AUTOMATICAMENTE</strong></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome" className="text-sm sm:text-base">Nome Completo</Label>
              <Input
                id="nome"
                placeholder="Digite seu nome completo"
                value={nomeAluno}
                onChange={(e) => setNomeAluno(e.target.value)}
                className="text-base p-3 sm:p-4 min-h-[48px] touch-manipulation"
              />
            </div>

            <Button onClick={iniciarProva} className="w-full text-base p-3 sm:p-4 min-h-[48px] touch-manipulation">
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
        {/* Header da Prova - Otimizado para mobile */}
        <div className="w-full px-3 sm:px-4 py-2 sm:py-3 md:py-4 bg-gray-50 border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col space-y-2 sm:space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-base md:text-lg font-bold truncate">{exam.title}</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Aluno: {nomeAluno}</p>
              </div>
              <div className="flex items-center justify-between md:justify-end space-x-3 sm:space-x-4 flex-shrink-0">
                <div className="flex items-center space-x-1 sm:space-x-2 text-red-600">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-mono text-sm sm:text-base md:text-lg font-bold">{formatTime(tempoRestante)}</span>
                </div>
                {tentativasCola > 0 && (
                  <div className="flex items-center space-x-1 sm:space-x-2 text-red-600">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-xs sm:text-sm">Avisos: {tentativasCola}/3</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6 pb-20 sm:pb-24 md:pb-8">
          {/* Progresso - Otimizado para mobile */}
          <div className="mb-3 sm:mb-4 md:mb-6">
            <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
              <span>Questão {questaoAtual + 1} de {exam.questions.length}</span>
              <span>{Math.round(progresso)}% concluído</span>
            </div>
            <Progress value={progresso} className="h-2 sm:h-3" />
          </div>

          {/* Questão - Otimizada para mobile */}
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
              <CardTitle className="text-sm sm:text-base md:text-lg flex items-center space-x-2">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                  {questaoAtual + 1}
                </span>
                <span className="leading-tight">Questão {questaoAtual + 1}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 md:space-y-6 px-3 sm:px-6">
              <p className="text-sm sm:text-base md:text-lg leading-relaxed">{questaoAtualData.pergunta}</p>
              {renderQuestao(questaoAtualData)}
            </CardContent>
          </Card>
        </div>

        {/* Navegação - Otimizada para mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 sm:p-4 z-10 md:relative md:border-t-0 md:p-0">
          <div className="max-w-4xl mx-auto flex justify-between items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setQuestaoAtual(prev => Math.max(0, prev - 1))}
              disabled={questaoAtual === 0}
              className="text-sm sm:text-base px-3 sm:px-4 md:px-6 py-2 sm:py-3 min-h-[44px] touch-manipulation flex-1 max-w-[120px]"
            >
              Anterior
            </Button>
            
            {questaoAtual === exam.questions.length - 1 ? (
              <Button 
                onClick={finalizarProva} 
                className="bg-green-600 hover:bg-green-700 text-sm sm:text-base px-3 sm:px-4 md:px-6 py-2 sm:py-3 min-h-[44px] touch-manipulation flex-1 max-w-[140px]"
              >
                Finalizar
              </Button>
            ) : (
              <Button
                onClick={() => setQuestaoAtual(prev => Math.min(exam.questions.length - 1, prev + 1))}
                className="text-sm sm:text-base px-3 sm:px-4 md:px-6 py-2 sm:py-3 min-h-[44px] touch-manipulation flex-1 max-w-[120px]"
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="flex items-center justify-center space-x-2 text-lg sm:text-xl">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <span>Prova Finalizada!</span>
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Sua prova foi enviada com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <h3 className="font-medium text-green-800 mb-2 text-sm sm:text-base">Resumo</h3>
              <div className="space-y-1 text-xs sm:text-sm text-green-700">
                <p><strong>Aluno:</strong> {nomeAluno}</p>
                <p><strong>Questões respondidas:</strong> {Object.keys(respostas).length}/{exam.questions?.length || 0}</p>
                <p><strong>Tempo utilizado:</strong> {formatTime((exam.duration_minutes * 60) - tempoRestante)}</p>
                {tentativasCola > 0 && (
                  <p><strong>Avisos de segurança:</strong> {tentativasCola}</p>
                )}
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                Suas respostas foram salvas automaticamente.
                Entre em contato com o professor para mais informações.
              </p>
              
              <Button
                onClick={() => window.open(`https://wa.me/5511999999999?text=Olá professor, finalizei a prova: ${exam.title}`, '_blank')}
                className="w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base p-3 sm:p-4 min-h-[48px] touch-manipulation"
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
