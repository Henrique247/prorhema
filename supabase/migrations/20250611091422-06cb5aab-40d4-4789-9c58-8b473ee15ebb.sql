
-- Criar tabela para turmas/classes
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para alunos
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  student_number TEXT,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar relação entre provas e turmas
ALTER TABLE public.exams 
ADD COLUMN class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL;

-- Adicionar índices para melhor performance
CREATE INDEX idx_classes_teacher_id ON public.classes(teacher_id);
CREATE INDEX idx_students_class_id ON public.students(class_id);
CREATE INDEX idx_exams_class_id ON public.exams(class_id);
CREATE INDEX idx_exam_submissions_exam_id ON public.exam_submissions(exam_id);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para classes (professores podem ver/editar suas próprias turmas)
CREATE POLICY "Teachers can manage their own classes" 
  ON public.classes 
  FOR ALL 
  USING (teacher_id::text = (SELECT id::text FROM teachers WHERE id::text = teacher_id::text));

-- Políticas RLS para students (acesso público para leitura, professores podem gerir)
CREATE POLICY "Public can view students" 
  ON public.students 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

CREATE POLICY "Teachers can manage students in their classes" 
  ON public.students 
  FOR ALL 
  TO authenticated
  USING (class_id IN (
    SELECT id FROM public.classes WHERE teacher_id::text = (
      SELECT id::text FROM teachers WHERE id::text = auth.uid()::text
    )
  ));
