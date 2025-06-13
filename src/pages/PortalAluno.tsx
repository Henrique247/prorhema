import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, Award, Clock, User, Calendar, FileText, Monitor, Eye, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface StudentExam {
  id: string;
  title: string;
  exam_code: string;
  duration_minutes: number;
  created_at: string;
  class?: {
    name: string;
  };
}

interface StudentGrade {
  id: string;
  score: number;
  feedback?: string;
  completed_at: string;
  exam: {
    title: string;
    exam_code: string;
  };
}

const PortalAluno = () => {
  const [studentName, setStudentName] = useState("");
  const [studentData, setStudentData] = useState<any>(null);
  const [availableExams, setAvailableExams] = useState<StudentExam[]>([]);
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("exams");
  const [examLink, setExamLink] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Detectar mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const searchStudent = async () => {
    if (!studentName.trim()) {
      toast({
        title: "Nome necessário",
        description: "Por favor, insira seu nome para acessar o portal.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Buscar dados do aluno
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select(`
          *,
          classes (
            name,
            teacher_id
          )
        `)
        .ilike('name', `%${studentName.trim()}%`)
        .single();

      if (studentError) {
        console.log('Aluno não encontrado no sistema, permitindo acesso livre');
        setStudentData({ name: studentName.trim(), isRegistered: false });
      } else {
        setStudentData({ ...student, isRegistered: true });
      }

      // Buscar provas disponíveis
      const { data: exams, error: examsError } = await supabase
        .from('exams')
        .select(`
          id,
          title,
          exam_code,
          duration_minutes,
          created_at,
          classes (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (examsError) throw examsError;
      setAvailableExams(exams || []);

      // Buscar notas do aluno - corrigindo o tipo
      const { data: grades, error: gradesError } = await supabase
        .from('exam_submissions')
        .select(`
          id,
          score,
          feedback,
          completed_at,
          exams!inner (
            title,
            exam_code
          )
        `)
        .ilike('student_name', `%${studentName.trim()}%`)
        .order('completed_at', { ascending: false });

      if (gradesError) throw gradesError;
      
      // Transformar os dados para o formato correto
      const transformedGrades: StudentGrade[] = (grades || []).map(grade => ({
        id: grade.id,
        score: grade.score,
        feedback: grade.feedback,
        completed_at: grade.completed_at,
        exam: {
          title: grade.exams.title,
          exam_code: grade.exams.exam_code
        }
      }));
      
      setStudentGrades(transformedGrades);

      toast({
        title: "Bem-vindo ao Portal do Aluno!",
        description: `Olá, ${studentName}! Aqui estão suas informações.`,
      });

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 14) return "bg-green-100 text-green-800 border-green-300";
    if (score >= 10) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const getScoreStatus = (score: number) => {
    if (score >= 10) return "Aprovado";
    return "Reprovado";
  };

  const calculateAverage = () => {
    if (studentGrades.length === 0) return 0;
    const sum = studentGrades.reduce((acc, grade) => acc + grade.score, 0);
    return (sum / studentGrades.length).toFixed(1);
  };

  const openExam = (examCode: string) => {
    window.open(`/prova/${examCode}`, '_blank');
  };

  const openExamFromLink = () => {
    if (!examLink.trim()) {
      toast({
        title: "Link necessário",
        description: "Por favor, insira o link da prova.",
        variant: "destructive",
      });
      return;
    }

    const linkParts = examLink.split('/');
    const examCode = linkParts[linkParts.length - 1];
    
    if (examCode) {
      window.open(`/prova/${examCode}`, '_blank');
    } else {
      toast({
        title: "Link inválido",
        description: "O link da prova não é válido.",
        variant: "destructive",
      });
    }
  };

  // Componente para exibir provas em mobile
  const ExamCard = ({ exam }: { exam: StudentExam }) => (
    <Card className="w-full">
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">{exam.title}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {exam.exam_code}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {exam.duration_minutes} min
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(exam.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
            {exam.class && (
              <Badge variant="secondary" className="mt-2 text-xs">{exam.class.name}</Badge>
            )}
          </div>
          <Button onClick={() => openExam(exam.exam_code)} className="w-full min-h-[44px] touch-manipulation">
            <Eye className="h-4 w-4 mr-2" />
            Realizar Prova
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Componente para exibir notas em mobile
  const GradeCard = ({ grade }: { grade: StudentGrade }) => (
    <Card className="w-full">
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight flex-1">{grade.exam.title}</h3>
            <Badge className={`${getScoreColor(grade.score)} text-xs ml-2 flex-shrink-0`}>
              {grade.score}/20
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-600">
              {new Date(grade.completed_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </span>
            <Badge variant={grade.score >= 10 ? "default" : "destructive"} className="text-xs">
              {getScoreStatus(grade.score)}
            </Badge>
          </div>
          {grade.feedback && (
            <div className="p-2 sm:p-3 bg-blue-50 rounded-lg">
              <p className="text-xs sm:text-sm font-medium text-blue-800 mb-1">
                Feedback do Professor:
              </p>
              <p className="text-xs sm:text-sm text-blue-700">{grade.feedback}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-blue-600 rounded-lg p-1.5 sm:p-2">
                <Monitor className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Portal do Aluno</h1>
                <p className="text-xs sm:text-sm text-gray-500">Multimédia e Design</p>
              </div>
            </div>
            {studentData && (
              <div className="text-right">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">{studentData.name}</p>
                <p className="text-xs text-gray-500">
                  {studentData.isRegistered ? 'Registrado' : 'Acesso Livre'}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {!studentData ? (
          // Login Form - Otimizado para mobile
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center px-4 sm:px-6">
              <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl">
                <User className="h-5 w-5 sm:h-6 sm:w-6" />
                Acesso ao Portal
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Digite seu nome para acessar suas provas e notas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              <div>
                <Input
                  placeholder="Digite seu nome completo..."
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchStudent()}
                  className="text-center text-base sm:text-lg p-3 sm:p-4 min-h-[48px] touch-manipulation"
                />
              </div>
              <Button 
                onClick={searchStudent} 
                disabled={loading || !studentName.trim()}
                className="w-full py-3 text-base min-h-[48px] touch-manipulation"
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Carregando...' : 'Entrar no Portal'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Student Dashboard - Otimizado para mobile
          <div className="space-y-4 sm:space-y-6">
            {/* Welcome Card */}
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6" />
                  Bem-vindo, {studentData.name}!
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {studentData.isRegistered 
                    ? `Turma: ${studentData.classes?.name || 'Não definida'}`
                    : 'Acesso livre às provas disponíveis'
                  }
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Stats Cards - Layout responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Provas Disponíveis</p>
                      <p className="text-xl sm:text-2xl font-bold">{availableExams.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <Award className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Provas Realizadas</p>
                      <p className="text-xl sm:text-2xl font-bold">{studentGrades.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Média Geral</p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {studentGrades.length > 0 ? calculateAverage() : '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs - Otimizado para mobile */}
            {isMobile ? (
              // Mobile: usar drawer para navegação
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="outline" className="flex-1 min-h-[44px] touch-manipulation">
                        <Menu className="h-4 w-4 mr-2" />
                        Menu
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Navegação</DrawerTitle>
                        <DrawerDescription>Escolha uma opção</DrawerDescription>
                      </DrawerHeader>
                      <div className="p-4 space-y-2">
                        <Button 
                          variant={activeTab === "exams" ? "default" : "outline"} 
                          onClick={() => setActiveTab("exams")}
                          className="w-full justify-start min-h-[44px] touch-manipulation"
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Provas Disponíveis
                        </Button>
                        <Button 
                          variant={activeTab === "link" ? "default" : "outline"} 
                          onClick={() => setActiveTab("link")}
                          className="w-full justify-start min-h-[44px] touch-manipulation"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Link da Prova
                        </Button>
                        <Button 
                          variant={activeTab === "grades" ? "default" : "outline"} 
                          onClick={() => setActiveTab("grades")}
                          className="w-full justify-start min-h-[44px] touch-manipulation"
                        >
                          <Award className="h-4 w-4 mr-2" />
                          Minhas Notas
                        </Button>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>

                {/* Conteúdo baseado na aba ativa */}
                {activeTab === "exams" && (
                  <Card>
                    <CardHeader className="px-4">
                      <CardTitle className="text-lg">Provas Disponíveis</CardTitle>
                      <CardDescription className="text-sm">
                        Clique em "Realizar Prova" para começar
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4">
                      {availableExams.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm">Nenhuma prova disponível no momento.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {availableExams.map((exam) => (
                            <ExamCard key={exam.id} exam={exam} />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {activeTab === "link" && (
                  <Card>
                    <CardHeader className="px-4">
                      <CardTitle className="text-lg">Acesso por Link da Prova</CardTitle>
                      <CardDescription className="text-sm">
                        Cole aqui o link da prova fornecido pelo professor
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 space-y-4">
                      <div>
                        <Input
                          placeholder="Cole o link da prova aqui..."
                          value={examLink}
                          onChange={(e) => setExamLink(e.target.value)}
                          className="text-center min-h-[48px] touch-manipulation"
                        />
                      </div>
                      <Button 
                        onClick={openExamFromLink}
                        disabled={!examLink.trim()}
                        className="w-full min-h-[48px] touch-manipulation"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Abrir Prova
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {activeTab === "grades" && (
                  <Card>
                    <CardHeader className="px-4">
                      <CardTitle className="text-lg">Histórico de Notas</CardTitle>
                      <CardDescription className="text-sm">
                        Suas notas e feedback das provas realizadas
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4">
                      {studentGrades.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          <Award className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm">Nenhuma prova realizada ainda.</p>
                          <p className="text-xs mt-1">Comece realizando uma prova disponível.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {studentGrades.map((grade) => (
                            <GradeCard key={grade.id} grade={grade} />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              // Desktop: usar tabs normais
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="exams" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Provas Disponíveis
                  </TabsTrigger>
                  <TabsTrigger value="link" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Link da Prova
                  </TabsTrigger>
                  <TabsTrigger value="grades" className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Minhas Notas
                  </TabsTrigger>
                </TabsList>

                {/* ... keep existing code (TabsContent for desktop) */}
                <TabsContent value="exams" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Provas Disponíveis</CardTitle>
                      <CardDescription>
                        Clique em "Realizar Prova" para começar
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {availableExams.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p>Nenhuma prova disponível no momento.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {availableExams.map((exam) => (
                            <div key={exam.id} className="border rounded-lg p-4 hover:bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <FileText className="h-3 w-3" />
                                      {exam.exam_code}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {exam.duration_minutes} min
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(exam.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                    {exam.class && (
                                      <Badge variant="secondary">{exam.class.name}</Badge>
                                    )}
                                  </div>
                                </div>
                                <Button onClick={() => openExam(exam.exam_code)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Realizar Prova
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="link" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Acesso por Link da Prova</CardTitle>
                      <CardDescription>
                        Cole aqui o link da prova fornecido pelo professor
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Input
                          placeholder="Cole o link da prova aqui..."
                          value={examLink}
                          onChange={(e) => setExamLink(e.target.value)}
                          className="text-center"
                        />
                      </div>
                      <Button 
                        onClick={openExamFromLink}
                        disabled={!examLink.trim()}
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Abrir Prova
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="grades" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Histórico de Notas</CardTitle>
                      <CardDescription>
                        Suas notas e feedback das provas realizadas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {studentGrades.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p>Nenhuma prova realizada ainda.</p>
                          <p className="text-sm">Comece realizando uma prova disponível.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {studentGrades.map((grade) => (
                            <div key={grade.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900">{grade.exam.title}</h3>
                                <Badge className={getScoreColor(grade.score)}>
                                  {grade.score}/20 - {getScoreStatus(grade.score)}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Realizada em: {new Date(grade.completed_at).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              {grade.feedback && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm font-medium text-blue-800 mb-1">
                                    Feedback do Professor:
                                  </p>
                                  <p className="text-sm text-blue-700">{grade.feedback}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortalAluno;
