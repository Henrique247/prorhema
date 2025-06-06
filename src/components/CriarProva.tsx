
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileText, Clock, Users, Settings, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CriarProva = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    titulo: "",
    disciplina: "",
    descricao: "",
    arquivo: null as File | null,
    paginasInicio: "",
    paginasFim: "",
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

  const handleTipoQuestaoChange = (tipo: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        tiposQuestoes: [...formData.tiposQuestoes, tipo]
      });
    } else {
      setFormData({
        ...formData,
        tiposQuestoes: formData.tiposQuestoes.filter(t => t !== tipo)
      });
    }
  };

  const handleGerarProva = () => {
    // Simular processamento de IA
    toast({
      title: "Gerando prova...",
      description: "A IA está analisando o PDF e gerando as questões.",
    });
    
    setTimeout(() => {
      setStep(4);
      toast({
        title: "Prova criada com sucesso!",
        description: "Sua prova foi gerada e está pronta para ser compartilhada.",
      });
    }, 3000);
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
              placeholder="Ex: Prova de Matemática - Álgebra"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="disciplina">Disciplina</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, disciplina: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a disciplina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="matematica">Matemática</SelectItem>
                <SelectItem value="portugues">Português</SelectItem>
                <SelectItem value="historia">História</SelectItem>
                <SelectItem value="geografia">Geografia</SelectItem>
                <SelectItem value="ciencias">Ciências</SelectItem>
                <SelectItem value="fisica">Física</SelectItem>
                <SelectItem value="quimica">Química</SelectItem>
                <SelectItem value="biologia">Biologia</SelectItem>
              </SelectContent>
            </Select>
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
          disabled={!formData.titulo || !formData.disciplina}
        >
          Próximo: Upload do Material
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Upload do Material de Estudo</span>
        </CardTitle>
        <CardDescription>
          Faça upload do PDF que será usado para gerar as questões
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">Clique para fazer upload do PDF</p>
            <p className="text-sm text-gray-500">ou arraste e solte o arquivo aqui</p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="mt-2" asChild>
                <span>Selecionar Arquivo PDF</span>
              </Button>
            </label>
          </div>
        </div>

        {formData.arquivo && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">{formData.arquivo.name}</p>
                <p className="text-sm text-green-600">
                  {(formData.arquivo.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="paginas-inicio">Página Inicial</Label>
            <Input
              id="paginas-inicio"
              type="number"
              placeholder="Ex: 1"
              value={formData.paginasInicio}
              onChange={(e) => setFormData({ ...formData, paginasInicio: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="paginas-fim">Página Final</Label>
            <Input
              id="paginas-fim"
              type="number"
              placeholder="Ex: 50"
              value={formData.paginasFim}
              onChange={(e) => setFormData({ ...formData, paginasFim: e.target.value })}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Defina o intervalo de páginas do PDF que será usado para gerar as questões
        </p>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setStep(1)}>
            Voltar
          </Button>
          <Button 
            onClick={() => setStep(3)} 
            className="flex-1"
            disabled={!formData.arquivo}
          >
            Próximo: Configurações da Prova
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Configurações da Prova</span>
        </CardTitle>
        <CardDescription>
          Configure como será a prova dos seus alunos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="numero-questoes">Número de Questões</Label>
            <Input
              id="numero-questoes"
              type="number"
              placeholder="Ex: 20"
              value={formData.numeroQuestoes}
              onChange={(e) => setFormData({ ...formData, numeroQuestoes: e.target.value })}
            />
          </div>
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

        <div>
          <Label className="text-base font-medium">Tipos de Questões</Label>
          <p className="text-sm text-gray-500 mb-3">Selecione os tipos de questões que deseja gerar</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: "multipla-escolha", label: "Múltipla Escolha" },
              { id: "verdadeiro-falso", label: "Verdadeiro ou Falso" },
              { id: "abertas", label: "Questões Abertas" },
              { id: "lacunas", label: "Preencher Lacunas" }
            ].map((tipo) => (
              <div key={tipo.id} className="flex items-center space-x-2">
                <Checkbox
                  id={tipo.id}
                  checked={formData.tiposQuestoes.includes(tipo.id)}
                  onCheckedChange={(checked) => 
                    handleTipoQuestaoChange(tipo.id, checked as boolean)
                  }
                />
                <Label htmlFor={tipo.id}>{tipo.label}</Label>
              </div>
            ))}
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
          <Button variant="outline" onClick={() => setStep(2)}>
            Voltar
          </Button>
          <Button 
            onClick={handleGerarProva} 
            className="flex-1"
            disabled={!formData.numeroQuestoes || !formData.tempoProva || formData.tiposQuestoes.length === 0}
          >
            Gerar Prova com IA
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
          Sua prova foi gerada e está pronta para ser compartilhada com os alunos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-medium text-green-800 mb-2">Link da Prova</h3>
          <div className="flex items-center space-x-2">
            <Input
              value="https://prova-ai.com/prova/abc123"
              readOnly
              className="bg-white"
            />
            <Button
              onClick={() => {
                navigator.clipboard.writeText("https://prova-ai.com/prova/abc123");
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
              <span className="text-blue-600">Disciplina:</span>
              <span className="ml-2">{formData.disciplina}</span>
            </div>
            <div>
              <span className="text-blue-600">Questões:</span>
              <span className="ml-2">{formData.numeroQuestoes}</span>
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
              setFormData({
                titulo: "",
                disciplina: "",
                descricao: "",
                arquivo: null,
                paginasInicio: "",
                paginasFim: "",
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
            {step === 2 && "Upload do Material"}
            {step === 3 && "Configurações"}
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
