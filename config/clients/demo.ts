import type { ClientConfig } from '@/types/client-config'

export const demoConfig: ClientConfig = {
  id: 'demo_001',
  slug: 'ana-ionescu',
  name: 'Dr. Ana Ionescu',
  shortName: 'Ana Ionescu',
  credentials: 'Psihoterapeut acreditat Colegiul Psihologilor din România',
  bio: 'Sunt Ana Ionescu, psiholog clinician specialist și psihoterapeut acreditat în terapie cognitiv-comportamentală. Lucrez cu adulți care se confruntă cu anxietate, depresie, burnout, probleme relaționale sau care simt că vor mai mult de la viața lor. Cred că fiecare persoană are în ea resursele necesare pentru schimbare — rolul meu este să te ajut să le descoperi.',
  bioShort: 'Psiholog clinician specialist și psihoterapeut CBT acreditat în București, Sector 3.',
  approach: 'Terapie cognitiv-comportamentală (CBT)',
  approaches: [
    'Terapie cognitiv-comportamentală',
    'Mindfulness-Based CBT',
    'Terapie prin expunere',
    'Restructurare cognitivă',
  ],
  yearsExperience: 8,
  patientsHelped: 500,

  address: {
    street: 'Bd. Theodor Pallady, nr. 24',
    sector: 'Sector 3',
    city: 'București',
    postalCode: '032258',
    lat: 44.4135,
    lng: 26.1428,
    mapsEmbedUrl: '',
    nearbyTransport: ['Metro M2 · Anghel Saligny (5 min)', 'Tramvai 19, 27, 40', 'Autobuz 246'],
    parking: 'Parcare publică disponibilă pe Bd. Pallady, stradă secundară fără restricții',
  },

  phone: '+40722000000',
  phoneDisplay: '0722 000 000',
  email: 'contact@ana-ionescu-psiholog.ro',
  website: 'https://ana-ionescu-psiholog.ro',
  openingHours: [
    {
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
  ],
  openingHoursDisplay: 'Luni-Vineri: 09:00-18:00',

  integrations: {
    // Fallback-only defaults. Source of truth should be env/tenant data.
    calComUsername: 'demo-cal-username',
    // Canonical slugs are expected to be generated/provisioned per client.
    calComCanonicalEventSlugs: {
      initial: 'consultatie-initiala',
      session: 'sedinta-individuala',
      couple:  'terapie-cuplu',
    },
    // Optional legacy override (fallback-only).
    calComEventSlugs: {
      initial: '15min',
      session: '30min',
      couple:  '30min',
    },
    // (pre-deploy): set to the real Google Place ID for this cabinet.
    googlePlaceId: undefined,
    whatsappNumber: '40722000000',
    whatsappMessage: 'Bună ziua, doresc să fac o programare.',
    reviewLink: '',
  },

  content: {
    heroTitle: 'Regăsește-ți',
    heroTitleAccent: 'echilibrul interior',
    heroSubtitle:
      'Psihoterapie cognitiv-comportamentală pentru adulți. Un spațiu sigur unde schimbarea reală devine posibilă, pas cu pas.',
    heroCta: 'Programează gratuit',
    heroCtaSecondary: 'Află mai multe',
    heroAvailability: 'Sector 3 · București · Disponibil online',
    aboutTitle: 'Psihoterapeut cu 8 ani lângă tine',
    servicesTitle: 'Cu ce te pot ajuta',
    servicesSubtitle:
      'Fiecare proces terapeutic este adaptat nevoilor tale specifice. Prețuri transparente, fără surprize.',
    faqTitle: 'Tot ce vrei să știi',
    reviewsTitle: 'Ce spun pacienții',
  },

  services: [
    {
      id: 's0',
      title: 'Consultație inițială',
      description:
        'Prima întâlnire este gratuită. Ne cunoaștem, înțeleg situația ta și stabilim dacă și cum putem lucra împreună.',
      duration: 30,
      currency: 'RON',
      calEventSlug: 'consultatie-initiala',
      icon: '🌱',
    },
    {
      id: 's1',
      title: 'Psihoterapie individuală',
      description:
        'Anxietate, depresie, burnout, probleme de stimă de sine, dificultăți relaționale, atacuri de panică. Abordare CBT structurată.',
      duration: 50,
      price: 280,
      currency: 'RON',
      calEventSlug: 'sedinta-individuala',
      icon: '🧠',
      featured: true,
    },
    {
      id: 's2',
      title: 'Terapie de cuplu',
      description:
        'Comunicare dificilă, conflicte repetitive, distanță emoțională sau crize de cuplu. Lucrăm pentru reconectare.',
      duration: 75,
      price: 390,
      currency: 'RON',
      calEventSlug: 'terapie-cuplu',
      icon: '💑',
    },
    {
      id: 's3',
      title: 'Terapie online',
      description: 'Același cadru profesional, din confortul casei tale. Disponibil prin Zoom sau Google Meet.',
      duration: 50,
      price: 250,
      currency: 'RON',
      calEventSlug: 'sedinta-online',
      icon: '💻',
    },
    {
      id: 's4',
      title: 'Evaluare psihologică',
      description: 'Evaluare standardizată pentru adulți: anxietate, depresie, personalitate. Raport scris inclus.',
      duration: 90,
      price: 450,
      currency: 'RON',
      calEventSlug: 'evaluare-psihologica',
      icon: '📊',
    },
    {
      id: 's5',
      title: 'Pachet 8 ședințe',
      description: 'Pachet recomandat pentru un proces terapeutic structurat. Economisești 15% față de prețul per ședință.',
      duration: 50,
      price: 1900,
      currency: 'RON',
      calEventSlug: 'sedinta-individuala',
      icon: '📦',
    },
  ],

  faqs: [
    {
      question: 'Cât durează o ședință de psihoterapie?',
      answer:
        'O ședință standard durează 50 de minute. Prima ședință (consultația inițială gratuită) durează 30 de minute și ne permite să ne cunoaștem și să evaluăm dacă putem lucra împreună. Ședința de terapie de cuplu durează 75 de minute.',
    },
    {
      question: 'Cât costă o ședință de psihoterapie în Sectorul 3, București?',
      answer:
        'La cabinetul Dr. Ana Ionescu din zona Pallady, Sector 3: consultația inițială este gratuită (30 min), ședința individuală CBT costă 280 RON / 50 min, terapia de cuplu 390 RON / 75 min, iar ședința online 250 RON. Plata se face la finalul ședinței, numerar sau transfer bancar. Nu există costuri ascunse.',
    },
    {
      question: 'Este confidențial ce discutăm la psihoterapeut?',
      answer:
        'Da, absolut. Confidențialitatea este o obligație deontologică fundamentală, conform Codului Colegiului Psihologilor din România. Tot ce discutăm rămâne strict între noi, cu excepțiile legale prevăzute de lege (pericol iminent pentru propria persoană sau pentru alții). Nu partajăm informații cu terți fără consimțământul dumneavoastră explicit.',
    },
    {
      question: 'Cum se desfășoară prima ședință de terapie?',
      answer:
        'La prima întâlnire (gratuită, 30 min) ne cunoaștem și discuți despre ceea ce te-a determinat să apelezi la terapie. Nu există întrebări greșite sau teme interzise. Vei pleca cu claritate despre ce presupune procesul terapeutic, cu un plan inițial de lucru și cu răspuns la întrebarea dacă terapia cognitiv-comportamentală este potrivită pentru situația ta.',
    },
    {
      question: 'Datele mele personale sunt în siguranță când mă programez online?',
      answer:
        'Sistemul de programare online folosește Cal.com EU, cu servere localizate în Frankfurt, Germania, în conformitate cu GDPR. Nu stocăm informații clinice sau diagnostice — doar datele de contact necesare programării (nume, email, telefon). Toate datele sunt procesate de CloseBy Studio SRL și pot fi șterse la cerere.',
    },
    {
      question: 'Unde se află cabinetul în Sectorul 3? Există parcare?',
      answer:
        'Cabinetul este situat pe Bd. Theodor Pallady nr. 24, Sector 3, București — zona Pallady. Acces ușor cu metroul M2, stația Anghel Saligny (5 minute pe jos), tramvaiele 19, 27, 40 și autobuzul 246. Există parcare publică disponibilă pe Bd. Pallady și pe stradele secundare fără restricții.',
    },
    {
      question: 'De câte ședințe am nevoie? Cât durează un proces terapeutic?',
      answer:
        'Durata variază în funcție de obiective și situație. Pentru anxietate sau depresie ușor-moderată, terapia cognitiv-comportamentală (CBT) dă de obicei rezultate vizibile în 8–16 ședințe. Burnout-ul sau problemele relaționale pot necesita 3–6 luni. Discutăm și stabilim un plan realist la prima ședință. Nu există un abonament obligatoriu — poți opri oricând.',
    },
    {
      question: 'Oferiți și ședințe de psihoterapie online?',
      answer:
        'Da, oferim ședințe individuale online la 250 RON / 50 min, prin Zoom sau Google Meet. Calitatea și eficiența sunt comparabile cu ședințele față în față. Opțiunea online este ideală dacă locuiți în afara Sectorului 3 sau aveți un program dificil de deplasare. Programarea se face același sistem, cu date stocate pe servere EU.',
    },
    {
      question: 'Ce este terapia cognitiv-comportamentală (CBT) și pentru ce ajută?',
      answer:
        'Terapia cognitiv-comportamentală (CBT) este una dintre cele mai studiate forme de psihoterapie, cu eficiență dovedită pentru anxietate, atacuri de panică, depresie, fobii, TOC și burnout. Lucrează cu legătura dintre gânduri, emoții și comportamente — identifici tiparele negative și le înlocuiești cu unele mai sănătoase. Este o terapie structurată, cu obiective clare și durată definită.',
    },
    {
      question: 'Care este diferența dintre psiholog și psihoterapeut?',
      answer:
        'Psihologul are licență în psihologie și poate face evaluări, consiliere și psihoterapie (dacă are formare suplimentară). Psihoterapeutul are formare specializată în una sau mai multe metode terapeutice (CBT, psihanaliză, gestalt etc.) și este acreditat de Colegiul Psihologilor din România. Dr. Ana Ionescu este atât psiholog clinician specialist, cât și psihoterapeut acreditat CBT.',
    },
  ],

  reviews: [
    {
      id: 'r1',
      author: 'M. Popescu',
      initials: 'MP',
      rating: 5,
      text: 'Am venit cu o anxietate care mă paralizase luni de zile. După 3 luni de terapie am reușit să mă întorc la muncă și să îmi recapăt viața. Dr. Ionescu știe cum să ajungă exact la rădăcina problemei.',
      timeAgo: 'acum 2 săptămâni',
    },
    {
      id: 'r2',
      author: 'A. Ionescu',
      initials: 'AI',
      rating: 5,
      text: 'Cel mai bun psiholog pe care l-am întâlnit. Nu dă sfaturi, te ajută să găsești singur răspunsurile. Sistemul de programare online e o binecuvântare — am rezervat ședința în 2 minute.',
      timeAgo: 'acum 1 lună',
      highlight: true,
    },
    {
      id: 'r3',
      author: 'R. Dumitrescu',
      initials: 'RD',
      rating: 5,
      text: 'Cabinetul e curat, liniștit, ușor de găsit lângă metrou. Am apreciat că prețurile sunt afișate clar pe site — nu am avut surprize. Recomand cu drag.',
      timeAgo: 'acum 3 săptămâni',
    },
  ],

  theme: {
    primaryColor: '#7a9e87',
    primaryDark: '#4d7a5e',
    primaryLight: '#f0f5f2',
    primaryXLight: '#e4eee8',
    accentColor: '#c4865a',
    accentLight: '#f9f0e9',
    inkColor: '#1a2018',
    inkMid: '#3d4a3a',
    inkLight: '#6b7868',
    creamColor: '#faf8f4',
    headingFont: 'Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500',
    bodyFont: 'DM+Sans:wght@300;400;500',
  },

  seo: {
    metaTitle: 'Psihoterapeut Sector 3 București | Dr. Ana Ionescu | Cabinet CBT Pallady',
    metaDescription:
      'Cabinet de psihoterapie cognitiv-comportamentală în zona Pallady, Sector 3, București. Lângă metrou Anghel Saligny. Programări online. Ședință inițială gratuită. Acreditat Colegiul Psihologilor din România.',
    keywords: [
      // Geo-locale primare
      'psihoterapeut sector 3 bucuresti',
      'psiholog pallady bucuresti',
      'cabinet psihologie pallady sector 3',
      'psihoterapeut titan sector 3',
      'psiholog sector 3 langa metrou',
      // Geo-locale secundare — zone adiacente
      'psiholog republica bucuresti',
      'cabinet psihoterapie dristor',
      'psiholog vitan sector 3',
      'psihoterapeut anghel saligny metrou',
      'cabinet psihologie bd theodor pallady',
      // Tip serviciu + locatie
      'terapie cbt sector 3 bucuresti',
      'terapie cognitiv comportamentala sector 3',
      'sedinta psihologie sector 3 pret',
      'terapie de cuplu sector 3 bucuresti',
      'psiholog online sector 3 bucuresti',
      // Problematici frecvente
      'psiholog anxietate sector 3',
      'psiholog depresie bucuresti sector 3',
      'psiholog burnout bucuresti',
      'psihoterapeut atacuri de panica sector 3',
      // Long-tail
      'cat costa o sedinta de psihologie sector 3',
      'programare psiholog sector 3 online',
      'psihoterapeut acreditat colegiul psihologilor sector 3',
      'prima sedinta gratuita psiholog bucuresti',
    ],
  },

  images: {
    therapist: '/clients/demo/therapist.jpg',
    gallery: [
      '/clients/demo/cabinet-1.jpg',
      '/clients/demo/cabinet-2.jpg',
      '/clients/demo/cabinet-3.jpg',
    ],
  },

  gdpr: {
    privacyPolicyUrl: '/politica-confidentialitate',
    dataProcessorName: 'CloseBy Studio SRL',
    serverLocation: 'Frankfurt, Germania (EU)',
  },

  aggregateRating: {
    ratingValue: '4.9',
    reviewCount: 47,
  },
}
