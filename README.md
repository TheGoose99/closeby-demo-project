# CloseBy Demo — Cabinet Psihoterapie

Site Next.js 15 complet funcțional pentru cabinet de psihologie / psihoterapie din București.
Construit ca demo pentru pitchuri comerciale CloseBy Studio.

## Stack

| Layer | Tehnologie |
|-------|-----------|
| Framework | Next.js 15 (App Router, TypeScript strict) |
| Styling | Tailwind CSS cu design tokens custom |
| Booking | Cal.com EU embed (`@calcom/embed-react`) |
| Email | Resend API (confirmare, reminder 24h, review request) |
| Maps | Google Maps Embed (iframe static — gratuit, fără billing) |
| SEO | schema.org LocalBusiness + MedicalBusiness + FAQPage |
| Hosting | Vercel Pro (deploy per client din același repo) |
| Fonts | Cormorant Garamond + DM Sans (next/font, zero CLS) |

## Structură foldere

```
closeby-demo/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout: fonts, metadata, schema.org
│   ├── page.tsx                  # Home: toate secțiunile
│   ├── sitemap.ts                # Sitemap dinamic
│   ├── robots.ts                 # Robots.txt
│   └── api/
│       ├── webhooks/cal/route.ts # Cal.com → Resend email automation
│       └── contact/route.ts      # Formular contact cu rate limiting
├── components/
│   ├── ui/                       # Atomi: Button, FAQAccordion, CookieBanner
│   ├── layout/                   # Header, Footer, MobileBar
│   ├── sections/                 # Hero, About, Services, Reviews, Booking, FAQ, Location, ProofStrip
│   └── seo/                      # SchemaLocalBusiness, SchemaFAQ, SchemaBreadcrumb
├── config/
│   ├── client.ts                 # clientConfig: static + `NEXT_PUBLIC_CAL_COM_*` (sync, metadata)
│   ├── load-base-client.ts       # Selectare `CLIENT_SLUG` → `config/clients/*`
│   ├── apply-env-integrations.ts # Overlay env public pentru Cal
│   └── clients/
│       └── demo.ts               # Dr. Ana Ionescu — date complete
├── lib/
│   ├── integrations/             # getMergedClientConfig (DB→env→static), secrete Cal server-only
│   ├── utils.ts                  # cn(), formatPrice(), formatDuration(), buildCalComUrl()
│   └── services/
│       ├── resend.ts             # sendConfirmationEmail, sendReminderEmail, sendReviewRequestEmail
│       └── calcom.ts             # verifyCalWebhookSignature, parseCalWebhookPayload
└── types/
    ├── client-config.ts          # ClientConfig, Service, FAQ, Review, OpeningHours
    └── calcom.ts                 # CalWebhookPayload, CalBookingData
```

## Setup în 5 minute

### 1. Clonează și instalează

```bash
git clone <repo> closeby-demo
cd closeby-demo
# @calcom/embed-react are peer deps sensibile pe React 18
npm install --legacy-peer-deps
```

### 2. Configurează variabilele de mediu

```bash
cp .env.local.example .env.local
# Editează .env.local cu cheile tale reale
```

### 2.1 Firebase — verificare telefon (SMS OTP) înainte de Cal

Booking-ul cere un SMS OTP prin **Firebase Authentication**, apoi serverul verifică `idToken`-ul cu **Firebase Admin** și abia apoi aplică lock-ul Redis existent.

Checklist minim:

1. Firebase Console → Authentication → Sign-in method → enable **Phone**
2. Firebase Console → Project settings → Your apps → Web app → copiază valorile în `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID` (opțional dar recomandat)
3. Firebase Console → Project settings → Service accounts → **Generate new private key**
   - setează `FIREBASE_SERVICE_ACCOUNT_JSON` ca JSON pe **o singură linie** în `.env.local` (Vercel-friendly)
4. Authentication → Settings → **Authorized domains**: adaugă domeniul de producție + `localhost` pentru dev
5. Local dev notes:
   - reCAPTCHA poate fi sensibil la adblock / incognito
   - dacă `CLIENT_SLUG` este setat în env, UI trimite `clientSlug` la server; serverul refuză mismatch-ul

### 3. Rulează local

```bash
npm run dev
# http://localhost:8008
```

### 4. Customizează pentru un client nou

```bash
# Copiază fișierul demo și editează-l
cp config/clients/demo.ts config/clients/client-001.ts
# Editează toate câmpurile în client-001.ts
# Adaugă în config/load-base-client.ts: 'client-001': client001Config
```

### 5. Deploy pe Vercel

```bash
# Un proiect Vercel per client
vercel --prod
# Setezi în Vercel Dashboard: CLIENT_SLUG=client-001
```

## Cal.com Setup

1. Creează cont pe **cal.com** (instanța EU: selectezi EU la înregistrare)
2. Creează event types: `consultatie-initiala` (30 min), `sedinta-individuala` (50 min), `terapie-cuplu` (75 min)
3. Settings → Developer → Webhooks → Adaugă `https://[domeniu]/api/webhooks/cal`
4. Copiază webhook secret în `CAL_WEBHOOK_SECRET`
5. Setează în env valorile publice pentru embed:
   - `NEXT_PUBLIC_CAL_COM_USERNAME`
   - `NEXT_PUBLIC_CAL_COM_CANONICAL_EVENT_SLUGS_JSON`
   - `NEXT_PUBLIC_CAL_COM_EVENT_SLUGS_JSON` (opțional, doar fallback legacy)

## Integration source of truth

Pentru a evita leakage de secrete și a pregăti modelul multi-client:

- **`config/clients/[slug].ts`**: doar conținut public/business (texte, servicii, SEO, UI).
- **Env vars**: credențiale shared ale aplicației (`RESEND_API_KEY`, `QSTASH_TOKEN`, `KV_REST_API_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, etc.).
- **Env vars publice per client/deployment**: valori Cal.com folosite în embed (`NEXT_PUBLIC_CAL_COM_*`).
- **Tenant DB (Supabase) pentru scalare**: Cal.com per client (username/slugs + secrete) ca source-of-truth pentru onboarding multi-client.

**Precedență runtime (câmpuri Cal publice în UI):** **tenant DB** (`public.clients`) → **env** (`NEXT_PUBLIC_CAL_COM_*`) → **static** (`config/clients/[slug].ts`).  
**Precedență secrete (webhook + decline API):** **tenant DB** (`public.client_cal_secrets`) → **env** (`CAL_WEBHOOK_SECRET`, `CAL_API_KEY`).

`app/layout.tsx` folosește `getMergedClientConfig()` (server) și `ClientConfigProvider` ca booking embed-ul să primească valorile fuzionate fără a expune cheia service-role în browser.

### Backfill / cutover

1. **Migrații SQL:** rulează-le **doar** din repo-ul **`seo-data-platform`** (`supabase/migrations/`, ordine 0001→…→**0008**): `supabase db push` din acel root, `npm run db:apply-migrations -- "<postgres-uri>"` (Node + `pg`, fără `psql`; URI real din Supabase → Settings → Database, nu placeholder `YOUR_REF`), sau paste în SQL Editor — vezi `seo-data-platform/supabase/README.md` (`0006` = coloane Cal + `client_cal_secrets`, `0008` = revoke API roles pe secrete). Acest site **nu** conține migrații duplicate.
2. Populează `public.clients` (username + JSON slug-uri) pentru `client_slug`-ul potrivit.
3. Populează `public.client_cal_secrets` (legat de `clients.id`).
4. Setează `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` către **același** proiect Supabase unde ai aplicat migrațiile de mai sus.
5. Exemple SQL (operator / one-off, tot pe acel DB): `scripts/backfill-tenant-cal.sql`.

### Rotație secrete + scanning

- Rotește `CAL_*`, `RESEND_*`, `QSTASH_*`, Redis și **service role** Supabase la incident sau la churn client.
- Rulează local [Gitleaks](https://github.com/gitleaks/gitleaks) sau [TruffleHog](https://github.com/trufflesecurity/trufflehog) înainte de push dacă adaugi integrări noi; CI rulează `tsc` / lint / test (vezi `.github/workflows/ci.yml`).

### Paritate cu `seo-data-platform` (build-uri website)

Secțiunile variantă și fișierele listate în **`seo-data-platform/scripting/website/closeby/PARITY.md`** trebuie păstrate aliniate cu acest repo când modifici componente partajate (ex. `ClientConfigProvider`). După schimbări, regenerezi zip-ul template din aplicația setată în `WEBSITE_TEMPLATE_SOURCE` (vezi README-ul din `seo-data-platform/scripting/website/`).

### Producție — integrări Cal / tenant

- **`clients.cal_com_username`** trebuie să coincidă cu **`payload.organizer.username`** din webhook-ul Cal (folosit ca să alegi rândul corect din `client_cal_secrets` când ai mai mulți clienți în același proiect Supabase).
- **`WEBHOOK_SKIP_CAL_USERNAME_LOOKUP=1`** dacă vrei doar slug din env (fără mapare din payload).
- **`DEBUG_INTEGRATION_SOURCE=1`** pe scurt timp ca să vezi în logs sursa tenantului și dacă embed-ul a luat overlay din DB.
- **Encryption at rest** pentru `cal_api_key` / `cal_webhook_secret` în Postgres: nu e implementată în acest repo; la scară mare folosește criptare la nivel de aplicație sau un secret manager și documentează rotația.

### Migrații incrementale (seo-data-platform)

După prima aplicare completă, pentru fișiere noi fără a re-rula 0001–0007:

`npm run db:apply-migrations -- "--from=0008" "postgresql://…"` (vezi `seo-data-platform/supabase/README.md`).

## Local dev (webhook public via ngrok)

Pentru a testa webhooks Cal.com local, ai nevoie de un URL public către `localhost:8008`.

1. Rulează Next local:

```bash
npm run dev
```

2. Pornește ngrok pentru portul 8008 (îți va da un URL public de forma `https://<id>.ngrok-free.app`).
3. Setează în `.env.local`:
   - `NEXT_PUBLIC_SITE_URL=https://<id>.ngrok-free.app`
   - `CAL_WEBHOOK_SECRET=<secretul webhook-ului din Cal.com>` (același secret pe care îl afișează Cal.com pentru webhook)
4. În Cal.com → Settings → Developer → Webhooks, setează URL-ul webhook la:
   - `https://<id>.ngrok-free.app/api/webhooks/cal`

Notă: URL-ul ngrok se schimbă. Când se schimbă, actualizezi și `NEXT_PUBLIC_SITE_URL`, și URL-ul webhook din Cal.com.

## Resend Setup

1. Creează cont pe **resend.com**
2. Domains → Add Domain → adaugă domeniu client (ex: `ana-ionescu-psiholog.ro`)
3. Adaugă DNS records DKIM + SPF + DMARC conform instrucțiunilor Resend
4. API Keys → Create → copiază în `RESEND_API_KEY`
5. Verifică deliverability cu **mail-tester.com** (scor țintă: ≥ 9/10)

## Firebase + reCAPTCHA setup (booking anti-abuse)

Firebase keys/secrets are centralized in **seo-data-platform**.

1. Configure Firebase values in `seo-data-platform/.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `FIREBASE_SERVICE_ACCOUNT_JSON`
2. In closeby `.env.local`, set only integration bridge vars:
   - `SEO_DATA_PLATFORM_URL` (e.g. `http://localhost:3000`)
   - `INTERNAL_LOCK_API_TOKEN` (must match seo-data-platform token)
3. BookingSection still performs SMS + reCAPTCHA UX, but closeby obtains Firebase config from `/api/anti-abuse/firebase-config` (proxied to seo-data-platform).
4. Phone verification and lock-check in closeby are proxied to seo-data-platform internal endpoints (`/api/internal/firebase/verify-phone`, `/api/internal/firebase/phone-lock`).

## Google Maps Embed

Nu necesită billing activat. Generezi URL-ul de embed din Google Maps:
1. Caută adresa pe maps.google.com
2. Share → Embed a map → copiază URL-ul din `src=""`
3. Lipești în `config/clients/[client].ts` → `address.mapsEmbedUrl`

## Adăugare client nou (checklist)

- [ ] Crezi `config/clients/[slug].ts` cu toate câmpurile completate
- [ ] Adaugi în `config/load-base-client.ts` maparea slug → config
- [ ] Creezi cont Cal.com EU cu username-ul clientului
- [ ] Configurezi event types în Cal.com
- [ ] Adaugi domeniu în Resend + DNS records
- [ ] Copiezi URL Maps embed pentru adresă
- [ ] Creezi proiect nou în Vercel cu `CLIENT_SLUG=[slug]`
- [ ] (Multi-tenant) Aliniezi `SUPABASE_TENANT_CLIENT_SLUG` / rândurile Supabase cu `client_slug`
- [ ] Setezi domeniu custom în Vercel
- [ ] Testezi booking end-to-end + emailuri

## Development model (template per client)

- **Per-client deploy**: un proiect Vercel per client, același repo, `CLIENT_SLUG` diferit.
- **Config-driven**: nu hardcodezi texte/prețuri în componente; totul stă în `config/clients/[slug].ts`, iar `load-base-client.ts` + `client.ts` (env public) selectează config-ul la runtime; integrările Cal în UI folosesc `getMergedClientConfig()` când Supabase e setat.
- **Faze**:
  - **Faza 1 (0–3 clienți)**: fără DB/auth/dashboard/state global; Cal.com stochează programările.
  - **Faza 2 (scalare, fiabilitate)**: job scheduling pentru emailuri (ex. queue) în loc de `setTimeout` în webhook.

## Known constraints (important înainte de producție)

- **Serverless timers**: `setTimeout()` în `app/api/webhooks/cal/route.ts` nu e fiabil pe Vercel (funcțiile pot fi oprite/restartate). Pentru clienți reali folosești **queue/job scheduling** (ex. QStash) pentru reminder + review request.

## Testing / TDD workflow

Pentru task-uri **medium/high** sau cu impact pe business (booking/email/webhooks/SEO/config model/critical path UI), folosim **TDD**:

- Scrii/actualizezi **unit tests** înainte (sau în același PR) pentru comportamentul dorit.
- Implementarea e “Done” doar când:
  - `npx tsc --noEmit` trece
  - `npm run lint` trece
  - testele trec (unit tests)

## Performance țintă

| Metric | Țintă |
|--------|-------|
| PageSpeed Mobile | ≥ 90 |
| LCP | < 2.5s |
| CLS | 0 |
| INP | < 200ms |
| mail-tester.com | ≥ 9/10 |

## Beta build checklist (CDP-320)

Rulezi checklist-ul ăsta înainte de “final beta build” pe fiecare client.

### Build + quality gates

- [ ] `npm run build`
- [ ] `npm test`
- [ ] `npx tsc --noEmit`
- [ ] `npm run lint`

### Env sanity (Vercel + local)

- [ ] `CLIENT_SLUG` set corect
- [ ] `NEXT_PUBLIC_SITE_URL` este URL public real (domeniu sau ngrok la dev)
- [ ] `NEXT_PUBLIC_CAL_COM_USERNAME` set pentru clientul curent
- [ ] `NEXT_PUBLIC_CAL_COM_CANONICAL_EVENT_SLUGS_JSON` valid JSON cu cheile `initial/session/couple`
- [ ] `CAL_WEBHOOK_SECRET` corespunde webhook-ului din Cal.com
- [ ] `RESEND_API_KEY` set + domeniu verificat în Resend (SPF/DKIM/DMARC)
- [ ] (Prod) `QSTASH_TOKEN` + `QSTASH_FORWARD_SECRET` set pentru scheduling fiabil

### Cal.com (EU) end-to-end

- [ ] Creezi programare reală în Cal.com → confirmi că webhook-ul ajunge la `/api/webhooks/cal` (200 OK)
- [ ] Email “confirmare programare” ajunge la attendee
- [ ] (Prod cu QStash) verifici că se programează job-urile pentru reminder + review request
- [ ] Job routes (`/api/jobs/send-reminder`, `/api/jobs/send-review-request`) resping cereri fără `Authorization` când `QSTASH_FORWARD_SECRET` e set

### Resend deliverability

- [ ] `RESEND_FROM` (dacă e set) este un sender valid pentru domeniul verificat
- [ ] Test pe [mail-tester.com](https://www.mail-tester.com/) (scor țintă ≥ 9/10)

## GDPR

- Date de programare stocate pe serverele Cal.com EU (Frankfurt)
- Emailuri procesate prin Resend (servere EU disponibile)
- Nu se stochează date clinice sau diagnostice
- Cookie banner cu accept/decline
- DPA semnat cu fiecare client înainte de lansare

---

Construit cu ❤️ de **CloseBy Studio** · București 2026
