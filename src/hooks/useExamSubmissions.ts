
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ExamSubmission {
  id: string;
  exam_id: string;
  student_name: string;
  answers: any;
  feedback?: string;
  score: number;
  completed_at: string;
}

export const useExamSubmissions = (examId?: string) => {
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    if (!examId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('exam_submissions')
        .select('*')
        .eq('exam_id', examId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Erro ao carregar submissões:', error);
      toast({
        title: "Erro ao carregar submissões",
        description: "Não foi possível carregar as submissões.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitExam = async (examId: string, studentName: string, answers: any) => {
    try {
      const { data, error } = await supabase
        .from('exam_submissions')
        .insert([{
          exam_id: examId,
          student_name: studentName,
          answers: answers,
          score: 0 // Será calculado posteriormente
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Prova enviada com sucesso!",
        description: "Suas respostas foram salvas.",
      });

      return data;
    } catch (error) {
      console.error('Erro ao enviar prova:', error);
      toast({
        title: "Erro ao enviar prova",
        description: "Não foi possível enviar suas respostas.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [examId]);

  return {
    submissions,
    loading,
    submitExam,
    refetch: fetchSubmissions
  };
};
