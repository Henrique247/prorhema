
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target, 
  TrendingUp, 
  Award,
  Star,
  Trophy,
  Home,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";

interface ResultadosDetalhadosProps {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  correctAnswers: number;
  studentName: string;
  examTitle: string;
  feedback?: string;
  onRetry?: () => void;
}

const ResultadosDetalhados = ({
  score,
  totalQuestions,
  timeSpent,
  correctAnswers,
  studentName,
  examTitle,
  feedback,
  onRetry
}: ResultadosDetalhadosProps) => {
  const percentage = (correctAnswers / totalQuestions) * 100;
  const isPassed = score >= 10;
  
  const getPerformanceLevel = () => {
    if (score >= 18) return { level: "Excelente", color: "text-green-600", icon: Trophy };
    if (score >= 14) return { level: "Muito Bom", color: "text-blue-600", icon: Award };
    if (score >= 10) return { level: "Bom", color: "text-yellow-600", icon: Star };
    return { level: "Precisa Melhorar", color: "text-red-600", icon: Target };
  };

  const performance = getPerformanceLevel();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getScoreColor = () => {
    if (score >= 14) return "text-green-600";
    if (score >= 10) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              {isPassed ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {isPassed ? "Parabéns!" : "Continue tentando!"}
            </CardTitle>
            <CardDescription className="text-lg">
              {studentName}, você {isPassed ? "foi aprovado" : "não foi aprovado"} em "{examTitle}"
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Score Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <performance.icon className={`h-6 w-6 ${performance.color}`} />
              Resultado Final
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor()}`}>
                  {score}/20
                </div>
                <p className="text-sm text-gray-600 mt-1">Nota Final</p>
                <Badge 
                  className={`mt-2 ${isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                  {isPassed ? 'Aprovado' : 'Reprovado'}
                </Badge>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {correctAnswers}/{totalQuestions}
                </div>
                <p className="text-sm text-gray-600 mt-1">Respostas Corretas</p>
                <Badge variant="outline" className="mt-2">
                  {percentage.toFixed(1)}% de acerto
                </Badge>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">
                  <Clock className="h-6 w-6 inline mr-1" />
                  {formatTime(timeSpent)}
                </div>
                <p className="text-sm text-gray-600 mt-1">Tempo Gasto</p>
              </div>

              <div className="text-center">
                <div className={`text-2xl font-bold ${performance.color}`}>
                  <performance.icon className="h-6 w-6 inline mr-1" />
                  {performance.level}
                </div>
                <p className="text-sm text-gray-600 mt-1">Desempenho</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Análise de Desempenho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Taxa de Acerto</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        percentage >= 70 ? 'bg-green-500' : 
                        percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold">{percentage.toFixed(1)}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Pontos Fortes</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    {percentage >= 80 && <li>• Excelente compreensão do conteúdo</li>}
                    {timeSpent < 1800 && <li>• Boa gestão do tempo</li>}
                    {correctAnswers > totalQuestions * 0.7 && <li>• Respostas bem fundamentadas</li>}
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Áreas de Melhoria</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {percentage < 70 && <li>• Revisar conceitos fundamentais</li>}
                    {timeSpent > 2400 && <li>• Melhorar velocidade de resposta</li>}
                    {!isPassed && <li>• Praticar mais exercícios</li>}
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Próximos Passos</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Consultar material de apoio</li>
                    <li>• Discutir dúvidas com o professor</li>
                    <li>• Continuar praticando</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Card */}
        {feedback && (
          <Card>
            <CardHeader>
              <CardTitle>Feedback do Professor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">{feedback}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard-estudante">
                <Button className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Voltar ao Dashboard
                </Button>
              </Link>
              
              {onRetry && !isPassed && (
                <Button variant="outline" onClick={onRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Tentar Novamente
                </Button>
              )}
              
              <Link to="/portal-aluno">
                <Button variant="outline" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Portal Simples
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultadosDetalhados;
