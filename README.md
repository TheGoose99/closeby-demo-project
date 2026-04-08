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
│   ├── client.ts                 # Exportă clientConfig bazat pe CLIENT_SLUG env var
│   └── clients/
│       └── demo.ts               # Dr. Ana Ionescu — date complete
├── lib/
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

### 3. Rulează local

```bash
npm run dev
# http://localhost:3000
```

### 4. Customizează pentru un client nou

```bash
# Copiază fișierul demo și editează-l
cp config/clients/demo.ts config/clients/client-001.ts
# Editează toate câmpurile în client-001.ts
# Adaugă în config/client.ts: 'client-001': client001Config
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
5. Actualizează `calComUsername` în `config/clients/[client].ts`

## Local dev (webhook public via ngrok)

Pentru a testa webhooks Cal.com local, ai nevoie de un URL public către `localhost:3000`.

1. Rulează Next local:

```bash
npm run dev
```

2. Pornește ngrok pentru portul 3000 (îți va da un URL public de forma `https://<id>.ngrok-free.app`).
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

## Google Maps Embed

Nu necesită billing activat. Generezi URL-ul de embed din Google Maps:
1. Caută adresa pe maps.google.com
2. Share → Embed a map → copiază URL-ul din `src=""`
3. Lipești în `config/clients/[client].ts` → `address.mapsEmbedUrl`

## Adăugare client nou (checklist)

- [ ] Crezi `config/clients/[slug].ts` cu toate câmpurile completate
- [ ] Adaugi în `config/client.ts` maparea slug → config
- [ ] Creezi cont Cal.com EU cu username-ul clientului
- [ ] Configurezi event types în Cal.com
- [ ] Adaugi domeniu în Resend + DNS records
- [ ] Copiezi URL Maps embed pentru adresă
- [ ] Creezi proiect nou în Vercel cu `CLIENT_SLUG=[slug]`
- [ ] Setezi domeniu custom în Vercel
- [ ] Testezi booking end-to-end + emailuri

## Development model (template per client)

- **Per-client deploy**: un proiect Vercel per client, același repo, `CLIENT_SLUG` diferit.
- **Config-driven**: nu hardcodezi texte/prețuri în componente; totul stă în `config/clients/[slug].ts`, iar `config/client.ts` selectează config-ul la runtime.
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
