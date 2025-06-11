
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Class {
  id: string;
  name: string;
  description?: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  name: string;
  email?: string;
  student_number?: string;
  class_id?: string;
  created_at: string;
  updated_at: string;
}

export const useClasses = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { teacher } = useAuth();

  const fetchClasses = async () => {
    if (!teacher) {
      setLoading(false);
      return;
    }

    try {
      console.log('Buscando turmas para o professor:', teacher.id);
      
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', teacher.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar turmas:', error);
        throw error;
      }
      
      console.log('Turmas carregadas:', data);
      setClasses(data || []);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      toast({
        title: "Erro ao carregar turmas",
        description: "Não foi possível carregar as turmas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId?: string) => {
    try {
      let query = supabase.from('students').select('*');
      
      if (classId) {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) throw error;
      
      setStudents(data || []);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      toast({
        title: "Erro ao carregar alunos",
        description: "Não foi possível carregar a lista de alunos.",
        variant: "destructive",
      });
    }
  };

  const createClass = async (classData: {
    name: string;
    description?: string;
  }) => {
    if (!teacher) {
      toast({
        title: "Erro de autenticação",
        description: "É necessário estar logado para criar turmas.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Criando turma para o professor:', teacher.id);
      
      const { data, error } = await supabase
        .from('classes')
        .insert([{
          ...classData,
          teacher_id: teacher.id
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('Turma criada com sucesso:', data);
      setClasses(prev => [data, ...prev]);
      
      toast({
        title: "Turma criada com sucesso!",
        description: `A turma "${data.name}" foi criada.`,
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar turma:', error);
      toast({
        title: "Erro ao criar turma",
        description: "Não foi possível criar a turma.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addStudent = async (studentData: {
    name: string;
    email?: string;
    student_number?: string;
    class_id: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([studentData])
        .select()
        .single();

      if (error) throw error;

      setStudents(prev => [...prev, data]);
      
      toast({
        title: "Aluno adicionado com sucesso!",
        description: `${data.name} foi adicionado à turma.`,
      });

      return data;
    } catch (error) {
      console.error('Erro ao adicionar aluno:', error);
      toast({
        title: "Erro ao adicionar aluno",
        description: "Não foi possível adicionar o aluno.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteClass = async (classId: string) => {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;

      setClasses(prev => prev.filter(cls => cls.id !== classId));
      
      toast({
        title: "Turma removida",
        description: "A turma foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover turma:', error);
      toast({
        title: "Erro ao remover turma",
        description: "Não foi possível remover a turma.",
        variant: "destructive",
      });
    }
  };

  const deleteStudent = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;

      setStudents(prev => prev.filter(student => student.id !== studentId));
      
      toast({
        title: "Aluno removido",
        description: "O aluno foi removido da turma.",
      });
    } catch (error) {
      console.error('Erro ao remover aluno:', error);
      toast({
        title: "Erro ao remover aluno",
        description: "Não foi possível remover o aluno.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [teacher]);

  return {
    classes,
    students,
    loading,
    createClass,
    addStudent,
    deleteClass,
    deleteStudent,
    fetchStudents,
    refetch: fetchClasses
  };
};
