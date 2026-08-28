CREATE TYPE public.app_role AS ENUM ('vendedor','logistica');
CREATE TYPE public.delivery_status AS ENUM ('aguardando_logistica','impressao_romaneios','pronto_saida','em_rota','aguardando_conferencia','concluido','nao_entregue','cancelado');
CREATE TYPE public.delivery_period AS ENUM ('manha','tarde_noite');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE TABLE public.motoboys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  telefone text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.motoboys TO authenticated;
GRANT ALL ON public.motoboys TO service_role;
ALTER TABLE public.motoboys ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_pedido text NOT NULL,
  numero_romaneio text NOT NULL,
  cliente text NOT NULL,
  data_prevista date NOT NULL,
  periodo public.delivery_period NOT NULL,
  status public.delivery_status NOT NULL DEFAULT 'aguardando_logistica',
  vendedor_id uuid NOT NULL REFERENCES auth.users(id),
  motoboy_id uuid REFERENCES public.motoboys(id) ON DELETE SET NULL,
  observacoes text,
  motivo_nao_entrega text,
  conferido_em timestamptz,
  conferido_por uuid REFERENCES auth.users(id),
  impresso_em timestamptz,
  impresso_por uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX deliveries_status_idx ON public.deliveries(status);
CREATE INDEX deliveries_data_idx ON public.deliveries(data_prevista);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deliveries TO authenticated;
GRANT ALL ON public.deliveries TO service_role;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.delivery_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  usuario_id uuid REFERENCES auth.users(id),
  usuario_nome text,
  acao text NOT NULL,
  status_anterior public.delivery_status,
  status_novo public.delivery_status,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX delivery_history_delivery_idx ON public.delivery_history(delivery_id);
GRANT SELECT, INSERT ON public.delivery_history TO authenticated;
GRANT ALL ON public.delivery_history TO service_role;
ALTER TABLE public.delivery_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_auth" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'logistica')) WITH CHECK (public.has_role(auth.uid(),'logistica'));

CREATE POLICY "roles_select_auth" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "roles_admin_all" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'logistica')) WITH CHECK (public.has_role(auth.uid(),'logistica'));

CREATE POLICY "motoboys_select_auth" ON public.motoboys FOR SELECT TO authenticated USING (true);
CREATE POLICY "motoboys_admin_all" ON public.motoboys FOR ALL TO authenticated USING (public.has_role(auth.uid(),'logistica')) WITH CHECK (public.has_role(auth.uid(),'logistica'));

CREATE POLICY "deliveries_select_auth" ON public.deliveries FOR SELECT TO authenticated USING (true);
CREATE POLICY "deliveries_insert_own" ON public.deliveries FOR INSERT TO authenticated WITH CHECK (vendedor_id = auth.uid() AND status = 'aguardando_logistica');
CREATE POLICY "deliveries_admin_update" ON public.deliveries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'logistica')) WITH CHECK (public.has_role(auth.uid(),'logistica'));
CREATE POLICY "deliveries_admin_delete" ON public.deliveries FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'logistica'));

CREATE POLICY "history_select_auth" ON public.delivery_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "history_insert_auth" ON public.delivery_history FOR INSERT TO authenticated WITH CHECK (usuario_id = auth.uid());

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER deliveries_updated_at BEFORE UPDATE ON public.deliveries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), COALESCE(NEW.email,''));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN NEW.raw_user_meta_data->>'role' = 'logistica' THEN 'logistica'::public.app_role ELSE 'vendedor'::public.app_role END);
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();