
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Save } from "lucide-react";
import { useExamSubmissions } from "@/hooks/useExamSubmissions";

interface AddManualGradeProps {
  examId: string;
  onGradeAdded: () => void;
}

const AddManualGrade = ({ examId, onGradeAdded }: AddManualGradeProps) => {
  const [studentName, setStudentName] = useState("");
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addManualGrade } = useExamSubmissions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentName.trim() || !score.trim()) {
      return;
    }

    const scoreNum = parseInt(score);
    if (scoreNum < 0 || scoreNum > 100) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addManualGrade(examId, studentName.trim(), scoreNum, feedback.trim() || undefined);
      setStudentName("");
      setScore("");
      setFeedback("");
      onGradeAdded();
    } catch (error) {
      console.error('Erro ao adicionar nota manual:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Adicionar Nota Manual
        </CardTitle>
        <CardDescription>
          Adicione uma nota para um aluno que não fez a prova online
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentName">Nome do Aluno *</Label>
              <Input
                id="studentName"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Digite o nome completo"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="score">Nota (0-100) *</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Ex: 85"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Observações (opcional)</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Adicione comentários sobre a avaliação..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || !studentName.trim() || !score.trim()}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Adicionando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                <span>Adicionar Nota</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddManualGrade;
