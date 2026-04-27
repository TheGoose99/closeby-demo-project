import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app'
import { Auth, getAuth } from 'firebase/auth'

type FirebasePublicConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  appId: string
}

let authPromise: Promise<Auth> | null = null

async function readFirebaseConfig(): Promise<FirebasePublicConfig> {
  const response = await fetch('/api/anti-abuse/firebase-config', { method: 'GET', cache: 'no-store' })
  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.firebaseConfig) {
    throw new Error(data?.error ?? 'Missing Firebase config from seo-data-platform')
  }
  const cfg = data.firebaseConfig as Partial<FirebasePublicConfig>
  if (!cfg.apiKey || !cfg.authDomain || !cfg.projectId || !cfg.appId) {
    throw new Error('Invalid Firebase config')
  }
  return cfg as FirebasePublicConfig
}

async function getFirebaseApp(): Promise<FirebaseApp> {
  if (getApps().length > 0) return getApp()
  const cfg = await readFirebaseConfig()

  return initializeApp({
    apiKey: cfg.apiKey,
    authDomain: cfg.authDomain,
    projectId: cfg.projectId,
    appId: cfg.appId,
  })
}

export async function getFirebaseAuth(): Promise<Auth> {
  if (authPromise) return authPromise
  authPromise = (async () => {
    const app = await getFirebaseApp()
    return getAuth(app)
  })()
  return authPromise
}
