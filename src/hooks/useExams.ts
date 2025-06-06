
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Exam {
  id: string;
  title: string;
  pdf_content?: string;
  exam_code: string;
  duration_minutes: number;
  questions?: any;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ExamSubmission {
  id: string;
  exam_id: string;
  student_name: string;
  answers: any;
  feedback?: string;
  score: number;
  completed_at: string;
}

export const useExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Erro ao carregar provas:', error);
      toast({
        title: "Erro ao carregar provas",
        description: "Não foi possível carregar as provas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createExam = async (examData: {
    title: string;
    pdf_content?: string;
    duration_minutes: number;
    questions?: any;
  }) => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .insert([{
          ...examData,
          created_by: 'temp-user-id' // Será substituído quando implementarmos auth
        }])
        .select()
        .single();

      if (error) throw error;

      setExams(prev => [data, ...prev]);
      
      toast({
        title: "Prova criada com sucesso!",
        description: `Código da prova: ${data.exam_code}`,
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar prova:', error);
      toast({
        title: "Erro ao criar prova",
        description: "Não foi possível criar a prova.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteExam = async (examId: string) => {
    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', examId);

      if (error) throw error;

      setExams(prev => prev.filter(exam => exam.id !== examId));
      
      toast({
        title: "Prova removida",
        description: "A prova foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover prova:', error);
      toast({
        title: "Erro ao remover prova",
        description: "Não foi possível remover a prova.",
        variant: "destructive",
      });
    }
  };

  const getExamByCode = async (examCode: string) => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('exam_code', examCode)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar prova:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return {
    exams,
    loading,
    createExam,
    deleteExam,
    getExamByCode,
    refetch: fetchExams
  };
};
