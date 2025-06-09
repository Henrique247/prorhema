
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Clock, Settings, CheckCircle, Plus, Trash } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useExams } from "@/hooks/useExams";

interface Questao {
  id: number;
  tipo: "multipla-escolha" | "verdadeiro-falso" | "aberta";
  pergunta: string;
  opcoes?: string[];
  resposta_correta?: string | number | boolean;
  pontos: number;
}

const CriarProva = () => {
  const [step, setStep] = useState(1);
  const [createdExam, setCreatedExam] = useState<any>(null);
  const { createExam } = useExams();
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    arquivo: null as File | null,
    numeroQuestoes: "",
    tiposQuestoes: [] as string[],
    tempoProva: "",
    whatsapp: "",
    antiCola: true,
    downloadAutomatico: true
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setFormData({ ...formData, arquivo: file });
      toast({
        title: "Arquivo carregado com sucesso!",
        description: `${file.name} foi carregado.`,
      });
    } else {
      toast({
        title: "Erro no arquivo",
        description: "Por favor, selecione apenas arquivos PDF.",
        variant: "destructive",
      });
    }
  };

  const adicionarQuestao = () => {
    const novaQuestao: Questao = {
      id: questoes.length + 1,
      tipo: "multipla-escolha",
      pergunta: "",
      opcoes: ["", "", "", ""],
      resposta_correta: 0,
      pontos: 1
    };
    setQuestoes([...questoes, novaQuestao]);
  };

  const removerQuestao = (id: number) => {
    setQuestoes(questoes.filter(q => q.id !== id));
  };

  const atualizarQuestao = (id: number, campo: string, valor: any) => {
    setQuestoes(questoes.map(q => {
      if (q.id === id) {
        const novaQuestao = { ...q, [campo]: valor };
        
        // Ajustar estrutura baseada no tipo
        if (campo === 'tipo') {
          switch (valor) {
            case 'multipla-escolha':
              novaQuestao.opcoes = ["", "", "", ""];
              novaQuestao.resposta_correta = 0;
              break;
            case 'verdadeiro-falso':
              novaQuestao.opcoes = ["Verdadeiro", "Falso"];
              novaQuestao.resposta_correta = true;
              break;
            case 'aberta':
              delete novaQuestao.opcoes;
              novaQuestao.resposta_correta = "";
              break;
          }
        }
        
        return novaQuestao;
      }
      return q;
    }));
  };

  const atualizarOpcao = (questaoId: number, opcaoIndex: number, valor: string) => {
    setQuestoes(questoes.map(q => 
      q.id === questaoId 
        ? { ...q, opcoes: q.opcoes?.map((op, idx) => idx === opcaoIndex ? valor : op) }
        : q
    ));
  };

  const handleGerarProva = async () => {
    if (questoes.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma questão à prova.",
        variant: "destructive",
      });
      return;
    }

    // Validar questões
    const questoesInvalidas = questoes.filter(q => 
      !q.pergunta.trim() || 
      (q.tipo === 'multipla-escolha' && q.opcoes?.some(op => !op.trim())) ||
      (q.tipo === 'aberta' && !q.resposta_correta)
    );

    if (questoesInvalidas.length > 0) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todas as questões completamente.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Criando prova...",
      description: "A prova está sendo criada com suas questões.",
    });
    
    try {
      const examData = {
        title: formData.titulo,
        pdf_content: formData.arquivo ? "PDF content processed" : undefined,
        duration_minutes: parseInt(formData.tempoProva),
        questions: questoes,
        question_types: questoes.map(q => q.tipo),
        question_details: questoes.reduce((acc, q) => {
          acc[q.id] = {
            tipo: q.tipo,
            pontos: q.pontos,
            opcoes: q.opcoes,
            resposta_correta: q.resposta_correta
          };
          return acc;
        }, {} as Record<number, any>)
      };

      const exam = await createExam(examData);
      setCreatedExam(exam);
      setStep(4);
    } catch (error) {
      console.error('Erro ao criar prova:', error);
    }
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Informações Básicas da Prova</span>
        </CardTitle>
        <CardDescription>
          Preencha as informações gerais sobre a prova
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="titulo">Título da Prova</Label>
            <Input
              id="titulo"
              placeholder="Ex: Prova de Design Gráfico - Identidade Visual"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            />
          </div>
          <div>
            <Label>Disciplina</Label>
            <Input
              value="Multimédia e Design"
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Disciplina fixa para este sistema
            </p>
          </div>
        </div>
        
        <div>
          <Label htmlFor="descricao">Descrição (Opcional)</Label>
          <Textarea
            id="descricao"
            placeholder="Adicione uma descrição sobre o conteúdo da prova..."
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="whatsapp">WhatsApp para Contato</Label>
          <Input
            id="whatsapp"
            placeholder="Ex: +5511999999999"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">
            Os alunos serão redirecionados para este WhatsApp após a prova
          </p>
        </div>

        <Button 
          onClick={() => setStep(2)} 
          className="w-full"
          disabled={!formData.titulo}
        >
          Próximo: Configurações da Prova
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Configurações da Prova</span>
        </CardTitle>
        <CardDescription>
          Configure o tempo e as opções de segurança
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tempo-prova">Tempo da Prova (minutos)</Label>
            <Input
              id="tempo-prova"
              type="number"
              placeholder="Ex: 60"
              value={formData.tempoProva}
              onChange={(e) => setFormData({ ...formData, tempoProva: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">Configurações de Segurança</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anti-cola"
                checked={formData.antiCola}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, antiCola: checked as boolean })
                }
              />
              <Label htmlFor="anti-cola">
                Sistema Anti-cola (Tela cheia obrigatória)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="download-automatico"
                checked={formData.downloadAutomatico}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, downloadAutomatico: checked as boolean })
                }
              />
              <Label htmlFor="download-automatico">
                Download automático das respostas
              </Label>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setStep(1)}>
            Voltar
          </Button>
          <Button 
            onClick={() => setStep(3)} 
            className="flex-1"
            disabled={!formData.tempoProva}
          >
            Próximo: Criar Questões
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Criar Questões da Prova</span>
        </CardTitle>
        <CardDescription>
          Adicione questões de múltipla escolha, verdadeiro/falso ou abertas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Questões ({questoes.length})</h3>
          <Button onClick={adicionarQuestao} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Questão
          </Button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {questoes.map((questao, index) => (
            <Card key={questao.id} className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Questão {index + 1}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removerQuestao(questao.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Questão</Label>
                    <Select 
                      value={questao.tipo} 
                      onValueChange={(value) => atualizarQuestao(questao.id, 'tipo', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multipla-escolha">Múltipla Escolha</SelectItem>
                        <SelectItem value="verdadeiro-falso">Verdadeiro/Falso</SelectItem>
                        <SelectItem value="aberta">Questão Aberta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Pontos</Label>
                    <Input
                      type="number"
                      min="1"
                      value={questao.pontos}
                      onChange={(e) => atualizarQuestao(questao.id, 'pontos', parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Pergunta</Label>
                  <Textarea
                    value={questao.pergunta}
                    onChange={(e) => atualizarQuestao(questao.id, 'pergunta', e.target.value)}
                    placeholder="Digite a pergunta aqui..."
                  />
                </div>

                {questao.tipo === 'multipla-escolha' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {questao.opcoes?.map((opcao, opcaoIndex) => (
                        <div key={opcaoIndex}>
                          <Label>Opção {String.fromCharCode(65 + opcaoIndex)}</Label>
                          <Input
                            value={opcao}
                            onChange={(e) => atualizarOpcao(questao.id, opcaoIndex, e.target.value)}
                            placeholder={`Opção ${String.fromCharCode(65 + opcaoIndex)}`}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <Label>Resposta Correta</Label>
                      <Select
                        value={questao.resposta_correta?.toString()}
                        onValueChange={(value) => atualizarQuestao(questao.id, 'resposta_correta', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Opção A</SelectItem>
                          <SelectItem value="1">Opção B</SelectItem>
                          <SelectItem value="2">Opção C</SelectItem>
                          <SelectItem value="3">Opção D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {questao.tipo === 'verdadeiro-falso' && (
                  <div>
                    <Label>Resposta Correta</Label>
                    <Select
                      value={questao.resposta_correta?.toString()}
                      onValueChange={(value) => atualizarQuestao(questao.id, 'resposta_correta', value === 'true')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Verdadeiro</SelectItem>
                        <SelectItem value="false">Falso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {questao.tipo === 'aberta' && (
                  <div>
                    <Label>Resposta Esperada (para referência)</Label>
                    <Textarea
                      value={questao.resposta_correta as string}
                      onChange={(e) => atualizarQuestao(questao.id, 'resposta_correta', e.target.value)}
                      placeholder="Digite a resposta esperada ou critérios de avaliação..."
                    />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {questoes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhuma questão adicionada ainda.</p>
            <p className="text-sm">Clique em "Adicionar Questão" para começar.</p>
          </div>
        )}

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setStep(2)}>
            Voltar
          </Button>
          <Button 
            onClick={handleGerarProva} 
            className="flex-1"
            disabled={questoes.length === 0}
          >
            Criar Prova
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span>Prova Criada com Sucesso!</span>
        </CardTitle>
        <CardDescription>
          Sua prova foi criada e está pronta para ser compartilhada com os alunos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-medium text-green-800 mb-2">Link da Prova</h3>
          <div className="flex items-center space-x-2">
            <Input
              value={`${window.location.origin}/prova/${createdExam?.exam_code || 'ABC123'}`}
              readOnly
              className="bg-white"
            />
            <Button
              onClick={() => {
                const link = `${window.location.origin}/prova/${createdExam?.exam_code || 'ABC123'}`;
                navigator.clipboard.writeText(link);
                toast({ title: "Link copiado!", description: "O link foi copiado para a área de transferência." });
              }}
            >
              Copiar
            </Button>
          </div>
          <p className="text-sm text-green-600 mt-2">
            Compartilhe este link com seus alunos para que eles possam acessar a prova
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Resumo da Prova</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-600">Título:</span>
              <span className="ml-2">{formData.titulo}</span>
            </div>
            <div>
              <span className="text-blue-600">Código:</span>
              <span className="ml-2">{createdExam?.exam_code || 'ABC123'}</span>
            </div>
            <div>
              <span className="text-blue-600">Questões:</span>
              <span className="ml-2">{questoes.length}</span>
            </div>
            <div>
              <span className="text-blue-600">Tempo:</span>
              <span className="ml-2">{formData.tempoProva} min</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setStep(1);
              setCreatedExam(null);
              setQuestoes([]);
              setFormData({
                titulo: "",
                descricao: "",
                arquivo: null,
                numeroQuestoes: "",
                tiposQuestoes: [],
                tempoProva: "",
                whatsapp: "",
                antiCola: true,
                downloadAutomatico: true
              });
            }}
          >
            Criar Nova Prova
          </Button>
          <Button className="flex-1">
            Ir para Minhas Provas
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Etapa {step} de 4
          </span>
          <span className="text-sm text-gray-500">
            {step === 1 && "Informações Básicas"}
            {step === 2 && "Configurações"}
            {step === 3 && "Criar Questões"}
            {step === 4 && "Prova Criada"}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
};

export default CriarProva;
