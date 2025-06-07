
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Teacher {
  id: string;
  name: string;
  email: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  teacher: Teacher | null;
  loading: boolean;
  login: (name: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há um professor logado no localStorage
    const savedTeacher = localStorage.getItem('loggedTeacher');
    if (savedTeacher) {
      setTeacher(JSON.parse(savedTeacher));
    }
    setLoading(false);
  }, []);

  const login = async (name: string, password: string): Promise<boolean> => {
    try {
      console.log('Tentando fazer login com:', { name, password });
      
      // Buscar professor na base de dados
      const { data: teacherData, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('name', name)
        .single();

      if (error) {
        console.error('Erro ao buscar professor:', error);
        toast({
          title: "Erro de login",
          description: "Professor não encontrado.",
          variant: "destructive",
        });
        return false;
      }

      // Verificar palavra-passe (por agora simples comparação - em produção seria hash)
      if (password === 'Promessa1@') {
        setTeacher(teacherData);
        localStorage.setItem('loggedTeacher', JSON.stringify(teacherData));
        
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${teacherData.name}!`,
        });
        return true;
      } else {
        toast({
          title: "Erro de login",
          description: "Palavra-passe incorreta.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro de login",
        description: "Erro interno do sistema.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setTeacher(null);
    localStorage.removeItem('loggedTeacher');
    toast({
      title: "Logout realizado",
      description: "Até à próxima!",
    });
  };

  return (
    <AuthContext.Provider value={{ teacher, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
