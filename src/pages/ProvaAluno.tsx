
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Clock, User, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ProvaAluno = () => {
  const [step, setStep] = useState("identificacao"); // identificacao, prova, finalizada
  const [nomeAluno, setNomeAluno] = useState("");
  const [tempoRestante, setTempoRestante] = useState(3600); // 60 minutos em segundos
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, any>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tentativasCola, setTentativasCola] = useState(0);

  // Dados da prova (exemplo)
  const dadosProva = {
    titulo: "Prova de Matemática - Álgebra",
    disciplina: "Matemática",
    tempo: 60,
    questoes: [
      {
        id: 1,
        tipo: "multipla-escolha",
        pergunta: "Qual é o resultado de 2x + 3 = 7?",
        opcoes: ["x = 1", "x = 2", "x = 3", "x = 4"],
        correta: 1
      },
      {
        id: 2,
        tipo: "verdadeiro-falso",
        pergunta: "A equação x² - 4 = 0 tem duas soluções reais.",
        correta: true
      },
      {
        id: 3,
        tipo: "lacunas",
        pergunta: "Complete: A fórmula de Bhaskara é x = (-b ± √(_____ - 4ac)) / 2a",
        resposta: "b²"
      },
      {
        id: 4,
        tipo: "aberta",
        pergunta: "Explique o que é uma função quadrática e dê um exemplo."
      },
      {
        id: 5,
        tipo: "multipla-escolha",
        pergunta: "Qual é o vértice da parábola y = x² - 4x + 3?",
        opcoes: ["(2, -1)", "(2, 1)", "(-2, -1)", "(-2, 1)"],
        correta: 0
      }
    ]
  };

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

  const finalizarProva = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setStep("finalizada");
    
    // Simular download das respostas
    const dadosResposta = {
      aluno: nomeAluno,
      prova: dadosProva.titulo,
      respostas: respostas,
      tempoGasto: 3600 - tempoRestante,
      tentativasCola: tentativasCola
    };
    
    const blob = new Blob([JSON.stringify(dadosResposta, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prova_${nomeAluno.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
              {dadosProva.titulo}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Informações da Prova</h3>
              <div className="space-y-1 text-sm text-blue-700">
                <p><strong>Disciplina:</strong> {dadosProva.disciplina}</p>
                <p><strong>Questões:</strong> {dadosProva.questoes.length}</p>
                <p><strong>Tempo:</strong> {dadosProva.tempo} minutos</p>
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

  if (step === "prova") {
    const questaoAtualData = dadosProva.questoes[questaoAtual];
    const progresso = ((questaoAtual + 1) / dadosProva.questoes.length) * 100;

    return (
      <div className="min-h-screen bg-white p-4">
        {/* Header da Prova */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <h1 className="text-lg font-bold">{dadosProva.titulo}</h1>
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
              <span>Questão {questaoAtual + 1} de {dadosProva.questoes.length}</span>
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
            
            {questaoAtual === dadosProva.questoes.length - 1 ? (
              <Button onClick={finalizarProva} className="bg-green-600 hover:bg-green-700">
                Finalizar Prova
              </Button>
            ) : (
              <Button
                onClick={() => setQuestaoAtual(prev => Math.min(dadosProva.questoes.length - 1, prev + 1))}
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
                <p><strong>Questões respondidas:</strong> {Object.keys(respostas).length}/{dadosProva.questoes.length}</p>
                <p><strong>Tempo utilizado:</strong> {formatTime(3600 - tempoRestante)}</p>
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
                onClick={() => window.open(`https://wa.me/5511999999999?text=Olá professor, finalizei a prova: ${dadosProva.titulo}`, '_blank')}
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
