<!-- BEGIN:nextjs-agent-rules -->
# CloseBy Demo — Cabinet Psihoterapie

## Instrucțiuni pentru agent
- Când modifici un fișier, nu regenera arhiva ZIP — dai doar fișierul modificat
- Când adaugi o componentă nouă, urmezi structura existentă din folderul corespunzător
- Verifici întotdeauna cu `npx tsc --noEmit` înainte de a declara o modificare completă
- Nu instala pachete noi fără a verifica compatibilitatea cu `@calcom/embed-react` (React 18 peer dep)
- `clientConfig` vine întotdeauna din `@/config/client` — nu hardcodezi date în componente
- Toate prețurile și textele sunt în `config/clients/[slug].ts`, nu în componente
- Deploy model: un proiect Vercel per client, același repo, `CLIENT_SLUG` diferit.
- Webhooks Cal.com: `app/api/webhooks/cal/route.ts` (confirmare + reminder 24h + review request).
- Scheduling emailuri: pentru demo se folosește `setTimeout`, dar pentru producție (Vercel serverless) trebuie queue/job scheduling (ex. QStash) ca să supraviețuiască restarturilor.
- Pentru setup operațional (Cal.com/Resend/Vercel/DNS) vezi `README.md`.
- Standard local webhook testing: folosești ngrok pe port 3000 (URL public) pentru a putea primi webhooks Cal.com local. Vezi `README.md` → “Local dev (webhook public via ngrok)”.
- TDD enforcement (medium/high tasks): pentru modificări cu impact pe booking/email/webhooks/SEO/config model/critical path UI, adaugi unit tests (preferabil TDD) și nu marchezi “done” până nu trec: `npx tsc --noEmit`, `npm run lint`, și testele.
<!-- END:nextjs-agent-rules -->
