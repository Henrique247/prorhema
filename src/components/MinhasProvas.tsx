
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Users, Clock, BarChart3, Share, Trash, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const MinhasProvas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");

  // Dados de exemplo das provas
  const provas = [
    {
      id: 1,
      titulo: "Prova de Matemática - Álgebra",
      disciplina: "Matemática",
      questoes: 25,
      tempo: 60,
      alunos: 45,
      status: "ativa",
      dataCreacao: "2024-01-15",
      link: "https://prova-ai.com/prova/abc123"
    },
    {
      id: 2,
      titulo: "Avaliação de Português - Literatura",
      disciplina: "Português",
      questoes: 20,
      tempo: 90,
      alunos: 38,
      status: "finalizada",
      dataCreacao: "2024-01-10",
      link: "https://prova-ai.com/prova/def456"
    },
    {
      id: 3,
      titulo: "Teste de História - Brasil Colonial",
      disciplina: "História",
      questoes: 15,
      tempo: 45,
      alunos: 52,
      status: "rascunho",
      dataCreacao: "2024-01-20",
      link: "https://prova-ai.com/prova/ghi789"
    }
  ];

  const filteredProvas = provas.filter(prova => {
    const matchesSearch = prova.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prova.disciplina.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todas" || prova.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativa":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativa</Badge>;
      case "finalizada":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Finalizada</Badge>;
      case "rascunho":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Rascunho</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "O link da prova foi copiado para a área de transferência.",
    });
  };

  const handleDeleteProva = (id: number, titulo: string) => {
    toast({
      title: "Prova removida",
      description: `"${titulo}" foi removida com sucesso.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Minhas Provas</CardTitle>
          <CardDescription>
            Gerencie todas as suas provas criadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por título ou disciplina..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="ativa">Ativas</SelectItem>
                  <SelectItem value="finalizada">Finalizadas</SelectItem>
                  <SelectItem value="rascunho">Rascunhos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Provas */}
      <div className="grid gap-6">
        {filteredProvas.map((prova) => (
          <Card key={prova.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">{prova.titulo}</h3>
                    {getStatusBadge(prova.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{prova.disciplina}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>{prova.questoes} questões</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{prova.tempo} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{prova.alunos} alunos</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Criada em {new Date(prova.dataCreacao).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 lg:w-auto">
                  {prova.status === "ativa" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(prova.link)}
                      className="flex items-center gap-2"
                    >
                      <Share className="h-4 w-4" />
                      Compartilhar
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Resultados
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProva(prova.id, prova.titulo)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash className="h-4 w-4" />
                    Remover
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProvas.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma prova encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== "todas"
                ? "Tente ajustar os filtros de busca."
                : "Você ainda não criou nenhuma prova."}
            </p>
            {!searchTerm && statusFilter === "todas" && (
              <Button>Criar Primeira Prova</Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MinhasProvas;
