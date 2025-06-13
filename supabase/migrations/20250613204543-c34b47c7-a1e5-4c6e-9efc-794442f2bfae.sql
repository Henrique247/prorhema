
-- Corrigir políticas RLS existentes (com verificação de existência)

-- Corrigir políticas RLS para estudantes
DROP POLICY IF EXISTS "Users can view their own students" ON public.students;
DROP POLICY IF EXISTS "Users can create their own students" ON public.students;
DROP POLICY IF EXISTS "Users can update their own students" ON public.students;
DROP POLICY IF EXISTS "Users can delete their own students" ON public.students;
DROP POLICY IF EXISTS "Public can view students" ON public.students;
DROP POLICY IF EXISTS "Teachers can manage students in their classes" ON public.students;

-- Permitir que professores gerenciem estudantes de suas turmas
CREATE POLICY "Teachers can view students in their classes" 
  ON public.students 
  FOR SELECT 
  USING (
    class_id IN (
      SELECT id FROM public.classes WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can add students to their classes" 
  ON public.students 
  FOR INSERT 
  WITH CHECK (
    class_id IN (
      SELECT id FROM public.classes WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update students in their classes" 
  ON public.students 
  FOR UPDATE 
  USING (
    class_id IN (
      SELECT id FROM public.classes WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete students from their classes" 
  ON public.students 
  FOR DELETE 
  USING (
    class_id IN (
      SELECT id FROM public.classes WHERE teacher_id = auth.uid()
    )
  );

-- Corrigir políticas RLS para turmas
DROP POLICY IF EXISTS "Users can view their own classes" ON public.classes;
DROP POLICY IF EXISTS "Users can create their own classes" ON public.classes;
DROP POLICY IF EXISTS "Users can update their own classes" ON public.classes;
DROP POLICY IF EXISTS "Users can delete their own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can manage their own classes" ON public.classes;

CREATE POLICY "Teachers can view their own classes" 
  ON public.classes 
  FOR SELECT 
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can create their own classes" 
  ON public.classes 
  FOR INSERT 
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their own classes" 
  ON public.classes 
  FOR UPDATE 
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their own classes" 
  ON public.classes 
  FOR DELETE 
  USING (teacher_id = auth.uid());

-- Corrigir políticas RLS para provas (remover duplicadas primeiro)
DROP POLICY IF EXISTS "Users can view their own exams" ON public.exams;
DROP POLICY IF EXISTS "Users can create their own exams" ON public.exams;
DROP POLICY IF EXISTS "Users can update their own exams" ON public.exams;
DROP POLICY IF EXISTS "Users can delete their own exams" ON public.exams;
DROP POLICY IF EXISTS "Teachers can view their own exams" ON public.exams;
DROP POLICY IF EXISTS "Teachers can create their own exams" ON public.exams;
DROP POLICY IF EXISTS "Teachers can update their own exams" ON public.exams;
DROP POLICY IF EXISTS "Teachers can delete their own exams" ON public.exams;
DROP POLICY IF EXISTS "Public can view active exams by code" ON public.exams;

CREATE POLICY "Teachers can view their own exams" 
  ON public.exams 
  FOR SELECT 
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can create their own exams" 
  ON public.exams 
  FOR INSERT 
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their own exams" 
  ON public.exams 
  FOR UPDATE 
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their own exams" 
  ON public.exams 
  FOR DELETE 
  USING (teacher_id = auth.uid());

-- Permitir acesso público aos exams para alunos via exam_code
CREATE POLICY "Public can view active exams by code" 
  ON public.exams 
  FOR SELECT 
  USING (is_active = true);

-- Corrigir políticas para submissões
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.exam_submissions;
DROP POLICY IF EXISTS "Users can create their own submissions" ON public.exam_submissions;
DROP POLICY IF EXISTS "Teachers can view submissions for their exams" ON public.exam_submissions;
DROP POLICY IF EXISTS "Public can submit exam answers" ON public.exam_submissions;

CREATE POLICY "Teachers can view submissions for their exams" 
  ON public.exam_submissions 
  FOR SELECT 
  USING (
    exam_id IN (
      SELECT id FROM public.exams WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Public can submit exam answers" 
  ON public.exam_submissions 
  FOR INSERT 
  WITH CHECK (true);

-- Adicionar foreign key constraints corretas
ALTER TABLE public.exam_submissions 
DROP CONSTRAINT IF EXISTS exam_submissions_exam_id_fkey;

ALTER TABLE public.exam_submissions 
ADD CONSTRAINT exam_submissions_exam_id_fkey 
FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;

ALTER TABLE public.students 
DROP CONSTRAINT IF EXISTS students_class_id_fkey;

ALTER TABLE public.students 
ADD CONSTRAINT students_class_id_fkey 
FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;

-- Adicionar política para teachers table se não existir
DROP POLICY IF EXISTS "Teachers can view their own profile" ON public.teachers;

CREATE POLICY "Teachers can view their own profile" 
  ON public.teachers 
  FOR SELECT 
  USING (id = auth.uid());
