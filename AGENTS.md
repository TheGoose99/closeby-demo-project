<!-- BEGIN:nextjs-agent-rules -->
# CloseBy Demo — Cabinet Psihoterapie

## Instrucțiuni pentru agent
- Când modifici un fișier, nu regenera arhiva ZIP — dai doar fișierul modificat
- Când adaugi o componentă nouă, urmezi structura existentă din folderul corespunzător
- Verifici întotdeauna cu `npx tsc --noEmit` înainte de a declara o modificare completă
- Nu instala pachete noi fără a verifica compatibilitatea cu `@calcom/embed-react` (React 18 peer dep)
- `clientConfig` vine din `@/config/client` (sync: static + env public); UI booking folosește `useMergedClientConfig()` din layout (`getMergedClientConfig()` = DB → env → static)
- Toate prețurile și textele sunt în `config/clients/[slug].ts`, nu în componente
- Split config integrări (best practice):
  - Public/business content rămâne în `config/clients/[slug].ts`
  - Credențiale shared (Resend/QStash/Redis/Supabase service role) rămân doar în env vars
  - Cal.com public values pentru booking embed (`NEXT_PUBLIC_CAL_COM_*`) se setează în env per deployment/client
  - Cal.com secrete per client (API key / webhook secret) trebuie citite din tenant DB (ex. Supabase `client_cal_secrets`) în flow multi-client
  - Migrații / SQL pentru `clients` + `client_cal_secrets`: **doar** în repo-ul `seo-data-platform` (`supabase/` acolo); `supabase db push` se rulează din acel folder, nu din acest proiect
  - Webhook Cal: tenant pentru secrete se poate deduce din `payload.organizer.username` → `clients.cal_com_username` (vezi `WEBHOOK_SKIP_CAL_USERNAME_LOOKUP`); `DEBUG_INTEGRATION_SOURCE=1` pentru log structurat
  - După ce modifici `components/providers/client-config-provider.tsx` (sau alte fișiere listate în **`seo-data-platform/scripting/website/closeby/PARITY.md`**), actualizează copia din acel folder înainte de `template:zip`
- Deploy model: un proiect Vercel per client, același repo, `CLIENT_SLUG` diferit.
- Webhooks Cal.com: `app/api/webhooks/cal/route.ts` (confirmare + reminder 24h + review request).
- Scheduling emailuri: pentru demo se folosește `setTimeout`, dar pentru producție (Vercel serverless) trebuie queue/job scheduling (ex. QStash) ca să supraviețuiască restarturilor.
- Pentru setup operațional (Cal.com/Resend/Vercel/DNS) vezi `README.md`.
- Standard local webhook testing: folosești ngrok pe port 3000 (URL public) pentru a putea primi webhooks Cal.com local. Vezi `README.md` → “Local dev (webhook public via ngrok)”.
- TDD enforcement (medium/high tasks): pentru modificări cu impact pe booking/email/webhooks/SEO/config model/critical path UI, adaugi unit tests (preferabil TDD) și nu marchezi “done” până nu trec: `npx tsc --noEmit`, `npm run lint`, și testele.
<!-- END:nextjs-agent-rules -->

## Revenue-First Operating Rules (User Mandate)

- Default to **Phase 1 (0-5 clients)** unless user explicitly switches phase.
- Always evaluate: **"Does this help generate revenue or validate quickly?"**
  - If yes: proceed fast.
  - If no: mark as **FUTURE**.
- Prioritize speed and execution over perfection.
- Keep solutions minimal: simple > scalable, manual > automated (early stage).
- Avoid early infra complexity (microservices, heavy DevOps, over-architecture).
- Prefer EU-first/GDPR-safe defaults for hosting/data when relevant.
- Optimize for psychologists as non-technical users: clarity and simplicity first.

### Response Style

- Keep responses concise.
- Default structure:
  1. Answer
  2. Brief reasoning
  3. Implementation

### Mode Contracts

- `PLAN`: no code; output goal, approach, max 7 steps, risks, decision.
- `EXECUTE`: implement directly; minimal theory.
- `REVIEW`: classify KEEP / MODIFY / DELAY with short reason.
- `DEBUG`: root cause + minimal fix.
- `JIRA`: tasks grouped by MVP / Scraping / Automation with HIGH / MEDIUM / LOW.
- `SCRAPER`: prefer Node.js scripts; include structure, extraction logic, CSV/JSON export.
