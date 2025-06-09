
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Exam {
  id: string;
  title: string;
  pdf_content?: string;
  exam_code: string;
  duration_minutes: number;
  questions?: any;
  question_types?: any;
  question_details?: any;
  teacher_id: string;
  created_at: string;
  updated_at: string;
}

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
}

export const useExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const { teacher } = useAuth();

  const fetchExams = async () => {
    if (!teacher) {
      setLoading(false);
      return;
    }

    try {
      console.log('Buscando provas para o professor:', teacher.id);
      
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('teacher_id', teacher.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar provas:', error);
        throw error;
      }
      
      console.log('Provas carregadas:', data);
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
    question_types?: any;
    question_details?: any;
  }) => {
    if (!teacher) {
      toast({
        title: "Erro de autenticação",
        description: "É necessário estar logado para criar provas.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Criando prova para o professor:', teacher.id);
      console.log('Dados da prova:', examData);
      
      // Primeiro gerar um código de prova usando a função da base de dados
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_exam_code');

      if (codeError) {
        console.error('Erro ao gerar código:', codeError);
        throw codeError;
      }

      console.log('Código gerado:', codeData);

      const examToInsert = {
        ...examData,
        exam_code: codeData,
        teacher_id: teacher.id
      };

      console.log('Inserindo prova:', examToInsert);

      const { data, error } = await supabase
        .from('exams')
        .insert([examToInsert])
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir prova:', error);
        throw error;
      }

      console.log('Prova criada com sucesso:', data);
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
        description: "Não foi possível criar a prova. Verifique os dados e tente novamente.",
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
  }, [teacher]);

  return {
    exams,
    loading,
    createExam,
    deleteExam,
    getExamByCode,
    refetch: fetchExams
  };
};
