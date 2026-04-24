-- Backfill Cal integration fields from static demo into tenant Supabase.
-- Run in SQL editor or `psql` against the project that owns `public.clients` + `public.client_cal_secrets`.
--
-- Schema baseline: apply migrations from the **seo-data-platform** repo only:
--   cd <path-to>/seo-data-platform && supabase db push
--   (or paste SQL from `seo-data-platform/supabase/migrations/` in order — see `seo-data-platform/supabase/README.md`).
--
-- Adjust `client_slug` and values to match your Cal.com account before executing.

-- 1) Public Cal metadata on `clients` (RLS: use service role in app; this script is for operators).
-- UPDATE public.clients
-- SET
--   cal_com_username = 'your-cal-username',
--   cal_com_canonical_event_slugs = '{"initial":"consultatie-initiala","session":"sedinta-individuala","couple":"terapie-cuplu"}'::jsonb,
--   cal_com_event_slugs = '{"initial":"15min","session":"30min","couple":"30min"}'::jsonb
-- WHERE client_slug = 'ana-ionescu';

-- 2) Per-client secrets (insert or upsert pattern depends on your constraints).
-- INSERT INTO public.client_cal_secrets (client_id, cal_api_key, cal_webhook_secret)
-- SELECT c.id, 'cal_live_xxx', 'whsec_xxx'
-- FROM public.clients c
-- WHERE c.client_slug = 'ana-ionescu'
-- ON CONFLICT (client_id) DO UPDATE SET
--   cal_api_key = EXCLUDED.cal_api_key,
--   cal_webhook_secret = EXCLUDED.cal_webhook_secret,
--   updated_at = now();

-- Rollback: delete secrets row and/or reset JSON columns to NULL, then rely on env + `config/clients/*.ts` again.
