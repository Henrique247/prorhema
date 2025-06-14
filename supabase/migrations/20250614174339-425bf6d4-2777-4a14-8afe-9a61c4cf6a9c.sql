
-- Corrigir políticas RLS para permitir funcionamento sem autenticação completa

-- Remover políticas restritivas existentes para exam_submissions
DROP POLICY IF EXISTS "Teachers can view submissions for their exams" ON public.exam_submissions;
DROP POLICY IF EXISTS "Public can submit exam answers" ON public.exam_submissions;

-- Criar políticas mais permissivas para exam_submissions
CREATE POLICY "Allow all read access to exam_submissions" 
  ON public.exam_submissions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow all insert access to exam_submissions" 
  ON public.exam_submissions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow all update access to exam_submissions" 
  ON public.exam_submissions 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow all delete access to exam_submissions" 
  ON public.exam_submissions 
  FOR DELETE 
  USING (true);

-- Remover políticas restritivas existentes para exams
DROP POLICY IF EXISTS "Teachers can view their own exams" ON public.exams;
DROP POLICY IF EXISTS "Teachers can create their own exams" ON public.exams;
DROP POLICY IF EXISTS "Teachers can update their own exams" ON public.exams;
DROP POLICY IF EXISTS "Teachers can delete their own exams" ON public.exams;
DROP POLICY IF EXISTS "Public can view active exams by code" ON public.exams;

-- Criar políticas mais permissivas para exams
CREATE POLICY "Allow all access to exams" 
  ON public.exams 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Remover políticas restritivas existentes para classes
DROP POLICY IF EXISTS "Teachers can view their own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can create their own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can update their own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can delete their own classes" ON public.classes;

-- Criar políticas mais permissivas para classes
CREATE POLICY "Allow all access to classes" 
  ON public.classes 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Remover políticas restritivas existentes para students
DROP POLICY IF EXISTS "Teachers can view students in their classes" ON public.students;
DROP POLICY IF EXISTS "Teachers can add students to their classes" ON public.students;
DROP POLICY IF EXISTS "Teachers can update students in their classes" ON public.students;
DROP POLICY IF EXISTS "Teachers can delete students from their classes" ON public.students;

-- Criar políticas mais permissivas para students
CREATE POLICY "Allow all access to students" 
  ON public.students 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Remover políticas restritivas existentes para teachers
DROP POLICY IF EXISTS "Teachers can view their own profile" ON public.teachers;

-- Criar políticas mais permissivas para teachers
CREATE POLICY "Allow all access to teachers" 
  ON public.teachers 
  FOR ALL 
  USING (true)
  WITH CHECK (true);
