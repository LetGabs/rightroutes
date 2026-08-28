UPDATE public.user_roles SET role = 'logistica'::public.app_role
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'pipae.senai@gmail.com');