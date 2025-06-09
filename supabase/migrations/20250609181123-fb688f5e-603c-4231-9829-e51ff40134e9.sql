
-- Adicionar colunas para tipos de perguntas mais complexos
ALTER TABLE public.exams 
ADD COLUMN IF NOT EXISTS question_types jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS question_details jsonb DEFAULT '{}';

-- Atualizar a tabela de submissões para armazenar respostas detalhadas
ALTER TABLE public.exam_submissions 
ADD COLUMN IF NOT EXISTS detailed_answers jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS question_responses jsonb DEFAULT '{}';

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_exams_question_types ON public.exams USING gin(question_types);
CREATE INDEX IF NOT EXISTS idx_submissions_detailed_answers ON public.exam_submissions USING gin(detailed_answers);
