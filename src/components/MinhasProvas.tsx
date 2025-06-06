
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Users, Clock, BarChart3, Share, Trash, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useExams } from "@/hooks/useExams";

const MinhasProvas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");
  const { exams, loading, deleteExam } = useExams();

  const filteredProvas = exams.filter(prova => {
    const matchesSearch = prova.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleCopyLink = (examCode: string) => {
    const link = `${window.location.origin}/prova/${examCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "O link da prova foi copiado para a área de transferência.",
    });
  };

  const handleDeleteProva = (id: string, titulo: string) => {
    deleteExam(id);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando provas...</p>
        </CardContent>
      </Card>
    );
  }

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
                placeholder="Buscar por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                    <h3 className="text-lg font-semibold">{prova.title}</h3>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativa</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Código: {prova.exam_code}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{prova.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>0 submissões</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Criada em {new Date(prova.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 lg:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(prova.exam_code)}
                    className="flex items-center gap-2"
                  >
                    <Share className="h-4 w-4" />
                    Compartilhar
                  </Button>
                  
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
                    onClick={() => handleDeleteProva(prova.id, prova.title)}
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
              {searchTerm
                ? "Tente ajustar os filtros de busca."
                : "Você ainda não criou nenhuma prova."}
            </p>
            {!searchTerm && (
              <Button>Criar Primeira Prova</Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MinhasProvas;
