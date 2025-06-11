
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Award, 
  Clock, 
  User, 
  Calendar, 
  FileText, 
  Eye, 
  Trophy,
  Target,
  TrendingUp,
  Medal,
  Star,
  LogOut,
  Home
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

interface StudentRanking {
  position: number;
  name: string;
  average: number;
  totalExams: number;
  badges: string[];
}

const DashboardEstudante = () => {
  const [studentData, setStudentData] = useState<any>(null);
  const [availableExams, setAvailableExams] = useState<StudentExam[]>([]);
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [ranking, setRanking] = useState<StudentRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [examLink, setExamLink] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem('student_data');
    if (!data) {
      navigate('/login-estudante');
      return;
    }
    
    const parsed = JSON.parse(data);
    setStudentData(parsed);
    loadStudentData(parsed.name);
  }, [navigate]);

  const loadStudentData = async (studentName: string) => {
    setLoading(true);
    try {
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

      // Buscar notas do estudante
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

      // Gerar ranking fictício
      generateRanking(transformedGrades, studentName);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRanking = (grades: StudentGrade[], currentStudent: string) => {
    const students = [
      { name: currentStudent, grades },
      { name: "Maria Santos", grades: [{ score: 18 }, { score: 16 }, { score: 19 }] },
      { name: "João Silva", grades: [{ score: 15 }, { score: 17 }, { score: 14 }] },
      { name: "Ana Costa", grades: [{ score: 20 }, { score: 18 }, { score: 17 }] },
      { name: "Pedro Lima", grades: [{ score: 12 }, { score: 14 }, { score: 16 }] },
    ];

    const rankingData = students.map(student => {
      const studentGrades = student.grades || [];
      const average = studentGrades.length > 0 
        ? studentGrades.reduce((sum, grade) => sum + grade.score, 0) / studentGrades.length 
        : 0;
      
      const badges = [];
      if (average >= 18) badges.push("Excelência");
      if (studentGrades.length >= 3) badges.push("Dedicado");
      if (average >= 15) badges.push("Aprovado");

      return {
        name: student.name,
        average: Number(average.toFixed(1)),
        totalExams: studentGrades.length,
        badges,
        position: 0
      };
    });

    // Ordenar por média
    rankingData.sort((a, b) => b.average - a.average);
    rankingData.forEach((student, index) => {
      student.position = index + 1;
    });

    setRanking(rankingData);
  };

  const handleLogout = () => {
    localStorage.removeItem('student_data');
    navigate('/login-estudante');
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

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "Excelência": return <Trophy className="h-3 w-3" />;
      case "Dedicado": return <Target className="h-3 w-3" />;
      case "Aprovado": return <Medal className="h-3 w-3" />;
      default: return <Star className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 rounded-lg p-2">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard do Estudante</h1>
                <p className="text-sm text-gray-500">Multimédia e Design</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{studentData?.name}</p>
                <p className="text-xs text-gray-500">
                  {studentData?.studentNumber ? `Nº ${studentData.studentNumber}` : 'Estudante'}
                </p>
              </div>
              <Link 
                to="/"
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
              >
                <Home className="h-4 w-4 mr-1" />
                Início
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Provas Disponíveis</p>
                  <p className="text-2xl font-bold">{availableExams.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Provas Realizadas</p>
                  <p className="text-2xl font-bold">{studentGrades.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Média Geral</p>
                  <p className="text-2xl font-bold">
                    {studentGrades.length > 0 ? calculateAverage() : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Posição no Ranking</p>
                  <p className="text-2xl font-bold">
                    {ranking.find(r => r.name === studentData?.name)?.position || '-'}º
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="exams" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="exams" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Provas
            </TabsTrigger>
            <TabsTrigger value="grades" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Notas
            </TabsTrigger>
            <TabsTrigger value="ranking" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Ranking
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Link
            </TabsTrigger>
          </TabsList>

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

          <TabsContent value="ranking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ranking dos Estudantes</CardTitle>
                <CardDescription>
                  Classificação baseada na média das notas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ranking.map((student) => (
                    <div 
                      key={student.name} 
                      className={`border rounded-lg p-4 ${
                        student.name === studentData?.name 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            student.position === 1 ? 'bg-yellow-500 text-white' :
                            student.position === 2 ? 'bg-gray-400 text-white' :
                            student.position === 3 ? 'bg-orange-500 text-white' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {student.position}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-500">
                              {student.totalExams} provas realizadas
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {student.average}/20
                          </p>
                          <div className="flex gap-1 mt-1">
                            {student.badges.map((badge, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {getBadgeIcon(badge)}
                                <span className="ml-1">{badge}</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardEstudante;
