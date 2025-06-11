
-- Adicionar colunas para gestão de provas
ALTER TABLE public.exams 
ADD COLUMN is_active boolean NOT NULL DEFAULT true,
ADD COLUMN expires_at timestamp with time zone DEFAULT (now() + interval '24 hours');

-- Adicionar coluna para notas manuais nas submissões
ALTER TABLE public.exam_submissions 
ADD COLUMN is_manual boolean NOT NULL DEFAULT false;

-- Criar função para desativar provas expiradas automaticamente
CREATE OR REPLACE FUNCTION public.deactivate_expired_exams()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.exams 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
END;
$$;

-- Criar trigger para definir data de expiração automaticamente
CREATE OR REPLACE FUNCTION public.set_exam_expiration()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := NEW.created_at + interval '24 hours';
  END IF;
  RETURN NEW;
END;
$$;

-- Criar trigger
CREATE TRIGGER set_exam_expiration_trigger
  BEFORE INSERT ON public.exams
  FOR EACH ROW
  EXECUTE FUNCTION public.set_exam_expiration();
