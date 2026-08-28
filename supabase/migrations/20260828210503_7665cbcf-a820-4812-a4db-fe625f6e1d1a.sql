-- 1) profiles: restringe leitura ao próprio perfil + logística
DROP POLICY IF EXISTS "profiles_select_auth" ON public.profiles;

CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "profiles_select_logistica"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'logistica'));

-- 2) user_roles: restringe leitura ao próprio papel + logística
DROP POLICY IF EXISTS "roles_select_auth" ON public.user_roles;

CREATE POLICY "roles_select_own"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "roles_select_logistica"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'logistica'));

-- 3) motoboys: dados completos (telefone) só para logística
DROP POLICY IF EXISTS "motoboys_select_auth" ON public.motoboys;

CREATE POLICY "motoboys_select_logistica"
ON public.motoboys FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'logistica'));

-- Visão pública com apenas nome/situação do motoboy (sem telefone)
CREATE OR REPLACE VIEW public.motoboys_publico
WITH (security_invoker = false) AS
  SELECT id, nome, ativo FROM public.motoboys;

GRANT SELECT ON public.motoboys_publico TO authenticated;

-- 4) Funções SECURITY DEFINER: revoga execução de anon; policies continuam funcionando
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;