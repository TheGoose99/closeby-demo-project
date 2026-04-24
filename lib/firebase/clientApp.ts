import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

function readPublicConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim()
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim()
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim()
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim()

  if (!apiKey || !authDomain || !projectId) {
    throw new Error('Missing NEXT_PUBLIC_FIREBASE_* config (apiKey/authDomain/projectId)')
  }

  return { apiKey, authDomain, projectId, appId }
}

let app: FirebaseApp | undefined
let authLanguageConfigured = false

/** Warm App Check when `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` is set (Firebase recommends early init). */
function scheduleAppCheckInit() {
  void import('@/lib/firebase/appCheckClient').then((mod) => {
    mod.getOrInitFirebaseWebAppCheck()
  })
}

export function getFirebaseWebApp(): FirebaseApp {
  if (app) return app
  if (getApps().length > 0) {
    app = getApp()
    scheduleAppCheckInit()
    return app
  }

  const cfg = readPublicConfig()
  app = initializeApp({
    apiKey: cfg.apiKey,
    authDomain: cfg.authDomain,
    projectId: cfg.projectId,
    appId: cfg.appId,
  })
  scheduleAppCheckInit()
  return app
}

export function getFirebaseWebAuth(): Auth {
  const auth = getAuth(getFirebaseWebApp())
  // Phone Auth SMS + reCAPTCHA copy follow `auth.languageCode` (see Firebase phone-auth web doc).
  if (!authLanguageConfigured) {
    auth.useDeviceLanguage()
    authLanguageConfigured = true
  }
  return auth
}
