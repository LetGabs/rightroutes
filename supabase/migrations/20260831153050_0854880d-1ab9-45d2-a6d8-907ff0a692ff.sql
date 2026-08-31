CREATE TYPE public.delivery_type AS ENUM ('domicilio', 'transferencia');

CREATE TABLE public.unidades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.unidades TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.unidades TO authenticated;
GRANT ALL ON public.unidades TO service_role;
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unidades_select_auth" ON public.unidades FOR SELECT TO authenticated USING (true);
CREATE POLICY "unidades_admin_all" ON public.unidades FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'logistica'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'logistica'::public.app_role));

ALTER TABLE public.deliveries
  ADD COLUMN tipo_entrega public.delivery_type NOT NULL DEFAULT 'domicilio',
  ADD COLUMN unidade_origem_id UUID REFERENCES public.unidades(id),
  ADD COLUMN unidade_destino_id UUID REFERENCES public.unidades(id),
  ADD COLUMN numero_formulas INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN tem_revenda BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN quantidade_revenda INTEGER;

INSERT INTO public.unidades (nome) VALUES ('Matriz'), ('Filial'), ('Loja Catolé');