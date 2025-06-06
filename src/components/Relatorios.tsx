
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Clock, FileText, Download, TrendingUp } from "lucide-react";

const Relatorios = () => {
  // Dados de exemplo
  const estatisticas = {
    totalProvas: 12,
    totalAlunos: 245,
    mediaGeral: 8.4,
    taxaAprovacao: 87
  };

  const provasRecentes = [
    {
      id: 1,
      titulo: "Prova de Matemática - Álgebra",
      alunos: 45,
      media: 8.2,
      aprovacao: 89,
      data: "2024-01-15"
    },
    {
      id: 2,
      titulo: "Avaliação de Português - Literatura",
      alunos: 38,
      media: 7.8,
      aprovacao: 84,
      data: "2024-01-10"
    },
    {
      id: 3,
      titulo: "Teste de História - Brasil Colonial",
      alunos: 52,
      media: 9.1,
      aprovacao: 92,
      data: "2024-01-08"
    }
  ];

  const getAprovacaoBadge = (taxa: number) => {
    if (taxa >= 90) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{taxa}%</Badge>;
    if (taxa >= 70) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{taxa}%</Badge>;
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{taxa}%</Badge>;
  };

  const getMediaBadge = (media: number) => {
    if (media >= 8) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{media}</Badge>;
    if (media >= 6) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{media}</Badge>;
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{media}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Provas</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.totalProvas}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Alunos</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.totalAlunos}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Média Geral</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.mediaGeral}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Aprovação</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.taxaAprovacao}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relatórios de Provas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Relatórios das Provas</CardTitle>
              <CardDescription>
                Desempenho detalhado de cada prova aplicada
              </CardDescription>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {provasRecentes.map((prova) => (
              <div key={prova.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{prova.titulo}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Alunos:</span>
                        <span className="ml-2 font-medium">{prova.alunos}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Média:</span>
                        {getMediaBadge(prova.media)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Aprovação:</span>
                        {getAprovacaoBadge(prova.aprovacao)}
                      </div>
                      <div>
                        <span className="text-gray-600">Data:</span>
                        <span className="ml-2 font-medium">
                          {new Date(prova.data).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Baixar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance ao Longo do Tempo</CardTitle>
          <CardDescription>
            Evolução da média das notas e taxa de aprovação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Gráfico de performance será exibido aqui</p>
              <p className="text-sm text-gray-400">Integração com biblioteca de gráficos em desenvolvimento</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análise Detalhada */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Disciplinas com Melhor Desempenho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">História</span>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">9.1</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Matemática</span>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">8.2</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Português</span>
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">7.8</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipos de Questão Mais Difíceis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Questões Abertas</span>
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">65% acerto</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Preencher Lacunas</span>
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">72% acerto</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Múltipla Escolha</span>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">85% acerto</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Relatorios;
