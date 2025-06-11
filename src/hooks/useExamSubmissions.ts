
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ExamSubmission {
  id: string;
  exam_id: string;
  student_name: string;
  answers: any;
  detailed_answers?: any;
  question_responses?: any;
  feedback?: string;
  score: number;
  completed_at: string;
  is_manual: boolean;
}

export const useExamSubmissions = () => {
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSubmissions = async (examId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exam_submissions')
        .select('*')
        .eq('exam_id', examId)
        .order('score', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Erro ao carregar submissões:', error);
      toast({
        title: "Erro ao carregar resultados",
        description: "Não foi possível carregar os resultados da prova.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitExam = async (examId: string, studentName: string, answers: any) => {
    try {
      // Calcular pontuação básica
      const score = Math.floor(Math.random() * 100); // Implementação temporária
      
      const { data, error } = await supabase
        .from('exam_submissions')
        .insert([{
          exam_id: examId,
          student_name: studentName,
          answers: answers,
          score: score,
          is_manual: false
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Prova enviada com sucesso!",
        description: `Pontuação: ${score}/100`,
      });

      return data;
    } catch (error) {
      console.error('Erro ao enviar prova:', error);
      toast({
        title: "Erro ao enviar prova",
        description: "Não foi possível enviar a prova.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addManualGrade = async (examId: string, studentName: string, score: number, feedback?: string) => {
    try {
      const { data, error } = await supabase
        .from('exam_submissions')
        .insert([{
          exam_id: examId,
          student_name: studentName,
          answers: {},
          score: score,
          feedback: feedback,
          is_manual: true
        }])
        .select()
        .single();

      if (error) throw error;

      setSubmissions(prev => [...prev, data].sort((a, b) => b.score - a.score));

      toast({
        title: "Nota adicionada com sucesso!",
        description: `Nota de ${score}/100 para ${studentName}`,
      });

      return data;
    } catch (error) {
      console.error('Erro ao adicionar nota manual:', error);
      toast({
        title: "Erro ao adicionar nota",
        description: "Não foi possível adicionar a nota manual.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSubmission = async (submissionId: string, updates: Partial<ExamSubmission>) => {
    try {
      const { data, error } = await supabase
        .from('exam_submissions')
        .update(updates)
        .eq('id', submissionId)
        .select()
        .single();

      if (error) throw error;

      setSubmissions(prev => 
        prev.map(sub => sub.id === submissionId ? { ...sub, ...data } : sub)
          .sort((a, b) => b.score - a.score)
      );

      toast({
        title: "Submissão atualizada",
        description: "A submissão foi atualizada com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar submissão:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a submissão.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteSubmission = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from('exam_submissions')
        .delete()
        .eq('id', submissionId);

      if (error) throw error;

      setSubmissions(prev => prev.filter(sub => sub.id !== submissionId));

      toast({
        title: "Submissão removida",
        description: "A submissão foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover submissão:', error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a submissão.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    submissions,
    loading,
    fetchSubmissions,
    submitExam,
    addManualGrade,
    updateSubmission,
    deleteSubmission
  };
};
